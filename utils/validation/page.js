const joi = require('joi');

const pageSchema = joi.object({
  url: joi.string().required(),
  website: joi.string().required(),
  status: joi
    .string()
    .valid('Por avaliar', 'Em avaliação', 'Avaliado', 'Erro na avaliação')
    .default('Por avaliar'),
  lastEvaluated: joi.date().default(null),
});

function validatePage(page) {
  // Validate URL
  const urlRegex = new RegExp('^(http|https)://', 'i');
  if (!urlRegex.test(page.url)) {
    throw new Error('Invalid URL');
  }

  // Validate website as MongoDB ObjectId
  if (
    !joi
      .string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .test(page.website)
  ) {
    throw new Error('Invalid website ID');
  }

  return pageSchema.validate(page);
}

module.exports = {
  validatePage,
};
