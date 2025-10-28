import { User, Institution, Session, AttendanceRecord, Apology } from './types';

export const mockUsers: User[] = [
  // Admin users
  {
    id: 'admin_1',
    username: 'admin001',
    email: 'admin@techuniversity.edu',
    password: 'admin123',
    role: 'super_admin',
    name: 'John Administrator',
    institution: 'Tech University',
    department: 'IT Administration',
    created_at: '2024-01-15T10:00:00Z',
    last_login: '2024-01-20T09:30:00Z',
    status: 'active'
  },
  {
    id: 'admin_2', 
    username: 'campus.admin',
    email: 'campus@techuniversity.edu',
    password: 'campus123',
    role: 'admin',
    name: 'Sarah Campus Admin',
    institution: 'Tech University',
    department: 'Campus Management',
    created_at: '2024-01-10T08:00:00Z',
    last_login: '2024-01-19T16:45:00Z',
    status: 'active'
  },
  
  // Faculty users
  {
    id: 'faculty_1',
    username: 'prof.smith',
    email: 'j.smith@techuniversity.edu',
    password: 'faculty123',
    role: 'faculty',
    name: 'Prof. John Smith',
    institution: 'Tech University',
    department: 'Computer Science',
    employee_id: 'EMP001',
    courses: ['CS101', 'CS201', 'CS301'],
    created_at: '2024-01-05T09:00:00Z',
    last_login: '2024-01-20T08:15:00Z',
    status: 'active'
  },
  {
    id: 'faculty_2',
    username: 'dr.johnson',
    email: 'e.johnson@techuniversity.edu', 
    password: 'faculty123',
    role: 'faculty',
    name: 'Dr. Emily Johnson',
    institution: 'Tech University',
    department: 'Mathematics',
    employee_id: 'EMP002',
    courses: ['MATH201', 'MATH301', 'STAT101'],
    created_at: '2024-01-03T10:30:00Z',
    last_login: '2024-01-19T14:20:00Z',
    status: 'active'
  },

  // Student users  
  {
    id: 'student_1',
    username: 'john.doe',
    email: 'john.doe@student.techuniversity.edu',
    password: 'student123',
    role: 'student',
    name: 'John Doe',
    student_id: 'STU2024001',
    institution: 'Tech University',
    program: 'Computer Science',
    year: 2,
    enrolled_courses: ['CS101', 'MATH201', 'PHYS101'],
    created_at: '2024-01-01T12:00:00Z',
    last_login: '2024-01-20T07:45:00Z',
    status: 'active'
  },
  {
    id: 'student_2',
    username: 'jane.smith',
    email: 'jane.smith@student.techuniversity.edu',
    password: 'student123', 
    role: 'student',
    name: 'Jane Smith',
    student_id: 'STU2024002',
    institution: 'Tech University',
    program: 'Computer Science',
    year: 1,
    enrolled_courses: ['CS101', 'MATH101', 'ENG101'],
    created_at: '2024-01-02T11:30:00Z',
    last_login: '2024-01-20T09:00:00Z',
    status: 'active'
  },
  {
    id: 'student_3',
    username: 'mike.wilson',
    email: 'mike.wilson@student.techuniversity.edu',
    password: 'student123',
    role: 'student', 
    name: 'Michael Wilson',
    student_id: 'STU2024003',
    institution: 'Tech University',
    program: 'Mathematics',
    year: 3,
    enrolled_courses: ['MATH301', 'STAT101', 'CS201'],
    created_at: '2023-12-28T15:15:00Z',
    last_login: '2024-01-19T18:30:00Z',
    status: 'active'
  }
];

export const mockInstitutions: Institution[] = [
  {
    id: 'inst_1',
    name: 'Tech University',
    type: 'University',
    country: 'United States',
    primary_campus: 'Main Campus, Silicon Valley',
    additional_campuses: [
      'Downtown Campus',
      'North Campus',
      'Online Division'
    ],
    admin_email: 'admin@techuniversity.edu',
    created_at: '2024-01-01T00:00:00Z',
    status: 'active',
    total_students: 12847,
    total_faculty: 847,
    total_courses: 1250
  },
  {
    id: 'inst_2',
    name: 'Metro College',
    type: 'College',
    country: 'Canada',
    primary_campus: 'Central Campus, Toronto',
    additional_campuses: [
      'East Campus',
      'West Campus'
    ],
    admin_email: 'admin@metrocollege.ca',
    created_at: '2024-01-05T00:00:00Z',
    status: 'active',
    total_students: 5432,
    total_faculty: 234,
    total_courses: 480
  }
];

export const mockSessions: Session[] = [
  {
    id: 'session_1',
    course_code: 'CS101',
    course_name: 'Introduction to Computer Science',
    faculty_id: 'faculty_1',
    faculty_name: 'Prof. John Smith',
    date: '2024-01-20',
    start_time: '09:00',
    end_time: '10:30',
    duration: 90,
    location: 'Room A-101, Main Campus',
    enrolled_students: 45,
    attendance_records: [],
    qr_code: 'CS101-20240120-0900',
    status: 'active',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: 'session_2',
    course_code: 'MATH201',
    course_name: 'Calculus II', 
    faculty_id: 'faculty_2',
    faculty_name: 'Dr. Emily Johnson',
    date: '2024-01-20',
    start_time: '14:00',
    end_time: '15:30',
    duration: 90,
    location: 'Room B-205, Main Campus',
    enrolled_students: 38,
    attendance_records: [],
    qr_code: 'MATH201-20240120-1400',
    status: 'scheduled',
    created_at: '2024-01-15T11:00:00Z'
  },
  {
    id: 'session_3',
    course_code: 'CS201',
    course_name: 'Data Structures and Algorithms',
    faculty_id: 'faculty_1',
    faculty_name: 'Prof. John Smith',
    date: '2024-01-19',
    start_time: '11:00',
    end_time: '12:30',
    duration: 90,
    location: 'Room A-102, Main Campus',
    enrolled_students: 42,
    attendance_records: [],
    qr_code: 'CS201-20240119-1100',
    status: 'completed',
    created_at: '2024-01-14T09:00:00Z'
  }
];

export const mockAttendance: AttendanceRecord[] = [
  {
    id: 'att_1',
    session_id: 'session_1',
    student_id: 'student_1',
    student_name: 'John Doe',
    student_number: 'STU2024001',
    timestamp: '2024-01-20T09:15:00Z',
    status: 'present',
    scan_method: 'qr_code',
    location_verified: true,
    ip_address: '192.168.1.100',
    user_agent: 'Mobile Chrome'
  },
  {
    id: 'att_2',
    session_id: 'session_1',
    student_id: 'student_2',
    student_name: 'Jane Smith',
    student_number: 'STU2024002',
    timestamp: '2024-01-20T09:20:00Z',
    status: 'late',
    scan_method: 'qr_code',
    location_verified: true,
    ip_address: '192.168.1.101',
    user_agent: 'Mobile Safari'
  },
  {
    id: 'att_3',
    session_id: 'session_3',
    student_id: 'student_1',
    student_name: 'John Doe',
    student_number: 'STU2024001',
    timestamp: '2024-01-19T11:05:00Z',
    status: 'present',
    scan_method: 'qr_code',
    location_verified: true,
    ip_address: '192.168.1.100',
    user_agent: 'Mobile Chrome'
  },
  {
    id: 'att_4',
    session_id: 'session_3',
    student_id: 'student_3',
    student_name: 'Michael Wilson',
    student_number: 'STU2024003',
    timestamp: '2024-01-19T11:10:00Z',
    status: 'present',
    scan_method: 'qr_code',
    location_verified: true,
    ip_address: '192.168.1.102',
    user_agent: 'Desktop Chrome'
  }
];

export const mockApologies: Apology[] = [
  {
    id: 'apology_1',
    student_id: 'student_2',
    student_name: 'Jane Smith',
    session_ids: ['session_2'],
    start_date: '2024-01-20',
    end_date: '2024-01-20',
    reason_category: 'medical',
    reason_details: 'Flu symptoms and doctor recommended rest',
    supporting_documents: [
      {
        filename: 'medical_certificate.pdf',
        uploaded_at: '2024-01-19T14:30:00Z'
      }
    ],
    status: 'pending',
    submitted_at: '2024-01-19T15:00:00Z',
    reviewed_by: undefined,
    reviewed_at: undefined,
    admin_comments: undefined
  },
  {
    id: 'apology_2',
    student_id: 'student_3', 
    student_name: 'Michael Wilson',
    session_ids: ['session_1'],
    start_date: '2024-01-20',
    end_date: '2024-01-20',
    reason_category: 'transport',
    reason_details: 'Public transport strike, no alternative transportation available',
    supporting_documents: [],
    status: 'approved',
    submitted_at: '2024-01-19T20:00:00Z',
    reviewed_by: 'admin_1',
    reviewed_at: '2024-01-20T08:00:00Z',
    admin_comments: 'Approved due to city-wide transport disruption'
  }
];

// Generate additional mock data for analytics
export const generateMockAnalytics = () => {
  const today = new Date();
  const analytics = [];
  
  // Generate 30 days of attendance data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const baseAttendance = 75 + Math.random() * 20; // 75-95% base attendance
    const dayOfWeek = date.getDay();
    
    // Lower attendance on Fridays and Mondays
    let attendanceRate = baseAttendance;
    if (dayOfWeek === 1 || dayOfWeek === 5) {
      attendanceRate -= 5 + Math.random() * 10;
    }
    
    analytics.push({
      date: date.toISOString().split('T')[0],
      attendance_rate: Math.round(Math.max(60, Math.min(95, attendanceRate))),
      total_sessions: Math.floor(8 + Math.random() * 8),
      total_students: Math.floor(200 + Math.random() * 100),
      present: Math.floor(150 + Math.random() * 80),
      late: Math.floor(10 + Math.random() * 20),
      absent: Math.floor(20 + Math.random() * 30),
      excused: Math.floor(5 + Math.random() * 15)
    });
  }
  
  return analytics;
};

export const mockAnalytics = generateMockAnalytics();

// Department performance data
export const mockDepartmentStats = [
  { department: 'Computer Science', attendance: 87, students: 450, sessions: 28 },
  { department: 'Mathematics', attendance: 82, students: 320, sessions: 22 },
  { department: 'Physics', attendance: 79, students: 280, sessions: 18 },
  { department: 'Chemistry', attendance: 84, students: 200, sessions: 16 },
  { department: 'Engineering', attendance: 88, students: 380, sessions: 25 },
  { department: 'Biology', attendance: 81, students: 250, sessions: 20 }
];

// Time-based attendance patterns
export const mockTimePatterns = [
  { time: '8:00 AM', attendance: 68, sessions: 12 },
  { time: '9:00 AM', attendance: 85, sessions: 24 },
  { time: '10:00 AM', attendance: 90, sessions: 28 },
  { time: '11:00 AM', attendance: 88, sessions: 26 },
  { time: '12:00 PM', attendance: 75, sessions: 18 },
  { time: '1:00 PM', attendance: 72, sessions: 16 },
  { time: '2:00 PM', attendance: 82, sessions: 22 },
  { time: '3:00 PM', attendance: 79, sessions: 20 },
  { time: '4:00 PM', attendance: 71, sessions: 14 },
  { time: '5:00 PM', attendance: 65, sessions: 8 }
];