BEGIN;

CREATE OR REPLACE FUNCTION books_title_script(input_text TEXT)
RETURNS SMALLINT
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  codepoint INTEGER;
BEGIN
  IF input_text IS NULL OR char_length(input_text) = 0 THEN
    RETURN 1;
  END IF;
  FOR i IN 1..char_length(input_text) LOOP
    codepoint := ascii(substring(input_text FROM i FOR 1));
    IF codepoint BETWEEN 2432 AND 2559 THEN
      RETURN 0; -- contains Bangla characters
    END IF;
    IF codepoint >= 2560 THEN
      RETURN 1; -- other non-Bangla script
    END IF;
  END LOOP;
  RETURN 1; -- Latin / ASCII only
END;
$$;

ALTER TABLE books
  ADD COLUMN IF NOT EXISTS title_script SMALLINT NOT NULL DEFAULT 0;

UPDATE books SET title_script = books_title_script(title);

ALTER TABLE books ALTER COLUMN title_script SET DEFAULT 0;

CREATE OR REPLACE FUNCTION books_set_title_script()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.title_script := books_title_script(NEW.title);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_books_title_script ON books;
CREATE TRIGGER trg_books_title_script
  BEFORE INSERT OR UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION books_set_title_script();

DROP INDEX IF EXISTS idx_books_catalogue_order;
CREATE INDEX idx_books_catalogue_order
  ON books (title_script, canonical_key COLLATE "C", (CASE WHEN status = 0 THEN 0 ELSE 1 END), created_at DESC, id DESC)
  WHERE deleted_at IS NULL;

COMMIT;