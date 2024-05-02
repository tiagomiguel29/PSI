const Website = require('../models/Website');
const Page = require('../models/Page');

const { isMongoId, isSubPage, trimURL } = require('../utils/validation/common');
const { validatePage } = require('../utils/validation/page');

async function createPage(req, res) {
  try {
    const { url, websiteId } = req.body;

    if (!isMongoId(websiteId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid website ID',
      });
    }

    const { error } = validatePage({ url, website: websiteId });

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page data',
        errors: error.details.map((error) => ({
          field: error.context.key,
          message: error.message,
        })),
      });
    }

    const website = await Website.findById(websiteId);

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    if (!isSubPage(website.url, url)) {
      return res.status(400).json({
        success: false,
        message: 'Page is not a subpage of the website',
      });
    }

    const page = await Page.create({ url: trimURL(url), website: websiteId });

    return res.status(201).json({
      success: true,
      page,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Page already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getPage(req, res) {
  const { id } = req.params;

  try {
    if (!isMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page ID',
      });
    }

    const page = await Page.findById(id).populate('website');

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    return res.status(200).json({
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

async function getPages(req, res) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const sort = req.query.sort || 'createdAt';
    const sortDirection = req.query.sortDirection === 'desc' ? -1 : 1;
    const status = req.query.status;

    const { websiteId } = req.query;

    if (websiteId && !isMongoId(websiteId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid website ID',
      });
    }

    const options = {
      limit: limit,
      sort: { [sort]: sortDirection },
      skip: (page - 1) * limit,
    };

    const filters = {};

    if (websiteId) {
      filters.website = websiteId;
    }

    if (status) {
      filters.status = status;
    }

    const pages = await Page.find(filters)
      .populate('website', 'url')
      .limit(options.limit)
      .skip(options.skip)
      .sort(options.sort);

    const totalPages = await Page.countDocuments(filters);

    return res.status(200).json({
      success: true,
      pages,
      totalWebsitePages: totalPages,
      totalPages: Math.ceil(totalPages / limit),
      currentPage: page,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function removePage(req, res) {
  const { id } = req.params;

  try {
    if (!isMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page ID',
      });
    }

    const page = await Page.findByIdAndDelete(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    return res.status(200).json({
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

// Deletes multiple pages given an array of page IDs
async function removePages(req, res) {
  const { ids } = req.body;

  try {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid page IDs',
      });
    }

    for (const id of ids) {
      if (!isMongoId(id)) {
        return res.status(400).json({
          success: false,
          message: 'One or more invalid page IDs',
        });
      }
    }

    const pages = await Page.deleteMany({ _id: { $in: ids } });

    if (!pages) {
      return res.status(404).json({
        success: false,
        message: 'Pages not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Pages deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = { createPage, getPage, removePage, getPages, removePages };
