import nodemailer from 'nodemailer';

interface SendVerificationEmailParams {
  email: string;
  name: string;
  verificationToken: string;
}

interface SendPasswordResetEmailParams {
  email: string;
  resetToken: string;
}

// Initialize Nodemailer with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify connection configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Error verifying SMTP connection:', error);
  } else {
    console.log('SMTP server is ready to take our messages');
  }
});

export async function sendVerificationEmail({ email, name, verificationToken }: SendVerificationEmailParams) {
  const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;
  
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; }
          .logo { max-width: 150px; height: auto; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 8px; }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
          }
          .code {
            display: inline-block;
            padding: 10px 20px;
            background-color: #f0f0f0;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            margin: 15px 0;
            border-radius: 4px;
          }
          .footer { 
            margin-top: 30px; 
            text-align: center; 
            font-size: 14px; 
            color: #666; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to SmartAttend</h1>
        </div>
        
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Thank you for registering with SmartAttend. Please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${verificationLink}" class="button">Verify Email Address</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb; font-size: 14px;">${verificationLink}</p>
          
          <p>If you didn't create an account with us, please ignore this email.</p>
          
          <div class="footer">
            <p>Best regards,<br>The SmartAttend Team</p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              ${new Date().getFullYear()} SmartAttend. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  try {
    const info = await transporter.sendMail({
      from: `"SmartAttend" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Verify your email address',
      html: emailTemplate
    });
    
    console.log('Verification email sent to:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail({ email, resetToken }: SendPasswordResetEmailParams) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  
  const emailTemplate = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; }
          .logo { max-width: 150px; height: auto; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 8px; }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #2563eb;
            color: white !important;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 20px 0;
          }
          .code {
            display: inline-block;
            padding: 10px 20px;
            background-color: #f0f0f0;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            margin: 15px 0;
            border-radius: 4px;
          }
          .footer { 
            margin-top: 30px; 
            text-align: center; 
            font-size: 14px; 
            color: #666; 
          }
          .note {
            background-color: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 12px;
            margin: 15px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        
        <div class="content">
          <h2>Hello,</h2>
          <p>We received a request to reset the password for your account. If you didn't make this request, you can safely ignore this email.</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetLink}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb; font-size: 14px;">${resetLink}</p>
          
          <div class="note">
            <strong>Note:</strong> This link will expire in 1 hour for security reasons.
          </div>
          
          <p>If you didn't request a password reset, please ignore this email or contact support if you have any concerns.</p>
          
          <div class="footer">
            <p>Best regards,<br>The SmartAttend Team</p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              ${new Date().getFullYear()} SmartAttend. All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
  
  try {
    const info = await transporter.sendMail({
      from: `"SmartAttend" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Reset your password',
      html: emailTemplate
    });
    
    console.log('Password reset email sent to:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}