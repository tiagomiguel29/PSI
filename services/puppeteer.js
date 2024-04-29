const { timeout } = require('puppeteer');
const puppeteer = require('puppeteer');

async function binaryScreenshot(url) {
  try {
    const options = {
      executablePath: '/usr/bin/google-chrome',
      ignoreHTTPSErrors: true,

      args:
        NODE_ENV === 'production' || NODE_ENV === 'staging'
          ? []
          : ['--no-sandbox', '--disable-setuid-sandbox'],
    };

    console.log(options);

    const browser = await puppeteer.launch(options);

    console.log('Browser launched');

    const page = await browser.newPage();

    console.log('Page created');

    await page.setViewport({
      width: 1728,
      height: 940,
      deviceScaleFactor: 1,
    });

    console.log('Viewport set');

    await page.goto(url);

    console.log('Page loaded');

    return await page.screenshot({ encoding: 'binary' });
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

module.exports = { binaryScreenshot };
