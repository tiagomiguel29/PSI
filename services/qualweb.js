const { QualWeb } = require('@qualweb/core');

async function evaluate(url) {
  try {
    const plugins = {
      dBlock: true,
      stealth: true,
    };

    const qualweb = new QualWeb(plugins);

    const clusterOptions = {
      timeout: 60 * 1000,
      maxConcurrency: 1, // Change later
      monitor: true,
    };

    const launchOptions = {
      headless: true,
      ignoreHTTPSErrors: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    };

    await qualweb.start(clusterOptions, launchOptions);

    const qualwebOptions = {
      url: url,
    };

    const results = await qualweb.evaluate(qualwebOptions);

    await qualweb.stop();

    return results;
  } catch (error) {
    console.log(error);
    return null;
  }
}

module.exports = {
  evaluate,
};
