import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import User from '@/models/User';
import Institution from '@/models/Institution';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email, password, name, institutionName, institutionDomain } = await request.json();

    // Validate input
    if (!email || !password || !name || !institutionName || !institutionDomain) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    // Create or find institution
    let institution = await Institution.findOne({ domain: institutionDomain });
    
    if (!institution) {
      try {
        // Create new institution with default primary campus
        institution = new Institution({
          name: institutionName,
          domain: institutionDomain,
          primaryCampus: {
            name: 'Main Campus',
            location: 'Nairobi',
            country: 'Kenya'
          },
          additionalCampuses: [],
          contact: {},
          settings: {}
        });
        
        const validationError = institution.validateSync();
        if (validationError) {
          console.error('Validation error:', validationError);
          throw new Error(`Institution validation failed: ${validationError.message}`);
        }
        
        await institution.save();
        console.log('New institution created with ID:', institution._id);
      } catch (error) {
        console.error('Error creating institution:', error);
        throw new Error(`Failed to create institution: ${error.message}`);
      }
    }

    // Create new user
    const user = new User({
      email,
      password, // Will be hashed by pre-save hook
      name,
      role: 'admin', // First user is admin
      institutionId: institution._id,
    });

    // Generate and save verification token
    const verificationToken = user.generateVerificationToken();
    await user.save();

    try {
      // Send verification email
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        verificationToken,
      });

      // Return user data (without sensitive fields)
      const { password: _, emailVerificationToken: __, ...userWithoutSensitiveData } = user.toObject();
      
      return NextResponse.json(
        { 
          message: 'Registration successful! Please check your email to verify your account.',
          user: userWithoutSensitiveData 
        },
        { status: 201 }
      );
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      
      // Even if email sending fails, we still create the user
      // They can request a new verification email later
      const { password: _, emailVerificationToken: __, ...userWithoutSensitiveData } = user.toObject();
      
      return NextResponse.json(
        { 
          message: 'Registration successful, but we encountered an issue sending the verification email. Please use the "Forgot Password" feature to verify your email.',
          user: userWithoutSensitiveData 
        },
        { status: 201 }
      );
    }

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
}
