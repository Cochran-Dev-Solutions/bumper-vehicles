import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

class NodeMailerService {
  constructor() {
    this.transporter = null;
  }

  async initTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    try {
      // Check if required environment variables are set
      if (!process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
        throw new Error(
          "SMTP_USERNAME and SMTP_PASSWORD environment variables are required for AWS SES"
        );
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "email-smtp.us-east-2.amazonaws.com",
        port: process.env.SMTP_PORT || 587,
        secure: false, // false for 587, true for 465
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      console.log("NodeMailer service initialized with AWS SES");
      return this.transporter;
    } catch (error) {
      console.error("Failed to initialize NodeMailer service:", error.message);
      this.transporter = null;
      throw error;
    }
  }

  async sendEmail(mailOptions) {
    try {
      // Initialize transporter if not already initialized
      if (!this.transporter) {
        await this.initTransporter();
      }

      // Set default from address if not provided
      if (!mailOptions.from) {
        const fromName = process.env.MAIL_FROM_NAME || "Bumper Vehicles";
        const fromEmail = process.env.MAIL_FROM_EMAIL || "info@bumpervehicles.com";
        mailOptions.from = `"${fromName}" <${fromEmail}>`;
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", info.messageId);
      return {
        success: true,
        messageId: info.messageId,
        message: "Email sent successfully",
      };
    } catch (error) {
      console.error("Failed to send email:", error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      if (!this.transporter) {
        await this.initTransporter();
      }
      await this.transporter.verify();
      console.log("NodeMailer connection test successful");
      return true;
    } catch (error) {
      console.error("NodeMailer connection test failed:", error.message);
      return false;
    }
  }
}

export default NodeMailerService; 