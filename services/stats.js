// Service to update the stats of a website

const Page = require('../models/Page');
const PageEvaluation = require('../models/PageEvaluation');

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

  notifyWebsiteUpdate(website.id);

  return website;
}

async function getTop10Errors(website) {
  const failedAssertions = await PageEvaluation.aggregate([
    {
      $match: {
        website: website._id,
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

  let allConcat = actConcat.concat(wcagConcat);

  allConcat = allConcat.reduce((acc, assertion) => {
    const existing = acc.find((a) => a.code === assertion.code);

    if (existing) {
      existing.metadata.failed += assertion.metadata.failed;
    } else {
      acc.push(assertion);
    }

    return acc;
  }, []);

  const top10 = [];

  allConcat
    .sort((a, b) => b.metadata.failed - a.metadata.failed)
    .slice(0, 10)
    .map((assertion) => {
      top10.push({
        code: assertion.code,
        name: assertion.name,
        description: assertion.description,
        count: assertion.metadata.failed,
      });
    });

  return top10;
}

module.exports = { updateStats };
