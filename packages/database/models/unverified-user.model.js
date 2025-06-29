import mysql from "mysql2/promise";

class UnverifiedUserModel {
  constructor(connection) {
    this.connection = connection;
  }

  // Create a new unverified user
  async create(userData) {
    const { username, email, password, verification_code, expires_at } =
      userData;
    const query = `
      INSERT INTO unverified_users (username, email, password, verification_code, expires_at) 
      VALUES (?, ?, ?, ?, ?)
    `;

    try {
      const [result] = await this.connection.execute(query, [
        username,
        email,
        password,
        verification_code,
        expires_at,
      ]);
      return { id: result.insertId, username, email, verification_code };
    } catch (error) {
      throw new Error(`Failed to create unverified user: ${error.message}`);
    }
  }

  // Find unverified user by email
  async findByEmail(email) {
    const query = "SELECT * FROM unverified_users WHERE email = ?";

    try {
      const [rows] = await this.connection.execute(query, [email]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(
        `Failed to fetch unverified user by email: ${error.message}`
      );
    }
  }

  // Find unverified user by verification code
  async findByVerificationCode(verification_code) {
    const query =
      "SELECT * FROM unverified_users WHERE verification_code = ? AND expires_at > NOW()";

    try {
      const [rows] = await this.connection.execute(query, [verification_code]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(
        `Failed to fetch unverified user by verification code: ${error.message}`
      );
    }
  }

  // Delete unverified user by ID
  async deleteById(id) {
    const query = "DELETE FROM unverified_users WHERE id = ?";

    try {
      const [result] = await this.connection.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete unverified user: ${error.message}`);
    }
  }

  // Update verification code for an unverified user
  async updateVerificationCode(email, verification_code, expires_at) {
    const query = `
      UPDATE unverified_users 
      SET verification_code = ?, expires_at = ? 
      WHERE email = ?
    `;

    try {
      const [result] = await this.connection.execute(query, [
        verification_code,
        expires_at,
        email,
      ]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to update verification code: ${error.message}`);
    }
  }

  // Check if username exists in unverified_users
  async usernameExists(username) {
    const query =
      "SELECT COUNT(*) as count FROM unverified_users WHERE username = ?";

    try {
      const [rows] = await this.connection.execute(query, [username]);
      return rows[0].count > 0;
    } catch (error) {
      throw new Error(
        `Failed to check username existence in unverified_users: ${error.message}`
      );
    }
  }

  // Check if email exists in unverified_users
  async emailExists(email) {
    const query =
      "SELECT COUNT(*) as count FROM unverified_users WHERE email = ?";

    try {
      const [rows] = await this.connection.execute(query, [email]);
      return rows[0].count > 0;
    } catch (error) {
      throw new Error(
        `Failed to check email existence in unverified_users: ${error.message}`
      );
    }
  }

  // Check if verification code exists and is not expired
  async verificationCodeExists(verification_code) {
    const query =
      "SELECT COUNT(*) as count FROM unverified_users WHERE verification_code = ? AND expires_at > NOW()";

    try {
      const [rows] = await this.connection.execute(query, [verification_code]);
      return rows[0].count > 0;
    } catch (error) {
      throw new Error(
        `Failed to check verification code existence: ${error.message}`
      );
    }
  }

  // Clean up expired verification codes
  async cleanupExpired() {
    const query = "DELETE FROM unverified_users WHERE expires_at <= NOW()";

    try {
      const [result] = await this.connection.execute(query);
      return result.affectedRows;
    } catch (error) {
      throw new Error(
        `Failed to cleanup expired verification codes: ${error.message}`
      );
    }
  }
}

export { UnverifiedUserModel };
