const { repositories } = require('../../repositories');

const { systemRepository } = repositories;

function getServiceInfo() {
  return {
    service: 'intifadah-express-api',
    status: 'ok',
    version: '1.0.0',
  };
}

function getHealth() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
}

async function getDatabaseHealth() {
  const db = await systemRepository.healthCheck();
  return {
    status: 'ok',
    serverTime: db.now,
    database: db.database,
  };
}

module.exports = {
  getServiceInfo,
  getHealth,
  getDatabaseHealth,
};
