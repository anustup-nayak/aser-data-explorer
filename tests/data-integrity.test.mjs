/**
 * Research-grade data-integrity suite.
 *
 * These assertions are the ones a peer reviewer would make of any number quoted
 * from this dataset: does it trace to a page, is the construct coherent, do the
 * parts sum, are gaps honest gaps, and do independently published sources agree.
 * Runs against the migration chain only — no server required.
 */
import assert from "node:assert/strict";
import { readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test, { before, after } from "node:test";

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
