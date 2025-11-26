import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Course from '@/models/Course';

interface CourseWithFaculty {
  _id: Types.ObjectId;
  code: string;
  name: string;
  department: string;
  faculty?: {
    _id?: Types.ObjectId;
    name?: string;
  };
  credits: number;
  duration: number;
  enrolledStudents?: number;
  maxCapacity?: number;
  schedules?: {
    day: string;
    startTime: string;
    endTime: string;
    location?: string;
  }[];
  semester: string;
  year: number;
  status: 'active' | 'inactive' | 'completed';
  createdAt?: Date;
}

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();

    // Fetch courses from the database with faculty information
    const courses = await Course.find({})
      .populate('faculty', 'id name')
      .lean<CourseWithFaculty[]>();

    // Transform the data to match the frontend interface
    const formattedCourses = courses.map((course) => ({
      id: course._id?.toString() ?? '',
      code: course.code,
      name: course.name,
      department: course.department,
      faculty_id: course.faculty?._id?.toString() || '',
      faculty_name: course.faculty?.name || 'Unassigned',
      credits: course.credits,
      duration: course.duration,
      enrolled_students: course.enrolledStudents || 0,
      max_capacity: course.maxCapacity || 0,
      schedule: course.schedules?.map((schedule) => ({
        day: schedule.day,
        start_time: schedule.startTime,
        end_time: schedule.endTime,
        location: schedule.location || 'TBD',
      })) || [],
      semester: course.semester,
      year: course.year,
      status: course.status,
      created_at: course.createdAt?.toISOString() || new Date().toISOString(),
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
