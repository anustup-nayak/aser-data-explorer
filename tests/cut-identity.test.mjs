/**
 * Cut-identity contract.
 *
 * The crash this guards (UAT-P0-001) happened because a fetched row set was not
 * tied to the question that produced it: a district question rendered against
 * state rows, a lookup missed, and a non-null assertion turned that into a
 * thrown error that unmounted the app.
 *
 * `cutKey` is the fix. These tests pin the property that makes it work: any two
 * questions answered by *different* row sets must have different keys.
 */
import assert from "node:assert/strict";
import test from "node:test";

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
  const base = q({});
  const variants = [
    ["year", q({ school: "Govt", year: 2012 })],
    ["subject", q({ subject: "A" })],
    ["grade", q({ grade: 5 })],
    ["school", q({ school: "Govt" })],
    ["level", q({ level: 2 })],
    ["mode", q({ level: 2, mode: "ex" })],
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
