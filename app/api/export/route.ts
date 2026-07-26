import { observations, readContext, serviceError } from "../_data";

/** CSV of one cut, carrying the same lineage columns shown on screen so a
 *  downloaded file can be cited without returning to the site. */
const COLUMNS = [
  "observation_year", "geography_type", "geography", "domain", "indicator",
  "subgroup_label", "numeric_value", "unit", "pdf_page_number", "source_url", "comparability",
];

const cell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET(request: Request) {
  const context = readContext(request);
  if (context instanceof Response) return context;
  let rows: Record<string, unknown>[];
  try {
    rows = await (await observations()).exportRows(context);
  } catch (error) {
    return serviceError(error);
  }
  const body = [
    COLUMNS.join(","),
    ...rows.map((row: Record<string, unknown>) =>
      COLUMNS.map((key) => cell(row[key])).join(",")),
  ].join("\n");
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="aser-${context.year}-filtered.csv"`,
      "Cache-Control": "public, max-age=300",
    },
  });
}
