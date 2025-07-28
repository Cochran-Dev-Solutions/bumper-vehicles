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

-- Beta testers table
CREATE TABLE IF NOT EXISTS beta_testers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    username VARCHAR(50) UNIQUE NULL, -- For game login
    password_hash VARCHAR(255) NULL, -- For game login
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_amount DECIMAL(10,2) DEFAULT 1.00,
    payment_method VARCHAR(50), -- 'paypal', 'stripe', etc.
    payment_transaction_id VARCHAR(255),
    payment_date TIMESTAMP NULL,
    beta_access_granted BOOLEAN DEFAULT FALSE,
    access_granted_at TIMESTAMP NULL,
    ip_address VARCHAR(45), -- IPv6 compatible
    user_agent TEXT,
    signup_source VARCHAR(50) DEFAULT 'landing_page', -- 'landing_page', 'referral', etc.
    is_active BOOLEAN DEFAULT TRUE, -- For game login
    last_login_at TIMESTAMP NULL, -- For game login
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Add indexes for better performance
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_payment_status (payment_status),
    INDEX idx_beta_access_granted (beta_access_granted),
    INDEX idx_ip_address (ip_address),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at),
    INDEX idx_payment_transaction_id (payment_transaction_id)
);

-- Newsletter confirmation tokens table
CREATE TABLE IF NOT EXISTS newsletter_confirmations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL,
    confirmation_token VARCHAR(64) UNIQUE NOT NULL,
    is_confirmed BOOLEAN DEFAULT FALSE,
    confirmed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    -- Add indexes for better performance
    INDEX idx_email (email),
    INDEX idx_confirmation_token (confirmation_token),
    INDEX idx_is_confirmed (is_confirmed),
    INDEX idx_expires_at (expires_at)
);
