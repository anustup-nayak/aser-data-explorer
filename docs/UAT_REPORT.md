# Industrial UAT report — ASER Data Explorer

**Scope:** data quality, analytical integrity, usability and accessibility, adversarial input.
**Standard applied:** a number quoted from this site must survive peer review — construct
integrity, provenance on every value, and honest gaps.
**Result:** 50 automated tests green; production build clean; 11 defects found and fixed, of which
1 was P0 and 6 were P1.

---

## 1. What changed in this cycle

| | Before | After |
|---|---|---|
| Survey rounds | 3 (2018, 2022, 2024) | **6** (2012, 2014, 2016, 2018, 2022, 2024) |
| Observations | 6,057 | **12,552** (9,033 state + national) |
| District observations | 0 | **3,519** across 583 districts, served with drill-down |
| Source documents | 1 | **29** (2 national reports + 27 district PDFs) |
| Automated tests | 4 | **50** |
| School-type series | national, 2024 only | **state + national, 2012–2024** |

## 2. Data extension and its validation

### Sources
| Source | Rows | Rounds | Tables used |
|---|---|---|---|
| ASER 2024 full report | 8,355 | 2014–2024 | Tables 5/6/8/9 (national p.66–67 + all state pages), Table 15 (p.69) |
| ASER 2018 full report | 570 | 2012–2018 | Tables 5/6/8/9 (state pages) — sole source of 2012 |
| 27 state district-estimate PDFs | 3,519 | 2024 | Performance-of-districts tables |

### Extraction method
Column centres are derived from complete rows across each report, then every cell is assigned by
**position**. This matters because ASER suppresses small-sample cells: a text-order parser shifts
the surviving values into the wrong columns, silently corrupting a table. Ambiguous cells are
dropped and logged, never guessed. Long district names that wrap across two lines are rejoined
before parsing.

### Validation performed (all passed)
1. **Against the existing database** — 12 of 12 pre-existing national school-type values matched
   newly parsed values exactly (tolerance 0.05).
2. **Cross-edition agreement** — 1,336 cells appear in both report editions; 1,311 (98.1%) agree
   exactly, and the maximum disagreement is **1.2 points**, consistent with ASER's own restatement
   rounding. The newer edition wins on conflict; the older fills gaps carrying its own citation.
3. **Construct coherence** — ladder rungs sum to 100% for every grade × state; cumulative rung
   sums reproduce ASER's published headline figures within 0.25 points; every weighted average
   lies between its government and private components.
4. **District anchors** — all 27 district tables carry a state total row; all 27 matched the
   independently-sourced state value.

### Coverage honesty
Sikkim's government-school reading series carries 3 rounds rather than 6; several small states
have suppressed cells. These are ASER's own suppressions and are preserved as gaps. The test
suite asserts a floor (≥3 rounds for every state, ≥5 for at least 24 states, 6 for national)
rather than pretending completeness.

## 3. Defects found and fixed

| # | Severity | Finding | Fix |
|---|---|---|---|
| 1 | **P0** | District names are not unique across India — Aurangabad, Bilaspur, Hamirpur, Balrampur, Pratapgarh and Raigarh each exist in two states, producing 6 pairs of colliding geography labels. Any query by district name would have silently merged two districts. | Geography labels are state-qualified (`Aurangabad (Bihar)`); `parent_geography` carries the state. Test asserts no duplicate measure × round × geography × subgroup. |
| 2 | **P1** | A state-total row (`Jammu & Kashmir`) leaked into the district layer because the table's total row uses a different alias than the PDF filename. | State-anchor matching normalizes aliases before comparison; all 27 anchors now match. Test asserts no district equals its own parent state. |
| 3 | **P1** | `/api/metadata` exposed district geographies inside the state catalogue, so a district could have entered a state ranking. | Districts are served only through an explicitly parented query (`parent=<state>`), are catalogued separately from comparable places, and an unparented district query is a typed 400. |
| 4 | **P1** | A hand-edited URL (`grade=99`) survived normalization, producing "Std undefined" in the rendered question and an empty result. | `normalize()` now validates every field against its own domain first and is proven total and idempotent by property tests over the full question space. |
| 5 | **P1** | Sentence controls had no accessible names; async updates were unannounced. | Every control carries an `aria-label`; a visually-hidden `role="status"` region announces loading, failure, empty and ready states with the current question. |
| 6 | P2 | The trend card returned `not_comparable` for a series that simply had one observation — a misleading explanation. | Availability codes now distinguish `single_observation`, `not_comparable`, `no_data`; the UI explains which applies. |
| 7 | P2 | Trend and comparison charts had no table fallback, so chart values were unavailable to screen readers. | Both now ship `View as table`; every chart on the page has a tabular equivalent. |
| 8 | P2 | Narrowing the trend to fewer rounds persisted after switching to a construct with more rounds, hiding newly available history. | Selection survives while the available set holds; a changed set falls back to showing every published round. |
| 10 | **P1** | A school-type comparison required *both* sides. Where ASER suppresses one — West Bengal publishes a government figure for 2024 but no private one — the card discarded the published value and claimed nothing was available. Real data was thrown away. | Comparisons now render whichever side is published and name the suppressed one. Refusal happens only when both are absent. Guarded by a data test (one-sided cells must exist and stay citable) and a composition test (the all-or-nothing pattern must not return). |
| 11 | **P1** | Any non-headline grade or rung left the trend card as a dead end: a correct explanation with no way forward, which reads as "trends are broken". | The card now offers one-click routes to the nearest cut that has a series — the headline measure for the nearest grade, and the government-school series that reaches 2012. |
| 9 | P2 | A shared link carrying only some parameters (e.g. `?geo=Bihar`) silently selected the bottom skill rung, because `Number(null)` is `0` and `0` is a valid rung. | URL restore now distinguishes an absent parameter from a zero value; a composition test guards the reading. |

### A gap the battery itself had
The first eight defects were found by tests that asked "is anything fabricated?". Neither the
suppression nor the dead-end defect was caught, because both are failures of the opposite kind:
the site was *too* willing to show nothing. Defects 10 and 11 came from user testing, and the
battery has been extended with the invariants that would have caught them — partial availability
must be rendered, and an unanswerable card must route the reader somewhere answerable.

Four further test findings were **false positives corrected in the tests, not the data**:
Sikkim's weighted government-and-private figure survives in rounds where both components are
suppressed (verified against the ASER 2018 PDF, which prints "Data insufficient" in those two
columns while publishing the combined value);
published zeros on ladder rungs (legitimate — e.g. no Std VIII child in Mizoram is below letter
level), multi-edition sourcing of a measure-year (legitimate and desirable), and a case-insensitive
pattern that flagged the district "Bengaluru Rural". Each test was rewritten to assert the correct
invariant.

## 4. Test suite (50 tests)

| Suite | Tests | What it guarantees |
|---|---:|---|
| `data-integrity` | 19 | Provenance on every row; ladders sum to 100%; cumulative sums reproduce published headlines; weighted averages bounded by components; no synthesised zeros; no duplicates; canonical geography labels; comparable rounds only; district constructs isolated; district values within state range |
| `api-contract` | 9 | Catalogue completeness and self-check counters; district non-exposure; typed 400s on nine malformed inputs; no silent defaults; lineage on every served row; CSV↔JSON parity; trend comparability gating; cacheable, cookie-free responses |
| `migration` | 4 | Full chain applies to a blank database; row counts and unique IDs; lineage completeness; parent-geography rules; 2012–2024 span with boundary-adjusted Telangana and Andhra Pradesh |
| `question-model` | 7 | Hostile input always normalizes to a published combination; phone rounds unreachable; construct collapse rules; normalizer idempotent across the full question space; value guards reject malformed rows |
| `composition` | 11 | No hardcoded observations in the UI; absent URL parameters keep defaults; partial data is rendered rather than discarded; an unavailable chart always offers a route forward; cards never fetch; honest-gap language present; About explains every assessment task; all routes public-scoped; migrations touch no private tables; responsive + dark mode + focus-visible |

## 5. Persona walkthroughs

| Persona | Journey | Result |
|---|---|---|
| New policy analyst | Compare Std III reading across states, latest round | Passes. No database vocabulary on screen; the question is written out above the answer; every value carries its report page. |
| State education officer | Open Bihar after a national comparison | Passes. Ranking stays visible with Bihar highlighted; headline shows *26.1%, ranked 12 of 27*; trend and comparison re-anchor to Bihar. |
| Researcher | Reproduce a result from a shared link and CSV | Passes. Full question serialized to the URL and restored; CSV matches the JSON rows exactly and carries question, construct, source URL and page. |
| Journalist | Interpret a trend responsibly | Passes. Trend requires two comparable rounds; phone rounds excluded and stated; cohort caveat printed beside the chart. |
| Screen-reader / keyboard user | Complete a comparison without a mouse | Passes after fixes 5 and 7. All controls labelled and reachable; async state announced; every chart has a table. |
| Hostile tester | `?year=1999&subject=Z&grade=99&school=Hogwarts&geo=Atlantis&level=77&mode=<script>` | Passes. Recovers to a published view, discloses that the link was adjusted, renders no `NaN`/`undefined`/`Infinity`, injects nothing. |
| District officer | Drill from Bihar into Aurangabad district | Passes. One geography control spans India → states → districts; the ranking compares the district's 37 peers and anchors to Bihar's own published 35.7%; grade-band construct is labelled and the ladder explains why it is not published per district. |

## 6. Analytical scrutiny — what a reviewer can check

- **Construct declaration.** `/api/metadata` returns an explicit construct dictionary (universe,
  denominator, indicator pattern, rounds) so a consumer cannot mix denominators unknowingly.
- **Self-check counters.** The same endpoint returns `integrity` counters — missing source URL,
  missing page, out-of-range value, missing unit, bad comparability — all of which must be `0`
  for a publishable release. A test asserts this.
- **Source manifest.** Per-document row counts, page ranges and rounds; the manifest is asserted
  to account for every published observation.
- **Per-indicator envelope.** Coverage, rounds, subgroups, comparability designations and
  observed value range for every indicator, so an out-of-range or thin series is visible without
  SQL access.

## 7. Residual risks and limitations

1. **Sampling uncertainty is not yet published per estimate.** ASER reports design-based
   estimates without per-cell confidence intervals in the tables used. The site states the
   approximate magnitude (±2–4 points at state level) but cannot attach an interval to each
   value. Small differences should not be read as real.
2. **District estimates carry wider uncertainty** and use grade-band constructs (Std III–V,
   Std VI–VIII) that are not interchangeable with the single-grade state series. The UI labels
   them as such and never mixes the two, but a reader comparing a district figure to a state
   figure must respect the different construct.
3. **No gender or urban/rural splits.** ASER publishes some; they are not in this extract. The
   comparison registry is ready for them.
4. **2012 depends on a single edition.** Those cells appear only in the ASER 2018 report and had
   no second source to cross-check against; they carry that report's citation.
5. **Cross-edition restatements.** Where both editions publish a cell, the newer wins. In 25 cells
   the two differ by ≤1.2 points; a researcher quoting the older edition may see a small
   difference.
6. **Comparability is asserted, not derived.** Every row carries an explicit designation from the
   source's own trend tables; the UI never infers comparability.

## 8. Release judgement

No P0 or P1 defect is open. All 50 tests pass, the production build is clean, and every displayed
observation resolves to a source document and page. **The site is releasable** at national, state
and district level.
