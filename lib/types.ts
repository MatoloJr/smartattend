export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'faculty' | 'student';
  name: string;
  institution: string;
  department?: string;
  employee_id?: string;
  student_id?: string;
  program?: string;
  year?: number;
  courses?: string[];
  enrolled_courses?: string[];
  created_at: string;
  last_login?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Institution {
  id: string;
  name: string;
  type: 'University' | 'College' | 'School' | 'Training Center' | 'Other';
  country: string;
  primary_campus: string;
  additional_campuses: string[];
  admin_email: string;
  created_at: string;
  status: 'active' | 'inactive';
  total_students: number;
  total_faculty: number;
  total_courses: number;
}

export interface Session {
  id: string;
  course_code: string;
  course_name: string;
  faculty_id: string;
  faculty_name: string;
  date: string;
  start_time: string;
  end_time: string;
  duration: number;
  location: string;
  enrolled_students: number;
  attendance_records: AttendanceRecord[];
  qr_code: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  session_id: string;
  student_id: string;
  student_name: string;
  student_number: string;
  timestamp: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  scan_method: 'qr_code' | 'manual_entry';
  location_verified: boolean;
  ip_address?: string;
  user_agent?: string;
}

export interface Apology {
  id: string;
  student_id: string;
  student_name: string;
  session_ids: string[];
  start_date: string;
  end_date: string;
  reason_category: 'medical' | 'family' | 'official' | 'transport' | 'other';
  reason_details: string;
  supporting_documents: {
    filename: string;
    uploaded_at: string;
  }[];
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  admin_comments?: string;
}

export type Theme = 'light' | 'dark' | 'system';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}