import nodemailer from 'nodemailer';

/**
 * Creates Nodemailer Transporter
 */
const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465,
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Sends Password Reset OTP Email
 *
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {number} expiresMinutes - Expiry duration in minutes
 */
export const sendOtpEmail = async (toEmail, otp, expiresMinutes = 10) => {
  const transporter = getTransporter();
  const from = process.env.SMTP_FROM || '"PrepMate" <no-reply@prepmate.com>';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Code</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
        .container { max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .logo { display: inline-flex; align-items: center; gap: 8px; font-size: 18px; font-weight: 700; color: #020617; text-decoration: none; margin-bottom: 24px; }
        .logo-badge { background: #020617; color: #ffffff; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 6px; font-size: 14px; }
        h1 { font-size: 20px; font-weight: 600; color: #020617; margin: 0 0 12px; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px; }
        .otp-box { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #020617; }
        .note { font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f1f5f9; pt: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <span class="logo-badge">P</span>
          <span>PrepMate</span>
        </div>
        <h1>Password Reset Verification</h1>
        <p>You requested to reset your password for your PrepMate account. Use the 6-digit verification code below to proceed:</p>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>
        <p>This code is valid for <strong>${expiresMinutes} minutes</strong> and can only be used once. If you did not make this request, you can safely ignore this email.</p>
        <div class="note">
          Security reminder: PrepMate support will never ask you for your verification code or password.
        </div>
      </div>
    </body>
    </html>
  `;

  if (!transporter) {
    // In local development without configured SMTP, gracefully log notice without leaking credentials
    console.info(`[PrepMate Email Service] SMTP is not configured. (Target: ${toEmail})`);
    return { delivered: false, simulated: true };
  }

  try {
    await transporter.sendMail({
      from,
      to: toEmail,
      subject: 'Your PrepMate Password Reset Code',
      text: `Your PrepMate password reset code is: ${otp}. This code expires in ${expiresMinutes} minutes.`,
      html: htmlContent,
    });
    return { delivered: true };
  } catch (error) {
    console.error('[PrepMate Email Service] Failed to send email:', error.message);
    return { delivered: false, error: error.message };
  }
};

export default { sendOtpEmail };
