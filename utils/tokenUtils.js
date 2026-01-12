const crypto = require('crypto');
const bcrypt = require('bcrypt');

/**
 * Generate a cryptographically secure remember token
 * Returns a selector and token pair for secure persistent login
 * 
 * The selector is used to look up the token in the database
 * The token is what gets stored in the cookie
 * 
 * @returns {Object} Object containing selector and token
 */
function generateRememberToken() {
    // Generate random bytes for selector (12 bytes = 24 hex chars)
    const selector = crypto.randomBytes(12).toString('hex');
    
    // Generate random bytes for token (32 bytes = 64 hex chars)
    const token = crypto.randomBytes(32).toString('hex');
    
    return { selector, token };
}

/**
 * Hash a token using bcrypt
 * Tokens should always be hashed before storing in database
 * 
 * @param {string} token - Plain text token to hash
 * @returns {Promise<string>} Hashed token
 */
async function hashToken(token) {
    const saltRounds = 10;
    return await bcrypt.hash(token, saltRounds);
}

/**
 * Compare a plain text token with a hashed token
 * 
 * @param {string} plainToken - Plain text token from cookie
 * @param {string} hashedToken - Hashed token from database
 * @returns {Promise<boolean>} True if tokens match
 */
async function compareToken(plainToken, hashedToken) {
    return await bcrypt.compare(plainToken, hashedToken);
}

/**
 * Generate expiration date for remember token
 * Default is 30 days from now
 * 
 * @param {number} days - Number of days until expiration (default: 30)
 * @returns {Date} Expiration date
 */
function getTokenExpiration(days = 30) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    return expirationDate;
}

module.exports = {
    generateRememberToken,
    hashToken,
    compareToken,
    getTokenExpiration
};
