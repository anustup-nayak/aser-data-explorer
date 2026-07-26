-- PostgreSQL production schema for the public ASER release.
--
-- This preserves the existing observation grain and column meanings. The
-- additional checks make corruption fail at import time rather than leak into
-- charts. It uses no Neon-specific feature and can be restored to standard
-- PostgreSQL, including Supabase.

CREATE TABLE IF NOT EXISTS public_observations (
  id text PRIMARY KEY,
  dataset text NOT NULL DEFAULT 'aser',
  observation_year integer NOT NULL CHECK (observation_year BETWEEN 2000 AND 2100),
  geography_type text NOT NULL CHECK (geography_type IN ('national', 'state', 'district')),
  geography text NOT NULL CHECK (length(geography) BETWEEN 1 AND 120),
  parent_geography text,
  domain text NOT NULL CHECK (length(domain) BETWEEN 1 AND 120),
  indicator text NOT NULL CHECK (length(indicator) BETWEEN 1 AND 240),
  subgroup_label text NOT NULL CHECK (length(subgroup_label) BETWEEN 1 AND 120),
  numeric_value double precision NOT NULL CHECK (numeric_value BETWEEN 0 AND 100),
  unit text NOT NULL CHECK (unit = 'percent'),
  pdf_page_number integer NOT NULL CHECK (pdf_page_number > 0),
  source_url text NOT NULL CHECK (source_url ~ '^https://asercentre[.]org/'),
  comparability text NOT NULL
    CHECK (comparability IN ('directly_comparable', 'comparable_with_caveats')),
  CONSTRAINT public_observations_parent_scope_check CHECK (
    (geography_type = 'district' AND parent_geography IS NOT NULL AND length(parent_geography) > 0)
    OR
    (geography_type <> 'district' AND parent_geography IS NULL)
  ),
  CONSTRAINT public_observations_grain_unique UNIQUE (
    dataset, observation_year, geography_type, geography, indicator, subgroup_label
  )
);

CREATE INDEX IF NOT EXISTS public_observations_filter_idx
  ON public_observations (observation_year, indicator, geography_type, subgroup_label);

CREATE INDEX IF NOT EXISTS public_observations_dataset_idx
  ON public_observations (dataset, geography_type, indicator, observation_year);

CREATE INDEX IF NOT EXISTS public_observations_parent_idx
  ON public_observations (parent_geography, indicator, observation_year)
  WHERE geography_type = 'district';

