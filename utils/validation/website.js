const joi = require('joi');

const { isURL } = require('./common');

const websiteSchema = joi.object({
  url: joi.string().custom(isURL).required().messages({
    'any.required': 'URL is required',
    'any.invalid': 'Invalid URL',
  }),
});

function validateWebsite(website) {
  return websiteSchema.validate(website, {
    abortEarly: false,
    stripUnknown: true,
  });
}

module.exports = {
  validateWebsite,
};
