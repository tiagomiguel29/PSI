const { uploadFile, generateLink } = require('./s3');
const { binaryScreenshot } = require('./puppeteer');
const { notifyWebsiteUpdate } = require('./sockets');

async function captureAndUpload(url, key, website) {
  try {
    website.previewImageStatus = 'Capturing';

    await website.save();

    const screenshot = await binaryScreenshot(url);

    if (screenshot) {
      await uploadFile(screenshot, key, 'image/png');

      website.previewImage = generateLink(key);
      website.previewImageStatus = 'Captured';

      await website.save();
      notifyWebsiteUpdate(website.id);
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
