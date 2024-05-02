const Website = require('../models/Website');
const Page = require('../models/Page');
const { validateWebsite } = require('../utils/validation/website');
const { generateLink } = require('../services/s3');
const { handleEvaluationStart } = require('../services/qualweb');
const { captureAndUpload } = require('../services/integrations');
const { isMongoId, isSubPage, trimURL } = require('../utils/validation/common');
const { validatePage } = require('../utils/validation/page');

async function createWebsite(req, res) {
  const { url } = req.body;

  try {
    const website = { url: trimURL(url) };
    const { error } = validateWebsite(website);

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid website data',
        errors: error.details.map((error) => ({
          field: error.context.key,
          message: error.message,
        })),
      });
    }

    const newWebsite = await Website.create(website);

    captureAndUpload(url, `psi/websites/${newWebsite._id}.png`, newWebsite);

    const signedUrl = generateLink(`psi/websites/${newWebsite._id}.png`);

    return res.status(201).json({
      success: true,
      website: newWebsite,
      signedUrl,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Website with this URL already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function addPages(req, res) {
  const { id } = req.params;
  const { pages } = req.body;

  try {
    if (!isMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid website ID',
      });
    }

    const website = await Website.findById(id);

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    const pageDocs = [];

    for (const page of pages) {
      const { error } = validatePage({ url: page, website: id });

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

      if (!isSubPage(website.url, page)) {
        return res.status(400).json({
          success: false,
          message: 'All pages must be subpages of the website URL',
        });
      }

      const newPage = await Page.create({
        url: trimURL(page),
        website: id,
      });

      pageDocs.push(newPage);
    }

    return res.status(201).json({
      success: true,
      pages: pageDocs,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'One or more pages already exist',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getWebsite(req, res) {
  const { id } = req.params;

  try {
    if (!isMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid website ID',
      });
    }

    const website = await Website.findById(id);

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    const pages = await Page.find({ website: website._id });

    const imageUrl = await generateLink(`psi/websites/${website._id}.png`);

    return res.status(200).json({
      success: true,
      website,
      pages,
      imageUrl,
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

    const totalWebsites = await Website.countDocuments(
      status ? { status } : {},
    );

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
    if (!isMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid website ID',
      });
    }

    const website = await Website.findByIdAndDelete(id);

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    await Page.deleteMany({ website: website._id });

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

async function evaluate(req, res) {
  const { id } = req.params;

  const { pages } = req.body;

  try {
    if (!isMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid website ID',
      });
    }

    const website = await Website.findById(id);

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    for (const page of pages) {
      if (!isMongoId(page)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid page ID',
        });
      }
    }

    const pageDocs = await Page.find({ _id: { $in: pages } });

    if (pageDocs.length !== pages.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more pages not found',
      });
    }

    handleEvaluationStart(website, pageDocs);

    return res.status(200).json({
      success: true,
      message: 'Evaluation started',
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
  addPages,
  getWebsite,
  getWebsites,
  removeWebsite,
  evaluate,
};
