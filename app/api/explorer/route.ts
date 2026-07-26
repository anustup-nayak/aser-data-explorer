import { observations, readContext, serviceError } from "../_data";

/** Ranked values for one measure, round, geography level and subgroup.
 *  District queries are scoped to their parent state by `scopeFor`. */
export async function GET(request: Request) {
  const context = readContext(request);
  if (context instanceof Response) return context;
  try {
    const rows = await (await observations()).explorer(context);
    return Response.json(
      { context, rows, availability: rows.length ? "available" : "no_approved_data" },
      { headers: { "Cache-Control": "public, max-age=300" } },
    );
  } catch (error) {
    return serviceError(error);
  }
}
