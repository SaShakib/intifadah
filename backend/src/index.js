const { env } = require('./config/env');
const { createApp } = require('./app');
const { pool } = require('./db/pool');
const { startSchedulers, stopSchedulers } = require('./services/scheduler.service');

const app = createApp();

async function start() {
  try {
    await pool.query('SELECT 1');
    app.listen(env.port, () => {
      console.log(`Backend running on http://localhost:${env.port}`);
      startSchedulers();
    });
  } catch (error) {
    console.error('Failed to start backend:', error.message);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  stopSchedulers();
  await pool.end();
  process.exit(0);
});

start();
