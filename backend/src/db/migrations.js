const fs = require('node:fs');
const path = require('node:path');
const { query } = require('./pool');

const MIGRATION_DIR = path.resolve(process.cwd(), 'sql');

async function ensureMigrationTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function hasMigration(version) {
  const res = await query('SELECT 1 FROM schema_migrations WHERE version = $1 LIMIT 1', [version]);
  return res.rowCount > 0;
}

async function applyMigration(fileName) {
  const version = path.basename(fileName);
  const alreadyApplied = await hasMigration(version);
  if (alreadyApplied) {
    return { version, applied: false };
  }

  const sql = fs.readFileSync(path.join(MIGRATION_DIR, fileName), 'utf8');
  await query(sql);
  await query('INSERT INTO schema_migrations (version) VALUES ($1)', [version]);
  return { version, applied: true };
}

async function runMigrations() {
  await ensureMigrationTable();

  const files = fs
    .readdirSync(MIGRATION_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort();

  const results = [];
  for (const file of files) {
    // eslint-disable-next-line no-await-in-loop
    const result = await applyMigration(file);
    results.push(result);
  }

  return results;
}

module.exports = {
  runMigrations,
};
