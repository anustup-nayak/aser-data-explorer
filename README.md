# ASER Data Explorer

An independent, source-linked explorer for learning data from **ASER** (the Annual Status of
Education Report), the citizen-led household survey of children's schooling and foundational
reading and arithmetic across rural India, published by ASER Centre / Pratham.

Every number on screen traces to the exact page of the report it came from. Nothing is
interpolated, averaged, or filled in. This is not an official Pratham or ASER product.

> **Status:** production release candidate — national, state and district levels, six comparable
> survey rounds (2012–2024) for state/national measures and 2024 district estimates.

---

## Why this exists

Published ASER data is spread across long PDF reports. Getting from "how are Std III children in
Bihar doing at reading?" to a defensible, citable number normally means finding the right table
on the right page of the right edition. This site turns that into one sentence you edit, and
gives back the answer, the evidence, and the citation together.

The design constraint throughout: **a number quoted from this site must survive peer review.**
That means construct integrity over convenience, honest gaps over tidy charts, and provenance
attached to every value including its CSV and image exports.

## What it does

- **One question, three answers.** You build a sentence — round, grade, school type, geography,
  skill — and get a ranked comparison, a headline figure with its rank, and the full skill
  distribution behind it.
- **One geography hierarchy.** Rural India → states → a state's districts, in a single control.
  The ranking always compares siblings and anchors to the parent: states against India, districts
  against their own state.
- **Two derived questions.** A trend card (varies the survey round; you pick which rounds) and a
  comparison card (varies exactly one other dimension: school type, states, subject, or
  construct), each leading with a written answer before its chart.
- **Exports built for reuse.** Every chart downloads as a deck-ready PNG card and as CSV, both
  carrying the question, the construct, the source URL and the page.
- **Honest by construction.** Controls only ever offer published combinations; suppressed cells
  stay absent rather than becoming zero; a trend needs two comparable rounds or it explains why
  it is withheld; a shared link that cannot be honoured says what it changed.

## Quick start

```bash
npm install
npm run db:pg:migrate
npm run db:pg:seed
npm run db:pg:verify
npm run dev            # http://localhost:3000
```

Copy `.env.example` to `.env.local` first and provide a PostgreSQL connection string. Neon Free is
the production host; the schema and queries use standard PostgreSQL and remain portable. Migration
and seeding use the direct connection while the application uses the pooled `DATABASE_URL`.

```bash
npm test               # build + 71 tests (data, API, model, composition, parity, honesty)
npm run build          # production build
npm run lint
```

`npm test` runs everything; the API-contract suite skips itself automatically when no dev server
is reachable, so CI stays green without a database binding. Point it elsewhere with
`ASER_TEST_ORIGIN=https://… npm test`.

## Zero-cost production target

The owner-approved production target is a **₹0 launch** using a public GitHub repository,
Vercel Hobby, native Next.js and Neon Free PostgreSQL.

| Concern | Approved decision |
|---|---|
| Hosting | Vercel Hobby, while the project remains eligible under Vercel's personal/non-commercial terms |
| Production database | Neon Free PostgreSQL |
| Database portability | All application queries must sit behind a provider-neutral repository interface; Supabase Free is the documented fallback |
| Cost authority | No paid plan, add-on, marketplace purchase or usage-based billing may be enabled without explicit owner approval |
| Source documents | Link to official ASER sources; do not redistribute source PDFs without written permission |
| Software licence | MIT for original project code; this does not license ASER data, reports, names or marks |
| Analytics | Disabled until a separate privacy decision is approved |

Free infrastructure has material operational limits. It does not provide a production SLA or
guarantee uninterrupted service under heavy traffic. Neon Free currently has finite storage,
compute and transfer allowances and may introduce a short cold-start delay after inactivity.
Vercel Hobby also has eligibility and usage limits. Provider terms and quotas can change, so they
must be rechecked immediately before launch.

The production build must therefore:

- cache immutable public analytical responses and avoid unnecessary database work;
- use indexed, bounded, read-only queries and monitor provider quota consumption;
- fail safely and explain temporary unavailability rather than return partial or invented data;
- keep a versioned logical database export outside the provider;
- document and test blank-database migration, backup, restore and provider-switch procedures;
- reconcile restored data against the approved row counts, source lineage and release checksum;
- keep the portable PostgreSQL migration and verified logical source data as the provider-exit path;
- treat a free-tier limit as an availability limitation, never as permission to incur charges.

For the complete production gates, open issues and rollback policy, see
[the current production UAT and roadmap](UAT/2026-07-26_13-25-47_IST_ASER_UAT_FINDINGS.md).

## The data

| | |
|---|---|
| Observations | 12,552 — 9,033 state + national, 3,519 district |
| Districts | 588 across 27 states (2024) |
| Survey rounds | 2012, 2014, 2016, 2018, 2022, 2024 |
| Geographies | 27 states + India (rural) |
| Sources | ASER 2024 full report; ASER 2018 full report; 27 state district-estimate PDFs |

### The three constructs — never mixed

Mixing these is the most common way to misread ASER, so the schema, the API and the UI keep them
apart, and the About page names them for readers.

1. **All-children measures** — every surveyed child in the grade, whatever school they attend.
   Rounds 2018 / 2022 / 2024, plus full rung-by-rung skill ladders for 2024.
2. **School-type series** — government and private school children reported separately, plus
   ASER's *"Govt & Pvt (weighted)"* average of those two groups **only** (it excludes other
   school types, so it is not the all-children figure). Std III, V, VIII back to 2012.
3. **District grade-band estimates** — 2024 only, reported over Std III–V and Std VI–VIII bands
   with wider uncertainty. Served only through an explicitly parented query, so a district can
   never appear inside a state ranking.

### How the data was extracted and validated

Extraction is positional, not regex-on-text: column centres are derived from complete rows across
each report, then every cell is assigned by position, so a suppressed value leaves a gap instead
of shifting its neighbours into the wrong column. Anything ambiguous is dropped and logged rather
than guessed.

Four independent checks had to pass before the data was accepted:

- **Against the existing database** — all 12 pre-existing national school-type values matched the
  newly parsed values exactly.
- **Between report editions** — 1,336 cells appear in both the 2018 and 2024 reports; 98.1% agree
  exactly and no disagreement exceeds 1.2 points (ASER's own restatement rounding). The newer
  edition wins on conflict; the older one fills gaps and keeps its own citation.
- **Internal coherence** — ladder rungs sum to 100% for every grade × state; cumulative sums
  reproduce ASER's published headline figures; every weighted average lies between its components.
- **District anchors** — each of the 27 district tables carries a state total row, and all 27
  matched the independently-sourced state value.

Full findings, including the defects the UAT caught and how each was fixed, are in
[docs/UAT_REPORT.md](docs/UAT_REPORT.md).

## Architecture

```
app/
  page.tsx              question state, data orchestration, layout
  about.tsx             what ASER measures, the assessment tasks, how to cite
  components/
    shared.tsx          selects, source line, bars, the question/construct sentences
    cards.tsx           ranking · headline · skill ladder
    related.tsx         trend card + the comparison engine (dimension registry)
  lib/
    aser.ts             the ASER question grammar and the normalizer
    datasets.ts         dataset registry — the extension point for new sources
    api.ts              all client fetching; throws rather than defaulting
    downloads.ts        CSV + canvas-drawn PNG image cards
  api/                  six read-only routes through the observation repository
db/observations.ts      provider-neutral port + PostgreSQL implementation
db/postgres.sql         production schema with integrity constraints and indexes
drizzle/                reviewed source-data migration chain (0000 → 0003)
scripts/postgres.mjs    migrate · seed · verify with atomic staging promotion
tests/                  data integrity · API contract · question model · composition
                        district parity · cut identity · analytical honesty
```

Two rules keep this navigable. **Data flows downward:** cards receive what they render and never
fetch or mutate the question. **The normalizer is the only gate:** every question — including one
reconstructed from a hand-edited URL — passes through `normalize()`, which is total, idempotent,
and can only produce a published combination.

## Extending it

The schema is source-agnostic: `public_observations.dataset` namespaces every row. Adding
**PARAKH/NAS** assessment data or cross-linking **UDISE+** school records needs no change to any
existing row, query, or route.

1. **Register the dataset** in `app/lib/datasets.ts` — publisher, collection method, universe,
   geography levels, comparable rounds, excluded rounds and why, citation.
2. **Write a migration** inserting rows with your slug. Every row needs a source URL, a page or
   record locator, a unit, and an explicit comparability designation. Namespace indicator names by
   construct so they can never collide with ASER's.
3. **Add a question grammar module** beside `aser.ts` if the new source has its own controls;
   reuse `api.ts`, the cards and the download layer as they are.
4. **Add a comparison dimension** — one entry in the `DIMENSIONS` registry in
   `components/related.tsx` (`available`, optional `load`, `render`) is enough to add
   cross-dataset comparison, gender, or urban/rural once that data exists.
5. **Extend the tests** — the integrity suite is written as invariants, not fixtures, so most of
   it applies to a new dataset unchanged.

The geography hierarchy generalises: rows carry `parent_geography`, labels are state-qualified
(`Aurangabad (Bihar)`) because district names repeat across states, and the ranking always
compares siblings anchored to the parent. A further level (blocks, schools) would follow the same
shape.

## Interpreting the data responsibly

- Estimates carry sampling uncertainty — roughly ±2–4 points for state figures, more for
  districts. Treat small differences and single-round movements with caution.
- A trend compares *different cohorts* of children in each round, not the progress of the same
  children.
- The government/private gap partly reflects **who** attends private schools, not only school
  quality.
- 2020–21 rounds were phone-based and are excluded from every trend as not comparable.
- Boundary-adjusted series are used for Telangana and Andhra Pradesh (post-2014 boundaries).

## Licence and citation

Code: see `LICENSE`. Data: reproduced from published ASER reports for reference and analysis —
cite the reports, which remain authoritative. The MIT licence covers original project code only;
it does not grant rights to ASER/Pratham names, marks, reports, or underlying data.

> ASER Centre (2025). *Annual Status of Education Report (Rural) 2024.* New Delhi: ASER Centre /
> Pratham. https://asercentre.org/

## Contributing

Issues and pull requests are welcome. Two expectations: any change touching data must keep
`npm test` green (the integrity suite is the contract), and any new number shown on screen must
carry its source document and page.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the release checks and [SECURITY.md](SECURITY.md) for
responsible vulnerability reporting.
