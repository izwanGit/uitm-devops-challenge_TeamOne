/**
 * Email Service (SendGrid HTTP API)
 * Uses HTTPS (port 443) which bypasses all SMTP firewall blocks.
 */

const sgMail = require('@sendgrid/mail');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || process.env.SMTP_PASS;
const FROM_EMAIL = process.env.SMTP_FROM || 'rentverse.alert@gmail.com';

// Initialize SendGrid
if (!SENDGRID_API_KEY) {
  console.warn('⚠️  WARNING: SENDGRID_API_KEY is missing. Email sending will fail.');
} else {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid HTTP API configured.');
  console.log(`   From: ${FROM_EMAIL}`);
}

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

  console.log(`📨 Attempting to send verification email to: ${email} from: ${FROM_EMAIL}`);

  try {
    await sgMail.send({
      to: email,
      from: FROM_EMAIL,
      subject: 'Verify your email - Rentverse',
      text: `Welcome to Rentverse! Please verify your email by clicking the following link: ${verificationLink}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Rentverse!</h2>
          <p>Please verify your email address to continue.</p>
          <p>
            <a href="${verificationLink}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email
            </a>
          </p>
          <p style="color: #64748b; font-size: 14px; margin-top: 24px;">
            Or copy this link: <br>
            <a href="${verificationLink}">${verificationLink}</a>
          </p>
        </div>
      `,
    });

    console.log('✅ Verification email sent successfully!');
    return { success: true, message: 'Email sent' };
  } catch (error) {
    console.error('Error sending verification email:', error.response?.body || error);
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
    await sgMail.send({
      to: email,
      from: FROM_EMAIL,
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

    console.log('Password reset email sent successfully!');
    return { success: true, message: 'Email sent' };
  } catch (error) {
    console.error('Error sending password reset email:', error.response?.body || error);
    return { success: false, message: 'Failed to send email' };
  }
}

/**
 * Generic email sender.
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
    await sgMail.send({
      to,
      from: FROM_EMAIL,
      subject,
      html: htmlContent,
    });
    console.log('Generic Email sent successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error sending generic email:', error.response?.body || error);
    return { success: false };
  }
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmail,
};
