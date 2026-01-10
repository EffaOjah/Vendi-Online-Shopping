const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/search', productController.getSearch);
router.get('/listing-detail', productController.getListingDetail); // Consider /detail/:id in future
router.get('/seller-profile', productController.getSellerProfile); // Consider /seller/:id in future

module.exports = router;
