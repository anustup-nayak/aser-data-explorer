# ASER Data Explorer v2 — Quality Assurance Specification

## 1. Purpose and release standard

This is the authoritative test specification for the public ASER Data Explorer. It applies to every build that exposes approved ASER observations, including local preview, staging, and production. The dashboard is **not releasable** unless every P0 test passes, all P1 failures have an approved waiver, and no displayed observation lacks approved source lineage.

The product is a public analytical explorer, not a presentation page. A result is correct only when its chart, table, CSV, citation, URL state, and metadata describe the same approved query result.

### Severity and release policy

| Level | Meaning | Release policy |
|---|---|---|
| P0 | False or unavailable data, broken core task, privacy/public-boundary breach, inaccessible primary path | Block release |
| P1 | Materially misleading analysis, broken secondary task, missing source/caveat, severe responsive defect | Block public release unless explicitly waived |
| P2 | Friction, presentation inconsistency, minor accessibility issue | Fix before the next scheduled release |
| P3 | Cosmetic or copy improvement | Backlog |

## 2. Test environments, fixtures, and oracle data

### Environments

- **Local:** D1-compatible database seeded from the approved migration; no static fallback values are permitted.
- **Staging:** isolated Sites-managed D1 with the exact release migration and a deterministic test dataset.
- **Production:** release D1, read-only public API, release metadata, and no review/staging tables exposed.

### Required fixtures

Maintain fixtures in version control and run them against API, UI, and export tests.

| Fixture | Purpose | Minimum contents |
|---|---|---|
| `approved_baseline` | Main happy-path data | Approved national and state observations for 2018, 2022, and 2024; direct source URL/page lineage |
| `missing_combination` | Honest no-data state | Valid indicator/year/geography/subgroup combination with zero approved rows |
| `non_comparable` | Trend guardrail | Indicator version not explicitly comparable across selected years |
| `caveated_comparable` | Caveat visibility | Trend marked `comparable_with_caveats` |
| `partial_coverage` | Coverage behaviour | Indicator available in only some states or years |
| `future_release` | Extensibility | One new approved year, indicator, geography, and release note added without UI code changes |
| `rejected_private` | Public boundary | Rejected, pending, low-confidence, raw, staging, and audit records that must never appear in public responses |
| `lineage_gap` | Ingestion rejection | Candidate row with missing page or document lineage; it must be excluded from public data |

### Data oracle

The approved pilot migration is the initial baseline. Before each release, record and approve:

- release identifier and migration checksum;
- total approved public observations;
- count by observation year, geography type, domain, indicator, subgroup, and unit;
- count of source-lineage gaps, which must be zero;
- a golden set of at least ten observations spanning national/state, reading/arithmetic/enrolment, and every published year.

The golden set must contain canonical numeric values, units, source report title, source URL, PDF page, comparability status, and expected CSV row. It is the oracle for end-to-end reconciliation.

## 3. Data and database test suite

### Public-data boundary

| ID | Priority | Test | Expected result |
|---|---:|---|---|
| DATA-001 | P0 | Query every public endpoint for approved records. | Every row has approved status, mapped geography, approved indicator version, passing lineage, source URL, and PDF page. |
| DATA-002 | P0 | Insert/seed pending, rejected, low-confidence, raw, staging, and audit-only rows. | None are returned by metadata, ranking, profile, trend, lineage, or CSV endpoints. |
| DATA-003 | P0 | Inspect deployed schema and API routes. | No raw, staging, review queue, or audit record is publicly readable. |
| DATA-004 | P0 | Compare public-row count with the curated source view. | Counts match exactly for the release snapshot. |
| DATA-005 | P0 | Validate all numeric values and units. | No blank/dash/NA/footnote marker becomes zero; percentage values retain precision policy. |
| DATA-006 | P1 | Validate source lineage uniqueness. | Each displayed observation resolves to one current source document/page; duplicate lineage is intentional and documented. |
| DATA-007 | P1 | Validate geography labels and aliases. | UI uses canonical names; accepted aliases resolve consistently; no duplicate state appears under alternate spelling. |
| DATA-008 | P1 | Validate indicator labels. | Plain-language display name, original ASER wording, domain, unit, and definition resolve to the same indicator version. |

### Migration and release tests

| ID | Priority | Test | Expected result |
|---|---:|---|---|
| DATA-009 | P0 | Apply migration to a blank D1 database. | Migration completes and creates only intended public tables/indexes/views. |
| DATA-010 | P0 | Apply the release migration twice. | Second application is safe or rejected as already applied; no duplicate observations. |
| DATA-011 | P0 | Roll forward from previous release to a future-year fixture. | Prior rows remain unchanged; new approved rows appear exactly once. |
| DATA-012 | P1 | Verify indexes against ranking, profile, metadata, and CSV query plans. | Common filtered views remain within the agreed response budget. |
| DATA-013 | P1 | Validate release metadata. | Published date, report title, coverage, and limitations match the release manifest. |

## 4. API and analytics correctness suite

All endpoints must reject malformed parameters with a typed 400 response and must never silently substitute a default indicator, year, subgroup, or geography.

### Metadata

| ID | Priority | Test | Expected result |
|---|---:|---|---|
| API-001 | P0 | Request metadata for baseline release. | Years, indicators, domains, geographies, subgroups, units, and coverage come from D1 dimensions, not hard-coded UI lists. |
| API-002 | P0 | Add `future_release` fixture then request metadata. | New year/indicator/geography appears without frontend code change. |
| API-003 | P1 | Request metadata after partial coverage fixture. | Availability is explicit by indicator/year/geography/subgroup; unavailable is distinct from zero. |

### Ranking, map, and table

| ID | Priority | Test | Expected result |
|---|---:|---|---|
| API-010 | P0 | Request state ranking for each golden query. | Rows, values, units, rank order, source pages, and comparability exactly match the data oracle. |
| API-011 | P0 | Request a valid query with zero approved rows. | Empty typed result with coverage/no-data reason; never stale prior results. |
| API-012 | P0 | Request invalid year, indicator, subgroup, and geography type. | Typed validation error; no fallback data. |
| API-013 | P1 | Test ties, decimal values, and reverse-sort controls. | Stable deterministic ordering, documented tie-breaker, correct displayed precision. |
| API-014 | P1 | Compare map/table/ranking payloads. | Identical entity set and values for the same query state. |

### Trends and comparability

| ID | Priority | Test | Expected result |
|---|---:|---|---|
| API-020 | P0 | Request direct-comparison trend from golden set. | Correct ordered annual series, no invented interpolation, source metadata per point. |
| API-021 | P0 | Request `non_comparable` trend. | Endpoint/UI returns an explicit non-comparable state; no chart points are rendered. |
| API-022 | P0 | Request `caveated_comparable` trend. | Trend renders with a persistent caveat badge and expandable explanation. |
| API-023 | P1 | Request a series with absent years. | Gaps stay gaps; no zero, carry-forward, or implied continuity. |

### Profile, lineage, citation, and export

| ID | Priority | Test | Expected result |
|---|---:|---|---|
| API-030 | P0 | Request an India and a state profile. | Latest result cards, trend, coverage, and comparison data reconcile to individual API queries. |
| API-031 | P0 | Request lineage for every golden observation. | Report title, source URL, PDF page, indicator wording, and numeric value match the oracle. |
| API-032 | P0 | Export every golden query as CSV. | Exported rows equal visible table rows; headers, precision, unit, lineage, and comparability are preserved. |
| API-033 | P1 | Generate citation from active view. | Citation includes indicator, geography scope, year/subgroup, ASER report, page/source link, and retrieval/release context. |
| API-034 | P1 | Attempt CSV export for a no-data query. | Valid empty CSV with headers and machine-readable coverage note, or a clearly labelled no-data response. |

## 5. UX and interaction test suite

### Primary user journeys

| ID | Priority | Journey | Success criteria |
|---|---:|---|---|
| UX-001 | P0 | First-time policy user compares state reading in latest year. | From landing to ranked result in no more than three deliberate interactions; question, unit, year, and source are visible. |
| UX-002 | P0 | User changes indicator, year, and subgroup. | Active question, title, visual, table, source/caveat, download, and URL update atomically. |
| UX-003 | P0 | User opens a state profile. | State selection changes to profile view with latest indicators, trend availability, peer comparison, and source links. |
| UX-004 | P0 | User requests a non-comparable trend. | Product explains the limitation in plain language and offers a valid ranking/profile alternative. |
| UX-005 | P0 | User encounters no data. | Product says what is unavailable, preserves selected filters, suggests available alternatives, and does not display previous results. |
| UX-006 | P1 | User shares a configured view. | Copied/opened URL restores all filters, selected states, view mode, and sort order. |
| UX-007 | P1 | User downloads selected results. | Download name, rows, and citation context match the active view; completion feedback is visible. |
| UX-008 | P1 | Beginner opens unfamiliar metric. | Definition, source wording, unit, population, and interpretation are understandable without leaving the page. |

### Interaction rules

- Loading state: disable only affected controls, retain the last confirmed result with an explicit loading layer, and announce status to assistive technology.
- Error state: retain filter selections; remove stale implied results; identify whether the problem is invalid selection, no approved data, or temporary service error.
- No-data state: use a dedicated panel, not an empty chart shell.
- Map state: a state must be keyboard focusable; focus/click shows state, value, rank, unit, year, source, and availability. Do not ship a decorative pseudo-map.
- Table state: default sort and active sort direction are visible; table search is case-insensitive and does not change the data query.
- Trend state: hover/focus exposes exact year/value/source; a non-comparability badge remains visible outside the tooltip.
- Control state: no inert buttons, links, tabs, disclosure controls, or filters are allowed in production.

## 6. UI, accessibility, and responsive suite

### Visual-system tests

| ID | Priority | Test | Expected result |
|---|---:|---|---|
| UI-001 | P1 | Visual regression at desktop, tablet, and mobile widths. | No clipped controls, overlapping labels, unreadable legends, or horizontal page overflow. |
| UI-002 | P1 | Compare chart/table/map at identical query state. | Same title, unit, period, geography scope, values, and caveat label. |
| UI-003 | P1 | Inspect default landing viewport. | User can start an analytical task without scrolling through decorative content. |
| UI-004 | P2 | Test long indicator names, long state names, and large numbers. | Labels wrap or truncate with accessible full text; no collisions. |

### Accessibility tests

| ID | Priority | Test | Expected result |
|---|---:|---|---|
| A11Y-001 | P0 | Keyboard-only completion of UX-001 through UX-005. | Logical focus order, visible focus indicator, no focus trap, no mouse-only action. |
| A11Y-002 | P0 | Screen-reader audit of filters, chart, table, source drawer, loading/error states. | Controls have names/instructions; chart has text summary and accessible data table; live changes are announced once. |
| A11Y-003 | P1 | Colour/contrast audit. | Text and controls meet WCAG 2.2 AA; colour is never the only encoding of rank, availability, or trend. |
| A11Y-004 | P1 | Reduced-motion and zoom test at 200% and 400%. | No essential animation; content reflows without loss of function. |
| A11Y-005 | P1 | Touch-target and mobile screen-reader test. | Interactive targets are usable and labels remain discoverable. |

Run automated axe checks on every route and critical state, then complete manual keyboard and screen-reader checks before public release. Automated results do not replace manual chart and dynamic-state testing.

## 7. Security, privacy, reliability, and performance suite

| ID | Priority | Test | Expected result |
|---|---:|---|---|
| NFR-001 | P0 | Attempt direct access to private tables/routes and malformed SQL-like parameters. | No data disclosure; parameterized queries; safe validation errors. |
| NFR-002 | P0 | Simulate D1/API unavailability. | Clear service error; no static or cached result presented as current. |
| NFR-003 | P1 | Cache and release transition test. | Release metadata and data are version-consistent; stale cache does not combine old values with new coverage. |
| NFR-004 | P1 | Performance test on baseline and future-release scale. | Metadata, primary ranking, profile, and CSV meet agreed latency budgets; UI remains responsive during updates. |
| NFR-005 | P1 | Browser compatibility test. | Latest stable Chrome, Safari, Firefox, and mobile Safari/Chrome support all primary journeys. |
| NFR-006 | P2 | Link-check source URLs and PDF pages. | No broken source links; redirect policy is explicit. |

## 8. Automation architecture

### Unit tests

- Query parameter validation, label/definition formatting, value precision, citation assembly, URL-state serialization, comparability decisions, no-data/error state reducers.

### Integration tests

- D1 migrations, public-boundary filtering, all API contracts, golden-query reconciliation, CSV parity, future-year ingestion, source lineage, and query performance.

### End-to-end tests

- Browser tests for every P0 UX journey at desktop and mobile widths, including keyboard navigation and D1 service outage behaviour.

### Visual regression tests

- Baseline screenshots for landing, ranking, map, table, state profile, direct trend, caveated trend, non-comparable state, no-data, API error, methods, desktop, tablet, and mobile.
- Review diffs manually when chart geometry, source/caveat placement, or responsive controls change.

## 9. Release checklist and evidence

Every release must produce a machine-readable test report containing test ID, environment, build/release identifier, fixture version, pass/fail, observed result, and evidence link.

Public release requires:

1. P0 suite fully passed.
2. Data-oracle reconciliation passed, including zero public lineage gaps.
3. CSV/table/chart parity passed for every golden query.
4. Future-release fixture passed without frontend code change.
5. Accessibility tests passed, including manual keyboard and screen-reader review.
6. Visual regression approved for affected views.
7. Product owner signs off on any P1 waiver; waiver records user impact and expiration date.

## 10. Definition of done for a new feature

A new filter, chart, geography level, indicator, report year, or export capability is complete only when it has:

- metadata coverage and approved-data boundary tests;
- positive, no-data, invalid-input, and service-error tests;
- parity tests across every surface it affects;
- source/citation and comparability tests where applicable;
- keyboard, screen-reader, desktop, and mobile coverage;
- updated golden data and visual baselines;
- release-checklist evidence.
