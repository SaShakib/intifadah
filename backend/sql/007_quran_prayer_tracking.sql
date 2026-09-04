BEGIN;

ALTER TABLE quran_progress
  ADD COLUMN IF NOT EXISTS prayers_offered SMALLINT,
  ADD COLUMN IF NOT EXISTS congregational_prayers SMALLINT;

ALTER TABLE quran_progress
  ADD CONSTRAINT chk_quran_progress_prayers_offered
    CHECK (prayers_offered IS NULL OR prayers_offered BETWEEN 0 AND 5),
  ADD CONSTRAINT chk_quran_progress_congregational_prayers
    CHECK (congregational_prayers IS NULL OR congregational_prayers BETWEEN 0 AND 5),
  ADD CONSTRAINT chk_quran_progress_congregational_not_more_than_offered
    CHECK (congregational_prayers IS NULL OR prayers_offered IS NULL OR congregational_prayers <= prayers_offered);

COMMIT;
