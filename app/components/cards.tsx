"use client";
/**
 * The four answer cards. Each takes the question plus the data it needs and
 * renders one view of the same answer; none of them fetch, and none of them
 * mutate the question — the ranking's state clicks are the single exception,
 * routed through an explicit callback.
 */
import {
  Question, Row, SKILLS, ROMAN, NATIONAL, BAND_LABEL, DISTRICT_PHRASE,
  bandForGrade, geoLevel, phrase, fmt, validPercent,
} from "../lib/aser";
import { Cut, CutRow } from "../lib/api";
import { downloadCsv, downloadImageCard } from "../lib/downloads";
import { SourceLine, constructLine, questionText } from "./shared";

const LADDER_COLOURS = ["#C9D8EE", "#8FB4E8", "#4380D8", "#2256AC", "#123C78"];

export function RankingCard({ q, cut, status, onPick }: {
  q: Question; cut: Cut | null; status: string; onPick: (geography: string) => void;
}) {
  const rows = cut?.rows ?? [];
  const max = Math.max(...rows.map(r => r.val), 1);
  const nat = cut?.nat ?? null;
  const level = geoLevel(q);
  // Siblings are compared; the parent is the anchor row above them.
  const anchorName = level === "district" ? q.parent : NATIONAL;
  const shortName = (name: string) => level === "district" ? name.replace(/ \(.*\)$/, "") : name;

  const body =
    status === "loading" ? <p className="empty">Loading a source-linked comparison…</p>
      : status === "error" ? <p className="notice" role="alert">The data service is unavailable. No results are shown.</p>
        : !rows.length ? <p className="notice">This exact combination is not published in the loaded releases. Missing data is never shown as zero — adjust the question to a published cut.</p>
          : <>
            {nat != null && (
              <div className="rankrow india">
                <span className="name">{anchorName}</span>
                <span className="track"><span className="fill" style={{ width: `${(nat / max) * 100}%` }} /></span>
                <span className="val">{fmt(nat)}%</span>
              </div>)}
            <ol>
              {rows.map((row, i) => (
                <li key={row.geo}>
                  <button className={`rankrow${row.geo === q.geo ? " isfocus" : ""}`}
                    onClick={() => onPick(row.geo)} aria-label={`Open ${row.geo} profile`}>
                    <span className="name">{i + 1}. {shortName(row.geo)}</span>
                    <span className="track">
                      <span className="fill" style={{ width: `${Math.max(1.5, (row.val / max) * 100)}%` }} />
                    </span>
                    <span className="val">{fmt(row.val)}%</span>
                  </button>
                </li>))}
            </ol>
          </>;

  // Each row keeps its own citation: the anchor comes from the national (or
  // parent-state) table, and every ranked place from its own page. Collapsing
  // them to one page would make most exported citations wrong.
  const all: CutRow[] = [
    ...(nat != null && cut
      ? [{ geo: anchorName, val: nat, page: cut.natSource?.page ?? 0, src: cut.natSource?.src ?? "" }]
      : []),
    ...rows,
  ];
  const pages = [...new Set(all.map(r => r.page).filter(Boolean))];
  return (
    <section className="card" data-subject={q.subject}>
      <h3>{level === "district" ? `Districts of ${q.parent}` : "State comparison"}</h3>
      <p className="sub">{constructLine(q)}. Click a {level === "district" ? "district" : "state"} to open its profile.</p>
      {body}
      {rows.length > 0 && cut && (
        <SourceLine pages={pages} src={cut.src}
          onCsv={() => downloadCsv(`aser-${q.year}-std${q.grade}-${q.school.toLowerCase()}.csv`,
            ["geography", "value_percent", "survey_year", "question", "construct", "source_url", "source_page"],
            all.map(r => [r.geo, r.val, q.year, questionText(q), constructLine(q), r.src, r.page]))}
          onPng={() => downloadImageCard(`aser-${q.year}-std${q.grade}-ranking.png`, {
            title: questionText(q), subtitle: constructLine(q), kind: "bars",
            bars: all.map(r => ({ label: r.geo, value: r.val, highlight: r.geo === q.geo || r.geo === anchorName })),
            source: pages.length === 1
              ? `ASER report, p. ${pages[0]} — asercentre.org`
              : `ASER reports, ${pages.length} source pages — see the CSV for per-row citations`,
          })} />)}
      <details className="tbl"><summary>View as table</summary>
        <table>
          <caption>{questionText(q)}</caption>
          <thead><tr><th>Geography</th><th>%</th><th>Source</th></tr></thead>
          <tbody>{all.map(r => (
            <tr key={r.geo}>
              <td>{r.geo}</td><td className="num">{fmt(r.val)}</td>
              <td>{r.src ? <a href={`${r.src}#page=${r.page}`} target="_blank" rel="noreferrer">p. {r.page}</a> : "—"}</td>
            </tr>))}</tbody>
        </table>
      </details>
    </section>
  );
}

/**
 * The headline, as a compact strip rather than a card: the number the question
 * asks for, who it describes, and the two or three reference points that make
 * it readable — in one band, so the trend and comparison stay in view beside
 * the ranking.
 */
export function HeroCard({ q, cut }: { q: Question; cut: Cut | null }) {
  const rows = cut?.rows ?? [];
  if (!rows.length) return null;
  const [best, worst] = [rows[0], rows[rows.length - 1]];
  const level = geoLevel(q);
  const peers = level === "district" ? "districts" : "states";
  const anchorName = level === "district" ? q.parent : "India (rural)";
  const short = (name: string) => level === "district" ? name.replace(/ \(.*\)$/, "") : name;
  const focused = q.geo !== "ALL";
  const rank = focused ? rows.findIndex(r => r.geo === q.geo) : -1;
  if (focused && rank < 0) return null;

  const value = focused ? rows[rank].val : cut?.nat ?? null;
  const subject = focused ? short(q.geo) : "India (rural)";
  const ref = (label: string, v: number, geography?: string) => (
    <div key={label}>
      <span>{label}</span>
      <b className="num">{fmt(v)}%{geography ? <i> {short(geography)}</i> : null}</b>
    </div>);

  return (
    <section className="card herostrip">
      {value != null ? (
        <div className="headline">
          <b className="num">{fmt(value)}<small>%</small></b>
          <div className="who">
            <strong>{subject}</strong>
            {focused && <span className="badge">Ranked {rank + 1} of {rows.length} {peers}</span>}
            <span className="ctx">{constructLine(q)} · {phrase(q)}</span>
          </div>
        </div>
      ) : (
        <p className="who" style={{ margin: 0 }}>
          <strong>No all-India figure is published for this exact cut.</strong>
          <span className="ctx">The ranking beside this is the published evidence.</span>
        </p>)}
      <div className="range">
        {focused && cut?.nat != null && ref(anchorName, cut.nat)}
        {ref("Highest", best.val, best.geo)}
        {ref("Lowest", worst.val, worst.geo)}
      </div>
    </section>);
}

export function LadderCard({ q, ladder, host }: {
  q: Question; ladder: Map<number, Row[]> | null; host: string;
}) {
  if (geoLevel(q) === "district") return (
    <section className="card"><h3>The skill ladder</h3>
      <p className="note">District estimates are published as grade-band summaries, not rung-by-rung ladders. Switch to a state to see where every child stands on the ladder.</p>
    </section>);
  if (q.school !== "All") return (
    <section className="card"><h3>The skill ladder</h3>
      <p className="note">The rung-by-rung ladder is published for all children (2024). School-type series cover the headline skill only — switch to “all schools” to see the full ladder.</p>
    </section>);

  if (!host) return (
    <section className="card"><h3>The skill ladder</h3>
      <p className="note">The rung-by-rung ladder is published per state, not for rural India as a
        whole. Choose a state — in the question or the ranking — to see where its children stand.</p>
    </section>);
  const values = ladder
    ? SKILLS[q.subject].map((_, level) => {
      const row = ladder.get(level)?.find(r => r.geography === host);
      return row && validPercent(row.numericValue) ? row.numericValue : null;
    })
    : [];
  if (!ladder || !values.length || values.some(v => v == null)) return (
    <section className="card"><h3>The skill ladder</h3>
      <p className="note">The full ladder was published for the 2024 round. Pick 2024 to see where every child stands, rung by rung.</p>
    </section>);

  const anchor = ladder.get(0)?.find(r => r.geography === host);
  const inBand = (level: number) =>
    q.year === 2024 && (q.mode === "cum" ? level >= q.level : level === q.level);

  return (
    <section className="card" data-subject={q.subject}>
      <h3>The skill ladder — {host}</h3>
      <p className="sub">Where every Std {ROMAN[q.grade]} child stands, 2024, all schools. Marked rungs are counted in your question.</p>
      <div className="ladder" role="img" aria-label={`Skill distribution for ${host}`}>
        {values.map((value, level) => (
          <span key={level} className={`segm s${level}${inBand(level) ? " inband" : ""}`}
            style={{ flex: `${value} 0 0` }} title={`${SKILLS[q.subject][level]}: ${fmt(value)}%`}>
            {value! >= 9 && <b className="num">{fmt(value)}</b>}
          </span>))}
      </div>
      <div className="legend">
        {SKILLS[q.subject].map((name, level) => (
          <span key={name} className={inBand(level) ? "sel" : ""}>
            <i className={`s${level}`} />{name} <span className="num">{fmt(values[level])}%</span>
          </span>))}
      </div>
      {anchor && (
        <SourceLine page={anchor.pdfPageNumber} src={anchor.sourceUrl}
          onCsv={() => downloadCsv(`aser-2024-ladder-${host}.csv`,
            ["skill_level", "value_percent", "grade", "geography", "source_url", "source_page"],
            SKILLS[q.subject].map((name, level) =>
              [name, values[level]!, `Std ${ROMAN[q.grade]}`, host, anchor.sourceUrl, anchor.pdfPageNumber]))}
          onPng={() => downloadImageCard(`aser-2024-ladder-${host}.png`, {
            title: `Where do Std ${ROMAN[q.grade]} children in ${host} stand on the ${q.subject === "R" ? "reading" : "arithmetic"} ladder?`,
            subtitle: "All children, 2024, rural. Exclusive levels — each child appears on exactly one rung.",
            kind: "ladder",
            ladder: SKILLS[q.subject].map((name, level) =>
              ({ label: name, value: values[level]!, color: LADDER_COLOURS[level] })),
            source: `ASER 2024 report, p. ${anchor.pdfPageNumber} — asercentre.org`,
          })} />)}
      <details className="tbl"><summary>View as table</summary>
        <table>
          <caption>Skill distribution, Std {ROMAN[q.grade]}, {host}, 2024</caption>
          <thead><tr><th>Skill level</th><th>%</th></tr></thead>
          <tbody>{SKILLS[q.subject].map((name, level) =>
            <tr key={name}><td>{name}</td><td className="num">{fmt(values[level])}</td></tr>)}</tbody>
        </table>
      </details>
    </section>);
}

/**
 * The drill-down band: districts of whichever state is in focus, ranked the way
 * states are ranked within the country, with the state's own value as anchor.
 *
 * District estimates are grade-band constructs, so the band says so rather than
 * letting the reader assume it continues the single-grade series above it.
 */
export function DistrictBand({ q, cut, state, onPick }: {
  q: Question; cut: Cut | null; state: string;
  onPick: (geography: string, parent: string) => void;
}) {
  if (!state) return (
    <section className="card">
      <h3>Districts</h3>
      <p className="note">Pick a state above — in the ranking or the question — to see how its
        districts compare within it.</p>
    </section>);

  const rows = cut?.rows ?? [];
  const band = bandForGrade(q.grade);
  if (!rows.length) return (
    <section className="card">
      <h3>Districts of {state}</h3>
      <p className="note">No district estimates are published for {state} on this measure.</p>
    </section>);

  const max = Math.max(...rows.map(r => r.val), 1);
  const short = (name: string) => name.replace(/ \(.*\)$/, "");
  const measure = `${BAND_LABEL[band]} children who ${DISTRICT_PHRASE[`${q.subject}|${band}`]}`;
  const boundaryNote = state === "Uttar Pradesh"
    ? `ASER's 2024 district-estimate file publishes ${rows.length} Uttar Pradesh districts, not the state's current 75. Amethi, Hapur, Kanpur Nagar, Sambhal and Shamli are not separate rows in that source; ASER does not state a district-level reason, so this explorer does not infer or fabricate one.`
    : `This view contains ${rows.length} districts published in ASER's 2024 district-estimate file. It is analytical publication coverage, not a current administrative district register; boundary changes and unpublished estimates can make the totals differ.`;

  return (
    <section className="card districts" data-subject={q.subject}>
      <h3>Districts of {state}</h3>
      <p className="sub">
        {measure} · 2024 · all schools. Districts are published over grade bands, so these are not
        the same measure as the {ROMAN[q.grade] ? `Std ${ROMAN[q.grade]}` : "state"} figures above.
        Click a district to make it the question.
      </p>
      <p className="note">{boundaryNote}</p>
      {cut?.nat != null && (
        <div className="rankrow india">
          <span className="name">{state}</span>
          <span className="track"><span className="fill" style={{ width: `${(cut.nat / max) * 100}%` }} /></span>
          <span className="val">{fmt(cut.nat)}%</span>
        </div>)}
      <ol className="districtgrid">
        {rows.map((row, i) => (
          <li key={row.geo}>
            <button className={`rankrow${row.geo === q.geo ? " isfocus" : ""}`}
              onClick={() => onPick(row.geo, state)} aria-label={`Open ${short(row.geo)}`}>
              <span className="name">{i + 1}. {short(row.geo)}</span>
              <span className="track">
                <span className="fill" style={{ width: `${Math.max(1.5, (row.val / max) * 100)}%` }} />
              </span>
              <span className="val">{fmt(row.val)}%</span>
            </button>
          </li>))}
      </ol>
      {cut && (
        <SourceLine pages={[...new Set(rows.map(r => r.page).filter(Boolean))]} src={cut.src}
          onCsv={() => downloadCsv(`aser-2024-districts-${state.toLowerCase().replaceAll(" ", "-")}.csv`,
            ["district", "state", "value_percent", "measure", "survey_year", "source_url", "source_page"],
            rows.map(r => [short(r.geo), state, r.val, measure, 2024, r.src, r.page]))}
          onPng={() => downloadImageCard(`aser-2024-districts-${state.toLowerCase().replaceAll(" ", "-")}.png`, {
            title: `Districts of ${state} — ${measure}`,
            subtitle: `2024 · all schools · rural. ${state}: ${fmt(cut.nat)}%`,
            kind: "bars",
            bars: rows.map(r => ({ label: short(r.geo), value: r.val, highlight: r.geo === q.geo })),
            note: "District estimates carry wider sampling uncertainty than state figures.",
            source: `ASER 2024 district estimates — asercentre.org`,
          })} />)}
      <details className="tbl"><summary>View as table</summary>
        <table>
          <caption>{measure} — districts of {state}, 2024</caption>
          <thead><tr><th>District</th><th>%</th><th>Source</th></tr></thead>
          <tbody>{rows.map(r => (
            <tr key={r.geo}><td>{short(r.geo)}</td><td className="num">{fmt(r.val)}</td>
              <td>{r.src ? <a href={`${r.src}#page=${r.page}`} target="_blank" rel="noreferrer">p. {r.page}</a> : "—"}</td>
            </tr>))}</tbody>
        </table>
      </details>
    </section>);
}
