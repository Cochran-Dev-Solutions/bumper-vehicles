import { nodeMailer } from '@bumper-vehicles/mailer';

export const sendNewsletterConfirmationEmail = async (email, confirmationToken) => {
  try {
    const mailOptions = {
      from: "\"Bumper Vehicles\" <no-reply@bumpervehicles.com>",
      to: email,
      subject: "Confirm Your Newsletter Subscription - Bumper Vehicles",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Bumper Vehicles</h1>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Bumper Vehicles Newsletter!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for subscribing to our newsletter! To complete your subscription and start receiving 
              updates about our multiplayer racing game, please click the confirmation button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.API_URL || 'http://localhost:3000'}/newsletter/confirm?token=${confirmationToken}&email=${encodeURIComponent(email)}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold; font-size: 16px;">
                Confirm Subscription
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              If the button doesn't work, you can also copy and paste this link into your browser:
            </p>
            
            <div style="background: white; border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin: 20px 0; word-break: break-all;">
              <p style="margin: 0; color: #667eea; font-size: 14px;">
                ${process.env.API_URL || 'http://localhost:3000'}/newsletter/confirm?token=${confirmationToken}&email=${encodeURIComponent(email)}
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              This confirmation link will expire in 24 hours. If you didn't sign up for our newsletter, 
              you can safely ignore this email.
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Once confirmed, you'll receive updates about:
            </p>
            <ul style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              <li>Early access to our multiplayer racing game</li>
              <li>Development updates and new features</li>
              <li>Community events and tournaments</li>
              <li>Exclusive beta testing opportunities</li>
            </ul>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Bumper Vehicles. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">This is an automated email, please do not reply.</p>
          </div>
        </div>
      `,
    };

    return await nodeMailer.sendEmail(mailOptions);
  } catch (error) {
    console.error("Failed to send newsletter confirmation email:", error.message);
    throw new Error(`Failed to send newsletter confirmation email: ${error.message}`);
  }
}; 