/**
 * Question-model unit tests.
 *
 * The normalizer is the single gate between untrusted input (a shared URL, a
 * stale bookmark, a hand-edited query string) and every query the app makes.
 * These tests pin its guarantees: the output is always a published combination,
 * and it never invents a value the dataset cannot answer.
 */
import assert from "node:assert/strict";
import test from "node:test";

// Node 22.13+ strips erasable TypeScript syntax natively, so the model module
// is imported directly from source — no build step, no duplicated logic.
const mod = await import("../app/lib/aser.ts");

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
  const older = normalize({ ...mod.DEFAULT_QUESTION, year: 2018, grade: 6 });
  assert.ok([3, 5, 8].includes(older.grade));
  assert.ok(skillLocked(older), "rung choice is not offered for earlier rounds");
  const now = normalize({ ...mod.DEFAULT_QUESTION, year: 2024, grade: 6 });
  assert.equal(now.grade, 6);
  assert.equal(skillLocked(now), false);
  assert.deepEqual(gradesFor(now), [1, 2, 3, 4, 5, 6, 7, 8]);
  assert.deepEqual(yearsFor({ ...now, school: "Govt" }), [2012, 2014, 2016, 2018, 2022, 2024]);
});

test("the bottom rung has no 'at least' reading", () => {
  const { normalize, phrase } = mod;
  const out = normalize({ ...mod.DEFAULT_QUESTION, level: 0, mode: "cum" });
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
