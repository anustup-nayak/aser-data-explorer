/**
 * Client-side data access.
 *
 * All fetching goes through here so the failure contract is uniform: a query
 * either returns published rows or throws. Nothing in this layer substitutes a
 * default, reuses a stale answer, or synthesises a value — a caller that gets
 * no rows must say so on screen.
 */
import {
  Meta, Row, TrendPoint, Question, Subject, SKILLS, ROMAN,
  HEADLINE_LEVEL, HEADLINE_INDICATOR, SCHOOL_TYPE_INDICATOR, DISTRICT_INDICATOR,
  distributionIndicator, bandForGrade, geoLevel, cutKey, validPercent, consistentUnit, qs, NATIONAL,
} from "./aser";

export async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url} → ${response.status}`);
  return response.json();
}

export const getMeta = () => getJson<Meta>("/api/metadata");

const explorer = (params: Record<string, string | number>) =>
  getJson<{ rows: Row[] }>(`/api/explorer?${qs(params)}`);

export const trendSeries = (geography: string, indicator: string, subgroup: string) =>
  getJson<{ rows: TrendPoint[]; availability: string }>(
    `/api/trends?${qs({ geography, indicator, subgroup })}`);

/** Districts ranked within their own state, anchored to the state's own value. */
const fetchDistrictCut = (q: Question) => fetchDistrictsOf(q.parent, q);

/**
 * Districts of one state, ranked, with the state's own value as the anchor.
 * Used by the drill-down band beneath the main answer. Districts are published
 * over grade bands, so this is a different construct from the state series and
 * is labelled as such wherever it is shown.
 */
export async function fetchDistrictsOf(state: string, q: Question): Promise<Cut | null> {
  const indicator = DISTRICT_INDICATOR[`${q.subject}|${bandForGrade(q.grade)}`];
  if (!indicator || !state) return null;
  const [districts, states] = await Promise.all([
    explorer({ year: 2024, indicator, geographyType: "district", subgroup: "All", parent: state }),
    explorer({ year: 2024, indicator, geographyType: "state", subgroup: "All" }),
  ]);
  if (!districts.rows.length || !consistentUnit(districts.rows)) return null;
  const anchor = districts.rows[0];
  const stateRow = states.rows.find(r => r.geography === state);
  return {
    key: cutKey(q),
    rows: districts.rows
      .filter(r => validPercent(r.numericValue))
      .map(r => ({ geo: r.geography, val: r.numericValue, page: r.pdfPageNumber, src: r.sourceUrl }))
      .sort((a, b) => b.val - a.val),
    nat: validPercent(stateRow?.numericValue) ? stateRow!.numericValue : null,
    natSource: stateRow ? { page: stateRow.pdfPageNumber, src: stateRow.sourceUrl } : null,
    page: anchor.pdfPageNumber,
    src: anchor.sourceUrl,
  };
}

/** The published series that answers a question directly, if one exists. */
export function directQuery(q: Question): { indicator: string; subgroup: string } | null {
  if (q.school !== "All")
    return { indicator: SCHOOL_TYPE_INDICATOR[`${q.subject}|${q.grade}`], subgroup: q.school };
  if (q.year !== 2024)
    return { indicator: HEADLINE_INDICATOR[`${q.subject}|${q.grade}`], subgroup: "All" };
  return null; // 2024 all-children: derived from the ladder, any grade and rung
}

/** A fetched row set, stamped with the question identity that produced it. */
export type Cut = {
  /** cutKey() of the question this answers — cards must check it before rendering. */
  key: string;
  rows: CutRow[];
  /** The parent reference value (India for states, the state for districts). */
  nat: number | null;
  /** Lineage of the parent reference value, when one exists. */
  natSource: { page: number; src: string } | null;
  page: number;
  src: string;
};

/** One ranked value, carrying its own citation rather than borrowing the cut's. */
export type CutRow = { geo: string; val: number; page: number; src: string };

/** Ranked state values plus the national figure, for the current question. */
export async function fetchCut(q: Question): Promise<Cut | null> {
  if (geoLevel(q) === "district") return fetchDistrictCut(q);
  const direct = directQuery(q);
  if (direct) {
    if (!direct.indicator) return null;
    const [state, national] = await Promise.all([
      explorer({ year: q.year, indicator: direct.indicator, geographyType: "state", subgroup: direct.subgroup }),
      explorer({ year: q.year, indicator: direct.indicator, geographyType: "national", subgroup: direct.subgroup }),
    ]);
    if (!consistentUnit(state.rows)) return null;
    const first = state.rows[0];
    const nationalRow = national.rows[0];
    return {
      key: cutKey(q),
      rows: state.rows
        .filter(r => validPercent(r.numericValue))
        .map(r => ({ geo: r.geography, val: r.numericValue, page: r.pdfPageNumber, src: r.sourceUrl }))
        .sort((a, b) => b.val - a.val),
      nat: validPercent(nationalRow?.numericValue) ? nationalRow.numericValue : null,
      natSource: nationalRow ? { page: nationalRow.pdfPageNumber, src: nationalRow.sourceUrl } : null,
      page: first?.pdfPageNumber ?? 0,
      src: first?.sourceUrl ?? "",
    };
  }
  return fetchDerivedCut(q);
}

/**
 * 2024 all-children values are the sum of ladder rungs at or above the chosen
 * level. A state contributes only when every rung it needs is published — a
 * partial sum would understate the share, so it is dropped instead.
 */
async function fetchDerivedCut(q: Question): Promise<Cut | null> {
  const levels = q.mode === "cum"
    ? SKILLS[q.subject].map((_, i) => i).filter(i => i >= q.level)
    : [q.level];
  const parts = await Promise.all(levels.map(level =>
    explorer({
      year: 2024, indicator: distributionIndicator(q.subject, level),
      geographyType: "state", subgroup: `Std ${ROMAN[q.grade]}`,
    })));
  if (parts.some(p => !p.rows.length || !consistentUnit(p.rows))) return null;

  // A derived value sums several rungs, which for a given state all come from
  // the same published table — so that state's own page is its citation, not
  // whichever row happened to be read last.
  const sums = new Map<string, number>();
  const lineage = new Map<string, { page: number; src: string }>();
  for (const part of parts) {
    for (const row of part.rows) {
      if (!validPercent(row.numericValue)) continue;
      sums.set(row.geography, (sums.get(row.geography) ?? 0) + row.numericValue);
      if (!lineage.has(row.geography))
        lineage.set(row.geography, { page: row.pdfPageNumber, src: row.sourceUrl });
    }
  }
  const complete = [...sums.entries()]
    .filter(([geo]) => parts.every(p => p.rows.some(r => r.geography === geo)));
  const first = complete[0] ? lineage.get(complete[0][0]) : undefined;
  const national = await nationalHeadline(q);

  return {
    key: cutKey(q),
    rows: complete
      .map(([geo, val]) => ({
        geo, val: Math.round(val * 10) / 10,
        page: lineage.get(geo)?.page ?? 0, src: lineage.get(geo)?.src ?? "",
      }))
      .sort((a, b) => b.val - a.val),
    nat: national?.value ?? null,
    natSource: national?.source ?? null,
    page: first?.page ?? 0, src: first?.src ?? "",
  };
}

/** A national figure exists only where ASER publishes one for this exact cut,
 *  and it carries its own page — the national table is not the state table. */
async function nationalHeadline(
  q: Question,
): Promise<{ value: number; source: { page: number; src: string } } | null> {
  if (q.mode !== "cum" || HEADLINE_LEVEL[q.subject][q.grade] !== q.level) return null;
  const indicator = HEADLINE_INDICATOR[`${q.subject}|${q.grade}`];
  if (!indicator) return null;
  const { rows } = await explorer({
    year: q.year, indicator, geographyType: "national", subgroup: "All",
  });
  const row = rows[0];
  return validPercent(row?.numericValue)
    ? { value: row.numericValue, source: { page: row.pdfPageNumber, src: row.sourceUrl } }
    : null;
}

/** The 2024 ladder for one grade: rung index → state rows. */
export async function fetchLadder(subject: Subject, grade: number): Promise<Map<number, Row[]>> {
  const parts = await Promise.all(SKILLS[subject].map((_, level) =>
    explorer({
      year: 2024, indicator: distributionIndicator(subject, level),
      geographyType: "state", subgroup: `Std ${ROMAN[grade]}`,
    })));
  return new Map(parts.map((part, level) => [level, part.rows]));
}

/** One value for one geography, used by the comparison card. */
export async function fetchValue(
  year: number, indicator: string, subgroup: string, geography: string, parent?: string,
): Promise<number | null> {
  if (!indicator) return null;
  const { rows } = await explorer({
    year, indicator, subgroup,
    geographyType: parent ? "district" : geography === NATIONAL ? "national" : "state",
    ...(parent ? { parent } : {}),
  });
  const value = rows.find(r => r.geography === geography)?.numericValue;
  return validPercent(value) ? value : null;
}
