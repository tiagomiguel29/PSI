const validator = require('validator');

function isMongoId(value, helpers) {
  if (!validator.isMongoId(value)) {
    return helpers.error('any.invalid');
  }

  return value;
}

function isURL(value, helpers) {
  const options = {
    protocols: ['http', 'https'],
    require_protocol: true,
    requires_valid_protocol: true,
  };

  if (!validator.isURL(value, options)) {
    return helpers.error('any.invalid');
  }

  return value;
}

module.exports = { isMongoId, isURL };
