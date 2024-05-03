// Service to update the stats of a website

const Page = require('../models/Page');
const { notifyWebsiteUpdate } = require('./sockets');

async function updateStats(website) {
  const pages = await Page.find({
    website: website._id,
  }).select('stats status lastEvaluated');

  const evaluatedPages = pages.filter((p) =>
    ['Compliant', 'Not compliant'].includes(p.status),
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

  if (pages.filter((p) => p.status === 'Evaluation error').length > 0) {
    website.status = 'Evaluation error';
  } else if (
    pages.filter((p) => p.status === 'Pending evaluation').length > 0
  ) {
    website.status = 'Pending evaluation';
  } else if (pages.filter((p) => p.status === 'Evaluating').length > 0) {
    website.status = 'Pending evaluation';
  } else {
    website.status = 'Evaluated';
  }

  website.lastEvaluated = new Date();

  await website.save();

  notifyWebsiteUpdate(website.id);

  return website;
}

module.exports = { updateStats };
