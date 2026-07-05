const { repositories } = require('../repositories');

const { authRepository } = repositories;

module.exports = {
  getRoleByKey: authRepository.getRoleByKey,
  getRoleById: authRepository.getRoleById,
  getUserByIdentifier: authRepository.getUserByIdentifier,
  getUserById: authRepository.getUserById,
  createUser: authRepository.createUser,
  updateUserRole: authRepository.updateUserRole,
  updateUserLastLogin: authRepository.updateUserLastLogin,
  updateUserProfile: authRepository.updateUserProfile,
};
