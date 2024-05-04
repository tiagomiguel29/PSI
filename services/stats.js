// Service to update the stats of a website

const Page = require('../models/Page');
const PageEvaluation = require('../models/PageEvaluation');
const mongoose = require('mongoose');
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
    topErrors: await getTop10Errors(website),
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

  return website;
}

async function getTop10Errors(website) {
  const failedAssertions = await PageEvaluation.aggregate([
    {
      $match: {
        website: website._id,
        // actRules.assertions array must have elements with failed in outcome field
      },
    },
    {
      $project: {
        'actRules.assertions': {
          $filter: {
            input: '$actRules.assertions',
            as: 'assertion',
            cond: { $eq: ['$$assertion.metadata.outcome', 'failed'] },
          },
        },
        'wcagTechniques.assertions': {
          $filter: {
            input: '$wcagTechniques.assertions',
            as: 'assertion',
            cond: { $eq: ['$$assertion.metadata.outcome', 'failed'] },
          },
        },
      },
    },
  ]);

  let actConcat = [];
  let wcagConcat = [];

  for (const pageEval of failedAssertions) {
    actConcat = actConcat.concat(pageEval.actRules.assertions);
    wcagConcat = wcagConcat.concat(pageEval.wcagTechniques.assertions);
  }

  const allConcat = actConcat.concat(wcagConcat);

  // Find the top 10 most common errors and return them with the count, the name, the code and the description
  const assertionCounts = allConcat.reduce((acc, assertion) => {
    acc[assertion.code] = (acc[assertion.code] || 0) + 1;
    return acc;
  }, {});

  const topErrors = Object.keys(assertionCounts)
    .sort((a, b) => assertionCounts[b] - assertionCounts[a])
    .slice(0, 10)
    .map((code) => {
      const assertion = allConcat.find((a) => a.code === code);
      return {
        code,
        description: assertion.description,
        count: assertionCounts[code],
      };
    });

  return topErrors;
}

module.exports = { updateStats };
