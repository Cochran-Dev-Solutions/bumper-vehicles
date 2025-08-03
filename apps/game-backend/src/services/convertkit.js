class ConvertKitService {
  constructor() {
    console.log("Testing env : ", process.env);
    this.apiKey = process.env.CONVERTKIT_API_KEY;
    this.apiSecret = process.env.CONVERTKIT_API_SECRET;
    this.baseUrl = 'https://api.convertkit.com/v3';
    this.formId = process.env.CONVERTKIT_FORM_ID || null;
    this.betaTagId = process.env.CONVERTKIT_BETA_TAG_ID || null;
    
    // Debug environment variables
    console.log('ConvertKit Backend Debug - Environment check:');
    console.log('CONVERTKIT_API_KEY:', this.apiKey ? 'Set' : 'Missing');
    console.log('CONVERTKIT_API_SECRET:', this.apiSecret ? 'Set' : 'Missing');
    console.log('CONVERTKIT_FORM_ID:', this.formId ? 'Set' : 'Missing');
    console.log('CONVERTKIT_BETA_TAG_ID:', this.betaTagId ? 'Set' : 'Missing');
  }

  // Check if subscriber already exists
  async checkSubscriberExists(email) {
    try {
      console.log('Checking if subscriber exists for:', email);
      
      const response = await fetch(`${this.baseUrl}/subscribers?api_secret=${this.apiSecret}&email_address=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('ConvertKit subscribers response:', data);
      
      const subscriber = data.subscribers[0] || null;
      console.log('Found subscriber:', subscriber);

      return {
        exists: !!subscriber,
        subscriber: subscriber
      };
    } catch (error) {
      console.error('ConvertKit checkSubscriberExists error:', error);
      return {
        exists: false,
        error: error.message
      };
    }
  }

  // Check if subscriber is confirmed
  async checkSubscriberStatus(email) {
    try {
      const result = await this.checkSubscriberExists(email);
      if (result.exists && result.subscriber) {
        return {
          exists: true,
          isConfirmed: result.subscriber.state === 'active',
          subscriber: result.subscriber
        };
      }
      return {
        exists: false,
        isConfirmed: false
      };
    } catch (error) {
      console.error('ConvertKit checkSubscriberStatus error:', error);
      return {
        exists: false,
        isConfirmed: false,
        error: error.message
      };
    }
  }

  // Add subscriber to ConvertKit
  async addSubscriber(email, firstName = '', lastName = '', tags = []) {
    try {
      console.log('Adding subscriber to ConvertKit:', { email, firstName, lastName, tags });
      console.log('Form ID check:', this.formId);
      
      // If we have a form ID, use the form subscription endpoint
      if (this.formId) {
        console.log('Using form ID:', this.formId);
        const payload = {
          api_key: this.apiKey,
          email: email,
          first_name: firstName,
          tags: tags
        };

        const response = await fetch(`${this.baseUrl}/forms/${this.formId}/subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        return {
          success: true,
          subscriber: data.subscription,
          subscriberId: data.subscription.subscriber.id
        };
      } else {
        console.log('Form ID is falsy, throwing error');
        throw new Error('No form ID provided. Please set CONVERTKIT_FORM_ID in your environment variables.');
      }
    } catch (error) {
      console.error('ConvertKit addSubscriber error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Add subscriber with beta tag
  async addBetaSubscriber(email, firstName = '', lastName = '') {
    try {
      const tags = this.betaTagId ? [this.betaTagId] : [];
      return await this.addSubscriber(email, firstName, lastName, tags);
    } catch (error) {
      console.error('ConvertKit addBetaSubscriber error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Remove subscriber
  async removeSubscriber(email) {
    try {
      console.log('Removing subscriber from ConvertKit:', email);
      
      const payload = {
        api_secret: this.apiSecret,
        email: email
      };

      const response = await fetch(`${this.baseUrl}/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        message: 'Subscriber removed successfully'
      };
    } catch (error) {
      console.error('ConvertKit removeSubscriber error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Create and export a singleton instance
const convertKit = new ConvertKitService();
export default convertKit; 