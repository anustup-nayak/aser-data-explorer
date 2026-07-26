# ASER Data Explorer — Comprehensive Persona-Led UAT Findings

**Executed:** 2026-07-26 08:14–08:33 IST  
**Report created:** 2026-07-26 08:33:33 IST  
**Release verdict:** **FAIL / BLOCKED — not ready for production**  
**Audience:** Claude coding agent and release owner  
**Scope:** application code as found, local database, migrations, public APIs, analytical behaviour, UI/UX, responsive behaviour, accessibility semantics, exports, security posture, and local performance  
**Coding-agent entry point:** Read Section 20 before converting findings into implementation work. It defines precedence, non-negotiable boundaries, the consolidated backlog, and evidence required for closure.

---

## 1. Release-candidate identity

| Item | Value |
|---|---|
| Repository HEAD | `98aa226` |
| Tested working tree | Dirty release candidate; pre-existing edits preserved |
| Modified before UAT | `app/components/cards.tsx`, `app/globals.css`, `app/lib/api.ts`, `app/page.tsx`, `tsconfig.tsbuildinfo` |
| Local URL | `http://localhost:3001/` |
| Runtime | Vinext/Vite development server with local Cloudflare D1/Miniflare |
| Browser actually exercised | Codex in-app Chromium browser |
| Viewports exercised | 1440×900, 1024×768, 768×1024, 390×844, 375×667 |
| Database | Local D1-compatible SQLite seeded by the repository migration chain |
| Browser console baseline | No warning/error on a clean default-page load |
| Application files changed by UAT | None |

### Working-tree fingerprint

| File | SHA-256 |
|---|---|
| `app/page.tsx` | `352e1083733f132a12c9224ea3a903843df5f43de109da6ffef736bc5569b895` |
| `app/components/cards.tsx` | `7313a834c99b2c6fa9aadebb194d159c99e27af6a33a86a21ceaa2028aeb64e5` |
| `app/lib/api.ts` | `5e0754804bb5376357b1950d0553dce518346a61d76107722fdac50d05914523` |
| `app/globals.css` | `57dea4c88614d40be45874d0d99c4356a574c72b746593c189612196f0bc9a6e` |

### Environment limitations

The following were **not** available and are not marked as passing:

- deployed staging and production URLs;
- real Safari, Firefox, iOS Safari, or Android Chrome runtimes;
- VoiceOver, NVDA, TalkBack, or mobile screen-reader execution;
- controlled API interception for delayed, malformed, offline, and `503` responses;
- dark-mode visual inspection;
- full generated PNG binary inspection (the in-app browser did not surface object-URL downloads to the download event);
- production CDN/cache/security-header behaviour;
- production build execution, because it would rewrite generated repository artifacts and this UAT was expressly limited to one new Markdown file.

These gaps require a post-fix release-candidate run. They do not weaken the current `FAIL` verdict because independently reproduced P0 defects already block release.

---

## 2. Executive release verdict

### Verdict

**FAIL / BLOCKED.** Four independent application P0 defect groups can crash a primary journey, misstate the geography/construct being analysed, or break the product’s core source-lineage promise. Seven application P1 groups materially harm trend interpretation, district usability, export completeness, accessibility, or security. Additional production, open-source, architecture, disclaimer, and methodology findings were added after the original execution and are counted in their own registers; they are not included in the 17-item application count below.

### Defect count

| Severity | Count | Release treatment |
|---|---:|---|
| P0 | 4 | Immediate release blockers |
| P1 | 7 | Public release blockers |
| P2 | 5 | Fix in the same hardening cycle where practical |
| P3 | 1 | Copy cleanup |
| **Total** | **17** | |

### Production blockers, in priority order

1. **UAT-P0-001:** Clicking a district from a state page can crash the entire React application.
2. **UAT-P0-002:** All district Lineage and API CSV requests return zero rows while Explorer returns real data.
3. **UAT-P0-003:** Ranking/trend/comparison sources and exports do not preserve per-value provenance; some exported source pages are demonstrably wrong.
4. **UAT-P0-004:** Related analyses silently substitute a highest-ranked state for a rural-India question and mislabel a state anchor as India on district comparisons.
5. **UAT-P1-005:** Sparse state trends silently disappear and are replaced with an India-only trend under a state-specific question.
6. **UAT-P1-006:** A forged `parent` URL parameter creates contradictory district state with no recovery warning.
7. **UAT-P1-007:** Comparison loading state is not cleared when moving from an async dimension to a synchronous dimension.
8. **UAT-P1-008:** District pages render the complete district ranking twice.
9. **UAT-P1-009:** PNG bar exports silently truncate to 16 rows, including 38-district comparisons.
10. **UAT-P1-010:** Pervasive small secondary text fails WCAG AA contrast.
11. **UAT-P1-011:** The generated hosting headers contain no baseline security headers.

### What passed

- 41 non-live automated tests passed with zero failures and zero skips.
- All 9 live API contract tests passed against `localhost:3001`.
- All 467 metadata-advertised state/national availability combinations returned non-empty Explorer results and reconciled with Lineage and API CSV row counts.
- Database row counts, uniqueness, source presence, units, ranges, comparability flags, ladder arithmetic, weighted-average bounds, geography aliases, and migration application checks passed.
- All 29 source-document URLs returned successful HTTP status.
- Default, state, historical, school-type, suppressed-cell, About, hostile-link, and trend-year guardrail journeys worked apart from defects listed below.
- No horizontal overflow or off-screen interactive element was found at the five tested viewports.
- Local warm response times were comfortably below the provisional budgets.
- SQL-like input was safely bound and did not produce database errors or disclosure.

---

## 3. Test execution summary

### Automated and database suites

| Suite | Result |
|---|---|
| Composition | 11/11 passed |
| Data integrity | 19/19 passed |
| Migration | 4/4 passed |
| Question model | 7/7 passed |
| Live API contract | 9/9 passed |
| ESLint | Passed |
| Standalone TypeScript check | Failed; see UAT-P2-015 |

### Live database facts

| Metric | Observed |
|---|---:|
| Total observations | 12,552 |
| Unique IDs | 12,552 |
| State rows | 8,901 |
| National rows | 132 |
| District rows | 3,519 |
| Source documents | 29 |
| Public metadata observations | 9,033 |
| Public metadata geographies | 28 |
| Public indicators | 43 |
| Metadata availability entries | 467 |
| District catalogue entries | 583 |
| District parents | 27 |

All five metadata integrity counters were zero:

- missing source URL: 0;
- missing page: 0;
- out-of-range value: 0;
- missing unit: 0;
- invalid comparability: 0.

The main filter index was used for state and district Explorer queries. SQLite still used a temporary B-tree for result ordering; this was not a practical local latency problem.

### Exhaustive API reconciliation

#### State and national

- Enumerated all **467** advertised availability entries.
- For each entry, requested Explorer, Lineage, and CSV.
- Verified non-empty rows, descending numeric ordering, percent unit, 0–100 values, source URL, page number, Lineage row-count parity, and CSV row-count parity.
- Result: **467/467 passed; 0 mismatches**.

#### District

- Enumerated 27 parents × 4 district indicators = **108 district queries**.
- Explorer: **108/108 non-empty**, returning 2,343 rows across the four measures.
- Lineage: **0/108 matched**; every query returned zero rows.
- CSV: **0/108 matched**; every query returned only the header.
- Result: **216 parity failures**, all explained by UAT-P0-002.

### Local latency sample

Thirty sequential warm requests per route:

| Route | p50 | p95 | Max | Errors |
|---|---:|---:|---:|---:|
| `/api/metadata` | 42.0 ms | 131.8 ms | 133.6 ms | 0 |
| state Explorer | 4.9 ms | 11.7 ms | 28.3 ms | 0 |
| Bihar district Explorer | 5.2 ms | 7.6 ms | 8.7 ms | 0 |
| `/` HTML | 14.6 ms | 38.7 ms | 66.5 ms | 0 |

These are local development measurements, not production Web Vitals.

---

## 4. Persona journey transcripts

## Persona 1 — First-time policy analyst

**Goal:** Understand latest Std III reading across rural India.

### Actions and observations

1. Opened `/` with no query parameters.
2. The sentence showed 2024, Std III, all schools, across rural India, reading, and “can read a Std II story.”
3. The state ranking showed India at 27%, 27 states, Himachal Pradesh first at 50.6%, and Telangana last at 6.2%.
4. The hero repeated India at 27%.
5. The trend showed India at 27.2% (2018), 20.5% (2022), and 27% (2024), with the phone-round and cohort caveats.
6. The school-type comparison showed Government 23.4% and Private 35.5%.
7. The skill ladder unexpectedly changed geography to **Himachal Pradesh**, although no state had been selected.
8. The ranking showed one source link, page 220. The underlying top-state row is page 124, Bihar is page 98, West Bengal is page 242, and Telangana is page 220.

### Likely user interpretation

The national ranking and trend are understandable, but the analysis rail appears to belong to the national question. A typical user can easily assume the Himachal ladder is India’s ladder, especially because the geography changed without an interaction.

### Verdict

**Fail** — UAT-P0-003 and UAT-P0-004.

---

## Persona 2 — State education officer

**Goal:** Understand Bihar’s position and trajectory.

### Actions and observations

1. Selected Bihar from Geography.
2. URL updated to `geo=Bihar&parent=`.
3. Status announced 27 states and the Bihar-specific question.
4. Bihar was highlighted at 26.1%, ranked 12 of 27.
5. The ladder correctly re-anchored to Bihar.
6. The page loaded 38 Bihar districts and a source-linked district band.
7. Trend-year controls prevented reducing the trend below two selected years.
8. Clicking “Open Aurangabad” caused the entire app to render `Cannot read properties of undefined (reading 'val')`.

### Console evidence

- duplicate React key warning for `Bihar`;
- `TypeError` from the selected-places comparison renderer;
- stack points to `app/components/related.tsx`, the `rows.find(...).val` path.

### Likely user interpretation

The state experience is strong until the most natural next action—opening a district—destroys the page.

### Verdict

**Fail / P0** — UAT-P0-001.

---

## Persona 3 — District education officer

**Goal:** Compare Aurangabad with peer Bihar districts.

### Actions and observations

1. Because click-through crashed, directly opened a valid district URL:
   `?year=2024&subject=R&grade=3&school=All&geo=Aurangabad%20(Bihar)&parent=Bihar&level=4&mode=cum`.
2. Direct loading succeeded and showed 38 Bihar districts.
3. The main ranking and the separate DistrictBand both rendered the same 38 districts: 76 district buttons and duplicate “Districts of Bihar” headings.
4. The live status said **“38 states available”**, not districts.
5. The selected-places comparison showed:
   - Aurangabad 61.7%;
   - Rohtas 54.1%;
   - a 35.7% anchor labelled **India (rural)**.
6. The 35.7% anchor is Bihar’s state value, not India’s.
7. The holding-constant line said **Std III** even though the district construct is **Std III–V**.
8. The add control said “Add a state…” even though the comparison rows are districts.
9. Explorer returned the district data, but direct Lineage and CSV APIs returned zero rows.

### Likely user interpretation

The user may quote the Bihar state anchor as India, compare a grade-band measure as if it were single-grade, and believe the duplicate rankings represent two different analyses.

### Verdict

**Fail / P0** — UAT-P0-002 and UAT-P0-004; also UAT-P1-008 and UAT-P2-012.

---

## Persona 4 — Foundational-learning programme lead

**Goal:** Locate a reading/arithmetic skill bottleneck.

### Actions and observations

1. Started from national scope.
2. Switched to Arithmetic.
3. Selected rung 3 and “exactly this level.”
4. The question correctly became “can subtract, but not divide.”
5. URL updated to `subject=A&level=3&mode=ex`.
6. Ranking returned 27 states.
7. The ladder silently anchored to **Mizoram**, the current highest state for that cut.
8. Changed comparison dimension to reading versus arithmetic.
9. The answer said “In Mizoram…” but the holding-constant line said **rural India**.

### Likely user interpretation

The UI explicitly asserts that rural India is held constant while using Mizoram values. This is an analytical scope error, not merely confusing copy.

### Verdict

**Fail / P0** — UAT-P0-004.

---

## Persona 5 — Researcher/evaluator

**Goal:** Reproduce and cite a configured result.

### Actions and observations

1. Verified default, Bihar, historical 2018, school-type 2012, and valid district URLs.
2. Reloaded configured URLs and confirmed normal control restoration.
3. Opened a hostile URL with invalid year, subject, grade, school, geography, level, and mode.
4. The app recovered to the default view, showed an explicit alert, updated the URL, and rendered no `NaN`, `undefined`, or `Infinity`.
5. Repeated with `geo=Bihar&parent=Atlantis`.
6. The app accepted the forged parent without warning, treated Bihar as a district, displayed two “Districts of Atlantis” headings, and returned an empty result.
7. Compared the default UI’s single page-220 source with per-state API lineage across 27 different pages.
8. Confirmed ranking CSV construction assigns the single cut page to every row.
9. Confirmed trend and comparison client CSVs omit source URL/page entirely.

### Likely user interpretation

Normal shared links are reproducible, but lineage in the visible ranking and exported artifacts is not reliable enough for citation.

### Verdict

**Fail / P0** — UAT-P0-003; **P1** — UAT-P1-006.

---

## Persona 6 — Journalist

**Goal:** Make a responsible statement about change over time.

### Actions and observations

1. Reviewed the default three-round India trend and its caveats.
2. Deselected 2018, leaving 2022 and 2024.
3. Attempted to deselect 2022; the control correctly refused to reduce the chart below two years.
4. Opened Sikkim, Std III reading, government schools.
5. Sikkim has a sparse but valid multi-point series.
6. The UI removed Sikkim entirely and showed only the complete India series.
7. The sentence/table caption still described the Sikkim-specific question.
8. No message explained that Sikkim had been omitted.
9. School-type trends use multiple source editions/pages, but the card exposes only the first national point’s source page.

### Likely user interpretation

The journalist can easily report India’s trend as Sikkim’s, or conclude that Sikkim has no history when published comparable points do exist.

### Verdict

**Fail** — UAT-P1-005 and UAT-P0-003.

---

## Persona 7 — Beginner, teacher, or parent

**Goal:** Understand what ASER measures.

### Actions and observations

1. Opened About the data.
2. Found clear explanations of the household survey, reading and arithmetic tasks, the three constructs, suppressions, uncertainty, excluded phone rounds, navigation, and citation.
3. Returned to Explore.
4. The configured query state was preserved.
5. The tab UI visually behaved, but the ARIA tab pattern lacks tab panels, relationships, and roving-tab behaviour.

### Likely user interpretation

The About content is useful and materially improves comprehension.

### Verdict

**Pass with accessibility issue** — UAT-P2-013.

---

## Persona 8 — Presentation/reporting user

**Goal:** Reuse a chart accurately.

### Actions and observations

1. Exercised download controls on ranking, trend, comparison, ladder, and district views.
2. The in-app browser did not expose object-URL downloads through its download event, so binary artifacts could not be opened without creating extra files.
3. Static execution-path inspection established:
   - ranking CSV assigns one page/source to every geography;
   - trend CSV has no source fields;
   - comparison CSV has no source fields;
   - comparison source is generic, without page;
   - bar PNG generation takes only `bars.slice(0, 16)`;
   - district PNG subtitles do not disclose that only 16 of up to 38 districts are retained.

### Likely user interpretation

An exported artifact appears complete and citable even when rows are omitted or provenance is absent/wrong.

### Verdict

**Fail** — UAT-P0-003 and UAT-P1-009.

---

## Persona 9 — Keyboard, screen-reader, and low-vision user

**Goal:** Complete the main journey without relying on pointer, colour, or chart vision.

### Actions and observations

1. DOM audit found one `main`, one `nav`, labelled selects, named buttons, named images, table captions, and no duplicate IDs.
2. Every chart had a table fallback in the tested normal states.
3. There was no `h1`.
4. The tablist had no `tabpanel`, `aria-controls`, or roving `tabindex`.
5. The in-app browser’s synthetic Tab command did not move focus, so manual keyboard focus order could not be certified.
6. CSS has a visible `:focus-visible` rule.
7. Contrast calculations:
   - light `--ink-3` on white: **3.10:1**;
   - light `--ink-3` on paper: **2.87:1**;
   - dark `--ink-3` on dark card: **4.16:1**;
   - accent `#C77C1A` on white: **3.32:1**.
8. These colours are used for 11–12.5 px eyebrow, subtitle, context, range, and footer text.

### Likely user interpretation

Low-vision users may not be able to read important construct, context, caveat, and source-adjacent information.

### Verdict

**Fail** — UAT-P1-010. Keyboard and real screen-reader certification remains unexecuted.

---

## Persona 10 — Impatient/adversarial user

**Goal:** Expose stale, unsafe, or contradictory states.

### Actions and observations

1. Used malformed and script-like shared-link fields; standard invalid fields recovered honestly.
2. Used forged parent state; the invalid relationship was trusted.
3. Clicked district while state cut remained mounted; stale state crashed comparison rendering.
4. Sent SQL-like geography, indicator, and subgroup strings. Parameter binding held; responses were empty rather than leaking/erroring.
5. Sent a 10,000-character indicator. The server accepted and echoed it in a 10 KB response.
6. Checked the home response and generated `_headers`; no CSP, content-type, referrer, permissions, HSTS, or opener policy was configured.

### Likely user interpretation

The data layer resists SQL injection, but relationship validation, transition safety, request bounds, and response hardening are incomplete.

### Verdict

**Fail** — UAT-P0-001, UAT-P1-006, UAT-P1-011, and UAT-P2-016.

---

## 5. Defect register for Claude

## UAT-P0-001 — District click crashes the application

**Severity:** P0  
**Personas:** State officer, district officer, mobile user  
**Business impact:** A primary advertised drill-down destroys the page and prevents district analysis.

### Reproduction

1. Open `/`.
2. Select Bihar.
3. In “Districts of Bihar,” click “Open Aurangabad.”
4. Observe the application error page: `Cannot read properties of undefined (reading 'val')`.

### Expected

The question atomically transitions to `geo=Aurangabad (Bihar)&parent=Bihar`; the district cut loads; all cards either show a district loading state or the new district result.

### Observed

`CompareCard` receives the new district question while `cut` still contains state rows. The selected-places renderer inserts the district into `chosen`, then uses a non-null assertion on a failed `rows.find`, causing the crash.

### Likely code

- `app/page.tsx:87-103` — question changes set loading but leave the previous `cut` mounted.
- `app/page.tsx:249-258` — stale cut passed to cards.
- `app/components/related.tsx:279-299` — assumes every chosen geography exists in the current rows; non-null assertion at line 291.

### Fix direction

- Tie each cut to a normalized query key, or clear/gate it synchronously when the question changes.
- Never render a comparison with a cut whose geography level/query key differs from the current question.
- Remove non-null assertions from user-state lookup paths.
- Treat missing selected rows as a loading/incompatible-context state, not a renderable result.

### Acceptance criteria

- Clicking any of 583 district entries never crashes.
- No stale state value is rendered during transition.
- URL, status, headings, ranking, hero, trend, comparison, ladder, and district band become district-consistent in one committed state.
- Clean console: no duplicate-key warning or React error.

### Regression tests

- E2E: state → every parent’s first district.
- Component: new district `q` with old state `cut`.
- Component: `pickedStates` containing geography absent from `cut.rows`.
- Rapid state/district switching under delayed Explorer responses.

---

## UAT-P0-002 — District Lineage and API CSV return empty data

**Severity:** P0  
**Personas:** District officer, researcher, API consumer  
**Business impact:** Public district values cannot be reproduced through the advertised lineage/export endpoints.

### Reproduction

For each district indicator, request:

`/api/explorer?year=2024&indicator=<district-indicator>&geographyType=district&subgroup=All&parent=Bihar`

Then request the same query from `/api/lineage` and `/api/export`.

### Observed

- Explorer returns 38 Bihar rows.
- Lineage returns `rows: []`.
- CSV returns headers and zero data rows.
- This reproduced for all 108 parent × district-indicator combinations.

### Oracle

Explorer returned 2,343 total district rows across the 108 cuts. The database contains 3,519 district observations with complete lineage.

### Likely code

- `app/api/lineage/route.ts:1,14-16`
- `app/api/export/route.ts:1,18-22`

Both combine `geography_type = 'district'` with `PUBLIC_SCOPE`, which is `state|national`, making the predicate impossible. Neither uses `scopeFor(context)`.

### Fix direction

Use the same `scopeFor(context)` contract as Explorer, including the bound `parent` filter, in Lineage and Export.

### Acceptance criteria

- All 108 district cuts have exact Explorer/Lineage/CSV row parity.
- Every district row carries its own source URL/page and canonical state-qualified geography.
- Unparented district requests remain typed `400`.
- A parent cannot retrieve another state’s districts.

### Regression tests

- Extend `api-contract.test.mjs` with all four district measures.
- Assert district Explorer ↔ Lineage ↔ CSV parity for all 27 parents.

---

## UAT-P0-003 — Per-value provenance is lost or wrong in UI and client exports

**Severity:** P0  
**Personas:** Researcher, journalist, presentation user  
**Business impact:** The product’s defining claim—every value survives peer review with exact source lineage—is false for several primary surfaces.

### Reproduction and evidence

Default state ranking:

- UI source: ASER 2024 page 220.
- Himachal Pradesh 50.6% oracle: page 124.
- Bihar 26.1% oracle: page 98.
- West Bengal 36.3% oracle: page 242.
- Telangana 6.2% oracle: page 220.
- All 27 state rows use 27 distinct pages.

School-type trend:

- National 2012 is page 58 in the 2018 report.
- National 2014–2022 is page 66; 2024 is page 25.
- Bihar 2012 is page 90 in the 2018 report.
- Bihar 2014–2024 is page 98.
- The card stores and displays only the first national point’s page/source.

Client exports:

- Ranking CSV writes `cut.src` and `cut.page` to every row.
- Trend CSV contains no source URL/page columns.
- Comparison CSV contains no source URL/page columns.
- Comparison SourceLine is generic and unlinked.

### Likely code

- `app/lib/api.ts` — `Cut` collapses row objects to `{geo,val}` plus one global page/source.
- `app/components/cards.tsx:55-70` — global page/source assigned to all ranking rows and PNG.
- `app/page.tsx:145-152` — trend keeps one anchor source/page.
- `app/components/related.tsx:151-164` — one source for a multi-edition, multi-geography trend; CSV omits lineage.
- `app/components/related.tsx:371-385` — comparison export omits lineage.

### Fix direction

- Preserve row-level lineage through `Cut`, comparison results, tables, CSV, and image metadata.
- Preserve point-level lineage for trends.
- Where a visual contains multiple documents/pages, show a source manifest or row/point-level links instead of one false page.
- Do not use a generic “ASER reports” label as a substitute for the exact source contract.

### Acceptance criteria

- Every visible/exported row and trend point maps to the same API source URL/page.
- Ranking CSV matches `/api/export` lineage for the same cut.
- Trend CSV includes per-series/per-year source URL, page, and comparability.
- Comparison CSV includes source URL/page for every value.
- No source label asserts one page for a multi-page visual.

### Regression tests

- Golden per-geography source-page reconciliation.
- Multi-edition school-type trend export.
- State + national dual-series lineage.
- CSV/PNG metadata assertions.

---

## UAT-P0-004 — Related analyses use or label the wrong geography/construct

**Severity:** P0  
**Personas:** Policy analyst, programme lead, district officer  
**Business impact:** Users can make a materially false claim about rural India or a district comparison.

### Reproduction A — national arbitrary rung

1. Open national scope.
2. Select Arithmetic, rung 3, exactly this level.
3. Select “between reading and arithmetic.”

Observed:

- comparison says “In Mizoram”;
- holding-constant line says “rural India”;
- ladder is “Mizoram”;
- no user selected Mizoram.

### Reproduction B — district comparison

Open Aurangabad (Bihar) district.

Observed:

- Bihar state anchor 35.7% is labelled “India (rural)”;
- holding-constant line says Std III instead of district band Std III–V;
- add control says “Add a state…” for district rows.

### Likely code

- `app/page.tsx:173-175` — national `host` silently falls back to the highest-ranked state.
- `app/components/related.tsx:317-348` — subject comparison queries `host`.
- `app/components/related.tsx:296-299` — any `cut.nat` is labelled India, even when it is a district parent-state anchor.
- `app/components/related.tsx:400-406` — holding-constant grade uses raw `Std ${ROMAN[q.grade]}` rather than `gradeLabel(q)`.

### Fix direction

- Do not infer a state from ranking order.
- If no national ladder distribution exists, require an explicit focus state or show an unavailable/explanatory state.
- Model the anchor label as data (`India (rural)` vs parent state), not as a fixed string.
- Use shared geography/grade helpers for all held-constant and export labels.
- Rename district selector to “Add a district.”

### Acceptance criteria

- An all-India question never runs a state computation unless the user explicitly picks that state and the screen says so.
- District anchor label equals the parent state.
- District comparisons consistently say Std III–V or Std VI–VIII.
- Holding-constant copy, source, table, CSV, and PNG agree.

### Regression tests

- Every `q.geo=ALL` comparison dimension.
- Both district grade bands and subjects.
- Parent-state anchor labels for all 27 states.

---

## UAT-P1-005 — Sparse state trends are silently replaced by India

**Severity:** P1  
**Personas:** Journalist, state officer  

### Reproduction

Open Sikkim, Std III reading, government schools.

### Observed

The state has published comparable points but not all six rounds. `hasState` requires every selected cell to be non-null. The UI therefore removes Sikkim and displays a complete India-only trend. The card/table caption still derives from the Sikkim question, and no message explains the substitution.

### Likely code

- `app/components/related.tsx:79-94`
- `app/page.tsx:141-151`

### Fix direction

Render sparse comparable state paths with gaps, or explicitly show available points in a state table. Never silently fall back to national.

### Acceptance criteria

- Published Sikkim points remain visible.
- Gaps are gaps, not zeros or dropped state series.
- Written answer cannot claim a delta across missing endpoints.
- Source lineage remains point-specific.

### Regression tests

- Sparse state with 3+ points.
- Missing first, middle, and last years.
- User-selected subset containing two valid state endpoints.

---

## UAT-P1-006 — URL parent/geography relationship is not validated

**Severity:** P1  
**Personas:** Researcher, shared-link user, adversarial user  

### Reproduction

Open:

`?year=2024&subject=R&grade=3&school=All&geo=Bihar&parent=Atlantis&level=4&mode=cum`

### Observed

- No recovery alert.
- Bihar is treated as a district because `parent` is non-empty.
- Headings say “Districts of Atlantis.”
- Geography select says Bihar.
- Result is empty.

### Likely code

- `app/page.tsx:62-78` validates `geo` membership but trusts `parent`.
- `app/lib/aser.ts` treats any non-empty parent as district mode.

### Fix direction

Validate district and parent as one relationship against metadata. A state geography must have empty parent; a district must have exactly its catalogue parent.

### Acceptance criteria

- Invalid relationships recover to a valid state/national view with explicit alert.
- Valid district links restore exactly.
- URL is rewritten to the validated state.

### Regression tests

- state + forged parent;
- district + wrong parent;
- unknown parent;
- district without parent;
- valid duplicate-name districts.

---

## UAT-P1-007 — Comparison loading can remain stuck after dimension transition

**Severity:** P1  
**Personas:** District/shared-link user  

### Evidence

A direct district link initially remained on “Loading the comparison…” after the rest of the page completed. Code inspection confirms the synchronous/no-loader branch clears data but does not clear `loading`.

### Likely code

`app/components/related.tsx:360-369`

### Fix direction

Set `loading=false` whenever the new dimension has no loader, and key async results to the current dimension/question to prevent late writes.

### Acceptance criteria

- Async → sync and sync → async dimension changes settle.
- Stale requests cannot overwrite current comparison data.

### Regression tests

- school-types → selected places during load;
- initial default restoration directly to district;
- rapid subject/geography changes.

---

## UAT-P1-008 — District ranking is duplicated

**Severity:** P1  
**Personas:** District officer, keyboard/mobile user  

### Observed

A valid Bihar district page renders 38 rows in `RankingCard` and the same 38 in `DistrictBand`, producing duplicate headings and 76 district buttons.

### Likely code

`app/page.tsx:247-252` always renders both components; `DistrictBand` is not suppressed when `geoLevel(q) === 'district'`.

### Fix direction

Render DistrictBand only for a state focus. On a district page, the primary RankingCard already owns sibling comparison.

### Acceptance criteria

- One district ranking per page.
- One source/table/export set per ranking.
- Focus order and mobile scroll length are not duplicated.

---

## UAT-P1-009 — PNG bar exports silently truncate to 16 rows

**Severity:** P1  
**Personas:** Presentation user, district officer  

### Observed

`downloadImageCard` uses `spec.bars.slice(0, 16)`. A Bihar district view contains 38 rows. District export copy does not say it is a top-16 extract.

### Likely code

`app/lib/downloads.ts:60-62`

### Fix direction

Choose one explicit policy:

- paginate/make a taller image with every row; or
- label the image “Top 16 of 38” and preserve the selected district/anchor even if outside the top 16.

### Acceptance criteria

- No silent row loss.
- Selected geography and anchor are always present.
- Subtitle and filename describe subset and total.

---

## UAT-P1-010 — Secondary text contrast fails WCAG AA

**Severity:** P1  
**Personas:** Low-vision user  

### Evidence

Small `--ink-3` text is 2.87–3.10:1 in light mode and 4.16:1 on dark cards. Accent text is 3.32:1 on white. Normal text requires 4.5:1.

Affected examples:

- eyebrows;
- card subtitles;
- hero context and range labels;
- holding-constant text;
- source-adjacent copy;
- footer;
- highlighted hint headings.

### Likely code

`app/globals.css:6-21,43,54,69,84,94-99`

### Fix direction

Darken/lighten semantic text tokens to at least 4.5:1 against every actual background. Do not rely on size because these styles are 11–13 px.

### Acceptance criteria

- Automated contrast audit passes light/dark mode.
- Manual high-contrast and 200%/400% zoom checks pass.

---

## UAT-P1-011 — Baseline production security headers are absent

**Severity:** P1  
**Personas:** All public users  

### Observed

Local home response had no CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS, or COOP. Generated `dist/client/_headers` contained only immutable asset caching.

### Fix direction

Add an explicit hosting header policy appropriate to a public read-only app. Validate external PDF links and required framework assets before enforcing CSP.

### Acceptance criteria

- Production response includes reviewed CSP, nosniff, referrer, and permissions policies.
- HSTS is enabled on production HTTPS.
- No framework/API/download functionality breaks.

---

## UAT-P2-012 — District announcements and controls use state terminology

**Severity:** P2  

Observed:

- live status: “38 states available”;
- comparison selector: “Add a state…”;
- district parent anchor can be labelled India.

The anchor mislabelling portion is covered by P0-004. Fix all user-facing noun selection through geography-level helpers.

---

## UAT-P2-013 — Page heading and tab semantics are incomplete

**Severity:** P2  

Observed:

- no `h1`;
- `role=tablist` and `role=tab` are used without `tabpanel`, `aria-controls`, or roving tab index/arrow navigation.

Either implement the full tabs pattern or use ordinary navigation buttons without tab roles.

---

## UAT-P2-014 — Mobile touch targets are smaller than the preferred 44 px

**Severity:** P2  

At 375×667:

- primary selects were 29 px high;
- segmented buttons were 32 px high;
- ranking rows were 24 px high;
- header tabs were 42 px high.

No horizontal overflow occurred. Most controls meet the WCAG 2.2 AA 24 px minimum, but the dense 24 px ranking rows are error-prone for touch. Increase target height/spacing without losing information density.

---

## UAT-P2-015 — Standalone TypeScript validation fails

**Severity:** P2  

Command:

`./node_modules/.bin/tsc --noEmit --incremental false`

Errors:

- missing module declarations for `cloudflare:workers`;
- missing `Fetcher`;
- missing `D1Database`.

Lint passes and the dev app runs. Add the correct Cloudflare worker types/config so strict type checking is a reliable release gate.

---

## UAT-P2-016 — API membership/length validation is incomplete

**Severity:** P2  

Unknown indicators/subgroups return 200 empty rather than typed validation errors. A 10,000-character indicator is accepted and echoed in a roughly 10 KB response.

Add bounded parameter lengths and, where the API contract requires it, validate membership against public dimensions. Preserve the honest distinction between malformed, valid-but-unpublished, and temporarily unavailable.

---

## UAT-P3-017 — Comparison grammar error

**Severity:** P3  

Default copy says “Private schools leads by 12.1 points.” Use singular/plural-safe comparison copy, e.g. “Private schools lead…” or “The private-school value leads…”.

---

## 6. Cross-surface reconciliation

| Surface | State/national | District | Finding |
|---|---|---|---|
| Question ↔ URL controls | Pass for valid normal links | Valid direct link restores | Invalid parent relationship fails validation |
| Ranking values ↔ API | Values pass | Values pass | District click transition crashes |
| Ranking table ↔ visual | Pass in inspected states | Pass where page loads | Duplicate ranking on district page |
| Explorer ↔ Lineage | 467/467 pass | 0/108 pass | District Lineage empty |
| Explorer ↔ API CSV | 467/467 pass | 0/108 pass | District API CSV empty |
| UI ranking ↔ per-row lineage | Fail | Single-state PDF usually common | State UI collapses 27 pages into one |
| Trend values ↔ API | Complete series pass | Trend intentionally unavailable | Sparse state silently replaced |
| Trend source ↔ points | Fail for multi-edition/state series | N/A | One page cannot represent all points |
| Comparison scope ↔ holding-constant | Fail at national arbitrary rungs | Fail | State substituted; grade band/anchor mislabelled |
| Client CSV lineage | Fail for ranking/trend/comparison | DistrictBand includes one PDF/page | Systemic export contract gap |
| PNG completeness | Top subset implied for state ranking | Fail | District silently cut to 16 |
| Source URL reachability | 29/29 pass | Included | PDF page content not manually re-audited |

---

## 7. Responsive, browser, and mobile coverage

### Executed layout matrix

| Viewport | Grid | Horizontal overflow | Off-screen interactive elements |
|---|---|---:|---:|
| 1440×900 | Two columns | None | 0 |
| 1024×768 | Two columns | None | 0 |
| 768×1024 | One column | None | 0 |
| 390×844 | One column | None | 0 |
| 375×667 | One column | None | 0 |

The district page also had no horizontal overflow at mobile width, but duplication produced 76 district buttons and excessive vertical interaction cost.

### Required post-fix browser matrix

Because only Chromium was callable here, Claude/release QA must not interpret this report as cross-browser certification. After fixes, run:

- latest Chrome on Windows/macOS;
- latest Safari on macOS;
- latest Firefox on Windows/macOS;
- iOS Safari on a current iPhone plus one older supported device;
- Android Chrome on a current Pixel-class device plus one narrower device;
- light and dark mode;
- 200% and 400% zoom;
- reduced motion;
- VoiceOver/Safari, NVDA/Chrome, and TalkBack/Chrome.

Critical flows on every target:

1. default national analysis;
2. state selection;
3. district click-through;
4. exact/cumulative rung;
5. school-type and sparse trend;
6. table disclosure;
7. source opening;
8. CSV and PNG export;
9. shared-link reload;
10. About and return.

---

## 8. Security, reliability, and failure-state coverage

### Passed

- SQL-like values remained parameterized and returned empty data.
- No cookies were set by public APIs.
- public responses were cacheable.
- standard malformed required parameters returned typed `400`.
- standard hostile URL fields normalized with an explicit warning.
- 29/29 source URLs were reachable.

### Failed

- invalid district parent relationship accepted;
- oversized parameter accepted and echoed;
- baseline response security headers absent;
- district transition can crash due stale state.

### Not executed

- controlled D1 outage after metadata load;
- delayed/raced individual API calls through interception;
- malformed JSON payload injection;
- CDN stale-release mixing;
- production cache-key and compression tests;
- sustained concurrent load;
- offline/mobile-network recovery.

These remain mandatory after the P0/P1 fixes.

---

## 9. Claude implementation order

### Group 1 — Make question/cut transitions safe

Fix together:

- UAT-P0-001;
- UAT-P1-007;
- stale-cut and stale-comparison result protection.

Retest:

- delayed state → district transitions;
- all 27 parents;
- rapid subject/grade/school/geography changes;
- clean console.

### Group 2 — Restore geography and construct truth

Fix together:

- UAT-P0-004;
- UAT-P1-005;
- UAT-P1-006;
- UAT-P2-012.

Create one authoritative derived context for:

- geography level;
- focus geography;
- anchor geography/label;
- grade or grade band;
- population;
- available comparison dimensions.

Retest every context across question, answerline, holding-constant, table, source, URL, CSV, and PNG.

### Group 3 — Preserve lineage as first-class row/point data

Fix together:

- UAT-P0-002;
- UAT-P0-003;
- UAT-P1-009.

Do not keep `Cut` as values plus a single global source. Carry full observation lineage through every transformation and export.

Retest:

- all 467 state/national cuts;
- all 108 district cuts;
- multi-edition trend;
- derived ladder sums;
- every client download type.

### Group 4 — Simplify district rendering

Fix:

- UAT-P1-008;
- district-specific comparison labels and controls.

Retest desktop and mobile district journeys, including keyboard focus length.

### Group 5 — Accessibility and platform hardening

Fix:

- UAT-P1-010;
- UAT-P1-011;
- UAT-P2-013;
- UAT-P2-014;
- UAT-P2-015;
- UAT-P2-016;
- UAT-P3-017.

Then run the real browser/screen-reader matrix and production-header verification.

---

## 10. Required release re-test

The next release candidate is acceptable only when:

1. all P0 defects are closed and independently reproduced as fixed;
2. all P1 defects are closed; no P1 waiver is permitted for the first public production launch;
3. 41 non-live tests, 9 live contract tests, exhaustive 467 state/national checks, and exhaustive 108 district checks pass;
4. every visible/exported value retains exact source URL/page;
5. all persona journeys pass without misleading scope or stale results;
6. Safari, Firefox, iOS Safari, Android Chrome, and Chromium critical paths pass;
7. VoiceOver, NVDA, and TalkBack primary journeys pass;
8. light/dark contrast meets WCAG 2.2 AA;
9. production security headers and CDN behaviour are verified;
10. production smoke reconciles one national, state, district, sparse trend, suppressed cell, hostile URL, CSV, PNG, and source-link case.

**Current release decision: BLOCK.**

---

## 11. GitHub, Vercel, data, and production-readiness audit

**Audit date:** 2026-07-26 IST  
**Method:** Read-only repository, dependency, database, documentation, and hosting-architecture review. No application or configuration files were changed.  
**Production target supplied by owner:** Public GitHub repository deployed on Vercel, with production-grade code, source documentation, database, browser/mobile support, security, CI/CD, observability, and operating procedures.

### 11.1 Overall production-readiness verdict

**FAIL / BLOCKED.** The P0/P1 product defects in this report remain the first release gate. In addition, the current runtime is Cloudflare-specific rather than Vercel-native, the production dependency graph contains high-severity vulnerabilities, GitHub release controls are absent, and the published dataset cannot be independently regenerated from repository contents.

| Area | Status | Evidence and release implication |
|---|---|---|
| Application behaviour | **Blocked** | Four P0 and seven P1 defect groups remain open in this report. |
| Vercel compatibility | **Blocked** | Build/runtime use Vinext, Vite, Wrangler, Cloudflare Workers, and direct D1 bindings. |
| Production dependencies | **Blocked** | `npm audit --omit=dev` reported three high-severity production vulnerability groups. |
| Database integrity | Good foundation | 12,552 unique rows; SQLite integrity check passed; existing invariants are valuable. |
| Database production design | Incomplete | No Vercel-compatible provider, release snapshot identity, database-enforced domain constraints, backup/restore proof, or production migration procedure. |
| Source lineage | Partially strong | Every stored row has URL/page data, but P0 defects lose or misapply lineage in UI and exports. |
| Source documents | Incomplete | Reports are externally linked; no source manifest, checksums, retrieval dates, rights record, or reproducible extraction pipeline is present. |
| Documentation | **Contradictory** | README and old UAT say live/releasable; this evidence-backed release candidate is blocked. |
| Automated tests | Useful but insufficient | Strong Node/database invariants, but no mandatory GitHub CI or real multi-browser E2E gate. |
| GitHub public-repo readiness | **Blocked** | No GitHub `origin`, licence, security policy, community files, CI workflows, protected-branch evidence, tags, or releases. |
| Security and operations | **Blocked** | Baseline headers, API rate limiting, persistent monitoring, alerts, incident plan, and rollback runbook are absent. |
| Browser/mobile accessibility | Unverified | Chromium viewport checks passed, but real Safari, Firefox, iOS, Android, VoiceOver, NVDA, and TalkBack remain unexecuted. |

### 11.2 Vercel architecture gap

The application is not currently a native Vercel Next.js deployment:

- `package.json` runs `vinext dev`, `vinext build`, and `vinext start`;
- production database code imports `cloudflare:workers` and `drizzle-orm/d1`;
- the worker expects Cloudflare `ASSETS`, `DB`, and `IMAGES` bindings;
- Vite configuration loads `@cloudflare/vite-plugin` and packages Sites metadata;
- `.openai/hosting.json` declares a D1 binding;
- no Vercel project configuration or Vercel-accessible database binding exists.

Vercel and Cloudflare use different storage models. Cloudflare exposes D1 through Worker bindings; Vercel applications normally use a Marketplace database through environment variables and a provider SDK. See:

- [Next.js on Vercel versus Cloudflare](https://vercel.com/kb/guide/next-js-on-vercel-vs-cloudflare)
- [Postgres on Vercel](https://vercel.com/docs/postgres)
- [Storage on Vercel Marketplace](https://vercel.com/docs/marketplace-storage)

#### Required architecture decision

Because the required host is Vercel, the recommended production target is:

1. native Next.js App Router on Vercel;
2. `next dev`, `next build`, and `next start`;
3. no Cloudflare Worker/Vinext/Vite/Wrapper dependency in the production path;
4. PostgreSQL from a Vercel Marketplace provider such as Neon or Supabase;
5. Drizzle configured for PostgreSQL;
6. pooled TLS connections through environment variables;
7. development, preview/staging, and production databases isolated from each other;
8. application Functions and the database placed in compatible nearby regions;
9. migrations run as an explicit, observable deployment operation;
10. runtime credentials restricted to application queries, with migration credentials separated.

Staying on Cloudflare would be a smaller migration but would not satisfy the owner’s Vercel requirement.

### 11.3 Dependency and deterministic-build findings

#### Production audit

The live npm advisory service reported:

- **3 high-severity production vulnerability groups**;
- affected production packages include Next.js, PostCSS through Next.js, and Sharp;
- installed Next.js is `16.2.6`;
- npm identifies Next.js `16.2.12` as a non-major fix path at audit time;
- the complete production and development audit reported 18 vulnerability groups: 13 high, 4 moderate, and 1 low;
- `react-server-dom-webpack`, Vite, Wrangler, Cloudflare tooling, Miniflare, Undici, WebSocket, Esbuild, and other build dependencies also require upgrade, removal, or risk review.

#### Package-management drift

- Both `package-lock.json` and `pnpm-lock.yaml` are tracked.
- `package.json` has no `packageManager` declaration.
- The npm lockfile contains root dependency state not aligned with the current `package.json`.
- `npm ls` sees the pnpm-linked local tree as extensively extraneous.
- Vercel selects an installer from repository lockfiles, so competing lockfiles make clean-build behaviour ambiguous. See [Vercel package-manager detection](https://vercel.com/docs/package-managers).

#### Required remediation and acceptance criteria

1. Choose exactly one package manager.
2. Keep exactly one lockfile.
3. Declare an exact `packageManager` version.
4. Regenerate the lockfile from the corrected manifest.
5. Recreate dependencies from an empty `node_modules`.
6. Use `npm ci` or `pnpm install --frozen-lockfile` in CI.
7. Upgrade Next.js and aligned React/RSC packages together.
8. Remove Cloudflare/Vite dependencies after the native Vercel port.
9. Require zero critical or high production vulnerabilities.
10. Rerun build, type-check, unit, database, API, E2E, image/export, and load tests after upgrades.

### 11.4 Database and analytical-data readiness

#### Verified strengths

The local D1-compatible SQLite snapshot contained:

| Measure | Observed |
|---|---:|
| Total observations | 12,552 |
| Unique IDs | 12,552 |
| State rows | 8,901 |
| National rows | 132 |
| District rows | 3,519 |
| Source URLs | 29 |
| Observation years | 2012–2024 |
| District parent states | 27 |
| Duplicate declared-grain groups | 0 |
| District rows missing a parent | 0 |
| State/national rows with an unexpected parent | 0 |
| SQLite integrity check | `ok` |

All observations use `percent`. Comparability is restricted in the current snapshot to `directly_comparable` or `comparable_with_caveats`.

#### District-count documentation defect

The README states that there are 583 districts. The database has:

- **588** distinct districts with at least one approved observation;
- **583** districts with all six district measures;
- four districts with four measures;
- one district with five measures;
- missing older-grade cells correspond to suppressed/unpublished values and must remain absent rather than becoming zero.

Documentation and metadata must distinguish “districts with any data” from “districts with all six measures.”

#### Required schema and operational improvements

1. Add a database check that percentages remain between 0 and 100.
2. Constrain `geography_type`, `unit`, and `comparability` to approved values.
3. Enforce district-parent consistency.
4. Add a unique constraint matching the declared grain:
   `dataset × survey round × geography type × geography × indicator × subgroup`.
5. Introduce stable source-document records containing title, publisher, edition, publication date, URL, checksum, retrieval date, page range, and rights status.
6. Introduce stable indicator and geography identifiers rather than relying only on repeated display strings.
7. Scope every public query by `dataset`. The schema claims new datasets can be added safely, but current routes do not consistently filter by dataset.
8. Add a release/snapshot identifier to API responses, CSVs, PNGs, and citations.
9. Record migration checksums and release row counts.
10. Make seed/migration execution transactional, idempotent where appropriate, and observable.
11. Validate PostgreSQL query plans and indexes after the Vercel database migration.
12. Establish automated backups, retention, point-in-time recovery where supported, and a tested restore procedure.
13. Maintain separate preview and production data snapshots.
14. Define data rollback independently from application rollback.

### 11.5 Source PDFs, extracted data, and reproducibility

No source PDF, extraction script, raw extraction output, canonical CSV/Parquet release, or review queue is present in the repository. The SQL migrations contain derived observations and external URLs, but an independent contributor cannot reproduce the database from repository contents.

The README describes positional extraction, suppressed-cell handling, ambiguity logging, cross-edition reconciliation, and source checks. The implementation and evidence for that pipeline are not present.

#### Required reproducible data pipeline

1. Machine-readable source manifest.
2. Document download and checksum verification.
3. Deterministic positional extraction.
4. Explicit geography and indicator normalization.
5. Review queue for ambiguous, suppressed, or conflicting cells.
6. Golden-value reconciliation.
7. Cross-edition comparison report.
8. Canonical versioned derived dataset.
9. Deterministic database seed/migration generation.
10. Release manifest recording source checksums, code commit, dataset checksum, row counts, validation results, generation timestamp, and approver.
11. A single documented command that rebuilds and validates the release snapshot.

#### Rights and public-repository gate

Do not commit source PDFs until redistribution rights are confirmed. The ASER website makes reports available but also displays “All Rights Reserved”; public availability does not itself establish an open redistribution licence. See [ASER’s official rights notice](https://asercentre.org/privacy-guidelines/).

Before making the repository public:

- select an explicit software licence for original code;
- obtain written clarification or legal review for redistributing extracted figures and any report content;
- add `DATA_LICENSE.md` or `NOTICE.md`;
- state that ASER Centre/Pratham owns the authoritative reports;
- document citation, permitted reuse, disclaimer, and takedown/correction contact;
- keep PDFs external if permission is not clear;
- retain URLs, hashes, titles, editions, retrieval dates, and exact page locators.

This is a release gate, not optional polish.

### 11.6 Public GitHub repository readiness

#### Current gaps

- Git remote is named `sites` and points to the Sites hosting service; no GitHub `origin` exists.
- The working tree is dirty and must not be published as an ambiguous release candidate.
- No Git tags or formal releases exist.
- README refers to a `LICENSE` file that does not exist.
- No `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CODEOWNERS`, changelog, support policy, or GitHub issue/PR templates exist.
- No `.github/workflows` CI exists.
- `tsconfig.tsbuildinfo` is tracked.
- `app/globals 2.css` appears to be a duplicate/dead tracked artifact.
- `.claude/launch.json` is tracked and should be explicitly reviewed for public relevance.
- Package identity remains `site-creator-vinext-starter`.

#### Required GitHub preparation

1. Resolve all release-blocking product and architecture work on reviewed branches.
2. Review all Git history for credentials, tokens, private paths, and unwanted artifacts.
3. Create the public GitHub repository and add it as `origin`.
4. Add code and data/contents licensing documents.
5. Add `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CODEOWNERS`, changelog, support policy, and governance/ownership information.
6. Add issue forms for bugs, accessibility, security routing, and data corrections.
7. Add a pull-request template with data-lineage and UAT checkboxes.
8. Clean tracked generated/duplicate/private-tool artifacts.
9. Rename the package and update repository metadata.
10. Add repository description, homepage, topics, social image, and citation information.
11. Create signed/versioned application and data releases.
12. Attach a release manifest and publish SHA-256 checksums.

GitHub’s public-repository community profile expects files such as README, licence, code of conduct, and contribution guidance. See [GitHub community-profile guidance](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories).

#### Required repository protections

- secret scanning and push protection;
- Dependabot alerts, security updates, and version updates;
- CodeQL;
- dependency review on pull requests;
- protected `main` branch or equivalent ruleset;
- mandatory pull requests and required review;
- CODEOWNERS review for data, migrations, security, and analytical logic;
- required status checks;
- required conversation resolution;
- block force pushes and branch deletion;
- release permission restricted to named maintainers.

See:

- [GitHub protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges/managing-protected-branches)
- [GitHub dependency review](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-review)
- [GitHub repository security quickstart](https://docs.github.com/en/code-security/getting-started/quickstart-for-securing-your-repository)

### 11.7 Mandatory CI/CD gates

Every pull request must run:

1. clean frozen dependency installation;
2. lockfile/manifest consistency;
3. lint;
4. standalone TypeScript validation;
5. unit and question-model tests;
6. blank-database migration;
7. data-quality, source-manifest, and release-checksum validation;
8. mandatory live API-contract tests against a seeded ephemeral database;
9. exhaustive state/national and district reconciliation;
10. Playwright E2E in Chromium, Firefox, and WebKit;
11. automated accessibility checks with Axe;
12. visual regression in desktop, tablet, mobile, light, and dark modes;
13. CSV and PNG content verification;
14. dependency audit and GitHub dependency review;
15. CodeQL and secret scanning;
16. Lighthouse performance, accessibility, best-practice, and SEO budgets;
17. public-API load, length-limit, abuse, and failure-state tests;
18. Vercel preview deployment smoke tests.

The current API-contract suite skips when no server is reachable. Release CI must treat unavailable integration infrastructure as a failure rather than silently reducing coverage.

Protect `main` so none of these gates can be bypassed without a documented, time-limited release waiver.

### 11.8 Browser, mobile, responsive, and accessibility gate

#### Automated matrix

- current stable Chromium;
- current stable Firefox;
- WebKit as the automated Safari proxy;
- desktop, tablet, representative iPhone, and representative Android viewports;
- portrait and landscape;
- light and dark colour preference;
- high contrast;
- reduced motion;
- text scaling;
- browser zoom at 200% and 400%;
- keyboard-only operation;
- slow connection, delayed API, offline, malformed response, empty response, `429`, and `503`;
- refresh, back/forward, deep links, simultaneous requests, and rapid control changes.

#### Required real-runtime/manual matrix

- Safari on macOS;
- Firefox on macOS or Windows;
- iOS Safari on a physical device or device farm;
- Android Chrome on a physical device or device farm;
- VoiceOver on macOS and iOS;
- NVDA with Firefox and Chrome on Windows;
- TalkBack on Android.

BrowserStack, Sauce Labs, or an equivalent device farm is acceptable where physical devices are unavailable. Viewport emulation must never be reported as proof of real mobile-browser compatibility.

### 11.9 Security hardening

Application and deployment must implement and verify:

- Content Security Policy;
- Strict Transport Security after the custom domain is stable;
- `X-Content-Type-Options: nosniff`;
- restrictive `Referrer-Policy`;
- restrictive `Permissions-Policy`;
- CSP `frame-ancestors` or an equivalent anti-clickjacking policy;
- explicit CORS behavior;
- input membership, type, length, and cardinality limits;
- request timeouts and response-size limits;
- rate limiting for public APIs;
- generic client errors with no stack, SQL, binding, or platform disclosure;
- structured logs with request, deployment, route, latency, and error identifiers;
- security contact and vulnerability-disclosure process;
- regular dependency and secret scanning.

See:

- [Next.js response headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers)
- [Next.js Content Security Policy](https://nextjs.org/docs/app/guides/content-security-policy)
- [Vercel Firewall](https://vercel.com/docs/vercel-firewall)
- [Vercel WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting)

### 11.10 Documentation reconciliation

The following statements cannot coexist in a production release:

- README says the application is live;
- `docs/UAT_REPORT.md` says no P0/P1 defect is open and the application is releasable;
- this current comprehensive UAT proves the release is blocked;
- dataset configuration says only national/state are served while current UI and routes serve districts;
- comments in `app/api/_data.ts` say districts are not publicly reachable while the implementation includes district queries;
- README says 583 districts without explaining that 588 have data and 583 have all six measures;
- README refers to a nonexistent licence;
- extraction and validation claims cannot be independently reproduced from the repository.

Before launch:

1. designate one authoritative current release-status document;
2. label older UAT reports as historical;
3. correct the district and served-geography descriptions;
4. publish an architecture and Vercel deployment guide;
5. publish the environment-variable contract without secrets;
6. publish database migration and rollback runbooks;
7. publish a data dictionary, source manifest, provenance method, and suppression policy;
8. publish API examples, error contracts, caching behavior, and release identifiers;
9. publish browser support and accessibility statements;
10. publish privacy and analytics policies;
11. publish incident response, backup/restore, and release checklists;
12. maintain a changelog and known-limitations section.

### 11.11 Vercel project and launch configuration

After the architecture migration and release gates pass:

1. Import the public GitHub repository into Vercel.
2. Use `main` as the production branch and pull requests for Preview deployments.
3. Pin Node to `22.x`; `>=22.13.0` can resolve to a newer Vercel-supported major. See [Vercel Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).
4. Configure isolated Development, Preview, and Production database credentials.
5. Mark Preview and Production credentials sensitive. See [Vercel sensitive environment variables](https://vercel.com/docs/environment-variables/sensitive-environment-variables).
6. Protect Preview/staging deployments from unintended public access.
7. Set Function regions close to the database.
8. Add the custom domain, canonical host redirect, DNS verification, and SSL. See [Vercel custom-domain setup](https://vercel.com/docs/domains/set-up-custom-domain).
9. Enable WAF, API rate limits, and bot controls appropriate to a public data API.
10. Enable Observability and structured runtime logs.
11. Enable Speed Insights and, if approved under the privacy policy, Web Analytics.
12. Configure error-rate, latency, availability, database, and spend alerts.
13. Define deployment promotion, application rollback, migration rollback, data rollback, and incident escalation.
14. Verify caching, CDN headers, stale-data policy, and cache invalidation.
15. Run production smoke and reconciliation checks before opening access.

Vercel’s official checklist also requires incident planning, rollback familiarity, security headers, WAF, logs, caching, load testing, Core Web Vitals, region alignment, and cost controls. See [Vercel’s production checklist](https://vercel.com/docs/production-checklist).

### 11.12 SEO, product metadata, and public trust

Before launch, add and verify:

- canonical production URL;
- complete title and description;
- Open Graph and social-card metadata;
- favicon and application icons;
- `robots.txt`;
- sitemap;
- structured data where appropriate;
- branded 404 and fatal-error states;
- independent/non-official disclaimer in persistent About/source context;
- correction and contact route;
- accessible citation guidance;
- retrieval date and data release/version in citations;
- privacy policy before enabling analytics;
- no indexation of Preview or staging deployments.

### 11.13 Reliability, performance, and operational readiness

Required controls:

- health/readiness endpoint that checks application and database safely;
- service-level objectives for availability, API error rate, and latency;
- production Web Vitals monitoring;
- route-level latency and error dashboards;
- structured error tracking;
- persistent log retention or log drain where needed;
- alert ownership and escalation;
- incident response and post-incident review template;
- capacity and cost budgets;
- API load, burst, scrape, and cache tests;
- database-region and Function-region alignment;
- appropriate `s-maxage` and `stale-while-revalidate` strategy for immutable/slow-changing public data;
- explicit cache invalidation on a new data release;
- backup schedule and restore drill;
- disaster-recovery and dependency-outage behavior;
- documented Vercel rollback and database rollback;
- monitored post-release soak before declaring general availability.

See:

- [Vercel Observability](https://vercel.com/docs/observability)
- [Vercel Speed Insights](https://vercel.com/docs/speed-insights)
- [Vercel Web Analytics](https://vercel.com/docs/analytics)
- [Vercel alerts](https://vercel.com/docs/alerts)

### 11.14 End-to-end implementation order

#### Phase 0 — Ownership and architecture

1. Resolve code licence.
2. Resolve data/report reuse and redistribution rights.
3. Confirm native Vercel Next.js plus Marketplace Postgres.
4. Name code, data, security, deployment, and release owners.

#### Phase 1 — Product correctness

1. Fix every P0 in this report.
2. Fix every P1 or create an explicit owner-approved waiver with expiry.
3. Add regression tests for each root cause.
4. Reconcile UI, API, table, source, CSV, and PNG behavior.

#### Phase 2 — Platform and dependency migration

1. Patch production dependencies.
2. Standardize package management.
3. Replace Vinext/Cloudflare production runtime with native Next.js.
4. Port D1/SQLite schema and queries to PostgreSQL.
5. Add environment validation and production migration controls.

#### Phase 3 — Data and provenance

1. Add schema constraints and stable dimensions.
2. Add source manifest and document hashes.
3. Add reproducible extraction and review pipeline.
4. Add canonical data and release checksums.
5. Add backup, restore, and rollback procedures.

#### Phase 4 — Public repository and automation

1. Clean repository artifacts and documentation.
2. Add licence, notices, community, security, and contribution files.
3. Create GitHub public repository.
4. Enable security features and protected branches.
5. Add the full CI/CD gate.

#### Phase 5 — Staging qualification

1. Deploy protected Vercel staging.
2. Seed a production-shaped staging database.
3. Run exhaustive data/API/export reconciliation.
4. Run automated Chromium/Firefox/WebKit tests.
5. Run real Safari/iOS/Android and screen-reader tests.
6. Run security, performance, load, failure-state, and recovery testing.

#### Phase 6 — Production launch

1. Resolve all release-gate failures.
2. Deploy production and run database migrations under observation.
3. Verify DNS, SSL, headers, cache, source links, exports, and representative data.
4. Enable alerts and begin monitored soak.
5. Roll back immediately on analytical, lineage, security, or availability regression.
6. Tag the exact application and data release after the soak succeeds.

### 11.15 Final production acceptance gate

Do not declare the application production-ready until all are true:

- zero open P0 defects;
- zero open P1 defects unless explicitly waived with owner and expiry;
- zero critical/high production dependency vulnerabilities;
- clean deterministic install, lint, type-check, build, and test;
- native Vercel build and runtime proven in Preview and Production;
- production database migration and rollback proven;
- backup restore tested;
- every visible and exported value reconciles with the exact source document/page;
- data release is reproducible and checksum-addressed;
- code and data publication rights are documented;
- GitHub security, CI, protected-branch, and community controls are active;
- Chromium, Firefox, WebKit, real Safari, iOS Safari, and Android Chrome critical paths pass;
- VoiceOver, NVDA, and TalkBack primary paths pass;
- WCAG 2.2 AA contrast, keyboard, zoom, touch target, and reflow requirements pass;
- security headers, rate limits, error handling, and failure states pass;
- production performance and load budgets pass;
- monitoring, alerts, incident ownership, rollback, and spend controls are active;
- production smoke and monitored soak complete without analytical, security, or reliability regression.

**Expanded production release decision: BLOCK until Sections 9–11 are implemented and independently retested.**

---

## 12. Claude-ready master traceability and delivery register

### 12.1 Instructions to the coding agent

Claude must use this section as the planning index and Sections 5, 9, 10, and 11 as the detailed evidence and acceptance oracle.

Planning rules:

1. Do not infer or silently make an owner decision listed in Section 12.2.
2. Do not deploy before every P0 is closed and independently retested.
3. Treat every P1 as a public-release blocker unless the owner records a named, dated, expiring waiver.
4. Group fixes by shared root cause using the PR sequence in Section 12.5.
5. Preserve per-observation lineage throughout APIs, transformations, UI, CSV, and PNG.
6. Preserve suppressed cells as absent; never synthesize zero.
7. Keep district grade-band constructs separate from state single-grade constructs.
8. Introduce no new dataset without explicit dataset scoping in every route.
9. Every fix must add or update a regression test that fails against the defective implementation.
10. A passing unit suite is insufficient where the acceptance criterion is visible, browser-specific, deployed, or operational.
11. Record the evidence used to close each ID: commit, test, deployed URL, environment, timestamp, and reviewer.
12. Update documentation in the same PR that changes a user-visible contract, data definition, API, environment variable, or operating procedure.
13. Do not mark an item complete when its required test was skipped.
14. Do not describe the application as production-ready until the final gate in Section 12.7 passes.

### 12.2 Owner-decision register

These decisions block or materially shape implementation. Claude may prepare options and consequences but must obtain an explicit owner choice before committing to one.

| Decision ID | Required owner decision | Recommended default | Why Claude must not decide alone | Blocks |
|---|---|---|---|---|
| DEC-001 | Legal basis or written permission for publishing extracted ASER figures and any report content | Obtain written clarification from ASER Centre/Pratham; keep PDFs external until confirmed | Public availability is not proof of an open redistribution licence | LEGAL-P0-001, DATA-P1-002, GIT-P1-001 |
| DEC-002 | Software licence for original code | Choose an OSI-approved licence consistent with owner intent | Licence choice determines downstream reuse rights | GIT-P1-001 |
| DEC-003 | Data/content licence and notice | Separate `DATA_LICENSE.md`/`NOTICE.md` from the software licence | Code and source-report rights are distinct | LEGAL-P0-001, GIT-P1-001 |
| DEC-004 | Production hosting architecture | Native Next.js on Vercel | Required hosting target conflicts with current Cloudflare-specific runtime | PLATFORM-P0-001 |
| DEC-005 | Vercel-compatible PostgreSQL provider | Neon or Supabase through Vercel Marketplace | Cost, ownership, region, backups, and operational controls differ | DB-P0-001 |
| DEC-006 | Package manager | Choose one; npm is simplest for this single-package Vercel repository | Determines lockfile, CI, local setup, and Vercel installation | SUPPLY-P0-001 |
| DEC-007 | Vercel account/plan, team, and billing owner | Pro if alerting/protection requirements justify it; otherwise document Hobby limitations | Features, limits, alerts, retention, and access controls vary by plan | OPS-P1-001, PLATFORM-P1-002 |
| DEC-008 | Production and staging domains | Dedicated production domain plus protected Preview/staging | DNS ownership and canonical URL affect security and SEO | PLATFORM-P1-002, SEO-P2-001 |
| DEC-009 | Analytics and privacy posture | No analytics until policy is approved; then privacy-preserving Vercel Analytics if desired | Creates privacy, disclosure, and retention obligations | OPS-P2-002 |
| DEC-010 | Availability, latency, and recovery objectives | Define SLO, p95 API target, RPO, and RTO before launch | Engineering cannot validate “reliable” without thresholds | OPS-P1-001, DB-P1-003, PERF-P1-001 |
| DEC-011 | Incident, security, data, and release owners | Name primary and backup owners for each function | Alerts and vulnerabilities require accountable responders | OPS-P1-001, GIT-P1-002 |
| DEC-012 | Backup retention and data-release retention | Retain immutable published releases; define database backup retention from recovery objectives | Storage, recovery, audit, and cost implications require owner approval | DB-P1-003, DATA-P1-001 |
| DEC-013 | Browser support policy | Latest two stable Chrome, Firefox, and Safari; current iOS Safari and Android Chrome | Defines the enforceable compatibility matrix | BROWSER-P1-001 |
| DEC-014 | P1 waiver authority | Product owner plus data owner for analytical issues; security owner for security issues | Waivers cannot be self-approved by the implementer | All P1 items |

No implementation plan is complete unless it identifies when each applicable decision is required and who will supply it.

### 12.3 Existing application-defect traceability

The exact evidence, reproduction, expected/observed result, likely component, acceptance criteria, and regression tests for these IDs are in Section 5.

| Existing ID | Severity | Root-cause workstream | Primary likely files | Required proof before closure | Depends on |
|---|---|---|---|---|---|
| UAT-P0-001 | P0 | Safe question/cut transitions | `app/page.tsx`, `app/components/cards.tsx`, `app/lib/api.ts` | All 27 state→district transitions and rapid-switch tests pass with no crash, stale value, duplicate key, or console error | None |
| UAT-P0-002 | P0 | District API scope parity | `app/api/_data.ts`, `app/api/lineage/route.ts`, `app/api/export/route.ts` | Explorer, Lineage, and API CSV counts/values agree for all 108 district cuts | None |
| UAT-P0-003 | P0 | Per-observation provenance | `app/lib/api.ts`, cards, related analyses, downloads, API response types | Every UI/table/CSV/PNG value carries its exact URL/page; multi-source and multi-page cuts reconcile | UAT-P0-002 |
| UAT-P0-004 | P0 | Geography/construct truth | `app/page.tsx`, `app/components/related.tsx`, `app/lib/aser.ts` | National, state, and district related analyses preserve and label the actual geography, anchor, grade/grade-band, and population | None |
| UAT-P1-005 | P1 | Sparse-trend truth | trend API/client/card | A state-specific question never silently becomes an India trend; unavailable state series is explained and safely routed | UAT-P0-004 |
| UAT-P1-006 | P1 | URL relationship validation | `app/lib/aser.ts`, URL restore, API context validation | Invalid geography/parent combinations normalize or reject with an explicit recovery message | UAT-P0-004 |
| UAT-P1-007 | P1 | Async loading lifecycle | comparison/card state logic | Async→sync and rapid dimension transitions always end loading and show only the latest valid result | UAT-P0-001 |
| UAT-P1-008 | P1 | District rendering composition | `app/page.tsx`, district/ranking card composition | One ranking appears once, with correct number of rows and focusable controls | UAT-P0-001 |
| UAT-P1-009 | P1 | Complete image exports | `app/lib/downloads.ts` and callers | PNG represents every visible row or explicitly paginates/labels completeness; no silent 16-row truncation | UAT-P0-003 |
| UAT-P1-010 | P1 | Colour/low-vision accessibility | `app/globals.css`, image-card palette | WCAG 2.2 AA contrast passes in light/dark UI and generated exports | None |
| UAT-P1-011 | P1 | Baseline HTTP security | `next.config.ts` or response layer; Vercel project settings | CSP, HSTS, nosniff, referrer, permissions, and frame protections verified on deployed responses | PLATFORM-P0-001 |
| UAT-P2-012 | P2 | District terminology | question and district card copy | State/district nouns and counts remain correct across all district journeys | UAT-P0-004 |
| UAT-P2-013 | P2 | Document/tab semantics | layout/page/tab components | One descriptive H1; complete tab/list/tabpanel relationships; keyboard pattern verified | None |
| UAT-P2-014 | P2 | Touch target size | CSS and controls | Primary interactive targets satisfy the adopted WCAG/mobile target policy at supported mobile sizes | None |
| UAT-P2-015 | P2 | Type-check configuration | `tsconfig.json`, runtime types, scripts | Clean standalone type-check in local clean install and CI | PLATFORM-P0-001 |
| UAT-P2-016 | P2 | API validation | `app/api/_data.ts`, profile/trend routes | Invalid membership and oversized parameters return bounded typed 4xx responses without expensive queries or reflected payloads | None |
| UAT-P3-017 | P3 | Grammar | comparison copy generator | Singular/plural grammar tests and visible copy pass | None |

### 12.4 Production-gap register

#### Release-blocking P0 gaps

| Production ID | Severity | Gap and evidence | Likely files/systems | Concrete acceptance criteria | Required tests/evidence | Depends on |
|---|---|---|---|---|---|---|
| PLATFORM-P0-001 | P0 | Current build/runtime are Vinext/Vite/Cloudflare Worker; DB uses direct D1 binding, so native Vercel deployment is not established | `package.json`, `vite.config.ts`, `worker/`, `build/`, `.openai/hosting.json`, `db/index.ts`, API routes | `next build` succeeds in a clean environment; Vercel Preview and Production run without Cloudflare bindings; every route and export works | Clean native build; Preview smoke; production-shaped API suite; runtime log review | DEC-004, SUPPLY-P0-001 |
| DB-P0-001 | P0 | D1 is not directly available as a Vercel binding | `db/index.ts`, `db/schema.ts`, `drizzle.config.ts`, migrations, Vercel Marketplace project | PostgreSQL provider provisioned; schema/data migrated; 12,552-row snapshot and all invariants reconcile; pooled TLS connection works in Preview and Production | Blank migration; migration parity; row/value/hash parity; connection/concurrency test; rollback rehearsal | DEC-005, PLATFORM-P0-001 |
| SUPPLY-P0-001 | P0 | Production audit found three high-severity vulnerability groups and dependency/lockfile drift | `package.json`, chosen lockfile, dependency tree | One lockfile; exact package manager; clean frozen install; zero critical/high production advisories; patched aligned framework packages | Clean-room install; full audit; dependency review; full regression suite | DEC-006 |
| LEGAL-P0-001 | P0 | No software licence; data/report reuse rights are undocumented; ASER site states All Rights Reserved | repository licence/notice; owner/legal evidence | Software licence committed; data/content notice committed; legal basis or written permission recorded; PDFs excluded unless permitted | Owner/legal sign-off linked in release record; public-repo content audit | DEC-001, DEC-002, DEC-003 |
| RELEASE-P0-001 | P0 | Current product UAT verdict is blocked | All files implicated by UAT-P0/P1 | All P0s closed; all P1s closed or validly waived; required release retest passes without skips | Section 10 and 12.7 evidence pack | All existing P0/P1 fixes |

#### Public-release P1 gaps

| Production ID | Severity | Gap and evidence | Likely files/systems | Concrete acceptance criteria | Required tests/evidence | Depends on |
|---|---|---|---|---|---|---|
| DATA-P1-001 | P1 | No release/snapshot identity or immutable data manifest | schema/API/export/data pipeline | Every API response and export identifies application commit and data release; manifest includes checksums, row counts, sources, generation time, and approver | Manifest-schema test; reproducible checksum; deployed response/export check | DB-P0-001 |
| DATA-P1-002 | P1 | Extraction, reconciliation, review, and seed-generation pipeline is absent | new data-pipeline area, source manifest, migrations | One documented command deterministically produces the canonical dataset and seed from verified sources; ambiguity/suppression decisions are inspectable | Rebuild twice with identical hash; golden-value reconciliation; review-queue test | DEC-001, LEGAL-P0-001 |
| DATA-P1-003 | P1 | Schema claims multi-dataset extensibility but APIs do not consistently filter by dataset | schema and all API routes | Dataset is explicit in context and queries; adding a fixture dataset cannot contaminate ASER results | Cross-dataset isolation test for every public route/export | DB-P0-001 |
| DATA-P1-004 | P1 | Stored lineage lacks structured source title, edition, checksum, retrieval date, and rights state | source/document schema, data pipeline, API contracts | Each observation resolves through a stable source record with complete release metadata | Not-null/FK tests; source-manifest reconciliation; broken-source simulation | DATA-P1-002 |
| DB-P1-001 | P1 | Database does not enforce core analytical domain rules | schema and migrations | Checks/constraints enforce range, enums, grain uniqueness, and district-parent rules | Negative migration/insertion tests for every constraint | DB-P0-001 |
| DB-P1-002 | P1 | Migration process lacks documented transaction, checksum, promotion, and rollback controls | migrations, CI, deployment workflow | Migrations are ordered, checksum-addressed, reviewed, tested on blank and previous snapshots, and have rollback/forward-repair procedure | Blank/current/rollback migration rehearsal in CI and staging | DB-P0-001 |
| DB-P1-003 | P1 | Backup, restore, RPO/RTO, and data rollback are unproven | database provider and operations docs | Automated backups configured; retention matches policy; restore into isolated environment meets agreed RPO/RTO; immutable release snapshot retained | Timestamped restore drill and reconciliation report | DEC-010, DEC-012, DB-P0-001 |
| GIT-P1-001 | P1 | No GitHub origin or public-repository community/licensing package | GitHub repository and root/`.github` files | Public GitHub repo has correct history/content, licence/notice, README, contribution/security/conduct files, templates, metadata, tags, and releases | GitHub community-profile review; history secret scan; fresh clone setup | LEGAL-P0-001 |
| GIT-P1-002 | P1 | No protected branch, ownership, or supply-chain controls | GitHub settings, CODEOWNERS, Dependabot, CodeQL | `main` requires PR, review, status checks, conversation resolution, and code-owner review; force push/deletion blocked; scanning enabled | Repository-settings evidence; intentionally failing PR proves enforcement | DEC-011, GIT-P1-001 |
| CI-P1-001 | P1 | No mandatory GitHub CI/CD; live API tests can skip and still leave CI green | `.github/workflows`, test scripts, ephemeral DB setup | Clean install, lint, type-check, build, migrations, all tests, audit, E2E, accessibility, and Preview smoke are mandatory; unavailable integration infrastructure fails | Required-check evidence; skip-detection test; green fresh-clone workflow | SUPPLY-P0-001, PLATFORM-P0-001, DB-P0-001 |
| BROWSER-P1-001 | P1 | Real cross-browser/mobile and assistive-technology coverage is absent | Playwright/device-farm config, manual test records | Adopted browser matrix passes primary journeys; real Safari/iOS/Android and VoiceOver/NVDA/TalkBack evidence recorded | Automated matrix plus timestamped manual/device-farm report | DEC-013, RELEASE-P0-001 |
| SECURITY-P1-001 | P1 | Security headers are absent | `next.config.ts`, middleware/response layer, Vercel | Deployed HTML/API/download responses meet approved CSP, HSTS, nosniff, referrer, permissions, and framing policy | Header scanner on Preview and Production; CSP violation review | PLATFORM-P0-001 |
| SECURITY-P1-002 | P1 | Public API lacks complete validation, rate limiting, and abuse controls | API parsers/routes and Vercel WAF | Bounded parameters; invalid membership rejected; rate limits return 429; legitimate exhaustive clients remain functional | Fuzz/length tests; burst/load test; WAF evidence; cost review | UAT-P2-016, PLATFORM-P0-001 |
| SECURITY-P1-003 | P1 | No public vulnerability process or persistent security monitoring | `SECURITY.md`, GitHub/Vercel settings, alert routing | Private reporting path, response expectations, owners, scanning, and security-alert routing are operational | Test report path; sample alert acknowledgement; owner sign-off | DEC-011, GIT-P1-002 |
| DOC-P1-001 | P1 | README, old UAT, code comments, dataset registry, and current evidence contradict each other | README, docs, comments, dataset registry | One authoritative status; historical reports labelled; district counts/scope, build/deploy, licence, and data-pipeline claims are accurate | Documentation link/check test; reviewer comparison against code/API/database | All contract-changing PRs |
| OPS-P1-001 | P1 | No SLOs, operational dashboards, actionable alerts, incident process, or rollback runbook | Vercel, DB provider, operations docs | Named owners; SLOs; route/DB/error dashboards; alerts; incident/rollback runbooks; alert drill completed | Alert test; incident tabletop; Vercel rollback; application+data rollback rehearsal | DEC-007, DEC-010, DEC-011, DB-P1-003 |
| PLATFORM-P1-002 | P1 | Vercel environment isolation, protected Preview, domain, DNS, and production promotion are unproven | Vercel project/settings and DNS | Separate environments/credentials; Preview protected; production branch defined; canonical domain and SSL valid; promotion/rollback tested | Vercel settings evidence; DNS/SSL/header smoke; Preview isolation test | DEC-007, DEC-008, PLATFORM-P0-001 |
| PERF-P1-001 | P1 | Only local warm latency was measured; no production Web Vitals, load budget, CDN, or region validation exists | Vercel, database, caching, test tooling | Agreed Lighthouse/Web Vitals/API p95/load/error budgets pass; Function and DB regions aligned; cache policy verified | Production-shaped load test; Speed Insights/field plan; CDN/cache tests | DEC-010, PLATFORM-P1-002 |

#### P2 completion gaps

| Production ID | Severity | Gap | Acceptance criteria | Depends on |
|---|---|---|---|---|
| REPO-P2-001 | P2 | Tracked generated/duplicate/tool-specific artifacts and starter identity | `tsconfig.tsbuildinfo` and dead duplicate CSS are untracked/removed after review; public tool files justified; package/project identity reflects ASER Explorer | GIT-P1-001 |
| SEO-P2-001 | P2 | Canonical, Open Graph, social metadata, robots, sitemap, and branded error pages are incomplete | Production domain is canonical; metadata/social preview/icons/robots/sitemap/404/error states validate; Preview is not indexed | DEC-008, PLATFORM-P1-002 |
| OPS-P2-002 | P2 | Analytics/privacy decision and disclosure are absent | Analytics is disabled or implemented under an approved privacy policy with environment and data-retention controls | DEC-009 |
| COST-P2-001 | P2 | No spend, database, bandwidth, or abuse budget | Spend alerts and usage budgets are configured; load/cache model documents expected cost and response to abnormal traffic | DEC-007, PERF-P1-001 |

### 12.5 Proposed pull-request sequence

Each PR must remain independently reviewable, include its tests, update affected documentation, and avoid mixing unrelated cosmetic work.

| PR | Scope | IDs primarily closed | Required gate before merge |
|---:|---|---|---|
| 00 | Owner decision record and architecture decision record | DEC-001–014 as applicable | Named approvals; no product code |
| 01 | Package-manager normalization and urgent framework/security upgrades | SUPPLY-P0-001 | Clean frozen install; full audit; current test baseline |
| 02 | Safe state/cut transitions and loading lifecycle | UAT-P0-001, UAT-P1-007 | Rapid interaction and all-parent transition tests |
| 03 | Authoritative geography/construct context and URL relationships | UAT-P0-004, UAT-P1-005, UAT-P1-006, UAT-P2-012 | Context reconciliation across question/UI/API/table/export |
| 04 | First-class row/point lineage and district API scope | UAT-P0-002, UAT-P0-003, UAT-P1-009 | 467 state/national plus 108 district cross-surface reconciliation |
| 05 | District composition, accessibility, touch, contrast, semantics, grammar | UAT-P1-008, UAT-P1-010, UAT-P2-013, UAT-P2-014, UAT-P3-017 | Axe, keyboard, visual, contrast, mobile tests |
| 06 | Native Next.js/Vercel runtime conversion | PLATFORM-P0-001, UAT-P2-015 | Clean `next build`; local/native smoke; Vercel Preview boot |
| 07 | PostgreSQL schema, provider, constraints, migrations, and parity | DB-P0-001, DB-P1-001, DB-P1-002, DATA-P1-003 | Blank and upgrade migration; 12,552-row/value/hash parity; rollback rehearsal |
| 08 | Reproducible source/data pipeline and release manifest | DATA-P1-001, DATA-P1-002, DATA-P1-004 | Two identical rebuild hashes; golden/source/manifest reconciliation |
| 09 | API validation, headers, WAF/rate limiting, and security process | UAT-P1-011, UAT-P2-016, SECURITY-P1-001–003 | Header/fuzz/burst/security-alert tests on Preview |
| 10 | GitHub public-repository hygiene and governance | LEGAL-P0-001, GIT-P1-001, GIT-P1-002, REPO-P2-001 | Community/security/history/settings review |
| 11 | Mandatory CI/CD and Preview release gates | CI-P1-001 | Intentionally failing PR proves each required gate blocks merge |
| 12 | Documentation reconciliation, SEO, accessibility statement, privacy decision | DOC-P1-001, SEO-P2-001, OPS-P2-002 | Documentation/metadata/link review against deployed Preview |
| 13 | Backups, observability, SLOs, alerts, incident/rollback, and cost controls | DB-P1-003, OPS-P1-001, PERF-P1-001, COST-P2-001 | Restore drill, alert drill, rollback drill, load/cost evidence |
| 14 | Full staging qualification | BROWSER-P1-001, PLATFORM-P1-002, RELEASE-P0-001 | Section 10 and 12.7 complete on immutable staging commit/data release |
| 15 | Production promotion and monitored soak | Final release | Production smoke, reconciliation, security, monitoring, and soak pass |

Claude may adjust PR boundaries when code ownership or dependency conflicts require it, but the plan must preserve the dependency order and explain any change.

### 12.6 Required evidence pack

The release candidate must produce an inspectable evidence pack outside application runtime artifacts:

- Git commit SHA and clean working-tree status;
- dependency manifest, selected lockfile, package-manager and Node versions;
- zero-critical/high production audit result;
- application build identifier;
- database migration/version and schema checksum;
- data-release identifier and canonical dataset checksum;
- source-manifest checksum and source-link result;
- total and segmented row counts;
- all automated test results with skip count;
- exhaustive API/CSV/Lineage reconciliation summary;
- CSV and PNG binary/content verification;
- Playwright Chromium/Firefox/WebKit results;
- real-device/browser evidence;
- VoiceOver/NVDA/TalkBack evidence;
- WCAG/contrast/keyboard/zoom/reflow evidence;
- security-header and CSP result;
- WAF/rate-limit and hostile-input result;
- Lighthouse/Web Vitals/load result;
- backup/restore result;
- Vercel Preview and Production URLs;
- DNS/SSL/canonical result;
- monitoring and alert test;
- application, database, and data rollback drill;
- licence/data-rights approval;
- release owner and independent reviewer sign-off.

The evidence pack may be generated by CI or the release process, but generated artifacts must not be committed casually to the application repository. Link them from the release record.

### 12.7 Final definition of done

Claude must treat the production programme as complete only when:

1. every ID in Sections 12.3 and 12.4 is closed or has an allowed, owner-approved, expiring waiver;
2. every applicable owner decision is recorded;
3. the public GitHub repository is the authoritative source;
4. a clean clone builds and tests deterministically;
5. Vercel Preview is built from the exact candidate commit;
6. production and Preview use isolated credentials and data resources;
7. the candidate data is reproducible and checksum-identical to the deployed release;
8. all analytical surfaces agree with source documents and each other;
9. no P0 is open or waived;
10. no P1 analytical, lineage, security, accessibility, data-loss, or core-journey issue is waived;
11. required browsers, devices, and assistive technologies pass;
12. security, performance, load, backup, restore, alert, and rollback tests pass;
13. code and data publication rights are documented;
14. documentation describes the deployed reality;
15. production smoke passes after promotion;
16. monitored soak completes without a qualifying regression;
17. the application and data release are tagged with immutable identifiers and checksums.

If any required infrastructure is unavailable, the item is **blocked or not tested**, never passed.

**Claude planning handoff:** build the implementation plan from Section 12.5, expand each PR using the linked IDs in Sections 12.3–12.4, use Section 5 for defect-level reproduction and acceptance criteria, use Sections 10 and 12.6 for verification, and do not schedule production promotion until Section 12.7 is demonstrably satisfied.

---

## 13. Industrial UAT testing battery

### 13.1 Battery purpose and status rules

This is the test-case register for the release candidate identified in Section 1. It converts the execution narrative into stable regression cases. Detailed screen-by-screen observations remain in Section 4; detailed failure evidence and acceptance criteria remain in Section 5.

Status vocabulary:

| Status | Meaning |
|---|---|
| **PASS** | Executed against the identified release candidate and met the asserted result |
| **FAIL** | Executed and produced an application, analytical, accessibility, security, or documentation defect |
| **BLOCKED** | Could not execute because required environment, runtime, device, tool, or permission was unavailable |
| **NOT EXECUTED** | In scope but not run; never equivalent to pass |
| **PARTIAL** | Some assertions or cases passed, but the complete test contract did not |

Parameterized tests are represented by one stable battery ID plus the number of executed cases. The 467 state/national and 108 district query tuples are not expanded into hundreds of repetitive Markdown rows; their dimensions, enumeration rule, assertion set, totals, and failures are recorded below. A future automated evidence artifact should retain the individual tuple result for every case.

### 13.2 Automated source, model, migration, and API battery

#### Composition suite — 11 executed, 11 passed

| Battery ID | Test definition | Expected | UAT result | Status | Related defect/retest note |
|---|---|---|---|---|---|
| BAT-COMP-001 | Explorer contains no hardcoded observations | Visible values originate from approved API/data paths | Source assertion passed | PASS | Retain after all UI refactors |
| BAT-COMP-002 | Every fetch uses the client API layer and failures are not swallowed into defaults | No silent fabricated fallback | Source assertion passed | PASS | Extend for stale-request cancellation |
| BAT-COMP-003 | UI states the honest-gap contract | Missing/suppressed data is explained | Source assertion passed | PASS | Visual states still require E2E |
| BAT-COMP-004 | About explains each learning outcome and ASER assessment task | Beginner can understand construct and task | Source assertion passed | PASS | Persona 7 also reviewed visible content |
| BAT-COMP-005 | Every API route is scoped to the public surface | No private/raw/review records exposed | Source assertion passed | PASS | Add dataset-isolation test |
| BAT-COMP-006 | Migrations create only curated public tables | No raw/staging/audit tables published | Source assertion passed | PASS | Re-evaluate after PostgreSQL migration |
| BAT-COMP-007 | Page includes responsive, colour-scheme, and focus-visible rules | Required CSS contracts exist | Source assertion passed | PASS | Does not prove dark-mode visuals or focus order |
| BAT-COMP-008 | Partial shared link retains defaults rather than coercing absent values to zero | Safe deterministic URL restore | Source assertion passed | PASS | Browser hostile-link journey also passed normal invalid fields |
| BAT-COMP-009 | Partial published data is rendered rather than discarded | One-sided valid data remains visible | Source assertion passed | PASS | Sparse trend behavior still fails BAT-PER-006 |
| BAT-COMP-010 | Dead-end analysis offers a valid route forward | User is not stranded by unavailable analysis | Source assertion passed | PASS | Must preserve actual geography/construct |
| BAT-COMP-011 | Root layout carries site identity | Title/description identity exists | Source assertion passed | PASS | SEO completeness remains open |

#### Data-integrity suite — 19 executed, 19 passed

| Battery ID | Test definition | Expected | UAT result | Status | Retest note |
|---|---|---|---|---|---|
| BAT-DATA-001 | Every observation has source document and page | Zero lineage gaps | Passed | PASS | Add source-record FK/checksum after data-pipeline work |
| BAT-DATA-002 | One observation resolves to exactly one document/page tuple | No ambiguous row lineage | Passed | PASS | UI currently collapses lineage later; see UAT-P0-003 |
| BAT-DATA-003 | Cross-report overlap agrees within permitted rounding | No material conflicting duplicate facts | Passed | PASS | Preserve edition choice in release manifest |
| BAT-DATA-004 | Skill-ladder rungs are exclusive and sum to 100% for every grade/state | All ladders coherent | Passed | PASS | Rerun after database port |
| BAT-DATA-005 | Published Total rows equal 100 exactly | No malformed totals | Passed | PASS | Rerun after ingestion changes |
| BAT-DATA-006 | Cumulative ladder sums reproduce published headline figures | Derived headline agrees with source rows | Passed | PASS | Export must retain derived-row provenance |
| BAT-DATA-007 | Std III arithmetic headline equals subtraction plus division rungs | Internal arithmetic construct coherent | Passed | PASS | Rerun after indicator refactor |
| BAT-DATA-008 | Weighted school-type result lies between government and private values | Weighted value is plausible | Passed | PASS | Does not replace source validation |
| BAT-DATA-009 | Suppressed cells are absent and not zero-filled | No synthetic zero | Passed | PASS | Mandatory invariant |
| BAT-DATA-010 | No duplicate observation at declared grain | Zero duplicate grain groups | Passed | PASS | Add database unique constraint |
| BAT-DATA-011 | Geography labels are canonical | No aliases, headers, or stray whitespace | Passed | PASS | Add stable geography identifiers |
| BAT-DATA-012 | One-sided school-type splits exist and remain available | Published side is not discarded | Passed | PASS | Preserve in comparison UI |
| BAT-DATA-013 | Weighted average can remain when components are suppressed and is citable | Valid ASER-published aggregate retained | Passed | PASS | Preserve source/edition |
| BAT-DATA-014 | Trend series is complete or explicitly sparse and never mixes units | Honest sparsity and one unit per series | Passed | PASS | UI violates presentation expectation for Sikkim |
| BAT-DATA-015 | School-type series is long enough for trend claims | Required historical coverage exists | Passed | PASS | Per-geography sparsity still needs UI handling |
| BAT-DATA-016 | Years are restricted to comparable in-person rounds | Phone rounds excluded | Passed | PASS | Persona trend controls also checked |
| BAT-DATA-017 | District estimates use grade bands and do not masquerade as state series | Construct separation in stored data | Passed | PASS | UI labeling fails UAT-P0-004 |
| BAT-DATA-018 | Every district parent exists as a state geography | Zero orphan parents | Passed | PASS | Add database FK/relationship constraint |
| BAT-DATA-019 | District values remain in plausible state-relative range | No implausible extraction outlier | Passed | PASS | Retain as release invariant |

#### Migration suite — 4 executed, 4 passed

| Battery ID | Test definition | Expected | UAT result | Status | Retest note |
|---|---|---|---|---|---|
| BAT-MIG-001 | Apply full migration chain to a blank database | Clean schema creation and correct release counts | Passed | PASS | Must be rebuilt for PostgreSQL |
| BAT-MIG-002 | No observation lacks lineage, unit, or comparability | Zero required-field gaps | Passed | PASS | Add database constraints |
| BAT-MIG-003 | Districts have parents; state/national rows do not | Geography relationship invariant holds | Passed | PASS | Add negative insertion tests |
| BAT-MIG-004 | School-type trends span 2012–2024 with boundary-consistent states | Comparable round and boundary contract holds | Passed | PASS | Retain after data-pipeline regeneration |

#### Question-model suite — 7 executed, 7 passed

| Battery ID | Test definition | Expected | UAT result | Status | Related defect/retest note |
|---|---|---|---|---|---|
| BAT-QM-001 | Hostile question fields normalize to a published combination | Total normalizer; no undefined/NaN state | Passed | PASS | Parent/geography relationship is not covered; UAT-P1-006 |
| BAT-QM-002 | Phone-based rounds cannot be selected | 2020/2021 unreachable | Passed | PASS | Preserve |
| BAT-QM-003 | School-type questions collapse to published grades/rung | Only valid school-type construct | Passed | PASS | Preserve |
| BAT-QM-004 | Earlier rounds collapse to headline grades; 2024 keeps full grade choice | Year/grade availability contract | Passed | PASS | Preserve |
| BAT-QM-005 | Bottom rung has no “at least” interpretation | Correct question grammar | Passed | PASS | Preserve |
| BAT-QM-006 | Normalization is idempotent | Normalized question is fixed point | Passed | PASS | Extend to parent/geography pair |
| BAT-QM-007 | Malformed API rows are rejected by value guards | No malformed row reaches UI | Passed | PASS | Extend lineage shape after refactor |

#### Live API contract suite — 9 executed, 9 passed against `localhost:3001`

| Battery ID | Test definition | Expected | UAT result | Status | Limitation/retest note |
|---|---|---|---|---|---|
| BAT-API-001 | Metadata exposes catalogue without private columns | Public metadata only | Passed | PASS | Rerun against Vercel Preview/Production |
| BAT-API-002 | Metadata is complete and self-checking | Coverage/construct/source/integrity manifest coherent | Passed | PASS | District count wording requires correction |
| BAT-API-003 | Districts cannot leak through an unscoped state query | Districts only through valid parented district context | Passed | PASS | Does not validate forged parent relationship |
| BAT-API-004 | Malformed parameters are rejected rather than silently defaulted | Typed 400 for defined invalid cases | Passed | PASS | Oversized and membership inputs still fail broader contract |
| BAT-API-005 | Well-formed unpublished combination returns empty, not substitute data | Honest no-data response | Passed | PASS | UI sparse-series substitution still fails |
| BAT-API-006 | Every served row carries full lineage | URL/page/unit/comparability present | Passed | PASS | Client transformation later loses it |
| BAT-API-007 | API CSV matches JSON rows | Exact row/value/lineage parity for covered cut | Passed | PASS | District route parity fails exhaustive battery |
| BAT-API-008 | Trends refuse non-comparable series | No misleading mixed-comparability trend | Passed | PASS | Sparse comparable series presentation still fails |
| BAT-API-009 | Responses are cacheable and contain no user data | Cache header present; no cookies/private fields | Passed | PASS | Production CDN/cache/security behavior untested |

#### Static quality and build checks

| Battery ID | Test definition | Expected | Observed | Status | Related defect |
|---|---|---|---|---|---|
| BAT-QUAL-001 | ESLint over repository excluding generated build directories | Zero lint errors | Passed | PASS | Rerun in clean CI |
| BAT-QUAL-002 | Standalone `tsc --noEmit --incremental false` | Zero type errors | Missing `cloudflare:workers`, `Fetcher`, and `D1Database` types | FAIL | UAT-P2-015 |
| BAT-QUAL-003 | Production build of tested working tree | Successful immutable production build | Not run because it would rewrite generated repository artifacts under the one-file UAT restriction | NOT EXECUTED | Mandatory after fixes |
| BAT-QUAL-004 | Production dependency advisory audit | Zero critical/high production vulnerabilities | Later production-readiness audit found three high-severity groups | FAIL | SUPPLY-P0-001 |
| BAT-QUAL-005 | Deterministic clean dependency tree | One lockfile and no extraneous/mismatched root state | Dual lockfiles and inconsistent local npm tree | FAIL | SUPPLY-P0-001 |

### 13.3 Exhaustive combination and reconciliation battery

#### Enumeration method

For state/national coverage, the UAT read all 467 combinations advertised by `/api/metadata` availability. Each tuple contains indicator, domain, year, subgroup, and geography type. For each tuple, the UAT called Explorer, Lineage, and API CSV and applied the assertions below.

For district coverage, the UAT enumerated 27 parent states × 4 district learning indicators = 108 explicitly parented district cuts. Explorer, Lineage, and API CSV were compared for every cut.

| Battery ID | Parameterized assertion | Executed cases | Expected | Observed | Status | Related defect |
|---|---|---:|---|---|---|---|
| BAT-ENUM-001 | Advertised state/national Explorer cut is non-empty | 467 | 467 non-empty | 467 non-empty | PASS | — |
| BAT-ENUM-002 | State/national Explorer rows are descending by numeric value | 467 | All ordered | All ordered | PASS | — |
| BAT-ENUM-003 | State/national values use percent and remain 0–100 | 467 | All valid | All valid | PASS | — |
| BAT-ENUM-004 | Every state/national row contains source URL and page | 467 | Complete lineage fields | Complete API row fields | PASS | Client/UI still collapses per-row lineage |
| BAT-ENUM-005 | State/national Lineage count matches Explorer count | 467 | 467 matches | 467 matches | PASS | — |
| BAT-ENUM-006 | State/national API CSV count matches Explorer count | 467 | 467 matches | 467 matches | PASS | Client-generated CSV remains defective |
| BAT-ENUM-007 | District Explorer cut is non-empty | 108 | 108 non-empty | 108 non-empty; 2,343 returned rows across four measures | PASS | — |
| BAT-ENUM-008 | District Lineage count matches Explorer | 108 | 108 matches | 0 matches; every Lineage response empty | FAIL | UAT-P0-002 |
| BAT-ENUM-009 | District API CSV count matches Explorer | 108 | 108 matches | 0 matches; every CSV contained header only | FAIL | UAT-P0-002 |
| BAT-ENUM-010 | Source-document URL is reachable | 29 URLs | 29 reachable | 29 successful HTTP statuses | PASS | Page content not manually re-audited |

Parameterized totals:

- state/national advertised combinations executed: **467**;
- district cuts executed: **108**;
- district rows returned by the four tested learning cuts: **2,343**;
- district Lineage parity failures: **108**;
- district API CSV parity failures: **108**;
- total district parity failures: **216**;
- source URLs checked: **29**.

### 13.4 Direct database battery

| Battery ID | Database check | Expected | Observed | Status | Related work |
|---|---|---|---|---|---|
| BAT-DB-001 | SQLite `PRAGMA integrity_check` | `ok` | `ok` | PASS | Rerun on migrated PostgreSQL equivalent |
| BAT-DB-002 | Total rows equal unique IDs | No primary-key duplication | 12,552 rows; 12,552 IDs | PASS | Add grain unique constraint |
| BAT-DB-003 | Geography-type row counts | Match release manifest | 8,901 state; 132 national; 3,519 district | PASS | Release manifest needed |
| BAT-DB-004 | Source-document count | Match declared release | 29 distinct source URLs | PASS | Structured source table needed |
| BAT-DB-005 | Dataset namespace | Current release contains only ASER | 12,552 `aser` rows | PASS | APIs must add explicit dataset scope |
| BAT-DB-006 | Units | Current measures all percentages | 12,552 percent rows | PASS | Add DB constraint |
| BAT-DB-007 | Comparability categories | Only approved categories | 8,925 directly comparable; 3,627 caveated | PASS | Add DB constraint |
| BAT-DB-008 | Observation year envelope | Comparable release rounds only | 2012–2024, with allowed sparse rounds | PASS | Existing year invariant passed |
| BAT-DB-009 | District parent coverage | All district rows parented across 27 states | Zero missing parent; 27 parents | PASS | Add relationship constraint |
| BAT-DB-010 | Non-district parent leakage | State/national parent must be null | Zero unexpected parent rows | PASS | Add constraint |
| BAT-DB-011 | Duplicate declared-grain groups | Zero | Zero | PASS | Enforce in schema |
| BAT-DB-012 | District measure completeness distribution | Suppressions remain visible as absence | 583 districts have six measures; one has five; four have four | PASS | README’s “583 districts” claim is incomplete |
| BAT-DB-013 | Distinct districts with any data | Accurately documented | 588 | FAIL | Documentation/metadata reconciliation required |
| BAT-DB-014 | Query-plan use of primary filter index | Filter index used | Used for inspected state/district Explorer queries | PASS | SQLite used temporary B-tree for ordering |

### 13.5 Persona-led visible-journey battery

The exact action sequence and visible observation after every action are in Section 4.

| Battery ID | Persona/journey | Primary goal | Final result | Status | Defects |
|---|---|---|---|---|---|
| BAT-PER-001 | First-time policy analyst | Understand latest Std III rural-India reading | Main ranking/trend understandable; ladder silently switched to Himachal and ranking source page was not per row | FAIL | UAT-P0-003, UAT-P0-004 |
| BAT-PER-002 | State education officer | Understand Bihar’s rank, trajectory, and districts | Bihar state view worked until opening a district crashed the application | FAIL | UAT-P0-001 |
| BAT-PER-003 | District education officer | Compare Aurangabad with Bihar peers | Direct URL loaded, but ranking duplicated, terminology wrong, anchor/construct mislabeled, and Lineage/CSV empty | FAIL | UAT-P0-002, UAT-P0-004, UAT-P1-008, UAT-P2-012 |
| BAT-PER-004 | Foundational-learning programme lead | Locate reading/arithmetic bottleneck | Arbitrary rung silently changed analysis to Mizoram while claiming rural India was constant | FAIL | UAT-P0-004 |
| BAT-PER-005 | Researcher/evaluator | Reproduce shared link and cite/export result | Normal URLs restored; forged parent accepted; UI/client export lineage unreliable | FAIL | UAT-P0-003, UAT-P1-006 |
| BAT-PER-006 | Journalist | Make a defensible trend claim | Trend-year floor worked; sparse Sikkim series silently became India-only | FAIL | UAT-P1-005, UAT-P0-003 |
| BAT-PER-007 | Beginner/teacher/parent | Understand ASER tasks, constructs, and limits | About content clear and state preserved; tab semantics incomplete | PARTIAL | UAT-P2-013 |
| BAT-PER-008 | Presentation/reporting user | Reuse complete, citable CSV/PNG | Static path inspection proved missing/wrong lineage and silent PNG truncation | FAIL | UAT-P0-003, UAT-P1-009 |
| BAT-PER-009 | Keyboard/screen-reader/low-vision user | Complete journey without pointer/colour/chart vision | DOM strengths found; contrast failed; actual keyboard/screen-reader certification blocked | PARTIAL | UAT-P1-010, UAT-P2-013 |
| BAT-PER-010 | Impatient/adversarial user | Expose stale, unsafe, or contradictory state | SQL binding held; stale district transition crashed; forged parent and oversized input accepted; headers absent | FAIL | UAT-P0-001, UAT-P1-006, UAT-P1-011, UAT-P2-016 |

### 13.6 Responsive and visual-layout battery

| Battery ID | Viewport/state | Expected | Observed | Status | Limitation |
|---|---|---|---|---|---|
| BAT-VIEW-001 | 1440×900 default analysis | Two-column layout; no horizontal overflow/off-screen controls | Met | PASS | Chromium only |
| BAT-VIEW-002 | 1024×768 default analysis | Two-column layout; no horizontal overflow/off-screen controls | Met | PASS | Chromium only |
| BAT-VIEW-003 | 768×1024 default analysis | One-column layout; no horizontal overflow/off-screen controls | Met | PASS | Chromium only |
| BAT-VIEW-004 | 390×844 default analysis | One-column mobile layout; no horizontal overflow/off-screen controls | Met | PASS | Chromium emulation, not real mobile browser |
| BAT-VIEW-005 | 375×667 default analysis | One-column narrow-mobile layout; no horizontal overflow/off-screen controls | Met | PASS | Chromium emulation, not real mobile browser |
| BAT-VIEW-006 | District page at mobile width | No horizontal overflow | Met, but duplicate rankings created 76 district buttons and excessive vertical interaction | PARTIAL | UAT-P1-008 |
| BAT-VIEW-007 | Touch-target measurement | Primary controls meet adopted target policy | Many controls measured approximately 24–32 px rather than preferred 44 px | FAIL | UAT-P2-014 |
| BAT-VIEW-008 | Dark-mode visual inspection | All surfaces legible and semantically consistent | Not visually executed | NOT EXECUTED | CSS presence is not visual proof |
| BAT-VIEW-009 | 200% browser zoom | No content loss/overlap and primary task remains operable | Not executed | NOT EXECUTED | Mandatory post-fix |
| BAT-VIEW-010 | 400% browser zoom/reflow | WCAG reflow and operability | Not executed | NOT EXECUTED | Mandatory post-fix |
| BAT-VIEW-011 | Landscape mobile/tablet | Correct responsive layout and controls | Not executed | NOT EXECUTED | Mandatory post-fix |
| BAT-VIEW-012 | Reduced motion/high contrast | Usable visual state | Not executed | NOT EXECUTED | Mandatory post-fix |

### 13.7 Accessibility battery

| Battery ID | Accessibility assertion | Expected | Observed | Status | Related defect/limitation |
|---|---|---|---|---|---|
| BAT-A11Y-001 | One `main` landmark | Exactly one | One | PASS | — |
| BAT-A11Y-002 | Navigation landmark | Present and named by context | One `nav` | PASS | — |
| BAT-A11Y-003 | Page H1 | One descriptive H1 | None | FAIL | UAT-P2-013 |
| BAT-A11Y-004 | Form-control names | Every select has accessible name | All inspected selects named | PASS | Actual screen-reader phrasing unverified |
| BAT-A11Y-005 | Button names | Every button has accessible name | All inspected buttons named | PASS | — |
| BAT-A11Y-006 | Image names/alternatives | Images are named appropriately | All inspected images named | PASS | Generated PNG accessibility handled through tables |
| BAT-A11Y-007 | Data-table captions | Every fallback table describes its data | Captions present | PASS | Error/empty states still need deployed testing |
| BAT-A11Y-008 | Duplicate DOM IDs | None | None found | PASS | — |
| BAT-A11Y-009 | Chart table fallback | Every inspected normal chart has tabular values | Present in tested normal states | PASS | Failure/loading states require retest |
| BAT-A11Y-010 | Tab semantics | `tablist`/`tab`/`tabpanel`, relationships, and keyboard pattern complete | No `tabpanel`, `aria-controls`, or roving tabindex | FAIL | UAT-P2-013 |
| BAT-A11Y-011 | Visible focus CSS | Keyboard focus visibly styled | `:focus-visible` rule present | PASS | Source inspection only |
| BAT-A11Y-012 | Actual keyboard traversal | Logical order, visible focus, no trap, full primary journey | Synthetic Tab control did not move focus; certification unavailable | BLOCKED | Must run manually/with suitable browser control |
| BAT-A11Y-013 | Light secondary text contrast | WCAG AA for normal text | 3.10:1 on white; 2.87:1 on paper | FAIL | UAT-P1-010 |
| BAT-A11Y-014 | Dark secondary text contrast | WCAG AA for normal text | Calculated 4.16:1 on dark card | FAIL | UAT-P1-010; below 4.5:1 |
| BAT-A11Y-015 | Accent text contrast | WCAG AA for normal text | 3.32:1 on white | FAIL | UAT-P1-010 |
| BAT-A11Y-016 | VoiceOver/Safari primary journey | Complete without mouse/vision | Not available | BLOCKED | Required real-runtime test |
| BAT-A11Y-017 | NVDA/Chrome and NVDA/Firefox primary journey | Complete without mouse/vision | Not available | BLOCKED | Required Windows test |
| BAT-A11Y-018 | TalkBack/Android Chrome primary journey | Complete without vision | Not available | BLOCKED | Required Android test |

### 13.8 Security, hostile-input, and reliability battery

| Battery ID | Test/input | Expected | Observed | Status | Related defect |
|---|---|---|---|---|---|
| BAT-SEC-001 | SQL-like profile geography | Parameterized empty/no-data response; no disclosure | Binding held; no SQL error/disclosure | PASS | — |
| BAT-SEC-002 | SQL-like trend geography/indicator | Parameterized empty/no-data response | Binding held | PASS | — |
| BAT-SEC-003 | UNION-like Explorer indicator | No injection or disclosure | Binding held | PASS | — |
| BAT-SEC-004 | Spreadsheet-formula-like subgroup | No command execution or server error | Treated as data | PASS | CSV formula-safety policy still needs explicit test |
| BAT-SEC-005 | 10,000-character indicator | Bounded typed 4xx without large reflection/query cost | Accepted and echoed in approximately 10 KB response | FAIL | UAT-P2-016 |
| BAT-SEC-006 | Standard hostile shared URL fields | Explicit safe normalization; no script execution/NaN/undefined | Recovered to default with warning and safe URL | PASS | — |
| BAT-SEC-007 | Forged `geo=Bihar&parent=Atlantis` relationship | Reject or normalize with explicit warning | Accepted contradictory state; “Districts of Atlantis” | FAIL | UAT-P1-006 |
| BAT-SEC-008 | District click while state cut mounted | Safe transition; latest context only | Full-page crash and duplicate-key warning | FAIL | UAT-P0-001 |
| BAT-SEC-009 | Public API cookies/private user state | None | None observed | PASS | Rerun on Vercel |
| BAT-SEC-010 | Cacheability | Appropriate public caching | Public cache headers observed | PASS | Production CDN key/staleness unverified |
| BAT-SEC-011 | CSP | Present and effective | Absent | FAIL | UAT-P1-011 |
| BAT-SEC-012 | `X-Content-Type-Options` | `nosniff` | Absent | FAIL | UAT-P1-011 |
| BAT-SEC-013 | `Referrer-Policy` | Restrictive approved value | Absent | FAIL | UAT-P1-011 |
| BAT-SEC-014 | `Permissions-Policy` | Restrictive approved value | Absent | FAIL | UAT-P1-011 |
| BAT-SEC-015 | HSTS on deployed HTTPS | Approved production value | No deployed HTTPS environment | BLOCKED | UAT-P1-011 |
| BAT-SEC-016 | Framing/opener isolation policy | Approved CSP/COOP behavior | Absent in inspected local/generated headers | FAIL | UAT-P1-011 |
| BAT-SEC-017 | Controlled database outage | Honest stable 503 and recoverable UI | Not executed | NOT EXECUTED | Mandatory |
| BAT-SEC-018 | Delayed/raced API responses | Latest intent wins; stale responses discarded | Natural transition exposed stale-state crash, but controlled interception unavailable | PARTIAL | UAT-P0-001, UAT-P1-007 |
| BAT-SEC-019 | Malformed JSON/API payload | Safe typed client error and retained last confirmed state | Not executed | NOT EXECUTED | Mandatory |
| BAT-SEC-020 | Offline/mobile-network recovery | Clear state and successful retry | Not executed | NOT EXECUTED | Mandatory |
| BAT-SEC-021 | Sustained concurrent load | Meet agreed error/latency budget | Not executed | NOT EXECUTED | Mandatory production qualification |
| BAT-SEC-022 | Production dependency audit | No high/critical production advisories | Three high-severity production groups found | FAIL | SUPPLY-P0-001 |
| BAT-SEC-023 | Repository/history high-signal secret pattern scan | No committed credential pattern | No high-signal match observed in inspected history | PASS | GitHub secret scanning/push protection still required |

### 13.9 Local performance battery

Each route received 30 sequential warm local-development requests. These results demonstrate only local response behavior; they are not production latency, concurrency, Core Web Vitals, cold-start, or global-network certification.

| Battery ID | Route | Samples | Expected provisional result | Observed p50 / p95 / max | Errors | Status |
|---|---|---:|---|---|---:|---|
| BAT-PERF-001 | `/api/metadata` | 30 | Stable local response without errors | 42.0 / 131.8 / 133.6 ms | 0 | PASS |
| BAT-PERF-002 | Representative state Explorer | 30 | Stable local response without errors | 4.9 / 11.7 / 28.3 ms | 0 | PASS |
| BAT-PERF-003 | Bihar district Explorer | 30 | Stable local response without errors | 5.2 / 7.6 / 8.7 ms | 0 | PASS |
| BAT-PERF-004 | `/` HTML | 30 | Stable local response without errors | 14.6 / 38.7 / 66.5 ms | 0 | PASS |
| BAT-PERF-005 | Concurrent/burst API load | Agreed p95/error budget | Not executed | — | — | NOT EXECUTED |
| BAT-PERF-006 | Production cold start and regional latency | Agreed p95/error budget | No Vercel environment | — | — | BLOCKED |
| BAT-PERF-007 | Browser Core Web Vitals/Lighthouse | Agreed mobile/desktop budgets | Not executed | — | — | NOT EXECUTED |
| BAT-PERF-008 | CDN cache hit, invalidation, compression, and release skew | Correct cache behavior | No production CDN | — | — | BLOCKED |

### 13.10 Cross-surface analytical reconciliation battery

| Battery ID | Surfaces compared | Expected | Observed | Status | Related defect |
|---|---|---|---|---|---|
| BAT-REC-001 | Valid question controls ↔ URL ↔ reload | Exact restored valid question | Passed for inspected normal links | PASS | — |
| BAT-REC-002 | Invalid URL ↔ normalized controls/message | Explicit safe recovery | Standard invalid fields passed; forged parent failed | PARTIAL | UAT-P1-006 |
| BAT-REC-003 | Ranking values ↔ Explorer API | Exact equality | Passed in inspected state/national and direct district views | PASS | District click transition fails |
| BAT-REC-004 | Ranking visual ↔ ranking table | Same rows/values/order | Passed where page loaded | PASS | District ranking duplicated as a second surface |
| BAT-REC-005 | State/national Explorer ↔ Lineage | Equal rows/values/source | 467/467 cuts passed | PASS | — |
| BAT-REC-006 | District Explorer ↔ Lineage | Equal rows/values/source | 0/108 cuts passed | FAIL | UAT-P0-002 |
| BAT-REC-007 | State/national Explorer ↔ API CSV | Equal rows/values/lineage | 467/467 cuts passed | PASS | — |
| BAT-REC-008 | District Explorer ↔ API CSV | Equal rows/values/lineage | 0/108 cuts passed | FAIL | UAT-P0-002 |
| BAT-REC-009 | UI ranking source ↔ every ranked row | Per-row exact page/source | UI collapsed multi-page state ranking to one page | FAIL | UAT-P0-003 |
| BAT-REC-010 | Trend values ↔ trends API | Same selected geography/points | Complete inspected series passed; sparse Sikkim presentation substituted India | PARTIAL | UAT-P1-005 |
| BAT-REC-011 | Trend visible source/export ↔ every point | Per-point edition/page retained | One source/page or no source fields | FAIL | UAT-P0-003 |
| BAT-REC-012 | Comparison scope ↔ question/holding-constant | Same geography, population, construct | National rung and district anchor cases disagreed | FAIL | UAT-P0-004 |
| BAT-REC-013 | Client ranking CSV ↔ visible/API rows | Complete exact values and lineage | One global page/source assigned to all rows | FAIL | UAT-P0-003 |
| BAT-REC-014 | Client trend/comparison CSV ↔ visible/API rows | Complete exact values and per-point lineage | Source URL/page omitted | FAIL | UAT-P0-003 |
| BAT-REC-015 | PNG row set ↔ visible row set | Complete or explicitly disclosed pagination | Bar exports silently slice to 16 | FAIL | UAT-P1-009 |
| BAT-REC-016 | Source links ↔ reachable documents | Every distinct URL resolves | 29/29 URLs reachable | PASS | Exact PDF page content not manually re-audited |
| BAT-REC-017 | Source PDF page ↔ quoted database cell | Exact manual visual match for release sample | Not re-audited in this session | NOT EXECUTED | Required golden-set review |

### 13.11 Explicitly blocked or unexecuted qualification battery

These cases are part of the production battery and must remain open:

| Battery ID | Required qualification | Current status | Unblocking requirement |
|---|---|---|---|
| BAT-ENV-001 | Vercel Preview smoke | BLOCKED | Native Vercel application and Preview URL |
| BAT-ENV-002 | Vercel Production smoke | BLOCKED | Approved production deployment |
| BAT-ENV-003 | Production database migration/rollback | BLOCKED | Vercel-compatible database and migration procedure |
| BAT-ENV-004 | Production backup restore | BLOCKED | Backup policy/provider and isolated restore target |
| BAT-ENV-005 | Production security headers/CDN | BLOCKED | HTTPS deployment |
| BAT-ENV-006 | Production observability/alert drill | BLOCKED | Monitoring and owner routing |
| BAT-BROW-001 | Real macOS Safari primary journeys | BLOCKED | Safari runtime or device farm |
| BAT-BROW-002 | Real Firefox primary journeys | BLOCKED | Firefox runtime |
| BAT-BROW-003 | Real iOS Safari primary journeys | BLOCKED | Physical device/simulator/device farm |
| BAT-BROW-004 | Real Android Chrome primary journeys | BLOCKED | Physical device/emulator/device farm |
| BAT-BROW-005 | Browser download and binary PNG inspection | BLOCKED | Download-capable automation and approved evidence location |
| BAT-SR-001 | VoiceOver/Safari | BLOCKED | macOS/iOS assistive-technology session |
| BAT-SR-002 | NVDA/Chrome and Firefox | BLOCKED | Windows/NVDA session |
| BAT-SR-003 | TalkBack/Android Chrome | BLOCKED | Android/TalkBack session |
| BAT-FAIL-001 | Controlled database outage | NOT EXECUTED | Safe outage/interception harness |
| BAT-FAIL-002 | Delayed and out-of-order API responses | NOT EXECUTED | Request interception/fault harness |
| BAT-FAIL-003 | Malformed response payloads | NOT EXECUTED | Response interception/fault harness |
| BAT-FAIL-004 | Offline and reconnection | NOT EXECUTED | Browser network emulation/real mobile session |
| BAT-LOAD-001 | Sustained concurrency and burst | NOT EXECUTED | Staging environment, limits, and approved load window |
| BAT-DARK-001 | Full dark-mode visual regression | NOT EXECUTED | Browser screenshot/visual regression matrix |
| BAT-ZOOM-001 | 200%/400% zoom and reflow | NOT EXECUTED | Suitable browser/manual accessibility session |
| BAT-LEGAL-001 | Public-code/data rights review | BLOCKED | DEC-001–003 owner/legal decisions |

### 13.12 Battery summary

This register uses different units, so totals must not be collapsed into one misleading “tests passed” number:

- **50 named automated cases were executed during UAT:** 41 non-live cases and 9 live API-contract cases;
- the 41 non-live cases passed;
- the 9 live API-contract cases passed against `localhost:3001`;
- **467** parameterized state/national availability tuples passed Explorer/Lineage/API-CSV reconciliation;
- **108** parameterized district tuples returned Explorer data;
- those 108 district tuples produced **216** reconciliation failures across Lineage and API CSV;
- **10** persona journeys were executed: none supports an unconditional release pass; Persona 7 was a functional pass with an accessibility defect;
- **5** responsive viewport configurations were executed in Chromium without horizontal overflow;
- local latency sampled **30 requests × 4 routes = 120 requests**, with zero request errors;
- **29** distinct source URLs were checked and reachable;
- direct database integrity and release-shape checks passed, while the documented district count was found incomplete;
- actual cross-browser, real-mobile, screen-reader, production, outage, load, dark-mode visual, zoom/reflow, and recovery qualification remains blocked or unexecuted as explicitly listed.

### 13.13 Regression execution requirements

For the next release candidate:

1. execute every named automated case without skips;
2. retain an individual machine-readable result for every one of the 467 state/national tuples;
3. retain an individual machine-readable result for every supported district parent × indicator tuple;
4. rerun every failed and partial battery ID;
5. execute every blocked/unexecuted item made possible by the new staging/production infrastructure;
6. record browser, version, OS, device, viewport, colour mode, assistive technology, URL, commit, data release, timestamp, expected, observed, and evidence for each manual case;
7. link every failure to a stable defect ID;
8. publish pass/fail/blocked/skip counts separately;
9. treat an unavailable dependency or test environment as blocked, not passed;
10. attach the complete battery result to the GitHub/Vercel release evidence pack described in Section 12.6.

**Testing-battery release gate:** production remains blocked until every P0/P1-linked battery case passes and all mandatory browser, mobile, assistive-technology, security, database, data-lineage, export, deployment, backup, recovery, and operational cases have evidence.

---

## 14. Open-source repository, source bundle, and clone-to-analysis specification

### 14.1 Production objective and current verdict

The public GitHub repository must work as both an application repository and a trustworthy, reproducible ASER analysis package. A new user should be able to discover the project, understand its scope, download a versioned data release, trace a value to its official source and page, run analysis without the web application, run the application locally, deploy a fork, and contribute a correction without undocumented maintainer knowledge.

The repository should contain direct links and, where legally permitted, the source PDFs and page-aware `.md` derivatives needed for audit and reproduction. Public availability does not itself establish redistribution permission: ASER’s current notice states that its material is copyrighted and “All Rights Reserved.” PDFs must therefore be bundled only with confirmed licence or written permission. Where permission is absent or unclear, provide official download links, SHA-256 checksums, retrieval metadata, exact page mappings, and a deterministic download/verification workflow instead of copying the files into Git history.

Authoritative implementation references:

- [ASER 2024 official report hub](https://asercentre.org/aser-2024/)
- [ASER Centre privacy/copyright notice](https://asercentre.org/privacy-guidelines/)
- [GitHub: About Git Large File Storage](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage)
- [GitHub: Collaborating with Git LFS](https://docs.github.com/en/repositories/working-with-files/managing-large-files/collaboration-with-git-large-file-storage)
- [GitHub: Git LFS objects in repository archives](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/managing-git-lfs-objects-in-archives-of-your-repository)
- [GitHub: About releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases)
- [GitHub: Managing releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [Vercel: `.vercelignore`](https://vercel.com/docs/deployments/vercel-ignore)
- [Vercel: Builds](https://vercel.com/docs/builds)
- [Vercel: Platform limits](https://vercel.com/docs/limits)

**Observed current gap:** this repository does not yet contain a complete source-PDF package, machine-readable source manifest, deterministic source acquisition/extraction workflow, or verified clone-to-analysis path. This is a release-readiness gap, not proof that current observations are wrong.

### 14.2 Repository user and use-case matrix

| Persona | First repository task | Required artifact or link | Acceptance criterion |
|---|---|---|---|
| Casual evaluator | Decide whether the project is credible | README with purpose, live app, coverage, methodology, sources, limitations, licence, and latest release | Key project identity and links are understandable within two minutes |
| Researcher/evaluator | Reproduce a chart and audit its source | Versioned data, query example, source manifest, page map, official PDF/link, validation report | Sampled UI value independently reproduces and traces to document, page, table, row, column, unit, and subgroup |
| Python analyst | Load and analyse observations | CSV, Parquet, data dictionary, Python example | Clean environment reproduces documented row counts and key results |
| R analyst | Analyse state/district trends | CSV/Parquet and R example | Example runs from a clean clone against a named release |
| SQL/BI analyst | Query data offline | Portable SQLite/DuckDB-compatible snapshot or importable schema/data | Queries require no production database or secret |
| Excel analyst | Open a clean public table | UTF-8 CSV, dictionary, null rules, spreadsheet-safety notes | Characters and identifiers remain intact; untrusted formulas do not execute |
| Journalist | Verify and cite a headline/ranking | Stable share URL, data subset, source page, citation, immutable release | Published number remains reproducible and caveats remain visible |
| Policy/state officer | Compare states correctly | State example, rural-scope caveat, definitions, comparability notes | User cannot mistake rural estimates for all-population, urban, administrative, or causal measures |
| District officer | Find available district data | Coverage matrix, years, boundary/name notes, parent-state query, page map | Missing combinations are explicit and never rendered as zero |
| Teacher/parent/beginner | Understand an indicator | Plain-language glossary, FAQ, reading guide, live-app link | Population, denominator, grade/age basis, subgroup, unit, and limits are clear |
| API consumer | Build a downstream integration | Versioned API reference, schemas, examples, error/rate/change policy | Copy-paste examples work and invalid input returns documented safe errors |
| App contributor | Run and test locally | Prerequisites, `.env.example`, install/run/test commands, architecture, contribution guide | Fresh clone reaches a representative passing smoke test without private inputs |
| Data contributor | Report/correct a value | Data issue template requiring release, record key, expected value, source/page, evidence | Maintainer can reproduce and adjudicate without private conversation |
| Documentation contributor | Add/fix docs | Docs map, style/link rules, preview and validation commands | Contributor validates content before PR |
| Maintainer/release manager | Publish a release | Versioning, deterministic build, checksums, validation, changelog, rollback | Assets derive from a tag, are verified, immutable, and linked |
| Fork/Vercel operator | Deploy independently | Deployment guide, env inventory, DB migration/seed, security/cost/limits | Fork deploys without maintainer secrets, hard-coded domains, or undocumented services |
| Browser/accessibility tester | Repeat platform qualification | Browser/device/viewport/AT matrix and exact scripts | Real-engine/device evidence exists; Chromium emulation is not represented as Safari or screen-reader coverage |
| Security researcher | Report privately | `SECURITY.md`, supported versions, private channel, response policy | Vulnerability need not be disclosed publicly |
| Archivist/citation steward | Preserve a historical result | Tags, releases, checksums, citation metadata, source/data mapping | Exact code, data, schema, docs, and sources remain identifiable |
| Educator/tutorial author | Teach ASER analysis | Curated examples, notebooks, glossary, expected outputs, attribution | Examples distinguish demonstration data from complete data |
| Downstream package author | Depend on stable fields | Machine-readable schema, canonical IDs, semantic versioning, deprecation policy | Breaking changes have a major-version or documented migration path |
| Low-connectivity/offline user | Analyse after one download | Documentation bundle, CSV/Parquet/portable DB, checksums, local examples | Core analysis works without network after initial download |

### 14.3 Required target repository structure

This is a target specification for Claude’s implementation plan, not a claim that all files currently exist.

```text
/
├── README.md
├── LICENSE
├── DATA_LICENSE.md
├── NOTICE.md
├── CITATION.cff
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── CHANGELOG.md
├── GOVERNANCE.md
├── ROADMAP.md
├── .env.example
├── .vercelignore
├── app/
├── db/
│   ├── schema/
│   ├── migrations/
│   ├── seeds/
│   └── README.md
├── data/
│   ├── README.md
│   ├── schema.json
│   ├── data-dictionary.csv
│   ├── source-map.csv
│   └── releases/                 # Small files; large immutable assets may be GitHub Releases
├── sources/
│   ├── README.md
│   ├── manifest.yaml
│   ├── checksums.sha256
│   ├── page-map.csv
│   ├── pdf/                      # Only documents with confirmed redistribution rights
│   └── markdown/                 # Permitted, page-aware derivatives with provenance headers
├── docs/
│   ├── quickstart.md
│   ├── architecture.md
│   ├── api.md
│   ├── data-model.md
│   ├── data-dictionary.md
│   ├── methodology.md
│   ├── source-lineage.md
│   ├── suppression-and-missingness.md
│   ├── district-coverage.md
│   ├── database.md
│   ├── deployment-vercel.md
│   ├── accessibility.md
│   ├── browser-support.md
│   ├── privacy.md
│   └── runbooks/
├── examples/
│   ├── python/
│   ├── r/
│   ├── sql/
│   ├── curl/
│   └── notebooks/
├── scripts/
│   ├── bootstrap
│   ├── download-sources
│   ├── verify-sources
│   ├── extract-sources
│   ├── validate-data
│   ├── build-data-release
│   ├── seed-database
│   └── smoke-test
├── tests/
└── .github/
    ├── workflows/
    ├── ISSUE_TEMPLATE/
    ├── PULL_REQUEST_TEMPLATE.md
    ├── CODEOWNERS
    └── dependabot.yml
```

Repository rules:

1. README is the public map, not the only documentation file.
2. Application code, source documents, normalized data, release artifacts, and the production database are distinct layers with explicit lineage.
3. Never commit production credentials, real `.env` values, private connection strings, operational database dumps, Vercel tokens, or source-acquisition credentials.
4. Use GitHub Releases or another durable distribution origin for large immutable binaries. If Git LFS is chosen, document installation and test both clone and archive behaviour because users without LFS may receive pointer files.
5. Use `.vercelignore` to keep source PDFs, notebooks, raw extracts, portable database snapshots, caches, and unrelated documentation artifacts out of Vercel’s upload unless required at runtime.
6. Generated files must identify their generator and must not be hand-edited.
7. Every example must pin or identify its data release.

### 14.4 Source PDF, link, and Markdown policy

| Source rights state | Repository treatment | Required user experience |
|---|---|---|
| Explicit redistribution licence/written permission | Bundle unchanged PDF in an appropriate release asset or justified Git LFS; record permission, official URL, checksum, retrieval date | Bootstrap/release download obtains a verified local copy |
| Public official download but unclear redistribution rights | Do not commit PDF; record official landing/direct URLs, checksum, date, page count/map, and deterministic download/verify command | One documented step obtains the official file and verifies it |
| Login, acceptance, or manual download required | Do not bypass controls; provide exact acquisition, placement, and verification steps | Workflow pauses clearly and resumes after authorised user action |
| Withdrawn/replaced source | Preserve lawful metadata/checksum; link successor and record supersession | Historical release remains interpretable without presenting the old source as current |
| Cannot be redistributed or fetched automatically | Provide citation, official page, table/page map, rights note, limitation | Audit path exists and lack of full automated rebuild is explicit |

Every `sources/manifest.yaml` record must include:

- Permanent `source_id`, title, publisher, edition, publication date, and language.
- Official landing page and stable direct-download URL, if available.
- Bundled path or immutable release-asset URL when redistribution is permitted.
- Rights holder, licence/permission basis and URL/reference, redistribution status.
- Retrieval timestamp, filename, byte size, SHA-256, MIME type, and page count.
- Report page labels versus PDF page indices, tables/pages used, extraction method/version/status.
- Geography, year, indicator family, subgroup, sampling scope, exclusions, errata, and supersession.

`sources/page-map.csv` must map each observation, or defensible observation group, to `source_id`, report page label, PDF index, table/figure, row, column, footnote, and verification status.

Page-aware Markdown is valuable because it is searchable, diffable, accessible to basic tools, and easy for coding agents to inspect, but it is not an unqualified substitute for the authoritative PDF. Each `.md` derivative must:

- Include front matter with `source_id`, official link, source checksum, extraction tool/version/time, rights status, and human-verification state.
- Preserve page boundaries such as `<!-- report-page: 123; pdf-index: 130 -->`.
- Preserve table titles, headers, rows, columns, footnotes, symbols, units, and reading order.
- Mark unreadable or uncertain cells; never guess.
- Link back to the official source/PDF and forward to normalized records.
- Record OCR confidence and extraction warnings.
- Exclude copyrighted narrative unless licensed or otherwise approved; factual table transcription and full-text reproduction require separate rights review.
- Be deterministically regenerated and checksum-tested.

### 14.5 Canonical downloadable release contract

Each production data release should be linked to an immutable Git tag and provide:

| Asset | Purpose and minimum acceptance |
|---|---|
| `aser-observations-vX.Y.Z.csv` | UTF-8 universal/Excel format with documented quoting/nulls and spreadsheet-formula-injection neutralisation |
| `aser-observations-vX.Y.Z.parquet` | Efficient typed analytics; exact canonical key/value/null parity with CSV |
| `aser-vX.Y.Z.sqlite` or equivalent | Public read-only offline SQL snapshot with schema/version metadata and indexes; never production credentials or operational tables |
| `metadata-vX.Y.Z.json` | Machine-readable indicators, geography, subgroup, units, coverage, and release metadata |
| `schema-vX.Y.Z.json` | Required/nullable/enumerated fields, stable identifiers, and validation rules |
| `data-dictionary-vX.Y.Z.csv` | Field and indicator definitions, unit, denominator, population, missingness, comparability, source notes |
| `source-map-vX.Y.Z.csv` | Observation-to-source/page/table lineage with explicit reviewed exceptions |
| `validation-report-vX.Y.Z.md` | Counts, uniqueness, nulls, ranges, referential integrity, sampled source reconciliation, exclusions, known issues |
| `release-manifest-vX.Y.Z.json` | Code tag/commit, app/data/schema/source versions, build inputs/tools/time, asset sizes and SHA-256 |
| `checksums-vX.Y.Z.sha256` | Byte-for-byte verification of every asset |

Release rules:

- Distinguish application, data, schema, and source-manifest versions.
- Build a draft release from the tagged commit, download and validate the uploaded assets, then publish.
- Treat published analytical assets as immutable. Corrections require a new release and supersession note.
- GitHub-generated source archives do not replace explicit data/source assets.
- State exact coverage and omissions so “all data” has a defined meaning.
- The production database must be seedable from the public release, or every difference must be documented and justified.
- README “latest” links may move; citations must point to immutable versions.

### 14.6 Required clone-to-use workflows

#### A. No-clone visitor

Open live app → open latest data release → read methodology/coverage → download data → follow a value to source/page → copy citation.

**Acceptance:** all steps are reachable from README and the app with no GitHub account.

#### B. Data-only analyst

Clone → run documented bootstrap/data command → verify checksums → run Python, R, SQL, or spreadsheet example → compare expected output.

**Acceptance:** no Vercel account, production database, private token, or manual PDF extraction is required for ordinary analysis.

#### C. Full source-to-data reproducer

Install pinned tools → obtain/place authorised PDFs → verify input checksums → regenerate page-aware extracts → normalize/build data → run schema/data/lineage validation → compare output.

**Acceptance:** missing input identifies the exact source, legal acquisition path, expected checksum, placement, and next command; no alternate edition is silently substituted.

#### D. Application contributor

Clone → deterministic dependency install → configure documented local environment → migrate/seed public data → start app → run unit, integration, E2E, accessibility, API, and data tests.

**Acceptance:** representative analysis and smoke test work using public/reproducible inputs.

#### E. Fork-to-Vercel operator

Fork → provision documented dependencies → configure only listed variables → migrate/seed safely → deploy preview → run release battery → configure domain, headers, monitoring, backup, abuse controls, and rollback.

**Acceptance:** documentation identifies services, costs, quotas, limits, regions, secrets, and operational dependencies; previews cannot mutate production unexpectedly.

#### F. Offline/low-connectivity user

Download one named documentation/data bundle → verify checksum → use CSV/Parquet/portable SQL and examples offline → retain source citations/manifest.

**Acceptance:** core analysis works offline and unavailable external PDFs remain explicitly identified.

### 14.7 README, documentation, and navigation contract

The root README must visibly link to:

- Live production explorer and service/deployment status.
- Latest stable data release and historical releases.
- CSV, Parquet, portable SQL snapshot, schema, source map, checksums, and validation report.
- Official ASER sources, source manifest, authorised PDFs or official download links, and page-aware Markdown.
- Methodology, dictionary, rural-scope/comparability caveats, missingness/suppression rules, and district coverage.
- Five-minute data-only and local-app quickstarts.
- Python, R, SQL, curl/API, spreadsheet, and notebook examples.
- Architecture, database, Vercel deployment, testing, accessibility, privacy, security, backup, recovery, and incident docs.
- Contribution guide, code/data/docs/accessibility issue forms, PR template, and code of conduct.
- Code/data/source licences, third-party notices, citation, changelog, roadmap, governance, maintainers, supported versions, and known limitations.
- Public data/accessibility issue routes and a private security route.

Internal links must be relative so forks and archives work. Live/official links must be absolute and automatically checked. Badges must reflect real checks and must not overstate browser, accessibility, security, or data quality coverage.

API documentation must define routes, methods, parameters/enums/defaults, response and error schemas, empty states, pagination/limits, order, caching/freshness, precision, Unicode, missing/suppressed values, CORS, rate controls, version/release fields, deprecation, and breaking-change policy.

Tested examples must reproduce a state ranking, time trend, subgroup comparison, district query, observation-to-source join, missing-versus-zero handling, chart-ready export, and release-checksum verification. Each example must identify its release and expected row count/key outputs.

### 14.8 GitHub, Vercel, and public operations

GitHub release and archive:

1. Use an explicit app/data tag convention.
2. Build assets in CI from the tag, not an unrecorded workstation.
3. Release notes must cover schema/data/source/coverage changes, corrections, migrations, and known issues.
4. Attach and validate checksummed assets before publication; never replace an asset under an existing analytical version.
5. Add `CITATION.cff`; consider Zenodo or another durable archive if DOI preservation is desired.
6. Record deployed commit/data release in the About page and API metadata.

Vercel separation:

- Exclude raw/source PDFs, large extracts, portable databases, notebooks, caches, generated QA output, and unrelated examples from deployment unless runtime-required.
- Serve large downloads from immutable release storage, with correct content types, CORS, integrity metadata, and an outage/error state.
- Never expose secrets, maintainer paths, internal acquisition credentials, or private database URLs in client bundles/build logs.
- Document pooling, migrations, backups/restores, observability, error tracking, uptime, caching, abuse/rate controls, dependency updates, incident response, and rollback.
- Measure repository/clone/release size, install/build time, Vercel upload/function/response/memory budgets, and database limits before launch.

Contribution operations:

| Change type | Required intake | Automated checks | Human review |
|---|---|---|---|
| Code | Goal/reproduction and test impact | Lint, type, unit/integration/E2E, build, security/dependencies | Behaviour, UX, accessibility, analytical meaning |
| Data correction | Version/key, observed/expected, official source/page | Schema, key, range, referential, source-map, regression | Two-person verification for material changes |
| New source | Rights, manifest, checksum, coverage, extraction method | URL/file/checksum, page map, extraction and normalization | Rights, edition, methodology, table/page |
| Documentation | Persona/version and affected links | Markdown/style/link/example | Accuracy, clarity, caveats |
| Translation | Source language/version and reviewer | Structure, links, terminology | Fluent and methodological review |
| Security | Private impact/reproduction | Isolated maintainer validation | Coordinated disclosure |

Protect branches with required checks/reviews and least-privilege GitHub/Vercel automation. Document who may publish releases, alter data, rotate secrets, and handle incidents.

### 14.9 Open-source and clone-readiness testing battery

Every result must record command, environment, timestamp, expected, observed, evidence, and limitation. A skipped row is not a pass.

| Test ID | Test | Expected |
|---|---|---|
| BAT-REPO-001 | Anonymous clean HTTPS clone | No private dependency, credential request, or unexpected LFS pointer |
| BAT-REPO-002 | Two-minute README orientation | User finds app, data, sources, methods, licence, citation, quickstart |
| BAT-REPO-003 | Data-only bootstrap | One command obtains/verifies the public release |
| BAT-REPO-004 | Local app bootstrap | Representative app works from documented public inputs |
| BAT-REPO-005 | Environment audit | Every variable documented; no real secret committed |
| BAT-REPO-006 | Deterministic install | Lockfile install works on supported runtimes/platforms |
| BAT-REPO-007 | Python example | Executes with expected release/count/values |
| BAT-REPO-008 | R example | Executes with expected release/count/values |
| BAT-REPO-009 | SQL/offline snapshot | Executes offline with expected results |
| BAT-REPO-010 | Spreadsheet/CSV safety | UTF-8/IDs intact; no formula injection |
| BAT-REPO-011 | API/curl examples | Copy-paste examples execute and schema-validate |
| BAT-REPO-012 | Full source acquisition | Every source has authorised bundle or official acquisition path |
| BAT-REPO-013 | Source checksums | Every obtained input verifies; mismatch stops clearly |
| BAT-REPO-014 | Missing/restricted source | Exact lawful acquisition/placement path; no silent substitute |
| BAT-REPO-015 | Markdown regeneration | Pages, tables, footnotes, provenance, warnings preserved |
| BAT-REPO-016 | Source-to-data rebuild | Expected keys/counts/values/checksums or documented nondeterminism |
| BAT-REPO-017 | Complete lineage | Every observation maps to a source/page/table or approved exception |
| BAT-REPO-018 | CSV/Parquet/SQL parity | Canonical keys, values, nulls, sources, release metadata agree |
| BAT-REPO-019 | Production DB parity | Samples and aggregates match declared public release |
| BAT-REPO-020 | UI/API/export/source parity | Question, URL, UI, API, CSV, PNG, source and page agree |
| BAT-REPO-021 | Published asset verification | Downloads match manifest, checksums, and tag |
| BAT-REPO-022 | Historical release | Prior release remains retrievable and usable |
| BAT-REPO-023 | Git LFS path, if used | Clone/archive instructions work; pointers never masquerade as PDFs |
| BAT-REPO-024 | GitHub ZIP/tar archive | Archive plus documented release links fulfils quickstart |
| BAT-REPO-025 | Offline workflow | Named bundle, docs, and examples work without network |
| BAT-REPO-026 | Link check | No broken, private, localhost, wrong-edition, or maintainer-path links |
| BAT-REPO-027 | Rights/licence inventory | Code, data, PDFs, Markdown, media, fonts, dependencies all have compatible status |
| BAT-REPO-028 | Citation validation | `CITATION.cff` and README identify exact project/data release |
| BAT-REPO-029 | Secret/history scan | No secrets, private URLs, sensitive dumps, or personal paths |
| BAT-REPO-030 | Dependency security/licence | No unreviewed critical issue or incompatible licence |
| BAT-REPO-031 | Issue/PR workflows | Code/data/docs/accessibility/security routes collect required evidence |
| BAT-REPO-032 | Protection/permissions | Required review/checks and least privilege are enforced |
| BAT-REPO-033 | Vercel contents | Build excludes research archives/secrets and retains runtime assets |
| BAT-REPO-034 | Preview isolation | Preview cannot seed/migrate/write production unexpectedly |
| BAT-REPO-035 | Independent fork-to-Vercel | Succeeds using only public docs and declared services |
| BAT-REPO-036 | Resource budgets | Repo, clone, install, build, function, response, memory, DB within limits |
| BAT-REPO-037 | Version consistency | README, About, API, methods, schema, examples, releases agree |
| BAT-REPO-038 | Real browser/mobile matrix | Chrome, Firefox, Safari, Edge, iOS Safari, Android Chrome evidenced |
| BAT-REPO-039 | Accessibility matrix | Keyboard, VoiceOver, NVDA, zoom/reflow, contrast, reduced motion, forced colours evidenced |
| BAT-REPO-040 | Recovery exercise | Database/data restore and deployment rollback meet stated objectives |

### 14.10 Claude-ready repository defects

#### OSR-P0-001 — Source redistribution and third-party rights are not established

- **Impact:** Blindly adding PDFs/full text can create legal exposure; omitting source access weakens auditability.
- **Observed:** No complete rights manifest currently authorises all source and third-party redistribution.
- **Expected/fix:** Implement Section 14.4, obtain and record permission where possible, bundle only authorised material.
- **Acceptance:** BAT-REPO-012, 014, and 027 pass; CI rejects bundled sources with unknown/prohibited status.
- **Likely files:** `DATA_LICENSE.md`, `NOTICE.md`, `sources/manifest.yaml`, README, release/source scripts.
- **Related:** LEGAL-P0-001, DATA-P1-002, DATA-P1-004.

#### OSR-P1-001 — No verified clean clone-to-analysis/contribution path

- **Impact:** Users abandon setup, create duplicate support load, and produce irreproducible forks.
- **Observed:** All workflows in Section 14.6 are not documented and clean-room proven.
- **Expected/fix:** Provide minimal deterministic data-only, full-reproduction, local-app, offline, and fork/deploy paths.
- **Acceptance:** BAT-REPO-001–011, 024, 025, and 035 pass.
- **Likely files:** README, `docs/quickstart.md`, `.env.example`, scripts, examples, CI.
- **Related:** GIT-P1-001, CI-P1-001, DOC-P1-001, PLATFORM-P1-002.

#### OSR-P1-002 — Source manifest, page-aware Markdown, and complete lineage package are absent

- **Impact:** Values cannot be efficiently re-audited, rebuilt, or corrected at repository scale.
- **Observed:** No coherent public source manifest, verified acquisition, page-aware corpus, and observation-page map.
- **Expected/fix:** Stable source IDs, checksum-gated acquisition, page-aware extraction, verification state, complete source map.
- **Acceptance:** BAT-REPO-012–020 pass.
- **Likely files:** `sources/`, extraction/verification scripts, lineage schema, releases.
- **Related:** LEGAL-P0-001, DATA-P1-002, DATA-P1-004, UAT-P0-003.

#### OSR-P1-003 — Canonical immutable multi-format data release is incomplete

- **Impact:** Users may scrape mutable UI state or obtain inconsistent formats.
- **Observed:** The complete Section 14.5 asset/manifest/checksum contract is not currently delivered.
- **Expected/fix:** Automate tag → draft assets → download verification → immutable publication.
- **Acceptance:** BAT-REPO-018–022 and 028 pass.
- **Likely files:** Data build scripts, GitHub Actions/Releases, README, About/API metadata.
- **Related:** DATA-P1-001, DATA-P1-004, UAT-P0-003, CI-P1-001.

#### OSR-P1-004 — API and analytical examples are not a tested compatibility surface

- **Impact:** Downstream users can mishandle missingness, subgroup availability, district scope, or versions.
- **Observed:** Full API contract and tested Python/R/SQL/curl/spreadsheet examples are not provided.
- **Expected/fix:** Implement Section 14.7 examples with expected outputs and CI execution.
- **Acceptance:** BAT-REPO-007–011, 020, and 037 pass.
- **Likely files:** `docs/api.md`, `examples/`, API schemas, CI.
- **Related:** DOC-P1-001, CI-P1-001, DATA-P1-001.

#### OSR-P1-005 — Governance, contribution, security, and maintenance controls are incomplete

- **Impact:** Maximum public usage increases issue volume, correction requests, security exposure, and maintainer risk.
- **Observed:** The complete policy/workflow set in Sections 14.3 and 14.8 is not verified.
- **Expected/fix:** Establish licences/notices, ownership, protected workflows, disclosure, decision and release authority.
- **Acceptance:** BAT-REPO-027–032 pass.
- **Likely files/settings:** Root governance files, `.github/`, repository protections, runbooks.
- **Related:** LEGAL-P0-001, GIT-P1-001, GIT-P1-002, SECURITY-P1-003.

#### OSR-P1-006 — GitHub reproducibility assets and Vercel runtime boundaries are unproven

- **Impact:** Naively adding PDFs/data can slow clones/builds, exceed limits, expose assets/secrets, or couple runtime to research binaries.
- **Observed:** No evidence that a comprehensive clone and a minimal safe Vercel artifact coexist.
- **Expected/fix:** Implement Section 14.8 separation, release hosting, failure states, budgets, and fork deployment.
- **Acceptance:** BAT-REPO-023, 024, and 033–036 pass.
- **Likely files:** `.vercelignore`, build config, release URLs, deployment docs, CI budgets.
- **Related:** PLATFORM-P0-001, PLATFORM-P1-002, PERF-P1-001, REPO-P2-001.

#### OSR-P2-001 — Beginner, tutorial, translation, and low-connectivity experiences are absent

- **Impact:** A public repository remains usable mainly by experienced developers/analysts.
- **Observed:** The full beginner/offline/tutorial experience is not evidenced.
- **Expected/fix:** Plain-language glossary/FAQ, one complete beginner tutorial, offline bundle, accessible docs, governed translations.
- **Acceptance:** Independent beginner and offline personas complete named tasks without maintainer help.
- **Likely files:** `docs/`, `examples/`, documentation release bundle, contributor workflow.
- **Related:** DOC-P1-001, OSR-P1-001, and Section 13 beginner/accessibility batteries.

### 14.11 Claude implementation order and final gate

1. Resolve OSR-P0-001 with the existing source/data/security P0 items before copying any PDF or full-text derivative.
2. Implement OSR-P1-002 and OSR-P1-003 as one canonical source → normalized data → release → database → API → UI lineage/version pipeline.
3. Implement OSR-P1-001 and OSR-P1-004 together: prove data-only use first, then local app, full reproduction, offline use, and fork-to-Vercel.
4. Implement OSR-P1-005 and OSR-P1-006 before broad promotion so publishing, secrets, deployment, incident, contribution, and resource boundaries are controlled.
5. Implement OSR-P2-001 after data/API contracts stabilize.
6. Rerun BAT-REPO-001–040, the complete Section 13 battery, all personas, all combinations, source/data/API/export reconciliation, and real browser/mobile/assistive-technology qualification against the exact tagged release candidate.

The project is ready for maximum public GitHub/Vercel usage only when:

- Code, data, source, and third-party rights are explicit and compatible.
- Direct README/app links reach immutable data, sources, methods, examples, contribution, security, and citation surfaces.
- Authorised PDFs and page-aware Markdown are downloadable; restricted sources have verified official acquisition paths.
- Every observation carries stable release identity and exact source/page/table lineage or a reviewed exception.
- CSV, Parquet, portable SQL, metadata, schema, source map, validation report, database, API, UI, and exports reconcile.
- Clean-clone, GitHub archive, offline, LFS-if-used, examples, and independent fork-to-Vercel tests pass.
- Vercel contains only necessary runtime material and operational limits, monitoring, backup/restore, incident response, and rollback are proven.
- Real Chrome, Firefox, Safari, Edge, iOS Safari, Android Chrome, keyboard, VoiceOver, NVDA, zoom/reflow, contrast, reduced motion, and forced-colour testing is evidenced.
- Every P0/P1 is closed with a regression test, no skipped/blocked case is labelled pass, and the full UAT is rerun on the immutable public release candidate.

**Open-source production verdict:** **FAIL/BLOCKED for maximum public promotion.** Continue controlled testing, but do not claim broad production readiness until the P0/P1 provenance, rights, reproducibility, downloadable-release, governance, clean-clone, deployment, security, browser/mobile, accessibility, and operational gates above have passed with evidence.

---

## 15. Claude execution and closure control layer

### 15.1 Copy-ready instruction to Claude

> Treat this UAT document as the authoritative release-closure specification. Read the entire document and Section 20’s precedence/execution contract before proposing changes. Do not close a finding merely because code was changed. A finding closes only when its acceptance criteria pass, its regression test is added, the relevant persona journey is rerun, and evidence from the immutable release candidate is recorded. Do not infer decisions in DEC-001–DEC-014. Do not bundle source PDFs or full-text derivatives until DEC-001 is resolved. Preserve existing unrelated work. Keep each pull request independently testable, update documentation in the same change as the contract, and report all tests as PASS, FAIL, BLOCKED, or SKIPPED—never convert unavailable infrastructure into a pass. Stop and request an owner decision whenever a listed decision materially changes implementation.

Claude’s first response should contain:

1. The exact commit and working-tree state it inspected.
2. A list of applicable unresolved owner decisions.
3. A dependency-ordered backlog referencing the existing IDs, without inventing duplicate defects.
4. Proposed pull requests, files/systems affected, migrations, tests, documentation, rollout, and rollback.
5. Risks and explicit assumptions.
6. The first independently mergeable work item.

### 15.2 Status and closure protocol

Allowed statuses:

| Status | Meaning |
|---|---|
| `OPEN` | Confirmed work has not started |
| `DECISION BLOCKED` | A named DEC item requires an explicit owner answer |
| `ENVIRONMENT BLOCKED` | Required external test/deployment/device is unavailable; evidence states what was attempted |
| `IN PROGRESS` | Implementation is underway |
| `FIXED — AWAITING RETEST` | Code/docs/config changed but required acceptance evidence is incomplete |
| `RETEST FAILED` | One or more acceptance/regression/persona checks still fail |
| `PASS — REVIEW PENDING` | Implementer evidence passes; independent review remains |
| `CLOSED` | Acceptance, regression, documentation, migration/rollback where applicable, and independent review all pass |
| `ACCEPTED RISK` | Named authorised owner approved a dated, scoped, expiring exception; unavailable for P0 |

Closure rules:

- P0 cannot be waived and cannot close without independent retest.
- P1 is a public-release blocker unless DEC-014’s authorised owners record a dated, expiring waiver with impact and compensating control.
- A unit test cannot close a visible-browser, real-device, assistive-technology, deployment, recovery, or operational requirement.
- A defect that changes API/data semantics requires compatibility, documentation, export, and source-lineage retests.
- A database change requires blank migration, upgrade migration, parity, rollback/forward-repair, backup, and restore evidence.
- A production-only check remains `ENVIRONMENT BLOCKED` until executed in the applicable environment.
- Closing a root cause does not automatically close dependent IDs; each dependent acceptance row still needs evidence.

### 15.3 Master workstream backlog

This table is the one planning index. Detailed reproduction and acceptance oracles remain in Sections 5, 9–14.

| Workstream | Included IDs | Priority | Root outcome | Decisions/dependencies | Primary implementation surface | Mandatory proof |
|---|---|---:|---|---|---|---|
| WS-00 Rights and ownership | LEGAL-P0-001, OSR-P0-001 | P0 | Lawful public code/data/source distribution | DEC-001–003 | Licences, notices, source manifest, releases | Rights inventory and owner/legal sign-off; BAT-REPO-012/014/027 |
| WS-01 Supply-chain baseline | SUPPLY-P0-001, UAT-P2-015 | P0/P2 | One deterministic, secure toolchain | DEC-006 | `package.json`, one lockfile, TS/ESLint/build scripts | Frozen clean install, type check, lint, build, audit, full baseline |
| WS-02 Interaction state correctness | UAT-P0-001, UAT-P1-007 | P0/P1 | Latest valid question owns every visible async result | None | Page controller/hooks, request cancellation/state machine | Rapid switching, all state→district transitions, no stale UI/console errors |
| WS-03 Geography and construct truth | UAT-P0-004, UAT-P1-005/006, UAT-P2-012 | P0/P1/P2 | One canonical validated analytical context | WS-02 | Domain model, URL parser, API context, copy | National/state/district question→URL→UI→API→export agreement |
| WS-04 Query, district, and lineage parity | UAT-P0-002/003, UAT-P1-009, DATA-P1-004, OSR-P1-002 | P0/P1 | Every value has exact first-class provenance across all surfaces | WS-03, DEC-001 | Query repository, schemas, APIs, exports, cards, source package | 467 state/national and 108 district cut reconciliation; BAT-REPO-012–020 |
| WS-05 Accessible rendering | UAT-P1-008/010, UAT-P2-013/014, UAT-P3-017 | P1–P3 | Correct single composition usable by keyboard/low-vision/AT/mobile users | WS-02/03 | Components, CSS, export renderer, document semantics | Axe plus manual keyboard, VoiceOver/NVDA, contrast, zoom/reflow, real mobile |
| WS-06 Native Vercel runtime | PLATFORM-P0-001, OSR-P1-006 | P0/P1 | Native Next.js deployment without Cloudflare-only bindings | DEC-004, WS-01 | Package scripts, runtime/config, DB adapter, deployment | Clean native build, Preview/Production smoke, BAT-REPO-033–036 |
| WS-07 PostgreSQL/data model | DB-P0-001, DB-P1-001/002, DATA-P1-003 | P0/P1 | Constrained, dataset-scoped, migration-safe production database | DEC-005, WS-06 | Drizzle schema/migrations/repository/provider | Blank/upgrade migration, 12,552-row parity, isolation, negative constraints, rollback |
| WS-08 Reproducible releases | DATA-P1-001/002, OSR-P1-003 | P1 | Immutable source→data→release pipeline | WS-00/04/07, DEC-012 | Pipeline, manifests, release Actions/assets | Two identical builds, multi-format parity, checksums, BAT-REPO-016–022 |
| WS-09 API/security boundary | UAT-P1-011, UAT-P2-016, SECURITY-P1-001/002/003 | P1 | Typed, bounded, observable, abuse-resistant public API | WS-06/07, DEC-011 | Validation, handlers, headers, rate/WAF, security process | Contract/fuzz/burst/header/CSP tests and private report exercise |
| WS-10 Public repo and CI | GIT-P1-001/002, CI-P1-001, REPO-P2-001, OSR-P1-001/004/005 | P1/P2 | Clean clone, governed contribution, mandatory gates | WS-00/01/08 | README/docs/examples/`.github`/settings | BAT-REPO-001–011/023–032; intentionally failing PR proves protection |
| WS-11 Documentation and discovery | DOC-P1-001, SEO-P2-001, OPS-P2-002, OSR-P2-001 | P1/P2 | One accurate public contract for all personas | DEC-008/009, all contract workstreams | README, About, docs, metadata, examples | Version/link/content review, novice/offline journeys, metadata and indexing checks |
| WS-12 Production operations | DB-P1-003, OPS-P1-001, PERF-P1-001, COST-P2-001, PLATFORM-P1-002 | P1/P2 | Measured, monitored, recoverable, affordable service | DEC-007/008/010–012, WS-06–09 | Vercel, DB provider, DNS, monitoring, runbooks | Load/Web Vitals, alert, restore, rollback, incident, cost, preview-isolation evidence |
| WS-13 Platform qualification | BROWSER-P1-001 | P1 | Supported real browsers, mobiles, and assistive technologies pass | DEC-013, WS-05/12 | Automated matrix and manual/device lab | BAT-REPO-038/039 plus complete persona rerun |
| WS-16 Architecture/UI protection | ARCH-P0-003/004, ARCH-P1-013 | P0/P1 | Backend and analytics become replaceable while approved UI/UX, semantics and evidence remain stable | WS-01–08, DEC-004–006 | Domain, ports/adapters, services, view models, controller, contract/visual tests, ADRs | BAT-ARCH-001–020 and D1/PostgreSQL shadow parity |
| WS-15 Responsible disclosure | DISC-P0-001, DISC-P1-001–004, DISC-P2-001 | P0–P2 | Users understand independence, AI assistance, source rights, statistical limits, privacy and safe use | DEC-001–003/009, WS-00/04/08/09/11 | Site/About/footer, README, licences/notices, privacy, API/exports, report routes | BAT-DISC-001–020, owner and qualified legal/privacy review |
| WS-14 Release qualification | RELEASE-P0-001 | P0 | Immutable public candidate satisfies every gate | All workstreams | GitHub release, Vercel production, evidence pack | Sections 10, 12.6/12.7, 13, 14.9, and 15.7 all pass |

### 15.4 Dependency and pull-request order

```text
Owner decisions and rights
        │
        ├── Supply-chain baseline
        │        ├── Interaction state ── Geography/construct ── Query/lineage
        │        │                                           └── Accessible rendering
        │        └── Native Vercel runtime ── PostgreSQL/data model
        │                                      ├── Reproducible releases
        │                                      └── API/security boundary
        │
        └── Public repository/CI ── Documentation/discovery
                                      │
                             Production operations
                                      │
                           Platform qualification
                                      │
                           Release qualification
```

Recommended PR sequence:

1. Decision record and legal/source inventory—no product-code changes.
2. One package manager, dependency remediation, clean type/lint/build/test baseline.
3. Interaction state/cancellation and stale-response fixes.
4. Canonical analytical context, URL validation, geography/construct semantics.
5. Shared query repository, district scope, observation lineage, complete exports.
6. Accessible composition, responsive/keyboard/AT/contrast fixes.
7. Native Next.js/Vercel runtime conversion.
8. PostgreSQL adapter, constrained schema, migrations, parity, rollback.
9. Reproducible source/data pipeline and immutable downloadable releases.
10. API contracts, validation, security headers, rate controls, monitoring hooks.
11. GitHub governance, examples, mandatory CI/CD, branch protection.
12. Documentation, About/metadata, citation, SEO, privacy, offline use.
13. Operations, performance/cost, backups/restores, alerts, incidents, rollback.
14. Real browser/mobile/AT qualification and full UAT rerun.
15. Tagged release, production promotion, smoke, reconciliation, and monitored soak.

Claude may split a PR for reviewability but must not reverse a dependency without documenting why and how risk is contained.

### 15.5 Definition of ready and done for each implementation item

**Definition of ready**

- Stable defect/workstream IDs and severity are identified.
- Reproduction and expected result are understood.
- Required owner decisions are resolved or the item is marked `DECISION BLOCKED`.
- Affected contracts, migrations, security implications, documentation, and users are listed.
- Acceptance and regression strategy is specified before implementation.
- No unrelated user-owned changes will be overwritten.

**Definition of done**

- Root cause is fixed without weakening analytical or security guarantees.
- Relevant automated test failed before the fix and passes after it, or the reason a before/after test is infeasible is recorded.
- Required manual/persona/environment tests pass.
- API/schema/data/source/export compatibility is reconciled where applicable.
- Documentation and examples match implemented behaviour.
- Migration and rollback/forward-repair are proven where applicable.
- No new critical/high production vulnerability, secret, console error, accessibility blocker, skipped mandatory test, or unexplained bundle/performance regression exists.
- Evidence is linked in the closure ledger and independently reviewed.

### 15.6 Defect closure ledger template

Claude must maintain this ledger in its implementation plan or release evidence, not rewrite historical observations in this UAT.

| ID | Status | PR/commit | Release candidate | Automated evidence | Manual/persona evidence | Data/source evidence | Docs updated | Reviewer | Closed at | Waiver/expiry |
|---|---|---|---|---|---|---|---|---|---|---|
| `<stable ID>` | `OPEN` | — | — | — | — | — | — | — | — | — |

For a failed retest, append the new result and keep prior evidence; do not overwrite the audit trail.

### 15.7 Requirement-to-test traceability

| Requirement family | Defect/workstream source | Automated minimum | Manual/environment minimum | Release evidence |
|---|---|---|---|---|
| Analytical correctness | WS-03/04/07/08 | Question model, exhaustive tuples, DB constraints, format/API parity | Researcher, state, district, journalist journeys | Release/data/source manifests and reconciliation |
| UI/async correctness | WS-02/05 | Component/E2E rapid-interaction and stale-response tests | Impatient/adversarial plus mobile journeys | Browser traces, console/network results |
| Accessibility | WS-05/13 | Axe/semantic/keyboard unit or E2E checks | VoiceOver, NVDA, zoom/reflow, contrast, reduced motion, forced colours | Device/AT/version evidence |
| Cross-browser/mobile | WS-13 | Chromium/Firefox/WebKit automation | Real Safari/iOS Safari/Android Chrome and supported matrix | Timestamped device/browser report |
| API/security | WS-09 | Contract, schema, fuzz, length, authz-scope, rate and header checks | Private reporting and alert exercise | Scanner, WAF/rate, dependency and secret reports |
| Source/provenance | WS-00/04/08 | Manifest/checksum/page-map/lineage completeness | Sampled human PDF-page reconciliation | Rights sign-off and immutable source/data manifest |
| Repository use | WS-10/11 | BAT-REPO-001–037 | Beginner, analyst, contributor, fork and offline personas | Clean-room logs and release downloads |
| Deployment/operations | WS-06/12 | Preview smoke, migrations, load, synthetic checks | Alert, incident, backup/restore and rollback drills | Vercel/DB/DNS/monitoring evidence |
| Final release | WS-14 | All required suites with zero mandatory skips | All ten app personas plus repository personas | Section 12.6 evidence pack and sign-offs |

### 15.8 Owner-decision checkpoint

Before implementation, Claude must present unresolved DEC-001–DEC-014 in dependency order. It may research and recommend, but it must not silently choose:

- Redistribution permission, software/data licences, or inclusion of PDFs/full text.
- Native Vercel/PostgreSQL provider, billing plan, domain, region, retention, RPO/RTO, or SLO.
- Package manager, supported browsers, analytics/privacy posture, response owners, or waiver authority.

When an owner answer is received, record the decision, date, approver, alternatives considered, consequences, and affected workstreams in an architecture decision record.

### 15.9 Final go/no-go worksheet

| Gate | GO requires | Result at this UAT |
|---|---|---|
| P0 | Zero open P0; no waiver allowed | NO-GO |
| P1 | Zero open P1 for the first public production launch | NO-GO |
| Data/source | Immutable release, rights, checksums, lineage and full reconciliation | NO-GO |
| Application | All persona, interaction, export, error and combination tests pass | NO-GO |
| Architecture/UI preservation | Ports, contracts, shadow parity, rollback and approved visual/semantic states pass BAT-ARCH-001–020 | NO-GO |
| Browser/mobile/AT | Adopted real platform matrix passes | NO-GO / BLOCKED |
| Security/supply chain | No critical/high production advisory; headers, validation, rate controls, reporting pass | NO-GO |
| Disclaimers/responsible use | Independent/AI/source/statistical/privacy notices and portable disclosures pass BAT-DISC-001–020 and legal/privacy review | NO-GO |
| GitHub/open source | Clean clone, governance, CI, examples, releases and archives pass | NO-GO |
| Vercel/database | Native deployment, isolation, migration, parity, limits and rollback pass | NO-GO |
| Operations | SLO, monitoring, alert, load, backup/restore, incident and cost controls pass | NO-GO |
| Documentation/legal | Current, linked, licensed, citable, accessible documentation passes review | NO-GO |

The overall result is `GO` only when every mandatory gate is `GO`. An `ENVIRONMENT BLOCKED` or `SKIPPED` mandatory gate produces `NO-GO`, not conditional success.

---

## 16. Software-architecture compactness and optimisation assessment

### 16.1 Architectural position

The codebase is small enough to improve without a large rewrite, but the production target requires one deliberate platform migration and several consolidations. “Compact” should mean fewer sources of truth, fewer duplicated query/validation paths, smaller client responsibility, and clearer boundaries—not fewer lines at the expense of correctness.

The recommended target is:

- Native Next.js App Router on Vercel.
- Vercel-compatible managed PostgreSQL with Drizzle and pooled serverless connections.
- A framework-neutral domain layer for question grammar and analytical invariants.
- One validated query service/repository used by API, exports, and server rendering.
- Immutable versioned data/source releases feeding the production database.
- A thin client interaction island rather than the entire explorer owning all orchestration and data fetching.
- Contract-driven APIs and tests, with accessibility and lineage treated as data contracts.

### 16.2 Evidence-based current architecture findings

| Architecture ID | Severity | Observed evidence | Risk/opportunity | Recommended direction |
|---|---:|---|---|---|
| ARCH-P0-001 | P0 | `package.json` uses `vinext`; `vite.config.ts`, `worker/index.ts`, `cloudflare:workers`, Wrangler, D1 and Sites bindings define runtime, while intended production is Vercel | Current runtime/database cannot be assumed to deploy natively to Vercel | Complete WS-06/07: native Next runtime plus PostgreSQL adapter; remove Cloudflare-only code only after parity |
| ARCH-P1-001 | P1 | Both `package-lock.json` and `pnpm-lock.yaml` exist; package identity remains `site-creator-vinext-starter` | Non-deterministic installs and starter identity weaken public-repo clarity | DEC-006 chooses one manager; retain one lockfile; rename package; enforce frozen CI install |
| ARCH-P1-002 | P1 | `app/page.tsx` owns catalogue boot, URL restoration, normalization, seven related states, request sequencing, five async effects, navigation, and composition | High coupling makes races and regressions likely | Extract a `useExplorerController`/reducer or explicit state machine; use AbortController; keep one canonical analytical context |
| ARCH-P1-003 | P1 | `app/components/related.tsx` is 423 lines and `cards.tsx` 279 lines; data loading and rendering responsibilities are uneven | Related-analysis changes can affect unrelated UI paths | Split by user-visible feature (`trend`, `comparison`, `district`, `exports`) while keeping shared primitives genuinely small |
| ARCH-P0-002 | P0 | Explorer uses `scopeFor`, but Lineage and Export use `PUBLIC_SCOPE`; district requests therefore combine district type with state/national scope | Known district cross-surface failure and duplicated query semantics | One query specification/repository must generate Explorer, Lineage and CSV from the same validated context |
| ARCH-P1-004 | P1 | Raw column lists and WHERE clauses are repeated across API routes; `SURVEY_YEARS`, constructs and scope rules are repeated/hard-coded in domain, API and metadata | Drift already appears between comments, dataset registry, metadata and served district capability | Define canonical domain/catalogue constants and typed repository functions; generate metadata from data/config rather than narrative duplication |
| ARCH-P1-005 | P1 | Schema claims multi-dataset extensibility, yet public queries do not consistently bind `dataset` | A future dataset can contaminate current results | Make `dataset` mandatory in context, indexes, uniqueness, APIs, cache keys and exports |
| ARCH-P1-006 | P1 | One observation table stores source URL/page inline; it lacks structured source, release, rights and document metadata | Repetition, weak referential integrity, and incomplete release lineage | Normalize stable `datasets`, `data_releases`, `source_documents`, and `observations`; keep denormalized read views only if measured |
| ARCH-P1-007 | P1 | `metadata/route.ts` executes seven broad aggregate queries and embeds human descriptions/rounds | Large catalogue response, duplicated truth, harder cache invalidation | Precompute/version catalogue metadata during release build or cache it by data-release ID; keep endpoint a thin reader |
| ARCH-P1-008 | P1 | Entire `app/page.tsx` is a client component and fetches metadata/results after hydration | Extra JavaScript, loading waterfall, weaker first-render/SEO | Server-render stable shell/catalogue where practical; hydrate only interactive controls/charts; measure bundle and Web Vitals before/after |
| ARCH-P1-009 | P1 | Client CSV and server CSV have separate serializers; PNG renderer manually truncates bar rows at 16; neither is a single export contract | UI/export divergence and incomplete output | Central export model with shared rows/metadata, CSV formula neutralisation, server or worker rendering where needed, explicit pagination/completeness |
| ARCH-P1-010 | P1 | API input checks syntax but not full metadata membership/cardinality; no shared response schema | Wasteful queries, drift, weak downstream contract | Use small schema validation at boundary; validate year/indicator/subgroup/geography relationships against cached catalogue; publish OpenAPI/JSON Schema |
| ARCH-P1-011 | P1 | `npm test` builds first, while live API tests may skip when no server is reachable | Slow feedback and false-green integration coverage | Separate `test:unit`, `test:data`, `test:integration`, `test:e2e`, `test:a11y`, `test:release`; CI integration must fail if infrastructure is absent |
| ARCH-P2-001 | P2 | `app/globals 2.css`, tracked `tsconfig.tsbuildinfo`, starter `examples/d1`, and tool-specific build assets are present | Noise and ambiguity for contributors/deployers | Review provenance; remove or ignore only confirmed dead/generated artifacts; document any required platform files |
| ARCH-P1-012 | P1 | `next.config.ts` is empty; security, caching, canonical deployment and runtime policies are not centralized | Production headers and behaviour depend on defaults | Add minimal reviewed native Next configuration and/or middleware after the Vercel architecture is chosen |

### 16.3 Recommended target module boundaries

```text
app/
├── page.tsx                         # Server-rendered shell and initial catalogue where practical
├── explorer/
│   ├── ExplorerClient.tsx           # Thin interactive island
│   ├── useExplorerController.ts     # Reducer/state machine, URL sync, cancellation
│   ├── question-controls.tsx
│   └── results/
│       ├── ranking.tsx
│       ├── headline.tsx
│       ├── ladder.tsx
│       ├── districts.tsx
│       ├── trend.tsx
│       └── comparison.tsx
├── api/                             # Thin HTTP adapters only
└── about/
domain/
├── question.ts                      # Types, normalization, relationships, phrases
├── catalogue.ts                     # Construct/availability definitions
├── observation.ts                   # Units, missingness, comparability, lineage invariants
└── errors.ts                        # Typed public-safe domain errors
server/
├── db/
│   ├── client.ts
│   ├── schema.ts
│   └── migrations/
├── observations/
│   ├── repository.ts                # One dataset-scoped query path
│   ├── service.ts                   # Derived cuts/trends/comparisons
│   └── contracts.ts                 # Runtime schemas and response types
├── catalogue/
│   └── service.ts
└── exports/
    ├── model.ts                     # Same analytical rows/lineage as UI/API
    ├── csv.ts
    └── image.ts
pipeline/
├── sources/
├── extract/
├── normalize/
├── validate/
└── release/
```

This is a logical target, not a mandate to create one file per concept. Avoid empty wrappers and one-function modules. Split only where ownership, runtime boundary, testability, or change frequency differs.

### 16.4 Canonical analytical flow

```text
URL / UI controls
      │
      ▼
Parse + validate + normalize once
      │
      ▼
Canonical QuestionContext
      │
      ├── Observation repository ── PostgreSQL
      │            │
      │            ▼
      │      Typed observation rows
      │            │
      ▼            ▼
Analysis service (cut, trend, ladder, comparison)
      │
      ├── UI view model
      ├── API response
      ├── CSV export
      └── PNG/report export

Every branch retains:
dataset + release + observation ID + source ID + page/table + unit + comparability
```

The same canonical context and row set must drive Explorer, Lineage and CSV. Separate SQL implementations for those surfaces are prohibited unless a parity test proves equivalence.

### 16.5 Database and data-model optimisation

Recommended core entities:

- `datasets`: stable slug, publisher, universe, collection method, licence/notice.
- `data_releases`: immutable version, schema version, source-manifest checksum, data checksum, build commit/time, approval.
- `source_documents`: stable source ID, title, edition, official URLs, rights state, checksum, retrieval date, page count.
- `observations`: release/dataset/source foreign keys, canonical geography and indicator IDs, subgroup, value, unit, comparability, exact source locator.
- Dimension tables or constrained enums for geography, indicator, subgroup, unit, and comparability when they materially improve integrity and joins.

Constraints and indexes:

- Unique analytical grain including dataset and release.
- Percentage check `0 <= value <= 100`.
- Enumerated geography type, unit, comparability and rights states.
- District parent required for district and forbidden for national/state.
- Foreign keys for dataset, release, source, geography and indicator.
- Indexes derived from measured route predicates: release/dataset/year/indicator/geography-type/subgroup/parent; geography trend; source lineage.
- Do not add speculative indexes. Use `EXPLAIN ANALYZE`, representative cardinality, and load results.

The portable SQLite release is a distribution artifact, not the production operational database. PostgreSQL remains the production source for runtime queries; both must be generated from the same immutable release and parity-tested.

### 16.6 Client, rendering, and performance optimisation

1. Replace multiple loosely coupled state variables with a reducer/state machine whose state includes canonical question, request generation, loading/ready/empty/error, and link-adjustment notice.
2. Abort superseded fetches, not only ignore their results. Maintain one request identity per analytical surface where independent requests remain.
3. Derive values such as level, focus state, available districts, host, and query keys from canonical state rather than duplicating them.
4. Fetch stable catalogue/release metadata on the server or through a release-keyed cache; avoid refetching immutable content per client.
5. Cache public read-only queries by normalized context and data-release ID. Cache invalidation occurs by publishing a new release, not arbitrary time alone.
6. Render semantic HTML first. Charts must retain text/table equivalents; do not trade accessibility for canvas/SVG compactness.
7. Lazy-load heavy export/chart code only when used, but verify that dependency overhead is lower than the existing small canvas implementation.
8. Set explicit performance budgets for initial JS, route payload, metadata payload, LCP, INP, CLS, API p95, DB query p95, build time and release size.
9. Avoid premature memoization. Use measurement and React profiling to identify rerender costs.
10. Preserve URL reproducibility and back/forward navigation; test hydration and direct-link restoration.

### 16.7 API compactness and reliability

Use thin route handlers:

1. Parse request with one shared runtime schema.
2. Validate relationships against the current release catalogue.
3. Call one service method.
4. Return a versioned response or typed safe error.
5. Apply common cache, security, request-ID and observability policy.

Every response should include or expose:

- API contract version.
- Application build/commit.
- Data release and schema version.
- Normalized query context.
- Availability reason.
- Stable observation and source identifiers.
- Units, comparability and exact lineage for returned values.

Avoid returning implementation stack traces or reflecting unbounded hostile input. Enforce URL/body size, parameter cardinality, timeout, result-size, and rate limits. Use prepared/parameterized queries exclusively.

### 16.8 Compact test architecture

Use a test pyramid with a small number of authoritative fixtures and exhaustive generated combinations:

- **Domain tests:** normalization is total/idempotent; valid-combination generator; geography/parent/construct invariants.
- **Repository tests:** one query contract exercised against ephemeral PostgreSQL; dataset isolation, constraints, ordering, missingness.
- **Data-release tests:** checksum, schema, grain, range, referential, ladder sums, weighted bounds, source/page coverage.
- **API contract tests:** no silent skip; schema, invalid inputs, errors, caching, releases, district scope.
- **Component tests:** semantic output, loading/empty/error, exact question/caveat/source text.
- **E2E tests:** persona golden paths, rapid interaction, URL restore, downloads, mobile, keyboard.
- **Accessibility tests:** automated rules plus documented manual AT matrix.
- **Release tests:** deployed headers, production-shaped API/DB parity, performance/load, backup/restore and rollback.

CI should run fast domain/unit checks before build, then repository/data/API, then build/E2E/accessibility. Expensive browser/load/recovery suites may run on Preview/release workflows, but mandatory release jobs must fail—not skip—when infrastructure is absent.

### 16.9 Optimisation anti-patterns to avoid

- Do not perform a cosmetic folder rewrite before P0 correctness tests exist.
- Do not introduce microservices; the scale and domain currently suit a modular monolith.
- Do not add GraphQL, a client state library, or a chart library without a measured requirement.
- Do not cache an incorrect or incompletely scoped query.
- Do not denormalize away source/release lineage for convenience.
- Do not merge all routes into one oversized handler; consolidate shared query/service logic while retaining clear HTTP contracts.
- Do not generate an abstraction for every component. Prefer cohesive feature modules and explicit domain types.
- Do not migrate database/runtime and redesign UI in the same PR.
- Do not delete tool-specific files, duplicate CSS, examples, or generated artifacts until usage and user ownership are verified.
- Do not trade deterministic, readable transformations for clever compressed code.

### 16.10 Architecture acceptance criteria

Architecture optimisation is complete only when:

- Native `next build` and Vercel Preview/Production operate without Vinext, Wrangler, Worker, D1, or Sites runtime dependencies.
- Exactly one package manager and lockfile are authoritative.
- One canonical question/context validator is used by URL restoration, UI, APIs, exports, and tests.
- One dataset/release-scoped repository/service path drives Explorer, Lineage and CSV.
- District scope and all 467 + 108 combinations reconcile across database, API, UI and export.
- Every observation carries structured release/source lineage.
- PostgreSQL constraints reject invalid analytical records and migrations/rollback are proven.
- Stable catalogue data is release-versioned and efficiently cached.
- Client JavaScript, API payload, DB query and Web Vital budgets are defined and passing.
- API responses are runtime-validated, versioned, bounded, secured and observable.
- Unit, data, integration, E2E, accessibility and release suites have explicit non-skipping CI gates.
- The refactor reduces duplicated rules/queries and preserves or improves readability; before/after bundle, query, build and test timings are recorded.
- Public documentation and architecture diagrams reflect the implemented system rather than the intended system.

### 16.11 Architecture implementation sequence

1. Add regression coverage around current analytical context, API parity, exports and data invariants.
2. Resolve owner platform/database/package-manager decisions.
3. Normalize the toolchain and eliminate dependency/security uncertainty.
4. Create canonical domain context and shared repository/service interfaces behind existing behaviour.
5. Fix P0/P1 interaction, geography, district and lineage defects on those interfaces.
6. Convert runtime to native Next.js/Vercel while maintaining behaviour.
7. Migrate D1/SQLite production data to constrained PostgreSQL with full parity and rollback.
8. Introduce release/source entities and reproducible data pipeline.
9. Thin client orchestration and route handlers; split components by feature where it reduces coupling.
10. Add release-keyed caching, observability, security controls, and measured performance optimisation.
11. Reconcile documentation, examples, downloadable artifacts and public repository structure.
12. Run the complete UAT, architecture acceptance, production operations, and release evidence gates.

### 16.12 Non-negotiable architectural invariants

Claude must encode these invariants in tests and architecture documentation before structural refactoring:

1. **Approved UI preservation:** database, runtime, query, pipeline, and analytics changes must not alter the approved visual language, information hierarchy, interaction sequence, responsive composition, or user-facing terminology unless a separately scoped product/design decision authorises it.
2. **One analytical context:** dataset, release, year, construct, indicator, grade/band, subgroup, geography type, geography, parent, unit, mode, and rung are validated together and travel as one immutable context.
3. **No silent substitution:** missing, suppressed, unavailable, invalid, stale, or non-comparable results never become zero, a different geography, a different construct, a cached prior answer, or a reconstructed estimate.
4. **Per-observation lineage:** every value retains observation ID, data release, source ID, document edition, page/table locator, unit, comparability, and rights status through database, analytics, API, UI and export.
5. **Cross-surface identity:** the same canonical analytical result powers chart, table, headline, API, CSV and image/report export.
6. **Determinism:** the same release plus normalized context produces the same ordered values, derived measures, caveats and citations.
7. **URL reproducibility:** a valid shared URL restores the same question and analytical result; an invalid/obsolete URL is explicitly normalized or rejected.
8. **Accessibility is structural:** semantic names, reading order, keyboard interaction, focus, text alternatives, contrast and reflow remain part of component contracts.
9. **Release-aware caching:** no cache entry can cross dataset, data-release, schema-version, normalized-context or permission boundaries.
10. **Public safety:** application errors reveal no secrets or internals; production changes are observable and reversible.
11. **Source authority:** derived analysis never obscures the authoritative source or represents a derived result as directly published.
12. **UI-independent domain:** domain and analytics code may not import React, browser globals, CSS, route handlers, database drivers, or download implementations.

### 16.13 Ports-and-adapters boundary

Use a modular-monolith/hexagonal structure so infrastructure can change without changing user experience:

```text
Presentation (existing design, components, semantic HTML)
                         │
                         ▼
Stable UI view-model contracts
                         │
                         ▼
Application services/use cases
  ExploreCut · BuildTrend · BuildLadder · Compare · Export · GetCatalogue
                         │
                         ▼
Pure domain model and analytical rules
                         │
                 outbound ports
           ┌─────────────┼──────────────┐
           ▼             ▼              ▼
 ObservationRepo   ReleaseRepo    SourceRepo
           │             │              │
           └─────────────┼──────────────┘
                         ▼
Adapters: PostgreSQL · release files · test fixtures

HTTP routes, CSV/PNG writers, Vercel and PostgreSQL are adapters—not domain logic.
```

Required port contracts:

- `ObservationRepository`: fetch exact published observations by validated context.
- `CatalogueRepository`: return valid combinations and definitions for one release.
- `ReleaseRepository`: identify current/historical immutable releases and checksums.
- `SourceRepository`: resolve source IDs, rights and exact page/table metadata.
- `AnalysisService`: build cuts, trends, ladders and comparisons from observations through pure functions.
- `ExportService`: serialize the same view model used by the UI.
- `Clock`, `Logger` and request/correlation ID ports where nondeterminism or observability must be controlled in tests.

Infrastructure adapters may change from D1 to PostgreSQL or from API fetch to server invocation without changing domain or view-model contracts.

### 16.14 Stable presentation/view-model contracts

The current card appearance should be preserved behind explicit view models. Components must not receive raw database rows or know indicator-name conventions.

Minimum common envelope:

```ts
type AnalysisEnvelope<T> = {
  contractVersion: string;
  appVersion: string;
  dataRelease: string;
  context: NormalizedQuestionContext;
  status: "ready" | "empty" | "unavailable" | "not_comparable" | "error";
  result: T | null;
  sources: SourceReference[];
  caveats: Caveat[];
  generatedAt: string;
};
```

Required presentation models:

- `RankingViewModel`: ordered peer rows, focus, parent anchor, rank semantics and complete per-row sources.
- `HeadlineViewModel`: named subject, value, peer count/rank, best/worst references and caveats.
- `LadderViewModel`: complete rung definitions, ordered segments, totals, missingness and lineage.
- `TrendViewModel`: explicit series identity, points/gaps, comparable interval, uncertainty/caveats and per-point sources.
- `ComparisonViewModel`: dimension varied, dimensions held constant, series, missing sides, interpretation and sources.
- `ExportViewModel`: complete visible/underlying rows, question, construct, release, sources, disclaimers and pagination/completeness.

Contract rules:

- Use stable IDs for dataset, indicator, geography, subgroup, release and source; labels are display attributes, not query keys.
- Additive fields are backwards-compatible; removal, semantic change, enum narrowing or unit change requires a versioned contract and migration.
- `null`, unavailable, suppressed and not-comparable need distinct machine-readable representations.
- Domain errors map once to consistent user-facing states and API errors.
- Components may format a view model but may not recalculate analytical values or infer provenance.

### 16.15 Design-preservation programme

Before backend or analytics refactoring:

1. Capture approved reference screenshots at every supported desktop/mobile viewport for all major cards, About, loading, empty, adjusted-link, error and district states.
2. Capture DOM/semantic snapshots for headings, landmarks, controls, tables, tabs, live regions and accessible names.
3. Record persona interaction transcripts, keyboard order, focus transitions, URL changes, loading sequence and export contents.
4. Extract/document actual design tokens: colour, typography, spacing, radius, borders, shadows, breakpoints, motion and chart palette.
5. Create a component-state catalogue covering ready/loading/empty/error/partial/long-label/many-row/suppressed states.
6. Establish screenshot thresholds and require human review of every intentional visual delta.
7. Prohibit UI redesign in database, runtime, pipeline or analytics PRs. A visual diff in those PRs is a regression unless explicitly justified.
8. Test generated PNG/report visual output independently from browser screenshots.
9. Preserve content and accessibility, not only pixels: a pixel-identical but misleading or inaccessible result fails.

The test baseline must be captured from an owner-approved reference commit. Existing defects must be annotated so visual tests do not freeze incorrect behaviour as the desired contract.

### 16.16 State, concurrency, and side-effect architecture

Replace loosely coordinated effects with an explicit controller/reducer:

```text
BOOTING
   ├── catalogue failure → FATAL_ERROR
   └── catalogue ready → NORMALIZING_URL
                            │
                            ▼
                     REQUESTING_RESULT
                       ├── latest success → READY or EMPTY
                       ├── latest failure → ERROR
                       └── question changes → cancel → REQUESTING_RESULT
```

Rules:

- A normalized question change creates one immutable query key and request generation.
- Abort every superseded network request with `AbortController`.
- A response may commit only when its generation and query key equal current state.
- Primary result, related analyses and exports identify the same context/release; related surfaces may load independently but cannot display a previous context.
- Loading, empty, unavailable, partial and error are explicit states rather than inferred from missing objects.
- URL update and history navigation are effects of committed normalized state.
- Do not use a global state library unless the reducer/hook becomes demonstrably inadequate.

### 16.17 Analytics engine design

Analytical transformations must be pure, named and independently testable:

- Define measures in a registry using stable IDs, source construct, population, required inputs, aggregation rule, unit, precision, comparability and caveats.
- Distinguish directly published values from derived values in type and UI.
- Derived cumulative measures must require every necessary rung; partial input produces unavailable, never a partial sum.
- Ranking must specify peer universe, tie policy, missingness, ordering and whether sampling uncertainty makes ordinal interpretation unsafe.
- Trend must specify comparable rounds, cohort warning, gap handling and no automatic geography fallback.
- Comparison must state exactly one varied dimension and every held-constant dimension.
- Rounding occurs only at the presentation/export boundary; calculation retains source precision.
- Provenance aggregation returns all contributing sources/pages, not the last row processed.
- Future uncertainty intervals should be first-class fields rather than encoded into prose.

The registry must generate or validate UI control availability, API membership, documentation and tests so construct rules are not duplicated across layers.

### 16.18 Compatibility and change classification

Every proposed change must be classified:

| Change | Required handling |
|---|---|
| Database implementation only | Repository contract tests and result parity; no UI change |
| Schema/index change | Expand/contract migration, old/new compatibility window, parity, rollback/forward repair |
| Analytics implementation with same semantics | Golden-result parity plus view-model contract tests |
| Intentional analytics semantic change | New measure/contract or version, release note, methodology and user-visible explanation |
| API additive change | Schema/consumer tests; old clients remain valid |
| API breaking change | Versioned endpoint/contract, deprecation period and migration guide |
| UI implementation refactor | Semantic, visual, accessibility and persona parity |
| Intentional UI/UX change | Separate design approval, before/after evidence and user acceptance |
| Source/data correction | New immutable data release, correction note, lineage and affected-result report |

Use consumer-driven contract fixtures for the UI and exports. The new backend must satisfy the existing approved contract before traffic moves.

### 16.19 Strangler migration and rollback plan

Do not rewrite the runtime, database, analytics and UI simultaneously.

1. Characterize current approved behaviour with golden fixtures and design-preservation evidence.
2. Introduce domain/view-model interfaces in front of the current implementation.
3. Move duplicated Explorer/Lineage/CSV query semantics behind one repository while still using D1.
4. Build PostgreSQL schema and adapter against the same repository contract.
5. Load PostgreSQL from the canonical immutable release—not by uncontrolled dual writes.
6. Run D1 and PostgreSQL reads in shadow comparison across all 467 state/national and 108 district combinations.
7. Compare status, row keys/order, values, units, sources, pages, derived results and performance.
8. Route Preview to PostgreSQL behind an environment-controlled adapter selection.
9. Run full UAT and soak Preview; prohibit production data mutation from Preview.
10. Promote the tagged candidate; retain immediate application rollback and a verified prior compatible database/release.
11. Remove Cloudflare/D1 code only after the rollback window closes and evidence is archived.

Rollback must cover code, schema and data release independently. A database rollback that loses a correction or a code rollback incompatible with the current schema is not acceptable.

### 16.20 Resilience, caching, and observability design

- Cache keys must include contract version, dataset, data release and complete normalized context.
- Prefer immutable release-keyed caches; do not depend only on short time-to-live values.
- Cache only validated results and explicit safe empty/unavailable states.
- Never serve stale results as current without displaying their release/version and status.
- Define error taxonomy: invalid request, unavailable combination, source/release unavailable, database unavailable, timeout, rate limit and internal error.
- Carry a correlation/request ID from edge/API through repository logs without logging sensitive query or personal data.
- Emit metrics for route latency, DB latency, cache hit, error type, empty/unavailable frequency, export failures and release mismatch.
- Alert on correctness signals such as release mismatch, lineage absence, unexpected row-count shift and repeated normalization—not merely uptime.
- Use structured logs with bounded retention and redaction.
- Degrade honestly: About/methodology/static help may remain available during DB outage, but analytical results must show a clear unavailable state.

### 16.21 Architecture governance and decision records

Required architecture decision records:

- ADR-001: Native Vercel/Next.js target and removal of Vinext/Cloudflare runtime.
- ADR-002: PostgreSQL provider, region, pooling and operational ownership.
- ADR-003: Package manager/runtime version and dependency policy.
- ADR-004: Domain, repository, service and view-model boundaries.
- ADR-005: Stable identifiers, API/view-model versioning and deprecation.
- ADR-006: Source, data-release and provenance model.
- ADR-007: Caching and invalidation by release.
- ADR-008: Privacy/telemetry/observability design.
- ADR-009: Export generation and portable metadata.
- ADR-010: Supported browser/accessibility and design-regression policy.

Each ADR records context, decision, alternatives, consequences, owner, date and revisit trigger. Add C4-style system/container/component diagrams and a data-lineage diagram, but keep diagrams synchronized through review rather than generating decorative documentation.

### 16.22 Higher-order architecture testing battery

| Test ID | Architectural guarantee | Required evidence |
|---|---|---|
| BAT-ARCH-001 | Domain imports no React/browser/route/DB adapter | Dependency-boundary test |
| BAT-ARCH-002 | UI imports no DB driver/raw SQL | Dependency-boundary test |
| BAT-ARCH-003 | Route handlers contain no analytical calculation | Review/static boundary check |
| BAT-ARCH-004 | One normalized context drives UI/API/export | Contract and persona tests |
| BAT-ARCH-005 | Components accept stable view models | Type/contract tests |
| BAT-ARCH-006 | Old and new repository adapters satisfy same suite | Adapter contract results |
| BAT-ARCH-007 | D1/PostgreSQL shadow parity | All-combination comparison artifact |
| BAT-ARCH-008 | Per-row/per-point lineage survives every transformation | Lineage completeness test |
| BAT-ARCH-009 | Direct and derived values remain distinguishable | Domain/API/UI/export assertions |
| BAT-ARCH-010 | No stale async result can commit | Deterministic concurrency tests |
| BAT-ARCH-011 | Cache keys isolate release and full context | Collision/invalidation tests |
| BAT-ARCH-012 | API/view-model compatibility is enforced | Consumer/provider schema tests |
| BAT-ARCH-013 | Database migration is expand/contract safe | Old/new app and schema compatibility rehearsal |
| BAT-ARCH-014 | Code/schema/data rollback combinations are valid | Staging rollback matrix |
| BAT-ARCH-015 | Approved UI visual states remain stable | Screenshot comparison plus human approval |
| BAT-ARCH-016 | Semantic/accessibility structure remains stable or improves | DOM, axe and manual AT evidence |
| BAT-ARCH-017 | Analytics golden values and interpretations remain correct | Source-backed fixture results |
| BAT-ARCH-018 | Performance does not regress beyond budget | Before/after JS, API, DB and Web Vital report |
| BAT-ARCH-019 | Failure modes degrade honestly | DB/source/timeout/cache/outage injection |
| BAT-ARCH-020 | Architecture docs match deployed dependencies | Runtime/deployment/diagram review |

### 16.23 Architecture-specific release blockers

#### ARCH-P0-003 — Approved UI/UX lacks an enforceable preservation contract

- **Observed:** The presentation is visually modular, but no owner-approved reference state, stable view-model boundary, visual/semantic regression suite, or rule separating backend refactors from redesign currently protects it.
- **Impact:** Database or analytics work can unintentionally alter layout, copy, loading, focus, exports or interpretation.
- **Fix:** Implement Sections 16.12–16.15 before platform migration.
- **Acceptance:** BAT-ARCH-004/005/012/015/016 pass against the approved reference commit.

#### ARCH-P0-004 — Infrastructure and analytics are not yet replaceable through verified ports

- **Observed:** Query semantics are duplicated, the client API layer also computes analytics, related components fetch directly, and current runtime binds to D1/Cloudflare.
- **Impact:** A database/runtime change can propagate into analytics and UX and repeat existing district/provenance defects.
- **Fix:** Introduce repository/service/view-model boundaries and execute the strangler migration in Section 16.19.
- **Acceptance:** BAT-ARCH-001–014 and 017–020 pass; D1/PostgreSQL shadow parity covers all combinations.

#### ARCH-P1-013 — Compatibility, cache, failure and rollback semantics are not formal contracts

- **Observed:** No explicit compatibility classification, release-keyed cache contract, typed end-to-end error taxonomy or code/schema/data rollback matrix exists.
- **Impact:** A technically successful deployment can serve stale, mismatched or incompatible analytical results.
- **Fix:** Implement Sections 16.18–16.21.
- **Acceptance:** BAT-ARCH-011–014 and 018–020 pass in production-shaped staging.

### 16.24 Architecture review limitation and final recommendation

No architecture review can be “bulletproof” before implementation, adversarial review, production-shaped load, failure injection, migration rehearsal and operational evidence. This review is designed to make assumptions explicit and failure detectable, not to promise that defects are impossible.

**Final architectural recommendation:** preserve Claude’s approved UI as a protected presentation system while evolving the repository into a well-tested modular monolith. The highest-order gains are a stable view-model contract, pure analytical domain, replaceable repository ports, release/source lineage, deterministic state management, release-keyed caching, compatibility governance, strangler migration and visual/semantic regression protection. Removing the Cloudflare/Vercel split then becomes an adapter migration rather than a redesign. A wholesale rewrite or microservice architecture would add risk without evidence of benefit.

---

## 17. Final UAT handoff declaration

This document now contains:

- Executed persona transcripts and observed UI behaviour.
- Application, data, database, API, export, accessibility, security, browser/mobile, performance, deployment, operations, documentation and repository findings.
- Stable defect IDs with severity, impact, reproduction, expected/observed results, likely implementation areas, acceptance criteria and regression requirements.
- A named testing battery with executed, failed, blocked and unexecuted coverage distinguished.
- Production/open-source readiness requirements, source-PDF/Markdown handling, clone-to-analysis workflows and public-repository use cases.
- Independent-project, no-endorsement, AI-assistance, source-rights, statistical-use, privacy, export, repository and contributor disclaimer requirements with copy-ready language.
- Owner decisions, dependency order, implementation workstreams, PR order, closure statuses, evidence requirements and go/no-go gates.
- An evidence-based architecture optimisation plan with protected UI/view-model contracts, ports/adapters, pure analytics, state/concurrency rules, strangler migration, compatibility/rollback, target boundaries, data flow, database/API/client/test recommendations and anti-patterns.

Claude has enough information to create a production-closure plan without making product decisions implicitly. Claude must still obtain the owner decisions in Section 12.2, implement and retest the findings, and produce the evidence in Sections 12.6, 15.7, 15.9 and 18.15. This document is complete as the UAT planning and execution handoff; production readiness itself remains **FAIL/BLOCKED** until the specified evidence passes against an immutable release candidate.

---

## 18. Independent, AI-assisted project disclaimers and responsible-use requirements

### 18.1 Purpose and legal limitation

Because this is an independent project created by a novice with AI-assisted coding, the site and repository need unusually clear disclosures about authorship, affiliation, verification, data ownership, statistical interpretation, warranties, and support. These disclosures protect users from misunderstanding the product; they do not cure inaccurate data, inaccessible design, insecure code, privacy violations, misleading analysis, copyright infringement, or use beyond a licence.

This section is a product-risk specification, not legal advice. Final public wording—especially copyright, database rights, limitation of liability, governing law, privacy, takedown, and source redistribution—must be reviewed by a qualified lawyer familiar with the intended jurisdictions and the actual code/data/source licences. The [ASER Centre notice](https://asercentre.org/privacy-guidelines/) currently identifies ASER/Pratham and states “All Rights Reserved.” India’s official [Copyright Act, 1957](https://copyright.gov.in/documents/copyright_act_1957.pdf) protects covered works and defines infringement, while GitHub notes that a public repository without a licence remains subject to default copyright restrictions and is not automatically open source ([GitHub licensing guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)). If the site processes personal data, its actual design and notice must also be reviewed against applicable privacy law, including the official [Digital Personal Data Protection Act, 2023](https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Act%202023.pdf) and any provisions/rules then in force.

### 18.2 Mandatory disclosure principles

1. **Independent and unofficial:** prominently state that the project is not an official ASER Centre, Pratham Education Foundation, government, school-system, or data-provider product.
2. **No endorsement or affiliation:** state that references, links, names, report titles, and source citations do not imply sponsorship, partnership, approval, or endorsement.
3. **Source ownership:** identify ASER Centre/Pratham as the source publisher/rightsholder where accurate. Do not claim ownership over their reports, marks, narrative, or underlying source material.
4. **AI assistance:** disclose that generative AI assisted software development and may have assisted extraction, transcription, documentation, or testing only where that is factually true.
5. **Human responsibility:** identify the project maintainer—not an AI vendor—as responsible for publication decisions, corrections, security, and claims made by the project.
6. **Verification limits:** explain the actual review performed, what remains unverified, and the release/version date. Do not use vague “AI may be wrong” language as a substitute for quality evidence.
7. **Source primacy:** official ASER publications remain authoritative. Users must be able to reach the exact official document/page used.
8. **Statistical limits:** explain rural scope, sampling uncertainty, changing cohorts, district uncertainty, construct/subgroup differences, non-causality, missingness, and excluded non-comparable rounds.
9. **Not professional or official advice:** the site is informational and analytical; it does not provide official statistics, government guidance, legal advice, educational assessment of an individual child, funding recommendations, or causal evaluation.
10. **No warranty and use at own risk:** code, data, API, downloads, analyses, and documentation are provided subject to the selected licences and counsel-approved limitations. This cannot contradict mandatory law or the actual licence.
11. **Version and freshness:** results describe named source editions and data releases, may be corrected, and are not guaranteed to be current.
12. **Privacy truthfulness:** disclose only the telemetry, logs, cookies, third-party services, retention, and user-submitted information actually used. “We collect no data” is prohibited if Vercel, analytics, error monitoring, server logs, forms, or external embeds collect it.
13. **External links:** clarify that third-party sites have their own availability, content, security, accessibility, and privacy practices.
14. **Correction and takedown:** provide a monitored route for data corrections, rights concerns, attribution changes, privacy requests, accessibility issues, and private security reports.
15. **Licences remain separate:** the software licence must not imply a licence to ASER reports, source PDFs, ASER/Pratham names or marks, third-party assets, or extracted/derived data.

### 18.3 Copy-ready short site disclaimer

This concise disclosure should appear persistently in the footer and near the About-page introduction:

> **Independent project.** This ASER Data Explorer is an unofficial, independently maintained project and is not affiliated with, sponsored, approved, or endorsed by ASER Centre, Pratham Education Foundation, or any government body. ASER reports and associated rights remain with their respective owners. Generative AI assisted development of this software; the maintainer is responsible for what is published. Figures may contain transcription, processing, software, or interpretation errors. Verify important results against the linked official report and page before use.

Required link labels immediately following the short disclaimer:

- `About this project and limitations`
- `Data sources and methodology`
- `Licences and third-party rights`
- `Report a data or rights issue`
- `Privacy`
- `Security`

### 18.4 Copy-ready full About/responsible-use notice

The About page should contain a plain-language notice substantially equivalent to:

> #### About this independent explorer
>
> This website is an independent educational and analytical project. It is not an official product of ASER Centre, Pratham Education Foundation, any government agency, school, funder, or research institution. Those organisations have not reviewed, approved, certified, sponsored, or endorsed this website unless an explicit written statement linked here says otherwise.
>
> The project uses figures transcribed or derived from identified ASER publications. ASER reports, names, logos, narrative content, and other source materials remain the property of their respective owners. The official reports are authoritative. Each result should link to the source document and page used; users should check the original source before relying on a figure.
>
> Generative AI tools assisted the creation and review of portions of the software and documentation. [If factually applicable: AI-assisted tools also supported extraction or transcription.] AI output can contain errors. The maintainer selected, reviewed, edited, and published the project and remains responsible for corrections and release decisions. This disclosure does not mean that every result has received independent expert or source-publisher review.
>
> ASER estimates describe sampled rural populations under the methodology and definitions of the cited report. They are not administrative counts and generally should not be read as covering urban India or every child. Small differences may reflect sampling uncertainty rather than meaningful performance differences. District estimates may have greater uncertainty. Results from different years concern different samples/cohorts, not the progress of the same children. Government/private differences are descriptive and do not, by themselves, establish that school type caused an outcome. Missing, unavailable, suppressed, or non-comparable values are not zero.
>
> This explorer is provided for information, education, reproducibility, and public-interest analysis. It is not official statistical guidance, individual educational assessment, legal or professional advice, a funding recommendation, or a substitute for the complete ASER methodology and report. Do not use it as the sole basis for high-impact decisions affecting a child, teacher, school, district, community, policy, funding allocation, ranking, or public allegation.
>
> Data, code, downloads, API responses, charts, and documentation may contain mistakes or become outdated. They are provided under the licences and notices identified in this repository, without warranties beyond those that cannot legally be excluded. Availability, completeness, fitness for a purpose, and uninterrupted service are not guaranteed. Before publication or consequential use, verify the release version, indicator definition, geography, year, subgroup, unit, source, page, caveats, and original report.
>
> To report a suspected data error, misleading interpretation, missing attribution, copyright/rights concern, accessibility problem, privacy concern, or security vulnerability, use the appropriate contact/reporting route linked below. Security vulnerabilities should be reported privately rather than in a public issue.

Placeholders in square brackets must be resolved to factual statements before publication. Do not publish placeholder text.

### 18.5 AI-assistance disclosure standard

The disclosure must be specific enough to be meaningful without exaggerating AI involvement.

#### Minimum factual record

Maintain a release-level record stating:

- Which activities used AI: code generation, refactoring, test drafting, documentation, data extraction/transcription, visual design, or analysis.
- Which models/tools were used if disclosure is desired or required by policy.
- Which outputs received human review and by whom.
- Which deterministic tests and source reconciliations were applied.
- Known unreviewed areas and residual risks.
- Whether any source documents, personal data, credentials, or proprietary material were sent to an external AI service.

#### Required wording variants

Use only the variant supported by evidence:

**AI-assisted code only**

> Generative AI tools assisted software development and documentation. The published data was not accepted from AI output without the source and validation process described in the methodology. The maintainer reviewed and is responsible for the release.

**AI-assisted extraction/transcription**

> Generative AI or automated extraction tools assisted transcription from source documents. Automated output can omit, shift, or misread cells, tables, footnotes, and page references. The validation report identifies the checks and human review completed. Users should verify consequential figures against the linked official page.

**Incomplete human verification**

> Portions of this release have not received independent expert or complete page-by-page human verification. Those portions are identified in the source manifest and should not be used for consequential decisions without independent confirmation.

Prohibited claims unless evidenced:

- “AI-verified,” “error-free,” “fully validated,” “official,” “certified,” or “expert-reviewed.”
- “Human reviewed” without defining scope.
- “No hallucinations” or any absolute accuracy guarantee.
- Naming OpenAI, Anthropic, Claude, ChatGPT, or another vendor in a way that implies endorsement.

### 18.6 Data-use and interpretation disclaimer

Every analytical surface must preserve these cautions contextually rather than hiding all caveats in legal text:

| Risk | Required contextual disclosure |
|---|---|
| Rural scope | Use “rural” in question, chart, table, API metadata, export and citation wherever applicable |
| Estimates/sampling | State that values are survey estimates and small differences may not be meaningful without uncertainty analysis |
| District precision | Mark district estimates as wider-uncertainty grade-band estimates |
| Cohort interpretation | Trends compare different samples/cohorts, not longitudinal progress of the same children |
| Causality | School-type, geography and time differences are descriptive; no causal claim |
| Construct mixing | All-children, school-type weighted, and district grade-band measures remain visibly distinct |
| Missing/suppressed | Missing, suppressed, unavailable and non-comparable are distinct from zero |
| Rounding | Explain display precision and that totals/differences can vary because of rounding |
| Ranking | Rank is descriptive for the selected cut and should not imply school-system quality or statistical significance |
| Source corrections | Identify the data release and link errata/superseding releases |

A general disclaimer must never be used to justify a misleading headline. If the interface invites an incorrect inference, change the interface and wording.

### 18.7 Repository README disclaimer

Place the following near the top of the README, after the project summary and before strong quality claims:

> **Unofficial, independent, AI-assisted project**
>
> This repository and website are independently maintained and are not affiliated with or endorsed by ASER Centre, Pratham Education Foundation, or any government body. Generative AI assisted development. The maintainer is responsible for the published release. Official ASER reports remain authoritative; verify consequential figures using the linked source and page.

The README’s licence section must then state:

> The software licence applies only to original project code and other material explicitly identified as covered. It does not grant rights to ASER/Pratham reports, names, logos, trademarks, third-party materials, or any data/content for which the project does not own or control the rights. See `DATA_LICENSE.md`, `NOTICE.md`, and `sources/manifest.yaml` for item-specific terms and provenance. Do not redistribute a source PDF merely because this repository links to it.

The README must not say “open source data” unless the applicable data licence actually grants those rights. Prefer “publicly accessible source-linked data explorer” while rights remain unresolved.

### 18.8 Downloads, API, charts, and share links

Every CSV, Parquet, portable database, JSON/API response, PNG, printable report, and share page must retain enough notice to remain safe when separated from the website.

Minimum machine/human fields:

- Project name and `unofficial_independent_project: true`.
- No-affiliation statement or stable URL to it.
- Application version/commit and immutable data-release ID.
- Generation/download timestamp.
- Question/context, population, geography scope, year, subgroup, unit, and construct.
- Source publisher, document title/edition, official URL, exact page/table, and source ID.
- Comparability, missingness/suppression, and uncertainty/caveat fields.
- AI-assistance disclosure URL and validation-report URL.
- Project/data/source licence and notice URLs.
- Correction/takedown contact or issue URL.

CSV/Parquet/JSON should include metadata in a companion manifest when the format cannot carry it cleanly. PNG/report exports must show a concise source and independent-project line and provide a visible URL/QR only if accessible and tested. A screenshot or downloaded chart must not lose the word “rural,” the subgroup, the year, or the source page.

Suggested export footer:

> Unofficial independent analysis; not endorsed by ASER Centre/Pratham. Verify against the cited official report and page. Survey estimate—interpret small differences cautiously. Release: `<data-version>`.

Suggested API top-level metadata:

```json
{
  "projectStatus": "independent_unofficial",
  "affiliation": "none",
  "dataRelease": "vX.Y.Z",
  "sourceAuthority": "official source document linked per observation",
  "aiAssistanceDisclosure": "https://<production-domain>/about#ai-assistance",
  "limitations": "https://<production-domain>/about#responsible-use",
  "licences": "https://<repository>/blob/<tag>/NOTICE.md"
}
```

### 18.9 Repository code, security, and novice-maintainer disclaimer

The repository should be candid without undermining trust:

- State that it is maintained by an independent developer and provide the supported/release status.
- State which branches/releases are stable; do not invite production use from `main` without a support policy.
- Explain that AI-assisted code can contain security, privacy, dependency, accessibility, and logic defects despite tests.
- Direct users to immutable releases, checksums, known issues, security policy, and supported versions.
- Do not say “use at your own risk” as a substitute for patching known critical/high vulnerabilities.
- Do not publish personal contact details unnecessarily; use a monitored project address or private vulnerability-reporting mechanism.
- State that forks and downstream deployments are operated by their maintainers and may differ from the official repository release.
- State that no uptime, API stability, support response, or backward compatibility is promised unless an explicit policy provides it.

Suggested repository safety wording:

> This is an independently maintained, AI-assisted software project. Tests and review reduce but do not eliminate defects. Review the code, dependencies, licences, security policy, data provenance, and known issues before operating a public or consequential deployment. Use a tagged release rather than an arbitrary commit. Forks and third-party deployments are not controlled or endorsed by this project.

### 18.10 Privacy, telemetry, cookies, and third-party services

The project needs its own privacy notice; it must not link to ASER/Pratham’s privacy policy as though that policy governs this independent site.

The notice must inventory the actual production system:

- Vercel request/function/build logs and retention.
- Managed PostgreSQL provider, regions, backups, access and retention.
- Analytics, Web Vitals, error monitoring, uptime monitoring, WAF/rate limiting, CDN and DNS.
- Cookies/local storage, URL query parameters and referrer leakage.
- GitHub issues/discussions, contact forms, email and security reports.
- Source-report links and other third-party navigation.
- IP address, device/browser, timestamp, request path and any other logged data.
- Purposes, lawful basis where applicable, processors, cross-border transfers, retention, security, deletion/access/contact procedure, children’s data posture, and change history.

Default privacy-minimising direction:

1. No account, profile, advertising, tracking pixel, or behavioural analytics for launch.
2. Do not place personal or sensitive data in URLs.
3. Use aggregate operational monitoring with the shortest practical retention.
4. Do not intentionally collect information about individual children, teachers, households, or schools through this explorer.
5. If feedback forms are later added, collect the minimum information and publish the relevant notice before collection.
6. Obtain legal review before claiming consent, lawful basis, DPDP compliance, GDPR compliance, COPPA compliance, or “anonymous” analytics.

Copy-ready privacy summary, only if verified:

> This explorer does not require an account and is not intended to collect information about individual children. The hosting and security providers may process technical request data such as IP address, device/browser information, requested URL, and timestamps to deliver and protect the service. See the Privacy Notice for the current provider list, purposes, retention, and contact route. Do not submit personal, confidential, or child-level information through URLs, issues, or feedback channels.

### 18.11 Copyright, attribution, trademark, correction, and takedown process

The site and repository must include a dedicated rights-contact process:

1. Identify the disputed URL/file/release/source ID and the claimant/rightsholder.
2. Request a description of the right or attribution concern and preferred remedy.
3. Acknowledge receipt within a published target.
4. Preserve internal evidence while temporarily restricting clearly high-risk content when appropriate.
5. Verify the claim and source permission with the rights owner or counsel.
6. Correct attribution, replace a link, remove an unauthorised asset, or publish a superseding release as appropriate.
7. Record the action in the release/source manifest without exposing unnecessary personal information.
8. Retest all affected UI/API/export/source links and downstream release assets.

Suggested notice:

> ASER and Pratham names, report titles, source materials, and any associated marks belong to their respective owners. Their use here is for identification, citation, and source linkage and does not imply affiliation or endorsement. If you are a rightsholder or believe material is incorrectly attributed or used, contact `<rights-contact>` with the relevant URL and details. The maintainer will review the request and take appropriate action.

Do not use ASER/Pratham logos, trade dress, or domain naming in a way that suggests official status. A disclaimer cannot reliably cure a confusing brand presentation.

### 18.12 Contributing and AI-generated submissions

`CONTRIBUTING.md` and the pull-request template should require contributors to confirm:

- They have the right to submit the code, data, source file, text, image, translation, or other material.
- They identify third-party and AI-generated/AI-assisted content.
- They do not include confidential data, credentials, personal data, or unauthorised child-level data.
- Data changes include official source/page evidence and pass the two-person verification policy where applicable.
- AI-assisted code receives human review, tests, licence/dependency review, and security scrutiny.
- The contribution is made under the project’s documented contribution/licensing terms.

No contributor declaration should claim ownership of ASER/Pratham source material. Consider Developer Certificate of Origin or a contributor licence agreement only after owner/legal review; Claude must not choose between them silently.

### 18.13 Disclaimer placement matrix

| Surface | Required notice |
|---|---|
| Homepage/footer | Short independent/no-endorsement/AI/source-verification notice |
| About | Full Section 18.4 notice, methodology and statistical limitations |
| Question/headline/ranking | Contextual rural/estimate/construct/ranking caveats |
| District views | District grade-band and higher-uncertainty notice |
| Trend/comparison | Different-cohort and non-causality notice |
| Source links | Official-source primacy and third-party-navigation treatment |
| CSV/Parquet/portable DB | Companion manifest with status, release, source, licence, limitations |
| PNG/report/share | Visible independent/source/release/caveat footer |
| API | Machine-readable project status, release, source, limitations and licence links |
| README | Unofficial AI-assisted notice near top; separated code/data/source licensing |
| Repository releases | Release-specific AI/review/known-issues/rights statement |
| `LICENSE` | Selected software licence text only |
| `DATA_LICENSE.md` | Rights for normalized/derived data, distinct from source reports |
| `NOTICE.md` | Third-party ownership, attribution, marks, permissions, exclusions |
| `sources/manifest.yaml` | Per-source rights, checksum, official URL and redistribution status |
| `SECURITY.md` | Private reporting and supported-version disclaimer |
| Privacy notice | Actual telemetry/processors/retention/rights/contact |
| Issue/PR forms | Warning not to submit personal/confidential/child-level or unauthorised content |
| 404/error/outage | No fabricated/cached values; links to status/source where relevant |

### 18.14 Disclaimer-specific defect register

#### DISC-P0-001 — Independent status, rights, and source ownership are not comprehensively disclosed

- **Severity:** P0 legal/reputation blocker.
- **Observed:** README states independence, but the complete no-affiliation, no-endorsement, source-rights, marks, redistribution, and takedown contract is not implemented across the site/repository.
- **Expected:** Sections 18.2–18.4, 18.7, 18.11 and the placement matrix are implemented with counsel/owner review.
- **Acceptance:** A reasonable user cannot mistake the project for an official ASER/Pratham product; rights inventory and reporting route pass.
- **Related:** DEC-001–003, LEGAL-P0-001, OSR-P0-001.

#### DISC-P1-001 — AI assistance and human verification scope are not disclosed precisely

- **Severity:** P1.
- **Observed:** The project does not provide a release-level, evidence-matched statement of where AI was used and what human/source verification occurred.
- **Expected:** Section 18.5 factual record and correct wording variant are published; no implied vendor endorsement or absolute accuracy claim.
- **Acceptance:** AI disclosure matches documented development/data history and validation evidence for the release.
- **Related:** DATA-P1-002, DOC-P1-001, OSR-P1-002.

#### DISC-P1-002 — Contextual statistical and consequential-use warnings are incomplete

- **Severity:** P1 analytical-trust blocker.
- **Observed:** Some README caveats exist, but every separated UI/export/API surface does not consistently retain rural scope, sampling, district uncertainty, cohort, causality, construct, missingness and ranking limitations.
- **Expected:** Section 18.6 is applied contextually; downloads and screenshots remain interpretable independently.
- **Acceptance:** Persona tests cannot produce a decontextualised claim that loses population, release, unit, source or material limitation.
- **Related:** UAT-P0-003/004, UAT-P1-005/009, DATA-P1-001.

#### DISC-P1-003 — Privacy notice and data-flow disclosure are absent

- **Severity:** P1.
- **Observed:** No verified public inventory covers Vercel/database/logging/monitoring/analytics/cookies/feedback and retention.
- **Expected:** Section 18.10 is implemented from an actual production data-flow inventory and counsel-reviewed.
- **Acceptance:** Browser/storage/network inspection and provider settings agree with the notice; unapproved analytics are disabled.
- **Related:** DEC-009, OPS-P2-002, SECURITY-P1-003.

#### DISC-P1-004 — Disclaimers do not yet travel with API and downloadable artifacts

- **Severity:** P1.
- **Observed:** Current exports carry some source attribution but not the complete independent status, release identity, limitations, AI disclosure and licence/notice metadata.
- **Expected:** Section 18.8 metadata is preserved in or beside every portable artifact.
- **Acceptance:** Detached CSV/Parquet/JSON/PNG/report remains attributable, versioned, caveated and reportable.
- **Related:** UAT-P0-003, UAT-P1-009, DATA-P1-001, OSR-P1-003/004.

#### DISC-P2-001 — Contributor and novice-maintainer risk disclosures are incomplete

- **Severity:** P2.
- **Observed:** No complete AI-assisted contribution, rights certification, personal-data warning, stable-release, fork, support or compatibility statement.
- **Expected:** Sections 18.9 and 18.12 are implemented after owner/legal policy decisions.
- **Acceptance:** Contributor/fork/security personas identify the stable release, support limits, rights obligations and safe reporting route without assistance.
- **Related:** OSR-P1-005, GIT-P1-001/002.

### 18.15 Disclaimer testing battery

| Test ID | Test | Expected |
|---|---|---|
| BAT-DISC-001 | Homepage identity test | Independent/unofficial/no-endorsement status visible without opening legal terms |
| BAT-DISC-002 | Novice comprehension test | User correctly identifies publisher, project maintainer, official source and verification need |
| BAT-DISC-003 | Brand-confusion review | Name, logo, colours, domain and copy do not imply official ASER/Pratham status |
| BAT-DISC-004 | AI disclosure audit | Wording matches actual AI use, human review and release evidence |
| BAT-DISC-005 | Source-rights audit | Every PDF/Markdown/data/media item has explicit rights treatment |
| BAT-DISC-006 | Consequential-use journey | Policy/journalist/parent user sees material caveats before relying on a result |
| BAT-DISC-007 | Detached CSV test | Release, scope, unit, source, licence and limitations remain available |
| BAT-DISC-008 | Detached PNG/report test | Visible independent/source/release/caveat footer survives download |
| BAT-DISC-009 | API metadata test | Machine-readable status/release/source/limitations/licence fields validate |
| BAT-DISC-010 | Share-link test | Recipient sees same context and disclaimer as originator |
| BAT-DISC-011 | Privacy truth test | Notice matches cookies, storage, network calls, logs, providers and retention |
| BAT-DISC-012 | No-personal-data path | URLs/issues/forms warn against child-level, confidential or personal submissions |
| BAT-DISC-013 | External-link test | Official-source links are identified as third-party and do not imply control |
| BAT-DISC-014 | Correction/takedown test | Data, rights, privacy, accessibility and security routes reach monitored owners |
| BAT-DISC-015 | Accessibility test | Notices are readable, keyboard-reachable, screen-reader coherent and not colour-only |
| BAT-DISC-016 | Mobile/reflow test | Critical disclaimer is not clipped, hidden, overlapped or collapsed by default |
| BAT-DISC-017 | Licence separation test | Software licence cannot reasonably be read as licensing ASER reports/marks/data |
| BAT-DISC-018 | Release consistency test | Site, README, About, API, exports and release notes use consistent factual wording |
| BAT-DISC-019 | Error/outage test | Failure state does not invent results and retains project/source/reporting context |
| BAT-DISC-020 | Counsel/owner review gate | Named reviewer approves final legal/privacy/rights language and records date/scope |

### 18.16 Implementation and release gate

Implementation order:

1. Resolve DEC-001–003 and inventory actual AI use, human review, source rights, marks, production data flows, processors, logs, analytics, contact routes and jurisdictions.
2. Obtain qualified legal/privacy review of final wording and policies.
3. Implement one canonical disclaimer/notice content source so footer, About, README, API metadata and exports cannot drift.
4. Add contextual analytical warnings at the point of interpretation.
5. Add portable metadata to every export/API/release artifact.
6. Implement monitored correction, rights/takedown, privacy, accessibility and private security channels.
7. Add contributor declarations and repository/release notices.
8. Execute BAT-DISC-001–020 across supported browsers, mobile layouts, assistive technologies and detached artifacts.

**Disclaimer release gate:** public production promotion remains blocked until DISC-P0-001 and all DISC-P1 findings pass, BAT-DISC-001–020 have evidence, and the exact published wording has owner and qualified legal/privacy review. No disclaimer permits publication of content without rights, excuses a known defect, transfers responsibility to an AI tool, or replaces verification against the official ASER source.

---

## 19. ASER research and policy methodology review, 2021–2026

### 19.1 Review purpose, scope, and limitation

This addendum tests whether the current product can responsibly support the kinds of questions for which ASER evidence has been used in recent research and policy work. It is a **targeted, representative evidence review**, not a claim to have identified every paper, book chapter, working paper, government document, presentation, or citation that mentioned ASER during 2021–2026.

The review used:

- official ASER survey, tool, report, trend, technical, and policy-reference material;
- recent Indian policy documents that used ASER evidence;
- recent multilateral policy material;
- recent peer-reviewed or research-institution work illustrating common ASER analytical workflows;
- the observed application, local database, APIs, exports, About content, README, and source-lineage behaviour already recorded in this UAT.

This section distinguishes:

1. questions the current aggregate explorer can answer descriptively;
2. questions it can answer only with explicit qualifications;
3. questions requiring ASER microdata, survey-design variables, external datasets, or causal methods that the product does not contain;
4. wording or functionality that can cause a user to make a stronger claim than the evidence supports.

No legal breach by the application was established through this methodology review. “Violation” below means a conflict with the product’s own stated caveats, an official construct/denominator, or responsible statistical interpretation. Copyright, trademark, data-rights, privacy, and legal-compliance decisions remain subject to Sections 11, 14, and 18 and qualified legal review.

### 19.2 Evidence corpus and what each source requires

#### Official ASER methodology and source material

| Source | Material reviewed | Requirement or constraint relevant to the explorer |
|---|---|---|
| [ASER process documents](https://asercentre.org/process-documents/) | Household sampling and field process | ASER samples households rather than children; all children in the relevant household age range are listed, with learning assessments for the applicable ages. The sample is clustered and rural. |
| [ASER technical papers](https://asercentre.org/technical-papers/) | Precision and assessment-tool papers | Precision, tool validity, and survey-design effects must be treated as analytical requirements rather than generic footnotes. |
| [Precision of ASER estimates](https://img.asercentre.org/docs/Aser%20survey/Technical%20Papers/precisionofaserestimates_ramaswami_wadhwa.pdf) | Historical state/district precision analysis | Cluster design increases variance; district precision varies; confidence bands are necessary for defensible targeting or above/below-norm classification. Historical results do not justify one universal current margin of error. |
| [ASER 2024 report](https://asercentre.org/wp-content/uploads/2022/12/ASER_2024_Final-Report_25_1_24.pdf) | Current report methodology and tables | Two-stage clustered design, 30 villages and 20 households per sampled district, Census 2011 frame, rotating village panel, and weighting requirements must be retained in methodological interpretation. |
| [About ASER 2024](https://asercentre.org/about-aser-2024/) | Scope and policy context | ASER 2024 is a rural household survey with learning, enrolment, parental-education, age-grade, and digital components. The present explorer covers only a selected subset. |
| [ASER survey and data-access description](https://asercentre.org/sandbox/) | Survey population and microdata access | Underlying survey coverage is broader than the grade-enrolled aggregate tables currently exposed. Research microdata access requires a separate ASER Centre process. |
| [ASER assessment tools](https://asercentre.org/aser-tools/) | Reading and arithmetic construct definitions | Reading and arithmetic ladders are progressive but are not a shared proficiency scale. The highest reading task is a Grade II-level story; it is not a generic grade-level standard for every grade. |
| [ASER 2018 national findings](https://img.asercentre.org/docs/ASER%202018/Release%20Material/enrollmentandlearningenglish.pdf) | Construct, category, subgroup, and trend definitions | Reading categories are mutually exclusive; the Grade II text is discussed as a grade-level proxy for Grade III in the cited context; government/private weighted results exclude other school types. |
| [ASER trends over time](https://asercentre.org/trends-over-time-reports/) | Official trend products | Trend interpretation must identify the exact edition, table, population, subgroup, and comparability basis for every point. |
| [ASER references in Indian policy documents](https://asercentre.org/aser-indian-policy-documents/) | Policy-use inventory | Policy uses are broader than this product’s selected learning aggregates and frequently require contextual evidence. |

#### Recent policy and multilateral material

| Source | ASER use represented | Current-system assessment |
|---|---|---|
| [Economic Survey 2025–26, education and health chapter](https://www.indiabudget.gov.in/economicsurvey/doc/eschapter/echap11.pdf) | National rural Grade III learning trends alongside maternal education, age of school entry, Anganwadi participation, enrolment, and policy context | **Partial.** The explorer may support a narrow learning-trend reproduction after exact denominator/table reconciliation. It does not support the contextual or explanatory analysis. |
| [Economic Survey 2021–22](https://www.indiabudget.gov.in/economicsurvey/ebook_es2022/files/basic-html/page384.html) | ASER phone-survey evidence on smartphones and the digital divide | **Unsupported.** The explorer intentionally excludes the 2020–21 phone rounds and should say it cannot answer this use case. |
| [UNESCO/NEQMAP discussion of ASER 2022](https://neqmap.bangkok.unesco.org/activity/webinar-findings-from-the-annual-status-of-education-report-aser-2022/) | National and state post-pandemic education outcomes | **Partial.** Published descriptive values can be explored, but categorical change, ranking, and causal language require correction. |
| [UNESCO/NEQMAP India policy-to-classroom material](https://neqmap.bangkok.unesco.org/wp-content/uploads/2022/12/1-NEQMAP_ACER_India_2022_v1.1.pdf) | ASER alongside other national evidence including NAS | **Unsupported for direct cross-assessment comparison.** ASER and NAS values must not be numerically equated without a documented methodological crosswalk. |
| [UNESCO entry for ASER 2023 Beyond Basics](https://learningportal.iiep.unesco.org/fr/bibliotheque/annual-status-of-education-report-rural-2023-beyond-basics) | Youth pathways, applied skills, digital access, and aspirations | **Unsupported.** These constructs are outside the loaded explorer dataset. |
| [UNESCO GEM South Asia 2022 report on non-state actors](https://www.unesco.org/gem-report/en/publication/2022-south-asia-report-non-state-actors-education) | Private/non-state education policy analysis | **Descriptive support only.** Raw government/private differences cannot establish effectiveness, quality, or causal impact. |

#### Recent research workflows

| Source | Research requirement illustrated | Current-system assessment |
|---|---|---|
| [Assessing the assessments: Taking stock of learning outcomes data in India](https://pmc.ncbi.nlm.nih.gov/articles/PMC8246517/) | Intended-use distinctions, survey-design differences, and careful ASER/NAS interpretation | The explorer needs an intended-use matrix and an explicit prohibition on direct cross-assessment numerical comparison. |
| [Learning equity requires more than equality](https://pmc.ncbi.nlm.nih.gov/articles/PMC7994297/) | Child/household microdata, wealth proxies, and age/grade equity analysis | Unsupported by the aggregate schema. The product must direct users to the official microdata-access route instead of implying broad equity-analysis coverage. |
| [Do Private Schools Improve Learning Outcomes?](https://www.journals.uchicago.edu/doi/10.1086/716448) | Within-household controls and selection in school-type comparisons | Current “leads by” wording is unsafe. Observed subgroup differences are not school-type effects. |
| [Learning in India’s primary schools: How do disparities widen across grades?](https://www.sciencedirect.com/science/article/pii/S0738059316303807) | Survey weights, clustered standard errors, and child/household covariates | The current aggregates cannot support inferential disparity modelling and must not imply that they do. |
| [Has India’s learning crisis really worsened?](https://www.sciencedirect.com/science/article/pii/S0738059326000210) | Historical measurement error and trend interpretation | The app begins after the most directly discussed early-period risk, but “same design since 2005 makes trends meaningful” remains too absolute. |
| [Village dominance and learning gaps in rural India](https://www.sciencedirect.com/science/article/pii/S016726812300464X) | Social structure and microdata-based inequality mechanisms | Unsupported by the aggregate explorer. |
| [Impact of Early Childhood School Intervention](https://docs.iza.org/dp16167.pdf) | Child, household, village, and external administrative variables | Unsupported without microdata and documented external-data joins. |
| [ASER-based private-school analysis](https://ftp.iza.org/dp10612.pdf) | Confounding in raw public/private comparisons | Reinforces the requirement to remove causal/winner language and foreground composition limits. |
| [Relative effectiveness of private and government schools](https://ideas.repec.org/p/qss/dqsswp/1003.html) | Fixed effects/panel-style analytical methods | Unsupported by point-estimate aggregate cards. |
| [Extending ASER across South Asia](https://www.sciencedirect.com/science/article/abs/pii/S0738059324001792) | System-level use of citizen-led assessment | Supports descriptive system monitoring, not exact point ranking without precision information. |

### 19.3 Current product capability boundary

#### Supported, subject to existing data and lineage defects being fixed

- Descriptive exploration of selected published rural ASER aggregate learning tables.
- Exact reading or arithmetic distributions when the screen retains the official construct, grade/grade-band, population, subgroup, geography, year, unit, and source.
- Selected national and state point estimates.
- Selected trend displays when every point is genuinely comparable and has per-observation provenance.
- Source discovery and verification when the correct report edition, table/page, and official URL travel with each value.

#### Partially supported and requiring prominent qualification

- National or state trend summaries.
- Post-pandemic comparisons.
- Government/private descriptive subgroup differences.
- State or district ordering by published point estimate.
- District grade-band exploration.
- Use in a briefing, presentation, article, or policy note.

These uses are acceptable only when the interface and export state that values are survey estimates, the sample is rural and clustered, small differences may not be meaningful, ranks are point-estimate ordering rather than statistically distinct positions, and subgroup differences are non-causal.

#### Unsupported by the current data model

- Child-level, household-level, village-level, school-level, or teacher-level analysis.
- Wealth, caste, gender, disability, parental education, household composition, age, age-grade distortion, attendance, enrolment, out-of-school status, digital access, aspirations, or applied-skills analysis unless those variables are separately and validly added.
- Survey-weighted regression, clustered standard errors, confidence intervals derived from microdata, matching, fixed effects, causal inference, programme-impact evaluation, or longitudinal child analysis.
- Direct ASER/NAS/PARAKH/international-assessment score comparisons.
- Claims about urban India or all of India where the source population is rural.
- School, teacher, state, or district quality/effectiveness conclusions from the loaded aggregates.
- High-stakes resource allocation based only on displayed point ranks.
- Reproduction of all ASER policy uses or all ASER publications.

The absence of these capabilities is not itself a product defect if the product is explicitly scoped as a selected published-aggregate explorer. It becomes a defect when product language, search metadata, README claims, UI labels, or exports imply broader ASER research coverage.

### 19.4 Methodology defect register

#### ASER-METH-P1-001 — One-percentage-point change rule creates unsupported improvement verdicts

- **Severity:** P1 analytical-trust and public-release blocker.
- **Confidence:** High.
- **Affected personas:** Journalist, policy analyst, state officer, researcher, presentation user.
- **Observed:** `app/components/related.tsx` classifies endpoint change above `1` percentage point as `up`/`Yes`, below `-1` as `down`/`No`, and otherwise as broadly unchanged. The answer is built from point estimates without an observation-specific standard error or confidence interval.
- **Why this matters:** A one-point movement can be smaller than sampling uncertainty. The UI therefore converts an arithmetic difference into an evidential verdict the available data cannot support.
- **Expected:** Until valid uncertainty is available, state only that the published point estimate increased, decreased, or differed by the displayed number of percentage points. Do not answer “Did outcomes improve?” with `Yes` or `No`.
- **Fix direction:** Separate arithmetic direction from statistical and substantive interpretation; add an `interpretability` state to the analytical view model.
- **Acceptance criteria:**
  1. No categorical improvement/decline verdict is produced solely from a fixed one-point threshold.
  2. The card says statistical significance cannot be determined when uncertainty is unavailable.
  3. The wording survives CSV, PNG, share-link, and screen-reader output.
  4. Tests cover `-10`, `-4`, `-1.1`, `-0.9`, `0`, `0.9`, `1.1`, `4`, and `10` point changes.
- **Related:** DISC-P1-002, UAT-P1-005.

#### ASER-METH-P1-002 — Exact ranks and “leads” imply unsupported precision

- **Severity:** P1 analytical-trust and policy-use blocker.
- **Confidence:** High.
- **Affected personas:** State officer, district officer, policy analyst, journalist.
- **Observed:** State and district cards display exact ordinal ranks and “leads by X points” without sample size, effective sample size, standard error, confidence interval, or an indistinguishable/tie policy. The About content nevertheless tells users to read state ranking as evidence.
- **Oracle:** The official ASER precision paper explains that clustered sampling raises variance and that district targeting/classification requires precision estimates relative to a norm.
- **Expected:** Clearly label ordering as ordering of published point estimates. Do not imply that adjacent places are statistically different or that rank alone supports resource targeting.
- **Fix direction:** Introduce a ranking-policy module. Until current uncertainty data exists, use neutral “point-estimate order,” remove winner/best/worst implications, and add a prominent district targeting warning.
- **Acceptance criteria:**
  1. Rank labels and exports say `rank by published point estimate`.
  2. No “best,” “worst,” “winner,” “outperform,” or unqualified “lead” is generated.
  3. District pages say not to allocate resources from rank alone.
  4. A future uncertainty-enabled mode has documented overlap/tie logic and tests.
- **Related:** UAT-P0-003, DISC-P1-002.

#### ASER-METH-P1-003 — Reading-versus-arithmetic “lead” compares non-equivalent constructs

- **Severity:** P1 misleading-analysis blocker.
- **Confidence:** High.
- **Affected personas:** Foundational-learning lead, teacher, journalist, policy analyst.
- **Observed:** The comparison card compares equally positioned reading and arithmetic ladder rungs and declares one subject to “lead,” while adjacent explanatory text acknowledges that the tasks are not equivalent.
- **Why this matters:** A Grade II-level story and division are different constructs, not points on a common scale. The numerical difference is calculable but does not establish that one domain is ahead.
- **Expected:** Present reading and arithmetic as separate distributions with their official task labels; do not compute or narrate a winner.
- **Acceptance criteria:**
  1. No subject “lead,” rank, or winner is shown across non-equivalent tasks.
  2. The interface states that percentages are not on a shared proficiency scale.
  3. Exports and accessible descriptions preserve that limitation.
  4. Tests fail if a generic difference narrator is reused across unlike constructs.
- **Related:** UAT-P0-004, ARCH-P1-005.

#### ASER-METH-P1-004 — Grade II text is over-described as generic grade-level reading

- **Severity:** P1 construct-validity blocker.
- **Confidence:** High.
- **Affected personas:** Beginner, teacher, parent, researcher, journalist.
- **Observed:** About/methodology wording treats the Grade II story as ASER’s general proxy for “grade-level reading.” The official 2018 source uses the grade-level proxy formulation for Grade III in the cited context, not for every selected grade.
- **Expected:** Use the literal construct `can read a Grade II-level text`. Restrict any grade-level interpretation to the exact official context and citation.
- **Acceptance criteria:**
  1. Question, headline, ladder, table, About, API, CSV, PNG, metadata, and SEO use the official task description.
  2. No generic grade-level claim is generated for Grades V, VIII, grade bands, or unspecified grades.
  3. Construct-copy tests cover every indicator and grade.
- **Related:** DATA-P1-001, DISC-P1-002.

#### ASER-METH-P1-005 — Survey reach and analytical denominator can be conflated

- **Severity:** P1 population/denominator blocker.
- **Confidence:** High.
- **Affected personas:** Policy analyst, researcher, journalist, beginner.
- **Observed:** The About content accurately notes that ASER’s household design reaches out-of-school children, while the explorer’s grade-specific learning tables describe children enrolled in the selected grade/school-type population. Labels such as `all children` and `all schools` do not always expose that distinction.
- **Expected:** Every result states population, age/grade criterion, enrolment condition, school-type inclusion, rural scope, geography, year, and unit.
- **Acceptance criteria:**
  1. `All` is never rendered without a human-readable denominator definition.
  2. Grade-enrolled results cannot be read as all children found in sampled households.
  3. The denominator is present in detached API/export artifacts.
  4. Tests distinguish household-survey reach, all grade-enrolled children, government/private weighted children, and district grade-band children.
- **Related:** UAT-P0-004, DATA-P1-001, DISC-P1-002.

#### ASER-METH-P1-006 — Comparability caveats are stored but flattened in trend eligibility

- **Severity:** P1 trend-validity blocker.
- **Confidence:** High.
- **Affected personas:** Researcher, journalist, policy analyst.
- **Observed:** The data model contains `directly_comparable` and `comparable_with_caveats`, but trend retrieval/rendering admits both without making the specific caveat a first-class visible and portable part of each point or transition.
- **Expected:** Every point and transition exposes the exact comparability category, reason, edition, and source. A continuous trend claim must not cross an incompatible change.
- **Acceptance criteria:**
  1. `comparable_with_caveats` is not silently treated as equivalent to `directly_comparable`.
  2. The specific caveat appears on screen, in the accessible table, API, CSV, PNG/report metadata, and citation.
  3. Incompatible points break or suppress the trend rather than being connected.
  4. Tests cover direct, caveated, incompatible, missing, suppressed, and mixed-edition series.
- **Related:** UAT-P0-003, UAT-P1-005, DATA-P1-001.

#### ASER-METH-P1-007 — Blanket uncertainty wording is not observation-specific

- **Severity:** P1 methodology blocker.
- **Confidence:** High.
- **Affected personas:** District officer, state officer, journalist, researcher.
- **Observed:** About/README language gives a general state-level margin range and says district uncertainty is greater, but the database does not store observation-level sample size, standard error, confidence interval, weight, numerator/denominator, strata, or cluster information.
- **Expected:** Either provide current, source-backed uncertainty for the exact observation or state clearly that it is unavailable. Historical precision evidence may be described only with its period and scope.
- **Acceptance criteria:**
  1. No universal margin is presented as applying to all states, districts, years, indicators, or subgroups.
  2. Missing uncertainty is machine-readable and visible at the point of ranking/change interpretation.
  3. Any numeric precision statement has an exact source, date, population, and applicability note.
  4. Rankings and change narratives degrade safely when uncertainty is absent.
- **Related:** ASER-METH-P1-001/002, DISC-P1-002.

#### ASER-METH-P1-008 — Government/private comparison language invites causal inference

- **Severity:** P1 policy-interpretation blocker.
- **Confidence:** High.
- **Affected personas:** Policy analyst, journalist, teacher, presentation user.
- **Observed:** The product uses `leads by X` for government/private differences. A caveat exists, but the headline still foregrounds a winner. The current aggregates contain no controls for household selection, socioeconomic composition, geography, or other confounding.
- **Expected:** Use `observed difference between published subgroup estimates`; place the non-causal limitation next to the number and in detached artifacts.
- **Acceptance criteria:**
  1. No `effect`, `impact`, `better school`, `school quality`, `outperform`, or unqualified `lead` wording is generated.
  2. Users see that composition and selection are uncontrolled before copying/exporting the result.
  3. The system does not recommend a school type or policy from the raw difference.
  4. Regression tests cover positive, negative, equal, missing, and suppressed subgroup differences.
- **Related:** DISC-P1-002, ASER-METH-P1-002.

#### ASER-METH-P1-009 — Trend-continuity claim is too absolute

- **Severity:** P1 public-methodology blocker.
- **Confidence:** Medium-high.
- **Affected personas:** Researcher, journalist, policy analyst.
- **Observed:** About content attributes meaningful trends to the “same design since 2005” without a release-by-release qualification. Trend interpretation also depends on instrument, administration, frame, weights, boundary changes, report editions, and measurement conditions.
- **Expected:** Describe continuity precisely and maintain a versioned change log for instrument, sampling frame, field procedure, geography, weighting, table definition, and source corrections.
- **Acceptance criteria:**
  1. No claim of perfect design or measurement invariance appears.
  2. Each trend series identifies its supported start/end years and known caveats.
  3. Source-edition corrections or restatements are versioned rather than silently replacing history.
  4. The literature-review cutoff and change log are dated and reviewable.
- **Related:** ASER-METH-P1-006, DOC-P1-001.

#### ASER-METH-P1-010 — Product scope can be mistaken for general ASER research coverage

- **Severity:** P1 scope and research-use blocker.
- **Confidence:** High.
- **Affected personas:** Researcher, evaluator, policy analyst, open-source user.
- **Observed:** The application is a selected published-aggregate explorer. It does not contain the variables or survey-design information used in many recent ASER research and policy workflows, yet no complete supported/unsupported question matrix is enforced across the product and repository.
- **Expected:** Describe the product as a selected aggregate-table explorer and route unsupported research questions to official reports, trend products, or the ASER Centre microdata-access process.
- **Acceptance criteria:**
  1. Homepage, About, README, API documentation, repository description, SEO text, and release notes agree on scope.
  2. Unsupported topics listed in Section 19.3 are explicitly labelled unsupported.
  3. The interface never fabricates a proxy answer from a different loaded indicator.
  4. Search and documentation tests confirm that “ASER data analysis” is not used as an unqualified promise of comprehensive coverage.
- **Related:** DISC-P0-001, DOC-P1-001, OSR-P1-002.

#### ASER-METH-P1-011 — Policy-chart reproduction lacks a formal series crosswalk

- **Severity:** P1 reproducibility blocker.
- **Confidence:** Medium-high pending exact table-by-table reconciliation.
- **Affected personas:** Policy analyst, researcher, journalist.
- **Observed risk requiring execution:** The Economic Survey 2025–26 presents a 2014–2024 national rural Grade III learning trend alongside contextual analysis. The explorer contains multiple constructs, including an all-children headline series and government/private weighted series with different year availability. A user can select a plausible-looking but different denominator.
- **Expected:** A policy-reproduction fixture identifies the exact official ASER table, years, population, school-type treatment, values, rounding, and pages before declaring the chart reproducible.
- **Acceptance criteria:**
  1. Every reproduced policy chart has a signed value/denominator/source crosswalk.
  2. The explorer either exactly reproduces the cited series or states why it cannot.
  3. No school-type-derived series is substituted for an all-children policy series without explicit source authorization.
  4. The fixture is rerun on every data release.
- **Status:** **Not executed; must not be marked pass.**
- **Related:** UAT-P0-003, DATA-P1-001.

#### ASER-METH-P2-012 — Geography boundary/version metadata is insufficient for longitudinal joins

- **Severity:** P2, promoted to P1 for any district longitudinal or external-join feature.
- **Confidence:** High.
- **Affected personas:** Researcher, district officer, open-data developer.
- **Observed:** The public observation schema does not expose a clear boundary vintage, stable geography identifier, split/merge lineage, or join policy.
- **Expected:** Geography entities have stable IDs, display names, parent IDs, boundary/reference vintage, aliases, and split/merge lineage.
- **Acceptance criteria:**
  1. District/state names are not the sole join key.
  2. Renames, splits, merges, and parent changes are versioned.
  3. Unsupported longitudinal joins are rejected or caveated.
  4. API/export metadata retains geography IDs and vintage.
- **Related:** DATA-P1-001, ARCH-P1-005.

### 19.5 Research-question and claim taxonomy required in the product

Every analytical output must be assigned one claim class:

| Claim class | Example | Product treatment |
|---|---|---|
| Official published value | “The cited ASER table reports 27.0%” | Permitted with exact population, edition, table/page, URL, and rounding |
| Locally derived descriptive value | Weighted aggregate, point difference, or rank | Permitted only with formula, inputs, provenance, and limitations |
| Descriptive association | Government/private published difference | Permitted with prominent non-causal wording |
| Statistical inference | Significant increase, confidence interval, indistinguishable rank | Prohibited until the required design/uncertainty information and validated method exist |
| Causal claim | School type or programme caused a learning outcome | Prohibited from the current aggregate data |
| Policy recommendation | Allocate funding based on district rank | Prohibited as an automated conclusion; requires external evidence and accountable human analysis |

The view-model/API contract should carry `claimClass`, `population`, `construct`, `derivation`, `comparability`, `uncertaintyAvailability`, `permittedInterpretation`, and `prohibitedInterpretation`. UI components must render from these fields rather than infer claims from a generic numeric difference.

### 19.6 Additional methodology testing battery

Status rules remain those in Section 13: `Not executed` and `Blocked` are not passes.

| Test ID | Test | Expected result | Current status |
|---|---|---|---|
| BAT-METH-001 | Official construct dictionary reconciliation | Every UI/API/export indicator maps to one official definition and source | Not executed |
| BAT-METH-002 | Population and denominator matrix | Rural scope, age/grade, enrolment, school type, unit, and exclusions agree on all surfaces | Failed by ASER-METH-P1-005 |
| BAT-METH-003 | Reading-category exclusivity | Exact categories are mutually exclusive and sum within official rounding rules | Partially covered by existing data tests; full source reconciliation not executed |
| BAT-METH-004 | Cumulative ladder derivation | Cumulative rungs derive only from valid exclusive categories with visible formula | Partially covered; detached-artifact semantics not executed |
| BAT-METH-005 | Cross-subject construct guard | Reading and arithmetic are never narrated as a shared scale or winner | Failed by ASER-METH-P1-003 |
| BAT-METH-006 | Improvement-language guard | Point change alone never produces statistical/substantive `Yes` or `No` | Failed by ASER-METH-P1-001 |
| BAT-METH-007 | Rank-language guard | Rank is labelled point-estimate order and never implies statistical separation | Failed by ASER-METH-P1-002 |
| BAT-METH-008 | District targeting guard | No resource-allocation recommendation is produced from raw rank | Not executed |
| BAT-METH-009 | Uncertainty availability | Sample size/SE/CI status is explicit for every observation | Failed by ASER-METH-P1-007 |
| BAT-METH-010 | Overlapping-interval/tie logic | If uncertainty is later loaded, overlap/tie behaviour follows a documented method | Blocked by absent uncertainty data |
| BAT-METH-011 | Comparability-state matrix | Direct, caveated, incompatible, missing, and suppressed states render distinctly | Failed by ASER-METH-P1-006 |
| BAT-METH-012 | Mixed-edition trend | Each point keeps its own report edition, page, URL, and caveat | Failed by UAT-P0-003 |
| BAT-METH-013 | Source restatement/version test | Corrected official values create an auditable release rather than silent replacement | Not executed |
| BAT-METH-014 | Government/private causality guard | Headline, prose, alt text, table, API, CSV, PNG, and share view remain descriptive | Failed by ASER-METH-P1-008 |
| BAT-METH-015 | Out-of-school interpretation guard | Household-survey reach is not conflated with grade-enrolled learning denominator | Failed by ASER-METH-P1-005 |
| BAT-METH-016 | Economic Survey 2025–26 chart reproduction | Exact years, values, denominator, rounding, source edition/page agree | Not executed; release requirement |
| BAT-METH-017 | Economic Survey 2021–22 digital question | Product responds that phone-round/digital evidence is outside loaded scope | Not executed |
| BAT-METH-018 | ASER 2023 Beyond Basics question | Product responds that youth/digital/applied-skills data is outside scope | Not executed |
| BAT-METH-019 | ASER versus NAS/PARAKH request | Product refuses direct score comparison and explains design differences | Not executed |
| BAT-METH-020 | Urban/all-India request | Product does not generalise rural results to urban or all-India populations | Not executed |
| BAT-METH-021 | Equity/wealth/caste/gender request | Product identifies missing variables and does not invent a proxy answer | Not executed |
| BAT-METH-022 | Causal school-effect request | Product says aggregate subgroup differences cannot estimate causal effect | Not executed |
| BAT-METH-023 | Microdata research request | Documentation routes user to official ASER data-access information | Not executed |
| BAT-METH-024 | External-data join | Join requires stable geography IDs, boundary vintage, grain, and denominator checks | Blocked by ASER-METH-P2-012 |
| BAT-METH-025 | Different-cohort trend comprehension | Representative users understand that rounds do not follow the same children | Existing copy observed; formal comprehension test not executed |
| BAT-METH-026 | Rounding and displayed difference | Displayed values, differences, ranks, API, CSV, and official table agree under one rule | Not executed across every construct |
| BAT-METH-027 | Detached analytical artifact | Screenshot/PNG/CSV retains construct, population, claim class, uncertainty status, source, and caveat | Failed by UAT-P0-003 and DISC-P1-004 |
| BAT-METH-028 | Screen-reader methodology context | Accessible name/description includes material denominator and interpretation limits | Not executed with a real screen reader |
| BAT-METH-029 | Mobile methodology context | Caveats remain visible and understandable without expanding hidden legal text | Not executed on physical iOS/Android devices |
| BAT-METH-030 | Literature-change review | Dated review identifies new evidence that changes a claim or comparability rule | Initial targeted review complete; recurring process absent |

### 19.7 Required research and policy documentation

Add the following to the production documentation/source bundle without duplicating competing definitions:

1. **Intended-use and prohibited-use matrix** covering descriptive exploration, policy briefing, targeting, causal inference, academic research, teaching, journalism, and classroom use.
2. **Indicator/construct dictionary** with official label, plain-language label, population, numerator, denominator, unit, aggregation, geography, rural scope, school-type inclusion, years, official source, and caveats.
3. **Survey-design and precision note** covering household sampling, clustering, weights, rotating villages, frame, available/unavailable uncertainty, and the consequences for ranks and small changes.
4. **Research-question coverage matrix** with `supported`, `partially supported`, `unsupported`, and `microdata required`.
5. **Policy-chart crosswalks** recording exact source series for each externally reproduced chart.
6. **Assessment-comparison note** explaining why ASER, NAS/PARAKH, administrative data, and international assessments cannot be directly equated.
7. **Geography/boundary register** with stable identifiers and split/merge history.
8. **Data release/model card** stating included and excluded ASER products, release dates, source editions, derivations, validation evidence, residual risks, and correction procedure.
9. **Research evidence register** with search date, query strategy, inclusion/exclusion criteria, reviewed works, relevance, and interpretation changes.
10. **Official microdata-access link** and an explicit statement that the repository database is not ASER respondent-level microdata.

### 19.8 Methodology implementation order

#### Group M1 — Stop unsupported analytical claims

Fix together:

- ASER-METH-P1-001 change verdict;
- ASER-METH-P1-002 ranking/lead precision;
- ASER-METH-P1-003 cross-subject comparison;
- ASER-METH-P1-008 school-type causality.

Required retest:

- BAT-METH-005–010 and BAT-METH-014;
- all journalist, policy analyst, district officer, and FLN lead journeys;
- screen, table, accessible output, API, CSV, PNG, and share-link wording.

#### Group M2 — Make construct, population, and scope explicit

Fix together:

- ASER-METH-P1-004 Grade II text wording;
- ASER-METH-P1-005 survey population/denominator;
- ASER-METH-P1-010 product capability boundary.

Required retest:

- BAT-METH-001–004, BAT-METH-015, and BAT-METH-017–023;
- homepage, About, README, repository description, SEO, API schema, and every export.

#### Group M3 — Make trend evidence defensible

Fix together:

- ASER-METH-P1-006 comparability state;
- ASER-METH-P1-007 uncertainty wording;
- ASER-METH-P1-009 continuity claim;
- existing UAT-P0-003 and UAT-P1-005.

Required retest:

- BAT-METH-006 and BAT-METH-009–013;
- every available trend combination;
- mixed editions, sparse series, missing/suppressed values, and source restatements.

#### Group M4 — Reconcile policy use and geographic joins

Fix together:

- ASER-METH-P1-011 policy series crosswalk;
- ASER-METH-P2-012 geography/boundary metadata;
- the documentation set in Section 19.7.

Required retest:

- BAT-METH-016, BAT-METH-024, BAT-METH-026, and BAT-METH-030;
- independent reproduction by a policy analyst and a researcher who did not implement the changes.

### 19.9 Methodology release gate and domain sign-off

The methodology verdict is:

**FAIL / BLOCKED FOR UNRESTRICTED RESEARCH OR POLICY USE.**

The current product may become a responsible explorer of selected published ASER aggregates, but it must not be promoted as a comprehensive ASER research platform, causal-analysis tool, or standalone policy-targeting system.

Public promotion requires:

1. ASER-METH-P1-001 through ASER-METH-P1-011 closed with evidence.
2. ASER-METH-P2-012 closed before any district longitudinal/external-join claim.
3. BAT-METH-001–030 executed in applicable environments; blocked/skipped items remain explicit.
4. Exact reproduction and denominator reconciliation of at least the Economic Survey 2025–26 ASER learning series.
5. Per-observation source, edition, page, construct, population, comparability, derivation, and uncertainty-availability metadata.
6. An independent ASER research and policy methodology reviewer signs off on:
   - construct wording;
   - population and denominator;
   - trend comparability;
   - uncertainty and ranking language;
   - school-type interpretation;
   - supported/prohibited use boundaries;
   - policy-chart reconciliation.
7. The reviewer records name/role, date, reviewed release/commit, evidence examined, exceptions, and expiry/re-review trigger.

Until this gate passes, the strongest accurate public description is:

> An independent explorer of selected published ASER rural aggregate tables, intended for descriptive exploration and source discovery. It is not an official ASER product, respondent-level research dataset, causal analysis tool, or standalone basis for ranking, targeting, or consequential policy decisions.

This methodology addendum does not replace the application, data-lineage, production, legal, accessibility, browser/mobile, security, repository, and operational release gates elsewhere in this UAT. All gates are cumulative.

---

## 20. Coding-agent execution contract and multi-agent challenge record

### 20.1 Why this section exists

This document grew from an executed application UAT into a combined application, production, open-source, architecture, disclaimer, and research-methodology release specification. Without an explicit control section, a coding agent could:

- mistake historical observations for current-state truth after the working tree changes;
- count only the original 17 application defects and miss later release blockers;
- perform a PostgreSQL or folder-structure migration as though a recommendation were an approved owner decision;
- freeze known visual or semantic defects into regression snapshots;
- start a large refactor before closing user-facing correctness failures;
- treat one duplicated symptom as several independent fixes;
- claim production readiness after automated tests while mandatory legal, real-browser, assistive-technology, recovery, or methodology evidence remains absent.

Section 20 removes those ambiguities. Where procedural language elsewhere conflicts with this section, **Section 20 governs implementation planning and closure**. Historical test observations, values, URLs, and evidence in Sections 1–19 remain unchanged.

### 20.2 Normative language and precedence

Interpret requirements as follows:

- **Must**, **shall**, **required**, **prohibited**, **release gate**, and **acceptance criterion** are mandatory.
- **Should** and **recommended** describe a preferred direction that may be replaced by an evidence-backed alternative.
- **May** is optional.
- A **likely file** identifies an investigation starting point, not permission to edit blindly.
- A **fix direction** defines the required outcome, not necessarily the exact implementation.
- A target module tree or example type is illustrative unless an owner-approved ADR makes it binding.

Precedence:

1. Current explicit owner instructions.
2. Legal, privacy, source-rights, and security constraints.
3. Section 20 execution and closure rules.
4. Non-negotiable analytical and architectural invariants in Sections 16.12 and 19.
5. Defect-specific expected behaviour and acceptance criteria.
6. Consolidated implementation sequence in Section 20.8.
7. Earlier suggested PR sequences and architecture examples.

If two acceptance criteria genuinely conflict, do not select one silently. Record the IDs, explain the conflict, propose the smallest resolution, and request the owner or named reviewer’s decision.

### 20.3 What is authoritative and what is historical

| Content | How the coding agent must use it |
|---|---|
| Section 1 commit, hashes, working-tree state, and local URL | Historical identity of the tested release candidate; never assume they describe the current tree |
| Sections 3–8 and 13 executed results | Historical evidence and regression oracle; rerun on the new candidate |
| Sections 5, 12.3–12.4, 14.10, 16.23, 18.14, and 19.4 | Open finding registers unless a fresh evidence-backed retest closes an item |
| Sections 11, 14, and 16 target architecture/repository material | Requirements and recommendations; architecture/provider choices remain decision-controlled |
| Copy-ready disclaimer text | Draft content requiring factual placeholder resolution and owner/legal/privacy review |
| Sections 13, 14.9, 16.22, 18.15, and 19.6 | Test specifications; a prior `PASS` applies only to the Section 1 candidate/environment |
| Section 20 | Current coding-agent planning, sequencing, scope, and closure contract |

The original application defect table in Section 2 counts only:

- 4 application P0 findings;
- 7 application P1 findings;
- 5 application P2 findings;
- 1 application P3 finding.

It does **not** count the production-gap, open-source, architecture, disclaimer, or methodology registers. Do not calculate one grand total by adding every cross-reference: several registers describe the same root cause from different release perspectives. Track closure by stable ID and by root-cause work package.

### 20.4 Mandatory re-baseline before implementation

Before editing application, database, configuration, documentation, or infrastructure:

1. Record current branch, commit, remotes, working-tree status, and relevant file hashes.
2. Identify all pre-existing modified/untracked files and attribute them as owner work, prior-agent work, or unknown; preserve unknown work.
3. Record Node/package-manager versions, manifest/lockfiles, dependency state, database checksum/version, migration state, and current row counts.
4. Run the existing test commands that do not mutate user data; record command, exit status, passes, failures, and skips.
5. Reproduce every original P0 and P1 still applicable to the current tree.
6. Recheck every methodology finding that depends on visible copy or current implementation.
7. If a finding no longer reproduces, mark it `FIXED — AWAITING RETEST` until its complete acceptance/regression/persona evidence passes; do not delete the historical finding.
8. Create 15–25 source-backed golden analytical fixtures covering national, state, district, direct, derived, sparse, suppressed, school-type, multi-edition, invalid-link, CSV, and PNG cases.
9. Capture owner-approved visual and semantic references for default, state, district, loading, empty, unavailable, error, About, desktop, and mobile states.
10. Annotate every known defect in baseline evidence so a snapshot cannot convert it into desired behaviour.

If the current candidate differs materially from Section 1, report the delta before using line numbers or observed values from this UAT. File/line references are investigation hints and may have moved.

### 20.5 Change boundaries

#### UI/UX

Preserve the owner-approved visual language, information hierarchy, component character, responsive composition, and interaction model. The following are **required corrections, not prohibited redesign**:

- replacing misleading analytical wording;
- adding necessary population, uncertainty, source, independence, or non-causality context;
- fixing contrast, semantics, focus, touch targets, loading, errors, duplication, and responsive defects;
- preventing a false geography, construct, rank, comparison, or trend interpretation.

Do not introduce a new brand, navigation model, chart style, layout system, component library, or visual redesign without a separate owner decision. A backend/database/platform PR must have no unexplained visual change.

#### Database and runtime

The required outcome is a production architecture that works on the owner’s chosen Vercel target while preserving analytical truth, reproducibility, recovery, and novice-maintainer operability. **PostgreSQL is a recommendation, not an approved default.**

Before changing production database design or runtime:

1. resolve DEC-004 and DEC-005 through the bounded spike in Section 20.8;
2. compare at least managed PostgreSQL and a viable Vercel-compatible SQLite/libSQL approach if one meets the requirements;
3. retain current D1 as a measured control where practical;
4. demonstrate representative data/query parity, migration/seed, concurrency, backup/restore, region, cost, and exit path;
5. record the decision in an ADR.

Do not redesign the observation grain during the initial lift-and-shift. Add constraints, stable IDs, source/release entities, and normalization additively after parity is proven. Never combine runtime conversion, database migration, full schema normalization, and UI refactoring in one change.

#### Code structure

Preserve the modular-monolith shape. Introduce only the seams needed to prevent recurrence:

- canonical normalized analytical context/query key;
- shared query specification for Explorer, Lineage, and Export;
- lineage-preserving observation/result types;
- request-generation/cancellation guard;
- corrected fixture-driven component contracts.

Do not create microservices, GraphQL, authentication, uploads, real-time ingestion, an AI assistant, new datasets, maps, or a large folder rewrite as part of production hardening.

### 20.6 Decisions that block work versus decisions that do not

| Decision | Work that may proceed safely | Work that must wait |
|---|---|---|
| DEC-001–003 rights/licensing | Tests, current-app correctness, internal source inventory, external links | Public repository/release, PDF/full-text bundling, final licence claims |
| DEC-004–005 runtime/database | Characterization, minimal seams, current-D1 correctness, architecture spike | Production cutover, destructive replacement/removal of D1 path |
| DEC-006 package manager | Read-only audit and proposed dependency plan | Lockfile deletion/regeneration and CI install contract |
| DEC-007–010 plan/domain/SLO/RPO/RTO | Local correctness and deterministic tests | Final Vercel sizing, load thresholds, retention, recovery acceptance |
| DEC-011 owners | Implementation may begin with named temporary accountable owner | Production alerts, incident response, security/data release approval |
| DEC-013 browser policy | Standards-based fixes and automated broad checks | Final support claim and release qualification |
| DEC-014 waiver authority | No effect on first public launch | Post-launch exception governance only |

For the **first public production launch, no P0 or P1 finding may be waived**. DEC-014 is retained only for future post-launch governance or lower-severity/non-mandatory exceptions. This stricter rule resolves earlier waiver wording.

### 20.7 Root-cause consolidation map

Implement one root cause once, then close every linked ID only after its own acceptance evidence passes.

| Root-cause package | Primary IDs | Related registers that must be re-evaluated |
|---|---|---|
| Request ownership and atomic context transition | UAT-P0-001, UAT-P1-007 | ARCH-P1-002, ARCH-P1-013, BAT-ARCH-010 |
| Canonical geography/construct/population context | UAT-P0-004, UAT-P1-005/006, UAT-P2-012 | ASER-METH-P1-004/005/010, ARCH-P1-004 |
| One query specification and district scope | UAT-P0-002 | ARCH-P0-002, CI-P1-001 |
| Per-observation/point provenance and export identity | UAT-P0-003, UAT-P1-009 | DATA-P1-001/004, OSR-P1-002/003/004, DISC-P1-004, ASER-METH-P1-006/011 |
| Responsible analytical narration | ASER-METH-P1-001/002/003/007/008/009 | DISC-P1-002, ARCH-P1-005, BAT-METH-005–014 |
| District composition and interaction clarity | UAT-P1-008, UAT-P2-012/014 | BAT-PER-003, mobile/keyboard qualification |
| Accessibility semantics and visual access | UAT-P1-010, UAT-P2-013/014 | BROWSER-P1-001, BAT-ARCH-016, BAT-DISC-015/016 |
| API and production security | UAT-P1-011, UAT-P2-016 | SECURITY-P1-001/002/003, SUPPLY-P0-001 |
| Reproducible source/data release | DATA-P1-001/002/004, OSR-P1-002/003 | LEGAL-P0-001, DISC-P0-001, ASER-METH-P1-011 |
| Vercel/runtime/database decision and migration | PLATFORM-P0-001, DB-P0-001 | ARCH-P0-001/004, DB-P1-001/002/003, PLATFORM-P1-002 |
| Public repository and operating model | GIT-P1-001/002, CI-P1-001, OPS-P1-001 | OSR-P1-001/005/006, DOC-P1-001 |

Cross-references do not automatically close together. For example, preserving source/page in the API does not close the detached PNG disclaimer, and correcting rank language does not create missing uncertainty data.

### 20.8 Consolidated implementation sequence

This sequence supersedes earlier PR numbering where they differ. PR boundaries may be split further, but dependency order and protected invariants must remain.

#### Work package 0 — Re-baseline and obtain blocking decisions

Deliver:

- Section 20.4 baseline;
- owner-decision list with recommendations and safe work while blocked;
- corrected golden analytical fixtures;
- approved visual/semantic reference set;
- no application behaviour change.

Gate:

- baseline is reproducible;
- no user-owned change is overwritten;
- known defects are not blessed as golden.

#### Work package 1 — Minimum correctness seams

Deliver:

- immutable normalized question context and query key;
- shared query specification;
- lineage-preserving observation type;
- request generation and abort/stale-result guard;
- focused tests for these contracts.

Gate:

- no broad folder rewrite;
- current correct values remain identical;
- deterministic race tests prove stale results cannot commit.

#### Work package 2 — Close primary application correctness

Deliver:

- UAT-P0-001/002/004;
- UAT-P1-005/006/007/008;
- associated district terminology and composition corrections.

Gate:

- all 27 state-to-district transitions;
- all 467 state/national and 108 district query tuples;
- rapid changes, forged links, sparse trends, and district journeys pass.

#### Work package 3 — Close lineage, exports, and analytical-language blockers

Deliver:

- UAT-P0-003 and UAT-P1-009;
- ASER-METH-P1-001 through ASER-METH-P1-009;
- shared screen/API/table/CSV/PNG/share analytical view model.

Gate:

- per-row/per-point source parity;
- no unsupported winner, significance, causal, grade-level, or improvement claim;
- BAT-METH-001–015 and BAT-METH-025–027 pass where applicable.

#### Work package 4 — Accessibility, validation, and supply-chain hardening

Deliver:

- UAT-P1-010/011;
- UAT-P2-013/014/015/016 and UAT-P3-017;
- one package manager after DEC-006;
- patched production dependency tree;
- fast CI gates.

Gate:

- strict type-check, lint, unit/data/API/E2E, Axe, contrast, keyboard, export, input-bound, security-header, and clean-install checks pass;
- zero known critical/high production vulnerability.

#### Work package 5 — Vercel/database architecture spike

Time-box the spike. Do not perform production cutover.

Minimum candidates/evidence:

- native Next.js on Vercel;
- managed PostgreSQL option;
- viable Vercel-compatible SQLite/libSQL option if supportable;
- D1 remote/control path where useful;
- current complete dataset, not a toy table;
- metadata, national, state, 38-district, lineage, and CSV queries;
- exact result parity, cold/warm latency, concurrency, pooling/connection behaviour, region, migration/seed, backup/restore, cost, operational complexity, and exit path.

Gate:

- DEC-004/005 ADR approved;
- if no candidate meets the agreed requirements, stop and revise architecture or operating expectations.

#### Work package 6 — Platform/database migration behind contracts

Deliver:

- candidate adapter satisfying the same repository suite;
- lift-and-shift of current grain;
- D1/candidate shadow parity;
- native Vercel Preview;
- additive constraints and stable release/source/geography/indicator identities only after parity;
- application, schema, and data rollback/forward-repair paths.

Gate:

- zero unexplained difference across every supported combination;
- migration, restore, rollback, isolation, and Preview tests pass;
- protected UI/semantic references show no unexplained change.

#### Work package 7 — Reproducible data, rights-safe repository, and documentation

Deliver:

- source/rights manifest;
- deterministic source acquisition permitted by rights;
- extraction/review/release pipeline;
- immutable multi-format data release;
- public repository governance and examples;
- ASER-METH-P1-010/011 and ASER-METH-P2-012;
- disclaimer/privacy/correction/security documentation after factual and legal review.

Gate:

- source-to-data rebuild and checksums pass;
- no unauthorised PDF/full text is committed;
- clean-clone, data-only, offline, examples, API, archive, and fork workflows pass;
- Economic Survey 2025–26 series is exactly reconciled or explicitly unsupported.

#### Work package 8 — Release qualification and production promotion

Deliver:

- supported automated browser matrix;
- real Safari/iOS Safari/Android Chrome;
- VoiceOver/NVDA and declared TalkBack support;
- production-shaped security, load, cache, outage, recovery, backup/restore, alert, rollback, cost, DNS/SSL, SEO, privacy, and source-link evidence;
- independent application, data, methodology, accessibility, security, and release review;
- immutable tagged candidate and monitored production soak.

Gate:

- every mandatory gate in Sections 12.7, 15.9, 18.16, 19.9, and 20.11 is `GO`;
- production artifact, database, and data release exactly match the tested candidate.

### 20.9 Fast-launch reality and permitted release labels

The complete production programme cannot honestly be finished in a few hours. A few hours can produce a current baseline, decision list, narrow fixes, and perhaps a private Preview. It cannot produce legal rights clearance, independent data verification, full source reproducibility, multi-browser/device/assistive-technology evidence, platform migration, restore/rollback proof, or an operational soak.

| Release state | Permitted label | Minimum condition |
|---|---|---|
| Local/private development | `development build` | No public production claim; known misleading output is not used consequentially |
| Restricted owner/reviewer Preview | `test preview — not production` | Access restricted; current commit/data identified; P0 truth/crash issues fixed or prominently blocked; no indexing/promotion |
| Public beta | Not authorised by this UAT unless the owner explicitly narrows scope and a new beta gate is approved | Rights, truth, security, privacy, critical accessibility, provenance, correction route, and operational minimum would still be mandatory |
| Public production | `production` | All cumulative release gates pass with immutable evidence |

Do not relabel an incomplete candidate “production-ready” because the owner wants speed. Reduce scope, restrict access, or remain in Preview.

### 20.10 Multi-agent Engineer–CTO–QA/QC challenge simulation

#### Inclusion status

The earlier document incorporated many conclusions from the simulated team but did not explicitly record the simulation, its disagreements, or its limitations. This subsection now provides that traceability.

The simulated team consisted of:

- **Engineer:** implementation feasibility, minimum seams, migration granularity, and rollback.
- **CTO/architecture reviewer:** product scope, sequencing, operational ownership, platform assumptions, and production risk.
- **QA/QC lead:** independent oracles, proportionate gates, regression strategy, release evidence, and rejection conditions.
- **ASER research and policy methodology perspective:** represented separately by the evidence-based review in Section 19; it is not a substitute for an independent human ASER domain reviewer.

These roles challenged the plan using the same repository/UAT evidence. They did **not** execute additional browser, database, source-page, legal, device, or production tests. Their output is an architecture/quality planning review, not new empirical test evidence.

#### Consensus reached

All three implementation roles agreed that:

1. The approved visual design and journeys should be preserved, but defective behaviour, misleading copy, and inaccessible semantics must not be preserved.
2. A deterministic baseline and source-backed golden oracles are needed before broad refactoring.
3. The complete target architecture should not delay urgent correctness, but minimum context/query/lineage/concurrency seams should be introduced with the fixes that require them.
4. Analytical and interaction correctness must be proven before platform/database cutover.
5. Explorer, Lineage, CSV, UI, and exports must share one canonical context/query/result contract.
6. A rewrite is unjustified; use a strangler migration in a modular monolith.
7. PostgreSQL must not be selected merely because the host is Vercel; a bounded evidence-based architecture spike must decide the provider/database.
8. Known defects must be annotated in screenshots/fixtures and never converted into approved baselines.
9. Platform migration requires shadow parity against corrected expected semantics, not blind parity with known-wrong output.
10. Source rights, independent data/methodology review, recovery, human ownership, and release evidence are real gates.
11. Release readiness is evidence-based, not calendar-based.
12. Scope should not expand into accounts, uploads, AI chat, new datasets, maps, microservices, GraphQL, localization, or real-time ingestion before the core release is qualified.

#### Disagreements and resolution

| Challenge | Engineer position | CTO/QA challenge | Resolution adopted in this UAT |
|---|---|---|---|
| Architecture before P0 fixes | Broad seams reduce repeat patches | A broad programme delays user-facing correctness and lacks a trustworthy oracle | Introduce only minimum seams in WP1; fix correctness in WP2/3; complete abstraction later |
| Fix everything directly on D1 first | Current stack is understood | Patching coupled paths without a shared context/query contract can recreate defects | Fix on D1 behind the smallest required shared contracts; avoid new Cloudflare-specific investment |
| Assume PostgreSQL | Likely Vercel-compatible result | Provider, cost, recovery, region, pooling, and novice operations are unproven | Mandatory WP5 architecture spike and DEC-004/005 ADR |
| Snapshot the current UI | Useful regression protection | Current output contains wrong geography, duplicated ranking, low contrast, and semantic defects | Preserve approved visual design with corrected fixture states; annotate known defects |
| Real devices on every PR | Maximum confidence | Excessive cost and slow feedback for unrelated changes | Risk-based PR tests; broad automation at milestone; real devices/AT at release |
| Manually verify all 12,552 values | Maximum human certainty | Costly and unnecessary if claims are scoped honestly | 100% machine reconciliation, human review of every ambiguity/conflict/suppression, and risk-stratified page sampling; full human review only if the public claim says so |
| Mandatory penetration test | Strong security assurance | Disproportionate by default for a read-only/no-auth/no-PII explorer | Automated scanning plus independent security review; formal penetration test if auth, writes, uploads, sensitive telemetry, or material abuse exposure is introduced |
| P1 waivers | Some non-core P1 may be waivable with controls | Public analytical/accessibility/security/recovery trust should not be waived | Owner’s stricter first-launch rule adopted: zero P1 waivers |
| Calendar estimate | Initial engineering range could be 8–14 weeks | External rights/data/device/operations dependencies make that optimistic | Do not commit to calendar; planning indication is roughly 12–20 focused engineering weeks and potentially 12–24+ elapsed weeks, subject to decisions and external review |

#### Team stop/revision conditions

The simulated team unanimously requires the plan to stop or be revised if:

- the owner prohibits internal context/query/view-model changes while still requiring modular production behaviour;
- the owner prohibits all runtime/database change while still requiring native Vercel production and the spike finds no compatible current path;
- publication rights remain unresolved at the public-release gate;
- a candidate database/runtime cannot meet agreed cost, recovery, region, performance, and maintainer-complexity requirements;
- shadow comparison has any unexplained value, geography, construct, missingness, order, release, or lineage difference;
- migration lacks tested restore, rollback, or forward repair;
- infrastructure/analytics work causes an unexplained protected UI or semantic regression;
- critical/high production vulnerabilities or secrets remain;
- mandatory integration, browser/mobile/AT, load, outage, backup, or recovery tests are skipped;
- no independent reviewer is available to close P0/P1 and release gates;
- expected “maximum usage” remains undefined by traffic, availability, abuse, cost, and support budgets;
- scope expands materially before the current ASER aggregate explorer is qualified.

### 20.11 Final coding-agent definition of done

The coding agent must not report “done,” “production-ready,” or “all issues fixed” until all of the following are true:

1. The exact candidate commit, clean/understood working tree, application version, schema version, data release, source-manifest checksum, and deployed artifact are recorded.
2. Every applicable stable ID has a closure-ledger row and objective evidence.
3. All P0 and P1 findings across application, production, open-source, architecture, disclaimer, and methodology registers are closed; no first-launch waiver exists.
4. Every required regression test fails on the defective fixture/version where practical and passes on the candidate.
5. All 467 state/national and 108 district query combinations reconcile across database, API, Lineage, CSV, UI, and applicable exports.
6. Every visible or portable value has correct construct, population, geography, year, subgroup, unit, release, derivation, comparability, uncertainty availability, source edition, page/table, and caveat.
7. No screen or export makes an unsupported significance, causality, winner, generic grade-level, all-India, or policy-targeting claim.
8. The approved UI visual language is preserved and accessibility corrections pass the declared support matrix.
9. Clean clone, deterministic build, source/data rebuild, examples, archive/offline use, and independent fork deployment pass.
10. Rights/licensing, privacy, independence/AI disclosure, correction/takedown, security, and methodology sign-offs are recorded by accountable humans.
11. Production-shaped dependency, security, browser, mobile, assistive-technology, performance, load, cache, outage, backup/restore, alert, incident, rollback, cost, DNS/SSL, SEO, and monitoring evidence passes.
12. The production deployment and database/data release match the tested immutable candidate.
13. Production smoke and the agreed monitored soak complete without a qualifying regression.

If any item is unavailable, report `BLOCKED` or `NOT EXECUTED`; do not reinterpret it as pass. If the user asks for a faster release, present the exact scope/evidence being deferred and the permitted label from Section 20.9.

### 20.12 Coding-agent first response template

The first implementation-planning response should be concise but must include:

1. **Baseline delta:** current branch/commit/dirty files versus Section 1.
2. **Reproduction delta:** which P0/P1 findings still reproduce, changed, or require environment access.
3. **Blocking decisions:** unresolved DEC IDs, recommended choice, decision deadline, and work that can proceed safely.
4. **Root-cause backlog:** WP0–WP8 with linked stable IDs and dependencies.
5. **First mergeable unit:** exact outcome, files likely affected, tests, documentation, rollback, and what is deliberately excluded.
6. **Protected invariants:** visual design, analytical truth, lineage, URL reproducibility, no silent substitution, and user-owned work.
7. **Evidence plan:** where CI/release evidence will live and who independently reviews it.
8. **Honest release statement:** current permitted label and why production is still blocked.

The coding agent must ask the owner only for decisions it cannot safely infer. It should continue read-only investigation, baseline creation, characterization tests, and other non-conflicting work while a decision is pending.
