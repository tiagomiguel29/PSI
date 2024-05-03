// Service to update the stats of a website

const Page = require('../models/Page');

async function updateStats(website) {
  const pages = await Page.find({
    website: website._id,
  }).select('stats status');

  console.log(pages);

  const evaluatedPages = pages.filter((p) =>
    ['Conforme', 'Não conforme'].includes(p.status),
  );

  const newStats = {
    pagesWithoutErrors: evaluatedPages.filter((p) => p.stats.hasNoErrors)
      .length,
    pagesWithErrors: evaluatedPages.filter((p) => !p.stats.hasNoErrors).length,
    pagesWithAErrors: evaluatedPages.filter((p) => p.stats.hasAErrors).length,
    pagesWithAAErrors: evaluatedPages.filter((p) => p.stats.hasAAErrors).length,
    pagesWithAAAErrors: evaluatedPages.filter((p) => p.stats.hasAAAErrors)
      .length,
    evaluatedPages: evaluatedPages.length,
  };

  website.stats = { ...newStats };

  if (pages.filter((p) => p.status === 'Erro na avaliação').length > 0) {
    website.status = 'Erro na avaliação';
  } else if (pages.filter((p) => p.status === 'Por avaliar').length > 0) {
    website.status = 'Por avaliar';
  } else if (pages.filter((p) => p.status === 'Em avaliação').length > 0) {
    website.status = 'Por avaliar';
  } else {
    website.status = 'Avaliado';
  }

  await website.save();

  return website;
}

module.exports = { updateStats };
