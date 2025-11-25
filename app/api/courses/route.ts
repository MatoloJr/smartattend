import { NextResponse } from 'next/server';
import { LeanDocument, Types } from 'mongoose';
import { connectToDatabase } from '@/lib/db';
import Course, { ICourse } from '@/models/Course';

type CourseWithFaculty = LeanDocument<ICourse> & {
  faculty?: {
    _id?: Types.ObjectId;
    name?: string;
  };
};

export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();

    // Fetch courses from the database with faculty information
    const courses = await Course.find({})
      .populate('faculty', 'id name')
      .lean<CourseWithFaculty>();

    // Transform the data to match the frontend interface
    const formattedCourses = courses.map((course) => ({
      id: course._id.toString(),
      code: course.code,
      name: course.name,
      department: course.department,
      faculty_id: course.faculty?._id?.toString() || '',
      faculty_name: (course.faculty as any)?.name || 'Unassigned',
      credits: course.credits,
      duration: course.duration,
      enrolled_students: course.enrolledStudents || 0,
      max_capacity: course.maxCapacity || 0,
      schedule: course.schedules?.map((schedule: any) => ({
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
