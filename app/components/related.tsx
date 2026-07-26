"use client";
/**
 * The two related-question cards.
 *
 * Both derive entirely from the big question and vary exactly one dimension —
 * the trend varies the survey round, the comparison varies one other dimension
 * chosen from a registry. Adding a dimension (gender, urban/rural, a second
 * dataset) means adding one registry entry, not a new component.
 */
import { useEffect, useState } from "react";
import {
  Question, Subject, Row, ROMAN, NATIONAL, PHRASE_CUM, PHRASE_EX,
  HEADLINE_LEVEL, SCHOOL_TYPE_INDICATOR, HEADLINE_INDICATOR,
  distributionIndicator, geoLevel, DISTRICT_INDICATOR, bandForGrade, phrase, fmt, validPercent,
} from "../lib/aser";
import { Cut, fetchValue, fetchLadder } from "../lib/api";
import { downloadCsv, downloadImageCard } from "../lib/downloads";
import { Sel, SourceLine, Bar, constructLine, gradeLabel, questionText, leadSentence } from "./shared";

/** A trend can span two report editions, so lineage is per point, per series. */
export type TrendPointSource = { page: number; src: string } | null;
export type TrendData = {
  years: number[];
  nat: (number | null)[];
  st: (number | null)[];
  natSource: TrendPointSource[];
  stSource: TrendPointSource[];
  page: number;
  src: string;
};

const direction = (delta: number) =>
  delta > 1 ? `up ${fmt(Math.abs(delta))} points`
    : delta < -1 ? `down ${fmt(Math.abs(delta))} points`
      : "broadly unchanged";

const verdict = (delta: number) =>
  delta > 1 ? "Yes" : delta < -1 ? "No — it has fallen" : "Not by much";

export function TrendCard({ q, trend, selected, onSelect, onJump }: {
  q: Question; trend: TrendData | null;
  selected: number[] | null; onSelect: (years: number[] | null) => void;
  onJump: (patch: Partial<Question>) => void;
}) {
  const frame = (body: React.ReactNode) => (
    <section className="card qcard" data-subject={q.subject}>
      <p className="q-eyebrow">Related question · trend</p>
      <h3>Has this changed over time?</h3>
      {body}
    </section>);

  if (!trend) {
    // Only the headline measures repeat across rounds. Rather than leaving the
    // reader at a dead end, offer the nearest cut that does have a series.
    const nearestGrade = q.grade <= 4 ? 3 : q.grade <= 6 ? 5 : 8;
    const headlineLevel = HEADLINE_LEVEL[q.subject][nearestGrade];
    const routes: { label: string; patch: Partial<Question> }[] = [];
    if (q.grade !== nearestGrade || q.level !== headlineLevel || q.mode !== "cum")
      routes.push({
        label: `Show Std ${ROMAN[nearestGrade]} · ${PHRASE_CUM[q.subject][headlineLevel]}`,
        patch: { grade: nearestGrade, level: headlineLevel, mode: "cum" },
      });
    if (q.school === "All")
      routes.push({
        label: "Show government schools (series reaches 2012)",
        patch: { grade: nearestGrade, school: "Govt" },
      });
    return frame(<>
      <p className="note">
        ASER repeats only its headline measures across rounds, so this exact cut exists for {q.year} alone.
        The rung-by-rung ladder was published for 2024 only.
      </p>
      {routes.length > 0 && (
        <div className="chips" style={{ marginTop: 10 }}>
          {routes.map(route => (
            <button key={route.label} className="chip" onClick={() => onJump(route.patch)}>
              {route.label} →
            </button>))}
        </div>)}
    </>);
  }

  const chosen = selected ? trend.years.filter(y => selected.includes(y)) : trend.years;
  const years = chosen.length >= 2 ? chosen : trend.years;
  const at = years.map(y => trend.years.indexOf(y));
  const nat = at.map(i => trend.nat[i]);
  const st = at.map(i => trend.st[i]);
  const natSrc = at.map(i => trend.natSource[i]);
  const stSrc = at.map(i => trend.stSource[i]);
  const pagesUsed = [...new Set([...natSrc, ...stSrc]
    .filter((sp): sp is { page: number; src: string } => Boolean(sp)).map(sp => sp.page))];
  // A state that publishes only some rounds keeps its own line with gaps in it.
  // Dropping it and drawing India instead would answer a question about the
  // state with national data, without saying so (UAT-P1-005).
  const filled = (series: (number | null)[]) =>
    series.map((v, i) => (v == null ? -1 : i)).filter(i => i >= 0);
  const stFilled = filled(st);
  const natFilled = filled(nat);
  const hasState = q.geo !== "ALL" && stFilled.length >= 2;
  const mainFilled = hasState ? stFilled : natFilled;
  if (mainFilled.length < 2) return frame(
    <p className="note">Fewer than two comparable rounds are published for this cut, so no trend is
      drawn. Any published points appear in the table below.</p>);

  const last = years.length - 1;
  /** Change between the first and last *published* points, never across a gap. */
  const spanOf = (series: (number | null)[], idx: number[]) => {
    const [a, b] = [idx[0], idx[idx.length - 1]];
    return { delta: (series[b] as number) - (series[a] as number), from: years[a], to: years[b] };
  };
  const stSpan = hasState ? spanOf(st, stFilled) : null;
  const natSpan = natFilled.length >= 2 ? spanOf(nat, natFilled) : null;
  const sparse = hasState && stFilled.length < years.length;
  const answer = hasState && stSpan
    ? <><b>{verdict(stSpan.delta)}</b> — {q.geo} is {direction(stSpan.delta)} between {stSpan.from} and {stSpan.to}
        {natSpan && <>; India (rural) is {direction(natSpan.delta)} between {natSpan.from} and {natSpan.to}</>}.</>
    : natSpan
      ? <><b>{verdict(natSpan.delta)}</b> — India (rural) is {direction(natSpan.delta)} between {natSpan.from} and {natSpan.to}.</>
      : <>No comparable change can be stated for this cut.</>;

  const W = 460, H = 150, PL = 30, PR = 134, PT = 12, PB = 22;
  const values = [...nat, ...st].filter(validPercent) as number[];
  const lo = Math.max(0, Math.floor(Math.min(...values) / 10) * 10 - 10);
  const hi = Math.min(100, Math.ceil(Math.max(...values) / 10) * 10 + 10);
  const x = (i: number) => PL + (i * (W - PL - PR)) / Math.max(1, last);
  const y = (v: number) => PT + ((hi - v) * (H - PT - PB)) / (hi - lo || 1);
  const path = (series: (number | null)[]) =>
    series.map((v, i) => v == null ? "" : `${i && series[i - 1] != null ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");

  // Keep the two end labels from overlapping when the lines converge.
  const stLastIdx = hasState ? stFilled[stFilled.length - 1] : -1;
  let labelSt = stLastIdx >= 0 ? y(st[stLastIdx] as number) : 0;
  const natLastIdx = natFilled.length ? natFilled[natFilled.length - 1] : -1;
  let labelNat = natLastIdx >= 0 ? y(nat[natLastIdx] as number) : 0;
  if (hasState && natLastIdx >= 0 && Math.abs(labelSt - labelNat) < 14) {
    const mid = (labelSt + labelNat) / 2, sign = labelSt <= labelNat ? -1 : 1;
    labelSt = mid + sign * 7; labelNat = mid - sign * 7;
  }

  return (
    <section className="card qcard" data-subject={q.subject}>
      <p className="q-eyebrow">Related question · trend</p>
      <h3>Has this changed over time?</h3>
      <p className="answerline">{answer}</p>
      {sparse && (
        <p className="holding">
          {q.geo} publishes {stFilled.length} of these {years.length} rounds; the missing rounds are
          gaps in its line, not zeros, and are excluded from the change above.
        </p>)}
      <div className="seg" role="group" aria-label="Survey rounds in the trend">
        {trend.years.map(year => (
          <button key={year} aria-pressed={years.includes(year)}
            onClick={() => {
              const on = years.includes(year);
              if (on && years.length <= 2) return;
              onSelect(on ? years.filter(y => y !== year) : [...years, year].sort());
            }}>{year}</button>))}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Trend ${years[0]} to ${years[last]}`}>
        {[lo, (lo + hi) / 2, hi].map(v => (
          <g key={v}>
            <line className="gridl" x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} />
            <text x={PL - 5} y={y(v) + 4} textAnchor="end">{v}</text>
          </g>))}
        {natFilled.length >= 2 &&
          <path d={path(nat)} fill="none" className={hasState ? "muted-line" : "main-line"}
            strokeWidth="2" strokeDasharray={hasState ? "5 4" : undefined} />}
        {hasState && <path d={path(st)} fill="none" className="main-line" strokeWidth="2" />}
        {years.map((year, i) => (
          <g key={year}>
            {nat[i] != null && <>
              <circle cx={x(i)} cy={y(nat[i]!)} r="3.5" className={hasState ? "muted-dot" : "main-dot"}>
                <title>India (rural) {year}: {fmt(nat[i])}%</title>
              </circle>
              <text className="point-value num" x={x(i)} y={y(nat[i]!) + (hasState ? 14 : -7)}
                textAnchor="middle">{fmt(nat[i])}</text>
            </>}
            {hasState && st[i] != null && <>
              <circle cx={x(i)} cy={y(st[i]!)} r="3.5" className="main-dot">
                <title>{q.geo} {year}: {fmt(st[i])}%</title>
              </circle>
              <text className="point-value lbl-strong num" x={x(i)} y={y(st[i]!) - 7}
                textAnchor="middle">{fmt(st[i])}</text>
            </>}
            <text x={x(i)} y={H - 6} textAnchor="middle">{year}</text>
          </g>))}
        {hasState && <text x={x(stLastIdx) + 8} y={labelSt + 4} className="lbl-strong num">
          {q.geo.length > 13 ? `${q.geo.slice(0, 12)}…` : q.geo} {fmt(st[stLastIdx])}%</text>}
        {natLastIdx >= 0 && <text x={x(natLastIdx) + 8} y={labelNat + 4} className={`num${hasState ? "" : " lbl-strong"}`}>
          India {fmt(nat[natLastIdx])}%</text>}
      </svg>
      <p className="sub">2020–21 were surveyed by phone and are excluded as not comparable. A trend compares different cohorts of children, not the progress of the same children.</p>
      <SourceLine pages={pagesUsed} src={trend.src}
        onCsv={() => downloadCsv(`aser-trend-std${q.grade}-${q.school.toLowerCase()}.csv`,
          ["survey_year", "series", "geography", "value_percent", "construct", "source_url", "source_page"],
          years.flatMap((year, i) => [
            ...(nat[i] != null ? [[year, "India (rural)", "India (rural)", nat[i]!, constructLine(q),
              natSrc[i]?.src ?? "", natSrc[i]?.page ?? ""]] : []),
            ...(hasState && st[i] != null ? [[year, "State", q.geo, st[i]!, constructLine(q),
              stSrc[i]?.src ?? "", stSrc[i]?.page ?? ""]] : []),
          ]))}
        onPng={() => downloadImageCard(`aser-trend-std${q.grade}.png`, {
          title: `Has this changed over time? — Std ${ROMAN[q.grade]} children who ${phrase(q)}`,
          subtitle: constructLine(q), kind: "lines",
          lines: [
            ...(hasState ? [{ label: q.geo, points: years.map((year, i) => ({ x: String(year), y: st[i]! })) }] : []),
            ...(nat.every(v => v != null) ? [{ label: "India (rural)", points: years.map((year, i) => ({ x: String(year), y: nat[i]! })), dashed: hasState }] : []),
          ],
          note: "Comparable in-person survey rounds only. Different cohorts of children in each round.",
          source: pagesUsed.length === 1
            ? `ASER report, p. ${pagesUsed[0]} — asercentre.org`
            : `ASER reports — ${pagesUsed.length} source pages across editions; see CSV for per-point citations`,
        })} />
      <details className="tbl"><summary>View as table</summary>
        <table>
          <caption>{questionText(q)} — by survey round</caption>
          <thead><tr><th>Survey round</th><th>India (rural)</th>{hasState && <th>{q.geo}</th>}<th>Source</th></tr></thead>
          <tbody>{years.map((year, i) => {
            const sp = stSrc[i] ?? natSrc[i];
            return (
              <tr key={year}><td>{year}</td><td className="num">{fmt(nat[i])}</td>
                {hasState && <td className="num">{fmt(st[i])}</td>}
                <td>{sp ? <a href={`${sp.src}#page=${sp.page}`} target="_blank" rel="noreferrer">p. {sp.page}</a> : "—"}</td>
              </tr>);
          })}</tbody>
        </table>
      </details>
    </section>);
}

/* ── comparison engine ───────────────────────────────────────────────── */

type CompareContext = {
  q: Question;
  cut: Cut | null;
  host: string;
  states: string[];
  picked: string[];
  setPicked: (states: string[]) => void;
};
type CompareResult = {
  answer: React.ReactNode;
  varied: string[];
  bars: [string, number, string][];
  footnote?: string;
  extra?: React.ReactNode;
};
type Dimension = {
  key: string;
  label: string;
  available: (ctx: CompareContext) => boolean;
  /** Values this dimension needs, keyed for the async loader. */
  load?: (ctx: CompareContext) => Promise<Record<string, number | null>>;
  render: (ctx: CompareContext, data: Record<string, number | null>) => CompareResult | null;
};

const geoOf = (q: Question) => (q.geo === "ALL" ? NATIONAL : q.geo);

export const DIMENSIONS: Dimension[] = [
  {
    key: "school",
    label: "across school types",
    available: ({ q }) => geoLevel(q) !== "district" && q.school === "All"
      && [3, 5, 8].includes(q.grade) && q.mode === "cum"
      && HEADLINE_LEVEL[q.subject][q.grade] === q.level,
    load: async ({ q }) => {
      const indicator = SCHOOL_TYPE_INDICATOR[`${q.subject}|${q.grade}`];
      const geography = geoOf(q);
      const [govt, pvt] = await Promise.all([
        fetchValue(q.year, indicator, "Govt", geography),
        fetchValue(q.year, indicator, "Pvt", geography),
      ]);
      return { govt, pvt };
    },
    render: ({ q }, { govt, pvt }) => {
      // ASER suppresses one side of the split in some states (West Bengal has a
      // government figure but no private one). Show what is published and name
      // what is missing — discarding a real value would be the worse error.
      if (govt == null && pvt == null) return null;
      const bars: [string, number, string][] = [];
      if (govt != null) bars.push(["Government", govt, "e0"]);
      if (pvt != null) bars.push(["Private", pvt, "e1"]);
      const both = govt != null && pvt != null;
      const missing = govt == null ? "Government" : "Private";
      return {
        answer: both
          ? <>{leadSentence([["Government schools", govt], ["Private schools", pvt]])} <i>{geoOf(q)}, {q.year}.</i></>
          : <>Only the <b>{govt != null ? "government" : "private"}-school</b> figure is published for {geoOf(q)} in {q.year} — <b>{fmt(govt ?? pvt)}%</b>.</>,
        varied: ["school"],
        bars,
        footnote: both
          ? "The gap partly reflects who attends private schools, not only school quality — see About the data."
          : `ASER suppresses the ${missing.toLowerCase()}-school estimate here because the sample is too small to report. It is left out rather than filled in.`,
      };
    },
  },
  {
    key: "allkids",
    label: "with all children",
    available: ({ q }) => geoLevel(q) !== "district" && q.school !== "All"
      && [2018, 2022, 2024].includes(q.year),
    load: async ({ q }) => {
      const geography = geoOf(q);
      const [all, mine] = await Promise.all([
        fetchValue(q.year, HEADLINE_INDICATOR[`${q.subject}|${q.grade}`], "All", geography),
        fetchValue(q.year, SCHOOL_TYPE_INDICATOR[`${q.subject}|${q.grade}`], q.school, geography),
      ]);
      return { all, mine };
    },
    render: ({ q }, { all, mine }) => {
      if (all == null && mine == null) return null;
      const label = q.school === "Govt" ? "Government-school children" : "Private-school children";
      const bars: [string, number, string][] = [];
      if (mine != null) bars.push([label, mine, "main"]);
      if (all != null) bars.push(["All children (incl. other school types)", all, "mutedfill"]);
      const both = all != null && mine != null;
      return {
        answer: both
          ? <><b>{label} {mine >= all ? "sit above" : "sit below"} the all-children average by {fmt(Math.abs(mine - all))} points</b> in {geoOf(q)} ({q.year}).</>
          : <>Only the <b>{mine != null ? label.toLowerCase() : "all-children"}</b> figure is published for {geoOf(q)} in {q.year} — <b>{fmt(mine ?? all)}%</b>.</>,
        varied: ["school"],
        bars,
        footnote: both
          ? "Two different denominators — the all-children figure includes children in other school types."
          : "The other series is suppressed at source for this cut and is left out rather than filled in.",
      };
    },
  },
  {
    key: "states",
    label: "between selected places",
    available: ({ cut }) => (cut?.rows.length ?? 0) >= 2,
    render: (ctx) => {
      const { q, cut, picked, setPicked, states } = ctx;
      const rows = cut?.rows ?? [];
      if (rows.length < 2) return null;
      let chosen = picked.filter(g => rows.some(r => r.geo === g));
      // The focused place joins the comparison only when the current rows
      // actually contain it. During a level change they will not, and inventing
      // a value for it is what used to crash the page.
      if (q.geo !== "ALL" && rows.some(r => r.geo === q.geo) && !chosen.includes(q.geo))
        chosen = [q.geo, ...chosen];
      if (chosen.length < 2) {
        const i = rows.findIndex(r => r.geo === q.geo);
        chosen = i >= 0
          ? [q.geo, (rows[i + 1] ?? rows[i - 1] ?? rows[0]).geo]
          : [rows[0].geo, rows[rows.length - 1].geo];
      }
      chosen = [...new Set(chosen)].slice(0, 4);
      const items: [string, number][] = chosen
        .map(g => [g, rows.find(r => r.geo === g)?.val] as [string, number | undefined])
        .filter((pair): pair is [string, number] => pair[1] != null);
      if (items.length < 2) return null;
      const district = geoLevel(q) === "district";
      const addable = (district ? rows.map(r => r.geo) : states)
        .filter(s => !chosen.includes(s) && rows.some(r => r.geo === s));
      return {
        answer: leadSentence(items),
        varied: ["geo"],
        bars: [
          ...items.sort((a, b) => b[1] - a[1]).map(([g, v]) => [g, v, g === q.geo ? "accent" : "main"] as [string, number, string]),
          ...(cut?.nat != null
            ? [[district ? q.parent : NATIONAL, cut.nat, "mutedfill"] as [string, number, string]]
            : []),
        ],
        extra: (
          <div className="chips">
            {chosen.map(g => (
              <button key={g} className="chip" aria-label={`Remove ${g}`}
                onClick={() => chosen.length > 2 && setPicked(chosen.filter(x => x !== g))}>
                {district ? g.replace(/ \(.*\)$/, "") : g} ✕</button>))}
            {chosen.length < 4 && (
              <Sel label={district ? "Add a district" : "Add a state"}
                value="" options={["", ...addable]}
                labels={[district ? "Add a district…" : "Add a state…",
                  ...addable.map(a => district ? a.replace(/ \(.*\)$/, "") : a)]}
                onChange={value => value && setPicked([...chosen, value])} />)}
          </div>),
      };
    },
  },
  {
    key: "subject",
    label: "between reading and arithmetic",
    // Needs a specific place: the ladder it sums is published per state, and
    // there is no national ladder. A national question therefore cannot answer
    // this dimension, and must not borrow a state to pretend otherwise.
    available: ({ q, host }) => q.year === 2024 && Boolean(host)
      && (geoLevel(q) === "district" || q.school === "All"),
    load: async ({ q, host }) => {
      if (geoLevel(q) === "district") {
        const band = bandForGrade(q.grade);
        const [reading, arithmetic] = await Promise.all(
          (["R", "A"] as Subject[]).map(subject =>
            fetchValue(2024, DISTRICT_INDICATOR[`${subject}|${band}`], "All", q.geo, q.parent)));
        return { reading, arithmetic };
      }
      const levels = q.mode === "cum" ? [0, 1, 2, 3, 4].filter(l => l >= q.level) : [q.level];
      const sum = async (subject: Subject) => {
        const parts = await Promise.all(levels.map(level =>
          fetchValue(2024, distributionIndicator(subject, level), `Std ${ROMAN[q.grade]}`, host)));
        return parts.some(v => v == null) ? null : Math.round(parts.reduce((a, b) => a! + b!, 0)! * 10) / 10;
      };
      const [reading, arithmetic] = await Promise.all([sum("R"), sum("A")]);
      return { reading, arithmetic };
    },
    render: ({ q, host }, { reading, arithmetic }) => {
      if (reading == null || arithmetic == null) return null;
      const district = geoLevel(q) === "district";
      const where = district ? q.geo.replace(/ \(.*\)$/, "") : host;
      const rung = (subject: Subject) => district
        ? (subject === "R" ? "can read a Std II story" : bandForGrade(q.grade) === "III-V" ? "can do at least subtraction" : "can do division")
        : (q.mode === "cum" ? PHRASE_CUM : PHRASE_EX)[subject][q.level] ?? PHRASE_EX[subject][0];
      return {
        answer: <>In {where}, {reading === arithmetic ? "reading and arithmetic are level" : leadSentence([["reading", reading], ["arithmetic", arithmetic]])}</>,
        varied: ["skill"],
        bars: [[`Reading — ${rung("R")}`, reading, "main"], [`Arithmetic — ${rung("A")}`, arithmetic, "alt"]],
        footnote: district
          ? "The two district measures use ASER's published grade-band definitions and are not rungs of one ladder."
          : `Both measured at rung ${q.level + 1} of 5 on their own ladder — parallel positions, not equivalent skills.`,
      };
    },
  },
];

export function CompareCard(ctx: CompareContext & { active: string; onDimension: (key: string) => void }) {
  const { q, cut, active, onDimension } = ctx;
  const options = DIMENSIONS.filter(d => d.available(ctx));
  const dimension = options.find(d => d.key === active) ?? options[0];
  const [data, setData] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let live = true;
    // A synchronous dimension has nothing to await, so any loading state from a
    // previous async dimension must be cleared here or the card stays stuck.
    if (!dimension?.load) { setData({}); setLoading(false); return; }
    setLoading(true);
    dimension.load(ctx)
      .then(result => { if (live) { setData(result); setLoading(false); } })
      .catch(() => { if (live) { setData({}); setLoading(false); } });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimension?.key, q.year, q.subject, q.grade, q.school, q.level, q.mode, q.geo, ctx.host]);

  const frame = (body: React.ReactNode, chooser?: React.ReactNode, exportable?: { title: string; items: [string, number][] }) => (
    <section className="card qcard" data-subject={q.subject}>
      <p className="q-eyebrow">Related question · comparison</p>
      <h3>How does this compare{chooser ? <> — {chooser}</> : ""}?</h3>
      {body}
      {exportable && (
        <SourceLine page={cut?.page ?? 0} src=""
          onPng={() => downloadImageCard(`aser-compare-${q.year}-std${q.grade}.png`, {
            title: exportable.title, subtitle: `${constructLine(q)} · ${phrase(q)}`, kind: "bars",
            bars: exportable.items.map(([label, value]) => ({ label, value, highlight: label === q.geo })),
            source: "ASER reports — asercentre.org",
          })}
          onCsv={() => downloadCsv(`aser-compare-${q.year}-std${q.grade}.csv`,
            ["series", "value_percent", "comparison", "held_constant"],
            exportable.items.map(([label, value]) => [label, value, exportable.title, constructLine(q)]))} />)}
    </section>);

  if (!cut?.rows.length) return frame(<p className="note">No published data for this selection.</p>);
  if (!dimension) return frame(<p className="note">No comparison is available for this exact cut. Pick a 2024 measure, or open a state profile.</p>);

  const chooser = (
    <Sel label="Comparison dimension" value={dimension.key} options={options.map(d => d.key)}
      labels={options.map(d => d.label)} onChange={onDimension} />);

  if (loading) return frame(<p className="empty">Loading the comparison…</p>, chooser);
  const result = dimension.render(ctx, data);
  if (!result) return frame(
    <p className="note">This comparison is not published for the current cut — small samples are suppressed at source.</p>, chooser);

  const held = ["year", "grade", "geo", "school", "skill"]
    .filter(slot => !result.varied.includes(slot))
    .map(slot => slot === "year" ? String(q.year)
      : slot === "grade" ? gradeLabel(q)
        : slot === "geo" ? (q.geo === "ALL" ? "rural India" : q.geo)
          : slot === "school" ? (q.school === "All" ? "all schools" : q.school === "Govt" ? "government schools" : "private schools")
            : phrase(q));
  const max = Math.max(...result.bars.map(b => b[1]), 1);

  return frame(
    <>
      <p className="answerline">{result.answer}</p>
      <p className="holding">Holding constant: {held.join(" · ")}.</p>
      {result.extra}
      {result.bars.map(([name, value, tone]) => <Bar key={name} name={name} value={value} tone={tone} max={max} />)}
      {result.footnote && <p className="sub" style={{ marginTop: 10 }}>{result.footnote}</p>}
    </>,
    chooser,
    { title: `${questionText(q)} — ${dimension.label}`, items: result.bars.map(([n, v]) => [n, v] as [string, number]) });
}

/** Ladder loader shared by the page and the subject comparison. */
export const loadLadder = fetchLadder;
export type { Row };
