"use client";
/** Small building blocks shared by every card. */
import { Question, ROMAN, BAND_LABEL, bandForGrade, geoLevel, phrase, fmt } from "../lib/aser";

export function Sel({ label, value, onChange, options, labels }: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  options: string[];
  labels?: string[];
}) {
  return (
    <select aria-label={label} value={String(value)} onChange={e => onChange(e.target.value)}>
      {options.map((option, i) => <option key={option} value={option}>{labels?.[i] ?? option}</option>)}
    </select>
  );
}

/**
 * Source attribution plus the two export affordances every chart carries.
 *
 * A visual whose rows come from different report pages must not claim a single
 * page. Pass every page the visual draws on: one page links directly, several
 * say so and point at the per-row citations in the table and CSV.
 */
export function SourceLine({ page, pages, src, onCsv, onPng }: {
  page?: number; pages?: number[]; src: string; onCsv?: () => void; onPng?: () => void;
}) {
  const list = (pages ?? (page ? [page] : [])).filter(Boolean);
  return (
    <div className="srcline">
      <span>
        Source:{" "}
        {!src || !list.length ? "ASER reports — asercentre.org"
          : list.length === 1
            ? <a href={`${src}#page=${list[0]}`} target="_blank" rel="noreferrer">ASER report, p. {list[0]} ↗</a>
            : <>ASER reports — {list.length} pages; each row cites its own (see table or CSV)</>}
      </span>
      <span className="dl">
        {onPng && <button onClick={onPng}>Download image</button>}
        {onCsv && <button onClick={onCsv}>Download CSV</button>}
      </span>
    </div>
  );
}

export function Bar({ name, value, tone, max }: {
  name: string; value: number; tone: string; max: number;
}) {
  return (
    <div className="rankrow" title={`${name}: ${fmt(value)}%`}>
      <span className="name">{name}</span>
      <span className="track">
        <span className={`fill ${tone}`} style={{ width: `${Math.max(1.5, (value / max) * 100)}%` }} />
      </span>
      <span className="val">{fmt(value)}%</span>
    </div>
  );
}

/** The grade or grade band this question describes. */
export const gradeLabel = (q: Question): string =>
  geoLevel(q) === "district" ? BAND_LABEL[bandForGrade(q.grade)] : `Std ${ROMAN[q.grade]}`;

/** The population and round a card describes — printed on screen and exported. */
export const constructLine = (q: Question): string => {
  const where = geoLevel(q) === "district" ? `${q.parent} districts (rural)` : "rural India";
  return q.school === "All"
    ? `All children · ${gradeLabel(q)} · ${q.year} · ${where}`
    : `${q.school === "Govt" ? "Government-school" : "Private-school"} children · ${gradeLabel(q)} · ${q.year} · ${where}`;
};

/** The question, written out — the title of every export. */
export const questionText = (q: Question): string => {
  const school = q.school === "All" ? "all schools"
    : q.school === "Govt" ? "government schools" : "private schools";
  const where = q.geo === "ALL" ? "across rural India" : `in ${q.geo.replace(/ \(.*\)$/, "")}`;
  return `In ${q.year}, what share of ${gradeLabel(q)} children in ${school} ${where} ${phrase(q)}?`;
};

/** "X leads by N points" — the shared shape of every comparison answer. */
export const leadSentence = (items: [string, number][]) => {
  const sorted = [...items].sort((a, b) => b[1] - a[1]);
  const [top, bottom] = [sorted[0], sorted[sorted.length - 1]];
  // The subject may be singular ("Kerala") or plural ("Private schools"), and
  // guessing its number from the string is unreliable. "ahead by" agrees with
  // both, so the sentence is correct without a heuristic.
  return (
    <>
      <b>{top[0]} ahead by {fmt(top[1] - bottom[1])} points</b>
      {" "}— {fmt(top[1])}% vs {fmt(bottom[1])}% for {bottom[0]}.
    </>
  );
};
