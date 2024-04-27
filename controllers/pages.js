const Website = require('../models/Website');
const Page = require('../models/Page');

const { isMongoId } = require('../utils/validation/common');
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

async function getPage(req, res) {
  const { id } = req.params;

  try {
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

    const { websiteId } = req.query;

    const options = {
      limit: limit,
      sort: { [sort]: sortDirection },
      skip: (page - 1) * limit,
    };

    const pages = await Page.paginate(websiteId ? { website: websiteId } : {})
      .populate('website')
      .limit(options.limit)
      .skip(options.skip)
      .sort(options.sort);

    return res.status(200).json({
      success: true,
      pages,
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

module.exports = { createPage, getPage, removePage, getPages };
