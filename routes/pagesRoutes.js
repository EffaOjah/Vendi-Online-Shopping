const express = require('express');
const router = express.Router();
const pagesController = require('../controllers/pagesController');

router.get('/about', pagesController.getAboutPage);
router.get('/contact', pagesController.getContactPage);
router.get('/blog', pagesController.getBlogPage);
router.get('/careers', pagesController.getCareersPage);
router.get('/faq', pagesController.getFAQPage);

module.exports = router;
