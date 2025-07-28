# Bumper Vehicles - Complete Setup Guide

This guide will walk you through setting up all the integrations for email marketing, payments, and funding platforms.

## 📋 Prerequisites

- Node.js and npm/pnpm installed
- MySQL database running
- Domain name configured (for production)

## 🗄️ Step 1: Database Setup

### 1.1 Run Database Scripts

```bash
# Run the main database script
mysql -u root -p < packages/database/scripts/main.sql

# Run the email marketing and beta testing script
mysql -u root -p < packages/database/scripts/email_marketing_beta.sql
```

### 1.2 Verify Tables Created

The following tables should be created:

- `email_subscribers` - For ConvertKit integration
- `beta_testers` - For beta access management
- `contact_submissions` - For contact form submissions
- `payment_transactions` - For payment tracking

## 📧 Step 2: ConvertKit Email Marketing Setup

### 2.1 Create ConvertKit Account

1. Go to [ConvertKit.com](https://convertkit.com)
2. Sign up for a free account
3. Complete your profile setup

### 2.2 Create Forms and Tags

1. **Create a Landing Page Form:**

   - Go to "Forms" → "Create Form"
   - Choose "Landing Page"
   - Design your form with fields for email, first name, last name
   - Save the form and note the **Form ID**

2. **Create Tags:**
   - Go to "Subscribers" → "Tags"
   - Create these tags:
     - `newsletter-subscriber` (ID: note this)
     - `beta-tester` (ID: note this)
     - `contact-form` (ID: note this)

### 2.3 Get API Credentials

1. Go to "Settings" → "Advanced" → "API"
2. Copy your **API Key** and **API Secret**
3. Note your **Form ID** from step 2.2

### 2.4 Set Up Webhooks (Optional)

1. Go to "Settings" → "Advanced" → "Webhooks"
2. Add webhook URL: `https://your-domain.com/api/marketing/webhooks/convertkit`
3. Select events: `subscriber.subscribe`, `subscriber.unsubscribe`

## 💳 Step 3: PayPal Payment Setup

### 3.1 Create PayPal Business Account

1. Go to [PayPal Business](https://www.paypal.com/business)
2. Sign up for a Business account
3. Verify your business information
4. Complete account verification

### 3.2 Get API Credentials

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Sign in with your PayPal Business account
3. Go to "Apps & Credentials"
4. Create a new app
5. Copy your **Client ID** and **Secret**

### 3.3 Set Up Webhooks

1. In PayPal Developer Dashboard, go to "Webhooks"
2. Add webhook URL: `https://your-domain.com/api/marketing/payment/capture`
3. Select events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`
   - `PAYMENT.CAPTURE.REFUNDED`

### 3.4 Create Donation Button (Optional)

1. Go to PayPal Business → "Tools" → "PayPal Buttons"
2. Create a donation button
3. Copy the button ID for environment variables

## ☕ Step 4: Funding Platforms Setup

### 4.1 Ko-fi Setup

1. Go to [Ko-fi.com](https://ko-fi.com)
2. Sign up and create your profile
3. Customize your page
4. Note your username

### 4.2 Buy Me a Coffee Setup

1. Go to [BuyMeACoffee.com](https://buymeacoffee.com)
2. Sign up and create your profile
3. Customize your page
4. Note your username

### 4.3 Itch.io Setup

1. Go to [Itch.io](https://itch.io)
2. Create an account
3. Set up your profile
4. Note your username

## 🔧 Step 5: Environment Variables

Create a `.env` file in your backend with these variables:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bumper_vehicles
DB_PORT=3306

# ConvertKit Email Marketing
CONVERTKIT_API_KEY=your_convertkit_api_key
CONVERTKIT_API_SECRET=your_convertkit_api_secret
CONVERTKIT_FORM_ID=your_form_id
CONVERTKIT_BETA_TAG_ID=your_beta_tag_id

# PayPal Payments
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_DONATION_LINK=https://www.paypal.com/donate/?hosted_button_id=your_button_id
PAYPAL_BUTTON_ID=your_paypal_button_id

# Funding Platforms
KOFI_USERNAME=your_kofi_username
BUYMEACOFFEE_USERNAME=your_buymeacoffee_username
ITCHIO_USERNAME=your_itchio_username

# Frontend URLs
FRONTEND_URL=http://localhost:5174
PROD_FRONTEND_URL=https://app.bumpervehicles.com

# Backend URLs
API_URL=http://localhost:3000
PROD_API_URL=https://app.bumpervehicles.com

# Mailer Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
CONTACT_EMAIL=your_contact_email@example.com

# Environment
NODE_ENV=development
```

## 📦 Step 6: Install Dependencies

```bash
# Install axios in the mailer package
cd packages/mailer
npm install axios

# Install dependencies in the backend
cd apps/game-backend
npm install

# Install dependencies in the landing page
cd apps/landing-page
npm install
```

## 🚀 Step 7: Test the Setup

### 7.1 Test Email Subscription

1. Start your backend server
2. Go to your landing page
3. Try subscribing to the newsletter
4. Check ConvertKit dashboard for new subscriber

### 7.2 Test Contact Form

1. Submit a contact form
2. Check your database for the submission
3. Verify email notification (if configured)

### 7.3 Test Beta Signup

1. Try the beta signup form
2. Verify PayPal payment creation
3. Check ConvertKit for beta tag

## 🔍 Step 8: Monitoring and Analytics

### 8.1 ConvertKit Analytics

- Go to "Analytics" → "Forms" to see conversion rates
- Check "Subscribers" → "Tags" to see subscriber segments
- Monitor email open rates and click-through rates

### 8.2 PayPal Analytics

- Check PayPal Business dashboard for payment analytics
- Monitor webhook delivery in PayPal Developer Dashboard
- Track refund rates and dispute resolution

### 8.3 Database Monitoring

```sql
-- Check email subscribers
SELECT * FROM email_subscribers WHERE is_active = 1;

-- Check beta testers
SELECT * FROM beta_testers WHERE payment_status = 'paid';

-- Check contact submissions
SELECT * FROM contact_submissions WHERE status = 'new';
```

## 🛠️ Step 9: Production Deployment

### 9.1 Environment Variables

Update your production environment variables:

- Set `NODE_ENV=production`
- Use production API URLs
- Use production PayPal credentials

### 9.2 SSL Certificates

Ensure your domain has SSL certificates for secure payments and webhooks.

### 9.3 Database Backups

Set up regular database backups for your production database.

## 📞 Step 10: Support and Troubleshooting

### Common Issues:

1. **ConvertKit API Errors:**

   - Verify API credentials
   - Check form ID and tag IDs
   - Ensure webhook URLs are accessible

2. **PayPal Payment Issues:**

   - Verify PayPal credentials
   - Check webhook delivery
   - Test with PayPal sandbox first

3. **Database Connection Issues:**
   - Verify database credentials
   - Check database server status
   - Ensure tables are created

### Support Resources:

- [ConvertKit API Documentation](https://developers.convertkit.com/)
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [Ko-fi API Documentation](https://docs.ko-fi.com/)

## 🎯 Next Steps

1. **Customize Email Templates:** Create branded email templates in ConvertKit
2. **Set Up Automated Workflows:** Create email sequences for beta testers
3. **Implement Analytics:** Add Google Analytics or similar tracking
4. **Create Admin Dashboard:** Build an admin interface for managing subscribers and payments
5. **Set Up Monitoring:** Implement error monitoring and alerting

---

**Need Help?** If you encounter any issues during setup, check the troubleshooting section or reach out for support.
