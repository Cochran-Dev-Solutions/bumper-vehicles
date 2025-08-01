import database from '../index.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

class BetaUserDal {
    constructor() {
        this.tableName = 'beta_testers';
    }

    // Create a new beta user
    async createBetaUser(email, firstName = null, lastName = null, signupSource = 'landing_page') {
        try {
            // Generate username from email
            const username = this.generateUsername(email);
            
            // Generate secure password
            const password = this.generatePassword();
            
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Create user record
            const query = `
                INSERT INTO beta_testers (email, first_name, last_name, username, password_hash, signup_source, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;
            
            const connection = database.getConnection();
            const [result] = await connection.query(query, [email, firstName, lastName, username, hashedPassword, signupSource]);
            
            return {
                success: true,
                userId: result.insertId,
                username,
                password, // Return plain password for display
                email
            };
        } catch (error) {
            console.error('Error creating beta user:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Verify beta user login
    async verifyBetaUser(username, password) {
        try {
            const query = `
                SELECT id, email, first_name, last_name, username, password_hash
                FROM beta_testers 
                WHERE username = ?
            `;
            
            const connection = database.getConnection();
            const [rows] = await connection.query(query, [username]);
            
            if (rows.length === 0) {
                return {
                    success: false,
                    error: 'Invalid credentials'
                };
            }
            
            const user = rows[0];
            
            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            
            if (!isValidPassword) {
                return {
                    success: false,
                    error: 'Invalid credentials'
                };
            }
            
            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    username: user.username
                }
            };
        } catch (error) {
            console.error('Error verifying beta user:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get beta user by email
    async getBetaUserByEmail(email) {
        try {
            const query = `
                SELECT id, email, first_name, last_name, username, signup_source, created_at
                FROM beta_testers 
                WHERE email = ?
            `;
            
            const connection = database.getConnection();
            const [rows] = await connection.query(query, [email]);
            
            if (rows.length === 0) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }
            
            return {
                success: true,
                user: rows[0]
            };
        } catch (error) {
            console.error('Error getting beta user:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Check if user already exists (for duplicate prevention)
    async checkUserExists(email) {
        try {
            const query = `
                SELECT id, email, username
                FROM beta_testers 
                WHERE email = ?
            `;
            
            const connection = database.getConnection();
            const [rows] = await connection.query(query, [email]);
            
            return {
                success: true,
                exists: rows.length > 0,
                user: rows.length > 0 ? rows[0] : null
            };
        } catch (error) {
            console.error('Error checking if user exists:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get beta user by username
    async getBetaUserByUsername(username) {
        try {
            const query = `
                SELECT id, email, first_name, last_name, username, signup_source, created_at
                FROM beta_testers 
                WHERE username = ?
            `;
            
            const connection = database.getConnection();
            const [rows] = await connection.query(query, [username]);
            
            if (rows.length === 0) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }
            
            return {
                success: true,
                user: rows[0]
            };
        } catch (error) {
            console.error('Error getting beta user by username:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update user information
    async updateBetaUser(userId, updateData) {
        try {
            const allowedFields = ['first_name', 'last_name', 'username', 'password_hash'];
            const updates = [];
            const values = [];
            
            for (const [key, value] of Object.entries(updateData)) {
                if (allowedFields.includes(key) && value !== undefined) {
                    updates.push(`${key} = ?`);
                    values.push(value);
                }
            }
            
            if (updates.length === 0) {
                return {
                    success: false,
                    error: 'No valid fields to update'
                };
            }
            
            updates.push('updated_at = NOW()');
            values.push(userId);
            
            const query = `
                UPDATE beta_testers 
                SET ${updates.join(', ')}
                WHERE id = ?
            `;
            
            const connection = database.getConnection();
            const [result] = await connection.query(query, values);
            
            if (result.affectedRows === 0) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }
            
            return {
                success: true,
                message: 'User updated successfully'
            };
        } catch (error) {
            console.error('Error updating beta user:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate unique username from email
    generateUsername(email) {
        const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        const randomSuffix = crypto.randomBytes(4).toString('hex');
        return `${baseUsername}_${randomSuffix}`;
    }

    // Generate secure password
    generatePassword() {
        return crypto.randomBytes(8).toString('hex');
    }
}

export default BetaUserDal; 