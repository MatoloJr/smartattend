'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Calendar,
  BookOpen,
  TrendingUp,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockSessions, mockAttendance } from '@/lib/mock-data';
import { toast } from 'sonner';

interface SessionState {
  id: string;
  isActive: boolean;
  startTime?: Date;
  duration: number;
  attendees: number;
  qrTimestamp: string;
}

const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<SessionState | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [realtimeAttendance, setRealtimeAttendance] = useState(0);

  // Get faculty sessions
  const facultySessions = mockSessions.filter(s => s.faculty_id === user?.id);
  const todaysSession = facultySessions.find(s => s.date === new Date().toISOString().split('T')[0]);
  
  // Calculate metrics
  const totalSessions = facultySessions.length;
  const completedSessions = facultySessions.filter(s => s.status === 'completed').length;
  const avgAttendance = 85.2;
  const totalStudents = facultySessions.reduce((acc, s) => acc + s.enrolled_students, 0) / facultySessions.length;

  // Timer effect for active session
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeSession?.isActive) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
        
        // Simulate real-time attendance updates
        if (Math.random() > 0.7 && realtimeAttendance < activeSession.attendees) {
          setRealtimeAttendance(prev => Math.min(prev + 1, activeSession.attendees));
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [activeSession, realtimeAttendance]);

  const startSession = () => {
    if (!todaysSession) {
      toast.error('No session scheduled for today');
      return;
    }

    const session: SessionState = {
      id: todaysSession.id,
      isActive: true,
      startTime: new Date(),
      duration: todaysSession.duration,
      attendees: todaysSession.enrolled_students,
      qrTimestamp: new Date().toISOString()
    };

    setActiveSession(session);
    setSessionTimer(0);
    setRealtimeAttendance(0);
    toast.success('Session started successfully!');
  };

  const pauseSession = () => {
    if (activeSession) {
      setActiveSession({ ...activeSession, isActive: false });
      toast.info('Session paused');
    }
  };

  const resumeSession = () => {
    if (activeSession) {
      setActiveSession({ ...activeSession, isActive: true });
      toast.success('Session resumed');
    }
  };

  const endSession = () => {
    if (activeSession) {
      setActiveSession(null);
      setSessionTimer(0);
      toast.success('Session ended successfully!');
    }
  };

  const regenerateQR = () => {
    if (activeSession) {
      setActiveSession({
        ...activeSession,
        qrTimestamp: new Date().toISOString()
      });
      toast.success('QR code regenerated');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const attendancePercentage = activeSession 
    ? Math.round((realtimeAttendance / activeSession.attendees) * 100)
    : 0;

  return (
    <DashboardLayout title="Faculty Dashboard">
      <div className="space-y-6 animate-fadeIn">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 via-teal-600 to-green-800 dark:from-green-800 dark:via-teal-800 dark:to-green-900 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, Prof. {user?.name?.split(' ')[0]} 👨‍🏫
              </h1>
              <p className="opacity-90">
                Ready to manage your classes and track attendance
              </p>
            </div>
            {todaysSession && (
              <div className="hidden md:block text-right">
                <p className="text-sm opacity-90">Next Session</p>
                <p className="font-semibold">{todaysSession.course_code}</p>
                <p className="text-sm">{todaysSession.start_time} - {todaysSession.end_time}</p>
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Sessions"
            value={totalSessions}
            subtitle="All time"
            icon={Calendar}
            trend={{
              value: 12.5,
              label: "vs last month",
              isPositive: true
            }}
            color="green"
          />
          <MetricCard
            title="Completed"
            value={`${completedSessions}/${totalSessions}`}
            subtitle={`${Math.round((completedSessions/totalSessions) * 100)}% completion`}
            icon={CheckCircle}
            color="blue"
          />
          <MetricCard
            title="Avg Students"
            value={Math.round(totalStudents)}
            subtitle="Per session"
            icon={Users}
            color="purple"
          />
          <MetricCard
            title="Avg Attendance"
            value={`${avgAttendance}%`}
            subtitle="Your classes"
            icon={TrendingUp}
            trend={{
              value: 3.2,
              label: "vs last week",
              isPositive: true
            }}
            color="orange"
          />
        </div>

        {/* Session Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Session Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!activeSession ? (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {todaysSession ? todaysSession.course_name : 'No Session Scheduled'}
                  </h3>
                  {todaysSession ? (
                    <div className="space-y-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <p>{todaysSession.course_code} • {todaysSession.location}</p>
                        <p>{todaysSession.start_time} - {todaysSession.end_time}</p>
                        <p>{todaysSession.enrolled_students} students enrolled</p>
                      </div>
                      <Button onClick={startSession} className="w-full">
                        <Play className="h-4 w-4 mr-2" />
                        Start Session
                      </Button>
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400">
                      No sessions scheduled for today
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">{todaysSession?.course_name}</h3>
                    <Badge variant={activeSession.isActive ? "destructive" : "secondary"} className="mb-4">
                      {activeSession.isActive ? "LIVE SESSION" : "PAUSED"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-lg font-bold">{formatTime(sessionTimer)}</p>
                      <p className="text-xs text-gray-500">Duration</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Users className="h-5 w-5 mx-auto mb-1 text-green-500" />
                      <p className="text-lg font-bold">{realtimeAttendance}/{activeSession.attendees}</p>
                      <p className="text-xs text-gray-500">Present</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Attendance Progress</span>
                      <span>{attendancePercentage}%</span>
                    </div>
                    <Progress value={attendancePercentage} className="h-3" />
                  </div>

                  <div className="flex gap-2">
                    {activeSession.isActive ? (
                      <Button variant="outline" onClick={pauseSession} className="flex-1">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button onClick={resumeSession} className="flex-1">
                        <Play className="h-4 w-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    <Button variant="destructive" onClick={endSession} className="flex-1">
                      <Square className="h-4 w-4 mr-2" />
                      End Session
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* QR Code Display */}
          {activeSession && todaysSession && (
            <QRGenerator
              sessionId={activeSession.id}
              courseCode={todaysSession.course_code}
              courseName={todaysSession.course_name}
              facultyName={todaysSession.faculty_name}
              facultyId={user?.id || ''}
              timestamp={activeSession.qrTimestamp}
              onRegenerateCode={regenerateQR}
            />
          )}
        </div>

        {/* Today's Schedule & Recent Attendance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {facultySessions.filter(s => 
                  s.date === new Date().toISOString().split('T')[0]
                ).length > 0 ? (
                  facultySessions.filter(s => 
                    s.date === new Date().toISOString().split('T')[0]
                  ).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{session.course_code}</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{session.course_name}</p>
                        <p className="text-xs text-gray-500">{session.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{session.start_time} - {session.end_time}</p>
                        <p className="text-xs text-gray-500">{session.enrolled_students} students</p>
                        <Badge variant={session.id === activeSession?.id ? "destructive" : "secondary"} className="mt-1">
                          {session.id === activeSession?.id ? "Active" : session.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No sessions scheduled for today</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Attendance</CardTitle>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAttendance.filter(a => 
                  facultySessions.some(s => s.id === a.session_id)
                ).slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xs font-medium">
                        {record.student_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{record.student_name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{record.student_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        record.status === 'present' ? 'default' :
                        record.status === 'late' ? 'destructive' : 'secondary'
                      }>
                        {record.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;