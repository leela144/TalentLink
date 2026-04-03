import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // DEBUG LOGS
  console.log("-----------------------------------------");
  console.log("📧 SENDING EMAIL...");
  console.log("📧 EMAIL_USER:", process.env.EMAIL_USER ? `"${process.env.EMAIL_USER}"` : "UNDEFINED");
  console.log("📧 EMAIL_PASS:", process.env.EMAIL_PASS ? (process.env.EMAIL_PASS.length > 0 ? "SET (Hidden)" : "EMPTY STRING") : "UNDEFINED");
  console.log("-----------------------------------------");

  const transporter = nodemailer.createTransport({
    service: 'gmail', // or use 'host' and 'port' for other providers
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'TalentLink'} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2563EB; text-align: center;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${options.url}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or paste this link into your browser:</p>
        <p style="background-color: #f4f4f5; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 14px;">${options.url}</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <br>
        <p style="color: #6B7280; font-size: 12px; text-align: center;">TalentLink Platform</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

export default sendEmail;
