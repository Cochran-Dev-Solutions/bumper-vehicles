# Frontend Environment Variables Setup

## ConvertKit Integration (Frontend Only)

The frontend now handles all ConvertKit API calls directly. Add these environment variables to your frontend `.env` file:

```env
# ConvertKit API Configuration (Frontend)
VITE_CONVERTKIT_API_KEY=your_convertkit_api_key
VITE_CONVERTKIT_API_SECRET=your_convertkit_api_secret
VITE_CONVERTKIT_FORM_ID=your_form_id

# API URLs
VITE_LOCAL_API_URL=http://localhost:3000
VITE_PROD_API_URL=https://api.bumpervehicles.com

# Environment
VITE_NODE_ENV=development
```

## Backend Environment Variables (No ConvertKit Needed)

The backend no longer needs ConvertKit environment variables since all ConvertKit operations are handled on the frontend:

```env
# Email Configuration (Backend)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
CONTACT_EMAIL=your_contact_email@example.com

# Other backend variables remain the same
```

## Security Note

- The ConvertKit API key and secret are now exposed to the frontend
- This is acceptable for ConvertKit as they are designed for client-side use
- The API secret is only used for read operations (checking subscriber status)
- The API key is used for adding subscribers (which requires form ID validation)

## Flow Summary

1. **User submits newsletter form** → Frontend checks if already subscribed via ConvertKit API
2. **If not subscribed** → Backend sends confirmation email
3. **User clicks email link** → Backend confirms subscription and redirects to success page
4. **Success page loads** → Frontend automatically adds user to ConvertKit
5. **User sees confirmation** → Subscription complete

## Migration Steps

1. Add the frontend environment variables to your landing page `.env` file
2. Remove ConvertKit environment variables from backend (if any)
3. Deploy the updated code
4. Test the newsletter subscription flow

## Cost Savings

This change eliminates the need for VPC endpoints for ConvertKit API calls, saving approximately $14.40/month in AWS costs.
