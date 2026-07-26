# ASER Data Explorer — Independent Remediation Retest and Fresh Coding-Round UAT

**Executed:** 2026-07-26, Asia/Kolkata  
**Release candidate:** `0ba5d96d212903def448f44ef936d8da7cbb3330` on `main`  
**Application:** `http://127.0.0.1:3000`  
**Purpose:** Independently test the remediation claims in `UAT/REMEDIATION_LOG.md`, record new user-reported issues, and provide a coding-agent-ready closure plan for the next round.  
**Repository state before testing:** clean  
**Repository state after testing:** clean before creation of this document; this Markdown file is the sole output of this UAT pass.  

---

## 1. Executive verdict

### Application-stability verdict

**CONDITIONAL PASS.**

Claude materially improved the application, and the original P0/P1 application failures tested in this pass no longer reproduce. However, the statement “all 17 findings are closed and verified” is too strong:

- **15 of 17 original findings:** substantiated as fixed by independent browser, API, source, code, or automated-test evidence.
- **1 of 17 conditional:** `UAT-P2-014` has a coarse-pointer CSS rule but lacks real-phone verification.
- **1 of 17 reopened:** `UAT-P2-015` standalone TypeScript validation fails.

### Research/policy-use verdict

**FAIL / BLOCKED FOR UNRESTRICTED RESEARCH OR POLICY USE.**

The later ASER methodology register was not part of the 17-item closure. Fixed-threshold improvement verdicts, exact rank language without observation-specific uncertainty, cross-subject winner language, denominator/scope ambiguity, flattened comparability caveats, and geography-version limitations remain.

### Public-production verdict

**FAIL / BLOCKED.**

The application is a stronger development/test preview, but Vercel/database architecture, package reproducibility, source/data rights, public-repository governance, documentation truth, real-browser/device/assistive-technology evidence, operational resilience, and production deployment evidence remain open.

### New/reopened issue count

| Severity | Count | IDs |
|---|---:|---|
| P0 | 0 new application P0s | — |
| P1 | 3 | `RETEST-P1-001`, `RETEST-P1-002`, `RETEST-P1-003` |
| P2 | 4 | `UAT-P2-015` reopened, `RETEST-P2-004`, `RETEST-P2-005`, `RETEST-P2-006` |
| P3 | 0 | — |

Production and methodology blockers retain their existing IDs in the original UAT and are not double-counted above.

---

## 2. Release-candidate identity and limitations

| Field | Evidence |
|---|---|
| Commit | `0ba5d96d212903def448f44ef936d8da7cbb3330` |
| Branch | `main` |
| Initial working tree | clean |
| Running process | Vinext development server using Cloudflare/workerd runtime |
| Browser used | Codex in-app Chromium browser |
| Desktop viewport | normal in-app browser viewport |
| Responsive viewport | 390 × 844 override; page client width reported as 375 px |
| Colour preference observed | browser reported `prefers-color-scheme: dark` |
| API origin | `http://127.0.0.1:3000` |
| Database evidence | live D1-backed API plus migration/data-integrity suites |
| Network evidence | local HTTP; official ASER and Uttar Pradesh sources used only for the district-coverage oracle |

### Limitations

- No application code or configuration was changed.
- The production build was not rerun because it writes generated build artifacts; the prior build claim was not independently certified in this read-only pass.
- PNG buttons were not used because that creates downloaded files. PNG completeness was reviewed through code and regression tests, not through a fresh detached-image inspection.
- Actual Safari, Firefox, iOS Safari, Android Chrome, VoiceOver, NVDA, and TalkBack were not executed.
- The responsive viewport does not emulate a real coarse pointer, device browser chrome, mobile font behaviour, or operating-system assistive technology.
- No deployed Vercel environment, TLS endpoint, CDN, production database, WAF, backup, monitoring, or outage-control environment was available.
- `npm audit` was attempted but the registry rejected the current package tree as invalid; vulnerability closure could not be established.

Skipped or unavailable checks are not marked as passing.

---

## 3. Independent testing battery

### 3.1 Automated suite

Command executed with local-server access:

```text
node --test tests/*.test.mjs
```

Result:

```text
tests 70
pass 70
fail 0
skipped 0
```

Important qualification: when local loopback access was unavailable, 14 live API/district tests skipped while the test command still exited successfully. After local access was enabled, all 70 ran and passed. The suite is valuable, but CI remains capable of a false-green result if required integration infrastructure is absent.

### 3.2 Static checks

| Check | Result |
|---|---|
| ESLint | PASS |
| Standalone strict TypeScript | **FAIL** |
| Production build | Not independently rerun in this read-only pass |
| Working-tree preservation | PASS |

TypeScript command:

```text
npx tsc --noEmit --incremental false
```

Observed errors:

```text
app/api/_data.ts(96,29): error TS2339: Property 'DB' does not exist on type 'Env'.
db/index.ts(6,12): error TS2339: Property 'DB' does not exist on type 'Env'.
db/index.ts(12,22): error TS2339: Property 'DB' does not exist on type 'Env'.
```

### 3.3 Exhaustive state/national reconciliation

Every row in `/api/metadata.availability` was executed across Explorer, Lineage, and API CSV:

| Measure | Result |
|---|---:|
| Advertised cuts | 467 |
| Explorer rows examined | 9,033 |
| Explorer/Lineage/CSV count mismatches | 0 |
| Explorer rows missing source URL/page | 0 |

### 3.4 District reconciliation

The live district-parity battery passed:

| Measure | Result |
|---|---:|
| Parent states | 27 |
| District measure cuts | 108 |
| Rows across the 108 cuts | 2,343 |
| Explorer/Lineage/CSV parity failures | 0 |
| Cross-parent leakage failures | 0 |
| Missing per-row district citations in tested surfaces | 0 |

The metadata catalogue currently contains **588 distinct state-qualified districts** across 27 parents.

### 3.5 Browser persona journeys

| Journey | Actions | Observed result | Verdict |
|---|---|---|---|
| First-time national user | Open default 2024 Std III reading question | 27-state ranking, national anchor, headline, trend, comparison, sources and ladder guidance rendered | PASS with methodology caveats |
| State officer | Open Uttar Pradesh from ranking | URL and question changed to Uttar Pradesh; district band loaded | PASS |
| District officer | Click Gautam Buddha Nagar from Uttar Pradesh | URL carried district and parent; 70-district ranking rendered; no crash or console error | PASS |
| Hostile shared link | Open `Aurangabad (Bihar)` with forged `parent=Kerala` | Parent repaired to Bihar; URL rewritten; recovery alert shown | PASS, though alert is generic |
| Sparse-series user | Open Sikkim, government schools, Std III reading | Sikkim retained its 2014/2022/2024 points; missing rounds remained gaps; copy named 3 of 6 published rounds | PASS for geography truth; FAIL for unsupported `Yes` interpretation |
| Research/source user | Expand state ranking table | Each row displayed its own page link | PASS |
| Mobile-width user | Run Uttar Pradesh view at 390 × 844 | No horizontal overflow; controls and ranking reflowed | PASS for reflow only |
| Dark-preference user | Open app where browser prefers dark | App rendered dark on first visit | FAIL against newly stated default-light requirement |

Browser console result after the journeys: **0 warnings/errors captured**.

### 3.6 Visible provenance oracle

The default state table displayed:

| Geography | Value | Visible source |
|---|---:|---|
| India (rural) | 27.0% | ASER 2024 report p. 69 |
| Himachal Pradesh | 50.6% | p. 124 |
| Bihar | 26.1% | p. 98 |
| West Bengal | 36.3% | p. 242 |
| Telangana | 6.2% | p. 220 |

This independently confirms that the previous “all rows cite p. 220” defect is fixed on the visible table.

### 3.7 Security and hostile-input checks

- Local HTML and API responses carried CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, and COOP.
- Malformed and oversized parameters passed the automated typed-error tests.
- No cookies were set by the tested public data API.
- HSTS over a real deployed TLS endpoint was not tested.
- Rate limiting, cost controls, WAF behaviour, sustained abuse, and controlled failure injection remain untested.

---

## 4. Original 17-finding closure audit

| ID | Independent status | Retest evidence / qualification |
|---|---|---|
| UAT-P0-001 | **VERIFIED CLOSED** | Live state→district click completed; correct URL/context; no crash or console error |
| UAT-P0-002 | **VERIFIED CLOSED** | All 108 district cuts reconciled across Explorer, Lineage and CSV |
| UAT-P0-003 | **VERIFIED CLOSED** | Visible per-row state pages correct; API/district lineage tests passed; CSV parity passed |
| UAT-P0-004 | **VERIFIED CLOSED** | National cards no longer borrow the top state; district parent anchor and grade-band labels remained truthful |
| UAT-P1-005 | **VERIFIED CLOSED** | Sparse Sikkim series preserved; gaps and published-round count disclosed |
| UAT-P1-006 | **VERIFIED CLOSED** | Forged Kerala parent repaired to Bihar and URL rewritten |
| UAT-P1-007 | **VERIFIED CLOSED** | Regression guard passed; no stuck state seen in exercised comparison journeys |
| UAT-P1-008 | **VERIFIED CLOSED** | District question displayed one district ranking rather than a duplicated band |
| UAT-P1-009 | **SUBSTANTIATED CLOSED** | Renderer and regression guard include all rows; fresh detached PNG not generated in this read-only pass |
| UAT-P1-010 | **SUBSTANTIATED CLOSED** | Updated colour tokens and contrast assertions present; full axe/manual low-vision qualification remains part of browser gate |
| UAT-P1-011 | **VERIFIED CLOSED LOCALLY** | Local HTML/API headers passed; deployed Vercel/TLS verification remains open |
| UAT-P2-012 | **VERIFIED CLOSED** | District counts, add control and labels use district terminology |
| UAT-P2-013 | **VERIFIED CLOSED** | One H1; section navigation uses ordinary buttons rather than incomplete tab semantics |
| UAT-P2-014 | **CONDITIONAL / NOT FULLY VERIFIED** | Coarse-pointer CSS raises dense rows to 40 px, but real mobile/coarse-pointer evidence is absent |
| UAT-P2-015 | **REOPENED** | Standalone TypeScript command currently fails with three `Env.DB` errors |
| UAT-P2-016 | **VERIFIED CLOSED** | Oversized and malformed inputs covered by live tests; bounded typed responses pass |
| UAT-P3-017 | **VERIFIED CLOSED** | Singular/plural comparison grammar guard passed |

### Correct status language

Permitted:

> No original P0 or P1 application defect reproduced in this retest. Fifteen of seventeen original findings are independently substantiated as closed; the touch-target item remains device-conditional and standalone TypeScript validation is reopened.

Not permitted:

> All 17 findings are closed and verified.

---

## 5. New and reopened defect register for the coding agent

## RETEST-P1-001 — District coverage and administrative-boundary discrepancies are unexplained

**Severity:** P1 analytical-honesty and public-trust blocker  
**Personas:** District officer, state officer, researcher, journalist, open-data user  
**Affected surfaces:** District heading/status, About, README, metadata API, CSV/PNG, geography model  

### Reproduction

1. Open the 2024 default question.
2. Choose Uttar Pradesh.
3. Observe that the app reports 70 districts.
4. Open About the data.
5. Search for an explanation of why the displayed district count differs from the administrative district count.

### Observed

- The app lists 70 Uttar Pradesh districts without explaining the coverage boundary.
- An official Uttar Pradesh source states that the state has 75 districts.
- ASER states that it attempts to reach every rural district but cannot reach some districts in some years, generally because of natural disasters, unrest or conflict.
- The exact district-specific reason for the five-district difference is not stored or shown.
- The application schema uses names and parent names but has no stable geography ID, reference/boundary vintage, administrative-count oracle, inclusion status, omission reason, rename/split/merge lineage, or reason-source citation.
- README says 583 districts, while the live metadata catalogue contains 588.

Official external oracles:

- Uttar Pradesh official source: <https://information.up.gov.in/en/hi-about-us.aspx>
- ASER 2024 coverage explanation: <https://asercentre.org/about-aser-2024/>
- ASER 2024 official report and district-document index: <https://asercentre.org/aser-2024/>

### Expected

The product must distinguish:

1. current administrative districts;
2. districts existing at the reference/boundary date;
3. districts reached by the ASER survey;
4. districts for which ASER published the particular estimate;
5. districts loaded into this release.

It must never imply that its district selector is a complete current administrative directory.

### Likely responsible areas

- `db/schema.ts`
- geography catalogue/metadata response
- data pipeline/source manifest
- `app/components/cards.tsx`
- `app/about.tsx`
- `README.md`
- CSV/PNG metadata

### Fix direction

- Add a versioned geography catalogue or release manifest behind the existing observation interface.
- Store stable geography ID, display name, parent ID, boundary/reference vintage, aliases, inclusion/coverage status, and an official reason/source when available.
- Do not invent a specific reason. If ASER does not publish one, state: “The source does not provide a district-specific reason.”
- On each district card, show:
  - “ASER publishes this estimate for X districts in this release.”
  - comparison with the authoritative administrative count and date where available;
  - a link to ASER coverage/methodology;
  - a concise caveat that the list is survey/publication coverage, not a current district registry.
- Reconcile all district counts in README, API metadata, About, status text, tests and release manifests.

### Acceptance criteria

1. Uttar Pradesh displays 70 published districts and the separately sourced 75-district administrative reference with its date and URL.
2. The UI states why these concepts may differ.
3. Known omissions use official, cited reasons; unknown reasons are explicitly labelled unknown/not specified.
4. Every parent state exposes `publishedDistrictCount`, reference count/status, reference date, source URL and caveat.
5. API/CSV/PNG preserve the coverage state and reference.
6. No geography name alone is treated as a stable longitudinal/external-join key.
7. README, API, UI and release manifest agree on the 588-district catalogue or an explicitly revised canonical count.

### Required regression tests

- All 27 parent counts agree across database, metadata, UI status and README-generated facts.
- Uttar Pradesh 70-versus-reference-count fixture.
- Missing-reason fixture renders “not specified,” never a fabricated explanation.
- Rename/split/merge and boundary-vintage contract tests.
- Detached CSV/PNG coverage-caveat test.
- Accessibility and mobile-reflow test for the coverage notice.

### Related existing findings

`ASER-METH-P2-012`, `DOC-P1-001`, `DATA-P1-001`, `DATA-P1-004`, `DISC-P1-002`, `DISC-P1-004`.

---

## RETEST-P1-002 — Documentation and release status contradict the tested application

**Severity:** P1 public-repository and release-truth blocker  
**Personas:** Contributor, novice maintainer, researcher, deployer, auditor  

### Observed

- `README.md` says status is “live.”
- `UAT/REMEDIATION_LOG.md` says the honest label is development/test preview.
- `README.md` says 583 districts; the current metadata catalogue has 588.
- `docs/UAT_REPORT.md` says 50 tests and 11 defects; the current suite has 70 tests and the root UAT has 17 original application findings plus separate registers.
- README says `Code: see LICENSE`, but no root `LICENSE` file exists.
- README directs readers to a historical report without prominently labelling it historical.
- The current UAT folder contains an original blocked report, a future feature plan, and a remediation log, but no single current release-status index.

### Expected

One authoritative current release-status document must identify:

- application commit;
- data-release identity;
- test counts with skipped-test policy;
- current application, methodology and production verdicts;
- open decisions/blockers;
- superseded/historical UAT evidence.

### Acceptance criteria

1. README, About, API metadata and UAT index use the same release label.
2. All counts are generated or contract-tested against the canonical release manifest.
3. Historical UAT documents are labelled historical without rewriting their evidence.
4. README contains no link to a missing licence, source, command or file.
5. The selected licence/data-rights text is implemented only after owner/legal decisions.
6. A documentation-contract test fails on count, status, test-total, licence-link and supported-scope drift.

### Required regression tests

- README/API/database fact reconciliation.
- Link checker for repository-relative paths.
- Release-status schema test.
- Historical/current UAT navigation test.

### Related

`DOC-P1-001`, `LEGAL-P0-001`, `GIT-P1-001`, `DATA-P1-001`, `DISC-P0-001`.

---

## RETEST-P1-003 — Package tree is not reproducibly auditable

**Severity:** P1 in this fresh coding round; remains covered by production `SUPPLY-P0-001`  
**Personas:** Deployer, contributor, maintainer, security reviewer  

### Reproduction

```text
npm audit --omit=dev --json
```

### Observed

The registry returned:

```text
Invalid package tree, run npm install to rebuild your package-lock.json
```

Additional evidence:

- both `package-lock.json` and `pnpm-lock.yaml` are tracked;
- `package.json` has no explicit package-manager contract;
- `npm ls --omit=dev --depth=0` reports extraneous native packages;
- a frozen clean-install/audit result was not available.

### Expected

One package manager, one canonical lockfile, a clean frozen install, a valid production audit, and documented supported Node/runtime versions.

### Acceptance criteria

1. Owner confirms `DEC-006`.
2. Exactly one canonical lockfile remains.
3. Clean clone plus frozen install succeeds without lockfile changes.
4. `npm ls`/equivalent has no unexpected extraneous or invalid packages.
5. Production audit completes and has zero unresolved critical/high advisories.
6. Build, lint, type-check and all mandatory tests pass from the clean install.
7. CI fails if the audit cannot execute.

### Related

`SUPPLY-P0-001`, `CI-P1-001`, `PLATFORM-P0-001`.

---

## UAT-P2-015 — Standalone TypeScript validation fails again

**Severity:** P2 application quality; promotion blocker because it invalidates the claimed gate  
**Status:** **REOPENED**

### Observed

The current `worker/cloudflare.d.ts` declaration does not make `DB` available on the `Env` type seen by `app/api/_data.ts` and `db/index.ts`.

### Acceptance criteria

1. `npx tsc --noEmit --incremental false` exits 0 from a clean install.
2. The command does not depend on untracked/generated local state.
3. CI runs the exact command as a mandatory non-skippable gate.
4. Both current Cloudflare preview and the chosen production adapter satisfy the typed database port.
5. A type fixture prevents the runtime binding from drifting out of `Env` again.

---

## RETEST-P2-004 — Trend chart hides intermediate point values

**Severity:** P2 UX/accessibility and reporting usability  
**Personas:** Policy analyst, state officer, journalist, presentation user, touch user  

### Reproduction

1. Open the default national 2018/2022/2024 trend.
2. Observe the plotted dots.
3. Repeat for a state such as Uttar Pradesh or sparse Sikkim.

### Observed

- Every dot has an SVG `<title>` with the value.
- Only the final value of each line is directly visible as chart text.
- Intermediate values require hover or table expansion.
- Touch, print, screenshots and exported presentation use cannot depend on hover.

### Expected

Every selected, published point must have a visible value label without obscuring the series or implying a value for missing rounds.

### Fix direction

- Add compact direct point labels using the existing narrative visual grammar.
- Resolve collisions deterministically for two series and up to six rounds.
- Keep missing observations blank.
- Ensure visible labels, accessible names, table values and PNG values agree.
- Avoid introducing a foreign dashboard/BI appearance.

### Acceptance criteria

1. National one-line charts visibly label every selected point.
2. State-plus-national charts visibly label every published point in both series.
3. Sparse Sikkim labels only 2014, 2022 and 2024 for Sikkim.
4. Labels do not clip, overlap materially, or escape the SVG at supported widths.
5. 320% zoom, 375 px width, print and PNG remain readable.
6. Screen-reader output names series, year, value, missing state and source.
7. Table/CSV/PNG/UI values reconcile exactly.

### Required regression tests

- Label-count equals published-point count by series.
- Missing-point no-label test.
- Deterministic collision-layout test.
- Mobile/zoom screenshot test.
- PNG/UI/table value parity test.

---

## RETEST-P2-005 — Desktop district ranking reads odd/even rather than sequentially

**Severity:** P2 UX and cognitive-accessibility  
**Personas:** District officer, beginner, keyboard and low-vision user  

### Reproduction

1. Open Uttar Pradesh at desktop width.
2. Read the two-column district ranking down the left column.

### Observed

The DOM is ordered 1–70, but the two-column CSS grid places:

- left: 1, 3, 5, 7…
- right: 2, 4, 6, 8…

On mobile, the one-column rendering is sequential.

### Expected

Desktop visual order should be:

- left column: 1 through the midpoint;
- right column: midpoint + 1 through the final rank.

DOM, keyboard and screen-reader order must remain 1 through N.

### Acceptance criteria

1. Uttar Pradesh renders ranks 1–35 down the left and 36–70 down the right.
2. Bihar renders 1–19 down the left and 20–38 down the right.
3. Odd district counts split deterministically.
4. One-column mobile remains 1 through N.
5. DOM and keyboard order remain 1 through N, not column-jumped.
6. CSV/PNG/table ordering remains identical to the canonical ranking.
7. Layout retains the current compact narrative style.

### Required regression tests

- Even/odd list split fixtures.
- DOM-order versus visual-column contract.
- Desktop/mobile screenshot test.
- Keyboard traversal test.

---

## RETEST-P2-006 — First visit follows system dark mode instead of product default light

**Severity:** P2 UX consistency and owner requirement  
**Personas:** All users; presentation/reporting users particularly affected  

### Reproduction

1. Use a browser/OS reporting `prefers-color-scheme: dark`.
2. Open the app without stored site preferences.

### Observed

- The first visit renders dark.
- Computed body background in the tested browser was `rgb(20, 24, 31)`.
- Another browser reporting light preference renders light.
- `tests/composition.test.mjs` currently asserts the presence of automatic dark-mode CSS, so the test encodes behaviour that conflicts with the owner’s new requirement.

### Expected

An unconfigured first visit always uses the light theme. Dark mode occurs only after an explicit user choice.

### Fix direction

- Make light the deterministic default.
- If dark mode remains supported, add an accessible explicit theme control that fits the current visual grammar.
- Persist the user’s explicit choice locally.
- Avoid first-paint flashes and hydration mismatch.
- Keep exported artifacts deterministic; do not let browser theme silently change presentation output unless the user explicitly chooses it.

### Acceptance criteria

1. No stored preference + light system → light.
2. No stored preference + dark system → light.
3. Explicit dark choice → dark and persists across reload.
4. Explicit light choice → light and persists across reload.
5. Keyboard and screen-reader users can discover and operate the control.
6. No theme flash or hydration warning.
7. Contrast remains WCAG 2.2 AA in both supported themes.
8. Tests no longer require automatic system-dark rendering.

### Required regression tests

- Four preference/system combinations.
- First-paint/hydration test.
- Persistence test.
- Keyboard/name/state test.
- Light/dark contrast and screenshot tests.

---

## 6. ASER research and policy methodology retest

Claude’s “analysis-honesty” regression guards protect against fabricated geography, stale cuts, gaps and truncation. They do **not** close the methodology defects in Section 19 of the original UAT.

| Existing methodology ID | Current evidence | Status |
|---|---|---|
| ASER-METH-P1-001 | `direction()` and `verdict()` still convert ±1 point into `Yes`, `No`, `up`, `down` or `broadly unchanged`; Sikkim visibly says “Yes” | OPEN |
| ASER-METH-P1-002 | UI still shows exact `Ranked X of N`, `Highest`, `Lowest`, and “ahead by” without observation-specific uncertainty | OPEN |
| ASER-METH-P1-003 | Reading-versus-arithmetic comparison still feeds unlike constructs into generic lead narration | OPEN |
| ASER-METH-P1-004 | About still describes the Std II story as ASER’s generic proxy for grade-level reading | OPEN |
| ASER-METH-P1-005 | Grade-enrolled result denominators are not fully explicit on every primary and detached surface | OPEN |
| ASER-METH-P1-006 | `comparable_with_caveats` remains eligible without a point/transition-specific portable caveat | OPEN |
| ASER-METH-P1-007 | About/README still provide blanket approximate uncertainty rather than observation-specific availability | OPEN |
| ASER-METH-P1-008 | “Private schools ahead” remains winner-forward despite a non-causal caveat | OPEN |
| ASER-METH-P1-009 | About still attributes trend validity broadly to tools having the “same design since 2005” | OPEN |
| ASER-METH-P1-010 | Product is not consistently labelled as a selected published-aggregate explorer across README/API/SEO/release status | OPEN |
| ASER-METH-P1-011 | Formal policy-series crosswalk remains unexecuted | OPEN |
| ASER-METH-P2-012 | No stable geography IDs, boundary vintage or split/merge lineage; reinforced by `RETEST-P1-001` | OPEN |

### Required methodology work package

1. Remove categorical improvement and decline verdicts derived only from point changes.
2. Label ordering as published point-estimate order and remove unsupported winner/quality implications.
3. Stop narrating reading and arithmetic as a common scale.
4. Use literal ASER task wording and expose population/denominator on all surfaces.
5. Make uncertainty availability and comparability state first-class.
6. Add a versioned geography/coverage catalogue.
7. Add signed policy-series reproduction fixtures.
8. Obtain independent ASER methodology review before public policy/research promotion.

---

## 7. Production-readiness status after remediation

### P0 gates still open

| Gate | Current status |
|---|---|
| `PLATFORM-P0-001` | Vinext/Vite/Cloudflare Worker remains; native Vercel deployment not established |
| `DB-P0-001` | Application depends on Cloudflare D1 binding; Vercel-compatible production database not selected/migrated |
| `SUPPLY-P0-001` | Package tree cannot be audited; two lockfiles; clean frozen install not proven |
| `LEGAL-P0-001` | No root software licence; ASER-derived data/report reuse basis remains undocumented |
| `RELEASE-P0-001` | Type-check reopened, new P1s open, methodology/public-production battery incomplete |

### P1 gates still open or only locally improved

- immutable data/application release manifest;
- reproducible source-to-data pipeline;
- structured source title/edition/checksum/retrieval/rights metadata;
- dataset-isolation contract on every route;
- database domain constraints, migration promotion, rollback and restore;
- GitHub public-repository/community/security package;
- branch protection, CodeQL/Dependabot/CODEOWNERS;
- mandatory CI that fails rather than skips when integration infrastructure is absent;
- actual cross-browser/mobile/assistive-technology qualification;
- deployed security header and TLS evidence;
- rate limiting, abuse and cost controls;
- production performance, monitoring, alerting, incident and rollback controls;
- accurate current documentation and disclaimer propagation.

### Repository-use gaps observed

- Git remote is a Sites remote, not a public GitHub origin.
- No root `LICENSE`.
- No root `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, or tracked GitHub workflow/community package.
- No source PDFs are bundled; this may be correct pending rights, but clone-to-source reproduction is therefore incomplete.
- Extraction/review tooling is not present as a reproducible pipeline.
- Duplicate/tool-specific tracked assets and two package-manager lockfiles remain.

---

## 8. Coding-agent execution order

The next coding agent must treat this document as the current retest status and the original UAT as the detailed production/methodology specification. Do not rewrite historical evidence as if it had passed.

### Work package 1 — Reopen the truthful build gate

**IDs:** `UAT-P2-015`, `RETEST-P1-003`

1. Confirm the package-manager decision.
2. Repair the type contract without relying on untracked generated files.
3. Establish a clean frozen install.
4. Make type-check, audit and live integration non-skippable.
5. Rerun all 70 tests against the live test server with zero skips.

**Required retest:** clean clone/install, type-check, lint, build, 70/70 with zero skips, valid audit, clean working tree.

### Work package 2 — Fix the four newly reported user-visible issues

**IDs:** `RETEST-P1-001`, `RETEST-P2-004`, `RETEST-P2-005`, `RETEST-P2-006`

Group the district count explanation with geography/version metadata, not as hardcoded Uttar Pradesh copy. Preserve the current UI look and narrative grammar.

**Required retest:**

- trend direct-label matrix;
- UP/Bihar sequential district layout;
- coverage explanation for all 27 parents;
- system light/dark plus explicit theme-choice matrix;
- mobile, zoom, keyboard and accessible-name checks;
- detached CSV/PNG consistency.

### Work package 3 — Reconcile release documentation

**ID:** `RETEST-P1-002`

1. Establish a canonical release manifest/status.
2. Correct 583/588, 50/70, 11/17, “live”/“development preview,” and missing-licence references.
3. Label historical UAT documents.
4. Add contract tests for generated facts and links.

**Required retest:** clean-clone documentation walkthrough by novice contributor, data analyst and deployer personas.

### Work package 4 — Close analytical-methodology blockers

**IDs:** `ASER-METH-P1-001` through `011`, plus `ASER-METH-P2-012`

Implement neutral descriptive narration, denominator and scope contracts, comparability and uncertainty states, geography versioning, and policy crosswalk fixtures.

**Required retest:** complete `BAT-METH` battery from the original UAT, with ASER methodology reviewer sign-off.

### Work package 5 — Complete public-production programme

Resolve owner decisions and execute the original UAT work packages for:

- Vercel/runtime/database;
- legal/licensing/rights;
- reproducible data release;
- public GitHub governance and CI;
- browser/device/accessibility;
- security/performance/operations;
- staging qualification and production soak.

No public-production label is allowed before those evidence gates pass.

---

## 9. Mandatory regression matrix for this fresh coding round

| Battery | Minimum evidence |
|---|---|
| Unit/model/honesty | All tests run, none skipped |
| API/state-national | 467 cuts, 9,033 rows, Explorer/Lineage/CSV parity |
| District | 108 cuts, 2,343 rows, no parent leakage, per-row source parity |
| Browser transitions | All 27 state→first-district journeys plus rapid switching |
| Trend labels | One/two series, 2–6 rounds, sparse and missing points, mobile and zoom |
| District layout | Even/odd counts, desktop two-column, mobile one-column, DOM/keyboard order |
| Geography coverage | All 27 parent counts, boundary/reference metadata, unknown-reason handling |
| Theme | Default light under both system preferences; explicit choice and persistence |
| Source lineage | UI, table, API, CSV and PNG page/source agreement |
| Methodology | Neutral change/rank/comparison wording and portable caveats |
| Type/build | Clean install, strict type-check, lint and production build |
| Supply chain | One lockfile, valid audit, no unresolved critical/high production advisories |
| Accessibility | axe plus keyboard, 320% zoom, contrast, real VoiceOver/NVDA/TalkBack paths |
| Browsers/devices | Chromium, Firefox, WebKit automation; real Safari, iOS Safari and Android Chrome |
| Production | Vercel Preview/Production, PostgreSQL parity, headers/TLS, load, outage, restore, rollback, monitoring and soak |

---

## 10. Closure protocol

For every finding, the coding agent must record:

| Field | Required |
|---|---|
| ID | Stable UAT/production/methodology ID |
| Root cause | Evidence-based, not symptom-only |
| Commit/PR | Exact reference |
| Files changed | Exact paths |
| Tests added/updated | Exact names |
| Reproduction before | Pass/fail evidence |
| Retest after | Pass/fail evidence |
| Browser/device | Exact runtime |
| Data/API oracle | Exact rows/counts/pages |
| Documentation updated | Paths |
| Residual risk | Explicit |
| Reviewer | Named role/person |
| Status | OPEN / FIXED PENDING RETEST / VERIFIED CLOSED / WAIVED |

Rules:

1. The implementer may mark `FIXED PENDING RETEST`, not self-certify `VERIFIED CLOSED`.
2. A skipped test cannot close a finding.
3. A static source assertion cannot replace a required browser/device, export or deployed test.
4. No district-coverage reason may be invented.
5. No public-production claim may be based only on the 17-item application register.
6. UI changes must preserve the approved look, information hierarchy and narrative grammar.
7. Database changes must be versioned, migrated, reconciled and rollback-tested.

---

## 11. Fresh coding-round definition of done

This round is complete only when:

- `UAT-P2-015` passes from a clean install;
- the four new user-reported issues meet every acceptance criterion;
- documentation and live metadata agree;
- the package tree is reproducibly installable and auditable;
- all 70 current tests plus new regression tests execute with zero skips;
- all 467 state/national and 108 district cuts reconcile;
- methodology P1 blockers are closed or the release is explicitly limited to private development preview;
- real browser/device/assistive-technology evidence is recorded for any public release;
- production platform, database, legal, GitHub, security and operational gates are closed before a production label;
- an independent retester, not the coding agent alone, records the final release verdict.

**Current release label:** **development / test preview**  
**Current production decision:** **NO-GO**  
**Next permitted action:** fresh coding/remediation round against this document, followed by independent retest.

---

## 12. Productionisation roadmap for the next pass

### 12.1 Objective

The next pass must not be framed as another general cleanup or feature-development round. Its objective is:

> Produce a reproducible, rights-safe, independently tested release candidate that can be deployed through a public GitHub repository to Vercel, backed by a production-supported database, and operated safely under realistic public usage.

The post-stability feature-extension plan is out of scope until this roadmap reaches the production launch gate.

### 12.2 Recommended target production state

This is the recommended default unless the owner records a different decision:

| Concern | Recommended target |
|---|---|
| Source repository | Public GitHub repository with protected `main` |
| Application runtime | Native supported Next.js deployment on Vercel |
| Database | Neon Free PostgreSQL; Supabase Free retained as the documented provider-switch fallback |
| Data access | Typed repository/port so application UI and analytics do not depend directly on D1 or PostgreSQL |
| Environments | Local, CI, protected Preview/staging, Production |
| Deployment | GitHub pull request → required checks → Vercel Preview → approval → Production |
| Data release | Immutable, versioned release manifest with checksums and source lineage |
| Observability | Free Vercel/Neon logs and usage views, application health checks, quota warnings and a documented manual response procedure |
| Recovery | Vercel rollback plus versioned off-provider logical database exports, tested restore and immutable data-release rollback |
| Public status | Independent/unofficial project disclosure; explicit ASER source attribution and limitations |

The current UI visual language should remain stable. Runtime/database replacement must occur behind typed boundaries and stable view models so productionisation does not become a redesign.

### 12.3 Owner decisions required before irreversible work

The coding agent must surface these decisions in its first response and must not silently choose them:

| Decision | Recommended default | Blocks |
|---|---|---|
| Software licence | **DECIDED: MIT for original project code** | Add licence and rights separation |
| ASER-derived data/content rights | **DECIDED: no written redistribution permission; use official links only and exclude source PDFs** | Implement rights-safe public repository |
| Package manager | npm for this single-package repository, unless owner chooses pnpm | Reproducible install and CI |
| Vercel architecture | Native Next.js | Runtime migration |
| Production database provider | **DECIDED: Neon Free; Supabase Free is fallback, not a second dependency** | Database migration |
| Infrastructure cost | **DECIDED: ₹0 only; no paid plan/add-on or automatic charge authority** | Architecture, monitoring and limit response |
| Vercel plan/team/billing owner | Vercel Hobby while eligible; account owner still to be named | Limits, alerts and access |
| Production domain | Named canonical domain with DNS owner | SEO, TLS and launch |
| Browser support | Latest two Chrome/Firefox/Safari plus current iOS Safari and Android Chrome | Qualification matrix |
| Analytics/privacy | No analytics until policy is approved | Privacy and telemetry |
| SLO/RPO/RTO | Explicit availability, latency and recovery targets | Performance and operations |
| Incident/security/data owners | Primary and backup for each | Alerts and public support |

Preparation that is reversible and decision-neutral may proceed, but no licence, provider, domain, billing or rights choice may be made implicitly by the coding agent.

### 12.4 Production critical path

```text
Owner decisions and release baseline
        ↓
Reproducible package tree and mandatory CI
        ↓
Stable application/data ports and compatibility tests
        ↓
Native Vercel runtime + managed PostgreSQL migration
        ↓
Immutable data/source release + rights-safe repository
        ↓
Application, methodology and documentation closure
        ↓
Protected Vercel staging qualification
        ↓
Backup/restore, outage, rollback, load and security rehearsal
        ↓
Production deployment, smoke test and monitored soak
```

No later phase can be used to waive an earlier failed gate.

### 12.5 Phase 0 — Freeze and re-baseline

**Goal:** establish exactly what is being promoted.

Required work:

1. Create a release-candidate branch using the repository’s approved branch policy.
2. Record commit SHA, Node version, chosen package manager, lockfile hash, database snapshot identity and UAT document.
3. Reproduce `UAT-P2-015`, the four new user findings, the package-tree failure and all methodology P1 findings before changing code.
4. Capture a reference set of approved desktop/mobile UI states so production refactoring cannot silently redesign the product.
5. Confirm the owner decisions in Section 12.3 or explicitly record which phases remain blocked.
6. Mark the future feature-extension plan as deferred.

Exit gate:

- immutable baseline recorded;
- defects reproduced;
- approved UI reference established;
- decisions and named owners recorded;
- no unrelated feature work in the production branch.

### 12.6 Phase 1 — Reproducible repository and mandatory CI

**Goal:** make every later result reproducible from a fresh clone.

Required work:

1. Select one package manager and one lockfile.
2. Remove only confirmed dead/generated/tool-local artifacts.
3. Make a frozen clean install pass.
4. Repair strict TypeScript validation.
5. Split scripts into explicit mandatory gates:
   - `test:unit`;
   - `test:data`;
   - `test:integration`;
   - `test:e2e`;
   - `test:a11y`;
   - `test:release`.
6. Make integration tests fail if their required server/database is missing; do not skip to green.
7. Add GitHub Actions for clean install, lint, strict type-check, build, migrations, tests, dependency audit, E2E, accessibility and artifact validation.
8. Add dependency review, secret scanning, CodeQL/Dependabot as appropriate.
9. Add public-repository governance files after licence/rights decisions:
   - `LICENSE`;
   - `NOTICE`/data-rights notice;
   - `CONTRIBUTING.md`;
   - `SECURITY.md`;
   - `CODE_OF_CONDUCT.md`;
   - issue/PR templates;
   - `CODEOWNERS`.

Exit gate:

- clean clone and frozen install pass;
- one canonical lockfile;
- zero skipped mandatory tests;
- strict type-check, lint and build pass;
- production dependency audit executes and has no unresolved critical/high findings;
- intentionally failing pull request proves required checks block merge.

### 12.7 Phase 2 — Protect architecture and migrate runtime/database

**Goal:** reach Vercel without changing the product’s visual structure or analytical meaning.

Required work:

1. Characterise the current UI/API/data contracts with golden tests.
2. Introduce or complete typed ports for:
   - observation queries;
   - metadata/catalogue;
   - trends;
   - lineage;
   - exports;
   - release manifest.
3. Ensure UI components consume stable view models and import no database driver.
4. Ensure route handlers delegate query/analytical logic rather than implementing it independently.
5. Create D1 adapter contract tests before adding PostgreSQL.
6. Implement the PostgreSQL adapter and schema behind the same port.
7. Add domain constraints for values, enums, grain uniqueness, geography parentage and dataset isolation.
8. Apply migrations to a blank database and a copy of the current release.
9. Reconcile:
   - 12,552 observations;
   - 9,033 state/national observations;
   - 3,519 district observations;
   - 467 advertised cuts;
   - 108 district cuts;
   - all source pages and URLs;
   - deterministic release checksum.
10. Convert to a Vercel-supported native Next.js build/runtime.
11. Deploy a protected Preview connected to the staging PostgreSQL database.
12. Run D1/PostgreSQL shadow parity before removing or retiring the old adapter.
13. Keep SQL, migrations and exports portable enough to restore into standard PostgreSQL or the
    documented Supabase fallback without changing UI components or analytical view models.

Exit gate:

- native Vercel Preview boots without Cloudflare bindings;
- PostgreSQL blank and upgrade migrations pass;
- D1/PostgreSQL responses reconcile for all cuts;
- no UI screenshot or accessibility-contract regression;
- Preview database credentials are isolated from Production;
- rollback to the previous adapter/release is rehearsed.

### 12.8 Phase 3 — Production data, provenance and geography release

**Goal:** make the numbers reproducible, citable and administratively interpretable.

Required work:

1. Create a source manifest containing title, edition, publisher, official URL, retrieval date, checksum, rights state and page range.
2. Create a deterministic source-to-reviewed-data-to-release pipeline.
3. Preserve ambiguity, suppression, correction and reviewer decisions in an inspectable review record.
4. Produce an immutable data-release manifest containing:
   - release ID;
   - application commit;
   - schema/migration version;
   - row counts;
   - geography/indicator/year/subgroup counts;
   - source checksums;
   - output checksums;
   - generation time;
   - reviewer/approval.
5. Implement the versioned geography and district-coverage catalogue required by `RETEST-P1-001`.
6. Reconcile the 588-district catalogue and every parent count.
7. Attach release ID, source and limitation metadata to API and detached exports.
8. Publish source PDFs only if rights permit; otherwise publish official links, checksums, page-aware manifests and reproducible acquisition instructions.
9. Separate software licence from data/report/mark rights.

Exit gate:

- rebuilding the same release twice produces the same checksum;
- every displayed/exported observation resolves to one approved source record/page;
- geography coverage and omission status are explicit;
- legal/owner review approves public repository contents;
- no repository file implies that the software licence licenses ASER reports, marks or data.

### 12.9 Phase 4 — Product, methodology and documentation closure

**Goal:** close all public-facing truth and interpretation blockers on the production architecture.

Required work:

1. Fix `RETEST-P2-004`, `RETEST-P2-005` and `RETEST-P2-006`.
2. Close `ASER-METH-P1-001` through `011` and the applicable boundary portion of `ASER-METH-P2-012`.
3. Add contextual scope, denominator, uncertainty availability, comparability and non-causal wording to UI/API/CSV/PNG.
4. Reconcile README, About, API documentation, release status and historical UAT navigation.
5. Implement independent/unofficial, AI-assistance, source, privacy, correction/takedown and consequential-use disclosures.
6. Add metadata, canonical URLs, robots/sitemap, social cards and branded error states after the production domain is confirmed.
7. Ensure Preview is not indexed.

Exit gate:

- no methodology P1 is open;
- UAT new/reopened application findings pass;
- documentation contract passes;
- detached artifacts retain context and limitations;
- ASER methodology/domain reviewer approves public analytical wording;
- owner/legal/privacy review approves final public notices.

### 12.10 Phase 5 — Production-shaped staging qualification

**Goal:** test the system users will actually receive.

Required matrix:

| Area | Required evidence |
|---|---|
| Browsers | Latest supported Chrome, Firefox, Chromium Edge, Safari/WebKit |
| Mobile | Real iOS Safari and Android Chrome |
| Assistive technology | VoiceOver/Safari, NVDA/Firefox or Chrome, TalkBack/Chrome |
| Layout | 320–1440 px, portrait/landscape, 200% and 320% zoom, text spacing |
| Journeys | All ten original personas plus novice clone/deploy/data-only users |
| Data | 467 state/national and 108 district cuts on staging |
| Exports | CSV/PNG completeness, provenance, disclaimers and hostile spreadsheet cells |
| Security | TLS, headers, CSP reports, rate limits, dependency/secret scans, error leakage |
| Performance | Lighthouse/Web Vitals, cold/warm API p50/p95/p99, concurrency and sustained load |
| Failure | database unavailable/slow, source link unavailable, malformed URL, partial timeout, cache stale |
| Operations | alerts, logs, dashboards, cost controls, incident contacts |

Exit gate:

- zero open P0s;
- zero open P1s unless a named owner/data/security waiver is recorded with expiry;
- browser/device/AT matrix passes;
- agreed performance and error budgets pass;
- no unbounded-cost path;
- staging soak completes without analytical, security or reliability regression.

### 12.11 Phase 6 — Recovery, launch and monitored soak

**Goal:** prove the owner can safely operate and reverse the release.

Before launch:

1. Configure production domain, TLS, canonical URL and environment variables.
2. Confirm Preview/Production credential and database isolation.
3. Configure backups, retention, point-in-time recovery where supported, and immutable data-release retention.
4. Because paid backup services are prohibited, create a versioned logical export on every data
   release, store it outside Neon, restore it into an isolated blank PostgreSQL database and
   reconcile it. Provider time travel is supplementary and must not be the only recovery path.
5. Rehearse:
   - application rollback;
   - database forward repair/rollback strategy;
   - data-release rollback;
   - credential rotation;
   - high-error/latency alert;
   - spend/abuse alert.
6. Freeze the release candidate and rerun `test:release`.
7. Obtain product, data/methodology, security, accessibility and owner sign-offs.

Launch sequence:

1. Deploy the saved, signed-off release candidate.
2. Run production smoke tests against HTML, APIs, database, sources, share URLs and exports.
3. Verify headers, TLS, canonical metadata, robots and monitoring.
4. Compare production row counts/checksums to the approved data release.
5. Monitor a defined soak window for errors, latency, data mismatches, database pressure, abuse and spend.
6. Record final GO/NO-GO evidence and release notes.

Exit gate:

- production smoke passes;
- monitoring and alert routing are live;
- restore and rollback evidence is timestamped;
- soak meets agreed SLO/error/data-integrity thresholds;
- final independent UAT verdict is `PASS` or properly bounded `CONDITIONAL PASS`.

### 12.12 Proposed production pull-request sequence

Keep each pull request reviewable and independently reversible:

| PR | Scope | Primary closure |
|---:|---|---|
| 1 | Package-manager consolidation, type-check repair, clean scripts | `UAT-P2-015`, part of `RETEST-P1-003` |
| 2 | Mandatory GitHub CI and integration environment | `CI-P1-001`, remaining `RETEST-P1-003` |
| 3 | Characterisation, view-model and repository-port contracts | architecture preservation |
| 4 | PostgreSQL schema/adapter, constraints and migration tests | `DB-P0-001`, database P1s |
| 5 | Native Vercel runtime and protected Preview | `PLATFORM-P0-001` |
| 6 | Release/source manifest and deterministic pipeline | data/provenance P1s |
| 7 | Geography coverage/version catalogue | `RETEST-P1-001`, `ASER-METH-P2-012` |
| 8 | Trend labels, district order and explicit theme preference | `RETEST-P2-004`–`006` |
| 9 | Methodology-safe narration and portable caveats | `ASER-METH-P1-001`–`011` |
| 10 | README/docs/disclaimers/community package | `RETEST-P1-002`, legal/GitHub/disclaimer gaps |
| 11 | Browser, mobile, AT, security and performance qualification | public-release P1 gates |
| 12 | Operations, restore, rollback and production promotion | final production gate |

Do not combine the database/runtime migration with UI redesign or feature-extension work.

### 12.13 Production scorecard

The coding agent must maintain this scorecard in its remediation evidence. `PASS` requires linked evidence; `NOT RUN` is never green.

| Gate | Current status | Required production status |
|---|---|---|
| Original application P0/P1 | Locally pass | Pass on immutable staging RC |
| New UAT findings | Open | Verified closed |
| Methodology P1 | Open | Verified closed/domain-approved |
| Strict type-check | Fail | Pass clean install/CI |
| Clean frozen install/audit | Fail/blocked | Pass |
| Public GitHub governance | Missing | Pass |
| Vercel native runtime | Missing | Pass Preview + Production |
| Production PostgreSQL | Missing | Pass migration/parity/recovery |
| Reproducible data release | Missing | Pass deterministic rebuild |
| Rights/licensing | Unresolved | Owner/legal approved |
| Cross-browser/mobile/AT | Not run | Pass supported matrix |
| Security/rate limiting | Partial local | Pass deployed |
| Performance/load | Not production-tested | Pass budget |
| Backup/restore/rollback | Not run | Pass rehearsal |
| Monitoring/alerts/owners | Missing | Operational |
| Production smoke/soak | Not run | Pass |

### 12.14 First-response contract for the next coding agent

Before changing files, the next coding agent must reply with:

1. the exact commit and working-tree status it found;
2. the defects it reproduced;
3. the owner decisions it needs now versus later;
4. its proposed PR/work-package sequence;
5. the target Vercel/database architecture and how UI stability will be protected;
6. the tests and evidence that will close each work package;
7. actions it will not take without owner approval;
8. confirmation that feature extension is deferred.

The agent must then begin with Phase 0/1, not with visual enhancements or new analytics.

### 12.15 Production promotion rule

The next pass may use these labels only:

| Evidence reached | Permitted label |
|---|---|
| Local tests only | Development build |
| Clean CI plus protected Vercel staging, but production/ops/legal gates open | Staging release candidate |
| Public deployment before full qualification | Public preview — not production-qualified |
| Every P0/P1 gate, staging matrix, recovery rehearsal, production smoke and soak passed | Production |

“All tests pass,” “deployed,” “live,” and “no known application P0/P1” are not synonyms for production readiness.

---

## 13. Autonomous execution charter and rollback policy

### 13.1 Preservation strategy

Before production work begins:

1. Preserve the current application at its immutable Git commit.
2. Create a named local baseline tag pointing to that untouched application commit.
3. Create a separate `codex/production-closure` branch.
4. Commit this UAT and roadmap as the first branch-only production-planning change.
5. Make subsequent work in small, ordered commits aligned to Section 12.12.
6. Do not rewrite, squash or delete the baseline during the build.
7. Do not force-push, deploy, publish, migrate a production database, or make the repository public without explicit authorization.

Rollback levels:

| Level | Use | Recovery method |
|---|---|---|
| Application baseline | Return to the exact pre-productionisation app | switch to the recorded baseline commit/tag |
| Work-package commit | Undo one isolated production change | revert the specific commit |
| Runtime adapter | Return from PostgreSQL/native Vercel work to current D1 adapter | retain both adapters until parity and promotion pass |
| Data release | Return to the prior immutable dataset | select the prior release manifest/snapshot |
| Deployment | Return to prior application release | Vercel rollback to the previously approved deployment |
| Database | Recover production data/schema | provider backup/restore or tested forward-repair procedure |

No destructive schema migration or removal of the current adapter is permitted until the replacement passes parity and rollback rehearsal.

### 13.2 Work permitted autonomously

The coding agent may proceed without further owner input when the work is reversible, local, and does not make a product/legal/provider decision:

- reproduce and document defects;
- protect the UI with screenshots, DOM contracts and view-model tests;
- repair TypeScript, lint and test gates;
- consolidate test scripts without choosing an external service;
- make live integration tests fail rather than skip;
- add local GitHub Actions definitions for review;
- implement the four new user-reported UX fixes while preserving the visual grammar;
- implement neutral, source-faithful analytical language;
- introduce provider-neutral repository interfaces;
- build D1 contract tests;
- prepare PostgreSQL schema/adapter prototypes behind a feature flag;
- add additive source/release/geography metadata models;
- reconcile README and historical/current UAT navigation where facts are known;
- add security, accessibility, browser and performance test harnesses;
- run local and Preview-safe tests where credentials and authorization already exist;
- commit each completed reversible work package separately.

### 13.3 Work that must pause for owner authorization

The coding agent must not autonomously:

- choose or commit a software licence;
- claim permission to redistribute ASER data, reports, marks or PDFs;
- publish the GitHub repository;
- create, purchase or change Vercel plans, domains or billing;
- select or provision a paid production database, paid backup, paid monitoring or other chargeable add-on;
- enable usage-based billing, attach a payment method for automatic overages, or convert a
  free-tier limit into spend without explicit owner approval;
- create production credentials or copy data into a production service;
- enable analytics, cookies or third-party telemetry;
- make a production deployment;
- change DNS;
- delete the D1 adapter or destructively migrate the only database;
- lower/waive a P0/P1 gate;
- materially redesign the approved UI;
- add future analytical features from the extension plan;
- publish legal, privacy or consequential-use wording as professionally approved.

### 13.4 Defaults used for reversible preparation

Unless the owner later chooses differently, local preparation may assume:

| Area | Reversible working assumption |
|---|---|
| Package manager | npm |
| Node | version declared by the repository, currently Node 22+ |
| Target runtime | native Next.js on Vercel |
| Database interface | provider-neutral PostgreSQL-compatible adapter |
| Approved primary provider | Neon Free, without coupling domain logic to it |
| Documented fallback | Supabase Free; do not run both as production dependencies |
| Infrastructure cost | ₹0 hard constraint; quota exhaustion degrades availability rather than creating charges |
| Theme | deterministic light first visit; optional explicit persistent dark choice |
| Analytics | disabled |
| Source PDFs | external official links only |
| Browser support | latest two Chrome, Firefox and Safari; current iOS Safari and Android Chrome |
| UI | current reference design frozen except documented corrective changes |
| Core data grain | existing `public_observations` grain preserved |

These assumptions permit local engineering progress but do not constitute owner/provider/legal approval.

### 13.5 Information required from the owner

The owner should answer these when available. Work that does not depend on them may continue meanwhile.

1. **Vercel ownership:** Which Vercel account will own Hobby Preview and Production, and who will
   respond if eligibility or quotas change?
2. **GitHub ownership:** Which GitHub account/organisation will own the public repository?
3. **Domain:** What production domain should become canonical?
4. **Analytics/privacy:** Keep analytics disabled at launch, or evaluate a specific free,
   privacy-approved option?
5. **Operational ownership:** Who receives security, data-quality, uptime and quota alerts?
6. **Recovery targets:** Approve proposed initial targets or provide required RPO/RTO and
   availability expectations that are realistic on free infrastructure.
7. **Public-release timing:** Is a clearly labelled public preview acceptable before full
   production qualification, or should access remain private until every production gate passes?

### 13.6 Autonomous stopping conditions

The coding agent must stop the affected workstream and preserve evidence when:

- an owner decision in Section 13.5 becomes unavoidable;
- a change would alter the approved visual identity or fundamental observation grain;
- source data conflicts cannot be resolved from authoritative evidence;
- tests reveal possible numerical corruption, provenance loss or cross-dataset leakage;
- a migration cannot be rolled back or shadow-reconciled;
- credentials, billing, legal permission or external publication are required;
- an unrelated user change overlaps the same files and cannot be safely preserved;
- a P0 regression appears.

Other independent workstreams may continue when safe.

### 13.7 Autonomous progress report

Before handing back, the coding agent must provide:

- current branch and rollback tag;
- commits created, in order;
- files and contracts changed;
- tests executed, including all skipped/blocked checks;
- UAT IDs closed, pending independent retest, reopened or blocked;
- visual and database parity results;
- unresolved owner decisions;
- exact next safe work package;
- explicit statement that no production deployment/publication occurred unless separately authorized.

### 13.8 Owner decision record — 2026-07-26 13:53 IST

These decisions supersede the corresponding open questions elsewhere in this document:

| Decision | Owner answer | Engineering consequence |
|---|---|---|
| Preserve current build | Yes | Baseline tag and production branch remain the rollback anchors |
| Change fundamental UI or database grain | No | Preserve the current visual grammar and `public_observations` grain; production changes occur behind stable contracts |
| Original code licence | MIT | Add an MIT licence for original code while explicitly excluding third-party data, reports, names and marks from that grant |
| Written ASER/Pratham redistribution permission | No | Do not bundle source PDFs or imply endorsement/permission |
| Source-document handling | Official ASER links only | Store source metadata, page locators and checksums where lawful; users obtain documents from the official publisher |
| Cost policy | Free-to-use resources only | No paid plan, add-on, marketplace purchase, usage-based overage or automatic charge may be enabled |
| Primary production database | Neon Free PostgreSQL | Implement behind the provider-neutral data port and qualify its free-tier limits |
| Database fallback | Supabase Free | Maintain a tested PostgreSQL export/restore path; do not add unused Auth, Storage, Realtime or public Data API dependencies |
| Hosting | Vercel Hobby, subject to current eligibility | Keep the project personal/non-commercial unless the plan decision is revisited; recheck terms before launch |

#### Free-tier implications and mandatory controls

The owner has chosen a zero-cost launch, not unlimited infrastructure. The release must disclose
and engineer around these constraints:

1. Free plans provide no production uptime SLA, paid support commitment or guarantee of capacity.
2. Neon Free has finite database storage, compute hours and transfer. Idle compute scales down
   and may add a short cold-start delay when it wakes.
3. Supabase Free is a fallback, not automatically superior: it offers a broader product surface,
   but low-activity projects may pause and the free plan has no automatic backups. Its Auth,
   Storage, Realtime and generated Data API are not required by this read-only application.
4. Vercel Hobby is subject to personal/non-commercial eligibility and finite quotas. The owner
   must revisit the plan before any commercial, institutional or otherwise ineligible operation.
5. Quota exhaustion must result in bounded, honest degraded service. The application must never
   fabricate, reuse stale data without disclosure, or silently activate billable capacity.
6. Immutable public data should be cached aggressively, but cache keys and invalidation must
   include the data-release identity so one release cannot leak into another.
7. Each approved data release must produce a versioned logical PostgreSQL export, schema
   migrations, manifest and checksums stored outside the database provider.
8. A clean restore into an isolated database and full API/data reconciliation are release gates.
9. The provider-neutral port and stable UI view models are mandatory: changing Neon to Supabase
   or another PostgreSQL host must not require a UI redesign or change analytical meaning.
10. Provider prices, quotas and terms are external and changeable. Re-verify them against official
    documentation immediately before each public release and record the date in release evidence.

#### Zero-cost release acceptance criteria

- documented monthly storage, compute and transfer budget based on measured staging traffic;
- indexed and bounded production queries with cold/warm latency evidence;
- cache and rate-limit behaviour tested under burst and sustained load;
- alerts or a documented manual check for approaching every available free-tier quota;
- clear maintenance/degraded-service messaging for database or quota unavailability;
- logical export created without secrets and restored successfully into a blank database;
- restored row counts, all 467 state/national cuts, all 108 district cuts, lineage and release
  checksum reconcile exactly;
- no browser bundle, repository file, log or exported artefact contains a database secret;
- no Supabase-specific client, Auth, Storage, Realtime or Data API coupling is introduced merely
  to preserve fallback status;
- no payment method, paid plan or chargeable feature is required by the documented launch path;
- README, deployment instructions and public limitations accurately describe the free-tier
  availability risk and the independent/non-official nature of the project.
