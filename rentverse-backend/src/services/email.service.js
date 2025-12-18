/**
 * Email Service (Nodemailer + SendGrid)
 */

const nodemailer = require('nodemailer');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Debug: Check if SMTP_PASS is loaded
if (!process.env.SMTP_PASS) {
  console.warn(
    '⚠️  WARNING: SMTP_PASS is missing in environment variables. Email sending will fail.'
  );
} else {
  console.log('✅ SMTP Configuration loaded.');
  console.log(`   Host: ${process.env.SMTP_HOST || 'smtp.sendgrid.net'}`);
  console.log(`   Port: ${process.env.SMTP_PORT || '587'}`);
}

// Create a transporter using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'apikey', // SendGrid username is always 'apikey'
    pass: process.env.SMTP_PASS, // Your SendGrid API Key
  },
});

/**
 * Sends a verification email to new users.
 */
async function sendVerificationEmail(email, token) {
  const verificationLink = `${FRONTEND_URL}/verify-email?token=${token}`;

  // Log link for development in case email fails or for convenience
  if (process.env.NODE_ENV === 'development') {
    console.log('\n');
    console.log('=========================================');
    console.log('📧  VERIFICATION LINK (DEV)');
    console.log(`To: ${email}`);
    console.log(`Link: ${verificationLink}`);
    console.log('=========================================');
    console.log('\n');
  }

  try {
    const info = await transporter.sendMail({
      from: '"Rentverse Security" <rentverse.alert@gmail.com>', // Verified in SendGrid
      to: email,
      subject: 'Verify your email - Rentverse',
      text: `Welcome to Rentverse! Please verify your email by clicking the following link: ${verificationLink}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Rentverse!</h2>
          <p>Please verify your email address to continue.</p>
          <p>
            <a href="${verificationLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Is Me
            </a>
          </p>
          <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
            Or copy this link: <br>
            <a href="${verificationLink}">${verificationLink}</a>
          </p>
        </div>
      `,
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, message: 'Email sent' };
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Fallback to logging for dev if email fails (e.g. unverified sender)
    return { success: false, message: 'Failed to send email' };
  }
}

/**
 * Sends a password reset email.
 */
async function sendPasswordResetEmail(email, token) {
  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;

  if (process.env.NODE_ENV === 'development') {
    console.log('FALLBACK RESET LINK:', resetLink);
  }

  try {
    const info = await transporter.sendMail({
      from: '"Rentverse Security" <rentverse.alert@gmail.com>',
      to: email,
      subject: 'Reset your password - Rentverse',
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Password</h2>
          <p>You requested a password reset. Click the button below to set a new password.</p>
          <p>
            <a href="${resetLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    console.log('Message sent: %s', info.messageId);
    return { success: true, message: 'Email sent' };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, message: 'Failed to send email' };
  }
}

/**
 * Generic email sender.
 * @param {string} to
 * @param {string} subject
 * @param {string} templateName - (Optional) used to select a template if we had a template engine
 * @param {object} data - Data to inject
 */
async function sendEmail(to, subject, templateName, data) {
  let htmlContent = `<div style="font-family: sans-serif; padding: 20px;">`;

  // Basic Template Logic
  if (templateName === 'security_alert') {
    htmlContent += `
      <h2 style="color: #ef4444;">🚨 Security Alert</h2>
      <p>Hi ${data.name || 'User'},</p>
      <p>We detected suspicious activity on your account.</p>
      <ul>
        <li><strong>Reason:</strong> ${Array.isArray(data.reason) ? data.reason.join(', ') : data.reason}</li>
        <li><strong>Time:</strong> ${data.time}</li>
        <li><strong>Location:</strong> ${data.location}</li>
        <li><strong>IP Address:</strong> ${data.ip}</li>
      </ul>
      <p><strong>Action Taken:</strong> ${data.action || 'Event logged.'}</p>
      <p>If this was you, you can ignore this message. Otherwise, please change your password immediately.</p>
    `;
  } else if (templateName === 'new_login') {
    htmlContent += `
      <h2 style="color: #3b82f6;">New Login Detected</h2>
      <p>Hi ${data.name || 'User'},</p>
      <p>We noticed a new login to your Rentverse account.</p>
      <ul>
         <li><strong>Device:</strong> ${data.device}</li>
         <li><strong>Location:</strong> ${data.location}</li>
         <li><strong>Time:</strong> ${data.time}</li>
      </ul>
    `;
  } else {
    // Fallback
    htmlContent += `<p>${JSON.stringify(data)}</p>`;
  }

  htmlContent += `</div>`;

  try {
    const info = await transporter.sendMail({
      from: '"Rentverse Security" <rentverse.alert@gmail.com>',
      to,
      subject,
      html: htmlContent,
    });
    console.log('Generic Email sent: %s', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending generic email:', error);
    return { success: false };
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmail,
};
