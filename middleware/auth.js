/**
 * Middleware to require authentication
 * Redirects to login if user is not authenticated
 */
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }

    req.flash('error', 'Please login to access this page');
    res.redirect('/auth/login');
}

/**
 * Middleware to require guest (not authenticated)
 * Redirects to dashboard if user is already authenticated
 */
function requireGuest(req, res, next) {
    if (req.session && req.session.userId) {
        return res.redirect('/user/dashboard');
    }
    next();
}

/**
 * Middleware to attach user data to all requests
 * Makes user data available in templates
 */
async function attachUser(req, res, next) {
    if (req.session && req.session.userId) {
        try {
            const User = require('../models/User');
            const user = await User.findById(req.session.userId);
            res.locals.user = user;
            res.locals.isAuthenticated = true;
        } catch (error) {
            console.error('Error fetching user:', error);
            res.locals.user = null;
            res.locals.isAuthenticated = false;
        }
    } else {
        res.locals.user = null;
        res.locals.isAuthenticated = false;
    }

    // Make flash messages available to all templates
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');

    next();
}

module.exports = {
    requireAuth,
    requireGuest,
    attachUser
};
