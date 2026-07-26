import { neon } from "@neondatabase/serverless";
import postgres, { type Row, type Sql } from "postgres";

export type ObservationCut = {
  year: number;
  indicator: string;
  geographyType: "state" | "national" | "district";
  subgroup: string;
  parent: string | null;
};

export type MetadataRows = {
  indicators: Record<string, unknown>[];
  geographies: Record<string, unknown>[];
  availability: Record<string, unknown>[];
  coverage: Record<string, unknown>[];
  sources: Record<string, unknown>[];
  integrity: Record<string, unknown>[];
  districts: Record<string, unknown>[];
};

/**
 * Stable data port consumed by the API routes.
 *
 * UI components and route handlers do not import a database driver. A provider
 * change therefore cannot alter the question model, view models or visual
 * grammar. The methods mirror user-visible analytical surfaces, which also
 * gives the D1/PostgreSQL parity suite an explicit contract to compare.
 */
export interface ObservationRepository {
  metadata(): Promise<MetadataRows>;
  explorer(cut: ObservationCut): Promise<Record<string, unknown>[]>;
  lineage(cut: ObservationCut): Promise<Record<string, unknown>[]>;
  exportRows(cut: ObservationCut): Promise<Record<string, unknown>[]>;
  profile(geography: string): Promise<Record<string, unknown>[]>;
  trends(geography: string, indicator: string, subgroup: string): Promise<Record<string, unknown>[]>;
}

type QueryExecutor = (
  query: string,
  parameters?: unknown[],
) => Promise<Record<string, unknown>[]>;

const PUBLIC_SCOPE = "geography_type IN ('state','national')";

function cutWhere(cut: ObservationCut, firstParameter = 1) {
  const values: unknown[] = [cut.year, cut.indicator, cut.geographyType, cut.subgroup];
  const parent = cut.geographyType === "district"
    ? ` AND geography_type = 'district' AND parent_geography = $${firstParameter + 4}`
    : ` AND ${PUBLIC_SCOPE}`;
  if (cut.geographyType === "district") values.push(cut.parent);
  return { parent, values };
}

/**
 * Standard PostgreSQL implementation. Neon is the approved first host, but no
 * Neon-specific API or schema feature is used.
 */
export class SqlObservationRepository implements ObservationRepository {
  constructor(private readonly execute: QueryExecutor) {}

  private async rows<T extends Row = Row>(query: string, parameters: unknown[] = []) {
    return this.execute(query, parameters) as Promise<T[]>;
  }

  async metadata(): Promise<MetadataRows> {
    const queries = [
      this.rows(`SELECT indicator, domain, unit,
          COUNT(*)::int AS observations,
          COUNT(DISTINCT geography)::int AS geographies,
          COUNT(DISTINCT observation_year)::int AS years,
          MIN(observation_year) AS "firstYear", MAX(observation_year) AS "lastYear",
          STRING_AGG(DISTINCT observation_year::text, ',' ORDER BY observation_year::text) AS "yearList",
          STRING_AGG(DISTINCT subgroup_label, ',' ORDER BY subgroup_label) AS "subgroupList",
          STRING_AGG(DISTINCT comparability, ',' ORDER BY comparability) AS "comparabilityList",
          ROUND(MIN(numeric_value)::numeric, 1)::double precision AS "minValue",
          ROUND(MAX(numeric_value)::numeric, 1)::double precision AS "maxValue"
        FROM public_observations WHERE ${PUBLIC_SCOPE}
        GROUP BY indicator, domain, unit ORDER BY domain, indicator`),
      this.rows(`SELECT geography, geography_type AS "geographyType",
          COUNT(*)::int AS observations,
          COUNT(DISTINCT observation_year)::int AS years,
          MIN(observation_year) AS "firstYear", MAX(observation_year) AS "lastYear"
        FROM public_observations WHERE ${PUBLIC_SCOPE}
        GROUP BY geography, geography_type ORDER BY geography_type, geography`),
      this.rows(`SELECT DISTINCT indicator, domain, observation_year AS year,
          subgroup_label AS subgroup, geography_type AS "geographyType"
        FROM public_observations WHERE ${PUBLIC_SCOPE}
        ORDER BY domain, indicator, year DESC, subgroup`),
      this.rows(`SELECT COUNT(*)::int AS observations,
          COUNT(DISTINCT observation_year)::int AS years,
          COUNT(DISTINCT geography)::int AS geographies,
          COUNT(DISTINCT indicator)::int AS indicators,
          COUNT(DISTINCT source_url)::int AS "sourceDocuments",
          MIN(observation_year) AS "firstYear", MAX(observation_year) AS "lastYear"
        FROM public_observations WHERE ${PUBLIC_SCOPE}`),
      this.rows(`SELECT source_url AS "sourceUrl", COUNT(*)::int AS observations,
          MIN(pdf_page_number) AS "firstPage", MAX(pdf_page_number) AS "lastPage",
          STRING_AGG(DISTINCT observation_year::text, ',' ORDER BY observation_year::text) AS "yearList"
        FROM public_observations WHERE ${PUBLIC_SCOPE}
        GROUP BY source_url ORDER BY observations DESC`),
      this.rows(`SELECT
          COUNT(*) FILTER (WHERE source_url IS NULL OR source_url = '')::int AS "missingSourceUrl",
          COUNT(*) FILTER (WHERE pdf_page_number IS NULL OR pdf_page_number < 1)::int AS "missingPage",
          COUNT(*) FILTER (WHERE numeric_value IS NULL OR numeric_value < 0 OR numeric_value > 100)::int AS "outOfRange",
          COUNT(*) FILTER (WHERE unit IS NULL OR unit = '')::int AS "missingUnit",
          COUNT(*) FILTER (WHERE comparability NOT IN ('directly_comparable','comparable_with_caveats'))::int AS "badComparability"
        FROM public_observations WHERE ${PUBLIC_SCOPE}`),
      this.rows(`SELECT geography, parent_geography AS "parentGeography",
          COUNT(*)::int AS observations
        FROM public_observations WHERE geography_type = 'district'
        GROUP BY geography, parent_geography ORDER BY parent_geography, geography`),
    ] as const;
    const [indicators, geographies, availability, coverage, sources, integrity, districts] =
      await Promise.all(queries);
    return { indicators, geographies, availability, coverage, sources, integrity, districts };
  }

  explorer(cut: ObservationCut) {
    const { parent, values } = cutWhere(cut);
    return this.rows(`SELECT geography, numeric_value AS "numericValue",
        pdf_page_number AS "pdfPageNumber", source_url AS "sourceUrl", unit,
        comparability, domain, indicator, subgroup_label AS "subgroupLabel"
      FROM public_observations
      WHERE observation_year = $1 AND indicator = $2 AND geography_type = $3
        AND subgroup_label = $4${parent}
      ORDER BY numeric_value DESC, geography`, values);
  }

  lineage(cut: ObservationCut) {
    const { parent, values } = cutWhere(cut);
    return this.rows(`SELECT geography, numeric_value AS "numericValue", unit, domain,
        indicator, subgroup_label AS "subgroupLabel", comparability,
        pdf_page_number AS "pdfPageNumber", source_url AS "sourceUrl"
      FROM public_observations
      WHERE observation_year = $1 AND indicator = $2 AND geography_type = $3
        AND subgroup_label = $4${parent}
      ORDER BY geography`, values);
  }

  exportRows(cut: ObservationCut) {
    const { parent, values } = cutWhere(cut);
    return this.rows(`SELECT observation_year, geography_type, geography, domain, indicator,
        subgroup_label, numeric_value, unit, pdf_page_number, source_url, comparability
      FROM public_observations
      WHERE observation_year = $1 AND indicator = $2 AND geography_type = $3
        AND subgroup_label = $4${parent}
      ORDER BY geography`, values);
  }

  profile(geography: string) {
    return this.rows(`SELECT observation_year AS "observationYear", domain, indicator,
        subgroup_label AS "subgroupLabel", numeric_value AS "numericValue", unit,
        pdf_page_number AS "pdfPageNumber", source_url AS "sourceUrl", comparability
      FROM public_observations
      WHERE geography = $1 AND ${PUBLIC_SCOPE}
      ORDER BY observation_year DESC, domain, indicator`, [geography]);
  }

  trends(geography: string, indicator: string, subgroup: string) {
    return this.rows(`SELECT observation_year AS "observationYear",
        numeric_value AS "numericValue", unit, comparability,
        pdf_page_number AS "pdfPageNumber", source_url AS "sourceUrl"
      FROM public_observations
      WHERE geography = $1 AND indicator = $2 AND subgroup_label = $3 AND ${PUBLIC_SCOPE}
      ORDER BY observation_year`, [geography, indicator, subgroup]);
  }
}

let repository: ObservationRepository | null = null;

/** One lazy pool per server process; no connection is opened during build. */
export async function getObservationRepository(): Promise<ObservationRepository> {
  if (repository) return repository;
  const url = process.env.DATABASE_URL;
  if (!url)
    throw new Error("DATABASE_URL is required for the ASER observation repository.");
  const hostname = new URL(url).hostname;
  if (hostname.endsWith(".neon.tech")) {
    const sql = neon(url);
    repository = new SqlObservationRepository(async (query, parameters = []) =>
      [...await sql.query(query, parameters as never[])] as Record<string, unknown>[]);
  } else {
    const sql: Sql = postgres(url, {
      max: 3,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      connect_timeout: 10,
      prepare: false,
    });
    repository = new SqlObservationRepository(async (query, parameters = []) =>
      [...await sql.unsafe<Row[]>(query, parameters as never[])] as Record<string, unknown>[]);
  }
  return repository;
}
