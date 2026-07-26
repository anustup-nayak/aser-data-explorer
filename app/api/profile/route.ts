import { observations, fail, serviceError } from "../_data";

/** Everything published for one geography, newest round first. */
export async function GET(request: Request) {
  const geography = new URL(request.url).searchParams.get("geography")?.trim();
  if (!geography) return fail("A geography is required.");
  if (geography.length > 120) return fail("geography is longer than 120 characters.");
  try {
    const rows = await (await observations()).profile(geography);
    return Response.json(
      { geography, rows, availability: rows.length ? "available" : "no_approved_data" },
      { headers: { "Cache-Control": "public, max-age=300" } },
    );
  } catch (error) {
    return serviceError(error);
  }
}
