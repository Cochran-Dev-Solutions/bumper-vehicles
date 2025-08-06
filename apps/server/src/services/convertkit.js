import serviceConfig from "../config/service-config.js";

class ConvertKitService {
  constructor() {
    this.apiKey = process.env.CONVERTKIT_API_KEY;
    this.apiSecret = process.env.CONVERTKIT_API_SECRET;
    this.baseUrl = "https://api.convertkit.com/v3";
    this.formId = process.env.CONVERTKIT_FORM_ID || null;
    this.betaTagId = process.env.CONVERTKIT_BETA_TAG_ID || null;
  }

  // Check if service is enabled
  isEnabled() {
    return serviceConfig.isConvertKitEnabled();
  }

  // Get disabled reason
  getDisabledReason() {
    return serviceConfig.getConvertKitConfig().reason;
  }

  // Check if subscriber already exists
  async checkSubscriberExists(email) {
    if (!this.isEnabled()) {
      return {
        exists: false,
        error: `ConvertKit service is disabled: ${this.getDisabledReason()}`,
        disabled: true,
      };
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/subscribers?api_secret=${
          this.apiSecret
        }&email_address=${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const subscriber = data.subscribers[0] || null;

      return {
        exists: !!subscriber,
        subscriber: subscriber,
      };
    } catch (error) {
      console.error("ConvertKit checkSubscriberExists error:", error);
      return {
        exists: false,
        error: error.message,
      };
    }
  }

  // Check if subscriber is confirmed
  async checkSubscriberStatus(email) {
    if (!this.isEnabled()) {
      return {
        exists: false,
        isConfirmed: false,
        error: `ConvertKit service is disabled: ${this.getDisabledReason()}`,
        disabled: true,
      };
    }

    try {
      const result = await this.checkSubscriberExists(email);
      if (result.exists && result.subscriber) {
        return {
          exists: true,
          isConfirmed: result.subscriber.state === "active",
          subscriber: result.subscriber,
        };
      }
      return {
        exists: false,
        isConfirmed: false,
      };
    } catch (error) {
      console.error("ConvertKit checkSubscriberStatus error:", error);
      return {
        exists: false,
        isConfirmed: false,
        error: error.message,
      };
    }
  }

  // Add subscriber to ConvertKit
  async addSubscriber(email, firstName = "", lastName = "", tags = []) {
    if (!this.isEnabled()) {
      return {
        success: false,
        error: `ConvertKit service is disabled: ${this.getDisabledReason()}`,
        disabled: true,
      };
    }

    try {
      // If we have a form ID, use the form subscription endpoint
      if (this.formId) {
        const payload = {
          api_key: this.apiKey,
          email: email,
          first_name: firstName,
          tags: tags,
        };

        const response = await fetch(
          `${this.baseUrl}/forms/${this.formId}/subscribe`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        return {
          success: true,
          subscriber: data.subscription,
          subscriberId: data.subscription.subscriber.id,
        };
      } else {
        throw new Error(
          "No form ID provided. Please set CONVERTKIT_FORM_ID in your environment variables."
        );
      }
    } catch (error) {
      console.error("ConvertKit addSubscriber error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Add subscriber with beta tag
  async addBetaSubscriber(email, firstName = "", lastName = "") {
    if (!this.isEnabled()) {
      return {
        success: false,
        error: `ConvertKit service is disabled: ${this.getDisabledReason()}`,
        disabled: true,
      };
    }

    try {
      const tags = this.betaTagId ? [this.betaTagId] : [];
      return await this.addSubscriber(email, firstName, lastName, tags);
    } catch (error) {
      console.error("ConvertKit addBetaSubscriber error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Remove subscriber
  async removeSubscriber(email) {
    if (!this.isEnabled()) {
      return {
        success: false,
        error: `ConvertKit service is disabled: ${this.getDisabledReason()}`,
        disabled: true,
      };
    }

    try {
      const payload = {
        api_secret: this.apiSecret,
        email: email,
      };

      const response = await fetch(`${this.baseUrl}/unsubscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        message: "Subscriber removed successfully",
      };
    } catch (error) {
      console.error("ConvertKit removeSubscriber error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// Create and export a singleton instance
const convertKit = new ConvertKitService();
export default convertKit;
