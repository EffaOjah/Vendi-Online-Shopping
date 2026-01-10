const db = require('./db');
const { hashPassword, comparePassword, generateResetToken } = require('../utils/passwordUtils');

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
}

module.exports = User;
