import mysql from "mysql2/promise";

class UserModel {
  constructor(connection) {
    this.connection = connection;
  }

  // Create a new user
  async create(userData) {
    const { username, email, display_name, password } = userData;
    const query = `
      INSERT INTO users (username, email, display_name, password) 
      VALUES (?, ?, ?, ?)
    `;

    try {
      const [result] = await this.connection.execute(query, [
        username,
        email,
        display_name,
        password,
      ]);
      return { id: result.insertId, username, email, display_name };
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Find all users
  async findAll() {
    const query = "SELECT * FROM users ORDER BY created_at DESC";

    try {
      const [rows] = await this.connection.execute(query);
      return rows;
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  }

  // Find user by ID
  async findById(id) {
    const query = "SELECT * FROM users WHERE id = ?";

    try {
      const [rows] = await this.connection.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch user by ID: ${error.message}`);
    }
  }

  // Find user by username
  async findByUsername(username) {
    const query = "SELECT * FROM users WHERE username = ?";

    try {
      const [rows] = await this.connection.execute(query, [username]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch user by username: ${error.message}`);
    }
  }

  // Find user by email
  async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = ?";

    try {
      const [rows] = await this.connection.execute(query, [email]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to fetch user by email: ${error.message}`);
    }
  }

  // Find user by username or email (for login)
  async findByUsernameOrEmail(identifier) {
    const query = "SELECT * FROM users WHERE username = ? OR email = ?";

    try {
      const [rows] = await this.connection.execute(query, [
        identifier,
        identifier,
      ]);
      return rows[0] || null;
    } catch (error) {
      throw new Error(
        `Failed to fetch user by username or email: ${error.message}`
      );
    }
  }

  // Update user by ID
  async updateById(id, updateData) {
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);

    if (fields.length === 0) {
      throw new Error("No fields to update");
    }

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const query = `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    try {
      const [result] = await this.connection.execute(query, [...values, id]);

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Delete user by ID
  async deleteById(id) {
    const query = "DELETE FROM users WHERE id = ?";

    try {
      const [result] = await this.connection.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // Check if username exists
  async usernameExists(username, excludeId = null) {
    let query = "SELECT COUNT(*) as count FROM users WHERE username = ?";
    let params = [username];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    try {
      const [rows] = await this.connection.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      throw new Error(`Failed to check username existence: ${error.message}`);
    }
  }

  // Check if email exists
  async emailExists(email, excludeId = null) {
    let query = "SELECT COUNT(*) as count FROM users WHERE email = ?";
    let params = [email];

    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    try {
      const [rows] = await this.connection.execute(query, params);
      return rows[0].count > 0;
    } catch (error) {
      throw new Error(`Failed to check email existence: ${error.message}`);
    }
  }
}

export { UserModel };
