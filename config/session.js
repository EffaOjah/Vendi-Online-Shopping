const session = require('express-session');

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'vendi-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    },
    name: 'vendi.sid' // Custom session name
};

module.exports = session(sessionConfig);
