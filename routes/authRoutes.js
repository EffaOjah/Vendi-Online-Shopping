const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireGuest } = require('../middleware/auth');
const { authLimiter, registrationLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

// Login routes
router.route('/login')
    .get(requireGuest, authController.getLoginPage)
    .post(authLimiter, requireGuest, authController.postLogin);

// Register routes
router.route('/register')
    .get(requireGuest, authController.getRegisterPage)
    .post(registrationLimiter, requireGuest, authController.postRegister);

// Logout route
router.get('/logout', authController.logout);

// Forgot password routes
router.route('/forgot-password')
    .get(requireGuest, authController.getForgotPassword)
    .post(passwordResetLimiter, requireGuest, authController.postForgotPassword);

// Reset password routes
router.route('/reset-password/:token')
    .get(requireGuest, authController.getResetPassword)
    .post(passwordResetLimiter, requireGuest, authController.postResetPassword);

module.exports = router;
