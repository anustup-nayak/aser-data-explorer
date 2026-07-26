-- Dataset dimension.
--
-- Every observation now declares which published dataset it came from. Today
-- that is only ASER, but the column is the seam that lets a second source
-- (PARAKH/NAS learning assessments, UDISE+ school records) land in the same
-- table without changing any existing row, query or route: readers filter by
-- dataset, and the catalogue reports each dataset separately.
--
-- Contract for a new dataset:
--   * pick a stable lowercase slug, e.g. 'parakh', 'udise';
--   * every row carries source_url + pdf_page_number (or a stable record URI);
--   * indicators are namespaced by construct, never reused across datasets;
--   * comparability is declared per row, never inferred by the UI.
ALTER TABLE public_observations ADD COLUMN dataset TEXT NOT NULL DEFAULT 'aser';

CREATE INDEX IF NOT EXISTS public_observations_dataset_idx
  ON public_observations (dataset, geography_type, indicator, observation_year);
