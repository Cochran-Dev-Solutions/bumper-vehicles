import { sendContactFormEmail, sendBetaCredentialsEmail } from '../src/email_templates/index.js';
import BetaUserDal from '../../../packages/database/dal/beta-user.dal.js';

const betaUserDal = new BetaUserDal();

export function registerMarketingRoutes(fastify) {
    // Beta signup with PayPal payment (marketing API version)
    fastify.post('/beta-signup', {
        schema: {
            tags: ['Marketing'],
            summary: 'Beta signup with payment',
            description: 'Create a PayPal payment for beta access and redirect to payment',
            body: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    firstName: { type: 'string' },
                    lastName: { type: 'string' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        approvalUrl: { type: 'string' },
                        orderId: { type: 'string' }
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
            const { email, firstName, lastName } = request.body;

            if (!email) {
                return reply.status(400).send({ error: 'Email is required' });
            }

            console.log('Beta signup with payment request received:', { email, firstName, lastName });

            // Check if user already exists
            const existingUserCheck = await betaUserDal.checkUserExists(email);
            if (existingUserCheck.exists) {
                return reply.status(400).send({ 
                    error: 'A beta account already exists for this email address.' 
                });
            }

            // Import PayPal service
            const paypalService = (await import('@bumper-vehicles/payment')).default;

            // Create PayPal payment
            const paymentResult = await paypalService.createPayment(
                1.00, // $1.00 beta access fee
                'USD',
                'Bumper Vehicles Beta Access Fee',
                {
                    email: email,
                    firstName: firstName || '',
                    lastName: lastName || ''
                }
            );

            if (!paymentResult.success) {
                console.error('Failed to create PayPal payment:', paymentResult.error);
                return reply.status(500).send({ 
                    error: 'Failed to create payment. Please try again.' 
                });
            }

            console.log('PayPal payment created successfully:', paymentResult);

            return reply.send({
                success: true,
                approvalUrl: paymentResult.approvalUrl,
                orderId: paymentResult.orderId
            });
        } catch (error) {
            console.error('Beta signup error:', error);
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });
} 