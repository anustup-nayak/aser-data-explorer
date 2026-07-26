/**
 * About the data: what ASER measures, how each learning outcome is assessed
 * (with the actual ASER task items), which constructs this explorer serves,
 * provenance, precision caveats, and how to navigate & cite.
 */
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
        <li><b>All-children measures</b> (the default): every surveyed child in the grade,
        whatever school they attend. Published 2018, 2022, 2024 (state and national), plus full
        rung-by-rung ladders for 2024.</li>
        <li><b>School-type series</b>: government-school and private-school children separately,
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
    </article>
  );
}
