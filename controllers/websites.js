const Website = require('../models/Website');
const Page = require('../models/Page');
const { validateWebsite } = require('../utils/validation/website');

async function createWebsite(req, res) {
  const { url, pages } = req.body;

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

    const pageDocs = [];

    if (pages && pages.length > 0) {
      for (const page of pages) {
        const newPage = await Page.create({
          url: page,
          website: newWebsite._id,
        });
        pageDocs.push(newPage);
      }
    }

    return res.status(201).json({
      success: true,
      website: newWebsite,
      pages: pageDocs,
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

    const pages = await Page.find({ website: website._id });

    return res.status(200).json({
      success: true,
      website,
      pages,
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
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sort = req.query.sort || 'createdAt';
    const sortDirection = req.query.sortDirection === 'desc' ? -1 : 1;

    const { status } = req.query;

    const options = {
      limit: limit,
      skip: (page - 1) * limit,
      sort: { [sort]: sortDirection },
    };

    const websites = await Website.find(status ? { status } : {})
      .limit(options.limit)
      .skip(options.skip)
      .sort(options.sort);
    const totalWebsites = await Website.countDocuments();

    return res.status(200).json({
      success: true,
      totalWebsites,
      totalPages: Math.ceil(totalWebsites / limit),
      currentPage: page,
      websites,
    });
  } catch (error) {
    console.log(error);
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
