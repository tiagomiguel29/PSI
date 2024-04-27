const joi = require('joi');

const { isMongoId, isURL } = require('./common');

const pageSchema = joi.object({
  url: joi.string().custom(isURL).required().messages({
    'any.required': 'URL is required',
    'any.invalid': 'Invalid URL',
  }),
  website: joi.string().custom(isMongoId).required().messages({
    'any.required': 'Website ID is required',
    'any.invalid': 'Invalid Website ID',
  }),
});

function validatePage(page) {
  return pageSchema.validate(page, { abortEarly: false, stripUnknown: true });
}

module.exports = {
  validatePage,
};
