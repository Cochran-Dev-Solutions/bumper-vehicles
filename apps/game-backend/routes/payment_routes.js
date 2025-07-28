import paypalService from '@bumper-vehicles/payment';
import { sendBetaCredentialsEmail } from '../src/email_templates/index.js';
import BetaUserDal from '../../../packages/database/dal/beta-user.dal.js';

const betaUserDal = new BetaUserDal();

export function registerPaymentRoutes(fastify) {
    // PayPal payment capture (webhook)
    fastify.post('/payment/capture', {
        schema: {
            tags: ['Payment'],
            summary: 'Capture PayPal payment',
            description: 'Webhook endpoint to capture a PayPal payment after approval',
            body: {
                type: 'object',
                required: ['orderId'],
                properties: {
                    orderId: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        transactionId: { type: 'string' },
                        status: { type: 'string' }
                    }
                },
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { orderId } = request.body;

            if (!orderId) {
                return reply.status(400).send({ error: 'Order ID is required' });
            }

            // Capture payment
            const captureResult = await paypalService.capturePayment(orderId);

            if (!captureResult.success) {
                return reply.status(500).send({ error: 'Failed to capture payment' });
            }

            return reply.send({
                success: true,
                transactionId: captureResult.transactionId,
                status: captureResult.status
            });
        } catch (error) {
            console.error('Payment capture error:', error);
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // PayPal payment success callback
    fastify.get('/payment/success', {
        schema: {
            tags: ['Payment'],
            summary: 'PayPal payment success callback',
            description: 'Callback endpoint for successful PayPal payments. Creates beta user account and sends credentials.',
            querystring: {
                type: 'object',
                properties: {
                    token: { type: 'string' },
                    PayerID: { type: 'string' }
                }
            }
        }
    }, async (request, reply) => {
        try {
            const { token, PayerID } = request.query;
            
            if (!token) {
                return reply.status(400).send({ error: 'Payment token is required' });
            }

            console.log('PayPal success callback received:', { token, PayerID });

            // Capture the payment
            const captureResult = await paypalService.capturePayment(token);

            if (!captureResult.success) {
                console.error('Failed to capture payment:', captureResult.error);
                return reply.status(500).send({ error: 'Failed to capture payment' });
            }

            console.log('Payment captured successfully:', captureResult);

            // Get payment details to extract custom data
            const paymentDetails = await paypalService.getPaymentDetails(token);
            
            if (!paymentDetails.success) {
                console.error('Failed to get payment details:', paymentDetails.error);
                return reply.status(500).send({ error: 'Failed to get payment details' });
            }

            // Extract custom data from the payment
            let customData = {};
            try {
                const customId = paymentDetails.order.purchase_units[0].custom_id;
                if (customId) {
                    customData = JSON.parse(customId);
                }
            } catch (error) {
                console.error('Failed to parse custom data:', error);
            }

            const email = customData.email || 'unknown@example.com';
            const firstName = customData.firstName || '';
            const lastName = customData.lastName || '';

            console.log('Creating beta user account for:', { email, firstName, lastName });

            // Check if user already exists before creating
            const existingUserCheck = await betaUserDal.checkUserExists(email);
            if (existingUserCheck.exists) {
                console.log('User already exists, skipping account creation');
                // User already exists, just send the credentials email
                const existingUser = await betaUserDal.getBetaUserByEmail(email);
                if (existingUser.success) {
                    // Send beta credentials email using our mailer
                    try {
                        await sendBetaCredentialsEmail(email, existingUser.user.username, 'Your existing password');
                        console.log('Beta credentials email sent successfully for existing user:', email);
                    } catch (emailError) {
                        console.error('Failed to send beta credentials email:', emailError.message);
                    }

                    // Redirect to beta credentials page
                    const credentialsUrl = `${process.env.LANDING_PAGE_HOST_URL || 'http://localhost:5174'}/beta-credentials?username=${encodeURIComponent(existingUser.user.username)}&password=Your existing password&email=${encodeURIComponent(email)}`;
                    console.log('Redirecting to beta credentials page:', credentialsUrl);
                    return reply.redirect(credentialsUrl);
                }
            }

            // Create new beta user account
            const betaUserResult = await betaUserDal.createBetaUser(email, firstName, lastName);

            if (!betaUserResult.success) {
                console.error('Failed to create beta user:', betaUserResult.error);
                return reply.status(500).send({ error: 'Failed to create beta user account' });
            }

            console.log('Beta user created successfully:', betaUserResult);

            // Send beta credentials email using our mailer
            try {
                await sendBetaCredentialsEmail(email, betaUserResult.username, betaUserResult.password);
                console.log('Beta credentials email sent successfully for new user:', email);
            } catch (emailError) {
                console.error('Failed to send beta credentials email:', emailError.message);
            }

            // Redirect to beta credentials page
            const credentialsUrl = `${process.env.LANDING_PAGE_HOST_URL || 'http://localhost:5174'}/beta-credentials?username=${encodeURIComponent(betaUserResult.username)}&password=${encodeURIComponent(betaUserResult.password)}&email=${encodeURIComponent(email)}`;
            
            console.log('Redirecting to beta credentials page:', credentialsUrl);
            return reply.redirect(credentialsUrl);
        } catch (error) {
            console.error('Payment success error:', error);
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // PayPal payment cancel page
    fastify.get('/payment/cancel', {
        schema: {
            tags: ['Payment'],
            summary: 'PayPal payment cancel callback',
            description: 'Callback endpoint for cancelled PayPal payments. Redirects to landing page with cancel message.'
        }
    }, async (request, reply) => {
        console.log('Payment cancelled by user');
        const cancelUrl = `${process.env.LANDING_PAGE_HOST_URL || 'http://localhost:5174'}/?payment=cancelled`;
        return reply.redirect(cancelUrl);
    });
} 