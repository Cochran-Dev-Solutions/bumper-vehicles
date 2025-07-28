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

      console.log("NodeMailer service initialized");
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