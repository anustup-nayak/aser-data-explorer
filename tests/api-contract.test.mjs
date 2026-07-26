/**
 * API contract and adversarial-input suite.
 *
 * Runs against a live dev server when ASER_TEST_ORIGIN is set (default
 * http://localhost:3000); skips cleanly when no server is reachable so that
 * `npm test` stays green in CI without a database binding.
 */
import assert from "node:assert/strict";
import test, { before } from "node:test";

const ORIGIN = process.env.ASER_TEST_ORIGIN ?? "http://localhost:3000";
let live = false;

before(async () => {
  try {
    const r = await fetch(`${ORIGIN}/api/metadata`, { signal: AbortSignal.timeout(4000) });
    live = r.ok;
  } catch { live = false; }
  if (!live) console.log(`# no server at ${ORIGIN} — API contract tests skipped`);
});

const get = (path) => fetch(`${ORIGIN}${path}`);
const json = async (path) => {
  const r = await get(path);
  assert.equal(r.status, 200, `${path} -> ${r.status}`);
  return r.json();
};
const READING_III = encodeURIComponent("% Std III children who can read Std II level text");
const SCHOOL_III = encodeURIComponent("Std III: % children reading at Std II level");

test("metadata exposes the catalogue and no private columns", async (t) => {
  if (!live) return t.skip();
  const m = await json("/api/metadata");
  // Coverage counts the public surface only — district rows exist in the
  // database but must not inflate what the website claims to show.
  assert.equal(m.coverage.observations, 9033);
  assert.equal(m.coverage.geographies, 28, "27 states + India (rural)");
  assert.equal(m.coverage.years, 6);
  const text = JSON.stringify(m);
  for (const forbidden of ["staging", "review_queue", "audit", "confidence", "raw_"])
    assert.ok(!text.includes(forbidden), `metadata leaked "${forbidden}"`);
});

test("metadata is a complete, self-checking data dictionary", async (t) => {
  if (!live) return t.skip();
  const m = await json("/api/metadata");
  // Self-check counters must all be zero for a publishable release.
  assert.deepEqual(m.integrity, {
    missingSourceUrl: 0, missingPage: 0, outOfRange: 0, missingUnit: 0, badComparability: 0,
  });
  // Constructs are declared explicitly so a consumer cannot mix denominators.
  assert.deepEqual(Object.keys(m.constructs).sort(), ["allChildren", "bySchoolType", "districtGradeBand"]);
  assert.equal(m.constructs.districtGradeBand.servedByThisApi, true);
  assert.deepEqual(m.surveyRounds.comparable, [2012, 2014, 2016, 2018, 2022, 2024]);
  assert.ok(m.surveyRounds.excluded["2020"], "the phone rounds must be documented as excluded");
  // Every indicator carries its coverage envelope and value range.
  for (const ind of m.indicators) {
    assert.ok(ind.observations > 0 && ind.geographies > 0, `${ind.indicator} coverage`);
    assert.ok(Array.isArray(ind.yearList) && ind.yearList.length === ind.years, `${ind.indicator} year list`);
    assert.ok(ind.subgroupList.length > 0, `${ind.indicator} subgroups`);
    assert.ok(ind.minValue >= 0 && ind.maxValue <= 100, `${ind.indicator} range`);
  }
  // Provenance manifest: every source document is an ASER report with pages.
  assert.ok(m.sources.length >= 2);
  for (const s of m.sources) {
    assert.match(s.sourceUrl, /^https:\/\/asercentre\.org\//);
    assert.ok(s.firstPage >= 1 && s.lastPage >= s.firstPage);
  }
  assert.equal(m.sources.reduce((n, s) => n + s.observations, 0), m.coverage.observations,
    "the source manifest must account for every published observation");
});

test("districts are not reachable through the public state UI surface", async (t) => {
  if (!live) return t.skip();
  const m = await json("/api/metadata");
  const types = new Set(m.geographies.map(g => g.geographyType));
  assert.deepEqual([...types].sort(), ["national", "state"],
    "the comparable-places catalogue lists states and the nation only");
  // Districts are served only through an explicitly parented query, so they can
  // never appear in a state ranking or the comparable-places catalogue.
  const unparented = await get(`/api/explorer?year=2024&indicator=${READING_III}&geographyType=district&subgroup=All`);
  assert.equal(unparented.status, 400, "an unparented district query must be rejected");
  const parented = await json(`/api/explorer?year=2024&indicator=${encodeURIComponent("Std III-V: % children who can read Std II level text")}&geographyType=district&subgroup=All&parent=Bihar`);
  assert.ok(parented.rows.length > 30, "Bihar's districts must be served when parented");
  assert.ok(parented.rows.every(r => r.geography.endsWith("(Bihar)")), "only that state's districts");
  assert.ok(m.districts.length > 500, "the district catalogue is published separately");
});

test("malformed parameters are rejected, never silently defaulted", async (t) => {
  if (!live) return t.skip();
  const cases = [
    "/api/explorer?indicator=x",                               // missing year
    "/api/explorer?year=abc&indicator=x",                      // non-numeric year
    "/api/explorer?year=1800&indicator=x",                     // implausible year
    `/api/explorer?year=2024&indicator=${READING_III}&geographyType=galaxy`,
    "/api/explorer?year=2024",                                 // missing indicator
    "/api/trends?geography=Bihar",                             // missing indicator
    "/api/trends?indicator=x",                                 // missing geography
    "/api/profile",                                            // missing geography
    "/api/export?year=2024",                                   // missing indicator
  ];
  for (const path of cases) {
    const r = await get(path);
    assert.equal(r.status, 400, `${path} should be a typed 400, got ${r.status}`);
    const body = await r.json();
    assert.ok(typeof body.error === "string" && body.error.length > 0, `${path} needs an error message`);
  }
});

test("an unpublished but well-formed combination returns empty, not a substitute", async (t) => {
  if (!live) return t.skip();
  const d = await json(`/api/explorer?year=2016&indicator=${READING_III}&geographyType=state&subgroup=All`);
  assert.deepEqual(d.rows, [], "2016 has no all-children headline series in this release");
  assert.equal(d.availability, "no_approved_data");
  assert.equal(d.context.year, 2016, "the echoed context must be the request, not a fallback");
});

test("every row served carries full lineage", async (t) => {
  if (!live) return t.skip();
  for (const path of [
    `/api/explorer?year=2024&indicator=${READING_III}&geographyType=state&subgroup=All`,
    `/api/explorer?year=2012&indicator=${SCHOOL_III}&geographyType=state&subgroup=Govt`,
  ]) {
    const d = await json(path);
    assert.ok(d.rows.length > 0, path);
    for (const row of d.rows) {
      assert.ok(row.sourceUrl?.startsWith("https://asercentre.org/"), "source URL");
      assert.ok(Number.isInteger(row.pdfPageNumber) && row.pdfPageNumber > 0, "page number");
      assert.equal(row.unit, "percent");
      assert.ok(row.numericValue >= 0 && row.numericValue <= 100, "plausible value");
    }
  }
});

test("CSV export matches the JSON rows exactly", async (t) => {
  if (!live) return t.skip();
  const query = `year=2024&indicator=${READING_III}&geographyType=state&subgroup=All`;
  const [d, csvRes] = await Promise.all([json(`/api/explorer?${query}`), get(`/api/export?${query}`)]);
  assert.equal(csvRes.headers.get("content-type"), "text/csv; charset=utf-8");
  assert.match(csvRes.headers.get("content-disposition") ?? "", /attachment; filename=/);
  const lines = (await csvRes.text()).trim().split("\n");
  assert.equal(lines.length - 1, d.rows.length, "one CSV row per JSON row");
  const cell = (line, i) => line.split('","').map(s => s.replace(/^"|"$/g, ""))[i];
  const header = lines[0].split(",");
  const geoIdx = header.indexOf("geography"), valIdx = header.indexOf("numeric_value");
  const csvByGeo = new Map(lines.slice(1).map(l => [cell(l, geoIdx), Number(cell(l, valIdx))]));
  for (const row of d.rows)
    assert.equal(csvByGeo.get(row.geography), row.numericValue, `CSV/JSON mismatch for ${row.geography}`);
});

test("trends refuse to emit a series that is not comparable", async (t) => {
  if (!live) return t.skip();
  const d = await json(`/api/trends?geography=${encodeURIComponent("India (rural)")}&indicator=${SCHOOL_III}&subgroup=Govt`);
  assert.equal(d.availability, "available");
  const years = d.rows.map(r => r.observationYear);
  assert.deepEqual(years, [...years].sort((a, b) => a - b), "series must be chronological");
  assert.deepEqual(years, [2012, 2014, 2016, 2018, 2022, 2024]);
  for (const r of d.rows)
    assert.ok(["directly_comparable", "comparable_with_caveats"].includes(r.comparability));
  const single = await json(`/api/trends?geography=Bihar&indicator=${encodeURIComponent("% children at Word reading distribution by grade")}&subgroup=${encodeURIComponent("Std III")}`);
  assert.equal(single.availability, "single_observation",
    "a one-point series must say why it is withheld, not just return nothing");
  assert.deepEqual(single.rows, []);
  const absent = await json(`/api/trends?geography=Atlantis&indicator=${SCHOOL_III}&subgroup=Govt`);
  assert.equal(absent.availability, "no_data");
});

test("every response carries baseline security headers", async (t) => {
  if (!live) return t.skip();
  for (const path of ["/", `/api/explorer?year=2024&indicator=${READING_III}&geographyType=state&subgroup=All`]) {
    const r = await get(path);
    const h = (name) => r.headers.get(name) ?? "";
    assert.equal(h("x-content-type-options"), "nosniff", `${path} nosniff`);
    assert.equal(h("x-frame-options"), "DENY", `${path} framing`);
    assert.match(h("referrer-policy"), /strict-origin/, `${path} referrer`);
    assert.match(h("permissions-policy"), /camera=\(\)/, `${path} permissions`);
    const csp = h("content-security-policy");
    assert.match(csp, /default-src 'self'/, `${path} CSP default-src`);
    assert.match(csp, /frame-ancestors 'none'/, `${path} CSP framing`);
    assert.match(csp, /object-src 'none'/, `${path} CSP objects`);
  }
});

test("responses are cacheable and free of user data", async (t) => {
  if (!live) return t.skip();
  const r = await get(`/api/explorer?year=2024&indicator=${READING_III}&geographyType=state&subgroup=All`);
  assert.match(r.headers.get("cache-control") ?? "", /max-age=\d+/);
  assert.equal(r.headers.get("set-cookie"), null, "a public data API must not set cookies");
});
