import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

import { connectToDatabase } from '../lib/db.ts';
import Institution from '../models/Institution.ts';
import User from '../models/User.ts';
import Course from '../models/Course.ts';
import Session from '../models/Session.ts';
import Enrollment from '../models/Enrollment.ts';
import Attendance from '../models/Attendance.ts';

type SessionSeed = {
  sessionCode: string;
  courseCode: string;
  createdByEmail: string;
  start: string;
  end: string;
  isActive: boolean;
};

type EnrollmentSeed = {
  studentEmail: string;
  courseCode: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'DROPPED';
  enrollmentDate: string;
};

type AttendanceSeed = {
  sessionCode: string;
  studentEmail: string;
  recordedByEmail: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  timestamp: string;
  notes?: string;
};

const institutionsData = [
  {
    name: 'Smart University',
    domain: 'smart.edu',
    address: {
      street: '100 Innovation Way',
      city: 'Boston',
      state: 'MA',
      country: 'USA',
      postalCode: '02115',
    },
    contact: {
      email: 'info@smart.edu',
      phone: '+1-617-555-0100',
      website: 'https://smart.edu',
    },
    primaryCampus: {
      name: 'Smart Main Campus',
      location: 'Boston, MA',
      country: 'USA',
    },
    additionalCampuses: [
      { name: 'Smart Research Park', location: 'Cambridge, MA', country: 'USA' },
    ],
    settings: {
      attendanceThreshold: 80,
      sessionDuration: 90,
    },
    isActive: true,
  },
  {
    name: 'Metro Institute of Technology',
    domain: 'metro.edu',
    address: {
      street: '400 King Street',
      city: 'Toronto',
      state: 'ON',
      country: 'Canada',
      postalCode: 'M5V 1K4',
    },
    contact: {
      email: 'hello@metro.edu',
      phone: '+1-416-555-0140',
      website: 'https://metro.edu',
    },
    primaryCampus: {
      name: 'Metro Downtown Campus',
      location: 'Toronto, ON',
      country: 'Canada',
    },
    additionalCampuses: [
      { name: 'Metro Innovation Hub', location: 'Ottawa, ON', country: 'Canada' },
    ],
    settings: {
      attendanceThreshold: 75,
      sessionDuration: 80,
    },
    isActive: true,
  },
  {
    name: 'Coastal Creative College',
    domain: 'coastal.ac.uk',
    address: {
      street: '10 Harbor Lane',
      city: 'Brighton',
      state: 'England',
      country: 'United Kingdom',
      postalCode: 'BN1 1AA',
    },
    contact: {
      email: 'contact@coastal.ac.uk',
      phone: '+44-1273-555-020',
      website: 'https://coastal.ac.uk',
    },
    primaryCampus: {
      name: 'Brighton Seaside Campus',
      location: 'Brighton, UK',
      country: 'United Kingdom',
    },
    additionalCampuses: [],
    settings: {
      attendanceThreshold: 82,
      sessionDuration: 75,
    },
    isActive: true,
  },
  {
    name: 'Highland Technical University',
    domain: 'highland.ac.ke',
    address: {
      street: '75 Rift Valley Road',
      city: 'Nakuru',
      state: 'Rift Valley',
      country: 'Kenya',
      postalCode: '20100',
    },
    contact: {
      email: 'info@highland.ac.ke',
      phone: '+254-20-555-040',
      website: 'https://highland.ac.ke',
    },
    primaryCampus: {
      name: 'Highland Ridge Campus',
      location: 'Nakuru, Kenya',
      country: 'Kenya',
    },
    additionalCampuses: [
      { name: 'Highland Nairobi Center', location: 'Nairobi, Kenya', country: 'Kenya' },
    ],
    settings: {
      attendanceThreshold: 78,
      sessionDuration: 85,
    },
    isActive: true,
  },
  {
    name: 'City Business School',
    domain: 'citybiz.ae',
    address: {
      street: '12 Financial District',
      city: 'Dubai',
      state: 'Dubai',
      country: 'United Arab Emirates',
      postalCode: '00000',
    },
    contact: {
      email: 'support@citybiz.ae',
      phone: '+971-4-555-070',
      website: 'https://citybiz.ae',
    },
    primaryCampus: {
      name: 'City Business Downtown',
      location: 'Dubai, UAE',
      country: 'United Arab Emirates',
    },
    additionalCampuses: [],
    settings: {
      attendanceThreshold: 85,
      sessionDuration: 90,
    },
    isActive: true,
  },
] as const;

const usersData = [
  {
    email: 'admin@smart.edu',
    password: 'Password123!',
    role: 'admin' as const,
    name: 'Amina Admin',
    institutionName: 'Smart University',
  },
  {
    email: 'alice.lee@smart.edu',
    password: 'Password123!',
    role: 'faculty' as const,
    name: 'Alice Lee',
    institutionName: 'Smart University',
  },
  {
    email: 'brian.khan@metro.edu',
    password: 'Password123!',
    role: 'faculty' as const,
    name: 'Brian Khan',
    institutionName: 'Metro Institute of Technology',
  },
  {
    email: 'chris.mwangi@smart.edu',
    password: 'Password123!',
    role: 'student' as const,
    name: 'Chris Mwangi',
    institutionName: 'Smart University',
  },
  {
    email: 'diana.brown@metro.edu',
    password: 'Password123!',
    role: 'student' as const,
    name: 'Diana Brown',
    institutionName: 'Metro Institute of Technology',
  },
] as const;

const coursesData = [
  {
    code: 'CS101',
    name: 'Introduction to Computer Science',
    description: 'Foundational principles of computing and problem solving.',
    department: 'Computer Science',
    facultyEmail: 'alice.lee@smart.edu',
    credits: 3,
    duration: 90,
    enrolledStudents: 0,
    maxCapacity: 35,
    semester: 'Fall',
    year: 2024,
    status: 'active' as const,
    schedules: [
      { day: 'Monday', startTime: '09:00', endTime: '10:30', location: 'Innovation Hall 201' },
    ],
  },
  {
    code: 'CS205',
    name: 'Data Structures and Algorithms',
    description: 'Efficient data organization and algorithm design.',
    department: 'Computer Science',
    facultyEmail: 'alice.lee@smart.edu',
    credits: 3,
    duration: 90,
    enrolledStudents: 0,
    maxCapacity: 30,
    semester: 'Fall',
    year: 2024,
    status: 'active' as const,
    schedules: [
      { day: 'Wednesday', startTime: '11:00', endTime: '12:30', location: 'Innovation Hall 305' },
    ],
  },
  {
    code: 'IT310',
    name: 'Cloud Infrastructure Fundamentals',
    description: 'Deploying and managing workloads in the cloud.',
    department: 'Information Technology',
    facultyEmail: 'brian.khan@metro.edu',
    credits: 3,
    duration: 80,
    enrolledStudents: 0,
    maxCapacity: 40,
    semester: 'Fall',
    year: 2024,
    status: 'active' as const,
    schedules: [
      { day: 'Tuesday', startTime: '14:00', endTime: '15:20', location: 'Metro Tech Center 2' },
    ],
  },
  {
    code: 'BUS150',
    name: 'Business Analytics Essentials',
    description: 'Using quantitative data to drive decisions.',
    department: 'Business Analytics',
    facultyEmail: 'brian.khan@metro.edu',
    credits: 3,
    duration: 90,
    enrolledStudents: 0,
    maxCapacity: 45,
    semester: 'Fall',
    year: 2024,
    status: 'active' as const,
    schedules: [
      { day: 'Thursday', startTime: '10:00', endTime: '11:30', location: 'Metro Lecture Hall A' },
    ],
  },
  {
    code: 'UX120',
    name: 'Human-Centered Design',
    description: 'Design thinking and user research methodologies.',
    department: 'Design',
    facultyEmail: 'alice.lee@smart.edu',
    credits: 3,
    duration: 90,
    enrolledStudents: 0,
    maxCapacity: 25,
    semester: 'Fall',
    year: 2024,
    status: 'active' as const,
    schedules: [
      { day: 'Friday', startTime: '13:00', endTime: '14:30', location: 'Design Lab 1' },
    ],
  },
] as const;

const sessionsData: SessionSeed[] = [
  {
    sessionCode: 'CS1-1001',
    courseCode: 'CS101',
    createdByEmail: 'alice.lee@smart.edu',
    start: '2024-09-02T09:00:00Z',
    end: '2024-09-02T10:30:00Z',
    isActive: false,
  },
  {
    sessionCode: 'CS2-1002',
    courseCode: 'CS205',
    createdByEmail: 'alice.lee@smart.edu',
    start: '2024-09-03T11:00:00Z',
    end: '2024-09-03T12:30:00Z',
    isActive: false,
  },
  {
    sessionCode: 'IT3-1003',
    courseCode: 'IT310',
    createdByEmail: 'brian.khan@metro.edu',
    start: '2024-09-02T14:00:00Z',
    end: '2024-09-02T15:20:00Z',
    isActive: true,
  },
  {
    sessionCode: 'BUS-1004',
    courseCode: 'BUS150',
    createdByEmail: 'brian.khan@metro.edu',
    start: '2024-09-04T10:00:00Z',
    end: '2024-09-04T11:30:00Z',
    isActive: true,
  },
  {
    sessionCode: 'UX1-1005',
    courseCode: 'UX120',
    createdByEmail: 'alice.lee@smart.edu',
    start: '2024-09-05T13:00:00Z',
    end: '2024-09-05T14:30:00Z',
    isActive: true,
  },
];

const enrollmentsData: EnrollmentSeed[] = [
  { studentEmail: 'chris.mwangi@smart.edu', courseCode: 'CS101', status: 'ACTIVE', enrollmentDate: '2024-08-15' },
  { studentEmail: 'chris.mwangi@smart.edu', courseCode: 'CS205', status: 'ACTIVE', enrollmentDate: '2024-08-16' },
  { studentEmail: 'chris.mwangi@smart.edu', courseCode: 'UX120', status: 'ACTIVE', enrollmentDate: '2024-08-18' },
  { studentEmail: 'diana.brown@metro.edu', courseCode: 'IT310', status: 'ACTIVE', enrollmentDate: '2024-08-20' },
  { studentEmail: 'diana.brown@metro.edu', courseCode: 'BUS150', status: 'ACTIVE', enrollmentDate: '2024-08-22' },
];

const attendanceData: AttendanceSeed[] = [
  {
    sessionCode: 'CS1-1001',
    studentEmail: 'chris.mwangi@smart.edu',
    recordedByEmail: 'alice.lee@smart.edu',
    status: 'present',
    timestamp: '2024-09-02T09:05:00Z',
    notes: 'Checked in via QR',
  },
  {
    sessionCode: 'CS2-1002',
    studentEmail: 'chris.mwangi@smart.edu',
    recordedByEmail: 'alice.lee@smart.edu',
    status: 'late',
    timestamp: '2024-09-03T11:07:00Z',
    notes: 'Arrived 7 minutes late',
  },
  {
    sessionCode: 'UX1-1005',
    studentEmail: 'chris.mwangi@smart.edu',
    recordedByEmail: 'alice.lee@smart.edu',
    status: 'present',
    timestamp: '2024-09-05T13:02:00Z',
  },
  {
    sessionCode: 'IT3-1003',
    studentEmail: 'diana.brown@metro.edu',
    recordedByEmail: 'brian.khan@metro.edu',
    status: 'present',
    timestamp: '2024-09-02T14:03:00Z',
  },
  {
    sessionCode: 'BUS-1004',
    studentEmail: 'diana.brown@metro.edu',
    recordedByEmail: 'brian.khan@metro.edu',
    status: 'excused',
    timestamp: '2024-09-04T10:00:00Z',
    notes: 'Approved company visit',
  },
];

const importMockData = async () => {
  try {
    console.log('🚀 Starting mock data import...');
    
    // Connect to database
    console.log('🔌 Connecting to database...');
    await connectToDatabase();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Institution.deleteMany({}),
      Course.deleteMany({}),
      Session.deleteMany({}),
      Enrollment.deleteMany({}),
      Attendance.deleteMany({}),
    ]);

    // Import Institutions
    console.log('🏛️ Importing institutions...');
    const institutions = await Institution.insertMany(institutionsData);
    const institutionMap = new Map<string, string>();
    institutions.forEach(inst => {
      const doc = inst as typeof inst & { _id: { toString(): string } };
      institutionMap.set(doc.name, doc._id.toString());
    });
    
    // Import Users
    console.log('👥 Importing users...');
    const userIdMap = new Map<string, string>();
    for (const user of usersData) {
      const institutionId = institutionMap.get(user.institutionName);
      if (!institutionId) {
        console.warn(`   ⚠️ Institution not found for user ${user.email}, skipping...`);
        continue;
      }

      const userDoc = await User.create({
        email: user.email,
        password: user.password,
        role: user.role,
        institutionId,
        name: user.name,
      });

      userIdMap.set(user.email, userDoc._id.toString());
    }

    if (userIdMap.size < usersData.length) {
      throw new Error('Some users could not be created because institution references were missing');
    }
    
    // Import Courses
    console.log('📚 Importing courses...');
    const enrollmentCountsByCourse: Record<string, number> = {};
    enrollmentsData.forEach(enrollment => {
      const key = enrollment.courseCode.toUpperCase();
      enrollmentCountsByCourse[key] = (enrollmentCountsByCourse[key] || 0) + 1;
    });

    const courseDocs = coursesData.map(course => {
      const facultyId = userIdMap.get(course.facultyEmail);
      if (!facultyId) {
        throw new Error(`Faculty user not found for course ${course.code}`);
      }
      const { facultyEmail, ...rest } = course;
      return {
        ...rest,
        enrolledStudents: enrollmentCountsByCourse[course.code.toUpperCase()] || 0,
        faculty: facultyId,
      };
    });

    const courses = await Course.insertMany(courseDocs);
    const courseMap = new Map<string, typeof courses[number]>();
    courses.forEach(course => {
      courseMap.set(course.code.toUpperCase(), course);
    });

    // Create Sessions
    console.log('🕒 Creating sessions...');
    const sessionDocs = sessionsData.map(session => {
      const courseDoc = courseMap.get(session.courseCode.toUpperCase());
      const createdById = userIdMap.get(session.createdByEmail);
      if (!courseDoc || !createdById) {
        throw new Error(`Missing references for session ${session.sessionCode}`);
      }
      return {
        sessionCode: session.sessionCode,
        course: courseDoc._id,
        createdBy: createdById,
        expiresAt: new Date(session.end),
        isActive: session.isActive,
        attendanceCount: 0,
      };
    });

    const insertedSessions = await Session.insertMany(sessionDocs);
    const sessionMap = new Map<string, typeof insertedSessions[number]>();
    insertedSessions.forEach(session => {
      sessionMap.set(session.sessionCode, session);
    });

    // Create Enrollments
    console.log('📘 Creating enrollments...');
    const enrollmentsToInsert = enrollmentsData.map(enrollment => {
      const studentId = userIdMap.get(enrollment.studentEmail);
      const courseDoc = courseMap.get(enrollment.courseCode.toUpperCase());
      if (!studentId || !courseDoc) {
        throw new Error(`Missing references for enrollment ${enrollment.studentEmail} -> ${enrollment.courseCode}`);
      }
      return {
        student: studentId,
        course: courseDoc._id,
        status: enrollment.status,
        enrollmentDate: new Date(enrollment.enrollmentDate),
      };
    });
    await Enrollment.insertMany(enrollmentsToInsert);
    
    // Import Attendance Records
    console.log('📝 Importing attendance records...');
    const attendanceDocs = attendanceData
      .map(record => {
        const sessionDoc = sessionMap.get(record.sessionCode);
        const studentId = userIdMap.get(record.studentEmail);
        const recordedById = userIdMap.get(record.recordedByEmail);
        if (!sessionDoc || !studentId || !recordedById) {
          console.warn(`   ⚠️ Missing references for attendance record on session ${record.sessionCode}`);
          return null;
        }
        return {
          student: studentId,
          course: sessionDoc.course,
          session: sessionDoc._id,
          date: new Date(record.timestamp),
          status: record.status,
          recordedBy: recordedById,
          notes: record.notes,
        };
      })
      .filter((doc): doc is NonNullable<typeof doc> => doc !== null);

    if (attendanceDocs.length) {
      await Attendance.insertMany(attendanceDocs, { ordered: false });
    }
    
    // Update session attendance counts
    const attendanceCountMap = new Map<string, number>();
    attendanceDocs.forEach(doc => {
      const key = doc.session.toString();
      attendanceCountMap.set(key, (attendanceCountMap.get(key) || 0) + 1);
    });
    await Promise.all(
      Array.from(attendanceCountMap.entries()).map(([sessionId, count]) =>
        Session.updateOne({ _id: sessionId }, { attendanceCount: count })
      )
    );
    
    // Note: You can add more data imports here for other collections
    // like sessions, apologies, analytics, etc.
    
    console.log('✅ Mock data imported successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing mock data:', error);
    process.exit(1);
  }
};

// Run the import
importMockData();
