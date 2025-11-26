import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env.local') });

import { connectToDatabase } from '../lib/db.js';
import { 
  mockUsers, 
  mockInstitutions, 
  mockSessions, 
  mockAnalytics,
  mockDepartmentStats,
  mockAttendance
} from '../lib/mock-data.js';

// Define any missing mock data variables
const mockAttendanceRecords: any[] = mockAttendance || [];
const mockApologies: any[] = [];
import User from '../models/User.js';
import Institution from '../models/Institution.js';
import Course from '../models/Course.js';
import Attendance from '../models/Attendance.js';

// Helper to get unique courses from sessions
function getUniqueCourses(sessions: any[], facultyId: string) {
  const courseMap = new Map();
  const departments = ['Computer Science', 'Mathematics', 'Physics', 'Engineering', 'Business'];
  
  sessions.forEach((session, index) => {
    if (!courseMap.has(session.course_code)) {
      const deptIndex = index % departments.length;
      const year = 2024; // Current year
      const semester = ['Fall', 'Spring', 'Summer', 'Winter'][index % 4];
      
      courseMap.set(session.course_code, {
        code: session.course_code,
        name: session.course_name,
        description: `This is a course about ${session.course_name}. More details to be added.`,
        department: departments[deptIndex],
        faculty: facultyId, // Use the provided faculty ID
        credits: 3, // Default credits
        duration: 90, // 90 minutes
        enrolledStudents: 0, // Will be updated later
        maxCapacity: 30, // Default capacity
        semester,
        year,
        status: 'active',
        schedules: [{
          day: ['Monday', 'Wednesday', 'Friday'][index % 3],
          startTime: '10:00',
          endTime: '11:30',
          location: `Building ${String.fromCharCode(65 + (index % 5))}-${100 + (index % 10)}`
        }],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  });
  
  return Array.from(courseMap.values());
}

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
      Attendance.deleteMany({}),
      // Add other models as needed
    ]);

    // Import Institutions
    console.log('🏛️ Importing institutions...');
    // Transform mock institutions to match the model schema
    const transformedInstitutions = mockInstitutions.map(inst => ({
      name: inst.name,
      domain: inst.domain,
      address: {
        city: inst.address.city,
        state: inst.address.state,
        country: inst.address.country,
        street: inst.address.street,
        postalCode: inst.address.postalCode,
      },
      contact: {
        email: inst.contact.email,
        phone: inst.contact.phone,
        website: inst.contact.website,
      },
      primaryCampus: {
        name: inst.primaryCampus || 'Main Campus',
        location: inst.address.city 
          ? `${inst.address.street || ''} ${inst.address.city}, ${inst.address.state}`.trim()
          : `${inst.address.city}, ${inst.address.state}`,
        country: inst.address.country,
      },
      additionalCampuses: inst.additionalCampuses?.map((campus: string) => ({
        name: campus,
        location: inst.address.city || '',
        country: inst.address.country,
      })) || [],
      settings: inst.settings,
      isActive: inst.isActive,
      createdAt: inst.createdAt ? new Date(inst.createdAt) : new Date(),
      updatedAt: inst.updatedAt ? new Date(inst.updatedAt) : new Date(),
    }));
    const institutions = await Institution.insertMany(transformedInstitutions);
    
    // Create a map of institution names to their IDs
    const institutionMap = new Map();
    institutions.forEach(inst => {
      institutionMap.set(inst.name, inst._id);
    });
    
    // Import Users
    console.log('👥 Importing users...');
    const usersWithInstitutionId = mockUsers.map(user => ({
      ...user,
      institutionId: institutionMap.get(user.institution)
    }));
    await User.insertMany(usersWithInstitutionId);
    
    // Import Courses
    console.log('📚 Importing courses...');
    
    // Get a faculty member to assign to courses
    const faculty = await User.findOne({ role: 'faculty' });
    if (!faculty) {
      throw new Error('No faculty member found to assign to courses');
    }
    
    const uniqueCourses = getUniqueCourses(mockSessions, faculty._id.toString());
    const courses = await Course.insertMany(uniqueCourses);
    
    // Update faculty member with the courses they're teaching
    await User.findByIdAndUpdate(faculty._id, {
      $addToSet: { courses: { $each: courses.map(c => c._id) } }
    });
    
    // Import Attendance Records
    console.log('📝 Importing attendance records...');
    await Attendance.insertMany(mockAttendanceRecords);
    
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
