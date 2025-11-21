'use client';

import React, { useState, useEffect } from 'react';
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
  User,
  Eye,
  Edit,
  MoreVertical,
  FileText,
  FileSpreadsheet,
  FileJson,
  X,
  Check,
  ChevronDown,
  Trash2,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  MapPin as MapPinIcon,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';

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

interface ApiCourse {
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

interface CourseFormData {
  id?: string;
  code: string;
  name: string;
  department: string;
  faculty_id: string;
  faculty_name: string;
  credits: number;
  duration: number;
  enrolled_students?: number;
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
  description?: string;
}

const AdminCourses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courses, setCourses] = useState<ApiCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ApiCourse | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Form state
  const [courseForm, setCourseForm] = useState<CourseFormData>({
    code: '',
    name: '',
    department: '',
    faculty_id: '',
    faculty_name: '',
    credits: 3,
    duration: 90,
    max_capacity: 50,
    schedule: [{ day: 'Monday', start_time: '09:00', end_time: '10:30', location: '' }],
    semester: 'Fall',
    year: new Date().getFullYear(),
    status: 'active',
    description: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newScheduleSlot, setNewScheduleSlot] = useState({
    day: 'Monday',
    start_time: '09:00',
    end_time: '10:30',
    location: ''
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const data = await response.json();
        setCourses(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
        // Fallback to mock data in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Using mock data as fallback');
          setCourses(mockCourses);
          setError(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="Course Management">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-gray-600">Loading courses...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Course Management">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredCourses = React.useMemo(() => {
    return courses.filter(course => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        course.code.toLowerCase().includes(searchLower) ||
        course.name.toLowerCase().includes(searchLower) ||
        course.faculty_name.toLowerCase().includes(searchLower);
      
      const matchesDepartment = departmentFilter === 'all' || course.department === departmentFilter;
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      const matchesSemester = semesterFilter === 'all' || 
        `${course.semester} ${course.year}` === semesterFilter;
      
      return matchesSearch && matchesDepartment && matchesStatus && matchesSemester;
    });
  }, [courses, searchTerm, departmentFilter, statusFilter, semesterFilter]);

  const departments = React.useMemo(() => 
    Array.from(new Set(courses.map(course => course.department))), 
    [courses]
  );
  
  // Get unique semesters from courses
  const semesters = React.useMemo(() => {
    const semSet = new Set<string>();
    courses.forEach(course => {
      semSet.add(`${course.semester} ${course.year}`);
    });
    return Array.from(semSet);
  }, [courses]);

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
    return Math.round((enrolled / Math.max(1, capacity)) * 100);
  };
  
  // Handle form input changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setCourseForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : 
              type === 'checkbox' ? checked : 
              value
    }));
  };
  
  // Handle schedule slot changes
  const handleScheduleChange = (index: number, field: string, value: string) => {
    const updatedSchedule = [...courseForm.schedule];
    updatedSchedule[index] = { ...updatedSchedule[index], [field]: value };
    setCourseForm(prev => ({
      ...prev,
      schedule: updatedSchedule
    }));
  };
  
  // Add a new schedule slot
  const addScheduleSlot = () => {
    setCourseForm(prev => ({
      ...prev,
      schedule: [...prev.schedule, { ...newScheduleSlot }]
    }));
  };
  
  // Remove a schedule slot
  const removeScheduleSlot = (index: number) => {
    const updatedSchedule = [...courseForm.schedule];
    updatedSchedule.splice(index, 1);
    setCourseForm(prev => ({
      ...prev,
      schedule: updatedSchedule.length > 0 ? updatedSchedule : [{ day: 'Monday', start_time: '09:00', end_time: '10:30', location: '' }]
    }));
  };
  
  // Reset form to default values
  const resetForm = () => {
    setCourseForm({
      code: '',
      name: '',
      department: departments[0] || '',
      faculty_id: '',
      faculty_name: '',
      credits: 3,
      duration: 90,
      max_capacity: 50,
      schedule: [{ day: 'Monday', start_time: '09:00', end_time: '10:30', location: '' }],
      semester: 'Fall',
      year: new Date().getFullYear(),
      status: 'active',
      description: ''
    });
  };
  
  // Open add course dialog
  const openAddDialog = () => {
    resetForm();
    setSelectedCourse(null);
    setIsAddDialogOpen(true);
  };
  
  // Open edit course dialog
  const openEditDialog = (course: ApiCourse) => {
    setSelectedCourse(course);
    setCourseForm({
      id: course.id,
      code: course.code,
      name: course.name,
      department: course.department,
      faculty_id: course.faculty_id,
      faculty_name: course.faculty_name,
      credits: course.credits,
      duration: course.duration,
      max_capacity: course.max_capacity,
      schedule: [...course.schedule],
      semester: course.semester,
      year: course.year,
      status: course.status,
      description: (course as any).description || ''
    });
    setIsAddDialogOpen(true);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // In a real app, you would make an API call here
      // For now, we'll just update the local state
      if (selectedCourse) {
        // Update existing course
        setCourses(prev => 
          prev.map(c => 
            c.id === selectedCourse.id 
              ? { 
                  ...c,  // Spread the existing course to keep all fields
                  ...courseForm,  // Override with the updated form values
                  enrolled_students: selectedCourse.enrolled_students || 0
                } 
              : c
          )
        );
        toast.success('Course updated successfully');
      } else {
        // Add new course
        const newCourse: ApiCourse = {
          ...courseForm,
          id: `course_${Date.now()}`,
          enrolled_students: 0,
          created_at: new Date().toISOString()
        };
        setCourses(prev => [...prev, newCourse]);
        toast.success('Course added successfully');
      }
      
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle course deletion
  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      setCourses(prev => prev.filter(c => c.id !== courseId));
      toast.success('Course deleted successfully');
    }
  };
  
  // Handle course status change
  const handleStatusChange = (courseId: string, newStatus: 'active' | 'inactive' | 'completed') => {
    setCourses(prev => 
      prev.map(c => c.id === courseId ? { ...c, status: newStatus } : c)
    );
    toast.success(`Course marked as ${newStatus}`);
  };
  
  // Handle export
  const handleExport = async (format: 'csv' | 'pdf' | 'json') => {
    try {
      const dataToExport = selectedCourses.length > 0 
        ? courses.filter(course => selectedCourses.includes(course.id))
        : filteredCourses;
      
      if (dataToExport.length === 0) {
        toast.warning('No courses to export');
        return;
      }
      
      // In a real app, you would make an API call to generate the export
      // For now, we'll just show a success message
      toast.success(`Exported ${dataToExport.length} courses as ${format.toUpperCase()}`);
      setIsExportDialogOpen(false);
      
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export courses');
    }
  };
  
  // Apply filters from filter dialog
  const applyFilters = (filters: { department: string; status: string; semester: string }) => {
    setDepartmentFilter(filters.department);
    setStatusFilter(filters.status);
    setSemesterFilter(filters.semester);
    setIsFilterDialogOpen(false);
  };
  
  // Reset all filters
  const resetFilters = () => {
    setDepartmentFilter('all');
    setStatusFilter('all');
    setSemesterFilter('all');
    setSearchTerm('');
  };
  
  // View course details
  const viewCourseDetails = (course: ApiCourse) => {
    setSelectedCourse(course);
    setIsViewDialogOpen(true);
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
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleExport('csv')}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleExport('pdf')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => handleExport('json')}
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
              </PopoverContent>
            </Popover>
            <Button size="sm" onClick={openAddDialog}>
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
                <Select 
                  value={semesterFilter} 
                  onValueChange={setSemesterFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Semesters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    {semesters.map(sem => (
                      <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsFilterDialogOpen(true)}
                >
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Selected
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleExport('csv')}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as CSV
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleExport('pdf')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleExport('json')}
                      >
                        <FileJson className="h-4 w-4 mr-2" />
                        Export as JSON
                      </Button>
                    </PopoverContent>
                  </Popover>
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
                    <div className="flex items-center">
                      <input
                      id={`course-${course.id}`}
                      type="checkbox"
                      checked={selectedCourses.includes(course.id)}
                      onChange={() => toggleCourseSelection(course.id)}
                      className="rounded"
                      aria-label={`Select ${course.code} - ${course.name}`}
                      />
                      <label htmlFor={`course-${course.id}`} className="sr-only">
                          Select {course.code} - {course.name}
                      </label>
                    </div>
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
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => viewCourseDetails(course)}
                      aria-label="View course details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => openEditDialog(course)}
                      aria-label="Edit course"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-40 p-2">
                        {course.status === 'active' ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => handleStatusChange(course.id, 'inactive')}
                          >
                            <XCircle className="h-4 w-4 mr-2 text-yellow-500" />
                            Deactivate
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start"
                            onClick={() => handleStatusChange(course.id, 'active')}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                            Activate
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </PopoverContent>
                    </Popover>
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
                      <ClockIcon className="h-4 w-4 text-gray-500" />
                      <span>{course.credits} Credits</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
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
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => viewCourseDetails(course)}
                    >
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
      
      {/* Add/Edit Course Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
            <DialogDescription>
              {selectedCourse 
                ? 'Update the course information below.' 
                : 'Fill in the details to create a new course.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Course Code <span className="text-red-500">*</span></Label>
                <Input
                  id="code"
                  name="code"
                  value={courseForm.code}
                  onChange={handleFormChange}
                  placeholder="e.g., CS101"
                  required
                />
              </div>
              
              {/* Course Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Course Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  value={courseForm.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Introduction to Computer Science"
                  required
                />
              </div>
              
              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">Department <span className="text-red-500">*</span></Label>
                <select
                  id="department"
                  name="department"
                  value={courseForm.department}
                  onChange={handleFormChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              
              {/* Faculty */}
              <div className="space-y-2">
                <Label htmlFor="faculty_name">Instructor <span className="text-red-500">*</span></Label>
                <Input
                  id="faculty_name"
                  name="faculty_name"
                  value={courseForm.faculty_name}
                  onChange={handleFormChange}
                  placeholder="e.g., Dr. John Smith"
                  required
                />
              </div>
              
              {/* Credits */}
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  name="credits"
                  type="number"
                  min="1"
                  max="10"
                  value={courseForm.credits}
                  onChange={handleFormChange}
                />
              </div>
              
              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="30"
                  step="15"
                  value={courseForm.duration}
                  onChange={handleFormChange}
                />
              </div>
              
              {/* Max Capacity */}
              <div className="space-y-2">
                <Label htmlFor="max_capacity">Maximum Capacity</Label>
                <Input
                  id="max_capacity"
                  name="max_capacity"
                  type="number"
                  min="1"
                  value={courseForm.max_capacity}
                  onChange={handleFormChange}
                />
              </div>
              
              {/* Semester */}
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <select
                  id="semester"
                  name="semester"
                  value={courseForm.semester}
                  onChange={handleFormChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Fall">Fall</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Winter">Winter</option>
                </select>
              </div>
              
              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  min="2000"
                  max="2100"
                  value={courseForm.year}
                  onChange={handleFormChange}
                />
              </div>
              
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={courseForm.status}
                  onChange={handleFormChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Course Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={courseForm.description}
                  onChange={handleFormChange}
                  placeholder="Enter course description..."
                  rows={3}
                />
              </div>
            </div>
            
            {/* Schedule Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Class Schedule</h4>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addScheduleSlot}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Schedule
                </Button>
              </div>
              
              {courseForm.schedule.map((slot, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="space-y-1">
                    <Label>Day</Label>
                    <select
                      value={slot.day}
                      onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={slot.start_time}
                      onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={slot.end_time}
                      onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-1 md:col-span-2">
                    <Label>Location</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Room A-101"
                        value={slot.location}
                        onChange={(e) => handleScheduleChange(index, 'location', e.target.value)}
                      />
                      {courseForm.schedule.length > 1 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={() => removeScheduleSlot(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <MinusCircle className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {selectedCourse ? 'Updating...' : 'Creating...'}
                  </>
                ) : selectedCourse ? 'Update Course' : 'Create Course'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View Course Details Dialog */}
      {selectedCourse && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Course Details</DialogTitle>
              <DialogDescription>
                Detailed information about {selectedCourse.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Course Code</h4>
                  <p>{selectedCourse.code}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Course Name</h4>
                  <p>{selectedCourse.name}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Department</h4>
                  <p>{selectedCourse.department}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Instructor</h4>
                  <p>{selectedCourse.faculty_name}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Credits</h4>
                  <p>{selectedCourse.credits}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Duration</h4>
                  <p>{selectedCourse.duration} minutes</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Semester</h4>
                  <p>{selectedCourse.semester} {selectedCourse.year}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <Badge variant={selectedCourse.status === 'active' ? 'default' : 'secondary'}>
                    {selectedCourse.status}
                  </Badge>
                </div>
                
                {(selectedCourse as any).description && (
                  <div className="space-y-2 md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <p className="text-sm">{(selectedCourse as any).description}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Class Schedule</h4>
                <div className="space-y-2">
                  {selectedCourse.schedule.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{slot.day}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-gray-500" />
                        <span>{slot.start_time} - {slot.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 text-gray-500" />
                        <span>{slot.location || 'Not specified'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Enrollment</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Enrolled Students</span>
                    <span>{selectedCourse.enrolled_students} / {selectedCourse.max_capacity}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      style={{
                        width: `${Math.round(((selectedCourse.enrolled_students || 0) / Math.max(1, selectedCourse.max_capacity || 1)) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(((selectedCourse.enrolled_students || 0) / Math.max(1, selectedCourse.max_capacity || 1)) * 100)}% capacity
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setTimeout(() => openEditDialog(selectedCourse), 100);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Courses</DialogTitle>
            <DialogDescription>
              Narrow down the list of courses using the filters below.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select 
                value={departmentFilter}
                onValueChange={(value) => setDepartmentFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Semester</Label>
              <Select 
                value={semesterFilter}
                onValueChange={(value) => setSemesterFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {semesters.map(sem => (
                    <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={resetFilters}
              className="mr-auto"
            >
              Reset Filters
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsFilterDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setIsFilterDialogOpen(false);
              }}
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Courses</DialogTitle>
            <DialogDescription>
              Select the format you want to export the courses in.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleExport('csv')}
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              <div>
                <div className="font-medium">CSV (Excel)</div>
                <div className="text-xs text-gray-500">Comma-separated values file</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleExport('pdf')}
            >
              <FileText className="h-5 w-5 mr-2" />
              <div>
                <div className="font-medium">PDF Document</div>
                <div className="text-xs text-gray-500">Portable Document Format</div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleExport('json')}
            >
              <FileJson className="h-5 w-5 mr-2" />
              <div>
                <div className="font-medium">JSON</div>
                <div className="text-xs text-gray-500">JavaScript Object Notation</div>
              </div>
            </Button>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsExportDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminCourses;