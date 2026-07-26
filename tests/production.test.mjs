import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { after, before } from "node:test";

/* ===== question-model ===== */
{
/**
 * Question-model unit tests.
 *
 * The normalizer is the single gate between untrusted input (a shared URL, a
 * stale bookmark, a hand-edited query string) and every query the app makes.
 * These tests pin its guarantees: the output is always a published combination,
 * and it never invents a value the dataset cannot answer.
 */

// Node 22.13+ strips erasable TypeScript syntax natively, so the model module
// is imported directly from source — no build step, no duplicated logic.
const mod = await import("../app/lib/aser.ts");

test("the first question defaults to the longest government-school time series", () => {
  assert.equal(mod.DEFAULT_QUESTION.school, "Govt");
  assert.deepEqual(mod.yearsFor(mod.DEFAULT_QUESTION), [2012, 2014, 2016, 2018, 2022, 2024]);
});

test("hostile input always normalizes to a published combination", () => {
  const { normalize, GRADES, SURVEY_YEARS, ROMAN } = mod;
  const hostile = [
    { year: 1999, subject: "Z", grade: 99, school: "Hogwarts", geo: "", level: 77, mode: "xx" },
    { year: NaN, subject: undefined, grade: -1, school: null, geo: undefined, level: Infinity, mode: 1 },
    { year: 2020, subject: "R", grade: 3, school: "All", geo: "ALL", level: 4, mode: "cum" },
    { year: 2021, subject: "A", grade: 0, school: "Govt", geo: "Bihar", level: 2.5, mode: "ex" },
  ];
  for (const input of hostile) {
    const out = normalize(input);
    assert.ok(SURVEY_YEARS.includes(out.year), `year ${out.year}`);
    assert.ok(["R", "A"].includes(out.subject), `subject ${out.subject}`);
    assert.ok(GRADES.includes(out.grade), `grade ${out.grade}`);
    assert.ok(ROMAN[out.grade], "grade must render as a roman numeral");
    assert.ok(["All", "Govt", "Pvt"].includes(out.school), `school ${out.school}`);
    assert.ok(Number.isInteger(out.level) && out.level >= 0 && out.level <= 4, `level ${out.level}`);
    assert.ok(["cum", "ex"].includes(out.mode), `mode ${out.mode}`);
    assert.equal(typeof out.geo, "string");
  }
});

test("phone-based rounds can never be selected", () => {
  const { normalize } = mod;
  for (const year of [2020, 2021]) {
    assert.notEqual(normalize({ ...mod.DEFAULT_QUESTION, year }).year, year);
  }
});

test("school-type questions collapse to the published grades and rung", () => {
  const { normalize, HEADLINE_LEVEL } = mod;
  const out = normalize({ ...mod.DEFAULT_QUESTION, school: "Govt", grade: 6, level: 1, mode: "ex" });
  assert.ok([3, 5, 8].includes(out.grade));
  assert.equal(out.level, HEADLINE_LEVEL[out.subject][out.grade]);
  assert.equal(out.mode, "cum", "the school-type series has no rung-by-rung detail");
});

test("earlier rounds collapse to headline grades; 2024 keeps full grade choice", () => {
  const { normalize, yearsFor, gradesFor, skillLocked } = mod;
  const older = normalize({ ...mod.DEFAULT_QUESTION, school: "All", year: 2018, grade: 6 });
  assert.ok([3, 5, 8].includes(older.grade));
  assert.ok(skillLocked(older), "rung choice is not offered for earlier rounds");
  const now = normalize({ ...mod.DEFAULT_QUESTION, school: "All", year: 2024, grade: 6 });
  assert.equal(now.grade, 6);
  assert.equal(skillLocked(now), false);
  assert.deepEqual(gradesFor(now), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(yearsFor({ ...now, school: "Govt" }), [2012, 2014, 2016, 2018, 2022, 2024]);
});

test("the bottom rung has no 'at least' reading", () => {
  const { normalize, phrase } = mod;
  const out = normalize({ ...mod.DEFAULT_QUESTION, school: "All", level: 0, mode: "cum" });
  assert.equal(out.mode, "ex");
  assert.ok(phrase(out).startsWith("cannot"), `got "${phrase(out)}"`);
});

test("normalize is idempotent — a normalized question is a fixed point", () => {
  const { normalize, GRADES, SURVEY_YEARS } = mod;
  for (const year of SURVEY_YEARS)
    for (const grade of GRADES)
      for (const school of ["All", "Govt", "Pvt"])
        for (const level of [0, 2, 4]) {
          const once = normalize({ year, subject: "R", grade, school, geo: "ALL", level, mode: "cum" });
          assert.deepEqual(normalize(once), once, `not idempotent for ${year}/${grade}/${school}/${level}`);
        }
});

test("malformed rows are rejected by the value guards", () => {
  const { validPercent, consistentUnit } = mod;
  for (const bad of [null, undefined, NaN, Infinity, -1, 101, "42", {}])
    assert.equal(validPercent(bad), false, `validPercent(${String(bad)})`);
  assert.equal(validPercent(0), true);
  assert.equal(validPercent(100), true);
  assert.equal(consistentUnit([{ unit: "percent" }, { unit: "count" }]), null,
    "mixed units must refuse to chart");
  assert.equal(consistentUnit([{ unit: "percent" }, { unit: "percent" }]), "percent");
});

}

/* ===== cut-identity ===== */
{
/**
 * Cut-identity contract.
 *
 * The crash this guards happened because a fetched row set was not
 * tied to the question that produced it: a district question rendered against
 * state rows, a lookup missed, and a non-null assertion turned that into a
 * thrown error that unmounted the app.
 *
 * `cutKey` is the fix. These tests pin the property that makes it work: any two
 * questions answered by *different* row sets must have different keys.
 */

const { cutKey, normalize, DEFAULT_QUESTION, GRADES, SURVEY_YEARS } =
  await import("../app/lib/aser.ts");

const q = (patch) => normalize({ ...DEFAULT_QUESTION, ...patch });

test("changing the geography level always changes the key", () => {
  const national = q({ geo: "ALL" });
  const state = q({ geo: "Bihar" });
  const district = q({ geo: "Aurangabad (Bihar)", parent: "Bihar" });
  assert.notEqual(cutKey(national), cutKey(district), "national vs district");
  assert.notEqual(cutKey(state), cutKey(district), "state vs district");
});

test("districts of different parents never share a key", () => {
  const bihar = q({ geo: "Aurangabad (Bihar)", parent: "Bihar" });
  const maharashtra = q({ geo: "Aurangabad (Maharashtra)", parent: "Maharashtra" });
  assert.notEqual(cutKey(bihar), cutKey(maharashtra),
    "same district name, different state — the row sets differ");
});

test("focusing a state does not change the key, because the rows do not", () => {
  // Both questions are answered by the same state ranking; only the highlight
  // differs. Re-keying here would throw away a valid result on every click.
  assert.equal(cutKey(q({ geo: "ALL" })), cutKey(q({ geo: "Bihar" })));
  assert.equal(cutKey(q({ geo: "Bihar" })), cutKey(q({ geo: "Kerala" })));
});

test("every dimension that selects different rows changes the key", () => {
  const base = q({ school: "All" });
  const variants = [
    ["year", q({ school: "All", year: 2018 })],
    ["subject", q({ school: "All", subject: "A" })],
    ["grade", q({ school: "All", grade: 5 })],
    ["school", q({ school: "Govt" })],
    ["level", q({ school: "All", level: 2 })],
    ["mode", q({ school: "All", level: 2, mode: "ex" })],
  ];
  for (const [name, variant] of variants)
    assert.notEqual(cutKey(base), cutKey(variant), `${name} must re-key`);
});

test("the key is stable and total across the whole question space", () => {
  const seen = new Set();
  for (const year of SURVEY_YEARS)
    for (const grade of GRADES)
      for (const school of ["All", "Govt", "Pvt"])
        for (const level of [0, 3, 4]) {
          const question = q({ year, grade, school, level });
          const key = cutKey(question);
          assert.equal(typeof key, "string");
          assert.ok(key.length > 0);
          // Idempotent: normalizing again must not move the key.
          assert.equal(cutKey(normalize(question)), key);
          seen.add(key);
        }
  assert.ok(seen.size > 10, "the space must produce many distinct row sets");
});

}

/* ===== analysis-honesty ===== */
{
/**
 * Analytical-honesty guards.
 *
 * These encode analytical failures that data-integrity checks alone cannot
 * catch: the app was willing to answer a question about one place with another
 * place's data, to claim a change across a gap, to cite one page for a visual
 * spanning many, and to truncate an export without saying so.
 */

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("geography is never inferred from ranking order", async () => {
  const page = await read("app/page.tsx");
  assert.doesNotMatch(page, /rows\[0\]\?\.geo\s*\?\?/,
    "a national question must not adopt the top-ranked place as its subject");
  assert.match(page, /const host = q\.geo !== "ALL" \? q\.geo : ""/,
    "host must be empty when no place is chosen");
  const cards = await read("app/components/cards.tsx");
  assert.match(cards, /if \(!host\) return/, "the ladder must refuse rather than borrow a state");
  const related = await read("app/components/related.tsx");
  assert.match(related, /Boolean\(host\)/,
    "a place-specific comparison must require an explicit place");
});

test("a card never renders a result belonging to another question", async () => {
  const page = await read("app/page.tsx");
  assert.match(page, /cut\.key === cutKey\(q\)/, "the main cut must be key-checked");
  assert.match(page, /districtCut\.key === districtKey/, "the district band must be key-checked");
  const api = await read("app/lib/api.ts");
  assert.match(api, /key: cutKey\(q\)/, "every cut must be stamped with its question identity");
});

test("no user-state lookup can throw on a missing row", async () => {
  const related = await read("app/components/related.tsx");
  assert.doesNotMatch(related, /rows\.find\([^)]*\)!\./,
    "a non-null assertion on a row lookup is what crashed the app");
  assert.match(related, /if \(items\.length < 2\) return null/,
    "an incomplete comparison must decline rather than render partial state");
});

test("a change is never claimed across a gap, and sparse series keep their own line", async () => {
  const related = await read("app/components/related.tsx");
  assert.match(related, /first and last \*published\* points/,
    "the delta must be measured between published points");
  assert.doesNotMatch(related, /st\.every\(v => v != null\)/,
    "requiring every point drops sparse states and silently substitutes India");
  assert.match(related, /gaps in its line, not zeros/,
    "a sparse series must disclose how many rounds it publishes");
});

test("a visual spanning several source pages does not cite one", async () => {
  const shared = await read("app/components/shared.tsx");
  assert.match(shared, /pages\?: number\[\]/, "SourceLine must accept every page a visual uses");
  assert.match(shared, /each row cites its own/, "a multi-page visual must say so");
  const cards = await read("app/components/cards.tsx");
  assert.match(cards, /r\.src, r\.page/, "ranking CSV must export per-row lineage");
  const related = await read("app/components/related.tsx");
  assert.match(related, /natSrc\[i\]\?\.src/, "trend CSV must export per-point lineage");
});

test("exports never silently truncate", async () => {
  const downloads = await read("app/lib/downloads.ts");
  assert.doesNotMatch(downloads, /slice\(0, 16\)/, "PNG bars must not be capped");
  assert.doesNotMatch(downloads, /Math\.min\(spec\.bars/, "PNG height must fit every row");
  assert.match(downloads, /Every row is drawn/);
});

test("comparison copy is grammatical for singular and plural subjects", async () => {
  const shared = await read("app/components/shared.tsx");
  assert.doesNotMatch(shared, /\{plural \? "lead" : "leads"\}/,
    "guessing grammatical number from a label is unreliable");
  assert.match(shared, /ahead by/,
    "use a construction that agrees with both 'Kerala' and 'Private schools'");
});

test("a contradictory shared link is repaired from the catalogue and disclosed", async () => {
  const page = await read("app/page.tsx");
  assert.match(page, /trueParent/, "parent must be resolved from the district catalogue");
  assert.match(page, /nothing was silently substituted/i);
});

test("a synchronous comparison dimension clears any prior loading state", async () => {
  const related = await read("app/components/related.tsx");
  assert.match(related, /setData\(\{\}\); setLoading\(false\); return;/,
    "moving from an async to a sync dimension must clear loading");
});

test("the district ranking is not rendered twice on a district page", async () => {
  const page = await read("app/page.tsx");
  assert.match(page, /level !== "district" && \(\s*<DistrictBand/,
    "the band must be hidden when the main ranking already lists districts");
});

}

/* ===== composition ===== */
{
/**
 * Source-composition guards.
 *
 * These are the structural promises the site makes that no runtime test can
 * catch: that the UI never ships fallback data, that every route is scoped to
 * the public surface, and that the explanatory content a reader needs in order
 * to interpret a number is actually present.
 */

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("the explorer is data-driven — no hardcoded observations anywhere in the UI", async () => {
  const files = ["app/page.tsx", "app/components/cards.tsx", "app/components/related.tsx",
    "app/components/shared.tsx", "app/lib/api.ts", "app/lib/aser.ts"];
  for (const file of files) {
    const source = await read(file);
    // A literal percentage array would mean a value was baked into the client.
    assert.doesNotMatch(source, /\[\s*\d{1,2}\.\d\s*,\s*\d{1,2}\.\d\s*,/, `${file} contains literal data`);
    assert.doesNotMatch(source, /placeholder|lorem|dummyData|sampleRows/i, `${file} contains placeholder content`);
  }
});

test("every fetch goes through the API layer, and failures are never swallowed into defaults", async () => {
  const api = await read("app/lib/api.ts");
  assert.match(api, /\/api\/metadata/);
  assert.match(api, /\/api\/explorer\?/);
  assert.match(api, /\/api\/trends\?/);
  assert.match(api, /throw new Error/, "a failed request must throw, not return an empty default");
  for (const file of ["app/components/cards.tsx", "app/components/shared.tsx"]) {
    assert.doesNotMatch(await read(file), /fetch\(/, `${file} must not fetch — cards render what they are given`);
  }
});

test("the UI states its honest-gap contract to the reader", async () => {
  const page = await read("app/page.tsx");
  const cards = await read("app/components/cards.tsx");
  assert.match(cards, /never shown as zero/i, "missing data must be explained, not implied");
  assert.match(page, /No results are shown/, "a service failure must say so");
  assert.match(page, /nothing was silently substituted/i, "URL recovery must be disclosed");
  assert.match(cards + page, /not published/i);
});

test("About explains how each learning outcome is measured, with the ASER tasks", async () => {
  const about = await read("app/about.tsx");
  for (const required of [
    /Std II story/, /Std I paragraph/, /subtraction/i, /division/i,
    /19\+? languages|languages/, /at home/i,
    /exclusive/i, /how to cite/i, /ASER Centre/,
    /2020|phone-based/, /suppress/i,
  ]) assert.match(about, required, `About is missing ${required}`);
  // The three constructs must be named so a reader cannot mix denominators.
  assert.match(about, /All-children measures/i);
  assert.match(about, /School-type series/i);
  assert.match(about, /District estimates/i);
  assert.match(about, /weighted/i);
});

test("the website and README provide the complete tutorial and verified year-wise report directory", async () => {
  const about = await read("app/about.tsx");
  const sources = await read("app/lib/site.ts");
  const readme = await read("README.md");
  for (const year of [2012, 2014, 2016, 2018, 2022, 2024]) {
    assert.match(sources, new RegExp(`year: ${year}`), `website is missing ASER ${year} report`);
    assert.match(readme, new RegExp(`ASER ${year}`), `README is missing ASER ${year} report`);
  }
  for (const content of [about + sources, readme]) {
    for (const concept of [
      /dropdown/i, /ranking/i, /headline/i, /trend/i, /comparison/i,
      /skill ladder/i, /district/i, /View as table/i, /CSV/i, /PNG/i,
    ]) assert.match(content, concept, `tutorial is missing ${concept}`);
    assert.match(content, /retrospective/i,
      "survey year must be distinguished from the report edition used for a cell");
  }
  for (const pdf of [
    "fullaser2012report.pdf",
    "fullaser2014mainreport_1.pdf",
    "aser_2016.pdf",
    "ASER-report_2018-1.pdf",
    "ASER-report_2022-1.pdf",
    "ASER_2024_Final-Report_13_2_24-1.pdf",
  ]) {
    assert.match(sources, new RegExp(pdf.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(readme, new RegExp(pdf.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});

test("every API route is scoped to the public surface", async () => {
  const routes = ["explorer", "export", "lineage", "metadata", "profile", "trends"];
  for (const name of routes) {
    const source = await read(`app/api/${name}/route.ts`);
    assert.match(source, /observations\(\)/,
      `${name} must query through the observation repository`);
    assert.doesNotMatch(source, /raw_|staging_|audit_/, `${name} must not touch private tables`);
  }
  const shared = await read("app/api/_data.ts");
  assert.match(shared, /getObservationRepository/);
  const repository = await read("db/observations.ts");
  assert.match(repository, /geography_type IN \('state','national'\)/);
  assert.match(repository, /FROM public_observations/g);
  assert.doesNotMatch(repository, /raw_|staging_|audit_/,
    "the public repository must not touch private tables");
});

test("migrations only ever create the curated public table", async () => {
  const dir = new URL("../drizzle/", import.meta.url);
  for (const file of (await readdir(dir)).filter(f => f.endsWith(".sql"))) {
    const sql = await readFile(new URL(file, dir), "utf8");
    assert.doesNotMatch(sql, /raw_|staging_|audit_|review_queue/, `${file} references a private table`);
    assert.doesNotMatch(sql, /DROP TABLE/i, `${file} drops a table`);
  }
  assert.match(await readFile(new URL("0000_public_observations.sql", dir), "utf8"),
    /CREATE TABLE IF NOT EXISTS public_observations/);
});

test("the page is responsive and defaults to the approved light palette", async () => {
  const css = await read("app/globals.css");
  assert.doesNotMatch(css, /prefers-color-scheme:\s*dark/,
    "browser or operating-system preference must not silently switch the product to dark mode");
  assert.match(css, /--paper:\s*#F7F6F2/);
  assert.match(css, /--card:\s*#FFFFFF/);
  assert.match(css, /@media \(max-width: 880px\)/);
  assert.match(css, /@media \(max-width: 480px\)/);
  assert.match(css, /\.visually-hidden/, "a screen-reader-only status region needs its utility class");
  assert.match(css, /focus-visible/, "keyboard focus must be visible");
});

test("trend values and district rank order are visible without hover", async () => {
  const related = await read("app/components/related.tsx");
  const downloads = await read("app/lib/downloads.ts");
  const css = await read("app/globals.css");
  assert.match(related, /point-value/, "each on-screen trend point needs a printed value");
  assert.match(downloads, /p\.y\.toFixed\(1\)/, "PNG trend exports need per-point values");
  assert.match(css, /\.districtgrid\s*\{\s*columns:\s*2/,
    "districts must flow top-to-bottom before continuing in the second column");
  assert.doesNotMatch(css, /\.districtgrid\s*\{[^}]*grid-template-columns/s,
    "row-major grid flow recreates the odd/even ordering defect");
});

test("a partial shared link keeps defaults instead of falling to zero values", async () => {
  // Number(null) is 0, and 0 is a valid ladder rung — so an absent parameter
  // must be detected explicitly, not coerced. This guards that reading.
  const page = await read("app/page.tsx");
  assert.match(page, /params\.get\(key\) == null \? fallback/,
    "URL restore must distinguish an absent parameter from a zero value");
  assert.doesNotMatch(page, /level: Number\(params\.get\("level"\)\)/,
    "raw Number() coercion of an absent level silently selects the bottom rung");
});

test("partial data is rendered, not discarded", async () => {
  // The regression this guards: requiring BOTH sides of a comparison threw away
  // a published value whenever ASER suppressed its partner (West Bengal 2024).
  const related = await read("app/components/related.tsx");
  assert.doesNotMatch(related, /if \(govt == null \|\| pvt == null\) return null/,
    "a comparison must not discard one published side because its partner is suppressed");
  assert.doesNotMatch(related, /if \(all == null \|\| mine == null\) return null/,
    "a construct comparison must not discard one published side");
  assert.match(related, /govt == null && pvt == null/, "only a fully empty pair may be refused");
  assert.match(related, /suppress/i, "the missing side must be named for the reader");
});

test("a dead end always offers a way forward", async () => {
  // Explaining why a chart is absent is necessary but not sufficient: the card
  // must also route the reader to the nearest cut that does have an answer.
  const related = await read("app/components/related.tsx");
  assert.match(related, /onJump/, "the trend card must be able to move the question");
  assert.match(related, /routes/, "an unavailable trend must offer alternative cuts");
  const page = await read("app/page.tsx");
  assert.match(page, /onJump=\{set\}/, "the page must wire the jump to the question setter");
});

test("the layout carries the site identity", async () => {
  const layout = await read("app/layout.tsx");
  const about = await read("app/about.tsx");
  const robots = await read("app/robots.ts");
  const sitemap = await read("app/sitemap.ts");
  const social = await read("app/opengraph-image.tsx");
  const llms = await read("public/llms.txt");
  const citation = await read("CITATION.cff");
  assert.match(layout, /ASER Data Explorer/);
  assert.match(layout, /@vercel\/analytics\/next/);
  assert.match(layout, /<Analytics/);
  assert.match(layout, /application\/ld\+json/);
  assert.match(layout, /"@type": "Dataset"/);
  assert.match(layout, /openGraph/);
  assert.match(robots, /OAI-SearchBot/);
  assert.match(robots, /sitemap\.xml/);
  assert.match(sitemap, /SITE_URL/);
  assert.match(social, /ImageResponse/);
  assert.match(llms, /Independent, unofficial/);
  assert.match(llms, /Official full reports represented/);
  assert.match(citation, /version: 1\.0\.0/);
  assert.match(citation, /original ASER report page/);
  assert.match(about, /anustup\.nayak@gmail\.com/);
  assert.match(about, /submitFeedback/);
  assert.match(about, /Vercel Web Analytics/);
});

}

/* ===== data-integrity ===== */
{
/**
 * Research-grade data-integrity suite.
 *
 * These assertions are the ones a peer reviewer would make of any number quoted
 * from this dataset: does it trace to a page, is the construct coherent, do the
 * parts sum, are gaps honest gaps, and do independently published sources agree.
 * Runs against the migration chain only — no server required.
 */

const MIGRATIONS_DIR = new URL("../drizzle/", import.meta.url);
const DB = join(tmpdir(), `aser-integrity-${process.pid}-${Date.now()}.sqlite`);

const q = sql => {
  const r = spawnSync("sqlite3", [DB, sql], { encoding: "utf8", maxBuffer: 1 << 26 });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.trim();
};
const rows = sql => (q(sql) ? q(sql).split("\n").map(l => l.split("|")) : []);
const one = sql => q(sql);

before(async () => {
  for (const f of (await readdir(MIGRATIONS_DIR)).filter(f => f.endsWith(".sql")).sort()) {
    const r = spawnSync("sqlite3", [DB], { input: await readFile(new URL(f, MIGRATIONS_DIR), "utf8"), encoding: "utf8" });
    assert.equal(r.status, 0, `${f}: ${r.stderr}`);
  }
});
after(async () => { await rm(DB, { force: true }); });

/* ── provenance ──────────────────────────────────────────────────────── */

test("every observation traces to a source document and page", () => {
  assert.equal(one(`SELECT COUNT(*) FROM public_observations
    WHERE source_url NOT LIKE 'https://asercentre.org/%' OR pdf_page_number < 1;`), "0");
});

test("each single observation resolves to exactly one document and page", () => {
  // A measure-year may legitimately draw on two reports: where the ASER 2024
  // edition suppresses an older cell that the 2018 edition published, the older
  // edition fills the gap and carries its own citation. What must never happen
  // is one geography's value for one measure-year existing twice.
  const offenders = rows(`SELECT indicator, observation_year, geography, subgroup_label
    FROM public_observations GROUP BY 1,2,3,4 HAVING COUNT(DISTINCT source_url) > 1;`);
  assert.deepEqual(offenders, [], "one cell, one citation");
});

test("cross-report overlap agrees within rounding", () => {
  // 2014/2016/2018 appear in both report editions. Where both publish a value
  // the newer edition wins; this asserts the two never disagree materially,
  // which is the check that would fail if a column had been misread.
  const spread = one(`SELECT COALESCE(MAX(ABS(a.numeric_value - b.numeric_value)), 0)
    FROM public_observations a JOIN public_observations b
      ON a.indicator=b.indicator AND a.observation_year=b.observation_year
     AND a.geography=b.geography AND a.subgroup_label=b.subgroup_label
     AND a.source_url < b.source_url;`);
  assert.ok(Number(spread) <= 1.5, `cross-report disagreement ${spread} exceeds rounding tolerance`);
});

/* ── construct integrity ─────────────────────────────────────────────── */

test("skill-ladder rungs are exclusive and sum to 100% for every grade and state", () => {
  // 'Total' rows are ASER's own check column; the five exclusive rungs must sum to it.
  for (const subject of ["reading", "arithmetic"]) {
    const bad = rows(`
      WITH parts AS (
        SELECT geography, subgroup_label, SUM(numeric_value) AS s
        FROM public_observations
        WHERE indicator LIKE '%${subject} distribution by grade' AND indicator NOT LIKE '%Total%'
        GROUP BY geography, subgroup_label)
      SELECT geography, subgroup_label, ROUND(s,1) FROM parts WHERE ABS(s - 100) > 0.5;`);
    assert.deepEqual(bad, [], `${subject} ladder rungs must sum to 100%`);
  }
});

test("published Total rows equal 100 exactly", () => {
  assert.equal(one(`SELECT COUNT(*) FROM public_observations
    WHERE indicator LIKE '%Total%distribution by grade' AND numeric_value != 100;`), "0");
});

test("cumulative ladder sums reproduce the published headline figures", () => {
  // The site computes "at least level X" by summing rungs. For the headline rung
  // that computation must reproduce ASER's own published headline number.
  const checks = [
    ["% Std III children who can read Std II level text", "Std II level text reading", "Std III"],
    ["% Std V children who can read Std II level text", "Std II level text reading", "Std V"],
    ["% Std VIII children who can read Std II level text", "Std II level text reading", "Std VIII"],
    ["% Std V children who can do division", "Divide arithmetic", "Std V"],
    ["% Std VIII children who can do division", "Divide arithmetic", "Std VIII"],
  ];
  for (const [headline, rung, grade] of checks) {
    const bad = rows(`
      SELECT h.geography, h.numeric_value, d.numeric_value FROM public_observations h
      JOIN public_observations d ON d.geography = h.geography
        AND d.indicator = '% children at ${rung} distribution by grade'
        AND d.subgroup_label = '${grade}' AND d.observation_year = 2024
      WHERE h.indicator = '${headline}' AND h.observation_year = 2024
        AND h.subgroup_label = 'All' AND h.geography_type = 'state'
        AND ABS(h.numeric_value - d.numeric_value) > 0.25;`);
    assert.deepEqual(bad, [], `${headline} must equal its top-rung distribution value`);
  }
});

test("Std III arithmetic headline equals subtraction + division rungs", () => {
  const bad = rows(`
    WITH cum AS (
      SELECT geography, SUM(numeric_value) AS s FROM public_observations
      WHERE observation_year = 2024 AND subgroup_label = 'Std III' AND geography_type = 'state'
        AND indicator IN ('% children at Subtract arithmetic distribution by grade',
                          '% children at Divide arithmetic distribution by grade')
      GROUP BY geography)
    SELECT h.geography, h.numeric_value, ROUND(cum.s,1) FROM public_observations h JOIN cum ON cum.geography = h.geography
    WHERE h.indicator = '% Std III children who can do at least subtraction'
      AND h.observation_year = 2024 AND h.subgroup_label = 'All' AND h.geography_type='state'
      AND ABS(h.numeric_value - cum.s) > 0.25;`);
  assert.deepEqual(bad, [], "at-least-subtraction must equal subtract + divide rungs");
});

test("school-type weighted average lies between its government and private values", () => {
  const bad = rows(`
    SELECT g.geography, g.indicator, g.observation_year, gv.numeric_value, pv.numeric_value, g.numeric_value
    FROM public_observations g
    JOIN public_observations gv ON gv.geography=g.geography AND gv.indicator=g.indicator
      AND gv.observation_year=g.observation_year AND gv.subgroup_label='Govt'
    JOIN public_observations pv ON pv.geography=g.geography AND pv.indicator=g.indicator
      AND pv.observation_year=g.observation_year AND pv.subgroup_label='Pvt'
    WHERE g.subgroup_label='Govt & Pvt (weighted)'
      AND (g.numeric_value < MIN(gv.numeric_value, pv.numeric_value) - 0.05
        OR g.numeric_value > MAX(gv.numeric_value, pv.numeric_value) + 0.05);`);
  assert.deepEqual(bad, [], "a weighted average cannot fall outside its components");
});

/* ── honest gaps ─────────────────────────────────────────────────────── */

test("suppressed cells are absent, never zero-filled", () => {
  // ASER does print 0.0 on ladder rungs (e.g. no Std VIII child in Mizoram is
  // below letter level) and those published zeros must survive. A synthesised
  // zero would instead show up in the school-type series, where suppression is
  // frequent — so that series must contain no zeros at all.
  assert.equal(one(`SELECT COUNT(*) FROM public_observations
    WHERE numeric_value = 0 AND indicator LIKE 'Std %:%';`), "0");
  // And every published zero must sit in a ladder that still totals 100%.
  const badLadders = rows(`
    WITH z AS (SELECT DISTINCT geography, subgroup_label,
        CASE WHEN indicator LIKE '%reading%' THEN 'reading' ELSE 'arithmetic' END AS subj
      FROM public_observations WHERE numeric_value = 0 AND indicator LIKE '%distribution by grade'),
    sums AS (SELECT o.geography, o.subgroup_label,
        CASE WHEN o.indicator LIKE '%reading%' THEN 'reading' ELSE 'arithmetic' END AS subj,
        SUM(o.numeric_value) AS s
      FROM public_observations o WHERE o.indicator LIKE '%distribution by grade'
        AND o.indicator NOT LIKE '%Total%' GROUP BY 1,2,3)
    SELECT z.geography, z.subgroup_label, z.subj FROM z JOIN sums
      ON sums.geography=z.geography AND sums.subgroup_label=z.subgroup_label AND sums.subj=z.subj
    WHERE ABS(sums.s - 100) > 0.5;`);
  assert.deepEqual(badLadders, [], "a published zero must belong to a complete ladder");
});

test("no duplicate observation for the same measure, year, geography and subgroup", () => {
  const dupes = rows(`SELECT indicator, observation_year, geography, subgroup_label, COUNT(*)
    FROM public_observations GROUP BY 1,2,3,4 HAVING COUNT(*) > 1;`);
  assert.deepEqual(dupes, [], "a single cell must appear once");
});

test("geography labels are canonical — no aliases, headers or stray whitespace", () => {
  assert.equal(one(`SELECT COUNT(*) FROM public_observations
    WHERE geography != TRIM(geography) OR geography LIKE '%&%' OR geography GLOB '* RURAL*';`), "0");
  // Telangana and Andhra Pradesh both exist as separate post-2014 boundaries.
  assert.equal(one(`SELECT COUNT(DISTINCT geography) FROM public_observations
    WHERE geography IN ('Telangana','Andhra Pradesh');`), "2");
  // District labels are state-qualified, so no district can collide with another.
  assert.equal(one(`SELECT COUNT(*) FROM public_observations
    WHERE geography_type='district' AND geography NOT GLOB '* (*)';`), "0");
  // …and no state total leaked into the district layer.
  assert.equal(one(`SELECT COUNT(*) FROM public_observations d WHERE d.geography_type='district'
    AND EXISTS (SELECT 1 FROM public_observations s WHERE s.geography_type='state'
      AND d.geography = s.geography || ' (' || s.geography || ')');`), "0");
});

/* ── partial availability ────────────────────────────────────────────── */

test("one-sided school-type splits exist and must not be discarded", () => {
  // ASER suppresses one side of the split in some states. The UI is required to
  // show the side that IS published; this test pins that such cases exist, so
  // the all-or-nothing regression cannot come back unnoticed.
  const oneSided = rows(`
    WITH g AS (SELECT geography, indicator, observation_year FROM public_observations
                WHERE subgroup_label='Govt' AND indicator LIKE 'Std %:%'),
         p AS (SELECT geography, indicator, observation_year FROM public_observations
                WHERE subgroup_label='Pvt' AND indicator LIKE 'Std %:%')
    SELECT g.geography, g.indicator, g.observation_year FROM g
    LEFT JOIN p ON p.geography=g.geography AND p.indicator=g.indicator
      AND p.observation_year=g.observation_year
    WHERE p.geography IS NULL;`);
  assert.ok(oneSided.length > 0,
    "expected at least one government-only cell — if this fails the fixture changed");
  // Every such cell is still a fully-formed, citable observation.
  for (const [geography, indicator, year] of oneSided.slice(0, 20)) {
    assert.equal(one(`SELECT COUNT(*) FROM public_observations
      WHERE geography='${geography.replaceAll("'", "''")}' AND indicator='${indicator.replaceAll("'", "''")}'
        AND observation_year=${year} AND subgroup_label='Govt'
        AND source_url != '' AND pdf_page_number > 0;`), "1",
      `${geography} ${year} must remain citable even though its partner is suppressed`);
  }
});

test("a weighted average may outlive both its components, and stays citable", () => {
  // ASER prints "Data insufficient" for Sikkim's government and private columns
  // in several rounds while still publishing the combined Govt & Pvt figure —
  // the combined sample clears the reporting threshold when neither part does.
  // Such rows are legitimate; what matters is that they remain fully citable and
  // are never presented as if a component figure were known.
  const orphans = rows(`
    SELECT w.geography, w.observation_year FROM public_observations w
    WHERE w.subgroup_label='Govt & Pvt (weighted)'
      AND NOT EXISTS (SELECT 1 FROM public_observations x WHERE x.geography=w.geography
        AND x.indicator=w.indicator AND x.observation_year=w.observation_year
        AND x.subgroup_label IN ('Govt','Pvt'));`);
  assert.equal(one(`
    SELECT COUNT(*) FROM public_observations w
    WHERE w.subgroup_label='Govt & Pvt (weighted)'
      AND (w.source_url = '' OR w.pdf_page_number < 1 OR w.numeric_value IS NULL);`), "0",
    "every weighted row must carry its own lineage");
  // And no component may be invented to fill the gap.
  for (const [geography, year] of orphans.slice(0, 12))
    assert.equal(one(`SELECT COUNT(*) FROM public_observations
      WHERE geography='${geography.replaceAll("'", "''")}' AND observation_year=${year}
        AND subgroup_label IN ('Govt','Pvt') AND indicator LIKE 'Std %:%'
        AND numeric_value = 0;`), "0", `${geography} ${year} must not have a zero-filled component`);
});

/* ── temporal coherence ──────────────────────────────────────────────── */

test("every trend series is either complete or explicitly sparse — never mixed units", () => {
  assert.equal(one(`SELECT COUNT(*) FROM (
    SELECT indicator, geography, subgroup_label FROM public_observations
    WHERE geography_type IN ('state','national')
    GROUP BY 1,2,3 HAVING COUNT(DISTINCT unit) > 1);`), "0");
});

test("school-type series are long enough to support trend claims", () => {
  // ASER suppresses small-sample cells, so a few small states legitimately carry
  // fewer rounds. The guarantee is: no state has fewer than three comparable
  // points, and the large majority span five or six.
  const counts = rows(`SELECT geography, COUNT(DISTINCT observation_year) AS n
    FROM public_observations
    WHERE indicator = 'Std III: % children reading at Std II level' AND subgroup_label = 'Govt'
      AND geography_type = 'state' GROUP BY geography ORDER BY n;`).map(([g, n]) => [g, Number(n)]);
  assert.equal(counts.length, 27, "all 27 states must have a government-school reading series");
  assert.ok(counts.every(([, n]) => n >= 3), `states below 3 rounds: ${counts.filter(([, n]) => n < 3).map(([g]) => g)}`);
  assert.ok(counts.filter(([, n]) => n >= 5).length >= 24, "at least 24 states must span 5+ rounds");
  assert.equal(one(`SELECT COUNT(DISTINCT observation_year) FROM public_observations
    WHERE geography='India (rural)' AND indicator='Std III: % children reading at Std II level' AND subgroup_label='Govt';`),
    "6", "the national series must span every published round");
});

test("year values are restricted to comparable in-person survey rounds", () => {
  const years = q("SELECT DISTINCT observation_year FROM public_observations ORDER BY 1;").split("\n").map(Number);
  assert.deepEqual(years, [2012, 2014, 2016, 2018, 2022, 2024]);
  assert.ok(!years.includes(2020) && !years.includes(2021), "phone-based rounds must not enter trends");
});

/* ── district layer ──────────────────────────────────────────────────── */

test("district estimates use grade-band constructs and never masquerade as state series", () => {
  assert.equal(one(`SELECT COUNT(*) FROM public_observations
    WHERE geography_type='district' AND (indicator LIKE 'Std III:%' OR indicator LIKE 'Std V:%'
      OR indicator LIKE 'Std VIII:%' OR indicator LIKE '%distribution by grade');`), "0");
  // Grade-band constructs exist at state level too (each district table's own
  // total row) but only for 2024, and never as a single-grade series.
  assert.equal(one(`SELECT COUNT(*) FROM public_observations
    WHERE indicator LIKE 'Std %-%:%' AND observation_year != 2024;`), "0");
  assert.equal(one(`SELECT COUNT(*) FROM public_observations
    WHERE geography_type='district' AND comparability != 'comparable_with_caveats';`), "0");
});

test("every district's parent state exists as a state geography", () => {
  assert.equal(one(`SELECT COUNT(*) FROM public_observations d
    WHERE d.geography_type='district' AND NOT EXISTS (
      SELECT 1 FROM public_observations s WHERE s.geography_type='state' AND s.geography = d.parent_geography);`), "0");
});

test("district values stay inside the plausible range of their state", () => {
  // Districts vary widely, but a district may not exceed 100 or sit below 0, and
  // the state's own value must lie within the min-max span of its districts.
  const bad = rows(`
    WITH d AS (
      SELECT parent_geography AS st, indicator, MIN(numeric_value) lo, MAX(numeric_value) hi
      FROM public_observations WHERE geography_type='district'
        AND indicator='% Children (aged 6-14) enrolled in govt schools' GROUP BY 1,2)
    SELECT d.st, s.numeric_value, d.lo, d.hi FROM d
    JOIN public_observations s ON s.geography=d.st AND s.indicator=d.indicator AND s.observation_year=2024
    WHERE s.numeric_value < d.lo - 0.5 OR s.numeric_value > d.hi + 0.5;`);
  assert.deepEqual(bad, [], "a state value must lie within its districts' range");
});

}

/* ===== migration ===== */
{

const MIGRATIONS_DIR = new URL("../drizzle/", import.meta.url);

async function applyAll(database) {
  const files = (await readdir(MIGRATIONS_DIR)).filter(f => f.endsWith(".sql")).sort();
  assert.ok(files.length >= 3, "expected the full migration chain");
  for (const file of files) {
    const sql = await readFile(new URL(file, MIGRATIONS_DIR), "utf8");
    const applied = spawnSync("sqlite3", [database], { input: sql, encoding: "utf8" });
    assert.equal(applied.status, 0, `${file}: ${applied.stderr}`);
  }
}

const q = (database, sql) => {
  const r = spawnSync("sqlite3", [database, sql], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.trim();
};

test("full migration chain applies cleanly to a blank database", async () => {
  const database = join(tmpdir(), `aser-migration-${process.pid}-${Date.now()}.sqlite`);
  try {
    await applyAll(database);
    const [count, ids, sources] = q(database,
      "SELECT COUNT(*) || '|' || COUNT(DISTINCT id) || '|' || COUNT(DISTINCT source_url) FROM public_observations;"
    ).split("|").map(Number);
    assert.equal(count, 12552);
    assert.equal(ids, count, "every observation id must be unique");
    assert.ok(sources >= 29, "27 district PDFs + two national reports");
    const byType = Object.fromEntries(q(database,
      "SELECT geography_type, COUNT(*) FROM public_observations GROUP BY geography_type;"
    ).split("\n").map(l => l.split("|")));
    assert.equal(Number(byType.state), 8901);
    assert.equal(Number(byType.national), 132);
    assert.equal(Number(byType.district), 3519);
  } finally { await rm(database, { force: true }); }
});

test("no observation is missing lineage, unit, or comparability", async () => {
  const database = join(tmpdir(), `aser-lineage-${process.pid}-${Date.now()}.sqlite`);
  try {
    await applyAll(database);
    assert.equal(q(database,
      "SELECT COUNT(*) FROM public_observations WHERE source_url IS NULL OR source_url='' OR pdf_page_number IS NULL OR pdf_page_number<1 OR unit IS NULL OR unit='' OR comparability NOT IN ('directly_comparable','comparable_with_caveats');"
    ), "0");
    assert.equal(q(database,
      "SELECT COUNT(*) FROM public_observations WHERE numeric_value IS NULL OR numeric_value<0 OR numeric_value>100;"
    ), "0");
  } finally { await rm(database, { force: true }); }
});

test("districts always carry a parent state; states and national never do", async () => {
  const database = join(tmpdir(), `aser-parent-${process.pid}-${Date.now()}.sqlite`);
  try {
    await applyAll(database);
    assert.equal(q(database,
      "SELECT COUNT(*) FROM public_observations WHERE geography_type='district' AND (parent_geography IS NULL OR parent_geography='');"
    ), "0");
    assert.equal(q(database,
      "SELECT COUNT(*) FROM public_observations WHERE geography_type!='district' AND parent_geography IS NOT NULL;"
    ), "0");
  } finally { await rm(database, { force: true }); }
});

test("school-type trend series span 2012-2024 with boundary-consistent states", async () => {
  const database = join(tmpdir(), `aser-trends-${process.pid}-${Date.now()}.sqlite`);
  try {
    await applyAll(database);
    // single-grade school-type series only — 'Std III:' etc., NOT district grade
    // bands like 'Std III-V:'
    const schoolTypeFilter = "(indicator LIKE 'Std III:%' OR indicator LIKE 'Std V:%' OR indicator LIKE 'Std VIII:%')";
    const years = q(database,
      `SELECT DISTINCT observation_year FROM public_observations WHERE ${schoolTypeFilter} ORDER BY 1;`
    ).split("\n").map(Number);
    assert.deepEqual(years, [2012, 2014, 2016, 2018, 2022, 2024]);
    // Telangana & AP publish separate boundary-adjusted 2012 values (ASER 2018, state pages)
    for (const geo of ["Telangana", "Andhra Pradesh"]) {
      assert.ok(Number(q(database,
        `SELECT COUNT(*) FROM public_observations WHERE geography='${geo}' AND observation_year=2012 AND ${schoolTypeFilter};`
      )) > 0, `${geo} must have boundary-adjusted 2012 rows`);
    }
    // The relabel: no school-type indicator row may still claim subgroup 'All'
    assert.equal(q(database,
      `SELECT COUNT(*) FROM public_observations WHERE ${schoolTypeFilter} AND subgroup_label='All';`
    ), "0");
  } finally { await rm(database, { force: true }); }
});

}

/* ===== api-contract ===== */
{
/**
 * API contract and adversarial-input suite.
 *
 * Runs against a live dev server when ASER_TEST_ORIGIN is set (default
 * http://localhost:3000); skips cleanly when no server is reachable so that
 * `npm test` stays green in CI without a database binding.
 */

const ORIGIN = process.env.ASER_TEST_ORIGIN ?? "http://localhost:3000";
let live = false;

before(async () => {
  try {
    // Free-tier production can cold-start after inactivity. The reachability
    // probe must outlive that expected delay or it silently skips the live
    // battery against a healthy deployment.
    const r = await fetch(`${ORIGIN}/api/metadata`, { signal: AbortSignal.timeout(15000) });
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

}

/* ===== district-parity ===== */
{
/**
 * District parity and scope suite.
 *
 * The gap this closes: parity was previously asserted for Explorer only, so
 * Lineage and Export could return zero rows for every district query while the
 * suite stayed green despite 216 undetected failures. Every district cut
 * is now checked across all three surfaces.
 *
 * Skips cleanly when no dev server is reachable, like the API contract suite.
 */

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
    const r = await fetch(`${ORIGIN}/api/metadata`, { signal: AbortSignal.timeout(15000) });
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

}
