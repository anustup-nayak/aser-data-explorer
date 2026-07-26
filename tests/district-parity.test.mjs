/**
 * District parity and scope suite.
 *
 * The gap this closes: parity was previously asserted for Explorer only, so
 * Lineage and Export could return zero rows for every district query while the
 * suite stayed green (UAT-P0-002, 216 undetected failures). Every district cut
 * is now checked across all three surfaces.
 *
 * Skips cleanly when no dev server is reachable, like the API contract suite.
 */
import assert from "node:assert/strict";
import test, { before } from "node:test";

const ORIGIN = process.env.ASER_TEST_ORIGIN ?? "http://localhost:3000";
const DISTRICT_INDICATORS = [
  "Std III-V: % children who can read Std II level text",
  "Std III-V: % children who can do at least subtraction",
  "Std VI-VIII: % children who can read Std II level text",
  "Std VI-VIII: % children who can do division",
];

let live = false;
let parents = [];

const get = (path) => fetch(`${ORIGIN}${path}`);
const json = async (path) => {
  const r = await get(path);
  assert.equal(r.status, 200, `${path} -> ${r.status}`);
  return r.json();
};
const districtQuery = (indicator, parent) =>
  `year=2024&indicator=${encodeURIComponent(indicator)}&geographyType=district&subgroup=All&parent=${encodeURIComponent(parent)}`;

before(async () => {
  try {
    const r = await fetch(`${ORIGIN}/api/metadata`, { signal: AbortSignal.timeout(4000) });
    live = r.ok;
    if (live) {
      const meta = await r.json();
      parents = [...new Set(meta.districts.map(d => d.parentGeography))].sort();
    }
  } catch { live = false; }
  if (!live) console.log(`# no server at ${ORIGIN} — district parity tests skipped`);
});

test("every district cut agrees across Explorer, Lineage and CSV", async (t) => {
  if (!live) return t.skip();
  assert.equal(parents.length, 27, "all 27 states must publish districts");
  let cuts = 0, rows = 0;
  const mismatches = [];
  for (const parent of parents) {
    for (const indicator of DISTRICT_INDICATORS) {
      const query = districtQuery(indicator, parent);
      const [explorer, lineage, csvRes] = await Promise.all([
        json(`/api/explorer?${query}`),
        json(`/api/lineage?${query}`),
        get(`/api/export?${query}`),
      ]);
      const csvRows = (await csvRes.text()).trim().split("\n").length - 1;
      cuts++; rows += explorer.rows.length;
      if (!(explorer.rows.length === lineage.rows.length && lineage.rows.length === csvRows))
        mismatches.push(`${parent}/${indicator}: ${explorer.rows.length}/${lineage.rows.length}/${csvRows}`);
    }
  }
  assert.equal(cuts, 108, "27 parents x 4 district measures");
  assert.deepEqual(mismatches, [], "Explorer/Lineage/CSV row counts must agree");
  assert.ok(rows > 2000, `expected the full district corpus, saw ${rows} rows`);
});

test("a district query never returns another state's districts", async (t) => {
  if (!live) return t.skip();
  for (const parent of parents) {
    const d = await json(`/api/explorer?${districtQuery(DISTRICT_INDICATORS[0], parent)}`);
    assert.ok(d.rows.length > 0, `${parent} must have districts`);
    for (const row of d.rows)
      assert.ok(row.geography.endsWith(`(${parent})`), `${row.geography} leaked into ${parent}`);
  }
});

test("every district row carries its own citation on all three surfaces", async (t) => {
  if (!live) return t.skip();
  const query = districtQuery(DISTRICT_INDICATORS[0], "Bihar");
  const [explorer, lineage, csvText] = await Promise.all([
    json(`/api/explorer?${query}`),
    json(`/api/lineage?${query}`),
    get(`/api/export?${query}`).then(r => r.text()),
  ]);
  for (const row of [...explorer.rows, ...lineage.rows]) {
    assert.match(row.sourceUrl, /^https:\/\/asercentre\.org\//);
    assert.ok(Number.isInteger(row.pdfPageNumber) && row.pdfPageNumber > 0);
  }
  const header = csvText.trim().split("\n")[0].split(",");
  for (const column of ["source_url", "pdf_page_number", "geography", "numeric_value"])
    assert.ok(header.includes(column), `CSV must carry ${column}`);
});

test("unparented and cross-parent district requests are refused", async (t) => {
  if (!live) return t.skip();
  const bare = `year=2024&indicator=${encodeURIComponent(DISTRICT_INDICATORS[0])}&geographyType=district&subgroup=All`;
  for (const route of ["explorer", "lineage", "export"]) {
    const r = await get(`/api/${route}?${bare}`);
    assert.equal(r.status, 400, `${route} must reject an unparented district query`);
  }
  // A parent that is not a state yields nothing rather than falling back.
  const d = await json(`/api/explorer?${districtQuery(DISTRICT_INDICATORS[0], "Atlantis")}`);
  assert.deepEqual(d.rows, []);
});
