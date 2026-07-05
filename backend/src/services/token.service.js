const { repositories } = require('../repositories');

const { authRepository } = repositories;

module.exports = {
  storeRefreshToken: authRepository.storeRefreshToken,
  getValidRefreshToken: authRepository.getValidRefreshToken,
  revokeRefreshToken: authRepository.revokeRefreshToken,
  revokeRefreshTokenById: authRepository.revokeRefreshTokenById,
};
