BEGIN;

UPDATE categories
SET category_type = 1,
    description = 'Auto-created pending donation for missed Quran tracking days'
WHERE category_name = 'Quran penalty'
  AND category_type = 2;

UPDATE categories
SET category_type = 1,
    description = 'Auto-created pending donation for missed Namaj tracking days'
WHERE category_name = 'Namaj penalty'
  AND category_type = 2;

UPDATE transactions t
SET tx_type = 2
WHERE t.tx_type = 3
  AND t.id IN (
    SELECT transaction_id FROM quran_penalties WHERE transaction_id IS NOT NULL
    UNION
    SELECT transaction_id FROM namaj_penalties WHERE transaction_id IS NOT NULL
  );

COMMIT;