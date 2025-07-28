# @bumper-vehicles/mailer

Email service package for Bumper Vehicles using Nodemailer.

## Features

- Send verification emails with beautiful HTML templates
- Send contact form emails with professional formatting
- Send beta access credentials emails with secure information
- Generate 6-digit verification codes
- Handle email expiration times
- Configurable SMTP settings

## Environment Variables

Add these to your `.env` file:

```env
# SMTP Configuration
MAIL_HOST='smtp.gmail.com'
MAIL_PORT=465
MAIL_USER=
MAIL_PASS=

# Frontend URL (for email links)
FRONTEND_HOST_URL=http://localhost:5173

# Contact form recipient email
CONTACT_EMAIL=your-email@example.com
```

## Usage

```javascript
import {
  sendVerificationEmail,
  sendContactFormEmail,
  sendBetaCredentialsEmail,
  generateVerificationCode,
  generateExpirationTime,
} from "@bumper-vehicles/mailer";

// Generate verification code
const code = generateVerificationCode(); // "123456"
const expiresAt = generateExpirationTime(); // 15 minutes from now

// Send verification email
await sendVerificationEmail("user@example.com", code, "username");

// Send contact form email
await sendContactFormEmail(
  "John Doe",
  "john@example.com",
  "Support Request",
  "Hello, I need help..."
);

// Send beta credentials email
await sendBetaCredentialsEmail(
  "user@example.com",
  "beta_user_123",
  "secure_password_456"
);
```

## Gmail Setup

For Gmail, you'll need to:

1. Enable 2-factor authentication
2. Generate an "App Password"
3. Use the app password as `MAIL_PASS`

## Email Templates

### Verification Email

The verification email includes:

- Beautiful gradient header
- 6-digit verification code
- 15-minute expiration notice
- Verification button
- Responsive design

### Contact Form Email

The contact form email includes:

- Professional header with contact form branding
- Contact information table (name, email, subject, date)
- Formatted message content
- Reply button that opens email client
- Responsive design
- Reply-to header set to sender's email

### Beta Credentials Email

The beta credentials email includes:

- Professional header with beta access branding
- Secure credential display with monospace font
- Important security warnings and IP restrictions
- Direct link to the game
- Support contact information
- Responsive design
