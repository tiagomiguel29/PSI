const Website = require('../models/Website');
const Page = require('../models/Page');

const { validatePage } = require('../utils/validation/page');

async function createPage(req, res) {
  const { url, websiteId } = req.body;

  const { error } = validatePage({ url, website: websiteId });

  if (error) {
    return res.status(400).json({
      success: false,
      errors: error.details.map((error) => error.message),
    });
  }

  try {
    const website = await Website.findById(websiteId);

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    const page = await Page.create({ url, website: websiteId });

    return res.status(201).json({
      success: true,
      page,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = { createPage };
