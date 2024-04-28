const { timeout } = require('puppeteer');
const puppeteer = require('puppeteer');

async function binaryScreenshot(url) {
  try {
    const options = {
      headless: true,
      ignoreHTTPSErrors: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 10000,
    };

    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    await page.setViewport({
      width: 1728,
      height: 940,
      deviceScaleFactor: 1,
    });
    await page.goto(url, { waitUntil: 'networkidle2' });

    return await page.screenshot({ encoding: 'binary' });
  } catch (error) {
    console.log(error.message);
    return null;
  }
}

module.exports = { binaryScreenshot };
