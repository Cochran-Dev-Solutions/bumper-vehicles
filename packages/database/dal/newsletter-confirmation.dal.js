import database from '../index.js';

class NewsletterConfirmationDal {
    constructor() {
        this.tableName = 'newsletter_confirmations';
    }

    // Create a new newsletter confirmation token
    async createConfirmationToken(email, confirmationToken, expiresAt) {
        try {
            const query = `
                INSERT INTO ${this.tableName} (email, confirmation_token, expires_at)
                VALUES (?, ?, ?)
            `;
            
            const connection = database.getConnection();
            const [result] = await connection.query(query, [email, confirmationToken, expiresAt]);
            
            return {
                success: true,
                id: result.insertId,
                email,
                confirmationToken,
                expiresAt
            };
        } catch (error) {
            console.error('Error creating newsletter confirmation token:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get confirmation token by token
    async getConfirmationByToken(token) {
        try {
            const query = `
                SELECT * FROM ${this.tableName}
                WHERE confirmation_token = ? AND expires_at > NOW()
            `;
            
            const connection = database.getConnection();
            const [rows] = await connection.query(query, [token]);
            
            if (rows.length === 0) {
                return {
                    success: false,
                    error: 'Token not found or expired'
                };
            }
            
            return {
                success: true,
                data: rows[0]
            };
        } catch (error) {
            console.error('Error getting newsletter confirmation by token:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get confirmation by email
    async getConfirmationByEmail(email) {
        try {
            const query = `
                SELECT * FROM ${this.tableName}
                WHERE email = ? AND expires_at > NOW()
                ORDER BY created_at DESC
                LIMIT 1
            `;
            
            const connection = database.getConnection();
            const [rows] = await connection.query(query, [email]);
            
            if (rows.length === 0) {
                return {
                    success: false,
                    error: 'No active confirmation found for this email'
                };
            }
            
            return {
                success: true,
                data: rows[0]
            };
        } catch (error) {
            console.error('Error getting newsletter confirmation by email:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Mark confirmation as confirmed
    async confirmToken(token) {
        try {
            const query = `
                UPDATE ${this.tableName}
                SET is_confirmed = TRUE, confirmed_at = NOW()
                WHERE confirmation_token = ? AND expires_at > NOW() AND is_confirmed = FALSE
            `;
            
            const connection = database.getConnection();
            const [result] = await connection.query(query, [token]);
            
            if (result.affectedRows === 0) {
                return {
                    success: false,
                    error: 'Token not found, expired, or already confirmed'
                };
            }
            
            return {
                success: true,
                message: 'Confirmation successful'
            };
        } catch (error) {
            console.error('Error confirming newsletter token:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Delete expired confirmations
    async deleteExpiredConfirmations() {
        try {
            const query = `
                DELETE FROM ${this.tableName}
                WHERE expires_at < NOW()
            `;
            
            const connection = database.getConnection();
            const [result] = await connection.query(query);
            
            return {
                success: true,
                deletedCount: result.affectedRows
            };
        } catch (error) {
            console.error('Error deleting expired newsletter confirmations:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Check if email has a confirmed subscription
    async isEmailConfirmed(email) {
        try {
            const query = `
                SELECT COUNT(*) as count FROM ${this.tableName}
                WHERE email = ? AND is_confirmed = TRUE
            `;
            
            const connection = database.getConnection();
            const [rows] = await connection.query(query, [email]);
            
            return {
                success: true,
                isConfirmed: rows[0].count > 0
            };
        } catch (error) {
            console.error('Error checking if email is confirmed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

export default NewsletterConfirmationDal; 