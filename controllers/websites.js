const Website = require('../models/Website');
const { validateWebsite } = require('../utils/validation/website');

async function createWebsite(req, res) {
  const { url } = req.body;

  try {
    const website = { url };
    const { error } = validateWebsite(website);

    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((error) => error.message),
      });
    }

    const newWebsite = await Website.create(website);

    return res.status(201).json({
      success: true,
      newWebsite,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getWebsite(req, res) {
  const { id } = req.params;

  try {
    const website = await Website.findById(id);

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    return res.status(200).json({
      success: true,
      website,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getWebsites(req, res) {
  try {
    const websites = await Website.find();

    return res.status(200).json({
      success: true,
      websites,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function removeWebsite(req, res) {
  const { id } = req.params;

  try {
    const website = await Website.findByIdAndDelete(id);

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Website deleted',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  createWebsite,
  getWebsite,
  getWebsites,
  removeWebsite,
};
