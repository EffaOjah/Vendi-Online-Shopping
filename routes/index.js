const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

// Route for home page
router.get('/home', mainController.getHomePage);

// Redirect root to product listings
router.get('/', (req, res) => {
    res.redirect('/product/listings');
});

module.exports = router;
