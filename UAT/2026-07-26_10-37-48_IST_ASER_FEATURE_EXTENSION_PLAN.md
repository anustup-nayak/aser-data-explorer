# ASER Data Explorer — Post-Stability Feature Extension Plan

**Created:** 2026-07-26 10:37:48 IST  
**Status:** Future roadmap; implementation must begin only after the current product passes its stability and production gates  
**Data scope:** Existing `public_observations` release only; no Beyond Basics, specialized reports, new extraction, or respondent-level microdata  
**Approved product direction:** Constrained, guided **Detailed analysis** workspace—not a free-form Power BI-style dashboard  
**Design requirement:** Preserve the existing product’s visual language, narrative grammar, information hierarchy, and restrained analytical character  
**Companion release specification:** `UAT/2026-07-26_08-33-33_IST_ASER_UAT_FINDINGS.md`

---

## 1. Decision summary

After the existing application is stable, add one route-based **Detailed analysis** destination alongside the current guided Explore experience and About content:

```text
ASER Data Explorer        Explore | Detailed analysis | About the data
```

Recommended routes:

```text
/             Existing guided Explore experience
/analysis     New constrained Detailed analysis workspace
/about        Methodology, definitions, limitations, and responsible use
```

The extension will:

- expose more analytical value from the 12,552 observations already loaded;
- preserve the existing Explore page as the default for most users;
- organize all ten proposed capabilities around four user tasks rather than ten feature tabs;
- reveal only filters valid for the selected ASER construct;
- prevent incompatible populations, grains, years, tasks, and subgroups from being combined;
- preserve source/page lineage and interpretive caveats through screen, table, URL, CSV, PNG, and citation;
- use independent feature flags and module-level release gates;
- add no new ASER report family or raw/microdata capability.

It will not:

- create a general BI canvas;
- permit arbitrary fields, joins, chart types, formulas, correlations, regressions, or composite scores;
- redesign or crowd the current Explore experience;
- create a competing visual system or dashboard aesthetic;
- infer statistical significance, causality, school effectiveness, policy priority, or same-child progress.

---

## 2. Specialist review record

This plan synthesizes four distinct specialist reviews:

| Role | Primary contribution |
|---|---|
| Senior product manager | Personas, product scope, prioritization, release packages, flags, metrics, decisions, and launch gates |
| Senior software/data architect | Verified data envelope, semantic registry, query/API/view-model contracts, caching, tests, migration, and rollback |
| Senior UX/UI and accessibility expert | Non-cluttering information architecture, route/navigation decision, narrative controls, desktop/mobile patterns, accessibility, and usability qualification |
| ASER research and policy methodology expert | Construct, population, denominator, representativeness, valid derivations, prohibited comparisons, caveats, and domain acceptance battery |

### 2.1 Consensus

All four perspectives agree that:

1. The current guided Explore page must remain the uncomplicated default.
2. Detailed Analysis should be a real shareable route, not more controls added to the current “big question.”
3. Four user tasks are easier and safer than ten feature tabs.
4. A metadata-driven semantic layer must control every available measure, dimension, comparison, visual, derivation, and caveat.
5. The current observation table is sufficient for the ten extensions; no destructive database redesign is required.
6. Every feature must preserve exact population, denominator, year, geography grain, construct, source, and limitation.
7. A profile may juxtapose panels but may not calculate across incompatible panels.
8. A generic Power BI-style canvas would increase clutter, accessibility burden, engineering cost, and invalid ASER analysis.
9. Feature work begins only after the current product’s P0/P1, provenance, accessibility, and production foundations pass.

### 2.2 Resolved product decision: not a Power BI clone

| Option | Strength | Risk | Decision |
|---|---|---|---|
| Free-form Power BI-style builder | Maximum flexibility | Makes incompatible measures look combinable; high clutter; poor mobile/AT authoring; large semantic, persistence, query, layout, and testing burden | Rejected |
| Constrained guided Detailed Analysis | Flexible places, periods, metrics, valid filters, compatible charts, tables, URLs, and exports | Less freedom for expert analysts | **Approved** |
| Download/API for external BI | Gives expert users unrestricted tools | Detached analysis can lose context | Required complementary path |

The approved workspace may feel powerful through multi-select years and places, range shortcuts, compatible visual choices, sorting, table views, shareable state, and filtered exports. The semantic registry—not the user—determines what combinations and chart families are valid.

No “My dashboard,” pinboard, saved board, or free-positioned canvas is included in this roadmap. Such a feature requires a separate evidence-backed decision after the ten modules are stable.

---

## 3. Mandatory entry gate

Feature development must not begin until the current product has:

1. Closed all applicable application and methodology P0/P1 findings.
2. One canonical normalized analytical context and query identity.
3. One shared query contract for Explorer, Lineage, API CSV, and UI.
4. Per-observation and per-point provenance across UI, API, table, CSV, and PNG.
5. No stale request result, silent geography substitution, or invalid URL relationship.
6. Correct missing, suppressed, unavailable, partial, and non-comparable states.
7. Approved visual and semantic baselines that annotate known historical defects.
8. A stable production/Preview runtime and database decision.
9. A reconciled current-data availability catalogue.
10. A clean strict type-check, deterministic tests, and supported release evidence.

If a prerequisite reopens, pause the affected extension module. Do not use new features to work around an unresolved core defect.

---

## 4. Product objective and personas

### 4.1 Objective

Allow users to perform deeper, valid descriptive analysis using the already-loaded ASER Basic aggregates without forcing them to understand database terminology or allowing them to create misleading comparisons.

### 4.2 Personas and jobs

| Persona | Job to be done | Most relevant capabilities |
|---|---|---|
| Policy/research analyst | Examine comparable point-estimate change and retrieve defensible evidence | Trends, recovery, place comparison, coverage |
| State education officer | Understand one state across learning and participation | Enrolment, heatmap, state profile |
| District education officer | Place a district within its own parent state | District profile and comparison |
| FLN programme lead | Examine distributions of reading/arithmetic tasks across grades | Grades I–VIII heatmap |
| Equity/access analyst | Examine age/sex schooling composition descriptively | Enrolment, age/sex, early childhood |
| Journalist | Reproduce, qualify, cite, share, and export a finding | Trends, comparison, coverage, lineage |
| Teacher/parent/beginner | Answer one focused question without advanced filters | Existing Explore remains default |
| Repository/data user | Learn what is available, missing, suppressed, or caveated | Coverage, source manifest, exports |
| Keyboard/screen-reader/mobile user | Complete the same tasks without reduced analytical context | All modules |

---

## 5. Existing data envelope

The current migration chain contains:

- **12,552 observations**;
- **9,033 national/state observations**;
- **3,519 district observations**;
- 27 state labels plus India (rural);
- 588 state-qualified district labels with at least one observation;
- survey years 2012, 2014, 2016, 2018, 2022, and 2024.

### 5.1 Availability matrix

Legend:

- **●** strong direct support;
- **◐** partial support or narrower construct;
- **—** no relevant loaded observations.

| Feature | 2012 | 2014 | 2016 | 2018 | 2022 | 2024 | Geography |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| Long-run school-type trends | ● | ● | ● | ● | ● | ● | India (rural) + states |
| Learning recovery | — | — | — | ● | ● | ● | India (rural) + states |
| Selected-place comparison | ◐ | ◐ | ◐ | ● | ● | ● | States; 2024 districts within one parent |
| Coverage/source lineage | ● | ● | ● | ● | ● | ● | All loaded levels |
| Enrolment/out-of-school | — | — | — | ● | ● | ● | India (rural) + states; 2024 district subset |
| Grades I–VIII heatmap | — | — | — | — | — | ● | States only |
| District profile | — | — | — | — | — | ● | Districts within parent state |
| Age/sex schooling composition | — | — | — | — | — | ● | States only |
| Early-childhood participation | — | — | — | — | ● | — | States only |
| Complete state profile | ◐ | ◐ | ◐ | ● | ● | ● | State panels with mixed coverage |

### 5.2 Exact construct envelope

| Construct | Loaded years | Loaded geography | Constraints |
|---|---|---|---|
| School-type reading/arithmetic | 2012–2024 six rounds | India (rural) + states | Grades III/V/VIII; Govt, Pvt, Govt & Pvt weighted; sparse cells |
| All-children learning headlines | 2018/2022/2024 | India (rural) + states | Grades III/V/VIII; six indicators |
| Grade learning distributions | 2024 | States only | Grades I–VIII; five exclusive rungs per subject plus Total |
| District learning | 2024 | Districts + matching state anchors where published | Grade bands III–V and VI–VIII |
| Headline enrolment | 2018/2022/2024 | India (rural) + states | Ages 6–14 government schools; ages 15–16 not enrolled |
| District enrolment | 2024 | Districts | Ages 6–14 government-school enrolment and not enrolled |
| Early-childhood distribution | 2022 | States only | Exact ages 3–8; seven substantive categories plus Total |
| Age/sex schooling composition | 2024 | States only | Four substantive schooling categories plus Total; 11 population cuts |
| Source/coverage catalogue | All loaded years | All loaded levels | URL, PDF page, unit, comparability per observation |

Important constraints:

- Early-childhood, age/sex composition, and Grade I–VIII distributions have no loaded India (rural) row.
- District data is 2024-only and district peers must share one parent state.
- District learning uses grade bands, not the state single-grade construct.
- Missing or suppressed values are absent, not zero.
- `Total` rows validate compositions and must not become an extra visual segment.
- The loaded data contains no sample sizes, survey weights, standard errors, or confidence intervals.

---

## 6. Experience and design contract

### 6.1 Preserve the current product’s identity

Detailed Analysis must look and read like the existing ASER Data Explorer operating at a deeper level—not a foreign dashboard embedded inside it.

It must reuse:

- the warm paper background and white analytical cards;
- existing heading and body typography;
- reading-blue, arithmetic-teal, and marigold focus/selection semantics;
- current border, radius, spacing, shadow, and source-line treatments;
- the natural-language analytical question;
- answer-first cards followed by chart/table evidence;
- compact, source-linked footers;
- restrained two-column desktop composition and single-column mobile rhythm;
- existing plain-language voice.

It must not introduce:

- a new design system or component library;
- a dark enterprise-dashboard chrome;
- dense permanent filter rails;
- raw database field names;
- floating panels, arbitrary grids, drag/drop, or chart-builder controls;
- ten nested feature tabs;
- unexplained icons, abbreviations, or BI terminology;
- a separate colour system for every metric.

### 6.2 Narrative grammar

The current product asks one natural-language “big question.” Detailed Analysis should preserve that grammar:

```text
Show [Grade V reading] for [government-school children]
in [Bihar] from [2012] to [2024].
```

```text
Compare [Bihar, Odisha and Jharkhand] on [Grade V reading]
for [all children] in [2024].
```

```text
Build a state profile for [Bihar] using each panel’s latest available round.
```

The committed question must:

- be visible before and after results;
- drive the page title, accessible summary, URL, table caption, export, and citation;
- name rural scope, population, construct, geography, and round;
- never use internal indicator strings as primary user copy;
- never silently change when an invalid option is requested.

Use **Detailed analysis**, not “Slice & Dice,” “Cube,” “Report Builder,” or “Power BI.”

### 6.3 Navigation semantics

The three main destinations are separate pages and should use ordinary navigation links, not ARIA tabs:

- Explore;
- Detailed analysis;
- About the data.

This avoids extending the current incomplete tab semantics and supports bookmarks, browser history, sharing, and route-level lazy loading.

### 6.4 Four-task information architecture

Do not expose ten feature choices at once. Organize the workspace around:

| User task | Capabilities |
|---|---|
| **See change over time** | School-type trends, learning recovery, enrolment trends |
| **Compare places or groups** | Selected places, age/sex composition, state/district comparisons |
| **Build a place profile** | State profile, district profile, Grades I–VIII heatmap, early-childhood snapshot |
| **Check coverage and sources** | Availability matrix, missingness, comparability, source lineage |

Topics are a second dimension:

- Learning;
- Enrolment and out-of-school;
- Schooling composition;
- Early childhood;
- Coverage and sources.

### 6.5 Progressive controls

Show no more than five essential controls:

1. analysis task;
2. topic;
3. measure;
4. place/geography;
5. year or valid period.

Place applicable secondary controls under **More filters**:

- grade or grade band;
- school type;
- age or age band;
- sex;
- exact/cumulative threshold;
- comparison baseline;
- direct/derived display.

Only show applicable controls. Do not show a wall of disabled filters.

Detailed Analysis must use an explicit **Update analysis** action because multi-select and dependent controls create invalid intermediate states. Keep **Reset filters** secondary.

The URL updates only when the normalized analysis commits successfully.

### 6.6 Desktop wireframe

```text
┌──────────────────────────────────────────────────────────────────────┐
│ ASER Data Explorer       Explore | Detailed analysis | About the data│
├──────────────────────────────────────────────────────────────────────┤
│ Detailed analysis                                                  H1│
│ Build a focused view from published rural ASER aggregates.           │
│                                                                      │
│ What would you like to do?                                           │
│ [Change over time] [Compare] [Place profile] [Coverage & sources]     │
│                                                                      │
│ THE ANALYTICAL QUESTION                                              │
│ Show [reading ▼] for [Std V ▼] children in [Govt schools ▼]          │
│ in [Bihar ▼] from [2012 ▼] to [2024 ▼].                              │
│                                                                      │
│ [More filters ▾]                         [Reset] [Update analysis]     │
│ Rural · published aggregate · point estimate · uncertainty unavailable│
├──────────────────────────────────────────────────────────────────────┤
│ Result summary and contextual caveat                                 │
├─────────────────────────────────┬────────────────────────────────────┤
│ Primary chart                   │ Context/comparison card             │
│ View as table                   │ View as table                       │
│ Source · Download               │ Source · Download                   │
├─────────────────────────────────┴────────────────────────────────────┤
│ Coverage, definitions, sources and limitations ▾                     │
└──────────────────────────────────────────────────────────────────────┘
```

### 6.7 Mobile wireframe

```text
ASER Data Explorer                                      [Menu]

Detailed analysis

[Analysis task ▼]

Current question
Show reading for Std V children …

[Filters (4)]                              [Update]

Result summary
[Contextual caveat]

[Primary chart]
[View as table]
[Source and download]

[Supporting context]
[Definitions and limitations]
```

On mobile, **Filters** opens an accessible full-height sheet/dialog with native controls, Cancel, Reset, and Apply. Opening moves focus to the dialog heading; closing returns it to Filters. The background is inert while open. Do not use horizontally scrolling feature tabs.

---

## 7. Semantic layer and compatibility contract

### 7.1 Canonical context

Keep the existing learning-specific `Question` as an Explore compatibility adapter. Introduce a broader immutable context for Detailed Analysis:

```ts
type AnalysisContext = {
  contractVersion: "1";
  dataRelease: string;
  featureId: FeatureId;
  dataset: "aser";
  measureId: MeasureId;
  years: number[];
  geographyLevel: "national" | "state" | "district";
  geographies: string[];
  parentGeography?: string;
  dimensions: {
    grade?: string;
    gradeBand?: string;
    schoolType?: string;
    age?: string;
    ageBand?: string;
    sex?: string;
    skillLevel?: string;
    thresholdMode?: "exact" | "cumulative";
  };
  analysisType: "snapshot" | "trend" | "comparison" | "distribution" | "profile" | "coverage";
};
```

Rules:

- normalize once at the route boundary;
- produce one immutable query/cache/request identity;
- reject incompatible combinations rather than selecting a “nearest” result;
- use stable measure IDs as query keys;
- keep official indicator strings as source/display metadata;
- echo the complete normalized context and release in every result/export.

### 7.2 Feature/measure registry

Implement a typed semantic registry before database redesign:

```ts
type MeasureDefinition = {
  id: MeasureId;
  label: string;
  topic: string;
  sourceIndicators: string[];
  constructId: string;
  populationId: string;
  denominator: string;
  unit: "percent";
  availableYears: number[];
  geographyLevels: GeographyLevel[];
  allowedDimensions: DimensionName[];
  requiredDimensions: DimensionName[];
  compatibilityKey: string;
  directOrDerived: "direct" | "derived";
  derivation?: DerivationDefinition;
  allowedVisuals: ViewType[];
  caveats: CaveatId[];
  uncertainty: "unavailable";
};
```

The registry drives:

- task and topic choices;
- control visibility;
- validation and typed incompatibility;
- query specifications;
- derivation eligibility;
- chart/table choices;
- caveats and narratives;
- export metadata;
- availability documentation;
- exhaustive tests;
- feature flags.

### 7.3 Mandatory compatibility predicate

A comparison/series may render only when the server proves equality of:

```text
dataset
+ construct_id
+ population_id and denominator
+ indicator/task
+ unit
+ subgroup semantics
+ exact/cumulative mode
+ geography level
+ release/comparability rule
```

Additional rules:

- trends require the same geography and an approved transition between every adjacent round;
- `comparable_with_caveats` must expose its specific caveat;
- district peers require the same parent;
- a state anchor is context, not a district peer;
- cross-grade heatmaps are cross-sectional profiles, not trajectories;
- profiles may juxtapose panels but cannot calculate across them;
- state-only observations cannot be averaged into India (rural);
- no missing or suppressed value can become zero, interpolation, or carry-forward.

### 7.4 Explicitly blocked combinations

The engine must reject:

1. `Govt & Pvt (weighted)` versus all-children headline as identical.
2. Government/private difference labelled school effect or quality.
3. Grade III state versus district Grade III–V as the same construct.
4. Grade V state division versus district Grade III–V subtraction.
5. Reading versus arithmetic as a shared scale or “lead.”
6. Exact rung versus cumulative threshold without a disclosed transformation.
7. 2022 early-childhood versus 2024 schooling composition as a trend.
8. Ages 15–16 not-enrolled trend versus ages 6–14 district snapshot.
9. Boys ages 7–10 versus girls ages 11–14 as a gender gap.
10. Overlapping age populations summed or averaged.
11. Districts from different parent states in one league table.
12. State-only rows averaged into India (rural).
13. Missing/suppressed values converted to zero.
14. Different rounds described as the same children.
15. Any significance, causal, impact, winner, or policy-priority conclusion.

Return a typed explanation naming the conflicting dimensions and valid alternatives.

---

## 8. Architecture plan

### 8.1 Flow

```text
URL / analysis controls
        ↓
Runtime schema validation
        ↓
Semantic registry + compatibility check
        ↓
Typed, bounded query specification
        ↓
Shared observation repository
        ↓
Pure approved derivation
        ↓
Stable analytical view model
        ↓
Screen · table · API · CSV · PNG · citation
```

### 8.2 Focused modules

Suggested logical location:

```text
app/lib/analysis/
  types.ts
  registry.ts
  normalize.ts
  measures.ts
  compatibility.ts
  derivations.ts
  narratives.ts
  view-models.ts
  exports.ts
```

This is a logical boundary, not permission for a cosmetic folder rewrite.

Components must not:

- query data;
- calculate cumulative percentages or gaps;
- determine comparability;
- infer winners, significance, or causality;
- collapse sources;
- construct independent export values.

### 8.3 Shared view models

Provide:

- `TrendViewModel`;
- `PlaceComparisonViewModel`;
- `CompositionViewModel`;
- `HeatmapViewModel`;
- `ProfileViewModel`;
- `CoverageViewModel`;
- `SourceManifestViewModel`.

Every result includes:

- normalized question;
- data release;
- construct/population/denominator;
- direct/derived status and formula;
- values and explicit missing states;
- dimensions varied and held constant;
- per-observation/component sources;
- comparability;
- uncertainty availability;
- permitted/prohibited interpretations;
- screen/table/export-ready representation.

### 8.4 API

Do not create ten independent route implementations. After the shared service is stable, add:

```text
GET /api/v1/catalogue
GET /api/v1/analysis?feature=...&measure=...&...
GET /api/v1/analysis/export?...&format=csv
```

Existing routes remain during migration and become adapters to the shared repository/service.

Required response states:

- `ready`;
- `partial`;
- `unavailable`;
- `suppressed`;
- `not_comparable`;
- `invalid_context`;
- `service_unavailable`.

### 8.5 Database

Initial extension work requires no destructive migration and no rewrite of `public_observations`.

Use:

- stable IDs in the application semantic registry;
- existing observations as the physical source;
- reversible indexes only after query-plan evidence;
- additive schema work only when a measured integrity or release-management need exists.

Possible measured indexes:

```sql
(dataset, indicator, subgroup_label, geography, observation_year)
(dataset, geography_type, parent_geography, indicator, observation_year, subgroup_label)
```

If the core platform later migrates databases, the analysis service and view models remain unchanged and adapter parity is mandatory.

### 8.6 Query limits

- Up to five states in a chart comparison.
- All 27 states allowed in table/ranking views.
- District comparison limited to one parent state.
- All districts of that parent may appear in a table.
- Years limited to loaded comparable rounds.
- Unknown dimensions/members rejected.
- SQL generated only from server-owned templates with bound values.
- Request/URL/result/export sizes bounded.

### 8.7 Caching and performance

Cache keys include:

- API contract version;
- data release;
- feature and measure;
- complete normalized context;
- derivation version;
- export format.

Do not cache an outage as a valid empty result.

Suggested provisional budgets, subject to production measurement:

- warm cached analysis API p95 under 300 ms;
- uncached database-backed p95 under 750 ms;
- committed update to visible result under one second when warm;
- no material Explore bundle increase from Analysis-only code;
- no unnecessary virtualization for 27-state views.

---

## 9. Safe derivations

Allowed only when all required inputs share compatible context:

- percentage-point difference;
- 2018→2022, 2022→2024, and 2018→2024 point change;
- distance from a named baseline;
- boys–girls descriptive difference for the same 2024 age band/category;
- state–India difference where the official India row exists;
- exact-to-cumulative ladder sum requiring all component rungs;
- median, quartiles, range, and IQR across an eligible peer set;
- coverage and missingness counts.

Every derivation must retain:

- all contributing observations;
- every source/page;
- derivation ID/version;
- formula in plain language;
- unrounded calculation values;
- direct/derived label;
- applicable caveats.

Prohibited:

- statistical significance/confidence claims;
- causal effects;
- composite state/district scores;
- reading-versus-arithmetic lead;
- unweighted national synthesis;
- interpolation or imputation;
- cross-population arithmetic;
- automatic policy recommendations.

---

## 10. Feature specifications and priority

### 10.1 Priority matrix

| Order | Capability | Availability | Effort | Product value | Release package |
|---:|---|---|---|---|---|
| 1 | Long-run school-type trends | Six rounds, 2012–2024 | S–M | Very high | R1 |
| 2 | Learning recovery | 2018/2022/2024 | S–M | Very high | R1 |
| 3 | Selected-place comparison | All rounds, varying coverage | M | Very high | R2 |
| 4 | Coverage/source lineage | All loaded rounds | M | High trust value | R2 |
| 5 | Enrolment/out-of-school | 2018/2022/2024; 2024 districts | M | Very high | R3 |
| 6 | Grades I–VIII heatmap | 2024 | M | High | R4 |
| 7 | District profile | 2024 | M–L | High | R4 |
| 8 | Age/sex schooling composition | 2024 | M | Medium-high | R5 |
| 9 | Early-childhood participation | 2022 | M | Medium-high | R5 |
| 10 | Complete state profile | Mixed | L | Very high after modules stabilize | R6 |

### 10.2 Long-run school-type trends

**Data:** Grades III/V/VIII reading/arithmetic; Govt, Pvt, weighted; 2012–2024; India/states.

**Primary view:** line chart with explicit gaps; table fallback.

**Allow:** same-indicator point change and descriptive Govt–Pvt gap.

**Require:** “Govt & Pvt weighted” explicitly excludes other school types.

**Prohibit:** school effectiveness, quality, causal or significance claims.

**Acceptance:** sparse values remain; every point has its own source; no school-type series is labelled all children.

### 10.3 Learning recovery

**Data:** all-children Grades III/V/VIII headlines, 2018/2022/2024.

**Primary view:** three-point slope/line and baseline table.

**Allow:** exact percentage-point differences and named baseline distance.

**Narrative:** “The 2024 published point estimate is X points above/below 2018.”

**Prohibit:** automatic “recovered” verdict, pandemic causation, same-cohort progress, significance.

### 10.4 Selected-place comparison

**Data:** identical state observations; 2024 sibling districts.

**Primary view:** dot plot or horizontal bars; maximum five plotted places; complete table where appropriate.

**Allow:** point difference, peer median/IQR, descriptive percentile.

**Require:** exact compatibility predicate; same parent for districts.

**Prohibit:** cross-state district league tables, winner language, mixed grades/populations/years/units.

### 10.5 Coverage and source-lineage explorer

**Data:** all loaded observations and metadata.

**Primary view:** table-first availability matrix and filtered source manifest.

**Distinguish:** loaded, published, absent, sparse, suppressed, incompatible, and unavailable.

**Prohibit:** treating coverage count as performance or representativeness.

**Acceptance:** every displayed observation resolves to its own source locator; district lineage parity passes.

### 10.6 Enrolment and out-of-school

**Data:**

- ages 6–14 in government schools, 2018/2022/2024;
- ages 15–16 not enrolled, 2018/2022/2024;
- 2024 districts: ages 6–14 government schools and not enrolled.

**Views:** trend, state comparison, district-within-state snapshot.

**Critical caveat:** government-school share is not total enrolment and its complement is not out-of-school.

**Prohibit:** connecting ages 15–16 state trend with ages 6–14 district measure; quality/impact inference.

### 10.7 Grades I–VIII learning heatmap

**Data:** 2024 state exact reading or arithmetic rungs, Grades I–VIII.

**Views:** value-labelled heatmap or 100% stacked bars plus complete table.

**Allow:** cumulative threshold only from a complete exact ladder.

**Require:** `Total` used for validation but excluded from skill cells.

**Prohibit:** national synthesis, reading/arithmetic shared scale, cohort progression, causal bottleneck.

### 10.8 District profile

**Data:** 2024 Grade III–V and VI–VIII reading/arithmetic plus ages 6–14 government-school enrolment/not enrolled.

**Views:** small group of existing-style cards and within-parent distributions; complete data table.

**Require:** each panel’s grade band/population visible; identical parent-state anchor.

**Prohibit:** composite score, cross-state league table, conversion to single grade, resource-targeting rule.

### 10.9 Age/sex schooling composition

**Data:** 2024 state-only Govt/Pvt/Other/Not-in-school for exact published populations.

**Views:** 100% stacked bar and composition table.

**Allow:** same-age-band boys–girls category difference; clearly labelled `100 – not in school`.

**Prohibit:** national aggregation, overlapping age-band arithmetic, causal/equity verdict, reconstructing unavailable sex rows.

### 10.10 Early-childhood participation

**Data:** 2022 states, exact ages 3–8; Anganwadi, Govt pre-primary, Pvt LKG/UKG, Govt/Pvt/other school, neither.

**Views:** age-by-category stacked bars or small multiples; table.

**Require:** single-round snapshot treatment and exact-age denominator.

**Prohibit:** trend/transition, national aggregation, programme quality/impact, synthetic public/private grouping without methodology approval.

### 10.11 Complete state profile

**Data:** released module view models; mixed years and populations.

**Views:** sectioned existing-style cards with a panel-level contents list, not one composite visualization.

**Require:** each panel independently displays year, population, construct, source, caveat, and availability.

**Prohibit:** global year substitution, overall score/rank/verdict, arithmetic across panels.

Build this last. It must compose stable view models rather than recalculate their values.

---

## 11. Result and interaction states

### Loading

- Remove or mask old-context results; never leave stale values visible under a new question.
- Use stable skeletons and `aria-busy="true"`.
- Disable share/export until the committed result is ready.
- Announce one concise update.

### Empty/unavailable

State the exact unsupported combination and valid alternatives:

> No published observations match Bihar, district level, 2018, Grade III–V reading. District data for this measure is available for 2024.

Offer explicit actions such as **Use 2024** or **Return to state level**. Do not perform them silently.

### Partial

- Preserve gaps.
- List unavailable places/years/categories.
- Carry incomplete status into table and export.

### Error

- Preserve the committed question.
- Show Retry.
- Do not display cached/national/previous-context values as the answer.
- Distinguish unpublished data from service failure.
- Show a non-sensitive reference ID when supported.

---

## 12. Sharing, exports, and external BI

### 12.1 Share

Provide:

- Copy reproducible link;
- Copy plain-language question;
- Copy citation.

Version the URL state. Reject stale or incompatible saved states explicitly after contract/data changes.

### 12.2 CSV

Include:

- data-release and contract version;
- normalized filters;
- measure and official indicator;
- population/denominator;
- year and geography grain;
- parent geography;
- direct/derived status and formula;
- value/unit;
- comparability and uncertainty availability;
- source URL/page for every contributor;
- missingness/suppression;
- generation time;
- filtering/ranking/truncation status.

### 12.3 PNG/report

Include:

- exact question;
- active filters;
- construct/population;
- years/geographies;
- contextual caveat;
- source summary;
- data release;
- visible subset/total if any values are omitted.

### 12.4 External Power BI/Tableau/R/Python

Expert users should receive a clean release/download/API path rather than a free-form builder in the public UI. Provide:

- stable indicator and geography IDs;
- data dictionary;
- population and denominator;
- geography grain;
- direct/derived status;
- comparability;
- missingness/suppression;
- per-row sources;
- responsible-use limitations;
- sample import instructions.

The downloaded dataset enables external BI, but detached metadata/caveats are mandatory.

---

## 13. Accessibility and responsive requirements

- Ordinary navigation links for page destinations.
- One descriptive `h1`; logical headings and landmarks.
- Skip links to controls and results.
- Native selects, radios, checkboxes; visible labels.
- `fieldset`/`legend` for grouped choices.
- Constraints linked through `aria-describedby`.
- Comparison selection searchable and capped at five.
- User-triggered Update may focus the result-summary heading after completion.
- One polite live-region completion announcement.
- Every chart has a concise accessible summary and complete table equivalent.
- Heatmap values available as text; colour never sole encoding.
- Minimum 44×44 CSS pixel touch targets for primary mobile controls.
- 200% zoom and 400% reflow without page-level two-dimensional scrolling.
- Labelled, keyboard-focusable table scroll containers where necessary.
- Reduced motion, high contrast, forced colours, light/dark preferences.
- VoiceOver/Safari, NVDA/Chrome and Firefox, TalkBack/Android Chrome.
- Mobile filter dialog manages focus and inert background correctly.
- Existing Explore obtains zero unexplained visual/semantic regressions.

---

## 14. Feature flags

```text
ANALYSIS_WORKSPACE
FEATURE_SCHOOL_TRENDS
FEATURE_RECOVERY
FEATURE_PLACE_COMPARE
FEATURE_COVERAGE
FEATURE_ENROLMENT
FEATURE_GRADE_HEATMAP
FEATURE_DISTRICT_PROFILE
FEATURE_SCHOOLING_COMPOSITION
FEATURE_EARLY_CHILDHOOD
FEATURE_STATE_PROFILE
```

Disabled feature behaviour:

- absent from available choices;
- typed unavailable response for an old URL;
- no effect on Explore;
- independently reversible;
- no silent fallback to another module.

No random A/B assignment for analytical outputs. The same URL/data release must produce the same result for every user.

---

## 15. Release packages

### R0 — Extension foundation

Deliver behind flags with no public feature:

- semantic registry;
- stable measure IDs;
- AnalysisContext and URL schema;
- compatibility engine;
- shared repository/query specification;
- lineage-preserving view models;
- feature flags;
- `/analysis` shell and approved visual baseline.

Gate:

- no unexplained Explore visual/semantic diff;
- no duplicated analytical logic;
- invalid combinations return typed explanations.

### R1 — Longitudinal analysis

Deliver:

- long-run school-type trends;
- learning recovery.

Gate:

- every point/source reconciles;
- sparse gaps remain;
- arithmetic-only recovery wording;
- URLs restore exactly.

### R2 — Comparison and evidence

Deliver:

- selected-place comparison;
- coverage/source-lineage explorer.

Gate:

- compatibility predicate enforced server-side;
- forged URLs cannot produce a valid-looking chart;
- every row has exact locator/status.

### R3 — Participation

Deliver:

- enrolment/out-of-school.

Gate:

- exact population/denominator crosswalk approved by ASER reviewer;
- state/national trend and 2024 district snapshot remain separate;
- no quality/impact inference.

### R4 — 2024 learning depth

Deliver:

- Grades I–VIII heatmap;
- district profile.

Gate:

- ladder recomposition passes;
- district parent/anchor/grade-band scope passes;
- no composite or targeting language.

### R5 — Cross-sectional access snapshots

Deliver:

- age/sex schooling composition;
- early-childhood participation.

Gate:

- compositions reconcile within rounding;
- 2024/2022 snapshot labels are unavoidable;
- no national synthesis or invalid demographic gap.

### R6 — State profile

Compose released modules.

Gate:

- every panel retains independent context/source;
- no global filter forces unavailable common years;
- no composite score, rank, or verdict.

---

## 16. Testing battery

### 16.1 Semantic and data tests

1. Registry covers every intended current indicator/subgroup exactly once.
2. Each enabled feature has valid and invalid fixtures.
3. Stable IDs map one-to-one to official indicator definitions.
4. Screen/table/API/export direct-versus-derived status agrees.
5. Reading and arithmetic exact distributions independently sum to Total within rounding.
6. Cumulative ladder requires every necessary rung.
7. Headline/cumulative reconciliation passes where constructs match.
8. Composition categories sum to Total; Total is not rendered as a segment.
9. Deltas/gaps use unrounded values.
10. Missing/suppressed remains absent.
11. District results never escape parent scope.
12. Sparse school-type series preserve one-sided published values.
13. No national result is synthesized from state rows.
14. Every derivation retains every contributing source.

### 16.2 ASER domain battery

1. School-type subgroup changes do not alter construct/population unexpectedly.
2. Weighted never appears as all children.
3. Every trend point retains its own source/page and comparability.
4. Recovery positive/negative/small/zero cases use neutral point-estimate language.
5. Every mismatched population/year/unit/grain/parent/construct/mode is rejected.
6. Reading and arithmetic remain separate scales.
7. Ages 6–14 government enrolment and ages 15–16 not enrolled never share a series.
8. Like-for-like boys–girls differences only.
9. Early-childhood has no trend or national affordance.
10. District peer sets contain siblings only and use exact grade-band anchors.
11. Coverage states produce distinct text/API status.
12. State-profile panels cannot silently alter one another.
13. Portable output retains rural scope, denominator, year, construct, caveat, and source.
14. Adversarial URLs never produce a compatible-looking fallback.
15. Language lint rejects effect, impact, significant, better school, unqualified grade-level, recovery verdict, leader/winner, or targeting recommendation.

### 16.3 API/export tests

- Golden contract for every feature.
- Exhaustive valid-combination enumeration from registry.
- Invalid-context and unavailable-state enumeration.
- Screen/table/API/CSV/PNG parity.
- Per-row/per-point lineage.
- Cache release/context collision tests.
- URL round-trip and backwards/forwards navigation.
- Size, selection, and rate bounds.

### 16.4 UX/persona tests

| Persona | Task | Success |
|---|---|---|
| Policy analyst | Compare 2018/2022/2024 Grade III reading | Identifies point change and uncertainty limitation |
| State officer | Build Bihar profile | Identifies year/population of every panel |
| District officer | Compare three sibling districts | Does not infer funding priority |
| Researcher | Find every year/source for one construct | Traces every point |
| Journalist | Share school-type trend | Link reproduces view and non-causal caveat |
| Early-childhood lead | Inspect participation by age | Understands 2022 cross-sectional snapshot |
| Beginner | Find one Grade V state result | Completes without More filters |
| Keyboard user | Configure, update, inspect table, export | No trap/lost focus/mouse requirement |
| Screen-reader user | Understand trend and caveat | Logical question→summary→table→source sequence |
| Mobile user | Compare two states at text scaling | No clipping or page overflow |
| Adversarial user | Request incompatible district/year | Typed explanation, no substitution |

Measure:

- task completion;
- incorrect analytical inference;
- time to first valid result;
- filter reversals;
- recognition of population/year/source;
- caveat comprehension;
- URL reproduction;
- keyboard/screen-reader completion.

The primary UX metric is correct interpretation, not number of clicks.

### 16.5 Platform/resilience tests

- Chrome, Firefox, Safari, Edge;
- iOS Safari and Android Chrome;
- 320/375/768/1024/large desktop widths;
- light/dark/high-contrast/reduced-motion/forced-colour modes;
- rapid updates and stale-response prevention;
- slow/timeout/outage/cache failure;
- partial/empty/malformed responses;
- feature-disable rollback;
- release mismatch;
- performance/load budgets.

---

## 17. Product metrics and gates

### Correctness/trust

- 100% supported combinations reconcile database→API→UI→table→export.
- 100% visible values retain exact provenance.
- Zero silent substitutions.
- Zero incompatible comparisons.
- Zero missing/suppressed-to-zero conversions.
- Zero unsupported causal/significance/winner narratives.

### Usability

- At least 90% unassisted completion for the canonical tasks in qualified testing.
- Median target: no more than 90 seconds for trend/compare/coverage and two minutes for profile.
- Users can identify population, round, geography grain, and source.
- No more than one primary chart and one table in the initial result.

### Non-clutter/design continuity

- Zero unexplained Explore visual diff.
- Only one new top-level destination.
- No Detailed Analysis cards load on Explore.
- First Detailed Analysis view shows four tasks, not all filters.
- No more than five essential controls visible initially.
- Existing design tokens and narrative grammar reused.
- Specialist components pass owner design review as recognizably the same product.

### Release gate

A module is ready only when:

- entry gate remains green;
- construct sheet approved;
- valid/invalid tuples tested;
- source fixtures pass;
- UI/API/table/export/share reconcile;
- responsive/browser/keyboard/AT tests pass;
- caveats remain adjacent and portable;
- feature-flag disable/rollback passes;
- product, QA, accessibility, data, and ASER-methodology reviewers sign off.

Skipped checks are blocked, not passed.

---

## 18. Rollout and rollback

Rollout:

1. Local flag off.
2. Protected Preview flag on.
3. Internal product/engineering/QA review.
4. ASER methodology and source review.
5. Accessibility/browser/mobile qualification.
6. Limited production enablement and monitored soak.
7. General module availability.
8. Begin next package only after the prior contract stabilizes.

Rollback:

- disable the affected feature flag;
- preserve Explore and existing APIs;
- use additive/reversible indexes/migrations;
- retain prior API contract during compatibility window;
- retain known-good application and data releases;
- version derivations;
- independently test application, schema/index, and data rollback;
- disable only the defective module rather than the entire explorer.

---

## 19. Product decisions

### Approved

- Constrained guided Detailed Analysis workspace.
- Existing Explore remains default.
- No Power BI-style free-form dashboard.
- No specialized reports or new data in this programme.
- Preserve existing look, feel, and narrative grammar.
- No composite state/district score or ranking.
- Comparison cap: maximum five plotted places; districts within one parent.

### To confirm before R0/R1

1. Final public label: recommended **Detailed analysis**.
2. Final route and versioned URL shape.
3. Whether current Explore questions offer “Open in Detailed analysis” at first launch or later.
4. Exact allowed equivalent chart choices per view model.
5. Export formats enabled per module.
6. Privacy-respecting operational telemetry, if any.
7. Named product, QA, accessibility, data, security, and ASER-methodology reviewers.

---

## 20. Implementation work breakdown

### WP0 — Characterize and protect

- Verify entry gate.
- Record data-release catalogue.
- Capture Explore visual/semantic baseline.
- Approve design/narrative invariants.
- Create source-backed construct sheets.

### WP1 — Semantic foundation

- Stable measure IDs.
- Feature/measure registry.
- AnalysisContext and URL schema.
- Compatibility lattice.
- Typed invalid/unavailable states.
- Feature flags.

### WP2 — Shared analytical services

- Shared repository/query specification.
- Pure derivations.
- Stable view models.
- Shared narrative/caveat templates.
- API/export parity.

### WP3 — Detailed Analysis shell

- `/analysis` navigation.
- Four-task chooser.
- Natural-language question.
- Progressive controls and More filters.
- Explicit Update/Reset.
- Context capsule.
- Loading/empty/partial/error states.
- Share/export shell.

### WP4 — R1 and R2

- School-type trends.
- Learning recovery.
- Selected-place comparison.
- Coverage/source-lineage.

### WP5 — R3 and R4

- Enrolment/out-of-school.
- Grades I–VIII heatmap.
- District profile.

### WP6 — R5 and R6

- Age/sex composition.
- Early-childhood snapshot.
- Complete state profile.

### WP7 — Qualification

- Complete semantic/domain/API/export battery.
- Persona and comprehension UAT.
- Visual continuity review.
- Browser/mobile/AT qualification.
- Performance/resilience/security.
- Release evidence, feature rollback, soak.

---

## 21. Definition of done

The extension programme is complete only when:

1. All ten modules are independently flaggable, source-linked, reproducible, and auditable.
2. The existing Explore experience remains visually, narratively, and behaviourally recognizable.
3. Detailed Analysis feels like the same product with deeper controls, not an embedded external dashboard.
4. All valid results are generated through one semantic/query/view-model contract.
5. Every invalid combination is blocked with a specific explanation.
6. Every result retains population, denominator, year, geography grain, construct, release, comparability, uncertainty status, caveat, and source.
7. No module creates causal, significant, winner, composite-score, or policy-targeting conclusions.
8. Every chart has a complete accessible table and contextual caveat.
9. Desktop, mobile, keyboard, screen-reader, zoom/reflow, and supported browsers pass.
10. URLs, tables, APIs, CSVs, PNGs, and citations reconcile.
11. Each module can be disabled without affecting Explore or unrelated modules.
12. The state profile is assembled only from released component view models and retains panel-specific context.
13. The public release uses the exact tested application and data release.

**Final roadmap principle:** expose more analytical depth, not more analytical freedom than the evidence can support.
