import NodeMailerService from './nodemailer.js';

// Create singleton instance
const nodeMailer = new NodeMailerService();

// Export singleton instance
export default {
  nodeMailer
};

// Export individual service
export { nodeMailer };

// Export the classes for direct instantiation if needed
export { NodeMailerService };

// Export utility functions
export {
  generateVerificationCode,
  generateExpirationTime,
  generateNewsletterConfirmationToken,
  generateNewsletterExpirationTime,
  isCodeExpired,
  formatEmailTemplate,
} from "./utils.js";
