BEGIN;

ALTER TABLE quran_progress
  ADD COLUMN IF NOT EXISTS nafl_rakat SMALLINT;

ALTER TABLE quran_progress
  DROP CONSTRAINT IF EXISTS chk_quran_progress_congregational_not_more_than_offered,
  ADD CONSTRAINT chk_quran_progress_nafl_rakat
    CHECK (nafl_rakat IS NULL OR nafl_rakat >= 0);

COMMIT;
