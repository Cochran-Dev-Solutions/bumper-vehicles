-- Create the database
CREATE DATABASE IF NOT EXISTS bumper_vehicles;
USE bumper_vehicles;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Add indexes for better performance
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_created_at (created_at)
);

-- Create unverified_users table for email verification
CREATE TABLE IF NOT EXISTS unverified_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    -- Add indexes for better performance
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_verification_code (verification_code),
    INDEX idx_expires_at (expires_at)
);

-- Insert test data (without passwords for now)
INSERT INTO users (username, email, display_name, password, created_at, updated_at) VALUES
('john_doe', 'john@example.com', 'John Doe', 'hashed_password_here', '2024-01-01 00:00:00', '2024-01-01 00:00:00'),
('jane_smith', 'jane@example.com', 'Jane Smith', 'hashed_password_here', '2024-01-02 00:00:00', '2024-01-02 00:00:00'),
('bob_wilson', 'bob@example.com', 'Bob Wilson', 'hashed_password_here', '2024-01-03 00:00:00', '2024-01-03 00:00:00');

-- Show the created data
SELECT * FROM users; 

-- INSERT INTO users (username, email, password, display_name) VALUES ("bumper_master", "nacochranpb@gmail.com", "$2a$10$hlSD8xFvvtBZRGaQVBm9C.2TLQZmcJozSgtK0wKaaxTHEvt5GzogS", "Bumper Master");