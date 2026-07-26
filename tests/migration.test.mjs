import assert from "node:assert/strict";
import { readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

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
