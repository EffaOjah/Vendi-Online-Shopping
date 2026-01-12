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
 * Also checks for remember me tokens if no active session
 */
async function attachUser(req, res, next) {
    // First check if user has an active session
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
        // No active session, check for remember token
        const rememberCookie = req.cookies.vendi_remember;

        if (rememberCookie) {
            try {
                const [selector, token] = rememberCookie.split(':');

                if (selector && token) {
                    const User = require('../models/User');
                    const user = await User.findByRememberToken(selector, token);

                    if (user) {
                        // Valid token - create session
                        req.session.userId = user.id;
                        req.session.userEmail = user.email;
                        req.session.userName = user.full_name;

                        // Token rotation for security: delete old token and create new one
                        await User.deleteRememberToken(selector);
                        const { selector: newSelector, token: newToken } = await User.createRememberToken(user.id);

                        // Update cookie with new token
                        res.cookie('vendi_remember', `${newSelector}:${newToken}`, {
                            maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
                            httpOnly: true,
                            secure: process.env.NODE_ENV === 'production',
                            sameSite: 'lax'
                        });

                        res.locals.user = user;
                        res.locals.isAuthenticated = true;
                    } else {
                        // Invalid token - clear cookie
                        res.clearCookie('vendi_remember');
                        res.locals.user = null;
                        res.locals.isAuthenticated = false;
                    }
                } else {
                    // Malformed cookie - clear it
                    res.clearCookie('vendi_remember');
                    res.locals.user = null;
                    res.locals.isAuthenticated = false;
                }
            } catch (error) {
                console.error('Error processing remember token:', error);
                res.clearCookie('vendi_remember');
                res.locals.user = null;
                res.locals.isAuthenticated = false;
            }
        } else {
            res.locals.user = null;
            res.locals.isAuthenticated = false;
        }
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
