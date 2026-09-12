const { env } = require('../config/env');

async function sendEmail({ to, subject, html, text }) {
  if (!env.resendApiKey) {
    const error = new Error('Email delivery is not configured');
    error.statusCode = 503;
    throw error;
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

async function sendBookRequestEmail({ to, fullName, bookTitle, requesterName, requestedDays }) {
  return sendEmail({
    to,
    subject: `New request for your book: ${bookTitle}`,
    text: `Assalamu alaikum ${fullName}, ${requesterName} has requested to borrow your book “${bookTitle}” for ${requestedDays} days. Open Intifadah Books to accept or decline the request.`,
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #17352f;"><h2>New book request</h2><p>Assalamu alaikum ${escapeHtml(fullName)},</p><p><strong>${escapeHtml(requesterName)}</strong> has requested to borrow <strong>“${escapeHtml(bookTitle)}”</strong> for ${Number(requestedDays)} days.</p><p>Open Intifadah Books to accept or decline the request.</p></div>`,
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

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character]);
}

async function sendQuranPenaltyEmail({ to, fullName, fromDate, toDate, missedDays, penaltyMinor }) {
  const memberName = escapeHtml(fullName);
  const interval = `${fromDate} to ${toDate}`;
  const amount = `৳${Number(penaltyMinor || 0)}`;

  return sendEmail({
    to,
    subject: 'Your Intifadah Quran tracking penalty',
    text: `Assalamu alaikum ${fullName}, your Quran tracking penalty for ${interval} is ${amount}. Missed days: ${missedDays}. You can see the details in your Intifadah Quran page.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #17352f;">
        <h2>Quran tracking penalty</h2>
        <p>Assalamu alaikum ${memberName},</p>
        <p>Your Quran tracking penalty for <strong>${escapeHtml(interval)}</strong> is <strong>${escapeHtml(amount)}</strong>.</p>
        <p>Missed days: <strong>${Number(missedDays || 0)}</strong></p>
        <p>You can see the details in your Intifadah Quran page.</p>
      </div>
    `,
  });
}

async function sendTrackingPenaltyEmail({ to, fullName, fromDate, toDate, quran, namaj }) {
  const quranAmount = Number(quran?.penaltyMinor || 0);
  const namajAmount = Number(namaj?.penaltyMinor || 0);
  const total = quranAmount + namajAmount;
  const memberName = escapeHtml(fullName);

  return sendEmail({
    to,
    subject: 'Your Intifadah Quran and Namaj tracking dues',
    text: `Assalamu alaikum ${fullName}, for ${fromDate} to ${toDate}: Quran missed ${Number(quran?.missedDays || 0)} day(s), due ৳${quranAmount}; Namaj missed ${Number(namaj?.missedDays || 0)} day(s), due ৳${namajAmount}. Total unpaid savings due: ৳${total}.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #17352f;">
        <h2>Quran and Namaj tracking dues</h2>
        <p>Assalamu alaikum ${memberName},</p>
        <p>Period: <strong>${escapeHtml(fromDate)} to ${escapeHtml(toDate)}</strong></p>
        <ul>
          <li>Quran: ${Number(quran?.missedDays || 0)} missed day(s), <strong>৳${quranAmount}</strong></li>
          <li>Namaj: ${Number(namaj?.missedDays || 0)} missed day(s), <strong>৳${namajAmount}</strong></li>
        </ul>
        <p>Total unpaid savings due: <strong>৳${total}</strong>.</p>
        <p>Your manager or admin will confirm it when received.</p>
      </div>
    `,
  });
}

async function sendSavingsDueEmail({ to, fullName, categoryName, categoryType, amountMinor, dueOn }) {
  const label = Number(categoryType) === 1 ? 'donation' : 'savings';
  return sendEmail({
    to,
    subject: `Your Intifadah ${label} due`,
    text: `Assalamu alaikum ${fullName}, your ${categoryName} ${label} due for ${dueOn} is ৳${Number(amountMinor)}. It will remain unpaid until a manager or admin receives it.`,
    html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #17352f;"><h2>${escapeHtml(label)} due</h2><p>Assalamu alaikum ${escapeHtml(fullName)},</p><p>Your <strong>${escapeHtml(categoryName)}</strong> ${escapeHtml(label)} due is <strong>৳${Number(amountMinor)}</strong>.</p><p>Due date: ${escapeHtml(dueOn)}. A manager or admin will confirm it when received.</p></div>`,
  });
}

async function sendQuranPenaltyRemovalEmail({ to, fullName, fromDate, toDate }) {
  return sendEmail({
    to,
    subject: 'Your Intifadah Quran tracking penalty was removed',
    text: `Assalamu alaikum ${fullName}, your Quran tracking penalty for ${fromDate} to ${toDate} was removed after the record was updated.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #17352f;">
        <h2>Quran tracking penalty removed</h2>
        <p>Assalamu alaikum ${escapeHtml(fullName)},</p>
        <p>Your Quran tracking penalty for <strong>${escapeHtml(fromDate)} to ${escapeHtml(toDate)}</strong> was removed after the record was updated.</p>
      </div>
    `,
  });
}

module.exports = {
  sendEmail,
  sendTemporaryPasswordEmail,
  sendWelcomeEmail,
  sendBookRequestEmail,
  sendPasswordResetOtpEmail,
  sendQuranPenaltyEmail,
  sendTrackingPenaltyEmail,
  sendSavingsDueEmail,
  sendQuranPenaltyRemovalEmail,
};
