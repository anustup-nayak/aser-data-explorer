import { observations, readContext, serviceError } from "../_data";

/** Full provenance for one cut: every value with its unit, comparability
 *  designation, source document and page — the citation trail for a quote.
 *  Scope comes from `scopeFor` so a district cut is filtered by its parent
 *  state exactly as Explorer does; a fixed state|national predicate would make
 *  every district query unsatisfiable. */
export async function GET(request: Request) {
  const context = readContext(request);
  if (context instanceof Response) return context;
  try {
    const rows = await (await observations()).lineage(context);
    return Response.json(
      { context, rows },
      { headers: { "Cache-Control": "public, max-age=300" } },
    );
  } catch (error) {
    return serviceError(error);
  }
}
