BEGIN;

ALTER TABLE book_categories
  ADD COLUMN IF NOT EXISTS slug VARCHAR(120);

UPDATE book_categories SET slug = lower(
  regexp_replace(
    btrim(regexp_replace(category_name, '[[:space:][:punct:]]+', '-', 'g'), ' -'),
    '-+', '-', 'g'
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_book_categories_slug
  ON book_categories (slug) WHERE slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS book_category_links (
  book_id BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES book_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (book_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_book_category_links_category
  ON book_category_links (category_id, book_id);

INSERT INTO book_category_links (book_id, category_id)
SELECT id, category_id FROM books
WHERE category_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM book_category_links l
    WHERE l.book_id = books.id AND l.category_id = books.category_id
  );

COMMIT;