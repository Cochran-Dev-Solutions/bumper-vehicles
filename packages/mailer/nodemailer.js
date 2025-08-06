import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

class NodeMailerService {
  constructor() {
    this.sesClient = null;
    this.enabled = false;
    this.disabledReason = null;
    this.checkEmailConfig();
  }

  checkEmailConfig() {
    const requiredVars = ["AWS_REGION", "MAIL_FROM_EMAIL", "MAIL_FROM_NAME"];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length === 0) {
      this.enabled = true;
    } else {
      this.enabled = false;
      this.disabledReason = `Missing required environment variables: ${missingVars.join(
        ", "
      )}`;
    }
  }

  isEnabled() {
    return this.enabled;
  }

  getDisabledReason() {
    return this.disabledReason;
  }

  async initSESClient() {
    if (!this.enabled) {
      throw new Error(`Email service is disabled: ${this.disabledReason}`);
    }

    if (this.sesClient) {
      return this.sesClient;
    }

    try {
      this.sesClient = new SESClient({
        region: process.env.AWS_REGION || "us-east-2",
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
    if (!this.enabled) {
      return {
        success: false,
        error: `Email service is disabled: ${this.disabledReason}`,
        disabled: true,
      };
    }

    try {
      console.log("NodeMailer: Starting email send...");

      // Initialize SES client if not already initialized
      if (!this.sesClient) {
        console.log("NodeMailer: Initializing SES client...");
        await this.initSESClient();
        console.log("NodeMailer: SES client initialized successfully");
      }

      // Set default from address if not provided
      if (!mailOptions.from) {
        const fromName = process.env.MAIL_FROM_NAME || "Bumper Vehicles";
        const fromEmail =
          process.env.MAIL_FROM_EMAIL || "no-reply@bumpervehicles.com";
        mailOptions.from = `"${fromName}" <${fromEmail}>`;
      }

      console.log("NodeMailer: Preparing SES parameters...");
      console.log("NodeMailer: From:", mailOptions.from);
      console.log("NodeMailer: To:", mailOptions.to);
      console.log("NodeMailer: Subject:", mailOptions.subject);

      // Prepare SES parameters
      const params = {
        Source: mailOptions.from,
        Destination: {
          ToAddresses: [mailOptions.to],
        },
        Message: {
          Subject: {
            Data: mailOptions.subject,
            Charset: "UTF-8",
          },
          Body: {
            Html: {
              Data: mailOptions.html,
              Charset: "UTF-8",
            },
          },
        },
      };

      console.log("NodeMailer: Creating SendEmailCommand...");
      const command = new SendEmailCommand(params);

      console.log("NodeMailer: Sending email via SES...");
      const result = await this.sesClient.send(command);

      console.log("Email sent successfully:", result.MessageId);
      return {
        success: true,
        messageId: result.MessageId,
        message: "Email sent successfully",
      };
    } catch (error) {
      console.error("Failed to send email:", error.message);
      console.error("Full error details:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async testConnection() {
    if (!this.enabled) {
      return {
        success: false,
        error: `Email service is disabled: ${this.disabledReason}`,
        disabled: true,
      };
    }

    try {
      if (!this.sesClient) {
        await this.initSESClient();
      }

      // Test by getting SES account attributes
      const { GetAccountAttributesCommand } = await import(
        "@aws-sdk/client-ses"
      );
      const command = new GetAccountAttributesCommand({});
      await this.sesClient.send(command);

      console.log("NodeMailer connection test successful");
      return {
        success: true,
        message: "NodeMailer connection test successful",
      };
    } catch (error) {
      console.error("NodeMailer connection test failed:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default NodeMailerService;
