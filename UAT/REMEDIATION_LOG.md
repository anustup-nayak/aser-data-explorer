# Remediation log — persona-led UAT of 2026-07-26

Tracks each finding in `2026-07-26_08-33-33_IST_ASER_UAT_FINDINGS.md` against work done
in this cycle. Every `FIXED` row was reproduced before the change and re-verified after.

**Status of the application defect register: 17 of 17 addressed.**
Automated suite: **70 tests, 0 failures**. Standalone strict `tsc --noEmit` exits 0.

---

## P0 — release blockers

| ID | Verdict | Evidence |
|---|---|---|
| UAT-P0-001 District click crashes the app | **FIXED** | Reproduced: `Cannot read properties of undefined (reading 'val')`, 0 cards rendered. Cause: a fetched row set was not tied to the question that produced it, so a district question rendered against state rows and a non-null assertion threw. Every `Cut` now carries `cutKey(q)`; `page.tsx` hands a card only a result whose key matches, otherwise the card shows its loading state. Unsafe assertions removed from the selected-places lookup. Re-verified: click succeeds, URL/heading/ranking/hero/band all district-consistent, console clean. All 27 parents' first district checked; 0 failures. |
| UAT-P0-002 District lineage and CSV return zero rows | **FIXED** | Reproduced: Explorer 38 rows, Lineage 0, CSV header-only, for all 108 parent × indicator cuts. Cause: both routes combined `geography_type='district'` with `PUBLIC_SCOPE` (`state|national`) — an unsatisfiable predicate. Both now use `scopeFor(context)` with the bound parent, as Explorer does. Re-verified: **108/108 cuts agree at 2,343 rows**, matching the UAT's oracle exactly. |
| UAT-P0-003 Per-value provenance lost or wrong | **FIXED** | `Cut` collapsed rows to `{geo,val}` plus one page, so all 27 ranking rows cited p. 220 while Himachal is p. 124, Bihar p. 98, West Bengal p. 242. Trends kept one page across two report editions. Lineage is now per-row (`CutRow{page,src}`) and per-point (`TrendData.natSource/stSource`), carried into the on-screen tables, CSV and PNG. The anchor row cites the national/parent table, not a state page. A visual spanning several pages says so rather than naming one. Ranking, district and trend tables gained a Source column linking each row to its own page. |
| UAT-P0-004 Wrong geography/construct used or labelled | **FIXED** | `host` fell back to `rows[0].geo`, so a national question analysed the top-ranked state (the ladder read "Himachal Pradesh" with nothing selected) and a district's parent-state anchor was labelled "India (rural)". Geography is no longer inferred: `host` is empty unless a place is chosen; the ladder and the subject comparison decline and explain; the anchor label is taken from the data; held-constant copy uses `gradeLabel(q)` so districts read Std III–V; the add control says "Add a district" in district context. |

## P1 — public-release blockers

| ID | Verdict | Evidence |
|---|---|---|
| UAT-P1-005 Sparse state trends replaced by India | **FIXED** | A state publishing some rounds was dropped and India drawn under a caption still naming the state. Sparse states now keep their own line with gaps; the change is measured between first and last **published** points and names those years; a notice states how many rounds the state publishes. Verified on Sikkim: *"Yes — Sikkim is up 18.9 points between 2014 and 2024… Sikkim publishes 3 of these 6 rounds; the missing rounds are gaps in its line, not zeros."* |
| UAT-P1-006 Forged `parent` unvalidated | **FIXED** | `?geo=Aurangabad (Bihar)&parent=Kerala` now resolves the true parent from the district catalogue, repairs to Bihar, and discloses the adjustment. Verified. |
| UAT-P1-007 Comparison loading state not cleared | **FIXED** | A synchronous dimension now clears `loading` explicitly instead of inheriting it from an async one. |
| UAT-P1-008 District ranking rendered twice | **FIXED** | The drill-down band is hidden when the main ranking already lists districts. Verified: `.districts` count 0 on a district page. |
| UAT-P1-009 PNG exports truncate to 16 rows | **FIXED** | Bar cards draw every row and size the canvas to fit, so a 38-district image matches its own CSV. |
| UAT-P1-010 Small text fails WCAG AA | **FIXED** | Ink tokens re-derived and measured: light `--ink-3` 5.15:1, `--ink-2` 8.29:1, accent 4.63:1, focus 6.38:1; dark `--ink-3` 6.25:1, `--ink-2` 8.90:1. All ≥ 4.5:1. |
| UAT-P1-011 No security headers | **FIXED** | CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` and COOP are applied to every response at the worker, plus HSTS over TLS. Verified live on `/` and `/api/*`; asserted in the contract suite. The app renders with no CSP violation. |

## P2 / P3

| ID | Verdict | Evidence |
|---|---|---|
| UAT-P2-012 District terminology | **FIXED** | The live status names districts when districts are listed; the add control and chips use district nouns; the anchor label comes from the data. |
| UAT-P2-013 Heading and tab semantics | **FIXED** | The site title is now an `h1`. The incomplete ARIA tabs pattern was replaced with plain navigation buttons using `aria-current="page"`, rather than half-implementing `tabpanel`/`aria-controls`/roving focus. |
| UAT-P2-014 Mobile touch targets | **FIXED** | Under `(pointer: coarse)` ranked rows grow to a 40 px minimum and selects, segmented buttons and nav items gain padding; desktop density is unchanged. |
| UAT-P2-015 Standalone TypeScript check fails | **FIXED** | `@cloudflare/workers-types` added as a devDependency and referenced from `tsconfig`; `cloudflare:workers` declared in `worker/cloudflare.d.ts`. `npx tsc --noEmit --incremental false` now exits 0, so strict type-check is a usable release gate. |
| UAT-P2-016 Unbounded parameter length | **FIXED** | Free-text parameters are bounded at 120 characters across Explorer, Lineage, Export, Trends and Profile. A 500-character indicator returns a typed 400 instead of a ~10 KB echo. The honest distinction between malformed, valid-but-unpublished and unavailable is preserved. |
| UAT-P3-017 Comparison grammar | **FIXED** | "Private schools leads" replaced with a number-neutral construction ("X ahead by N points") that is correct for both singular places and plural school types, rather than guessing grammatical number from a label. |

---

## Regression cover added

The battery that let these ship asked only *"is anything fabricated?"*. It could not catch a
crash (no browser-level test), and asserted district parity for Explorer alone. Tests grew
**50 → 70**:

| Suite | Adds |
|---|---|
| `district-parity` (new, 4) | All 108 district cuts across Explorer, Lineage and CSV; no cross-parent leakage; per-row citations on all three surfaces; unparented and unknown-parent requests refused |
| `cut-identity` (new, 5) | Row-set identity properties: geography level and parent re-key; focusing a state does not (same rows); every row-selecting dimension re-keys; keys total and idempotent across the question space |
| `analysis-honesty` (new, 10) | Geography never inferred; cards never render another question's result; no non-null row lookups; no change claimed across a gap; multi-page visuals do not cite one page; exports never truncate; contradictory links repaired and disclosed; sync dimensions clear loading; no duplicated district ranking; grammar-safe comparison copy |
| `api-contract` (+1) | Baseline security headers on both HTML and API responses |

## Not addressed in this cycle — and why

These are outside application code and remain open in their own registers:

- **Platform and database (PLATFORM-P0-001, DB-P0-001, DEC-004/005).** The app binds Cloudflare
  D1; a Vercel target needs a database decision and a time-boxed spike, not a code change.
- **Rights and licensing (LEGAL-P0-001, DEC-001–003).** Gates a *public* repository and any data
  redistribution. No `LICENSE` file has been added because the decision is the owner's.
- **Real-browser, device and assistive-technology qualification.** Chromium-only evidence exists;
  Safari, Firefox, iOS, Android, VoiceOver/NVDA/TalkBack remain unrun.
- **Operational evidence.** Load, cache, outage, backup/restore, rollback and soak all require a
  deployed environment.

Per §20.9 of the UAT, the honest label for this build remains **development / test preview**, not
`production`. What changed is that no known P0 or P1 application defect is open.
