'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Pause, 
  Square, 
  Plus,
  Calendar,
  Clock,
  Users,
  MapPin,
  Settings,
  Eye,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockSessions } from '@/lib/mock-data';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ActiveSession {
  id: string;
  courseCode: string;
  courseName: string;
  startTime: Date;
  duration: number;
  enrolledStudents: number;
  currentAttendance: number;
  qrTimestamp: string;
  isActive: boolean;
}

const sessionFormSchema = z.object({
  courseCode: z.string().min(1, 'Course code is required'),
  courseName: z.string().min(1, 'Course name is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().min(1, 'Location is required'),
  enrolledStudents: z.number().min(1, 'Number of students is required')
});

type SessionFormValues = z.infer<typeof sessionFormSchema>;

const FacultySessions: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [sessionTimer, setSessionTimer] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  
  const form = useForm<SessionFormValues>({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      courseCode: '',
      courseName: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      enrolledStudents: 30
    },
  });

  // Get faculty sessions
  const facultySessions = mockSessions.filter(s => s.faculty_id === user?.id);
  const todaySessions = facultySessions.filter(s => s.date === selectedDate);

  const handleCreateSession = (data: SessionFormValues) => {
    // In a real app, this would be an API call
    const newSession = {
      id: `session_${Date.now()}`,
      course_code: data.courseCode,
      course_name: data.courseName,
      faculty_id: user?.id || '',
      faculty_name: user?.name || 'Instructor',
      date: data.date,
      start_time: data.startTime,
      end_time: data.endTime,
      duration: (new Date(`1970-01-01T${data.endTime}`).getTime() - new Date(`1970-01-01T${data.startTime}`).getTime()) / 60000,
      location: data.location,
      enrolled_students: data.enrolledStudents,
      attendance_records: [],
      qr_code: '',
      status: 'scheduled' as const,
      created_at: new Date().toISOString()
    };
    
    // In a real app, update the state or make an API call
    mockSessions.push(newSession);
    setIsSessionDialogOpen(false);
    form.reset();
    toast.success('Session created successfully!');
  };

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeSession?.isActive) {
      interval = setInterval(() => {
        setSessionTimer(prev => prev + 1);
        
        // Simulate attendance updates
        if (Math.random() > 0.8) {
          setActiveSession(prev => prev ? {
            ...prev,
            currentAttendance: Math.min(prev.currentAttendance + 1, prev.enrolledStudents)
          } : null);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [activeSession]);

  const startSession = (session: any) => {
    const newActiveSession: ActiveSession = {
      id: session.id,
      courseCode: session.course_code,
      courseName: session.course_name,
      startTime: new Date(),
      duration: session.duration,
      enrolledStudents: session.enrolled_students,
      currentAttendance: 0,
      qrTimestamp: new Date().toISOString(),
      isActive: true
    };

    setActiveSession(newActiveSession);
    setSessionTimer(0);
    toast.success(`Session started for ${session.course_code}`);
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
      toast.success(`Session ended. Final attendance: ${activeSession.currentAttendance}/${activeSession.enrolledStudents}`);
      setActiveSession(null);
      setSessionTimer(0);
    }
  };

  const regenerateQR = () => {
    if (activeSession) {
      setActiveSession({
        ...activeSession,
        qrTimestamp: new Date().toISOString()
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const attendancePercentage = activeSession 
    ? Math.round((activeSession.currentAttendance / activeSession.enrolledStudents) * 100)
    : 0;

  return (
    <DashboardLayout title="Session Management">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Session Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your classes and track attendance in real-time
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
            <Button 
              size="sm" 
              onClick={() => setIsSessionDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>
        </div>

        {/* Active Session Control */}
        {activeSession && (
          <Card className="glass border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  Live Session: {activeSession.courseCode}
                </CardTitle>
                <Badge variant={activeSession.isActive ? "destructive" : "secondary"}>
                  {activeSession.isActive ? "ACTIVE" : "PAUSED"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">{activeSession.courseName}</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-800">
                      <Clock className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-lg font-bold">{formatTime(sessionTimer)}</p>
                      <p className="text-xs text-gray-500">Duration</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-800">
                      <Users className="h-5 w-5 mx-auto mb-1 text-green-500" />
                      <p className="text-lg font-bold">{activeSession.currentAttendance}/{activeSession.enrolledStudents}</p>
                      <p className="text-xs text-gray-500">Present</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Attendance Progress</span>
                      <span>{attendancePercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${attendancePercentage}%` }}
                      />
                    </div>
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Sessions */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Sessions for {new Date(selectedDate).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySessions.length > 0 ? (
                todaySessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">{session.course_code}</Badge>
                        <h4 className="font-medium">{session.course_name}</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{session.start_time} - {session.end_time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{session.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{session.enrolled_students} students</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        session.id === activeSession?.id ? "destructive" :
                        session.status === 'completed' ? "default" : "secondary"
                      }>
                        {session.id === activeSession?.id ? "Active" : session.status}
                      </Badge>
                      {session.id !== activeSession?.id && session.status === 'scheduled' && (
                        <Button size="sm" onClick={() => startSession(session)}>
                          <Play className="h-4 w-4 mr-2" />
                          Start
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No sessions scheduled for this date</p>
                  <Button 
                    className="mt-4"
                    onClick={() => setIsSessionDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Session
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Session History */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Sessions</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/faculty/analytics')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {facultySessions.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{session.course_code}</Badge>
                      <span className="font-medium text-sm">{session.course_name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <span>{new Date(session.date).toLocaleDateString()}</span>
                      <span>{session.start_time} - {session.end_time}</span>
                      <span>{session.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      session.status === 'completed' ? 'default' :
                      session.status === 'active' ? 'destructive' : 'secondary'
                    }>
                      {session.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {session.enrolled_students} students
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Session Dialog */}
      <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new class session.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateSession)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="courseCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. CS101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="courseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Introduction to Programming" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                        <Input type="date" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Room 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="enrolledStudents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Students</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsSessionDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default FacultySessions;