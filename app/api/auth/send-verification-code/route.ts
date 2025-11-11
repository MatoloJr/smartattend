import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Initialize Nodemailer with Gmail SMTP
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      );
    }

    // Send the verification email
    const info = await transporter.sendMail({
      from: `"SmartAttend" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Verification Code</h2>
          <p>Thank you for registering with SmartAttend. Here is your verification code:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
            ${code}
          </div>
          <p>Please enter this code in the verification form to complete your registration.</p>
          <p>If you didn't request this code, you can safely ignore this email.</p>
          <p>Best regards,<br>The SmartAttend Team</p>
        </div>
      `,
    });

    console.log('Verification code email sent: %s', info.messageId);

    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Verification code sent successfully' 
    });
  } catch (error) {
    console.error('Error in send-verification-code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
