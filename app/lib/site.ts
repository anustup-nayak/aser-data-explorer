export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "https://aser-data-explorer.vercel.app").replace(/\/$/, "");

export const SITE_TITLE = "ASER Data Explorer — Rural India Learning Data";

export const SITE_DESCRIPTION =
  "Explore source-linked ASER reading and arithmetic data for rural India, states, and districts across comparable survey rounds from 2012 to 2024. Independent and unofficial.";

export const SOURCE_REPORTS = [
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
