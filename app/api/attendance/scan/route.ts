import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import Attendance from '@/models/Attendance';
import Session from '@/models/Session';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { Types } from 'mongoose';

export async function POST(req: Request) {
  try {
    // Verify user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { sessionCode, sessionId } = await req.json();
    const timestamp = new Date();
    
    // Connect to database
    await connectToDatabase();

    // Find the session by code or ID
    let attendanceSession;
    if (sessionCode) {
      // Validate session code format
      const codeRegex = /^[A-Z0-9]{3}-[A-Z0-9]{4}$/;
      if (!codeRegex.test(sessionCode)) {
        return NextResponse.json(
          { error: 'Invalid session code format' },
          { status: 400 }
        );
      }

      attendanceSession = await Session.findOne({
        sessionCode,
        expiresAt: { $gte: timestamp },
        isActive: true
      }).populate('course');
    } else if (sessionId) {
      attendanceSession = await Session.findOne({
        _id: sessionId,
        expiresAt: { $gte: timestamp },
        isActive: true
      }).populate('course');
    } else {
      return NextResponse.json(
        { error: 'Session code or session ID is required' },
        { status: 400 }
      );
    }

    if (!attendanceSession) {
      return NextResponse.json(
        { error: 'Invalid or expired session code' },
        { status: 400 }
      );
    }

    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      course: attendanceSession.course,
      student: new Types.ObjectId(session.user.id),
      status: 'ACTIVE'
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course' },
        { status: 403 }
      );
    }

    // Check for existing attendance record
    const existingRecord = await Attendance.findOne({
      session: attendanceSession._id,
      student: session.user.id,
    });

    if (existingRecord) {
      return NextResponse.json(
        { 
          message: 'Attendance already recorded',
          record: existingRecord,
          session: attendanceSession
        },
        { status: 200 }
      );
    }

    // Determine if student is late (more than 15 minutes after session creation)
    const sessionStart = attendanceSession.createdAt || new Date(attendanceSession.expiresAt.getTime() - 60 * 60 * 1000); // Default to 1 hour before expiry
    const minutesLate = Math.floor((timestamp.getTime() - sessionStart.getTime()) / 60000);
    const status = minutesLate > 15 ? 'late' : 'present';

    // Create new attendance record
    const attendanceRecord = new Attendance({
      session: attendanceSession._id,
      student: session.user.id,
      course: attendanceSession.course,
      status: status,
      recordedBy: session.user.id,
      date: timestamp,
    });

    await attendanceRecord.save();

    // Update session attendance count
    await Session.updateOne(
      { _id: attendanceSession._id },
      { $inc: { attendanceCount: 1 } }
    );

    return NextResponse.json({
      message: 'Attendance recorded successfully',
      record: attendanceRecord,
      session: attendanceSession,
      status: status,
    });

  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


