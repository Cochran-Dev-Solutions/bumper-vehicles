import axios from 'axios';

class PayPalService {
    constructor() {
        this.clientId = process.env.PAYPAL_CLIENT_ID;
        this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
        this.isProduction = process.env.NODE_ENV === 'production';
        this.baseUrl = this.isProduction 
            ? 'https://api-m.paypal.com' 
            : 'https://api-m.sandbox.paypal.com';
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    // Get access token
    async getAccessToken() {
        if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }

        try {
            const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
            const response = await axios.post(`${this.baseUrl}/v1/oauth2/token`, 
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);

            return this.accessToken;
        } catch (error) {
            console.error('PayPal getAccessToken error:', error.response?.data || error.message);
            throw error;
        }
    }

    // Create payment
    async createPayment(amount, currency = 'USD', description = 'Beta Access Fee', customData = {}) {
        try {
            console.log('Creating PayPal payment with:', { amount, currency, description, customData });
            
            const token = await this.getAccessToken();
            console.log('Got access token:', !!token);
            
            const returnUrl = this.isProduction 
                ? `${process.env.PROD_API_URL || 'https://api.bumpervehicles.com'}/payment/success`
                : `${process.env.API_URL || 'http://localhost:3000'}/payment/success`;
            const cancelUrl = this.isProduction 
                ? `${process.env.PROD_LANDING_PAGE_HOST_URL || 'https://bumpervehicles.com'}/?payment=cancelled`
                : `${process.env.LANDING_PAGE_HOST_URL || 'http://localhost:5174'}/?payment=cancelled`;
            
            console.log('Return URL:', returnUrl);
            console.log('Cancel URL:', cancelUrl);
            
            const payload = {
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: currency,
                        value: amount.toString()
                    },
                    description: description,
                    custom_id: JSON.stringify(customData) // Store custom data in custom_id
                }],
                application_context: {
                    return_url: returnUrl,
                    cancel_url: cancelUrl
                }
            };

            console.log('PayPal payload:', JSON.stringify(payload, null, 2));

            const response = await axios.post(`${this.baseUrl}/v2/checkout/orders`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('PayPal response:', JSON.stringify(response.data, null, 2));

            return {
                success: true,
                orderId: response.data.id,
                approvalUrl: response.data.links.find(link => link.rel === 'approve').href
            };
        } catch (error) {
            console.error('PayPal createPayment error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Capture payment
    async capturePayment(orderId) {
        try {
            const token = await this.getAccessToken();
            
            const response = await axios.post(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                transactionId: response.data.purchase_units[0].payments.captures[0].id,
                status: response.data.status,
                amount: response.data.purchase_units[0].payments.captures[0].amount.value,
                currency: response.data.purchase_units[0].payments.captures[0].amount.currency_code
            };
        } catch (error) {
            console.error('PayPal capturePayment error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Get payment details
    async getPaymentDetails(orderId) {
        try {
            const token = await this.getAccessToken();
            
            const response = await axios.get(`${this.baseUrl}/v2/checkout/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                order: response.data
            };
        } catch (error) {
            console.error('PayPal getPaymentDetails error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Refund payment
    async refundPayment(captureId, amount = null) {
        try {
            const token = await this.getAccessToken();
            
            const payload = amount ? { amount: { value: amount } } : {};
            
            const response = await axios.post(`${this.baseUrl}/v2/payments/captures/${captureId}/refund`, payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                refundId: response.data.id,
                status: response.data.status
            };
        } catch (error) {
            console.error('PayPal refundPayment error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }
}

export default PayPalService; 