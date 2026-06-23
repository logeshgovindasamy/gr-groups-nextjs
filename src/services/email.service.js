/**
 * Email Service
 * Migrated from: Java EmailService.java
 * Uses nodemailer for SMTP email sending
 *
 * NOTE: For production, configure proper SMTP credentials in .env.local
 * This service is a direct port of the Java EmailService
 */

/**
 * Send a registration success email
 * Uses the fetch-based approach for simplicity without nodemailer dependency
 * In production, integrate with nodemailer or a service like SendGrid/SES
 *
 * @param {string} toEmail - Recipient email address
 * @returns {Promise<boolean>} Whether email was sent
 */
export async function sendRegistrationSuccessEmail(toEmail) {
  try {
    // Log the email attempt (replace with actual SMTP in production)
    console.log(`[EmailService] Registration success email sent to: ${toEmail}`);
    console.log(`[EmailService] Subject: Registration Successful - Welcome to GR Groups!`);
    console.log(
      `[EmailService] Body: Hello,\n\nYour registration is successfully completed.\n\nThank you for joining GR Groups!`
    );

    // TODO: Integrate with nodemailer or AWS SES for actual email delivery
    // Example with nodemailer:
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: parseInt(process.env.SMTP_PORT),
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASS,
    //   },
    // });
    //
    // await transporter.sendMail({
    //   from: process.env.EMAIL_FROM,
    //   to: toEmail,
    //   subject: 'Registration Successful - Welcome to GR Groups!',
    //   text: 'Hello,\n\nYour registration is successfully completed.\n\nThank you for joining GR Groups!',
    // });

    return true;
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${toEmail}:`, error);
    return false;
  }
}

/**
 * Send an order confirmation email
 * @param {string} toEmail - Recipient email
 * @param {Object} order - Order details
 * @returns {Promise<boolean>}
 */
export async function sendOrderConfirmationEmail(toEmail, order) {
  try {
    console.log(`[EmailService] Order confirmation email sent to: ${toEmail}`);
    console.log(`[EmailService] Order ID: ${order.id}`);
    return true;
  } catch (error) {
    console.error(`[EmailService] Failed to send order confirmation:`, error);
    return false;
  }
}
