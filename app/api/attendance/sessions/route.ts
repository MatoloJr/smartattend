import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    const { sessionId, courseCode, sessionCode, expiresAt } = await req.json();
    const expires = new Date(expiresAt);

    // Validate input
    if (!sessionId || !courseCode || !sessionCode || !expires) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if course exists and user is the instructor
    const course = await prisma.course.findUnique({
      where: { 
        code: courseCode,
        instructorId: session.user.id
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found or access denied' },
        { status: 404 }
      );
    }

    // Create or update the attendance session
    const attendanceSession = await prisma.attendanceSession.upsert({
      where: { id: sessionId },
      update: {
        sessionCode,
        expiresAt: expires,
        isActive: true,
      },
      create: {
        id: sessionId,
        courseId: course.id,
        sessionCode,
        expiresAt: expires,
        isActive: true,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({
      message: 'Attendance session created successfully',
      session: attendanceSession,
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
    const sessions = await prisma.attendanceSession.findMany({
      where: {
        expiresAt: { gte: new Date() },
        isActive: true,
      },
      include: {
        course: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active sessions' },
      { status: 500 }
    );
  }
}
