import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Session from '@/models/Session';
import Course from '@/models/Course';
import { Types } from 'mongoose';

export async function POST(req: Request) {
  try {
    // Verify user is authenticated and is a faculty member
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'FACULTY') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseCode, sessionCode, expiresAt } = await req.json();
    const expires = new Date(expiresAt);

    // Connect to database
    await connectToDatabase();

    // Validate input
    if (!courseCode || !sessionCode || !expires) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if course exists and user is the instructor
    const course = await Course.findOne({ 
      code: courseCode,
      instructor: session.user.id 
    });
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found or you are not the instructor' },
        { status: 404 }
      );
    }

    // Create new session
    const newSession = new Session({
      sessionCode,
      course: course._id,
      createdBy: session.user.id,
      expiresAt: expires,
      isActive: true,
    });

    await newSession.save();

    return NextResponse.json({
      id: newSession._id,
      sessionCode: newSession.sessionCode,
      courseCode,
      expiresAt: newSession.expiresAt,
      isActive: newSession.isActive,
    });
  } catch (error) {
    console.error('Error creating attendance session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    
    const sessions = await Session.find({ isActive: true })
      .sort({ expiresAt: 1 })
      .populate('course', 'code name')
      .lean();

    return NextResponse.json(sessions.map(session => ({
      id: session._id,
      sessionCode: session.sessionCode,
      courseCode: session.course?.code,
      courseName: session.course?.name,
      expiresAt: session.expiresAt,
      isActive: session.isActive,
    })));
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
