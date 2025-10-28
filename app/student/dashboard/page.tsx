'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Camera, 
  FileQuestion, 
  Calendar, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  BookOpen,
  Award,
  Target
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockSessions, mockAttendance, mockUsers } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [attendanceStreak, setAttendanceStreak] = useState(12);

  // Get student's enrolled courses and attendance
  const student = mockUsers.find(u => u.id === user?.id);
  const enrolledCourses = student?.enrolled_courses || [];
  const studentAttendance = mockAttendance.filter(a => a.student_id === user?.id);
  
  // Calculate attendance metrics
  const totalSessions = mockSessions.filter(s => 
    enrolledCourses.includes(s.course_code)
  ).length;
  
  const attendedSessions = studentAttendance.length;
  const overallAttendance = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;
  
  // This week's attendance
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const thisWeekSessions = mockSessions.filter(s => 
    new Date(s.date) >= thisWeekStart && enrolledCourses.includes(s.course_code)
  ).length;
  const thisWeekAttended = studentAttendance.filter(a => 
    new Date(a.timestamp) >= thisWeekStart
  ).length;
  const thisWeekAttendance = thisWeekSessions > 0 ? Math.round((thisWeekAttended / thisWeekSessions) * 100) : 0;

  // Subject performance data
  const subjectPerformance = enrolledCourses.map(courseCode => {
    const courseSessions = mockSessions.filter(s => s.course_code === courseCode);
    const courseAttendance = studentAttendance.filter(a => 
      courseSessions.some(s => s.id === a.session_id)
    );
    const percentage = courseSessions.length > 0 
      ? Math.round((courseAttendance.length / courseSessions.length) * 100)
      : 0;
    
    return {
      subject: courseCode,
      attendance: percentage,
      sessions: courseSessions.length,
      attended: courseAttendance.length
    };
  });

  // Upcoming sessions
  const upcomingSessions = mockSessions
    .filter(s => 
      enrolledCourses.includes(s.course_code) && 
      new Date(s.date) >= new Date() &&
      s.status === 'scheduled'
    )
    .slice(0, 3);

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
            {data.attended}/{data.sessions} sessions attended
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="space-y-6 animate-fadeIn">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 dark:from-purple-800 dark:via-pink-800 dark:to-purple-900 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user?.name?.split(' ')[0]} 🎓
              </h1>
              <p className="opacity-90">
                Keep track of your attendance and stay on top of your studies
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => window.location.href = '/student/scanner'}
              >
                <Camera className="h-4 w-4 mr-2" />
                Scan QR Code
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => window.location.href = '/student/apology'}
              >
                <FileQuestion className="h-4 w-4 mr-2" />
                Submit Apology
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Overall Attendance"
            value={`${overallAttendance}%`}
            subtitle={`${attendedSessions}/${totalSessions} sessions`}
            icon={TrendingUp}
            trend={{
              value: 2.4,
              label: "vs last month",
              isPositive: true
            }}
            color="purple"
          />
          <MetricCard
            title="This Week"
            value={`${thisWeekAttendance}%`}
            subtitle={`${thisWeekAttended}/${thisWeekSessions} sessions`}
            icon={CheckCircle}
            color="green"
          />
          <MetricCard
            title="Attendance Streak"
            value={`${attendanceStreak} days`}
            subtitle="Keep it up! 🔥"
            icon={Award}
            trend={{
              value: attendanceStreak,
              label: "current streak",
              isPositive: true
            }}
            color="orange"
          />
          <MetricCard
            title="Target Progress"
            value="92.4%"
            subtitle="Target: 90%"
            icon={Target}
            color="blue"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:hidden">
          <Button 
            className="h-16 text-left"
            onClick={() => window.location.href = '/student/scanner'}
          >
            <Camera className="h-6 w-6 mr-3" />
            <div>
              <p className="font-medium">Scan QR Code</p>
              <p className="text-sm opacity-90">Mark your attendance</p>
            </div>
          </Button>
          <Button 
            variant="outline"
            className="h-16 text-left"
            onClick={() => window.location.href = '/student/apology'}
          >
            <FileQuestion className="h-6 w-6 mr-3" />
            <div>
              <p className="font-medium">Submit Apology</p>
              <p className="text-sm opacity-90">Report absence</p>
            </div>
          </Button>
        </div>

        {/* Subject Performance Chart */}
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

        {/* Attendance Summary & Upcoming Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectPerformance.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{subject.subject}</span>
                      <span className="text-sm font-medium">{subject.attendance}%</span>
                    </div>
                    <Progress 
                      value={subject.attendance} 
                      className={`h-2 ${
                        subject.attendance >= 90 ? '' : 
                        subject.attendance >= 75 ? 'text-yellow-500' : 'text-red-500'
                      }`}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{subject.attended}/{subject.sessions} sessions</span>
                      <span>
                        {subject.attendance >= 90 ? '✅ Excellent' : 
                         subject.attendance >= 75 ? '⚠️ Good' : '❌ Needs Improvement'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Sessions</CardTitle>
                <Badge variant="secondary">{upcomingSessions.length} scheduled</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingSessions.length > 0 ? (
                  upcomingSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                          <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{session.course_code}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{session.course_name}</p>
                          <p className="text-xs text-gray-500">{session.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{session.start_time}</p>
                        <p className="text-xs text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
                        <Badge variant="outline" className="mt-1">
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No upcoming sessions</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Tips */}
        <Card className="glass border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertTriangle className="h-5 w-5" />
              Performance Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Maintain Good Attendance:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Aim for 90%+ attendance in all subjects</li>
                  <li>• Arrive 5-10 minutes early to avoid being marked late</li>
                  <li>• Set reminders for your class schedule</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">When You Can&apos;t Attend:</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>• Submit apology requests in advance when possible</li>
                  <li>• Provide proper documentation for medical absences</li>
                  <li>• Contact your lecturer about missed content</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;