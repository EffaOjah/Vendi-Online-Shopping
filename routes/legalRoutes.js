const express = require('express');
const router = express.Router();
const legalController = require('../controllers/legalController');

router.get('/privacy', legalController.getPrivacyPolicy);
router.get('/terms', legalController.getTermsOfService);

module.exports = router;
