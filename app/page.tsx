"use client";
/**
 * ASER Data Explorer.
 *
 * One "big question" (round · grade · school type · geography · skill) drives
 * every panel. Two related-question cards derive from it and vary exactly one
 * dimension each. Data flows downward only: cards never mutate the question
 * except through the explicit callbacks passed to them.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Meta, Row, Question, Subject, DEFAULT_QUESTION, SKILLS, PHRASE_CUM, PHRASE_EX,
  ROMAN, HEADLINE_LEVEL, HEADLINE_INDICATOR, SCHOOL_TYPE_INDICATOR, NATIONAL,
  BANDS, BAND_LABEL, bandForGrade, geoLevel, cutKey,
  normalize, yearsFor, gradesFor, skillLocked, phrase, qs,
} from "./lib/aser";
import { Cut, fetchCut, fetchDistrictsOf, fetchLadder, getMeta, trendSeries } from "./lib/api";
import { Sel, questionText } from "./components/shared";
import { RankingCard, HeroCard, LadderCard, DistrictBand } from "./components/cards";
import { TrendCard, TrendData, CompareCard } from "./components/related";
import { About } from "./about";

type Status = "loading" | "ready" | "empty" | "error";

export default function Home() {
  const [meta, setMeta] = useState<Meta | null>(null);
  const [q, setQ] = useState<Question>(DEFAULT_QUESTION);
  const [cut, setCut] = useState<Cut | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [ladder, setLadder] = useState<Map<number, Row[]> | null>(null);
  const [trend, setTrend] = useState<TrendData | null>(null);
  const [trendYears, setTrendYears] = useState<number[] | null>(null);
  const [districtCut, setDistrictCut] = useState<Cut | null>(null);
  const [dimension, setDimension] = useState("");
  const [pickedStates, setPickedStates] = useState<string[]>([]);
  const [tab, setTab] = useState<"explore" | "about">("explore");
  const [linkAdjusted, setLinkAdjusted] = useState(false);
  const request = useRef(0);
  const trendYearSignature = useRef("");

  const states = useMemo(
    () => meta?.geographies.filter(g => g.geographyType === "state").map(g => g.geography) ?? [],
    [meta]);
  const level = geoLevel(q);
  /** Districts offered are always those of the state currently in focus. */
  const focusState = q.parent || (q.geo !== "ALL" ? q.geo : "");
  /** Identity of the district band's row set — same shape as cutKey. */
  const districtKey = [q.subject, bandForGrade(q.grade), focusState].join("|");
  const districtsOfFocus = useMemo(
    () => (meta?.districts ?? []).filter(d => d.parentGeography === focusState).map(d => d.geography),
    [meta, focusState]);
  const set = (patch: Partial<Question>) => setQ(prev => normalize({ ...prev, ...patch }));

  /* Boot: catalogue, then restore any question carried in the URL. */
  useEffect(() => {
    getMeta().then(m => {
      setMeta(m);
      const params = new URLSearchParams(location.search);
      if (!params.size) return;
      // An absent parameter keeps its default; only a *present* one is read.
      // (Number(null) is 0, which is a valid rung — so absence must be explicit.)
      const num = (key: keyof Question, fallback: number) =>
        params.get(key) == null ? fallback : Number(params.get(key));
      const requested: Question = {
        year: num("year", DEFAULT_QUESTION.year),
        subject: (params.get("subject") ?? DEFAULT_QUESTION.subject) as Subject,
        grade: num("grade", DEFAULT_QUESTION.grade),
        school: (params.get("school") ?? DEFAULT_QUESTION.school) as Question["school"],
        geo: params.get("geo") && [...m.geographies.map(g => g.geography), ...m.districts.map(d => d.geography)]
          .includes(params.get("geo")!) ? params.get("geo")! : "ALL",
        parent: params.get("parent") ?? "",
        level: num("level", DEFAULT_QUESTION.level),
        mode: (params.get("mode") ?? DEFAULT_QUESTION.mode) as Question["mode"],
      };
      // P1-006: a hand-edited `parent` that does not own `geo` would produce a
      // contradictory district context. Trust the district catalogue, not the URL.
      const trueParent = m.districts.find(d => d.geography === requested.geo)?.parentGeography ?? "";
      if (requested.parent !== trueParent) requested.parent = trueParent;
      const restored = normalize(requested);
      setQ(restored);
      // Anything the normalizer had to change is reported, never applied silently.
      const changed = (Object.keys(restored) as (keyof Question)[])
        .filter(key => params.get(key) != null && String(restored[key]) !== params.get(key));
      if (changed.length) setLinkAdjusted(true);
    }).catch(() => setStatus("error"));
  }, []);

  /* The URL always mirrors the question, so any view is reproducible. */
  useEffect(() => {
    if (meta) history.replaceState(null, "", `?${qs(q as unknown as Record<string, string | number>)}`);
  }, [q, meta]);

  /* The answer to the big question. */
  useEffect(() => {
    if (!meta) return;
    const id = ++request.current;
    setStatus("loading");
    fetchCut(q)
      .then(result => {
        if (request.current !== id) return;
        setCut(result);
        setStatus(result?.rows.length ? "ready" : "empty");
      })
      .catch(() => {
        if (request.current !== id) return;
        setCut(null);
        setStatus("error");
      });
  // The scalar fields are the intentional request identity; depending on the
  // object itself would refetch on unrelated normalization object changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.year, q.subject, q.grade, q.school, q.level, q.mode, q.geo, q.parent, meta]);

  /* The 2024 ladder behind the answer. Districts publish no ladder. */
  useEffect(() => {
    if (!meta || q.school !== "All" || level === "district") { setLadder(null); return; }
    let live = true;
    fetchLadder(q.subject, q.grade)
      .then(result => live && setLadder(result))
      .catch(() => live && setLadder(null));
    return () => { live = false; };
  }, [q.subject, q.grade, q.school, level, meta]);

  /* Row 2: the districts of whichever state is in focus. */
  useEffect(() => {
    if (!meta || !focusState) { setDistrictCut(null); return; }
    let live = true;
    fetchDistrictsOf(focusState, q)
      .then(result => live && setDistrictCut(result && { ...result, key: districtKey }))
      .catch(() => live && setDistrictCut(null));
    return () => { live = false; };
  // fetchDistrictsOf reads subject and grade; the remaining question fields do
  // not change this 2024 grade-band cut and must not trigger duplicate queries.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusState, districtKey, q.subject, q.grade, meta]);

  /* Q2: the trend series for the current construct. */
  useEffect(() => {
    if (!meta) return;
    if (level === "district") { setTrend(null); return; }
    const indicator = q.school !== "All"
      ? SCHOOL_TYPE_INDICATOR[`${q.subject}|${q.grade}`]
      : (q.mode === "cum" && HEADLINE_LEVEL[q.subject][q.grade] === q.level && [3, 5, 8].includes(q.grade)
        ? HEADLINE_INDICATOR[`${q.subject}|${q.grade}`] : null);
    if (!indicator) { setTrend(null); return; }
    const subgroup = q.school !== "All" ? q.school : "All";
    let live = true;
    Promise.all([
      trendSeries(NATIONAL, indicator, subgroup),
      q.geo !== "ALL" ? trendSeries(q.geo, indicator, subgroup) : Promise.resolve({ rows: [], availability: "no_data" }),
    ]).then(([national, state]) => {
      if (!live) return;
      const years = [...new Set([...national.rows, ...state.rows].map(r => r.observationYear))].sort();
      if (years.length < 2) { setTrend(null); return; }
      const at = (rows: typeof national.rows, year: number) =>
        rows.find(r => r.observationYear === year);
      const valueAt = (rows: typeof national.rows, year: number) =>
        at(rows, year)?.numericValue ?? null;
      // 2012 comes from the ASER 2018 edition and later rounds from the 2024
      // edition, so each point keeps the page it was actually read from.
      const sourceAt = (rows: typeof national.rows, year: number) => {
        const row = at(rows, year);
        return row ? { page: row.pdfPageNumber, src: row.sourceUrl } : null;
      };
      const anchor = national.rows[0] ?? state.rows[0];
      setTrend({
        years,
        nat: years.map(y => valueAt(national.rows, y)),
        st: years.map(y => valueAt(state.rows, y)),
        natSource: years.map(y => sourceAt(national.rows, y)),
        stSource: years.map(y => sourceAt(state.rows, y)),
        page: anchor?.pdfPageNumber ?? 0,
        src: anchor?.sourceUrl ?? "",
      });
      // A narrowed selection survives while the available set holds; when the
      // construct changes the set, fall back to showing every published round.
      const signature = years.join();
      if (trendYearSignature.current !== signature) {
        trendYearSignature.current = signature;
        setTrendYears(null);
      }
    }).catch(() => live && setTrend(null));
    return () => { live = false; };
  }, [q.subject, q.grade, q.school, q.level, q.mode, q.geo, level, meta]);

  if (status === "error" && !meta) return (
    <main className="wrap">
      <Header tab={tab} setTab={setTab} />
      <p className="notice" role="alert">
        The data service is unavailable. No results are shown — nothing here is ever replaced by
        cached or reconstructed values.
      </p>
    </main>);

  // A card is only handed a result that answers the current question. Anything
  // else is a stale in-flight answer and is treated as "still loading", which
  // is what stops a district question rendering against state rows.
  const liveCut = cut && cut.key === cutKey(q) ? cut : null;
  const liveDistrictCut = districtCut && districtCut.key === districtKey ? districtCut : null;
  const rows = liveCut?.rows ?? [];
  const cutStatus: Status = liveCut ? status : status === "error" ? "error" : "loading";
  // P0-004: never infer a place from ranking order. A national question has no
  // host state; cards needing one must say so rather than silently analysing
  // whichever state happens to rank first.
  const host = q.geo !== "ALL" ? q.geo : "";

  return (
    <main className="wrap">
      <Header tab={tab} setTab={setTab} />
      {tab === "about" ? <About /> : (
        <>
          <section className="qbar" aria-label="The big question">
            <p className="lede">The big question</p>
            <p className="sentence">
              In <Sel label="Survey round" value={q.year} options={yearsFor(q).map(String)}
                onChange={v => set({ year: Number(v) })} />, what share of{" "}
              {level === "district"
                ? <Sel label="Grade band" value={bandForGrade(q.grade)} options={[...BANDS]}
                    labels={BANDS.map(b => BAND_LABEL[b])}
                    onChange={v => set({ grade: v === "III-V" ? 3 : 8 })} />
                : <Sel label="Grade" value={q.grade} options={gradesFor(q).map(String)}
                    labels={gradesFor(q).map(g => `Std ${ROMAN[g]}`)}
                    onChange={v => set({ grade: Number(v) })} />} children in{" "}
              <Sel label="School type" value={q.school} options={["All", "Govt", "Pvt"]}
                labels={["all schools", "government schools", "private schools"]}
                onChange={v => set({ school: v as Question["school"] })} />{" "}
              <GeoSel q={q} states={states} districts={districtsOfFocus}
                onChange={(geo, parent) => set({ geo, parent })} />{" "}
              {skillLocked(q) || level === "district"
                ? <b className="locked">{phrase(q)}</b>
                : <Sel label="Skill level" value={q.level} options={[0, 1, 2, 3, 4].map(String)}
                    labels={SKILLS[q.subject].map((_, i) =>
                      (q.mode === "cum" ? PHRASE_CUM : PHRASE_EX)[q.subject][i] ?? PHRASE_EX[q.subject][0])}
                    onChange={v => set({ level: Number(v) })} />}?
            </p>

            <div className="controls">
              <div className="seg" role="group" aria-label="Subject">
                {(["R", "A"] as Subject[]).map(subject => (
                  <button key={subject} aria-pressed={q.subject === subject}
                    onClick={() => set({ subject })}>{subject === "R" ? "Reading" : "Arithmetic"}</button>))}
              </div>
              {!skillLocked(q) && q.level > 0 && (
                <div className="seg" role="group" aria-label="Skill threshold">
                  <button aria-pressed={q.mode === "cum"} onClick={() => set({ mode: "cum" })}
                    title="This rung or any higher rung — how ASER frames its headline numbers">at least this level</button>
                  <button aria-pressed={q.mode === "ex"} onClick={() => set({ mode: "ex" })}
                    title="Exactly this rung of the ladder">exactly this level</button>
                </div>)}
              {q.geo !== "ALL" && (
                <button className="backlink" onClick={() => set({ geo: "ALL" })}>← Back to all states</button>)}
            </div>

            {q.school !== "All" && (
              <p className="hint"><b>School-type series.</b> Values cover children in government and private
                schools; “Govt &amp; Pvt (weighted)” is ASER’s weighted average of those two and excludes other
                school types. Published for Std III, V and VIII since 2012.</p>)}
            {q.school === "All" && q.year !== 2024 && (
              <p className="hint"><b>Why fewer choices?</b> The {q.year} round publishes the all-children headline
                for Std III, V and VIII. Rung-by-rung detail exists for 2024; the by-school-type series reaches
                back to 2012.</p>)}
            {linkAdjusted && (
              <p className="notice" role="alert"><b>Parts of this shared link were not available.</b> The explorer
                opened the nearest published view instead — nothing was silently substituted.</p>)}

            <p className="visually-hidden" role="status">
              {status === "loading" ? "Loading results."
                : status === "error" ? "The data service is unavailable. No results are shown."
                  : status === "empty" ? "This combination is not published. No results are shown."
                    : `${rows.length} ${level === "district" ? "districts" : "states"} available. ${questionText(q)}`}
            </p>
          </section>

          {/* Left: the ranked places, states above their districts, at one
              width so their bars share a visual scale. Right: the analysis
              rail — the headline, then the two related questions, then the
              distribution behind the number. */}
          <div className="grid">
            <div className="stack">
              <RankingCard q={q} cut={liveCut} status={cutStatus} onPick={geo => set({ geo })} />
              {/* When the ranking already lists districts, the band would repeat
                  it verbatim — so it is only shown from state or national scope. */}
              {level !== "district" && (
                <DistrictBand q={q} cut={liveDistrictCut} state={focusState}
                  onPick={(geo, parent) => set({ geo, parent })} />)}
            </div>
            <div className="stack">
              <HeroCard q={q} cut={liveCut} />
              <TrendCard q={q} trend={trend} selected={trendYears} onSelect={setTrendYears} onJump={set} />
              <CompareCard q={q} cut={liveCut} host={host} states={states}
                picked={pickedStates} setPicked={setPickedStates}
                active={dimension} onDimension={setDimension} />
              <LadderCard q={q} ladder={ladder} host={host} />
            </div>
          </div>
        </>)}

      <footer>
        ASER Data Explorer · independent, source-linked interface · consult the original ASER reports
        (ASER Centre / Pratham) for methodology and authoritative interpretation
      </footer>
    </main>);
}

/**
 * The geography slot is the whole hierarchy in one control: rural India, the
 * states, and — once a state is in focus — that state's districts. Choosing a
 * district carries its parent along, so the ranking always compares siblings.
 */
function GeoSel({ q, states, districts, onChange }: {
  q: Question; states: string[]; districts: string[];
  onChange: (geo: string, parent: string) => void;
}) {
  const focusState = q.parent || (q.geo !== "ALL" ? q.geo : "");
  return (
    <select aria-label="Geography" value={q.geo}
      onChange={e => {
        const value = e.target.value;
        onChange(value, districts.includes(value) ? focusState : "");
      }}>
      <option value="ALL">across rural India</option>
      <optgroup label="States">
        {states.map(state => <option key={state} value={state}>in {state}</option>)}
      </optgroup>
      {districts.length > 0 && (
        <optgroup label={`Districts of ${focusState} (2024)`}>
          {districts.map(district => (
            <option key={district} value={district}>in {district.replace(/ \(.*\)$/, "")}</option>))}
        </optgroup>)}
    </select>);
}

function Header({ tab, setTab }: { tab: string; setTab: (tab: "explore" | "about") => void }) {
  // Plain navigation buttons rather than ARIA tabs: the full tabs pattern needs
  // tabpanel, aria-controls and roving focus, and these two views are simple
  // sections. `aria-current` communicates the active one accurately.
  return (
    <header className="top">
      <h1 className="brand"><b>ASER</b> Data Explorer</h1>
      <nav className="tabs" aria-label="Sections">
        <button aria-current={tab === "explore" ? "page" : undefined}
          onClick={() => setTab("explore")}>Explore</button>
        <button aria-current={tab === "about" ? "page" : undefined}
          onClick={() => setTab("about")}>About the data</button>
      </nav>
    </header>);
}
