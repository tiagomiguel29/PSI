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

function isSubPage(parentUrl, childUrl) {
  try {
    const parent = new URL(parentUrl);
    const child = new URL(childUrl);

    if (child.origin !== parent.origin) {
      return false;
    }

    const parentPath = parent.pathname.endsWith('/')
      ? parent.pathname.slice(0, -1)
      : parent.pathname;
    const childPath = child.pathname.endsWith('/')
      ? child.pathname.slice(0, -1)
      : child.pathname;

    return childPath.startsWith(parentPath);
  } catch (error) {
    return false;
  }
}

module.exports = { isMongoId, isURL, isSubPage };
