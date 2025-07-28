import { nodeMailer } from '@bumper-vehicles/mailer';

export const sendBetaCredentialsEmail = async (email, username, password) => {
  try {
    const mailOptions = {
      from: "\"Bumper Vehicles Beta Access\" <no-reply@bumpervehicles.com>",
      to: email,
      subject: "Your Bumper Vehicles Beta Access Credentials",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Bumper Vehicles</h1>
            <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">Beta Access Credentials</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to Bumper Vehicles Beta!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for your payment and interest in our multiplayer racing game! 
              Your beta access has been activated and your credentials are ready.
            </p>
            
            <div style="background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; margin: 25px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Your Beta Access Credentials</h3>
              <div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                <div style="margin-bottom: 10px;">
                  <strong style="color: #495057;">Username:</strong>
                  <div style="font-family: 'Courier New', monospace; font-size: 16px; color: #667eea; margin-top: 5px;">${username}</div>
                </div>
                <div>
                  <strong style="color: #495057;">Password:</strong>
                  <div style="font-family: 'Courier New', monospace; font-size: 16px; color: #667eea; margin-top: 5px;">${password}</div>
                </div>
              </div>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <h4 style="color: #856404; margin: 0 0 10px 0;">⚠️ Important Security Information</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Keep these credentials safe - they cannot be reset</li>
                <li>Do not share these credentials with others</li>
                <li>You'll receive an email verification code each time you log in</li>
                <li>Make sure to check your email for the verification code</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_HOST_URL || 'https://app.bumpervehicles.com'}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                🎮 Play Bumper Vehicles Now
              </a>
            </div>
            
            <div style="background: #e3f2fd; border: 1px solid #bbdefb; border-radius: 8px; padding: 15px; margin-top: 25px;">
              <h4 style="color: #1976d2; margin: 0 0 10px 0;">Need Help?</h4>
              <p style="color: #1976d2; margin: 0; font-size: 14px;">
                If you have any issues logging in or need support, please reply to this email 
                or contact us at <a href="mailto:info@bumpervehicles.com" style="color: #667eea;">info@bumpervehicles.com</a>
              </p>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Bumper Vehicles. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">Happy racing! 🏁</p>
          </div>
        </div>
      `,
    };

    return await nodeMailer.sendEmail(mailOptions);
  } catch (error) {
    console.error("Failed to send beta credentials email:", error.message);
    throw new Error(`Failed to send beta credentials email: ${error.message}`);
  }
}; 