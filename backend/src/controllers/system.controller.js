const {
  getServiceInfo,
  getHealth,
  getDatabaseHealth,
} = require('../services/api/system-api.service');

function root(_req, res) {
  res.json(getServiceInfo());
}

function health(_req, res) {
  res.json(getHealth());
}

async function dbHealth(_req, res, next) {
  try {
    const result = await getDatabaseHealth();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  root,
  health,
  dbHealth,
};
