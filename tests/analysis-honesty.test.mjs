/**
 * Analytical-honesty guards.
 *
 * These encode the failures the persona UAT found that no data check could
 * catch: the app was willing to answer a question about one place with another
 * place's data, to claim a change across a gap, to cite one page for a visual
 * spanning many, and to truncate an export without saying so.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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
