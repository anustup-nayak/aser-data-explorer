/**
 * ASER data model: classifies raw indicators into UI roles and encodes the
 * question grammar (subjects, grades, skills, school types, geographies).
 *
 * Constructs — never conflated anywhere in the UI:
 *  A. All-children measures (headline + skill-ladder distributions), subgroup
 *     grammar carries population/grade. State+national, 2018/2022/2024.
 *  B. School-type series ("Std III: …" etc.): Govt / Pvt / "Govt & Pvt
 *     (weighted)" — ASER's weighted average over children in government and
 *     private schools ONLY. State+national, 2012–2024.
 *  C. District grade-band measures ("Std III-V: …"): 2024 district estimates.
 *     Not exposed by the state-level UI.
 */

export type Indicator = { indicator: string; domain: string; unit: string };
export type Availability = { indicator: string; domain: string; year: number; subgroup: string };
export type Meta = {
  indicators: Indicator[];
  geographies: { geography: string; geographyType: string }[];
  districts: { geography: string; parentGeography: string; observations: number }[];
  availability: Availability[];
  coverage: { observations: number; years: number; geographies: number; indicators: number } | null;
};
export type Row = {
  geography: string; numericValue: number; unit: string; pdfPageNumber: number;
  sourceUrl: string; domain: string; indicator: string; subgroupLabel: string; comparability: string;
};
export type TrendPoint = {
  observationYear: number; numericValue: number; unit: string; pdfPageNumber: number;
  sourceUrl: string; comparability: string;
};

export type Subject = "R" | "A";
export type SchoolType = "All" | "Govt" | "Pvt";

/** Reading and arithmetic ladders, lowest rung first (ASER tool order). */
export const SKILLS: Record<Subject, string[]> = {
  R: ["Not yet at letters", "Letters", "Words", "Std I paragraph", "Std II story"],
  A: ["Not yet at 1–9", "Numbers 1–9", "Numbers 11–99", "Subtraction", "Division"],
};
export const PHRASE_CUM: Record<Subject, (string | null)[]> = {
  R: [null, "can read letters or more", "can read words or more", "can read a Std I paragraph or more", "can read a Std II story"],
  A: [null, "can recognise numbers 1–9 or more", "can recognise 11–99 or more", "can do subtraction or more", "can do division"],
};
export const PHRASE_EX: Record<Subject, string[]> = {
  R: ["cannot yet read letters", "can read letters, but not words", "can read words, but not a paragraph", "can read a Std I paragraph, but not a story", "can read a Std II story"],
  A: ["cannot yet recognise numbers 1–9", "can recognise 1–9, but not 11–99", "can recognise 11–99, but cannot subtract", "can subtract, but not divide", "can do division"],
};
export const GRADES = [1, 2, 3, 4, 5, 6, 7, 8];
export const ROMAN: Record<number, string> = { 1: "I", 2: "II", 3: "III", 4: "IV", 5: "V", 6: "VI", 7: "VII", 8: "VIII" };

/** Ladder rung of each headline / school-type series. Arithmetic Std III is
 * "at least subtraction" (rung 3); the others are the top rung. */
export const HEADLINE_LEVEL: Record<Subject, Record<number, number>> = {
  R: { 3: 4, 5: 4, 8: 4 },
  A: { 3: 3, 5: 4, 8: 4 },
};

/** Construct-B indicator names (school-type series), by subject+grade. */
export const SCHOOL_TYPE_INDICATOR: Record<string, string> = {
  "R|3": "Std III: % children reading at Std II level",
  "R|5": "Std V: % children reading at Std II level",
  "R|8": "Std VIII: % children reading at Std II level",
  "A|3": "Std III: % children who can do at least subtraction",
  "A|5": "Std V: % children who can do division",
  "A|8": "Std VIII: % children who can do division",
};
export const WEIGHTED_LABEL = "Govt & Pvt (weighted)";

/** Construct-A headline indicator names (all children), by subject+grade. */
export const HEADLINE_INDICATOR: Record<string, string> = {
  "R|3": "% Std III children who can read Std II level text",
  "R|5": "% Std V children who can read Std II level text",
  "R|8": "% Std VIII children who can read Std II level text",
  "A|3": "% Std III children who can do at least subtraction",
  "A|5": "% Std V children who can do division",
  "A|8": "% Std VIII children who can do division",
};

/** Distribution ("skill ladder") indicator name for a subject+rung. */
export function distributionIndicator(subject: Subject, level: number): string {
  const names = subject === "R"
    ? ["Not even letter", "Letter", "Word", "Std I level text", "Std II level text"]
    : ["Not even 1-9", "Recognise 1-9", "Recognise 11-99", "Subtract", "Divide"];
  const noun = subject === "R" ? "reading" : "arithmetic";
  return `% children at ${names[level]} ${noun} distribution by grade`;
}

/** Indicators that must never appear in the user-facing measure list. */
export function isInternalIndicator(name: string): boolean {
  return /^Std (III|V|VIII):/.test(name)            // construct B (school-type series)
    || /^Std (III-V|VI-VIII):/.test(name)           // construct C (district bands)
    || name === "% Children (aged 6-14) not enrolled in school"; // district-only companion
}

export const NATIONAL = "India (rural)";

/**
 * District construct (2024 only): ASER reports districts over grade bands
 * rather than single grades, so a district question uses its own indicator set
 * and its own two-band grade slot. Districts are always compared with the other
 * districts of their own state.
 */
export const BANDS = ["III-V", "VI-VIII"] as const;
export type Band = (typeof BANDS)[number];
export const BAND_LABEL: Record<Band, string> = {
  "III-V": "Std III–V",
  "VI-VIII": "Std VI–VIII",
};
export const DISTRICT_INDICATOR: Record<string, string> = {
  "R|III-V": "Std III-V: % children who can read Std II level text",
  "A|III-V": "Std III-V: % children who can do at least subtraction",
  "R|VI-VIII": "Std VI-VIII: % children who can read Std II level text",
  "A|VI-VIII": "Std VI-VIII: % children who can do division",
};
export const DISTRICT_PHRASE: Record<string, string> = {
  "R|III-V": "can read a Std II story",
  "A|III-V": "can do at least subtraction",
  "R|VI-VIII": "can read a Std II story",
  "A|VI-VIII": "can do division",
};
/** Grade band the district layer reports for a single grade. */
export const bandForGrade = (grade: number): Band => (grade <= 5 ? "III-V" : "VI-VIII");

/** The complete question state. Serialized 1:1 into the URL for reproducibility. */
export type Question = {
  year: number;
  subject: Subject;
  grade: number;
  school: SchoolType;
  /** "ALL" (rural India), a state name, or a state-qualified district name. */
  geo: string;
  /** Parent state when `geo` is a district; empty otherwise. */
  parent: string;
  level: number;        // ladder rung 0-4
  mode: "cum" | "ex";   // at-least vs exactly
};

/** Which level of the geography hierarchy the question is asking about. */
export const geoLevel = (q: Question): "national" | "state" | "district" =>
  q.geo === "ALL" ? "national" : q.parent ? "district" : "state";

/**
 * Identity of the row set a question produces. Two questions share a key only
 * when the same rows answer both — so `geo` itself is absent (focusing a state
 * re-reads the same ranking) but the geography *level* and parent are present,
 * because those change which places are being compared.
 *
 * Every fetched result carries its key, and a card is only ever handed a result
 * whose key matches the current question. That is what stops a card rendering
 * state rows against a district question.
 */
export const cutKey = (q: Question): string =>
  [
    q.year, q.subject, q.grade, q.school, q.level, q.mode,
    // District cuts read a different table and are scoped to one parent.
    // National and state questions share a row set — the ranking is identical
    // and only the highlight moves — so they must share a key, or every state
    // click would discard a valid result and flash a loading state.
    q.parent ? `district:${q.parent}` : "places",
  ].join("|");

export const DEFAULT_QUESTION: Question = {
  year: 2024, subject: "R", grade: 3, school: "All", geo: "ALL", parent: "", level: 4, mode: "cum",
};

export function phrase(q: Question): string {
  if (geoLevel(q) === "district")
    return DISTRICT_PHRASE[`${q.subject}|${bandForGrade(q.grade)}`];
  return (q.mode === "cum" ? PHRASE_CUM : PHRASE_EX)[q.subject][q.level] ?? PHRASE_EX[q.subject][0];
}

/**
 * Availability rules, derived from what each survey round published:
 * - 2024 + all schools: every grade, every rung (distributions).
 * - 2018/2022 + all schools: headline grades III/V/VIII at their headline rung.
 * - Govt/Pvt school type: grades III/V/VIII at the headline rung, any year
 *   2012–2024 (construct B, state + national).
 */
export const SURVEY_YEARS = [2012, 2014, 2016, 2018, 2022, 2024];

/**
 * Coerce any question — including one reconstructed from a hostile URL — into a
 * published combination. Every field is validated against its own domain first,
 * so no downstream code can be handed a grade or rung that does not exist.
 */
export function normalize(q: Question): Question {
  const out = { ...q };
  if (!GRADES.includes(out.grade)) out.grade = DEFAULT_QUESTION.grade;
  if (out.subject !== "R" && out.subject !== "A") out.subject = DEFAULT_QUESTION.subject;
  if (!["All", "Govt", "Pvt"].includes(out.school)) out.school = DEFAULT_QUESTION.school;
  if (!Number.isInteger(out.level) || out.level < 0 || out.level > 4) out.level = DEFAULT_QUESTION.level;
  if (out.mode !== "cum" && out.mode !== "ex") out.mode = DEFAULT_QUESTION.mode;
  if (!SURVEY_YEARS.includes(out.year)) out.year = DEFAULT_QUESTION.year;
  if (typeof out.geo !== "string" || !out.geo) out.geo = "ALL";
  if (typeof out.parent !== "string") out.parent = "";
  if (out.geo === "ALL") out.parent = "";
  if (out.parent) {
    // District questions exist for 2024 only, over grade bands, all schools.
    out.year = 2024;
    out.school = "All";
    out.mode = "cum";
    out.level = HEADLINE_LEVEL[out.subject][out.grade <= 5 ? 3 : 8];
    return out;
  }
  if (out.school !== "All") {
    if (![3, 5, 8].includes(out.grade)) out.grade = 3;
    out.level = HEADLINE_LEVEL[out.subject][out.grade];
    out.mode = "cum";
    if (![2012, 2014, 2016, 2018, 2022, 2024].includes(out.year)) out.year = 2024;
  } else if (out.year !== 2024) {
    // Earlier rounds publish the all-children headline for Std III/V/VIII only.
    if (![2018, 2022].includes(out.year)) out.year = 2024;
    else {
      if (![3, 5, 8].includes(out.grade)) out.grade = 3;
      out.level = HEADLINE_LEVEL[out.subject][out.grade];
      out.mode = "cum";
    }
  }
  if (out.level === 0) out.mode = "ex";
  return out;
}

export function yearsFor(q: Question): number[] {
  return q.school !== "All" ? [2012, 2014, 2016, 2018, 2022, 2024] : [2018, 2022, 2024];
}
export function gradesFor(q: Question): number[] {
  if (q.school !== "All" || q.year !== 2024) return [3, 5, 8];
  return GRADES;
}
export function skillLocked(q: Question): boolean {
  return q.school !== "All" || q.year !== 2024;
}

/** Guard: a set of rows may be charted together only when units agree. */
export function consistentUnit(rows: { unit: string }[]): string | null {
  const units = new Set(rows.map(r => r.unit));
  return units.size === 1 ? rows[0]?.unit ?? null : null;
}

/** Guard: numeric sanity for a percentage row; excludes malformed rows. */
export function validPercent(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100;
}

export const fmt = (v: number | null | undefined): string =>
  v == null ? "–" : (Math.round(v * 10) / 10).toFixed(v % 1 ? 1 : 0);

export const qs = (p: Record<string, string | number>): string =>
  new URLSearchParams(Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)]))).toString();
