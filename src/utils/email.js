const nodemailer = require('nodemailer');
const AppError = require('../utils/AppError');



const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true' || false, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  pool: process.env.SMTP_POOL === 'true' || false,
  maxRetries: 3,
});

if (process.env.NODE_ENV !== 'production' && process.env.SKIP_EMAIL_VERIFY !== 'true') {
  transporter.verify()
    .then(() => console.log('Email transporter is ready'))
    .catch(err => {
      console.error('Email transporter verification failed:', err.message);
      console.warn('Email functionality may not work. Check your SMTP credentials in .env file.');
      console.warn(' For Gmail: Use App Password instead of regular password. Enable 2FA first.');
    });
}


async function sendEmail({ to, subject, text, html }) {
  if (!to || !subject || (!text && !html)) {
    throw new AppError('Missing required email fields: to, subject and (text or html)');
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    console.error('Failed to send email:', err);
    throw err;
  }
}

module.exports = { sendEmail };