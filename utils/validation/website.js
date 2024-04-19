const joi = require('joi');

const websiteSchema = joi.object({
  url: joi.string().required(),
  status: joi
    .string()
    .valid('Por avaliar', 'Em avaliação', 'Avaliado', 'Erro na avaliação')
    .default('Por avaliar'),
  lastEvaluated: joi.date().default(null),
});

function validateWebsite(website) {
  const urlRegex = new RegExp('^(http|https)://', 'i');
  if (!urlRegex.test(website.url)) {
    throw new Error('Invalid URL');
  }

  return websiteSchema.validate(website);
}

module.exports = {
  validateWebsite,
};
