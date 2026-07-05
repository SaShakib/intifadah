const { query } = require('../../db/pool');

async function healthCheck() {
  const result = await query('SELECT NOW() AS now, current_database() AS database');
  return result.rows[0];
}

module.exports = {
  healthCheck,
};
