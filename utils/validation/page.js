const joi = require('joi');

const { isMongoId, isURL } = require('./common');

const pageSchema = joi.object({
  // Use isURL to validate the url and apply custom error messages
  url: joi.string().custom(isURL).message('Invalid URL').required(),
  website: joi.string().custom(isMongoId).required(),
});

function validatePage(page) {
  return pageSchema.validate(page, { abortEarly: false, stripUnknown: true });
}

module.exports = {
  validatePage,
};
