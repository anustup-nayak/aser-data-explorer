/**
 * Source-composition guards.
 *
 * These are the structural promises the site makes that no runtime test can
 * catch: that the UI never ships fallback data, that every route is scoped to
 * the public surface, and that the explanatory content a reader needs in order
 * to interpret a number is actually present.
 */
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

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
  assert.match(await read("app/layout.tsx"), /ASER Data Explorer/);
});
