import database from '../index.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

class BetaUserDal {
    constructor() {
        this.tableName = 'beta_testers';
    }

    // Create a new beta user
    async createBetaUser(email) {
        try {
            // Generate username from email
            const username = this.generateUsername(email);
            
            // Generate secure password
            const password = this.generatePassword();
            
            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);
            
            // Create user record
            const query = `
                INSERT INTO beta_testers (email, username, password_hash, beta_access_granted, access_granted_at, created_at, updated_at)
                VALUES (?, ?, ?, TRUE, NOW(), NOW(), NOW())
            `;
            
            const connection = database.getConnection();
            const [result] = await connection.query(query, [email, username, hashedPassword]);
            
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
                SELECT id, email, username, password_hash, is_active, beta_access_granted
                FROM beta_testers 
                WHERE username = ? AND is_active = 1 AND beta_access_granted = 1
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
            
            // Update last login time
            await this.updateLastLogin(user.id);
            
            return {
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
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
                SELECT id, email, username, is_active, beta_access_granted, created_at
                FROM beta_testers 
                WHERE email = ? AND is_active = 1
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
                SELECT id, email, beta_access_granted, payment_status
                FROM beta_testers 
                WHERE email = ?
            `;
            
            const connection = database.getConnection();
            const [rows] = await connection.query(query, [email]);
            
            if (rows.length > 0) {
                const user = rows[0];
                return {
                    exists: true,
                    hasBetaAccess: user.beta_access_granted === 1,
                    paymentStatus: user.payment_status,
                    userId: user.id
                };
            }
            
            return {
                exists: false
            };
        } catch (error) {
            console.error('Error checking if user exists:', error);
            return {
                exists: false,
                error: error.message
            };
        }
    }



    // Deactivate beta user
    async deactivateBetaUser(userId) {
        try {
            const query = `
                UPDATE beta_testers 
                SET is_active = 0, updated_at = NOW()
                WHERE id = ?
            `;
            
            const connection = database.getConnection();
            await connection.query(query, [userId]);
            
            return {
                success: true
            };
        } catch (error) {
            console.error('Error deactivating beta user:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Update last login time
    async updateLastLogin(userId) {
        try {
            const query = `
                UPDATE beta_testers 
                SET last_login_at = NOW(), updated_at = NOW()
                WHERE id = ?
            `;
            
            const connection = database.getConnection();
            await connection.query(query, [userId]);
            
            return {
                success: true
            };
        } catch (error) {
            console.error('Error updating last login:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate username from email
    generateUsername(email) {
        const baseUsername = email.split('@')[0];
        const randomSuffix = Math.random().toString(36).substring(2, 6);
        return `${baseUsername}_${randomSuffix}`;
    }

    // Generate secure password
    generatePassword() {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        return password;
    }
}

export default BetaUserDal; 