import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * One published observation — the only table the public API reads.
 *
 * The grain is: dataset × survey round × geography × indicator × subgroup.
 * Raw extraction, review queues and audit records live upstream and never
 * reach this database. Every row is independently citable: it carries the
 * document and page it was read from, its unit, and its comparability
 * designation, so no consumer has to infer provenance from context.
 *
 * Extending to another source (PARAKH/NAS, UDISE+) means inserting rows with a
 * new `dataset` slug — no schema change, no migration of existing rows.
 */
export const publicObservations = sqliteTable(
  "public_observations",
  {
    id: text("id").primaryKey(),
    /** Source dataset slug, e.g. "aser". Namespaces everything below it. */
    dataset: text("dataset").notNull().default("aser"),
    observationYear: integer("observation_year").notNull(),
    /** "national" | "state" | "district". The public web surface serves the first two. */
    geographyType: text("geography_type").notNull(),
    geography: text("geography").notNull(),
    /** Districts only: the state the district belongs to. Null otherwise. */
    parentGeography: text("parent_geography"),
    domain: text("domain").notNull(),
    indicator: text("indicator").notNull(),
    /** Population cut: "All", a grade, a school type, an age band, … */
    subgroupLabel: text("subgroup_label").notNull(),
    numericValue: real("numeric_value").notNull(),
    unit: text("unit").notNull(),
    pdfPageNumber: integer("pdf_page_number").notNull(),
    sourceUrl: text("source_url").notNull(),
    /** "directly_comparable" | "comparable_with_caveats". Never inferred by the UI. */
    comparability: text("comparability").notNull(),
  },
  (table) => [
    index("public_observations_filter_idx").on(
      table.observationYear, table.indicator, table.geographyType, table.subgroupLabel),
    index("public_observations_dataset_idx").on(
      table.dataset, table.geographyType, table.indicator, table.observationYear),
  ],
);
