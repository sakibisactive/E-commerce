import nodemailer from 'nodemailer';

const createTransporter = () => {
  // If credentials are empty, return a mock transporter
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("SMTP User or Pass missing. Email Service running in Mock mode.");
    return {
      sendMail: async (options) => {
        console.log("================ MOCK EMAIL SENT ================");
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body Snippet: ${options.text || 'HTML Content'}`);
        console.log("=================================================");
        return { messageId: 'mock-id-' + Date.now() };
      }
    };
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = createTransporter();
    
    // Determine clean sender email address (never use internal @smtp-brevo.com ID)
    let fromAddress = process.env.SMTP_FROM;

    if (!fromAddress || fromAddress.includes('@smtp-brevo.com')) {
      fromAddress = '"Apex E-Commerce" <shahriar.sakib@g.bracu.ac.bd>';
    }

    console.log(`Attempting to send email via Brevo to ${to} from ${fromAddress}...`);

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
    });

    console.log(`Email successfully queued by Brevo! MessageID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Email send failure: ${error.message}`);
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
