/**
 * Dataset registry — the extension point for new data sources.
 *
 * Adding PARAKH/NAS assessment data or UDISE+ school records means adding one
 * entry here and inserting rows with that slug. Nothing in the API layer or the
 * chart components is ASER-specific; only `app/lib/aser.ts` encodes the ASER
 * question grammar, and a second source would add its own sibling module.
 *
 * Every field below is a claim the site makes on screen or in an export, so
 * each one must be checkable against the published source.
 */

export type GeographyLevel = "national" | "state" | "district";

export type DatasetDefinition = {
  /** Stable lowercase slug stored in `public_observations.dataset`. */
  slug: string;
  name: string;
  publisher: string;
  /** One sentence a non-specialist can read. */
  summary: string;
  /** How the underlying data is collected — matters for interpretation. */
  collection: "household survey" | "school census" | "school-based assessment";
  /** Population the dataset describes; the denominator of every share. */
  universe: string;
  geographyLevels: GeographyLevel[];
  /** Rounds this project treats as mutually comparable. */
  comparableRounds: number[];
  /** Rounds deliberately excluded, with the reason shown to users. */
  excludedRounds: Record<string, string>;
  /** Levels the public web surface currently serves. */
  servedGeographyLevels: GeographyLevel[];
  homepage: string;
  citation: string;
  licenceNote: string;
};

export const DATASETS: Record<string, DatasetDefinition> = {
  aser: {
    slug: "aser",
    name: "ASER — Annual Status of Education Report (Rural)",
    publisher: "ASER Centre / Pratham",
    summary:
      "A citizen-led household survey of children's schooling and foundational reading and " +
      "arithmetic across rural India, run since 2005.",
    collection: "household survey",
    universe: "children aged 5–16 in sampled rural households, assessed one-on-one at home",
    geographyLevels: ["national", "state", "district"],
    comparableRounds: [2012, 2014, 2016, 2018, 2022, 2024],
    excludedRounds: {
      2020: "phone-based round — different instrument and mode, not comparable",
      2021: "phone-based round — different instrument and mode, not comparable",
    },
    servedGeographyLevels: ["national", "state"],
    homepage: "https://asercentre.org/",
    citation:
      "ASER Centre (2025). Annual Status of Education Report (Rural) 2024. New Delhi: ASER Centre / Pratham.",
    licenceNote:
      "Figures are reproduced from the published reports for reference and analysis; " +
      "cite the original reports, which remain the authoritative source.",
  },
};

export const DEFAULT_DATASET = "aser";

export const datasetOf = (slug: string): DatasetDefinition =>
  DATASETS[slug] ?? DATASETS[DEFAULT_DATASET];

/** Datasets whose rows the public web surface may serve today. */
export const servedDatasets = (): DatasetDefinition[] => Object.values(DATASETS);
