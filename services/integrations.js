const { uploadFile } = require('./s3');
const { binaryScreenshot } = require('./puppeteer');

async function captureAndUpload(url, key) {
  try {
    const screenshot = await binaryScreenshot(url);

    if (screenshot) {
      await uploadFile(screenshot, key, 'image/png');
    }
  } catch (error) {
    console.error('Error capturing and uploading screenshot:', error);
  }
}

module.exports = { captureAndUpload };
