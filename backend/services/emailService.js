import nodemailer from 'nodemailer';
import axios from 'axios';

const sendViaBrevoApi = async (apiKey, { to, subject, text, html, senderName, senderEmail }) => {
  const payload = {
    sender: {
      name: senderName || 'Apex E-Commerce',
      email: senderEmail || 'shahriar.sakib@g.bracu.ac.bd',
    },
    to: [{ email: to }],
    subject,
    htmlContent: html || `<p>${text}</p>`,
    textContent: text,
  };

  const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  return { messageId: response.data.messageId || 'brevo-api-success' };
};

const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("SMTP User or Pass missing. Email Service running in Mock mode.");
    return null;
  }

  const port = parseInt(process.env.SMTP_PORT || '465');
  const isSecure = port === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port,
    secure: isSecure,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, text, html }) => {
  // Extract verified sender email
  let senderEmail = 'shahriar.sakib@g.bracu.ac.bd';
  let senderName = 'Apex E-Commerce';

  if (process.env.SMTP_FROM && !process.env.SMTP_FROM.includes('@smtp-brevo.com')) {
    const match = process.env.SMTP_FROM.match(/^(?:"?([^"<]+)"?\s*)?<?([^>]+)>?$/);
    if (match) {
      if (match[1]) senderName = match[1].trim();
      if (match[2]) senderEmail = match[2].trim();
    }
  }

  // 1. Try Brevo HTTPS REST API first (Immune to ISP port blocking)
  const brevoApiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASS;
  if (brevoApiKey && (brevoApiKey.startsWith('xkeysib-') || brevoApiKey.startsWith('xsmtpsib-'))) {
    try {
      console.log(`[EMAIL DISPATCH] Sending via Brevo HTTPS REST API to ${to}...`);
      const apiInfo = await sendViaBrevoApi(brevoApiKey, {
        to,
        subject,
        text,
        html,
        senderName,
        senderEmail,
      });
      console.log(`[EMAIL DISPATCH] Brevo API Email Sent! MessageID: ${apiInfo.messageId}`);
      return apiInfo;
    } catch (apiError) {
      const errMsg = apiError.response?.data?.message || apiError.message;
      console.warn(`[EMAIL DISPATCH] Brevo REST API notice: ${errMsg}. Trying SMTP fallback...`);
    }
  }

  // 2. Fallback to Nodemailer SMTP
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.log("================ MOCK EMAIL SENT ================");
      console.log(`To: ${to} | Subject: ${subject}`);
      console.log("=================================================");
      return { messageId: 'mock-id-' + Date.now() };
    }

    const fromAddress = `"${senderName}" <${senderEmail}>`;
    console.log(`[EMAIL DISPATCH] Sending via SMTP to ${to} from ${fromAddress}...`);

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });

    console.log(`[EMAIL DISPATCH] SMTP Email Queued! MessageID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[EMAIL DISPATCH ERROR] ${error.message}`);
    return { messageId: 'error-fallback-id' };
  }
};

export const sendVerificationEmail = async (email, name, token) => {
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  const text = `Hi ${name}, Please confirm your email address by visiting: ${url}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #4F46E5;">Welcome to Our E-Commerce Store!</h2>
      <p>Hi ${name},</p>
      <p>Thank you for registering. Please confirm your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${url}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email</a>
      </div>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Confirm Your Email Address', text, html });
};

export const sendOTPEmail = async (email, name, otp) => {
  const text = `Hi ${name}, Your registration OTP verification code is: ${otp}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #4F46E5;">Security Verification Code</h2>
      <p>Hi ${name},</p>
      <p>Please enter the following 6-digit verification code to complete your account registration:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4F46E5; background-color: #F3F4F6; padding: 10px 20px; border-radius: 5px; display: inline-block;">${otp}</span>
      </div>
      <p>This code is valid for 15 minutes. Do not share this OTP with anyone.</p>
    </div>
  `;
  return sendEmail({ to: email, subject: 'Your Registration OTP Verification Code', text, html });
};
