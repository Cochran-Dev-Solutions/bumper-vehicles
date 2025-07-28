import axios from 'axios';

class ConvertKitService {
    constructor() {
        this.apiKey = process.env.CONVERTKIT_API_KEY;
        this.apiSecret = process.env.CONVERTKIT_API_SECRET;
        this.baseUrl = 'https://api.convertkit.com/v3';
        this.formId = process.env.CONVERTKIT_FORM_ID || null;
        this.tagId = process.env.CONVERTKIT_BETA_TAG_ID;
    }

    // Add subscriber to ConvertKit
    async addSubscriber(email, firstName = '', lastName = '', tags = []) {
        try {
            // If we have a form ID, use the form subscription endpoint
            if (this.formId) {
                const payload = {
                    api_key: this.apiKey,
                    email: email,
                    first_name: firstName,
                    tags: tags
                };

                const response = await axios.post(`${this.baseUrl}/forms/${this.formId}/subscribe`, payload);
                
                return {
                    success: true,
                    subscriber: response.data.subscription,
                    subscriberId: response.data.subscription.subscriber.id
                };
            } else {
                // No form ID provided, try to create a simple form
                console.log('No form ID provided, attempting to create a form...');
                
                try {
                                    // Create a simple form
                const formData = {
                    api_key: this.apiKey,
                    form: {
                        name: 'Bumper Vehicles Newsletter',
                        type: 'inline',
                        title: 'Join Bumper Vehicles Newsletter',
                        description: 'Get early access to our multiplayer racing game and stay updated with the latest news!',
                        redirect_url: `${process.env.LANDING_PAGE_HOST_URL || 'http://localhost:5174'}/successfully-subscribed`
                    }
                };
                    
                    const formResponse = await axios.post(`${this.baseUrl}/forms`, formData);
                    this.formId = formResponse.data.form.id;
                    console.log('Created form with ID:', this.formId);
                    
                    // Now add the subscriber using the new form
                    const payload = {
                        api_key: this.apiKey,
                        email: email,
                        first_name: firstName,
                        tags: tags
                    };

                    const response = await axios.post(`${this.baseUrl}/forms/${this.formId}/subscribe`, payload);
                    
                    return {
                        success: true,
                        subscriber: response.data.subscription,
                        subscriberId: response.data.subscription.subscriber.id
                    };
                } catch (formError) {
                    console.error('Failed to create form:', formError.response?.data || formError.message);
                    return {
                        success: false,
                        error: 'Failed to create ConvertKit form. Please create a form manually in ConvertKit and add CONVERTKIT_FORM_ID to your environment variables.'
                    };
                }
            }
        } catch (error) {
            console.error('ConvertKit addSubscriber error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Add beta tester with specific tag
    async addBetaTester(email, firstName = '', lastName = '') {
        const tags = [this.tagId]; // Beta tester tag
        return await this.addSubscriber(email, firstName, lastName, tags);
    }

    // Remove subscriber
    async removeSubscriber(email) {
        try {
            const payload = {
                api_secret: this.apiSecret,
                email: email
            };

            const response = await axios.post(`${this.baseUrl}/unsubscribe`, payload);
            
            return {
                success: true,
                message: 'Subscriber removed successfully'
            };
        } catch (error) {
            console.error('ConvertKit removeSubscriber error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Get subscriber info
    async getSubscriber(email) {
        try {
            console.log('Getting subscriber info for:', email);
            const response = await axios.get(`${this.baseUrl}/subscribers`, {
                params: {
                    api_secret: this.apiSecret,
                    email_address: email
                }
            });

            console.log('ConvertKit subscribers response:', response.data);
            const subscriber = response.data.subscribers[0] || null;
            console.log('Found subscriber:', subscriber);

            return {
                success: true,
                subscriber: subscriber
            };
        } catch (error) {
            console.error('ConvertKit getSubscriber error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Check if subscriber already exists
    async checkSubscriberExists(email) {
        try {
            const result = await this.getSubscriber(email);
            if (result.success && result.subscriber) {
                return {
                    exists: true,
                    subscriber: result.subscriber
                };
            }
            return {
                exists: false
            };
        } catch (error) {
            console.error('ConvertKit checkSubscriberExists error:', error);
            return {
                exists: false,
                error: error.message
            };
        }
    }

    // Check if subscriber is confirmed
    async checkSubscriberStatus(email) {
        try {
            const result = await this.getSubscriber(email);
            if (result.success && result.subscriber) {
                return {
                    exists: true,
                    isConfirmed: result.subscriber.state === 'active',
                    subscriber: result.subscriber
                };
            }
            return {
                exists: false,
                isConfirmed: false
            };
        } catch (error) {
            console.error('ConvertKit checkSubscriberStatus error:', error);
            return {
                exists: false,
                isConfirmed: false,
                error: error.message
            };
        }
    }

    // Update subscriber tags
    async updateSubscriberTags(subscriberId, tags) {
        try {
            const payload = {
                api_secret: this.apiSecret,
                tags: tags
            };

            const response = await axios.put(`${this.baseUrl}/subscribers/${subscriberId}`, payload);
            
            return {
                success: true,
                subscriber: response.data.subscriber
            };
        } catch (error) {
            console.error('ConvertKit updateSubscriberTags error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Send broadcast email
    async sendBroadcast(subject, body, tags = []) {
        try {
            const payload = {
                api_secret: this.apiSecret,
                subject: subject,
                body: body,
                tags: tags
            };

            const response = await axios.post(`${this.baseUrl}/broadcasts`, payload);
            
            return {
                success: true,
                broadcast: response.data.broadcast
            };
        } catch (error) {
            console.error('ConvertKit sendBroadcast error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Resend confirmation email for unconfirmed subscribers
    async resendConfirmationEmail(email, firstName = '', lastName = '', tags = []) {
        try {
            console.log('Starting resend confirmation process for:', email);
            
            // Try to send a custom confirmation email using ConvertKit's transaction endpoint
            const subject = 'Complete Your Newsletter Subscription - Bumper Vehicles';
            const body = `
                <h2>Welcome to Bumper Vehicles Newsletter!</h2>
                <p>Thank you for subscribing to our newsletter. To complete your subscription, please click the confirmation link below:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.LANDING_PAGE_HOST_URL || 'http://localhost:5174'}/successfully-subscribed" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                        Confirm Subscription
                    </a>
                </div>
                
                <p>If you didn't sign up for our newsletter, you can safely ignore this email.</p>
                
                <p>Best regards,<br>The Bumper Vehicles Team</p>
            `;

            const payload = {
                api_secret: this.apiSecret,
                subject: subject,
                body: body,
                email_address: email
            };

            console.log('Sending custom confirmation email via transaction...');
            const response = await axios.post(`${this.baseUrl}/transactions`, payload);
            
            console.log('Transaction result:', response.data);
            
            return {
                success: true,
                transaction: response.data.transaction,
                subscriberId: 'custom-confirmation-sent'
            };
        } catch (error) {
            console.error('ConvertKit resendConfirmationEmail error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }

    // Send beta credentials email
    async sendBetaCredentialsEmail(email, username, password) {
        try {
            const subject = 'Your Bumper Vehicles Beta Access Credentials';
            const body = `
                <h2>Welcome to Bumper Vehicles Beta!</h2>
                <p>Thank you for your payment and interest in our multiplayer racing game.</p>
                
                <h3>Your Beta Access Credentials:</h3>
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>Password:</strong> ${password}</p>
                
                <h3>Important Information:</h3>
                <ul>
                    <li>Keep these credentials safe - they cannot be reset</li>
                    <li>You'll receive an email verification code each time you log in</li>
                    <li>Login sessions will persist via local storage</li>
                </ul>
                
                <h3>How to Access the Beta:</h3>
                <p>Visit <a href="https://app.bumpervehicles.com">https://app.bumpervehicles.com</a> and log in with your credentials above.</p>
                
                <p>If you have any issues, please reply to this email for support.</p>
                
                <p>Happy racing!</p>
                <p>- The Bumper Vehicles Team</p>
            `;

            // Send to specific email address
            const payload = {
                api_secret: this.apiSecret,
                subject: subject,
                body: body,
                email_address: email
            };

            const response = await axios.post(`${this.baseUrl}/transactions`, payload);
            
            return {
                success: true,
                transaction: response.data.transaction
            };
        } catch (error) {
            console.error('ConvertKit sendBetaCredentialsEmail error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data || error.message
            };
        }
    }
}

export default ConvertKitService; 