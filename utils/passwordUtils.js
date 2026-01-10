const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SALT_ROUNDS = 10;

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
    try {
        const hash = await bcrypt.hash(password, SALT_ROUNDS);
        return hash;
    } catch (error) {
        throw new Error('Error hashing password: ' + error.message);
    }
}

/**
 * Compare a plain text password with a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if password matches
 */
async function comparePassword(password, hash) {
    try {
        const match = await bcrypt.compare(password, hash);
        return match;
    } catch (error) {
        throw new Error('Error comparing password: ' + error.message);
    }
}

/**
 * Generate a secure random token for password reset
 * @returns {string} Random token
 */
function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

module.exports = {
    hashPassword,
    comparePassword,
    generateResetToken
};
