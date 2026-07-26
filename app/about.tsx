"use client";

import type { FormEvent } from "react";

const REPORTS = [
  {
    year: 2012,
    pdf: "https://img.asercentre.org/docs/Publications/ASER%20Reports/ASER_2012/fullaser2012report.pdf",
    page: "https://asercentre.org/aser-2012/",
    lineage: "Explorer cells are read from the retrospective tables in the ASER 2018 report.",
  },
  {
    year: 2014,
    pdf: "https://img.asercentre.org/docs/Publications/ASER%20Reports/ASER%202014/fullaser2014mainreport_1.pdf",
    page: "https://asercentre.org/aser-2014/",
    lineage: "Explorer cells are read from cited retrospective tables in the ASER 2018 or 2024 report.",
  },
  {
    year: 2016,
    pdf: "https://img.asercentre.org/docs/Publications/ASER%20Reports/ASER%202016/aser_2016.pdf",
    page: "https://asercentre.org/aser-2016/",
    lineage: "Explorer cells are read from cited retrospective tables in the ASER 2018 or 2024 report.",
  },
  {
    year: 2018,
    pdf: "https://asercentre.org/wp-content/uploads/2022/12/ASER-report_2018-1.pdf",
    page: "https://asercentre.org/aser-2018/",
    lineage: "Explorer cells retain the exact ASER 2018 or 2024 table and page used.",
  },
  {
    year: 2022,
    pdf: "https://asercentre.org/wp-content/uploads/2022/12/ASER-report_2022-1.pdf",
    page: "https://asercentre.org/aser-2022/",
    lineage: "Explorer cells are read from the retrospective tables in the ASER 2024 report.",
  },
  {
    year: 2024,
    pdf: "https://asercentre.org/wp-content/uploads/2022/12/ASER_2024_Final-Report_13_2_24-1.pdf",
    page: "https://asercentre.org/aser-2024/",
    lineage: "State and national cells use the full report; each district row links its own state estimates PDF.",
  },
] as const;

/**
 * About the data: what ASER measures, how each learning outcome is assessed
 * (with the actual ASER task items), which constructs this explorer serves,
 * provenance, precision caveats, and how to navigate & cite.
 */
function submitFeedback(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const category = String(form.get("category") ?? "Feedback");
  const summary = String(form.get("summary") ?? "").trim();
  const details = String(form.get("details") ?? "").trim();
  const issue = new URL("https://github.com/anustup-nayak/aser-data-explorer/issues/new");
  issue.searchParams.set("title", `[${category}] ${summary}`);
  issue.searchParams.set("body", [
    `### Category\n${category}`,
    `### Feedback\n${details}`,
    `### Page\n${window.location.href}`,
    "_Please do not include personal, confidential, or sensitive information in this public issue._",
  ].join("\n\n"));
  window.open(issue, "_blank", "noopener,noreferrer");
}

export function About() {
  return (
    <article className="about">
      <h2>What this site is</h2>
      <p>
        An independent, source-linked explorer for learning data from <b>ASER</b> (the Annual
        Status of Education Report), the citizen-led household survey run across rural India by
        the ASER Centre and Pratham since 2005. Every number shown here links to the exact page
        of the ASER report it was taken from. This is not an official Pratham or ASER website,
        and the original reports remain the authoritative source.
      </p>

      <h2>Two-minute user guide</h2>
      <ol className="guide">
        <li><b>Build the question.</b> Use the highlighted sentence from left to right: survey
        round, grade (or district grade band), school type, geography, and skill. Government
        schools are the default because they provide the longest series. Changing any dropdown
        redraws every answer; unavailable combinations are not offered.</li>
        <li><b>Choose the measure.</b> Switch between Reading and Arithmetic. “At least this
        level” counts the chosen rung and every higher rung; “exactly this level” counts only
        that rung.</li>
        <li><b>State or district comparison.</b> The ranked horizontal bars run from highest to
        lowest for comparable places. Click a place to open its profile. Rank is descriptive,
        not proof that a school system caused the difference.</li>
        <li><b>Headline strip.</b> This restates the selected place’s value and rank, with the
        published India/state anchor and highest and lowest peers for context.</li>
        <li><b>Trend line.</b> “Has this changed over time?” appears automatically when at least
        two comparable rounds exist. Toggle year buttons to set the range; every dot prints its
        value. Read it as change between different cohorts, not progress by the same children.</li>
        <li><b>Comparison bars.</b> In “How does this compare?”, choose the comparison dropdown
        (school types, selected places, subject, or all children). The “Holding constant” line
        names what did not change; add or remove places where offered.</li>
        <li><b>Skill ladder and districts.</b> The ladder partitions all children across
        mutually exclusive skill rungs; highlighted rungs make up the headline measure. It is
        available for all-school 2024 state views. District cards use ASER’s separate 2024 grade
        bands and should not be compared directly with a single-grade state result.</li>
        <li><b>Check and reuse.</b> Open “View as table” for exact values, follow the source/page
        link to the report, or download CSV/PNG. The URL updates with every choice, so copying it
        shares the same view.</li>
      </ol>

      <h2>How ASER measures learning — the actual tasks</h2>
      <p>
        ASER assesses children aged 5–16 <b>at home, one-on-one</b> — not in school — so children
        who are out of school are reached too. Each child attempts a short progressive tool and is
        placed on the highest rung they can do comfortably. The tools have kept the same design
        since 2005, which is what makes trends meaningful.
      </p>
      <h3>The reading ladder (assessed in 19+ languages)</h3>
      <ol className="toolList">
        <li><b>Not yet at letters</b> — cannot reliably recognise letters.</li>
        <li><b>Letters</b> — recognises letters of the alphabet.</li>
        <li><b>Words</b> — reads common, familiar words.</li>
        <li><b>Std I paragraph</b> — reads a short, simple 4-line passage at first-grade difficulty.</li>
        <li><b>Std II story</b> — reads a longer story at second-grade difficulty. <i>"Can read a
        Std II-level story" is ASER's proxy for grade-level reading.</i></li>
      </ol>
      <h3>The arithmetic ladder</h3>
      <ol className="toolList">
        <li><b>Not yet at 1–9</b> — cannot reliably recognise single-digit numbers.</li>
        <li><b>Numbers 1–9</b> — recognises numbers up to 9.</li>
        <li><b>Numbers 11–99</b> — recognises two-digit numbers.</li>
        <li><b>Subtraction</b> — solves a 2-digit by 2-digit subtraction <i>with borrowing</i>
        (expected of children by Std II in most states).</li>
        <li><b>Division</b> — solves a 3-digit by 1-digit division problem (expected around Std III–IV).</li>
      </ol>
      <p>
        The ladder is exclusive: each child sits on exactly one rung, and a grade's rungs total
        100%. "At least this level" adds a rung and everything above it — that is exactly how
        ASER's own headline figures are constructed.
      </p>

      <h2>The three constructs in this dataset — never mixed</h2>
      <ul>
        <li><b>All-children measures</b>: every surveyed child in the grade,
        whatever school they attend. Published 2018, 2022, 2024 (state and national), plus full
        rung-by-rung ladders for 2024.</li>
        <li><b>School-type series</b> (the default view): government-school and private-school children separately,
        with ASER's <i>"Govt &amp; Pvt (weighted)"</i> average of the two. This average excludes
        children in other school types, so it differs slightly from the all-children figure.
        Published for Std III, V and VIII back to <b>2012</b> — the longest comparable series here.</li>
        <li><b>District estimates</b> (2024): grade-band measures (Std III–V, Std VI–VIII) with
        wider uncertainty. Choose a state, then one of its districts, to see them. Because the
        bands differ from the single-grade state series, a district figure is not directly
        comparable with a state figure — compare districts with each other and with their own
        state.</li>
      </ul>

      <h2>Comparability, precision, and honest gaps</h2>
      <ul>
        <li>Survey rounds shown: <b>2012, 2014, 2016, 2018, 2022, 2024</b> (where published).
        The 2020–21 phone-based rounds used a different method and are excluded from trends.</li>
        <li>ASER suppresses estimates where samples are too small ("data is not presented…").
        Those cells are absent here too — <b>missing is never shown as zero</b>, and a series
        with a gap keeps its gap.</li>
        <li>State boundaries: ASER publishes boundary-adjusted series for Telangana and Andhra
        Pradesh back to 2012 (post-2014 boundaries), which is what you see here.</li>
        <li>Estimates carry sampling uncertainty (roughly ±2–4 points for state figures; more
        for districts). Treat small differences and single-round movements with caution.</li>
        <li>A trend compares <i>different cohorts</i> of children in each round — it is not the
        progress of the same children.</li>
      </ul>

      <h2>How to navigate</h2>
      <ol>
        <li><b>Build the big question</b> in the sentence at the top: year, grade, school type,
        geography, and skill. Options only ever offer published combinations.</li>
        <li><b>Read the answer three ways</b>: the state ranking (evidence), the headline number
        with its rank badge, and the skill ladder (the full distribution behind the number).</li>
        <li><b>Ask the related questions</b>: has this changed over time (pick your rounds), and
        how does it compare — across school types, between states, between subjects.</li>
        <li><b>Take it with you</b>: every chart downloads as a deck-ready image card and as CSV
        carrying the question, construct, source URL and page.</li>
      </ol>

      <h2>How to cite</h2>
      <p className="cite">
        Cite the original reports, not this site: <i>ASER Centre (2025). Annual Status of
        Education Report (Rural) 2024. New Delhi: ASER Centre / Pratham.</i> — and equivalently
        for ASER 2018. Report PDFs: asercentre.org. When quoting a number found here, the
        matching report page is linked beside it.
      </p>

      <h2>Official reports by survey year</h2>
      <p>
        These are the exact official full-report links for every round shown here. The explorer
        may use a later report’s retrospective trend table for an earlier survey year; each
        on-screen value therefore keeps the report edition and page actually used.
      </p>
      <ul className="reportList">
        {REPORTS.map(report => (
          <li key={report.year}>
            <b>ASER {report.year}</b>:{" "}
            <a href={report.pdf} target="_blank" rel="noopener noreferrer">full report PDF ↗</a>
            {" · "}
            <a href={report.page} target="_blank" rel="noopener noreferrer">official year page ↗</a>.
            {" "}{report.lineage}
          </li>
        ))}
      </ul>

      <h2>Feedback and corrections</h2>
      <p>
        Found a data issue, accessibility problem, or useful improvement? This short form opens a
        public GitHub issue for you to review and submit. Please do not include personal,
        confidential, or sensitive information. If you do not use GitHub, email{" "}
        <a href="mailto:anustup.nayak@gmail.com">anustup.nayak@gmail.com</a>.
      </p>
      <form className="feedback" onSubmit={submitFeedback}>
        <label>
          Type
          <select name="category" defaultValue="Data issue">
            <option>Data issue</option>
            <option>Bug</option>
            <option>Accessibility</option>
            <option>Suggestion</option>
            <option>Documentation</option>
          </select>
        </label>
        <label>
          Short summary
          <input name="summary" required maxLength={120} />
        </label>
        <label>
          What happened, or what should improve?
          <textarea name="details" required rows={5} maxLength={4000} />
        </label>
        <button type="submit">Continue to GitHub</button>
      </form>

      <h2>Privacy</h2>
      <p>
        The site uses Vercel Web Analytics for aggregate page-view statistics such as pages,
        referrers, country, operating system, device type, and browser. Vercel states that this
        service does not use cookies and does not associate events with a persistent personal
        identifier. No custom events are collected. Read{" "}
        <a href="https://vercel.com/docs/analytics/privacy-policy"
          target="_blank" rel="noopener noreferrer">Vercel&apos;s analytics privacy documentation</a>.
        Feedback is sent only when you continue to GitHub and submit the public issue, or email it.
      </p>
    </article>
  );
}
