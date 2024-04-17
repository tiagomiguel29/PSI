const express = require('express');
const router = express.Router();

const websitesControllers = require('../../../controllers/websites');

router.post('/new', websitesControllers.createWebsite);

router.get('/:id', websitesControllers.getWebsite);

router.delete('/:id', websitesControllers.removeWebsite);

router.get('/', websitesControllers.getWebsites);

module.exports = router;
