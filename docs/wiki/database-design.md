# Database Design

## Overview

The Bumper Vehicles project uses a MySQL database with a well-structured design that supports user management, game sessions, beta testing, and email marketing. The database layer is implemented as a shared package (`packages/database`) that provides Data Access Layer (DAL) abstractions and model definitions.

## Database Schema

### Core Tables

#### Users Table

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    is_beta_user BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    profile_data JSON
);
```

#### Beta Users Table

```sql
CREATE TABLE beta_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    credentials_sent_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    beta_code VARCHAR(50) UNIQUE,
    payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending'
);
```

#### Unverified Users Table

```sql
CREATE TABLE unverified_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    verification_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_newsletter_subscriber BOOLEAN DEFAULT FALSE
);
```

#### Game Sessions Table

```sql
CREATE TABLE game_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    host_user_id INT,
    game_type ENUM('multiplayer', 'solo', 'training') NOT NULL,
    map_id VARCHAR(100),
    max_players INT DEFAULT 4,
    current_players INT DEFAULT 0,
    status ENUM('waiting', 'active', 'completed', 'cancelled') DEFAULT 'waiting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    ended_at TIMESTAMP NULL,
    game_data JSON,
    FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

#### Player Sessions Table

```sql
CREATE TABLE player_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(255) NOT NULL,
    user_id INT,
    player_name VARCHAR(100),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    final_score INT DEFAULT 0,
    game_stats JSON,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES game_sessions(session_id) ON DELETE CASCADE
);
```

### Email Marketing Tables

#### Newsletter Subscribers

```sql
CREATE TABLE newsletter_subscribers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    tags JSON,
    source VARCHAR(100),
    last_email_sent TIMESTAMP NULL
);
```

#### Email Templates

```sql
CREATE TABLE email_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_name VARCHAR(100) UNIQUE NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Data Access Layer (DAL)

### Package Structure

```
packages/database/
├── dal/
│   ├── user.dal.js
│   ├── beta-user.dal.js
│   ├── unverified-user.dal.js
│   └── game-session.dal.js
├── models/
│   ├── user.model.js
│   ├── beta-user.model.js
│   └── unverified-user.model.js
└── index.js
```

### DAL Implementation Pattern

Each DAL follows a consistent pattern:

```javascript
// packages/database/dal/user.dal.js
class UserDAL {
  constructor(db) {
    this.db = db;
  }

  async create(userData) {
    const query = `
            INSERT INTO users (email, password_hash, username, profile_data)
            VALUES (?, ?, ?, ?)
        `;
    const [result] = await this.db.execute(query, [
      userData.email,
      userData.passwordHash,
      userData.username,
      JSON.stringify(userData.profileData || {}),
    ]);
    return result.insertId;
  }

  async findByEmail(email) {
    const query = "SELECT * FROM users WHERE email = ?";
    const [rows] = await this.db.execute(query, [email]);
    return rows[0] || null;
  }

  async update(id, updates) {
    const fields = Object.keys(updates)
      .map(key => `${key} = ?`)
      .join(", ");
    const values = Object.values(updates);
    const query = `UPDATE users SET ${fields} WHERE id = ?`;
    await this.db.execute(query, [...values, id]);
  }

  async delete(id) {
    const query = "DELETE FROM users WHERE id = ?";
    await this.db.execute(query, [id]);
  }
}
```

### Model Classes

Models provide data validation and business logic:

```javascript
// packages/database/models/user.model.js
class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.username = data.username;
    this.isVerified = data.is_verified;
    this.isBetaUser = data.is_beta_user;
    this.createdAt = new Date(data.created_at);
    this.profileData = data.profile_data ? JSON.parse(data.profile_data) : {};
  }

  static validate(userData) {
    const errors = [];

    if (!userData.email || !userData.email.includes("@")) {
      errors.push("Valid email is required");
    }

    if (userData.username && userData.username.length < 3) {
      errors.push("Username must be at least 3 characters");
    }

    return errors;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      isVerified: this.isVerified,
      isBetaUser: this.isBetaUser,
      createdAt: this.createdAt,
      profileData: this.profileData,
    };
  }
}
```

## Database Integration

### Connection Pooling

```javascript
// packages/database/index.js
const mysql = require("mysql2/promise");

class Database {
  constructor(config) {
    this.pool = mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true,
    });
  }

  async getConnection() {
    return await this.pool.getConnection();
  }

  async execute(query, params = []) {
    const connection = await this.getConnection();
    try {
      return await connection.execute(query, params);
    } finally {
      connection.release();
    }
  }

  async transaction(callback) {
    const connection = await this.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}
```

### Backend Integration

The database package is integrated into the backend server:

```javascript
// apps/server/server.js
const Database = require("@bumper-vehicles/database");
const UserDAL = require("@bumper-vehicles/database/dal/user.dal");

// Initialize database
const db = new Database({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Initialize DALs
const userDAL = new UserDAL(db);

// Use in controllers
app.post("/api/auth/register", async (request, reply) => {
  try {
    const userData = request.body;
    const errors = User.validate(userData);

    if (errors.length > 0) {
      return reply.code(400).send({ errors });
    }

    const userId = await userDAL.create(userData);
    const user = await userDAL.findById(userId);

    reply.code(201).send(user.toJSON());
  } catch (error) {
    reply.code(500).send({ error: "Registration failed" });
  }
});
```

## Data Relationships

### User Relationships

- **One-to-Many**: User → Game Sessions (as host)
- **One-to-Many**: User → Player Sessions
- **One-to-One**: User → Beta User (optional)

### Session Relationships

- **One-to-Many**: Game Session → Player Sessions
- **Many-to-One**: Player Session → User (optional, for guest players)

### Email Marketing Relationships

- **One-to-Many**: Newsletter Subscriber → Email Templates (through tags)

## Query Optimization

### Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_player_sessions_session ON player_sessions(session_id);
CREATE INDEX idx_beta_users_email ON beta_users(email);
```

### Prepared Statements

All database queries use prepared statements to prevent SQL injection and improve performance:

```javascript
// Example: Finding active game sessions
async findActiveSessions() {
    const query = `
        SELECT gs.*, COUNT(ps.id) as player_count
        FROM game_sessions gs
        LEFT JOIN player_sessions ps ON gs.session_id = ps.session_id
        WHERE gs.status = 'active'
        GROUP BY gs.id
        HAVING player_count < gs.max_players
    `;
    const [rows] = await this.db.execute(query);
    return rows;
}
```

## Migration System

### Schema Versioning

```sql
-- Version 1.0.0
CREATE TABLE schema_versions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    version VARCHAR(20) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

INSERT INTO schema_versions (version, description)
VALUES ('1.0.0', 'Initial schema');
```

### Migration Scripts

```javascript
// packages/database/scripts/migrations/
async function migrateToVersion(targetVersion) {
  const currentVersion = await getCurrentVersion();
  const migrations = getMigrationsBetween(currentVersion, targetVersion);

  for (const migration of migrations) {
    await executeMigration(migration);
    await updateSchemaVersion(migration.version);
  }
}
```

## Backup and Recovery

### Automated Backups

```bash
#!/bin/bash
# scripts/backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > backup_$DATE.sql
gzip backup_$DATE.sql
aws s3 cp backup_$DATE.sql.gz s3://bumper-vehicles-backups/
```

### Recovery Procedures

1. **Point-in-time recovery** using binary logs
2. **Full restore** from S3 backups
3. **Incremental restore** for recent changes

## Security Considerations

### Data Encryption

- **At Rest**: Database files encrypted with AES-256
- **In Transit**: TLS 1.3 for all connections
- **Sensitive Fields**: Password hashes using bcrypt with salt

### Access Control

```sql
-- Create application user with limited privileges
CREATE USER 'bumper_app'@'%' IDENTIFIED BY 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON bumper_vehicles.* TO 'bumper_app'@'%';
REVOKE CREATE, DROP, ALTER ON bumper_vehicles.* FROM 'bumper_app'@'%';
```

### Audit Logging

```sql
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

## Performance Monitoring

### Query Performance

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Monitor query performance
SELECT
    table_name,
    index_name,
    cardinality,
    sub_part,
    packed,
    null,
    index_type
FROM information_schema.statistics
WHERE table_schema = 'bumper_vehicles';
```

### Connection Pool Monitoring

```javascript
// Monitor connection pool health
setInterval(() => {
  const poolStats = db.pool.pool;
  console.log("Pool stats:", {
    totalConnections: poolStats.totalConnections,
    idleConnections: poolStats.idleConnections,
    activeConnections: poolStats.activeConnections,
  });
}, 60000);
```

## Testing

### Unit Tests

```javascript
// packages/database/__tests__/user.dal.test.js
describe("UserDAL", () => {
  let userDAL;
  let testDb;

  beforeEach(async () => {
    testDb = new Database(testConfig);
    userDAL = new UserDAL(testDb);
    await setupTestDatabase();
  });

  test("should create user successfully", async () => {
    const userData = {
      email: "test@example.com",
      passwordHash: "hashed_password",
      username: "testuser",
    };

    const userId = await userDAL.create(userData);
    expect(userId).toBeGreaterThan(0);

    const user = await userDAL.findById(userId);
    expect(user.email).toBe(userData.email);
  });
});
```

### Integration Tests

```javascript
// Test database transactions
test("should handle transaction rollback on error", async () => {
  await expect(async () => {
    await db.transaction(async connection => {
      await userDAL.create({ email: "test1@example.com" });
      throw new Error("Simulated error");
    });
  }).rejects.toThrow("Simulated error");

  // Verify no user was created
  const user = await userDAL.findByEmail("test1@example.com");
  expect(user).toBeNull();
});
```

This database design provides a robust foundation for the Bumper Vehicles application, with proper separation of concerns, security measures, and performance optimization strategies.
