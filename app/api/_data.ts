import { getObservationRepository } from "../../db/observations";

/**
 * Shared request parsing and guards for the public data API.
 *
 * Public surface rule: national/state results are comparable only with their
 * own geography level; district requests require an explicit parent state.
 */

export const PUBLIC_GEOGRAPHY_TYPES = ["state", "national", "district"] as const;
export type GeographyType = (typeof PUBLIC_GEOGRAPHY_TYPES)[number];

export type QueryContext = {
  year: number; indicator: string; geographyType: GeographyType; subgroup: string;
  /** District queries are always scoped to one state — districts are compared with their peers. */
  parent: string | null;
};

const SURVEY_YEARS = [2012, 2014, 2016, 2018, 2022, 2024];

/**
 * Longest accepted free-text parameter. Published indicator names run to about
 * 60 characters; this bounds the request without rejecting any real query, and
 * stops an oversized string being echoed back in the response.
 */
const MAX_TEXT = 120;

/** Rejects an over-long value before it reaches a query or an echoed context. */
function tooLong(name: string, value: string | null | undefined): Response | null {
  return value && value.length > MAX_TEXT
    ? fail(`${name} is longer than ${MAX_TEXT} characters.`)
    : null;
}

export function readContext(request: Request): QueryContext | Response {
  const url = new URL(request.url);
  const rawYear = url.searchParams.get("year");
  const year = Number(rawYear);
  const indicator = url.searchParams.get("indicator")?.trim();
  const geographyType = url.searchParams.get("geographyType")?.trim() || "state";
  const subgroup = url.searchParams.get("subgroup")?.trim() || "All";

  for (const [name, value] of [["indicator", indicator], ["subgroup", subgroup],
    ["geographyType", geographyType], ["parent", url.searchParams.get("parent")]] as const) {
    const over = tooLong(name, value);
    if (over) return over;
  }
  if (!rawYear || !Number.isInteger(year))
    return fail("A valid four-digit survey year is required.");
  if (!SURVEY_YEARS.includes(year))
    return fail(`ASER was surveyed comparably in ${SURVEY_YEARS.join(", ")}. No data exists for ${year}.`);
  if (!indicator) return fail("An indicator is required.");
  if (!isPublicGeographyType(geographyType))
    return fail("geographyType must be national, state or district.");

  const parent = url.searchParams.get("parent")?.trim() || null;
  if (geographyType === "district" && !parent)
    return fail("District queries must name a parent state — districts are only compared within their state.");
  if (geographyType !== "district" && parent)
    return fail("parent applies to district queries only.");
  return { year, indicator, geographyType, subgroup, parent };
}

export function isPublicGeographyType(value: string): value is GeographyType {
  return (PUBLIC_GEOGRAPHY_TYPES as readonly string[]).includes(value);
}

export function fail(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function serviceError(error: unknown) {
  console.error("ASER public-data query failed", error);
  return Response.json(
    { error: "The approved data service is temporarily unavailable. Please try again." },
    { status: 503 },
  );
}

/**
 * SQL fragment constraining a query to the state-level web surface. District
 * rows are served only through an explicitly parented district query, so they
 * can never leak into a state ranking or the catalogue of comparable places.
 */
export const PUBLIC_SCOPE = "geography_type IN ('state','national')";

/** Scope + binding for one context, including the district parent filter. */
export function scopeFor(context: QueryContext): { sql: string; params: unknown[] } {
  return context.geographyType === "district"
    ? { sql: "geography_type = 'district' AND parent_geography = ?", params: [context.parent] }
    : { sql: PUBLIC_SCOPE, params: [] };
}

/** The only database entry point available to API routes. */
export const observations = getObservationRepository;
