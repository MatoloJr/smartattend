'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  Calendar, 
  TrendingUp,
  TrendingDown,
  BookOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  Target,
  Award,
  FileText,
  Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockSessions, mockAttendance, mockUsers } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';
import { generatePDFReport, StudentReportData } from '@/lib/report-generator';

const StudentReports: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('semester');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('current');
  const [selectedWeek, setSelectedWeek] = useState('all');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1); // Start of year
    return { start, end: now };
  });
  const [reportGenerated, setReportGenerated] = useState<Date>(new Date());

  // Get student data
  const student = mockUsers.find(u => u.id === user?.id);
  const enrolledCourses = student?.enrolled_courses || [];
  const studentAttendance = mockAttendance.filter(a => a.student_id === user?.id);

  // Calculate detailed metrics
  const subjectPerformance = enrolledCourses.map(courseCode => {
    const courseSessions = mockSessions.filter(s => s.course_code === courseCode);
    const courseAttendance = studentAttendance.filter(a => 
      courseSessions.some(s => s.id === a.session_id)
    );
    
    const totalSessions = courseSessions.length;
    const attendedSessions = courseAttendance.length;
    const percentage = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;
    
    const presentCount = courseAttendance.filter(a => a.status === 'present').length;
    const lateCount = courseAttendance.filter(a => a.status === 'late').length;
    const absentCount = totalSessions - attendedSessions;

    return {
      subject: courseCode,
      courseName: courseSessions[0]?.course_name || courseCode,
      attendance: percentage,
      sessions: totalSessions,
      attended: attendedSessions,
      present: presentCount,
      late: lateCount,
      absent: absentCount,
      trend: Math.random() > 0.5 ? 'up' : 'down',
      trendValue: Math.round(Math.random() * 10)
    };
  });

  // Calculate semester weeks
  const getSemesterWeeks = () => {
    const semesterStart = new Date(dateRange.start);
    const semesterEnd = new Date(dateRange.end);
    const weeks: { number: number; start: Date; end: Date; label: string }[] = [];
    
    let currentWeekStart = new Date(semesterStart);
    let weekNumber = 1;
    
    while (currentWeekStart <= semesterEnd) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      weeks.push({
        number: weekNumber,
        start: new Date(currentWeekStart),
        end: weekEnd > semesterEnd ? semesterEnd : weekEnd,
        label: `Week ${weekNumber}`
      });
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNumber++;
    }
    
    return weeks;
  };
  
  const semesterWeeks = getSemesterWeeks();
  
  // Generate weekly attendance data
  const weeklyData = semesterWeeks.slice(0, 12).map((week, i) => {
    // Filter attendance for this week
    const weekAttendance = studentAttendance.filter(a => {
      const attendanceDate = new Date(a.timestamp || Date.now());
      return attendanceDate >= week.start && attendanceDate <= week.end;
    });
    
    const weekSessions = mockSessions.filter(s => {
      const sessionDate = new Date(s.date);
      return sessionDate >= week.start && sessionDate <= week.end;
    });
    
    return {
      week: week.label,
      attendance: weekSessions.length > 0 
        ? Math.round((weekAttendance.length / weekSessions.length) * 100)
        : 0,
      sessions: weekSessions.length,
      attended: weekAttendance.length
    };
  });

  const overallAttendance = subjectPerformance.length > 0 
    ? Math.round(subjectPerformance.reduce((acc, curr) => acc + curr.attendance, 0) / subjectPerformance.length)
    : 0;

  const attendanceGrade = overallAttendance >= 90 ? 'A' : 
                         overallAttendance >= 80 ? 'B' : 
                         overallAttendance >= 70 ? 'C' : 
                         overallAttendance >= 60 ? 'D' : 'F';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          <p className="text-purple-600 dark:text-purple-400">
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
    <DashboardLayout title="My Reports">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Attendance Reports
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Detailed analysis of your academic attendance
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Generated: {reportGenerated.toLocaleString()}
              </p>
            </div>
            <Button size="sm" onClick={async () => {
              const reportData: StudentReportData = {
                title: 'Student Attendance Report',
                subtitle: `${user?.name} - ${user?.student_id}`,
                generatedAt: new Date(),
                generatedBy: user?.name || 'Student',
                period: {
                  start: dateRange.start,
                  end: dateRange.end,
                  label: `${selectedSemester} - ${selectedPeriod}`
                },
                data: subjectPerformance,
                studentId: user?.student_id || '',
                studentName: user?.name || '',
                courses: subjectPerformance.map(sp => ({
                  courseCode: sp.subject,
                  courseName: sp.courseName,
                  attendance: sp.attendance,
                  present: sp.present,
                  late: sp.late,
                  absent: sp.absent,
                  total: sp.sessions
                })),
                overallAttendance,
                grade: attendanceGrade
              };
              
              await generatePDFReport(reportData, 'student');
              setReportGenerated(new Date());
              toast.success('Report downloaded successfully!');
            }}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
          
          {/* Filters */}
          <Card className="glass">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger id="semester">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Semester</SelectItem>
                      <SelectItem value="fall2024">Fall 2024</SelectItem>
                      <SelectItem value="spring2024">Spring 2024</SelectItem>
                      <SelectItem value="fall2023">Fall 2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="week">Week</Label>
                  <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                    <SelectTrigger id="week">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Weeks</SelectItem>
                      {semesterWeeks.map((week) => (
                        <SelectItem key={week.number} value={week.number.toString()}>
                          {week.label} ({week.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Course</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger id="subject">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {enrolledCourses.map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="period">Period</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger id="period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="semester">This Semester</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/20">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {attendanceGrade}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Overall Grade</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                {overallAttendance}% Attendance
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">{overallAttendance}%</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Average</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Target: 90%
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                <span className="text-2xl font-bold">{studentAttendance.length}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Sessions Attended</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                This semester
              </p>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="h-6 w-6 text-orange-500 mr-2" />
                <span className="text-2xl font-bold">12</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Day Streak</p>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Keep it up! 🔥
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Performance */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="subject" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="attendance" 
                      fill="hsl(var(--chart-5))"
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
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Subject Breakdown */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Detailed Subject Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {subjectPerformance.map((subject, index) => (
                <div key={subject.subject} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{subject.subject}</Badge>
                      <h4 className="font-medium">{subject.courseName}</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{subject.attendance}%</span>
                      {subject.trend === 'up' ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm">+{subject.trendValue}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <TrendingDown className="h-4 w-4" />
                          <span className="text-sm">-{subject.trendValue}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Progress value={subject.attendance} className="h-3" />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-2 rounded bg-green-50 dark:bg-green-900/20">
                      <p className="font-medium text-green-600 dark:text-green-400">{subject.present}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Present</p>
                    </div>
                    <div className="text-center p-2 rounded bg-yellow-50 dark:bg-yellow-900/20">
                      <p className="font-medium text-yellow-600 dark:text-yellow-400">{subject.late}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Late</p>
                    </div>
                    <div className="text-center p-2 rounded bg-red-50 dark:bg-red-900/20">
                      <p className="font-medium text-red-600 dark:text-red-400">{subject.absent}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Absent</p>
                    </div>
                    <div className="text-center p-2 rounded bg-gray-50 dark:bg-gray-800">
                      <p className="font-medium">{subject.sessions}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      {subject.attended}/{subject.sessions} sessions attended
                    </span>
                    <span className={
                      subject.attendance >= 90 ? 'text-green-600 dark:text-green-400' :
                      subject.attendance >= 75 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }>
                      {subject.attendance >= 90 ? '✅ Excellent' :
                       subject.attendance >= 75 ? '⚠️ Good' : '❌ Needs Improvement'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="glass border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <Target className="h-5 w-5" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectPerformance.filter(s => s.attendance < 80).length > 0 && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-700 dark:text-yellow-300">
                      Attendance Alert
                    </h4>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                      Your attendance in {subjectPerformance.filter(s => s.attendance < 80).map(s => s.subject).join(', ')} is below 80%. 
                      Consider attending more regularly to maintain good academic standing.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">Study Tips:</h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Set calendar reminders 15 minutes before each class</li>
                    <li>• Review your schedule every Sunday evening</li>
                    <li>• Join study groups to stay motivated</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-700 dark:text-blue-300">Next Steps:</h4>
                  <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Aim for 95%+ attendance this month</li>
                    <li>• Submit apologies for any planned absences</li>
                    <li>• Contact lecturers if you need support</li>
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

export default StudentReports;