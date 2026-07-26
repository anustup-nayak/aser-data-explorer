# ASER Data Explorer — UI redesign (v3 proposal)

Status: proposed. Interactive mockup: `aser-redesign-mockup.html` (built from the real
seed data in `drizzle/0000_public_observations.sql`). Supersedes the interaction model in
`SLICE_AND_DICE_DESIGN.md`; the honesty rules in `QUALITY_ASSURANCE_SPEC.md` still apply.

## 1. Why the current slice-and-dice fails users

The current UI (`app/page.tsx`) organises controls around the database's shape, not the
user's question:

1. **"View" categories leak the schema.** "Learning outcomes" vs "Reading skills by
   grade" is a distinction between two *storage domains* (headline indicators vs
   distribution tables), not two user intents. A user who wants "reading in Std III" must
   already know which of the two internal shapes contains their answer.
2. **The same concept appears as three different controls.** Grade is sometimes part of
   the indicator name ("% Std III children who can read…"), sometimes the *subgroup*
   dropdown ("Grade being compared"), and sometimes absent. Subject (reading vs
   arithmetic) is never a control at all — it is buried inside indicator strings.
3. **The measure dropdown mixes unrelated dimensions.** Skill level, grade, school type
   and population are all flattened into one long indicator list, so the four-way choice
   the user actually makes (year × grade × subject × skill) is impossible to see.
4. **No stable mental model.** Changing "view" silently changes what the other dropdowns
   mean ("Population/subgroup" becomes "Grade being compared"). Users can't build a habit.
5. **The headline and the distribution are never connected**, even though the headline
   numbers ("can read Std II text") are literally the top rung of the distribution ladder.

## 2. The data's true shape (audit of the 6,072-row seed)

| Block | Dimensions | Coverage |
|---|---|---|
| Headline learning outcomes | subject (R/A) × grade (III, V, VIII) × year (2018/22/24) × geography (27 states + India rural) | subgroup = All only |
| Skill-ladder distributions | subject × 5 skill levels × grade (I–VIII) × 27 states | 2024 only; "Total" rows are constant 100 (noise) |
| Govt/Pvt learning split | subject × grade (III, V) × {All, Govt, Pvt} | national only, 2024 only |
| Enrolment composition | category (Govt/Pvt/Other/Not in school) × age band × gender × 27 states | 2024 |
| Pre-school distribution | 8 categories × ages 3–8 × states | 2022 |
| Enrolment trends | 2 indicators × 2018/22/24 × 28 geographies | subgroup = All |

**Key insight:** the headline indicators are cumulative cuts of the skill ladder
("can read a Std II story" = top rung). One mental model — *the ladder* — unifies
both blocks, and the cumulative value for any grade/skill can be computed from the
2024 distributions (verified: computed Std III "at least subtraction" = 33.7%,
identical to the published national headline).

## 3. Use scenarios (design targets)

| # | Person | Question | Path in the redesign |
|---|---|---|---|
| S1 | Journalist on deadline | "Can Std III kids read? Which states lead in 2024?" | Land on default view — it *is* this question. 0 clicks. |
| S2 | State official | "Where does my state stand, and is it improving?" | Click the state in the ranking → hero, ladder and trend re-anchor to it. 1 click. |
| S3 | FLN programme lead | "Where exactly is the bottleneck in my state — letters, words, or fluency?" | Skill-ladder card shows the full 5-rung distribution for the focus state; switch rung in the sentence. |
| S4 | Researcher | "Govt vs private gap in learning, 2024?" | School type → "government schools": honest national comparison card, with a selection-bias caveat. |
| S5 | Education-access analyst | "What share of 15–16-year-old girls are out of school, and the trend?" | Enrolment tab → age 15–16 → Girls; trend card alongside. |
| S6 | Teacher-trainer | "By which grade can most children subtract?" | "Same question, every grade" curve answers it in one line chart. |
| S7 | Hostile/hurried user | Picks an unpublished combination | Impossible by construction: controls shrink to published combinations and explain *why* ("Why fewer choices?"). |

## 4. The redesign

### Information architecture

Three tabs mapped to intents, not tables:

1. **Learning levels** (default) — reading & arithmetic, the four user dimensions.
2. **School enrolment** — where children are enrolled (school type is the *measure*
   here, not a filter — mixing it into tab 1 is what made the old design incoherent).
3. **How to read this data** — the ladder explained, honesty rules, provenance.

### The question hierarchy (tab 1): one big question, two related questions

The page is organised as a hierarchy. The user actively builds only **the big
question**; two satellite question cards derive from it automatically, each varying
exactly one dimension. Data flows downward only — nothing in a satellite card ever
mutates the big question.

**Q1 — the big question** (sentence builder, includes an explicit where-slot):

> In **[2024 ▾]**, what share of **[Std III ▾]** children in **[all schools ▾]**
> **[across rural India ▾ | in Bihar ▾]** can **[read a Std II story ▾]**?

Two geography scopes:
- *Across rural India* (default) — comparison framing: hero = India (rural) figure
  (when published), ranking of 27 states, ladder with a local state picker.
- *In a specific state* — profile framing: hero = the state's value **plus a rank
  badge** ("Ranked 12 of 27 states") and the India/highest/lowest reference row;
  the ranking highlights the state; ladder and both satellite questions re-anchor
  to it. Clicking a ranking row and choosing the where-slot are the same action;
  a "← Back to all states" control restores scope A.

**Q2 — trend** ("Has this changed over time?", varies the *year*). Leads with a
computed verbal answer — "**Yes** — Bihar is up 2.6 points since 2018; India (rural)
is broadly unchanged." — then the 2018→2022→2024 chart (India dashed, state solid,
endpoint labels with collision avoidance). Only for comparable headline series;
otherwise the card stays and explains how to reach one.

**Q3 — the generic comparison engine** ("How does this compare — **[… ▾]**?").
A comparison is defined as *the big question re-evaluated along exactly one varied
dimension*. The engine is a dimension registry — each dimension declares its
availability rule, its items, its caveat, and which slots of the big question it
varies. The picker offers only dimensions the data can answer for the current Q1:

| Dimension | Renderer | Availability |
|---|---|---|
| across school types | bars (All/Govt/Pvt) | national, 2024, Std III & V headline |
| across grades Std I–VIII | line (ordered) | 2024 |
| between reading and arithmetic | paired bars, rung-matched | 2024 (same rung of each subject's ladder, labelled per subject) |
| between selected states | 2–4 state chips + bars, India reference | always; anchor state pinned in state-profile scope |
| for the same cohort, two years apart | two bars (e.g. Std III·2022 → Std V·2024) | only on the valid diagonals: (III,2022)↔(V,2024) and (V,2022)↔(VII,2024), cumulative threshold |

Generic parts shared by every dimension: a computed verbal answer
("Kerala leads by 19.8 points — 45.6% vs 25.8% for Gujarat"; ordered dimensions
say "rises from A% to B%"), a **"Holding constant: 2024 · Std III · all schools ·
can read a Std II story"** line naming what did *not* change, and a per-dimension
caveat (private-school selection bias; cross-section-not-cohort; rungs are
parallel positions, not equivalent skills; pseudo-cohort is not a measured panel).
Year and full-geography are deliberately excluded from the picker — Q2 and the
ranking already own those comparisons. When school type ≠ All, Q3 yields to the
main govt/pvt answer card. New dimensions (gender, urban/rural) become one
registry entry once their data is ingested.

plus a Reading/Arithmetic segmented switch and an *at least / exactly this level*
threshold toggle. The sentence **is** the state of the app: chart titles, CSV, and the
shareable URL all serialize it. Skill options are the 5 ladder rungs in plain language
(Not yet at letters / Letters / Words / Std I paragraph / Std II story; the arithmetic
equivalents), never the raw indicator strings.

### Availability rules (honest, self-explaining)

- Year 2018/2022 → grade collapses to III/V/VIII and skill locks to the published
  headline; an inline note explains: *"The 2018 survey publishes only the headline
  measure… full skill-by-skill detail is available for 2024."*
- School type Govt/Pvt → state ranking is replaced by a national All/Govt/Pvt
  comparison card (the only published cut), with a selection-bias caveat. Note explains
  why there is no state ranking.
- Level 0 ("not yet at letters") forces "exactly" — "or better" would be 100%.
- Missing is never rendered as zero; no control can reach an unpublished combination.

### Result panels (summary before detail)

1. **State comparison** — ranked bars, India (rural) as a pinned reference row, click
   to set the focus state. CSV download + report-page link per view.
2. **Headline card** — the single number for India (or the focus state when no national
   figure exists), with highest/lowest state for spread.
3. **Skill ladder** — 100%-stacked 5-rung bar for the focus state; the rungs counted by
   the current question are marked; legend carries exact values.
4. **Same question, every grade** — 8-point curve (Std I–VIII) for the current skill;
   turns any question into a trajectory.
5. **Change over time** — only for the comparable headline series (2018→2022→2024),
   India dashed vs focus state; cohort caveat and the 2020 gap noted.

Every card: source page link, "View as table" fallback, tooltips on hover.

### Visual system

- Paper `#F7F6F2` / ink `#1C2733`; dark theme via tokens (`prefers-color-scheme` +
  `data-theme` override). Serif (Charter/Georgia) for headings, system sans for UI,
  tabular numerals for data.
- Reading = blue sequential ramp `#C3D9F8→#123C78`; arithmetic = green-teal ramp
  `#C0EBDD→#0B5443` (monotonic lightness; 2px segment gaps, direct labels, legend and
  table as secondary encoding).
- Enrolment categorical (validated for CVD + contrast, light and dark):
  Govt `#2F6BC6`, Pvt `#B87514`, Other `#6E5FA8`, Not in school `#B3403F`.
- Marigold `#C77C1A` is the single UI accent: focus state, selected rung, active tab.
  Semantic colors are never reused as series colors.

## 5. Implementation notes (mapping to current code)

- `/api/metadata` already returns the availability catalogue; the client additionally
  needs the full distribution block per (subject, grade) — either widen `/api/explorer`
  to accept `indicators[]` or add `/api/distribution?subject=&grade=&year=`.
- Cumulative ("at least") values are computed client-side by summing rungs ≥ selected —
  no schema change. Where a published headline exists it takes precedence (values match).
- The four govt/pvt national indicators ("Std III: % children…") should be re-modelled as
  subgroup rows of the six canonical indicators during a future ingestion pass; until
  then map them in the API layer.
- Drop "Total … distribution by grade" rows from public responses (constant 100).
- URL state: serialize `?tab&year&subject&grade&school&skill&mode&focus`; on an invalid
  combination, open the nearest valid view with the existing recovery notice.
- Keep every QA-spec guarantee: typed 400s, no silent defaults, lineage on every row.
