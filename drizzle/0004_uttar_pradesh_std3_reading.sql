-- Recover Uttar Pradesh's Std III reading rounds for 2022 and 2024.
--
-- These six cells were published in the ASER 2024 report (page 230, Table 5)
-- but were absent from migration 0001. On Uttar Pradesh's page alone, the text
-- layer places the 2022 and 2024 row labels on their own lines, separated from
-- their values; the position-based extractor associated values with a year on
-- the same line and so skipped both rows. Every other state, and every other
-- Uttar Pradesh series, was unaffected.
--
-- Each recovered value was checked three ways before being written:
--   * the weighted average lies between its government and private components
--     (24.0 in [16.4, 38.5]; 34.4 in [27.9, 43.0]);
--   * it reconciles with the independently published all-children figure in
--     Table 15 (2022: 24.0 vs 24.0; 2024: 34.4 vs 34.3, the small difference
--     expected because the weighted average excludes other school types);
--   * the adjacent 2018 row already in the database (12.3 / 45.4 / 28.3)
--     matches the same PDF line, confirming the column mapping.
--
-- Idempotent: re-applying changes nothing.

INSERT INTO public_observations (id,observation_year,geography_type,geography,domain,indicator,subgroup_label,numeric_value,unit,pdf_page_number,source_url,comparability) VALUES ('obs_d129cf4794b2a1373a1c',2022,'state','Uttar Pradesh','Reading','Std III: % children reading at Std II level','Govt',16.4,'percent',230,'https://asercentre.org/wp-content/uploads/2022/12/ASER_2024_Final-Report_13_2_24-1.pdf','directly_comparable') ON CONFLICT (id) DO NOTHING;
INSERT INTO public_observations (id,observation_year,geography_type,geography,domain,indicator,subgroup_label,numeric_value,unit,pdf_page_number,source_url,comparability) VALUES ('obs_62ed3f42a3e02c7b455c',2022,'state','Uttar Pradesh','Reading','Std III: % children reading at Std II level','Pvt',38.5,'percent',230,'https://asercentre.org/wp-content/uploads/2022/12/ASER_2024_Final-Report_13_2_24-1.pdf','directly_comparable') ON CONFLICT (id) DO NOTHING;
INSERT INTO public_observations (id,observation_year,geography_type,geography,domain,indicator,subgroup_label,numeric_value,unit,pdf_page_number,source_url,comparability) VALUES ('obs_6bebfc2b958366e9909c',2022,'state','Uttar Pradesh','Reading','Std III: % children reading at Std II level','Govt & Pvt (weighted)',24.0,'percent',230,'https://asercentre.org/wp-content/uploads/2022/12/ASER_2024_Final-Report_13_2_24-1.pdf','directly_comparable') ON CONFLICT (id) DO NOTHING;
INSERT INTO public_observations (id,observation_year,geography_type,geography,domain,indicator,subgroup_label,numeric_value,unit,pdf_page_number,source_url,comparability) VALUES ('obs_f0b00c8985018b3705e9',2024,'state','Uttar Pradesh','Reading','Std III: % children reading at Std II level','Govt',27.9,'percent',230,'https://asercentre.org/wp-content/uploads/2022/12/ASER_2024_Final-Report_13_2_24-1.pdf','directly_comparable') ON CONFLICT (id) DO NOTHING;
INSERT INTO public_observations (id,observation_year,geography_type,geography,domain,indicator,subgroup_label,numeric_value,unit,pdf_page_number,source_url,comparability) VALUES ('obs_42bca10bf73d0640a3af',2024,'state','Uttar Pradesh','Reading','Std III: % children reading at Std II level','Pvt',43.0,'percent',230,'https://asercentre.org/wp-content/uploads/2022/12/ASER_2024_Final-Report_13_2_24-1.pdf','directly_comparable') ON CONFLICT (id) DO NOTHING;
INSERT INTO public_observations (id,observation_year,geography_type,geography,domain,indicator,subgroup_label,numeric_value,unit,pdf_page_number,source_url,comparability) VALUES ('obs_473095207965d12feb19',2024,'state','Uttar Pradesh','Reading','Std III: % children reading at Std II level','Govt & Pvt (weighted)',34.4,'percent',230,'https://asercentre.org/wp-content/uploads/2022/12/ASER_2024_Final-Report_13_2_24-1.pdf','directly_comparable') ON CONFLICT (id) DO NOTHING;
