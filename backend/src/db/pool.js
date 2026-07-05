const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const { env } = require('../config/env');

function buildSslConfig() {
  if (env.pgSslMode !== 'require') {
    return false;
  }

  const ssl = {
    rejectUnauthorized: env.pgSslRejectUnauthorized,
  };

  if (env.pgCaCertPath) {
    const certPath = path.resolve(process.cwd(), env.pgCaCertPath);
    ssl.ca = fs.readFileSync(certPath, 'utf8');
  } else if (env.pgCaCert) {
    ssl.ca = env.pgCaCert.replace(/\\n/g, '\n');
  }

  return ssl;
}

function createPool() {
  const max = env.pgConnectionLimit ?? (env.isVercel ? 1 : 10);

  return new Pool({
    connectionString: env.databaseUrl,
    host: env.dbHost,
    port: env.dbPort,
    database: env.dbName,
    user: env.dbUser,
    password: env.dbPassword,
    ssl: buildSslConfig(),
    max,
    idleTimeoutMillis: env.isVercel ? 5000 : 30000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: env.isVercel,
  });
}

const globalScope = global;
if (!globalScope.__intifadahPgPool) {
  globalScope.__intifadahPgPool = createPool();
}

const pool = globalScope.__intifadahPgPool;

async function query(text, params) {
  return pool.query(text, params);
}

async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  query,
  withTransaction,
};
