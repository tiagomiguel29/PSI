const { uploadFile } = require('./s3');
const { binaryScreenshot } = require('./puppeteer');

async function captureAndUpload(url, key, website) {
  try {
    website.previewImageStatus = 'Capturing';

    await website.save();

    const screenshot = await binaryScreenshot(url);

    if (screenshot) {
      await uploadFile(screenshot, key, 'image/png');

      website.previewImage = key;
      website.previewImageStatus = 'Captured';

      await website.save();
    } else {
      website.previewImageStatus = 'Error';
      await website.save();
    }
  } catch (error) {
    console.error('Error capturing and uploading screenshot:', error);
    website.previewImageStatus = 'Error';
  }
}

module.exports = { captureAndUpload };
