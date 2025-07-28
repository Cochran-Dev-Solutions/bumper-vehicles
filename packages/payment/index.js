import PayPalService from './paypal.js';

// Create a singleton instance of PayPalService
const paypalService = new PayPalService();

// Export the singleton instance
export default paypalService;

// Export the class for direct instantiation if needed
export { PayPalService };

// Export individual methods for convenience
export const createPayment = (amount, currency, description, customData) =>
  paypalService.createPayment(amount, currency, description, customData);

export const capturePayment = (orderId) =>
  paypalService.capturePayment(orderId);

export const getPaymentDetails = (orderId) =>
  paypalService.getPaymentDetails(orderId);

export const refundPayment = (captureId, amount) =>
  paypalService.refundPayment(captureId, amount); 