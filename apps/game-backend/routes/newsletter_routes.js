import { sendNewsletterConfirmationEmail } from '../src/email_templates/newsletter_confirmation_email.js';
import NewsletterConfirmationDal from '../../../packages/database/dal/newsletter-confirmation.dal.js';
import { generateNewsletterConfirmationToken, generateNewsletterExpirationTime } from '@bumper-vehicles/mailer';

let newsletterConfirmationDal = null;

const initializeNewsletterDal = () => {
    newsletterConfirmationDal = new NewsletterConfirmationDal();
};

export function registerNewsletterRoutes(fastify) {
    // Newsletter confirmation email endpoint (only backend API needed)
    fastify.post('/newsletter-confirmation-email', {
        schema: {
            tags: ['Newsletter'],
            summary: 'Send newsletter confirmation email',
            description: 'Send a confirmation email for newsletter subscription',
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
                    description: 'Returns success message for newsletter confirmation email sent'
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

            console.log('Newsletter confirmation email request received:', { email });

            if (!email) {
                return reply.status(400).send({ error: 'Email is required' });
            }

            // Step 1: Check if we have a pending confirmation for this email
            const existingConfirmation = await newsletterConfirmationDal.getConfirmationByEmail(email);
            if (existingConfirmation.success) {
                console.log('Existing confirmation found for email, sending new confirmation email');
            }

            // Step 2: Generate confirmation token and expiration
            const confirmationToken = generateNewsletterConfirmationToken();
            const expiresAt = generateNewsletterExpirationTime();

            // Step 3: Store confirmation token in database
            const tokenResult = await newsletterConfirmationDal.createConfirmationToken(email, confirmationToken, expiresAt);
            if (!tokenResult.success) {
                console.error('Failed to create confirmation token:', tokenResult.error);
                return reply.status(500).send({ 
                    error: 'Failed to process newsletter subscription. Please try again.' 
                });
            }

            // Step 4: Send confirmation email via nodemailer
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
            console.error('Newsletter confirmation email error:', error);
            return reply.status(500).send({ 
                error: 'Failed to send confirmation email. Please try again.' 
            });
        }
    });
} 