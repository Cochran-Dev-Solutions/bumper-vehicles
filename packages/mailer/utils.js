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
