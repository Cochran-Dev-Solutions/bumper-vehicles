// Generate a random 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate expiration time (15 minutes from now)
export const generateExpirationTime = () => {
  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + 15);
  return expirationDate;
};

// Generate newsletter confirmation token (24 hours from now)
export const generateNewsletterExpirationTime = () => {
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 24);
  return expirationDate;
};

// Generate a secure random token for newsletter confirmation
export const generateNewsletterConfirmationToken = () => {
  // Use a combination of timestamp and random values for uniqueness
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}_${randomPart}_${randomPart2}`;
};

// Check if a verification code is expired
export const isCodeExpired = (expiresAt) => {
  const now = new Date();
  const expirationDate = new Date(expiresAt);
  return now > expirationDate;
};

// Format email template variables
export const formatEmailTemplate = (template, variables) => {
  let formattedTemplate = template;
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`\\$\\{${key}\\}`, "g");
    formattedTemplate = formattedTemplate.replace(regex, variables[key]);
  });
  return formattedTemplate;
};
