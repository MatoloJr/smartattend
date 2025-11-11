import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find user by email
    const user = await User.findOne({ email });
    
    // For security reasons, we don't reveal if the email exists or not
    if (!user) {
      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate and save password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      // Send password reset email
      await sendPasswordResetEmail({
        email: user.email,
        resetToken,
      });

      return NextResponse.json(
        { 
          message: 'If an account with that email exists, a password reset link has been sent.',
        },
        { status: 200 }
      );
    } catch (error) {
      // If there's an error sending the email, clear the reset token
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Error sending password reset email:', error);
      
      return NextResponse.json(
        { error: 'There was an error sending the password reset email. Please try again later.' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request', details: error.message },
      { status: 500 }
    );
  }
}
