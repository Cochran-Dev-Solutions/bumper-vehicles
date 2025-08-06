class ServiceConfig {
  constructor() {
    this.services = {
      email: {
        enabled: false,
        reason: null,
        requiredVars: ["AWS_REGION", "MAIL_FROM_EMAIL", "MAIL_FROM_NAME"],
      },
      convertkit: {
        enabled: false,
        reason: null,
        requiredVars: ["CONVERTKIT_API_KEY", "CONVERTKIT_API_SECRET"],
      },
    };

    this.checkServices();
    this.printStatus();
  }

  checkServices() {
    // Check email service
    const emailVars = this.services.email.requiredVars;
    const missingEmailVars = emailVars.filter(varName => !process.env[varName]);

    if (missingEmailVars.length === 0) {
      this.services.email.enabled = true;
    } else {
      this.services.email.enabled = false;
      this.services.email.reason = `Missing required environment variables: ${missingEmailVars.join(
        ", "
      )}`;
    }

    // Check ConvertKit service
    const convertkitVars = this.services.convertkit.requiredVars;
    const missingConvertkitVars = convertkitVars.filter(
      varName => !process.env[varName]
    );

    if (missingConvertkitVars.length === 0) {
      this.services.convertkit.enabled = true;
    } else {
      this.services.convertkit.enabled = false;
      this.services.convertkit.reason = `Missing required environment variables: ${missingConvertkitVars.join(
        ", "
      )}`;
    }
  }

  printStatus() {
    console.log("\n=== Service Configuration Status ===");

    Object.entries(this.services).forEach(([serviceName, config]) => {
      const status = config.enabled ? "✅ ENABLED" : "❌ DISABLED";
      console.log(`${serviceName.toUpperCase()}: ${status}`);

      if (!config.enabled && config.reason) {
        console.log(`   Reason: ${config.reason}`);
        console.log(`   Note: This service will not be available for testing`);
      }
    });

    console.log("=====================================\n");
  }

  isEmailEnabled() {
    return this.services.email.enabled;
  }

  isConvertKitEnabled() {
    return this.services.convertkit.enabled;
  }

  getEmailConfig() {
    return {
      enabled: this.services.email.enabled,
      reason: this.services.email.reason,
    };
  }

  getConvertKitConfig() {
    return {
      enabled: this.services.convertkit.enabled,
      reason: this.services.convertkit.reason,
    };
  }
}

// Create and export a singleton instance
const serviceConfig = new ServiceConfig();
export default serviceConfig;
