'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BookOpen, 
  Plus, 
  Search,
  Filter,
  Download,
  Users,
  Clock,
  Calendar,
  MapPin,
  User,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';

interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  faculty_id: string;
  faculty_name: string;
  credits: number;
  duration: number;
  enrolled_students: number;
  max_capacity: number;
  schedule: {
    day: string;
    start_time: string;
    end_time: string;
    location: string;
  }[];
  semester: string;
  year: number;
  status: 'active' | 'inactive' | 'completed';
  created_at: string;
}

const mockCourses: Course[] = [
  {
    id: 'course_1',
    code: 'CS101',
    name: 'Introduction to Computer Science',
    department: 'Computer Science',
    faculty_id: 'faculty_1',
    faculty_name: 'Prof. John Smith',
    credits: 3,
    duration: 90,
    enrolled_students: 45,
    max_capacity: 50,
    schedule: [
      { day: 'Monday', start_time: '09:00', end_time: '10:30', location: 'Room A-101' },
      { day: 'Wednesday', start_time: '09:00', end_time: '10:30', location: 'Room A-101' },
      { day: 'Friday', start_time: '09:00', end_time: '10:30', location: 'Room A-101' }
    ],
    semester: 'Fall',
    year: 2024,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'course_2',
    code: 'MATH201',
    name: 'Calculus II',
    department: 'Mathematics',
    faculty_id: 'faculty_2',
    faculty_name: 'Dr. Emily Johnson',
    credits: 4,
    duration: 90,
    enrolled_students: 38,
    max_capacity: 40,
    schedule: [
      { day: 'Tuesday', start_time: '14:00', end_time: '15:30', location: 'Room B-205' },
      { day: 'Thursday', start_time: '14:00', end_time: '15:30', location: 'Room B-205' }
    ],
    semester: 'Fall',
    year: 2024,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'course_3',
    code: 'CS201',
    name: 'Data Structures and Algorithms',
    department: 'Computer Science',
    faculty_id: 'faculty_1',
    faculty_name: 'Prof. John Smith',
    credits: 3,
    duration: 90,
    enrolled_students: 42,
    max_capacity: 45,
    schedule: [
      { day: 'Monday', start_time: '11:00', end_time: '12:30', location: 'Room A-102' },
      { day: 'Wednesday', start_time: '11:00', end_time: '12:30', location: 'Room A-102' }
    ],
    semester: 'Fall',
    year: 2024,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'course_4',
    code: 'PHYS101',
    name: 'General Physics I',
    department: 'Physics',
    faculty_id: 'faculty_3',
    faculty_name: 'Dr. Michael Brown',
    credits: 4,
    duration: 120,
    enrolled_students: 35,
    max_capacity: 40,
    schedule: [
      { day: 'Tuesday', start_time: '10:00', end_time: '12:00', location: 'Lab C-301' },
      { day: 'Friday', start_time: '10:00', end_time: '12:00', location: 'Lab C-301' }
    ],
    semester: 'Fall',
    year: 2024,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z'
  }
];

const AdminCourses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.faculty_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || course.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = Array.from(new Set(mockCourses.map(course => course.department)));

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const selectAllCourses = () => {
    setSelectedCourses(filteredCourses.map(course => course.id));
  };

  const clearSelection = () => {
    setSelectedCourses([]);
  };

  const getEnrollmentPercentage = (enrolled: number, capacity: number) => {
    return Math.round((enrolled / capacity) * 100);
  };

  return (
    <DashboardLayout title="Course Management">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Course Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage academic courses and their schedules
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by course code, name, or faculty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedCourses.length > 0 && (
          <Card className="glass border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {selectedCourses.length} course{selectedCourses.length > 1 ? 's' : ''} selected
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    Clear Selection
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected
                  </Button>
                  <Button variant="outline" size="sm">
                    Bulk Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="glass hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => toggleCourseSelection(course.id)}
                      className="rounded"
                    />
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{course.code}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{course.name}</p>
                      <Badge variant="outline" className="mt-1">{course.department}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Faculty Information */}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Faculty:</span>
                    <span className="text-gray-600 dark:text-gray-400">{course.faculty_name}</span>
                  </div>

                  {/* Course Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{course.credits} Credits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{course.duration} mins</span>
                    </div>
                  </div>

                  {/* Enrollment Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Enrollment</span>
                      <span>{course.enrolled_students}/{course.max_capacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getEnrollmentPercentage(course.enrolled_students, course.max_capacity)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {getEnrollmentPercentage(course.enrolled_students, course.max_capacity)}% capacity
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Schedule:</h4>
                    <div className="space-y-1">
                      {course.schedule.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-gray-800 rounded p-2">
                          <span className="font-medium">{slot.day}</span>
                          <span>{slot.start_time} - {slot.end_time}</span>
                          <span className="text-gray-500">{slot.location}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                      {course.status}
                    </Badge>
                    <Button size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Statistics */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Course Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {filteredCourses.length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {filteredCourses.filter(c => c.status === 'active').length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Courses</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {filteredCourses.reduce((acc, course) => acc + course.enrolled_students, 0)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Enrollments</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {Math.round(filteredCourses.reduce((acc, course) => acc + getEnrollmentPercentage(course.enrolled_students, course.max_capacity), 0) / filteredCourses.length)}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Capacity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminCourses;