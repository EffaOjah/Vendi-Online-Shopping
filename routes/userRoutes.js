const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

// All user routes require authentication
router.use(requireAuth);

router.get('/dashboard', userController.getDashboard);
router.get('/profile', userController.getProfile);
router.get('/settings', userController.getSettings);
router.get('/post-ad', userController.getPostAd);
router.get('/my-ads', userController.getMyAds);
router.get('/saved-items', userController.getSavedItems);
router.get('/chat', userController.getChat);

module.exports = router;