const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for authentication endpoints (login)
 * Strict limits to prevent brute force attacks
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        req.flash('error', 'Too many login attempts. Please try again after 15 minutes.');
        res.redirect('/auth/login');
    },
    // Skip successful requests (only count failed login attempts)
    skipSuccessfulRequests: true
});

/**
 * Rate limiter for registration endpoint
 * Prevents account creation spam
 */
const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 registration attempts per hour
    message: 'Too many accounts created from this IP, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        req.flash('error', 'Too many registration attempts. Please try again after an hour.');
        res.redirect('/auth/register');
    }
});

/**
 * Rate limiter for password reset endpoints
 * Prevents abuse of password reset functionality
 */
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 password reset requests per hour
    message: 'Too many password reset requests from this IP, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        req.flash('error', 'Too many password reset attempts. Please try again after an hour.');
        res.redirect('/auth/forgot-password');
    }
});

/**
 * General API rate limiter
 * Protects against general abuse and DoS attacks
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Too many requests',
            message: 'You have exceeded the rate limit. Please try again later.',
            retryAfter: req.rateLimit.resetTime
        });
    }
});

/**
 * Strict rate limiter for sensitive operations
 * Can be used for account deletion, settings changes, etc.
 */
const strictLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // Limit each IP to 5 requests per hour
    message: 'Too many requests for this operation, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    authLimiter,
    registrationLimiter,
    passwordResetLimiter,
    apiLimiter,
    strictLimiter
};
