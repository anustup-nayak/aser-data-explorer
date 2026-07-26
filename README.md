# ASER Data Explorer

[![Release gates](https://github.com/anustup-nayak/aser-data-explorer/actions/workflows/ci.yml/badge.svg)](https://github.com/anustup-nayak/aser-data-explorer/actions/workflows/ci.yml)
[![Live site](https://img.shields.io/badge/live-Vercel-000000?logo=vercel)](https://aser-data-explorer.vercel.app)
[![MIT licence](https://img.shields.io/github/license/anustup-nayak/aser-data-explorer)](LICENSE)

An independent, source-linked explorer for learning data from **ASER** (the Annual Status of
Education Report), the citizen-led household survey of children's schooling and foundational
reading and arithmetic across rural India, published by ASER Centre / Pratham.

Every number on screen traces to the exact page of the report it came from. Nothing is
interpolated, averaged, or filled in. This is not an official Pratham or ASER product.

**Live site:** [aser-data-explorer.vercel.app](https://aser-data-explorer.vercel.app)

> **Status:** public production release — national, state and district levels, six comparable
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

## Use it four ways

1. **Explore without installing anything:** open the [live data explorer](https://aser-data-explorer.vercel.app),
   build a question, and share its URL or export a source-linked CSV/PNG.
2. **Query the public API:** start with the [metadata catalogue](https://aser-data-explorer.vercel.app/api/metadata),
   then request a published cut:

   ```bash
   curl -G https://aser-data-explorer.vercel.app/api/explorer \
     --data-urlencode "year=2024" \
     --data-urlencode "indicator=% Std III children who can read Std II level text" \
     --data-urlencode "geographyType=state" \
     --data-urlencode "subgroup=All"
   ```

3. **Run or adapt it locally:** clone the repository and follow Quick start. Standard PostgreSQL,
   provider-neutral queries, and reviewed migrations keep it portable.
4. **Extend or audit it:** use the dataset registry and invariant-based production battery to add
   another source, reproduce a number, or review every lineage and comparability rule.

## What it does

- **One question, three answers.** You build a sentence — round, grade, school type, geography,
  skill — and get a ranked comparison, a headline figure with its rank, and the full skill
  distribution behind it.
- **The longest series first.** Government schools are the default population so all six
  comparable survey rounds are immediately available; all-school and private-school views remain
  one selection away.
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

## Two-minute user tutorial

Start with the highlighted question at the top of the site and work from left to right. Government
schools are selected initially because that construct has the longest comparable series. Every
dropdown change updates the full page and the shareable URL; choices that were not published are
not offered.

| View or control | How to generate it | How to read it |
|---|---|---|
| Survey round, grade/band, school type, geography, skill | Choose each phrase in the question sentence. Select a state to reveal its 2024 districts. | These choices define the population and construct; changing one can legitimately change the available choices. |
| Reading / Arithmetic and threshold | Use the subject buttons, then choose “at least this level” or “exactly this level”. | “At least” is cumulative from the chosen rung upward; “exactly” is one exclusive rung. |
| State/district ranking | Generated automatically for the current question; click a bar row to focus a place. | Bars are ordered highest to lowest among comparable siblings. Rank is descriptive, not causal. |
| Headline strip | Focus a place, or leave geography at rural India. | The requested value and rank sit beside the India/state anchor and highest/lowest peers. |
| Trend line | Use a construct with at least two comparable rounds; toggle the year buttons. | Every dot prints its value. The line compares different cohorts, not the same children over time; gaps remain gaps. |
| Comparison bars | Use the comparison dropdown; add/remove places when that option appears. | Only the named dimension varies. Confirm the “Holding constant” line before interpreting a gap. |
| Skill ladder | Choose **2024 → all schools → a state**. | Exclusive rungs partition 100% of children; highlighted rungs are included in the headline measure. |
| District cards | Choose a state, then a district or district row. | These are 2024 grade-band estimates with wider uncertainty, not single-grade state estimates. |
| Table, source and downloads | Open “View as table”, follow the report-page link, or select CSV/PNG. | The table and CSV carry exact values and lineage; PNG is presentation-ready. Copy the browser URL to share the view. |

## Quick start

```bash
git clone https://github.com/anustup-nayak/aser-data-explorer.git
cd aser-data-explorer
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
npm test               # build + 73 tests (data, API, model, composition, parity, honesty)
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
| Analytics | Cookieless Vercel Web Analytics, with no custom events |

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

The same build, type, lint, dependency-audit and test gates run on every push and pull request in
[GitHub Actions](https://github.com/anustup-nayak/aser-data-explorer/actions).

## Search and answer-engine discoverability

The production build exposes a canonical URL, descriptive title/summary, Open Graph and Twitter
cards, a generated social preview, `robots.txt`, `sitemap.xml`, and Schema.org `WebSite`,
`WebApplication`, and `Dataset` JSON-LD. Search crawlers can index the explanatory page while
parameterized API routes are kept out of the search index.

[`llms.txt`](https://aser-data-explorer.vercel.app/llms.txt) gives answer engines a compact,
source-linked description of coverage, interpretation rules, official reports, APIs, repository,
and feedback routes. `OAI-SearchBot`, ChatGPT user retrieval, Googlebot, Bingbot, and GPTBot are
allowed to crawl the public site. These controls make the site technically discoverable; they do
not guarantee ranking or citation, which also depend on indexing time, external links, relevance,
and each search provider’s systems.

## The data

| | |
|---|---|
| Observations | 12,552 — 9,033 state + national, 3,519 district |
| Districts | 588 across 27 states (2024) |
| Survey rounds | 2012, 2014, 2016, 2018, 2022, 2024 |
| Geographies | 27 states + India (rural) |
| Sources used for cells | ASER 2024 full report; ASER 2018 full report; 27 state district-estimate PDFs |

### Official full reports by survey year

The survey year and the source edition for a database cell are not always the same: later ASER
reports republish earlier rounds in retrospective trend tables. The site keeps the exact source
edition and page on every value. These links provide the official full report and official archive
page for every survey round represented:

| Survey year | Full report PDF | Official year page | Source lineage in this explorer |
|---|---|---|---|
| 2012 | [ASER 2012 full report](https://img.asercentre.org/docs/Publications/ASER%20Reports/ASER_2012/fullaser2012report.pdf) | [ASER 2012 archive](https://asercentre.org/aser-2012/) | Cells are read from ASER 2018 retrospective tables. |
| 2014 | [ASER 2014 full report](https://img.asercentre.org/docs/Publications/ASER%20Reports/ASER%202014/fullaser2014mainreport_1.pdf) | [ASER 2014 archive](https://asercentre.org/aser-2014/) | Cells are read from cited ASER 2018 or 2024 retrospective tables. |
| 2016 | [ASER 2016 full report](https://img.asercentre.org/docs/Publications/ASER%20Reports/ASER%202016/aser_2016.pdf) | [ASER 2016 archive](https://asercentre.org/aser-2016/) | Cells are read from cited ASER 2018 or 2024 retrospective tables. |
| 2018 | [ASER 2018 full report](https://asercentre.org/wp-content/uploads/2022/12/ASER-report_2018-1.pdf) | [ASER 2018 archive](https://asercentre.org/aser-2018/) | Cells retain the exact ASER 2018 or 2024 table and page used. |
| 2022 | [ASER 2022 full report](https://asercentre.org/wp-content/uploads/2022/12/ASER-report_2022-1.pdf) | [ASER 2022 archive](https://asercentre.org/aser-2022/) | Cells are read from ASER 2024 retrospective tables. |
| 2024 | [ASER 2024 full report](https://asercentre.org/wp-content/uploads/2022/12/ASER_2024_Final-Report_13_2_24-1.pdf) | [ASER 2024 archive](https://asercentre.org/aser-2024/) | State/national cells use the full report; every district row links its state estimates PDF. |

The reports remain ASER Centre/Pratham publications. They are linked, not redistributed in this
repository.

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
tests/production.test.mjs
                        complete data · API · model · parity · accessibility guard battery
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

GitHub also exposes the repository’s machine-readable [`CITATION.cff`](CITATION.cff). Cite the
software when reusing the code or interface, and cite the exact original ASER report page carried
by each observation when using the data.

## Feedback, contact, and privacy

Use the feedback form under **About the data**, or open the repository's
[feedback form](https://github.com/anustup-nayak/aser-data-explorer/issues/new?template=feedback.yml).
People without a GitHub account can email
[anustup.nayak@gmail.com](mailto:anustup.nayak@gmail.com). GitHub issues are public, so never
include personal, confidential, or sensitive information.

The site uses cookieless Vercel Web Analytics for aggregate page-view, referrer, country,
operating-system, device, and browser statistics. It does not send custom events. See
[Vercel's privacy documentation](https://vercel.com/docs/analytics/privacy-policy).

## Contributing

Issues and pull requests are welcome. Two expectations: any change touching data must keep
`npm test` green (the integrity suite is the contract), and any new number shown on screen must
carry its source document and page.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the release checks and [SECURITY.md](SECURITY.md) for
responsible vulnerability reporting.
