const { runMigrations } = require('../src/db/migrations');
const { pool } = require('../src/db/pool');

async function main() {
  const results = await runMigrations();
  for (const item of results) {
    const mark = item.applied ? 'APPLIED' : 'SKIPPED';
    console.log(`[${mark}] ${item.version}`);
  }
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Migration failed:', error.message);
    await pool.end();
    process.exit(1);
  });
