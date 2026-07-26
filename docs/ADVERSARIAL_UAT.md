# Adversarial UAT and design audit — v3

## Product benchmark

The release adopts four recurring public-data patterns: an OWID-style question-first chart and source context; UNESCO UIS-style indicator discovery, disaggregation and metadata; World Bank DataBank-style progressive filtering and multiple evidence views; and UNICEF-style topical explanation alongside downloadable data. The design deliberately does not copy their visual brands.

| Design principle | v3 implementation | Adversarial check |
|---|---|---|
| Start with a meaningful question | The current question is written above every result. | Change each filter and confirm the question, table, ranking, URL and CSV describe the same cut. |
| Prevent impossible selections | Year and population/subgroup are derived from the current measure's availability catalogue. | Exhaust every measure/year/subgroup combination from metadata; the normal UI must offer only combinations with state results. |
| Keep source and meaning adjacent | Report-page links, definitions, units and a guide appear beside the analysis. | Open every visible report link; verify the source page is shown in table and downloaded CSV. |
| Separate snapshot from trend | State ranking is a single-year comparison; trend needs two comparable observations. | Select a distribution or one-year measure and verify no trend chart appears. |
| Give beginners a safe path | Guide and About sections explain ASER, available scope, values and limits. | Complete a first comparison without knowing ASER jargon; check the user can identify measure, population, year, geography and source. |

Reference patterns were reviewed from Our World in Data, UNESCO UIS Data Browser, World Bank DataBank and UNICEF Data. Their public sites should be re-reviewed at each major design refresh.

## Personas and adversarial missions

| Persona | Goal | Failure the agent seeks |
|---|---|---|
| New policy analyst | Compare reading by state in latest available year. | Jargon, unclear denominator, hidden source, unexplained ranking. |
| State education officer | Open her state after a national comparison. | Lost filter context, a profile that does not match selected measure/population, inaccessible state control. |
| Researcher | Reproduce a result from a shared link and CSV. | URL does not restore state, CSV differs from table, source/page is missing. |
| Journalist | Interpret a trend responsibly. | Trend shown with one point, non-comparable or different subgroup, causal language. |
| Screen-reader / keyboard user | Complete each task without a mouse. | Missing labels, focus trap, colour-only meaning, unannounced async state. |
| Hostile tester | Paste malformed, stale and impossible parameters into a URL. | Silent fallback presented as requested data, stale results, enabled export with no data. |

## Required execution matrix

1. Fetch metadata and enumerate every advertised availability row. For each, request explorer results and CSV; assert non-empty state rows, matching values, units and source pages.
2. Enumerate the full indicator × year × subgroup universe. Confirm the UI advertises only the availability subset, while impossible direct URLs show a plain-language recovery notice and no stale result.
3. Run the six personas at desktop, tablet and 390px mobile widths. Check no horizontal overflow, all controls are reachable by keyboard, focus is visible and chart values remain available as a table.
4. Test empty, API-error and slow-network states. Export must not be actionable without results; the previous value must never be represented as the newly requested cut.
5. Test trends with zero, one and multiple points. Render only a two-or-more-point comparable series; retain the limitation text otherwise.
6. Inspect terminology: public UI must not describe this independent site as official, certified or approved. It must describe inclusion, source linkage and limitations precisely.

## Release evidence

Record the catalogue size, valid/invalid combination counts, API/CSV parity, source-link checks, keyboard pass, mobile pass, console errors and any exceptions. A release is blocked for a misleading result, missing lineage, invalid combination exposed by normal controls, inaccessible primary journey or official-status implication.
