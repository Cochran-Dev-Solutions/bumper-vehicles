import ConvertKitService from './convertkit.js';
import NodeMailerService from './nodemailer.js';

// Create singleton instances
const convertKit = new ConvertKitService();
const nodeMailer = new NodeMailerService();

// Export singleton instances
export default {
  convertKit,
  nodeMailer
};

// Export individual services
export { convertKit, nodeMailer };

// Export the classes for direct instantiation if needed
export { ConvertKitService, NodeMailerService };

// Export utility functions
export {
  generateVerificationCode,
  generateExpirationTime,
  generateNewsletterConfirmationToken,
  generateNewsletterExpirationTime,
  isCodeExpired,
  formatEmailTemplate,
} from "./utils.js";
