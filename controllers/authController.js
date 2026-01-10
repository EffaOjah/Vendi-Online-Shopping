const User = require('../models/User');
const validator = require('validator');

// GET /auth/login
exports.getLoginPage = (req, res) => {
    res.render('auth/login', { title: 'Vendi - Login' });
};

// POST /auth/login
exports.postLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            req.flash('error', 'Please provide email and password');
            return res.redirect('/auth/login');
        }

        if (!validator.isEmail(email)) {
            req.flash('error', 'Please provide a valid email address');
            return res.redirect('/auth/login');
        }

        // Verify credentials
        const user = await User.verifyCredentials(email, password);

        if (!user) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/auth/login');
        }

        // Create session
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.userName = user.full_name;

        req.flash('success', 'Welcome back, ' + user.full_name + '!');
        res.redirect('/user/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/auth/login');
    }
};

// GET /auth/register
exports.getRegisterPage = (req, res) => {
    res.render('auth/register', { title: 'Vendi - Register' });
};

// POST /auth/register
exports.postRegister = async (req, res) => {
    const { full_name, email, phone, password, confirm_password } = req.body;

    try {
        // Validate input
        if (!full_name || !email || !password || !confirm_password) {
            req.flash('error', 'Please fill in all required fields');
            return res.redirect('/auth/register');
        }

        if (!validator.isEmail(email)) {
            req.flash('error', 'Please provide a valid email address');
            return res.redirect('/auth/register');
        }

        if (password.length < 6) {
            req.flash('error', 'Password must be at least 6 characters long');
            return res.redirect('/auth/register');
        }

        if (password !== confirm_password) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/auth/register');
        }

        // Create user
        const user = await User.create({
            full_name,
            email,
            phone,
            password
        });

        // Auto-login after registration
        req.session.userId = user.id;
        req.session.userEmail = user.email;
        req.session.userName = user.full_name;

        req.flash('success', 'Account created successfully! Welcome to Vendi.');
        res.redirect('/user/dashboard');
    } catch (error) {
        console.error('Registration error:', error);

        if (error.message === 'Email already exists') {
            req.flash('error', 'An account with this email already exists');
        } else {
            req.flash('error', 'An error occurred during registration. Please try again.');
        }

        res.redirect('/auth/register');
    }
};

// GET /auth/logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
};

// GET /auth/forgot-password
exports.getForgotPassword = (req, res) => {
    res.render('auth/forgot-password', { title: 'Vendi - Forgot Password' });
};

// POST /auth/forgot-password
exports.postForgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email || !validator.isEmail(email)) {
            req.flash('error', 'Please provide a valid email address');
            return res.redirect('/auth/forgot-password');
        }

        const token = await User.createPasswordResetToken(email);

        if (!token) {
            // Don't reveal if email exists or not for security
            req.flash('success', 'If an account exists with this email, a password reset link has been sent.');
            return res.redirect('/auth/forgot-password');
        }

        // In production, send email with reset link
        // For now, log the token to console
        console.log('Password reset token:', token);
        console.log('Reset link: http://localhost:3000/auth/reset-password/' + token);

        req.flash('success', 'Password reset link has been sent to your email. (Check console for development)');
        res.redirect('/auth/forgot-password');
    } catch (error) {
        console.error('Forgot password error:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/auth/forgot-password');
    }
};

// GET /auth/reset-password/:token
exports.getResetPassword = async (req, res) => {
    const { token } = req.params;

    try {
        const tokenData = await User.validateResetToken(token);

        if (!tokenData) {
            req.flash('error', 'Invalid or expired password reset link');
            return res.redirect('/auth/forgot-password');
        }

        res.render('auth/reset-password', {
            title: 'Vendi - Reset Password',
            token
        });
    } catch (error) {
        console.error('Reset password error:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/auth/forgot-password');
    }
};

// POST /auth/reset-password/:token
exports.postResetPassword = async (req, res) => {
    const { token } = req.params;
    const { password, confirm_password } = req.body;

    try {
        if (!password || !confirm_password) {
            req.flash('error', 'Please fill in all fields');
            return res.redirect('/auth/reset-password/' + token);
        }

        if (password.length < 6) {
            req.flash('error', 'Password must be at least 6 characters long');
            return res.redirect('/auth/reset-password/' + token);
        }

        if (password !== confirm_password) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/auth/reset-password/' + token);
        }

        const success = await User.resetPassword(token, password);

        if (!success) {
            req.flash('error', 'Invalid or expired password reset link');
            return res.redirect('/auth/forgot-password');
        }

        req.flash('success', 'Password reset successfully! You can now login with your new password.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Reset password error:', error);
        req.flash('error', 'An error occurred. Please try again.');
        res.redirect('/auth/reset-password/' + token);
    }
};
