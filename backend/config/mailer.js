const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

async function sendOtpEmail(to, otp) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || '"Fix My Campus" <noreply@fixmycampus.edu>',
    to,
    subject: 'Your Fix My Campus OTP Code',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#1d4ed8;">Fix My Campus</h2>
        <p>Your one-time password (OTP) is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#111827;padding:16px 0;">${otp}</div>
        <p style="color:#6b7280;">This OTP expires in <strong>${process.env.OTP_EXPIRY_MINUTES || 10} minutes</strong>.</p>
        <p style="color:#6b7280;font-size:12px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { transporter, sendOtpEmail };
