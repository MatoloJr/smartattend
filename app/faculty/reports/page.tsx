'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockSessions, mockAttendance, mockUsers } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const FacultyReports: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('semester');
  const [selectedCourse, setSelectedCourse] = useState('all');

  // Get faculty data
  const facultySessions = mockSessions.filter(s => s.faculty_id === user?.id);
  const facultyCourses = Array.from(new Set(facultySessions.map(s => s.course_code)));
  
  // Calculate course performance
  const coursePerformance = facultyCourses.map(courseCode => {
    const courseSessions = facultySessions.filter(s => s.course_code === courseCode);
    const courseAttendance = mockAttendance.filter(a => 
      courseSessions.some(s => s.id === a.session_id)
    );
    
    const totalSessions = courseSessions.length;
    const totalPossibleAttendance = courseSessions.reduce((acc, s) => acc + s.enrolled_students, 0);
    const actualAttendance = courseAttendance.length;
    const percentage = totalPossibleAttendance > 0 ? Math.round((actualAttendance / totalPossibleAttendance) * 100) : 0;
    
    const presentCount = courseAttendance.filter(a => a.status === 'present').length;
    const lateCount = courseAttendance.filter(a => a.status === 'late').length;
    const absentCount = totalPossibleAttendance - actualAttendance;

    return {
      course: courseCode,
      courseName: courseSessions[0]?.course_name || courseCode,
      attendance: percentage,
      sessions: totalSessions,
      enrolled: courseSessions[0]?.enrolled_students || 0,
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      trendValue: Math.round(Math.random() * 10)
    };
  });

  // Generate weekly attendance data
  const weeklyData = Array.from({ length: 12 }, (_, i) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i * 7));
    
    return {
      week: `Week ${12 - i}`,
      attendance: Math.round(75 + Math.random() * 20),
      sessions: Math.floor(2 + Math.random() * 4)
    };
  });

  const overallAttendance = coursePerformance.length > 0 
    ? Math.round(coursePerformance.reduce((acc, curr) => acc + curr.attendance, 0) / coursePerformance.length)
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          <p className="text-green-600 dark:text-green-400">
            Attendance: {data.attendance}%
          </p>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {data.sessions} sessions
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout title="Faculty Reports">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Teaching Reports
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Detailed analysis of your courses and student attendance
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="semester">This Semester</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {overallAttendance}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall Attendance</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Across all courses
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="h-6 w-6 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">{facultyCourses.length}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Courses</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                This semester
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">{facultySessions.reduce((acc, s) => acc + s.enrolled_students, 0)}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                All courses
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-orange-500 mr-2" />
                <span className="text-2xl font-bold">{facultySessions.length}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Conducted
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Performance */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Course Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coursePerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="course" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="attendance" 
                      fill="hsl(var(--chart-2))"
                      radius={[4, 4, 0, 0]}
                      className="hover:opacity-80 transition-opacity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Trends */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Attendance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'Attendance']}
                    />
                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--chart-2))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Course Analysis */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Detailed Course Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {coursePerformance.map((course, index) => (
                <div key={course.course} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{course.course}</Badge>
                      <h4 className="font-medium">{course.courseName}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{course.attendance}%</span>
                      {course.trend === 'up' ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm">+{course.trendValue}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <TrendingDown className="h-4 w-4" />
                          <span className="text-sm">-{course.trendValue}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Progress value={course.attendance} className="h-3" />

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="text-center p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                      <p className="font-medium text-blue-600 dark:text-blue-400">{course.enrolled}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Enrolled</p>
                    </div>
                    <div className="text-center p-2 rounded bg-green-50 dark:bg-green-900/20">
                      <p className="font-medium text-green-600 dark:text-green-400">{course.present}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Present</p>
                    </div>
                    <div className="text-center p-2 rounded bg-yellow-50 dark:bg-yellow-900/20">
                      <p className="font-medium text-yellow-600 dark:text-yellow-400">{course.late}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Late</p>
                    </div>
                    <div className="text-center p-2 rounded bg-red-50 dark:bg-red-900/20">
                      <p className="font-medium text-red-600 dark:text-red-400">{course.absent}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Absent</p>
                    </div>
                    <div className="text-center p-2 rounded bg-gray-50 dark:bg-gray-800">
                      <p className="font-medium">{course.sessions}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Sessions</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Average: {course.attendance}% attendance rate
                    </span>
                    <span className={
                      course.attendance >= 85 ? 'text-green-600 dark:text-green-400' :
                      course.attendance >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }>
                      {course.attendance >= 85 ? '✅ Excellent' :
                       course.attendance >= 70 ? '⚠️ Good' : '❌ Needs Attention'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Teaching Insights */}
        <Card className="glass border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Target className="h-5 w-5" />
              Teaching Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {coursePerformance.filter(c => c.attendance < 80).length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-700 dark:text-yellow-300">
                      Attendance Alert
                    </h4>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                      Attendance in {coursePerformance.filter(c => c.attendance < 80).map(c => c.course).join(', ')} is below 80%. 
                      Consider reviewing teaching methods or reaching out to students.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">Engagement Tips:</h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Use interactive teaching methods to boost engagement</li>
                    <li>• Send reminders before important sessions</li>
                    <li>• Provide clear attendance policies to students</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">Best Practices:</h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Start sessions on time to encourage punctuality</li>
                    <li>• Follow up with frequently absent students</li>
                    <li>• Use attendance data to identify at-risk students</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FacultyReports;