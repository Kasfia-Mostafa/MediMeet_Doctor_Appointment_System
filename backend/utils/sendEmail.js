/**
 * ============================================================
 * Email Utility — Nodemailer Transporter
 * ============================================================
 * Sends transactional emails (appointment confirmations,
 * cancellation notices, expiry alerts) using Nodemailer
 * with Gmail or another configured SMTP service.
 * ============================================================
 */

const nodemailer = require('nodemailer');

/**
 * Sends an HTML email to the specified recipient.
 *
 * @param {Object} options         - Email configuration
 * @param {string} options.email   - Recipient email address
 * @param {string} options.subject - Email subject line
 * @param {string} options.message - HTML email body content
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
  // Create a reusable transporter using SMTP credentials from env vars
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Compose the email options
  const mailOptions = {
    from: `"MediMeet System" <${process.env.EMAIL_USER}>`, // Sender display name and address
    to: options.email,
    subject: options.subject,
    html: options.message, // HTML body (not plain text)
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
