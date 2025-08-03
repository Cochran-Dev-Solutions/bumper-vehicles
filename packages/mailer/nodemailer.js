import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

class NodeMailerService {
  constructor() {
    this.sesClient = null;
  }

  async initSESClient() {
    if (this.sesClient) {
      return this.sesClient;
    }

    try {
      this.sesClient = new SESClient({
        region: process.env.AWS_REGION || 'us-east-2',
        // AWS SDK will automatically use IAM role credentials in ECS
        // No need for explicit credentials
      });

      console.log("NodeMailer service initialized with AWS SES SDK");
      return this.sesClient;
    } catch (error) {
      console.error("Failed to initialize NodeMailer service:", error.message);
      this.sesClient = null;
      throw error;
    }
  }

  async sendEmail(mailOptions) {
    try {
      // Initialize SES client if not already initialized
      if (!this.sesClient) {
        await this.initSESClient();
      }

      // Set default from address if not provided
      if (!mailOptions.from) {
        const fromName = process.env.MAIL_FROM_NAME || "Bumper Vehicles";
        const fromEmail = process.env.MAIL_FROM_EMAIL || "no-reply@bumpervehicles.com";
        mailOptions.from = `"${fromName}" <${fromEmail}>`;
      }

      // Prepare SES parameters
      const params = {
        Source: mailOptions.from,
        Destination: {
          ToAddresses: [mailOptions.to]
        },
        Message: {
          Subject: {
            Data: mailOptions.subject,
            Charset: 'UTF-8'
          },
          Body: {
            Html: {
              Data: mailOptions.html,
              Charset: 'UTF-8'
            }
          }
        }
      };

      const command = new SendEmailCommand(params);
      const result = await this.sesClient.send(command);
      
      console.log("Email sent successfully:", result.MessageId);
      return {
        success: true,
        messageId: result.MessageId,
        message: "Email sent successfully",
      };
    } catch (error) {
      console.error("Failed to send email:", error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async testConnection() {
    try {
      if (!this.sesClient) {
        await this.initSESClient();
      }
      
      // Test by getting SES account attributes
      const { GetAccountAttributesCommand } = await import("@aws-sdk/client-ses");
      const command = new GetAccountAttributesCommand({});
      await this.sesClient.send(command);
      
      console.log("NodeMailer connection test successful");
      return true;
    } catch (error) {
      console.error("NodeMailer connection test failed:", error.message);
      return false;
    }
  }
}

export default NodeMailerService; 