import { nodeMailer } from '@bumper-vehicles/mailer';

export const sendContactFormEmail = async (name, email, subject, message) => {
  try {
    const mailOptions = {
      from: "\"Bumper Vehicles Contact Form\" <no-reply@bumpervehicles.com>",
      to: process.env.CONTACT_EMAIL || "info@bumpervehicles.com", // Send to admin email
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Bumper Vehicles</h1>
            <p style="color: white; margin: 5px 0 0 0; opacity: 0.9;">Contact Form Submission</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">New Contact Form Submission</h2>
            
            <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Contact Information</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555; width: 100px;">Name:</td>
                  <td style="padding: 8px 0; color: #333;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                  <td style="padding: 8px 0; color: #333;">
                    <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Subject:</td>
                  <td style="padding: 8px 0; color: #333;">${subject}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">Date:</td>
                  <td style="padding: 8px 0; color: #333;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Message</h3>
              <div style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</div>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:${email}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                Reply to ${name}
              </a>
            </div>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Bumper Vehicles. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">This email was sent from the contact form on bumpervehicles.com</p>
          </div>
        </div>
      `,
      replyTo: email, // Set reply-to to the sender's email
    };

    return await nodeMailer.sendEmail(mailOptions);
  } catch (error) {
    console.error("Failed to send contact form email:", error.message);
    throw new Error(`Failed to send contact form email: ${error.message}`);
  }
}; 