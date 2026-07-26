import { observations, serviceError } from "../_data";

/**
 * Catalogue and data dictionary for the public surface.
 *
 * This endpoint is deliberately verbose: it is both what the UI builds its
 * controls from and the manifest a reviewer uses to pressure-test the database
 * without SQL access. It reports, per indicator, the construct it belongs to,
 * its population denominator, the rounds and subgroups it covers, its value
 * range, and its source documents — so any claim made on screen can be checked
 * against the catalogue, and any gap is visible rather than implied.
 */
export async function GET() {
  try {
    const { indicators, geographies, availability, coverage, sources, integrity, districts } =
      await (await observations()).metadata();

    const split = (value: unknown) =>
      String(value ?? "").split(",").filter(Boolean).sort();

    return Response.json(
      {
        /** Human-readable description of the constructs a consumer must not mix. */
        constructs: {
          allChildren: {
            description: "Every surveyed child in the grade, whatever school they attend.",
            denominator: "all children enrolled in that grade in rural households surveyed",
            indicatorPattern: "% Std <grade> children who … / % children at <rung> … distribution by grade",
            rounds: [2018, 2022, 2024],
          },
          bySchoolType: {
            description:
              "Children in government and private schools reported separately. " +
              "'Govt & Pvt (weighted)' is ASER's weighted average of those two groups only " +
              "and therefore differs from the all-children figure.",
            denominator: "children in the named school type",
            indicatorPattern: "Std <grade>: % children …",
            rounds: [2012, 2014, 2016, 2018, 2022, 2024],
          },
          districtGradeBand: {
            description:
              "2024 district estimates, reported over grade bands rather than single grades. " +
              "Present in the database but not served on the public web surface.",
            denominator: "all children in the grade band",
            indicatorPattern: "Std III-V: … / Std VI-VIII: …",
            rounds: [2024],
            servedByThisApi: true,
            note: "Served only through a parented district query; never mixed into state rankings.",
          },
        },
        /** Survey rounds this dataset treats as mutually comparable. */
        surveyRounds: {
          comparable: [2012, 2014, 2016, 2018, 2022, 2024],
          excluded: {
            "2020": "phone-based round — different instrument and mode, not comparable",
            "2021": "phone-based round — different instrument and mode, not comparable",
          },
        },
        indicators: indicators.map((row: Record<string, unknown>) => ({
          ...row,
          yearList: split(row.yearList).map(Number),
          subgroupList: split(row.subgroupList),
          comparabilityList: split(row.comparabilityList),
        })),
        geographies,
        /** 2024 district estimates, grouped by their state. Grade-band constructs. */
        districts,
        availability,
        coverage: coverage[0] ?? null,
        sources: sources.map((row: Record<string, unknown>) => ({
          ...row,
          yearList: split(row.yearList).map(Number),
        })),
        /** Every counter here must be 0 for the release to be publishable. */
        integrity: integrity[0] ?? null,
      },
      { headers: { "Cache-Control": "public, max-age=300" } },
    );
  } catch (error) {
    return serviceError(error);
  }
}
