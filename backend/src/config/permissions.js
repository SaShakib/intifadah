const PERMISSION_BITS = {
  read: 1,
  write: 2,
  update: 4,
  delete: 8,
};

const PERMISSION_ACTIONS = ['read', 'write', 'update', 'delete'];

function buildMaskFromActions(actions = []) {
  return actions.reduce((mask, action) => {
    const bit = PERMISSION_BITS[action];
    return bit ? mask | bit : mask;
  }, 0);
}

function parsePermissionMask(input) {
  if (typeof input === 'number' && Number.isInteger(input) && input >= 0 && input <= 15) {
    return input;
  }

  if (Array.isArray(input)) {
    return buildMaskFromActions(input);
  }

  if (input && typeof input === 'object') {
    return PERMISSION_ACTIONS.reduce((mask, action) => {
      if (input[action]) {
        return mask | PERMISSION_BITS[action];
      }
      return mask;
    }, 0);
  }

  return 0;
}

function maskToActions(mask) {
  return PERMISSION_ACTIONS.filter((action) => (mask & PERMISSION_BITS[action]) === PERMISSION_BITS[action]);
}

module.exports = {
  PERMISSION_BITS,
  PERMISSION_ACTIONS,
  parsePermissionMask,
  maskToActions,
};
