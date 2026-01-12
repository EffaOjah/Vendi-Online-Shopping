const db = require('./db');
const { hashPassword, comparePassword, generateResetToken } = require('../utils/passwordUtils');
const { generateRememberToken, hashToken, compareToken, getTokenExpiration } = require('../utils/tokenUtils');

class User {
    /**
     * Create a new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} Created user
     */
    static async create(userData) {
        const { full_name, email, phone, password } = userData;

        try {
            // Hash the password
            const password_hash = await hashPassword(password);

            // Insert user into database
            const [result] = await db.query(
                'INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)',
                [full_name, email, phone, password_hash]
            );

            return {
                id: result.insertId,
                full_name,
                email,
                phone,
                is_verified: false,
                is_active: true
            };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Email already exists');
            }
            throw error;
        }
    }

    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise<Object|null>} User object or null
     */
    static async findByEmail(email) {
        try {
            const [rows] = await db.query(
                'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
                [email]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Find user by ID
     * @param {number} id - User ID
     * @returns {Promise<Object|null>} User object or null
     */
    static async findById(id) {
        try {
            const [rows] = await db.query(
                'SELECT id, full_name, email, phone, is_verified, is_active, created_at FROM users WHERE id = ?',
                [id]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verify user credentials
     * @param {string} email - User email
     * @param {string} password - Plain text password
     * @returns {Promise<Object|null>} User object if valid, null otherwise
     */
    static async verifyCredentials(email, password) {
        try {
            const user = await this.findByEmail(email);
            if (!user) {
                return null;
            }

            const isValid = await comparePassword(password, user.password_hash);
            if (!isValid) {
                return null;
            }

            // Return user without password hash
            const { password_hash, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Update user password
     * @param {number} userId - User ID
     * @param {string} newPassword - New plain text password
     * @returns {Promise<boolean>} Success status
     */
    static async updatePassword(userId, newPassword) {
        try {
            const password_hash = await hashPassword(newPassword);
            const [result] = await db.query(
                'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
                [password_hash, userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Mark user email as verified
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    static async verifyEmail(userId) {
        try {
            const [result] = await db.query(
                'UPDATE users SET is_verified = TRUE, updated_at = NOW() WHERE id = ?',
                [userId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create password reset token
     * @param {string} email - User email
     * @returns {Promise<string|null>} Reset token or null if user not found
     */
    static async createPasswordResetToken(email) {
        try {
            const user = await this.findByEmail(email);
            if (!user) {
                return null;
            }

            const token = generateResetToken();
            const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

            await db.query(
                'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
                [user.id, token, expiresAt]
            );

            return token;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Validate password reset token
     * @param {string} token - Reset token
     * @returns {Promise<Object|null>} Token data or null if invalid
     */
    static async validateResetToken(token) {
        try {
            const [rows] = await db.query(
                `SELECT prt.*, u.email 
                 FROM password_reset_tokens prt
                 JOIN users u ON prt.user_id = u.id
                 WHERE prt.token = ? AND prt.used = FALSE AND prt.expires_at > NOW()`,
                [token]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Reset password using token
     * @param {string} token - Reset token
     * @param {string} newPassword - New plain text password
     * @returns {Promise<boolean>} Success status
     */
    static async resetPassword(token, newPassword) {
        try {
            const tokenData = await this.validateResetToken(token);
            if (!tokenData) {
                return false;
            }

            // Update password
            await this.updatePassword(tokenData.user_id, newPassword);

            // Mark token as used
            await db.query(
                'UPDATE password_reset_tokens SET used = TRUE WHERE token = ?',
                [token]
            );

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Create a remember token for persistent login
     * @param {number} userId - User ID
     * @returns {Promise<Object>} Object containing selector and token
     */
    static async createRememberToken(userId) {
        try {
            const { selector, token } = generateRememberToken();
            const tokenHash = await hashToken(token);
            const expiresAt = getTokenExpiration(30); // 30 days

            await db.query(
                'INSERT INTO remember_tokens (user_id, selector, token_hash, expires_at) VALUES (?, ?, ?, ?)',
                [userId, selector, tokenHash, expiresAt]
            );

            return { selector, token };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Find user by remember token
     * @param {string} selector - Token selector
     * @param {string} token - Plain text token
     * @returns {Promise<Object|null>} User object if valid, null otherwise
     */
    static async findByRememberToken(selector, token) {
        try {
            const [rows] = await db.query(
                `SELECT rt.*, u.id as user_id, u.full_name, u.email, u.phone, u.is_verified, u.is_active
                 FROM remember_tokens rt
                 JOIN users u ON rt.user_id = u.id
                 WHERE rt.selector = ? AND rt.expires_at > NOW() AND u.is_active = TRUE`,
                [selector]
            );

            if (rows.length === 0) {
                return null;
            }

            const tokenData = rows[0];

            // Verify token
            const isValid = await compareToken(token, tokenData.token_hash);
            if (!isValid) {
                return null;
            }

            // Return user data
            return {
                id: tokenData.user_id,
                full_name: tokenData.full_name,
                email: tokenData.email,
                phone: tokenData.phone,
                is_verified: tokenData.is_verified,
                is_active: tokenData.is_active
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete a specific remember token
     * @param {string} selector - Token selector
     * @returns {Promise<boolean>} Success status
     */
    static async deleteRememberToken(selector) {
        try {
            const [result] = await db.query(
                'DELETE FROM remember_tokens WHERE selector = ?',
                [selector]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Delete all remember tokens for a user
     * @param {number} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    static async deleteAllRememberTokens(userId) {
        try {
            const [result] = await db.query(
                'DELETE FROM remember_tokens WHERE user_id = ?',
                [userId]
            );
            return result.affectedRows >= 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = User;
