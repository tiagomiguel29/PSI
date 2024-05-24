const express = require('express');
const router = express.Router();

const websitesControllers = require('../../../controllers/websites');

router.post('/new', websitesControllers.createWebsite);

router.get('/:id/pdf', websitesControllers.getPDF);

router.post('/:id/evaluate', websitesControllers.evaluate);

router.post('/:id/addPages', websitesControllers.addPages);

router.get('/:id', websitesControllers.getWebsite);

router.delete('/:id', websitesControllers.removeWebsite);

router.get('/', websitesControllers.getWebsites);

module.exports = router;
