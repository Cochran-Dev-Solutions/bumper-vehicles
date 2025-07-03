import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class MailerService {
  constructor() {
    this.transporter = null;
  }

  async initTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    try {
      // Check if required environment variables are set
      if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
        throw new Error(
          "MAIL_USER and MAIL_PASS environment variables are required"
        );
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || "smtp.gmail.com",
        port: process.env.MAIL_PORT || 587,
        secure: true, // true for 465, false for other ports
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      console.log("Mailer service initialized");
      return this.transporter;
    } catch (error) {
      console.error("Failed to initialize mailer service:", error.message);
      this.transporter = null;
      throw error;
    }
  }

  async sendVerificationEmail(email, verificationCode, username) {
    try {
      // Initialize transporter if not already initialized
      if (!this.transporter) {
        await this.initTransporter();
      }

      const mailOptions = {
        from: "\"Bumper Vehicles\" <no-reply@bumpervehicles.com>",
        to: email,
        subject: "Verify Your Email - Bumper Vehicles",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Bumper Vehicles</h1>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; margin-bottom: 20px;">Welcome, ${username}!</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                Thank you for signing up for Bumper Vehicles! To complete your registration, 
                please enter the verification code below:
              </p>
              
              <div style="background: white; border: 2px solid #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 25px 0;">
                <h3 style="color: #333; margin: 0 0 10px 0; font-size: 18px;">Your Verification Code</h3>
                <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; font-family: 'Courier New', monospace;">
                  ${verificationCode}
                </div>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                This code will expire in 15 minutes. If you didn't create an account, 
                you can safely ignore this email.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="${
                  process.env.FRONTEND_HOST_URL || "http://localhost:5173"
                }/verify" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                  Verify Email
                </a>
              </div>
            </div>
            
            <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
              <p style="margin: 0;">© 2024 Bumper Vehicles. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">This is an automated email, please do not reply.</p>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully:", info.messageId);
      return {
        success: true,
        messageId: info.messageId,
        message: "Verification email sent successfully",
      };
    } catch (error) {
      console.error("Failed to send verification email:", error.message);
      throw new Error(`Failed to send verification email: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      if (!this.transporter) {
        await this.initTransporter();
      }
      await this.transporter.verify();
      console.log("Mailer connection test successful");
      return true;
    } catch (error) {
      console.error("Mailer connection test failed:", error.message);
      return false;
    }
  }
}

// Create a singleton instance
const mailer = new MailerService();

// Export the mailer service singleton
export default mailer;

// Export the sendVerificationEmail function
export const sendVerificationEmail = (email, verificationCode, username) =>
  mailer.sendVerificationEmail(email, verificationCode, username);

// Export utility functions
export {
  generateVerificationCode,
  generateExpirationTime,
  isCodeExpired,
  formatEmailTemplate,
} from "./utils.js";
