const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.get('/ads', adminController.getAds);

module.exports = router;