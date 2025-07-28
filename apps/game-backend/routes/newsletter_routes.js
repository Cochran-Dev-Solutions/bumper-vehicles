import { convertKit } from '@bumper-vehicles/mailer';
import { sendNewsletterConfirmationEmail } from '../src/email_templates/index.js';
import { generateNewsletterConfirmationToken, generateNewsletterExpirationTime } from '@bumper-vehicles/mailer';
import { NewsletterConfirmationDal } from '@bumper-vehicles/database';

// Initialize the DAL
let newsletterConfirmationDal = null;

const initializeNewsletterDal = () => {
    newsletterConfirmationDal = new NewsletterConfirmationDal();
};

export function registerNewsletterRoutes(fastify) {
    // Check if user already exists (for newsletter signup)
    fastify.post('/newsletter/check-user', {
        schema: {
            tags: ['Newsletter'],
            summary: 'Check if user is subscribed to newsletter',
            description: 'Check if a user with the given email is already subscribed to the newsletter',
            body: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        email: { type: 'string' },
                        existsInNewsletter: { type: 'boolean' }
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
            const { email } = request.body;

            if (!email) {
                return reply.status(400).send({ error: 'Email is required' });
            }

            console.log('Checking if user exists in newsletter:', { email });

            // Check if user exists in ConvertKit
            const convertKitCheck = await convertKit.checkSubscriberExists(email);

            const response = {
                email: email,
                existsInNewsletter: convertKitCheck.exists
            };

            console.log('Newsletter check result:', response);

            return reply.send(response);
        } catch (error) {
            console.error('Newsletter check user error:', error);
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });

    // Email subscription (using our own nodemailer system)
    fastify.post('/newsletter/subscribe', {
        schema: {
            tags: ['Newsletter'],
            summary: 'Subscribe to newsletter',
            description: 'Subscribe a user to the newsletter using our own email system',
            body: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
                    },
                    description: 'Returns success message for newsletter subscription confirmation'
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
            // Initialize DAL if not already done
            if (!newsletterConfirmationDal) {
                initializeNewsletterDal();
            }

            const { email } = request.body;

            console.log('Newsletter subscribe request received:', { email });

            if (!email) {
                return reply.status(400).send({ error: 'Email is required' });
            }

            // Step 1: Check if user is already subscribed in ConvertKit
            const convertKitCheck = await convertKit.checkSubscriberStatus(email);
            console.log('ConvertKit subscriber status check:', convertKitCheck);

            if (convertKitCheck.exists && convertKitCheck.isConfirmed) {
                return reply.status(400).send({ 
                    error: 'You are already subscribed to our newsletter with this email address.' 
                });
            }

            // Step 2: Check if we have a pending confirmation for this email
            const existingConfirmation = await newsletterConfirmationDal.getConfirmationByEmail(email);
            if (existingConfirmation.success) {
                console.log('Existing confirmation found for email, sending new confirmation email');
            }

            // Step 3: Generate confirmation token and expiration
            const confirmationToken = generateNewsletterConfirmationToken();
            const expiresAt = generateNewsletterExpirationTime();

            // Step 4: Store confirmation token in database
            const tokenResult = await newsletterConfirmationDal.createConfirmationToken(email, confirmationToken, expiresAt);
            if (!tokenResult.success) {
                console.error('Failed to create confirmation token:', tokenResult.error);
                return reply.status(500).send({ 
                    error: 'Failed to process newsletter subscription. Please try again.' 
                });
            }

            // Step 5: Send confirmation email via nodemailer
            try {
                await sendNewsletterConfirmationEmail(email, confirmationToken);
                console.log('Newsletter confirmation email sent successfully to:', email);
            } catch (emailError) {
                console.error('Failed to send newsletter confirmation email:', emailError.message);
                return reply.status(500).send({ 
                    error: 'Failed to send confirmation email. Please try again.' 
                });
            }

            return reply.send({ 
                success: true, 
                message: 'Confirmation email sent! Please check your inbox to complete your subscription.'
            });

        } catch (error) {
            console.error('Newsletter subscription error:', error);
            return reply.status(500).send({ 
                error: 'Failed to subscribe to newsletter. Please try again.' 
            });
        }
    });

    // Confirm newsletter subscription
    fastify.get('/newsletter/confirm', {
        schema: {
            tags: ['Newsletter'],
            summary: 'Confirm newsletter subscription',
            description: 'Confirm a newsletter subscription using the token from the confirmation email',
            querystring: {
                type: 'object',
                required: ['token', 'email'],
                properties: {
                    token: { type: 'string' },
                    email: { type: 'string', format: 'email' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
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
            // Initialize DAL if not already done
            if (!newsletterConfirmationDal) {
                initializeNewsletterDal();
            }

            const { token, email } = request.query;

            console.log('Newsletter confirmation request received:', { token, email });

            if (!token || !email) {
                return reply.status(400).send({ error: 'Token and email are required' });
            }

            // Step 1: Verify the confirmation token
            const confirmationResult = await newsletterConfirmationDal.getConfirmationByToken(token);
            if (!confirmationResult.success) {
                console.error('Invalid or expired confirmation token:', confirmationResult.error);
                return reply.status(400).send({ 
                    error: 'Invalid or expired confirmation link. Please try subscribing again.' 
                });
            }

            // Step 2: Verify the email matches
            if (confirmationResult.data.email !== email) {
                console.error('Email mismatch in confirmation:', { 
                    provided: email, 
                    stored: confirmationResult.data.email 
                });
                return reply.status(400).send({ 
                    error: 'Invalid confirmation link. Please try subscribing again.' 
                });
            }

            // Step 3: Mark the confirmation as confirmed
            const confirmResult = await newsletterConfirmationDal.confirmToken(token);
            if (!confirmResult.success) {
                console.error('Failed to confirm token:', confirmResult.error);
                return reply.status(500).send({ 
                    error: 'Failed to confirm subscription. Please try again.' 
                });
            }

            // Step 4: Add the subscriber to ConvertKit
            try {
                const convertKitResult = await convertKit.addSubscriber(email);
                if (!convertKitResult.success) {
                    console.error('Failed to add subscriber to ConvertKit:', convertKitResult.error);
                    // Don't fail the confirmation, just log the error
                    console.warn('Subscription confirmed but failed to add to ConvertKit');
                } else {
                    console.log('Successfully added confirmed subscriber to ConvertKit:', email);
                }
            } catch (convertKitError) {
                console.error('ConvertKit error during confirmation:', convertKitError);
                // Don't fail the confirmation, just log the error
                console.warn('Subscription confirmed but ConvertKit operation failed');
            }

            // Step 5: Redirect to success page
            const successUrl = `${process.env.LANDING_PAGE_HOST_URL || 'http://localhost:5174'}/successfully-subscribed`;
            return reply.redirect(successUrl);

        } catch (error) {
            console.error('Newsletter confirmation error:', error);
            return reply.status(500).send({ 
                error: 'Failed to confirm subscription. Please try again.' 
            });
        }
    });

    // Unsubscribe from newsletter
    fastify.post('/newsletter/unsubscribe', {
        schema: {
            tags: ['Newsletter'],
            summary: 'Unsubscribe from newsletter',
            description: 'Unsubscribe a user from the newsletter via ConvertKit',
            body: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' }
                }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' }
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
            const { email } = request.body;

            if (!email) {
                return reply.status(400).send({ error: 'Email is required' });
            }

            // Remove from ConvertKit
            const result = await convertKit.removeSubscriber(email);

            if (!result.success) {
                return reply.status(500).send({ error: 'Failed to unsubscribe' });
            }

            return reply.send({ success: true, message: 'Successfully unsubscribed' });
        } catch (error) {
            console.error('Newsletter unsubscribe error:', error);
            return reply.status(500).send({ error: 'Internal server error' });
        }
    });
} 