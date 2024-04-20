const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'OK',
  });
});

router.use('/websites', require('./websites'));
router.use('/pages', require('./pages'));

module.exports = router;
