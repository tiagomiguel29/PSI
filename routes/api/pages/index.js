const express = require('express');
const router = express.Router();

const pagesControllers = require('../../../controllers/pages');

router.post('/new', pagesControllers.createPage);

router.get('/:id', pagesControllers.getPage);

router.delete('/:id', pagesControllers.removePage);

router.get('/', pagesControllers.getPages);

module.exports = router;
