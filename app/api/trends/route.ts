import { observations, fail, serviceError } from "../_data";

/**
 * Time series for one geography and measure.
 *
 * A series is served only when it has at least two points and every point is
 * designated comparable. The availability code distinguishes *why* a series is
 * withheld, so the UI can explain itself instead of showing an empty chart:
 *   available          — two or more comparable rounds
 *   single_observation — the measure exists, but for one round only
 *   not_comparable     — several rounds exist but are not designated comparable
 *   no_data            — nothing published for this combination
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const geography = url.searchParams.get("geography")?.trim();
  const indicator = url.searchParams.get("indicator")?.trim();
  const subgroup = url.searchParams.get("subgroup")?.trim() || "All";
  if (!geography) return fail("A geography is required.");
  if (!indicator) return fail("An indicator is required.");
  for (const [name, value] of [["geography", geography], ["indicator", indicator], ["subgroup", subgroup]] as const)
    if (value.length > 120) return fail(`${name} is longer than 120 characters.`);

  try {
    const rows = await (await observations()).trends(geography, indicator, subgroup);
    const comparable = rows.every((row) =>
      ["directly_comparable", "comparable_with_caveats"].includes(String(row.comparability)));
    const availability =
      rows.length === 0 ? "no_data"
        : rows.length === 1 ? "single_observation"
          : !comparable ? "not_comparable"
            : "available";

    return Response.json(
      { geography, indicator, subgroup, rows: availability === "available" ? rows : [], availability },
      { headers: { "Cache-Control": "public, max-age=300" } },
    );
  } catch (error) {
    return serviceError(error);
  }
}
