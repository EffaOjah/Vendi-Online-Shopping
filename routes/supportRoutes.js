const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

router.get('/help', supportController.getHelpCenter);
router.get('/safety', supportController.getSafetyTips);

module.exports = router;
