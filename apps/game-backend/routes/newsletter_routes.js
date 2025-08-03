import { sendNewsletterConfirmationEmail } from '../src/email_templates/newsletter_confirmation_email.js';

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
            const { email } = request.body;

            console.log('Newsletter confirmation email request received:', { email });

            if (!email) {
                return reply.status(400).send({ error: 'Email is required' });
            }

            // Send confirmation email via nodemailer with timeout
            try {
                console.log('Attempting to send newsletter confirmation email to:', email);
                console.log('AWS SES Configuration check:');
                console.log('- AWS_REGION:', process.env.AWS_REGION || 'us-east-2');
                console.log('- MAIL_FROM_EMAIL:', process.env.MAIL_FROM_EMAIL || 'no-reply@bumpervehicles.com');
                console.log('- MAIL_FROM_NAME:', process.env.MAIL_FROM_NAME || 'Bumper Vehicles');
                
                // Add timeout to email sending
                const emailPromise = sendNewsletterConfirmationEmail(email);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Email sending timeout')), 10000)
                );
                
                console.log('Starting email send with 10-second timeout...');
                await Promise.race([emailPromise, timeoutPromise]);
                console.log('Newsletter confirmation email sent successfully to:', email);
                
            } catch (emailError) {
                console.error('Failed to send newsletter confirmation email:', emailError.message);
                console.error('Full error:', emailError);
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