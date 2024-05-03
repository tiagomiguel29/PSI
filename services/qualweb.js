const { QualWeb } = require('@qualweb/core');
const PageEvaluation = require('../models/PageEvaluation');
const { updateStats } = require('./stats');
const { notifyPageUpdate, notifyWebsiteUpdate } = require('./sockets');

const plugins = {
  dBlock: true,
  stealth: true,
};

const qualweb = new QualWeb(plugins);

async function evaluate(url) {
  try {
    const clusterOptions = {
      timeout: 60 * 1000,
      maxConcurrency: 1,
      //monitor: true,
    };

    const launchOptions = {
      headless: true,
      ignoreHTTPSErrors: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };

    await qualweb.start(clusterOptions, launchOptions);

    const qualwebOptions = {
      urls: [url],
    };

    const results = await qualweb.evaluate(qualwebOptions);

    await qualweb.stop();

    return results;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// Checks is it fails at least one A or AA level rule
function isCompliant(assertions) {
  return !hasErrors(assertions, 'A') && !hasErrors(assertions, 'AA');
}

// Will start the evaluation process of the pages and update the website status
async function handleEvaluationStart(website, pages) {
  website.status = 'Evaluating';
  await website.save();

  let error = false;

  for (const page of pages) {
    page.status = 'Evaluating';
    await page.save();
    notifyPageUpdate(
      website.id,
      'Evaluating',
      page.id,
      page.status,
      page.lastEvaluated,
    );

    await evaluate(page.url).then(async (result) => {
      if (!result) {
        error = true;
      } else {
        const success = await handlePageResults(result[page.url], page);

        // Update website stats after each page valuation to reflect the stats on the frontend
        await updateWebsiteStats(website);

        if (!success) {
          error = true;
        }
      }
    });
  }

  if (error) {
    website.status = 'Evaluation error';
  }

  await website.save();

  notifyWebsiteUpdate(website.id);
}

// Will handle the results from a single pages, updating the page status and adding the results to the page
async function handlePageResults(result, page) {
  if (
    !result ||
    !result.modules ||
    !result.modules['act-rules'] ||
    !result.modules['wcag-techniques']
  ) {
    page.status = 'Evaluation error';
    await page.save();
    return false;
  }

  const resultOutcomeAct = isCompliant(result.modules['act-rules'].assertions);
  const resultOutcomeWcag = isCompliant(
    result.modules['wcag-techniques'].assertions,
  );

  const resultOutcome =
    resultOutcomeAct && resultOutcomeWcag ? 'Compliant' : 'Not compliant';

  page.status = resultOutcome;
  page.lastEvaluated = new Date();
  page.stats.hasAAAErrors =
    hasErrors(result.modules['act-rules'].assertions, 'AAA') ||
    hasErrors(result.modules['wcag-techniques'].assertions, 'AAA');
  page.stats.hasAAErrors =
    hasErrors(result.modules['act-rules'].assertions, 'AA') ||
    hasErrors(result.modules['wcag-techniques'].assertions, 'AA');
  page.stats.hasAErrors =
    hasErrors(result.modules['act-rules'].assertions, 'A') ||
    hasErrors(result.modules['wcag-techniques'].assertions, 'A');
  page.stats.hasNoErrors = result.metadata.failed === 0;
  await page.save();

  notifyPageUpdate(
    page.website.toString(),
    'Evaluating',
    page.id,
    page.status,
    page.lastEvaluated,
  );

  const actAssertionsKeys = Object.keys(result.modules['act-rules'].assertions);

  for (const key of actAssertionsKeys) {
    if (
      result.modules['act-rules'].assertions[key].metadata.outcome ===
      'inapplicable'
    ) {
      delete result.modules['act-rules'].assertions[key];
    } else {
      delete result.modules['act-rules'].assertions[key].results;
    }
  }

  const wcagAssertionsKeys = Object.keys(
    result.modules['wcag-techniques'].assertions,
  );

  for (const key of wcagAssertionsKeys) {
    if (
      result.modules['wcag-techniques'].assertions[key].metadata.outcome ===
      'inapplicable'
    ) {
      delete result.modules['wcag-techniques'].assertions[key];
    } else {
      delete result.modules['wcag-techniques'].assertions[key].results;
    }
  }

  const pageEvalDoc = new PageEvaluation({
    page: page._id,
    result: resultOutcome,
    passed: result.metadata.passed,
    warning: result.metadata.warning,
    failed: result.metadata.failed,
    inapplicable: result.metadata.inapplicable,
    actRules: {
      passed: result.modules['act-rules'].metadata.passed,
      warning: result.modules['act-rules'].metadata.warning,
      failed: result.modules['act-rules'].metadata.failed,
      inapplicable: result.modules['act-rules'].metadata.inapplicable,
      assertions: result.modules['act-rules'].assertions,
    },
    wcagTechniques: {
      passed: result.modules['wcag-techniques'].metadata.passed,
      warning: result.modules['wcag-techniques'].metadata.warning,
      failed: result.modules['wcag-techniques'].metadata.failed,
      inapplicable: result.modules['wcag-techniques'].metadata.inapplicable,
      assertions: result.modules['wcag-techniques'].assertions,
    },
  });

  await pageEvalDoc.save();

  return true;
}

function hasErrors(assertions, type) {
  const assertionsArray = Object.values(assertions);

  const failed = assertionsArray.filter(
    (assertion) => assertion.metadata.outcome === 'failed',
  );

  for (const assertion of failed) {
    if (
      assertion.metadata['success-criteria'].some((sc) => sc.level === type)
    ) {
      return true;
    }
  }
  return false;
}

async function updateWebsiteStats(website) {
  return await updateStats(website);
}

module.exports = {
  handleEvaluationStart,
};
