const joi = require('joi');

const { isURL } = require('./common');

const websiteSchema = joi.object({
  url: joi.string().custom(isURL).required(),
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
