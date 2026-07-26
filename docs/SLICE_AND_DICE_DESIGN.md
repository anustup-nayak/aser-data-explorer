# Slice-and-dice experience design

## The rule

The explorer presents a question-shaped path, never the database's internal field names. A visitor first chooses the kind of decision they are making; subsequent controls reveal only concepts needed to answer it.

## User-facing views and paths

| Persona | Question | Path | Result |
|---|---|---|---|
| District or state official | Are children in Grade 3 meeting the expected reading level? | Learning outcomes → Std III reading → survey year → all children | State comparison, exact values, source pages, comparable trend when available. |
| Foundational-learning lead | What reading skills do children in a grade have? | Reading skills by grade → skill level → grade being compared | A 2024 cross-state distribution for that skill and grade. |
| Numeracy programme lead | How common is subtraction ability in Grade 3? | Arithmetic skills by grade → subtraction → Std III | A 2024 cross-state comparison with clear value/unit/source. |
| Education-finance / access analyst | What share of children attend government schools? | School participation & enrolment → government-school enrolment → survey year → available population | State comparison and source-linked export. |
| Journalist | What is the latest published value and where did it come from? | A common-path shortcut or any view → source table → report page / CSV | A reproducible value with its ASER report page. |

## Interaction logic

1. **What would you like to explore?** has only four plain-language views: Learning outcomes; Reading skills by grade; Arithmetic skills by grade; School participation & enrolment.
2. In the two grade-skill views, the next control is **Skill level**, followed by **Grade being compared**. The year is retained as a transparent survey-year field, but currently has only 2024 because the data has only that year.
3. In outcome and enrolment views, the next control is **Measure**, followed by survey year and population only when the data makes them relevant.
4. Common paths provide safe starting points for the most frequent beginner questions. They remain shortcuts, not hidden filters.
5. Every option is generated from the availability catalogue. A normal user can never choose a known-empty combination.

## Copy rules

- Never expose extraction phrases such as “children at … distribution by grade.”
- Use “Not yet reading letters,” “Letter recognition,” “Word reading,” and similar learner-facing labels where the source wording supports them.
- Use “Grade being compared,” not “subgroup,” in grade-distribution views.
- Explain that a grade-skill view is a cross-sectional comparison, not a trend of the same children.

## Acceptance checks

- A new user can complete each persona path without seeing a raw database label.
- Selecting Reading skills by grade makes it clear that the two choices are a reading skill and a grade, not two separate measures.
- Every shortcut resolves to a non-empty state comparison.
- The active question, rank chart, table, CSV and report links retain the same measure/year/population context.
