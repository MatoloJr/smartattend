import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    const { sessionCode, studentId } = await req.json();
    const timestamp = new Date();

    // Validate session code format
    const codeRegex = /^[A-Z0-9]{3}-[A-Z0-9]{4}$/;
    if (!codeRegex.test(sessionCode)) {
      return NextResponse.json(
        { error: 'Invalid session code format' },
        { status: 400 }
      );
    }

    // Find the session by code
    const attendanceSession = await prisma.attendanceSession.findFirst({
      where: {
        sessionCode,
        expiresAt: { gte: timestamp },
      },
      include: {
        course: true,
      },
    });

    if (!attendanceSession) {
      return NextResponse.json(
        { error: 'Invalid or expired session code' },
        { status: 400 }
      );
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: attendanceSession.courseId,
        studentId: session.user.id,
        status: 'ACTIVE',
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course' },
        { status: 403 }
      );
    }

    // Check for existing attendance record
    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: {
        sessionId: attendanceSession.id,
        studentId: session.user.id,
      },
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

    // Create new attendance record
    const attendanceRecord = await prisma.attendanceRecord.create({
      data: {
        sessionId: attendanceSession.id,
        studentId: session.user.id,
        status: 'PRESENT',
        recordedAt: timestamp,
        method: 'MANUAL',
      },
    });

    // Update attendance stats
    await prisma.attendanceSession.update({
      where: { id: attendanceSession.id },
      data: {
        attendanceCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      message: 'Attendance recorded successfully',
      record: attendanceRecord,
      session: attendanceSession,
    });

  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
