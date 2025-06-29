# @bumper-vehicles/mailer

Email service package for Bumper Vehicles using Nodemailer.

## Features

- Send verification emails with beautiful HTML templates
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
```

## Usage

```javascript
import {
  sendVerificationEmail,
  generateVerificationCode,
  generateExpirationTime,
} from "@bumper-vehicles/mailer";

// Generate verification code
const code = generateVerificationCode(); // "123456"
const expiresAt = generateExpirationTime(); // 15 minutes from now

// Send verification email
await sendVerificationEmail("user@example.com", code, "username");
```

## Gmail Setup

For Gmail, you'll need to:

1. Enable 2-factor authentication
2. Generate an "App Password"
3. Use the app password as `SMTP_PASS`

## Email Template

The verification email includes:

- Beautiful gradient header
- 6-digit verification code
- 15-minute expiration notice
- Verification button
- Responsive design
