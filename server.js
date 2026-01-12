const express = require('express');
const app = express();
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cookie parser for remember me functionality
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Rate limiting
const { apiLimiter } = require('./middleware/rateLimiter');
// app.use('/api/', apiLimiter); // Apply to API routes if they exist
// Or apply globally if desired:
app.use(apiLimiter);

// Session configuration
const sessionMiddleware = require('./config/session');
const flash = require('connect-flash');

app.use(sessionMiddleware);
app.use(flash());

// Authentication middleware
const { attachUser } = require('./middleware/auth');
app.use(attachUser);

// Routes
const mainRoutes = require('./routes/index');
const pagesRoutes = require('./routes/pagesRoutes');
const legalRoutes = require('./routes/legalRoutes');
const supportRoutes = require('./routes/supportRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/', mainRoutes);
app.use('/', pagesRoutes);
app.use('/legal', legalRoutes);
app.use('/support', supportRoutes);
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/product', productRoutes);


// 404 Middleware
app.use((req, res, next) => {
    res.status(404).render('404', { title: '404 - Page Not Found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});