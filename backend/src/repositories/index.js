const { env } = require('../config/env');
const postgresRepositories = require('./postgres');

function createRepositories(provider = env.dataProvider) {
  switch (provider) {
    case 'postgres':
      return postgresRepositories;
    default: {
      const error = new Error(`Unsupported DATA_PROVIDER: ${provider}`);
      error.statusCode = 500;
      throw error;
    }
  }
}

const repositories = createRepositories();

module.exports = {
  createRepositories,
  repositories,
};
