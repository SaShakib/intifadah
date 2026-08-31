const { env } = require('../config/env');

async function sendEmail({ to, subject, html, text }) {
  if (!env.resendApiKey) {
    return { skipped: true, reason: 'RESEND_API_KEY is not configured' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.resendApiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: env.mailFrom,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.message || 'Email sending failed');
    error.statusCode = 502;
    error.details = data;
    throw error;
  }

  return data;
}

async function sendTemporaryPasswordEmail({ to, fullName, password }) {
  return sendEmail({
    to,
    subject: 'Your Intifadah account password',
    text: `Assalamu alaikum ${fullName}, your Intifadah temporary password is: ${password}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #17352f;">
        <h2>Intifadah account created</h2>
        <p>Assalamu alaikum ${fullName},</p>
        <p>Your temporary password is:</p>
        <p style="font-size: 20px; font-weight: 700; letter-spacing: 1px;">${password}</p>
        <p>Please sign in and change it if needed.</p>
      </div>
    `,
  });
}

async function sendWelcomeEmail({ to, fullName }) {
  return sendEmail({
    to,
    subject: 'Your Intifadah account is ready',
    text: `Assalamu alaikum ${fullName}, your Intifadah account is ready. Sign in with your email or mobile number and the password you chose.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #17352f;">
        <h2>Intifadah account created</h2>
        <p>Assalamu alaikum ${fullName},</p>
        <p>Your account is ready. Sign in with your email or mobile number and the password you chose.</p>
        <p>For your security, we never send a password by email when you set it yourself.</p>
      </div>
    `,
  });
}

async function sendPasswordResetOtpEmail({ to, fullName, otp, ttlMinutes }) {
  return sendEmail({
    to,
    subject: 'Your Intifadah password reset OTP',
    text: `Assalamu alaikum ${fullName}, your Intifadah password reset OTP is ${otp}. It expires in ${ttlMinutes} minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #17352f;">
        <h2>Password reset OTP</h2>
        <p>Assalamu alaikum ${fullName},</p>
        <p>Use this OTP to reset your Intifadah password:</p>
        <p style="font-size: 28px; font-weight: 800; letter-spacing: 4px;">${otp}</p>
        <p>This OTP expires in ${ttlMinutes} minutes.</p>
      </div>
    `,
  });
}

module.exports = {
  sendEmail,
  sendTemporaryPasswordEmail,
  sendWelcomeEmail,
  sendPasswordResetOtpEmail,
};
