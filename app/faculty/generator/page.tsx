'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { QRGenerator } from '@/components/qr/QRGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  QrCode, 
  UserCheck, 
  Clock, 
  Users,
  CheckCircle,
  AlertCircle,
  Search,
  Shield,
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockSessions, mockUsers } from '@/lib/mock-data';
import { toast } from 'sonner';
import { 
  generateDeviceFingerprint, 
  checkRateLimit, 
  verifyQRExpiry, 
  flagSuspiciousActivity,
  getSuspiciousActivities
} from '@/lib/security';

interface AttendanceRecord {
  studentId: string;
  studentName: string;
  sessionId: string;
  timestamp: string;
  deviceFingerprint?: string;
  status: 'present' | 'late' | 'flagged';
}

const FacultyQRGenerator: React.FC = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [manualStudentId, setManualStudentId] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [suspiciousCount, setSuspiciousCount] = useState(0);

  // Get faculty sessions for today
  const todaySessions = mockSessions.filter(s => 
    s.faculty_id === user?.id && 
    s.date === new Date().toISOString().split('T')[0]
  );
  
  // Auto-select first session if available and none selected
  useEffect(() => {
    if (todaySessions.length > 0 && !selectedSession) {
      setSelectedSession(todaySessions[0].id);
    }
  }, [todaySessions, selectedSession]);

  // Monitor suspicious activities
  useEffect(() => {
    const interval = setInterval(() => {
      const suspicious = getSuspiciousActivities({
        sessionId: selectedSession,
        severity: 'high'
      });
      setSuspiciousCount(suspicious.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [selectedSession]);

  const handleStudentScan = async (studentData: any) => {
    try {
      // Verify QR code type and expiry
      if (studentData.type !== 'secure_attendance_session') {
        toast.error('Invalid QR code type');
        return;
      }

      if (!verifyQRExpiry(studentData.expiry)) {
        toast.error('QR code has expired');
        return;
      }

      // Generate device fingerprint
      const deviceFingerprint = await generateDeviceFingerprint();

      // Check rate limiting and anomaly detection
      const rateLimitCheck = checkRateLimit(
        studentData.studentId,
        studentData.sessionId,
        deviceFingerprint.id,
        studentData.nonce
      );

      if (!rateLimitCheck.allowed) {
        toast.error(rateLimitCheck.reason || 'Attendance submission blocked');
        
        // Flag suspicious activity
        flagSuspiciousActivity({
          studentId: studentData.studentId,
          sessionId: studentData.sessionId,
          reason: rateLimitCheck.reason || 'Rate limit exceeded',
          timestamp: Date.now(),
          deviceFingerprint: deviceFingerprint.id,
          severity: 'medium'
        });
        
        return;
      }

      const student = mockUsers.find(u => u.id === studentData.studentId);
      if (!student) {
        toast.error('Student not found');
        return;
      }

      // Determine status based on time
      const now = new Date();
      const sessionStart = sessionStartTime || new Date();
      const minutesLate = Math.floor((now.getTime() - sessionStart.getTime()) / 60000);
      const status = minutesLate > 15 ? 'late' : 'present';

      const newRecord: AttendanceRecord = {
        studentId: studentData.studentId,
        studentName: student.name,
        sessionId: selectedSession || todaySessions[0]?.id || '',
        timestamp: new Date().toISOString(),
        deviceFingerprint: deviceFingerprint.id,
        status
      };

      setAttendanceRecords(prev => [...prev, newRecord]);
      toast.success(`Attendance marked for ${student.name} - ${status.toUpperCase()}`);
      
    } catch (error) {
      console.error('Error processing attendance:', error);
      toast.error('Failed to process attendance');
    }
  };

  const handleManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualStudentId.trim()) {
      toast.error('Please enter a student ID');
      return;
    }

    const student = mockUsers.find(u => 
      u.student_id === manualStudentId || 
      u.username === manualStudentId ||
      u.email === manualStudentId
    );

    if (!student) {
      toast.error('Student not found');
      return;
    }

    const newEntry: AttendanceRecord = {
      studentId: student.id,
      studentName: student.name,
      sessionId: selectedSession || todaySessions[0]?.id || '',
      timestamp: new Date().toISOString(),
      status: 'present'
    };

    setAttendanceRecords(prev => [...prev, newEntry]);
    setManualStudentId('');
    toast.success(`Attendance marked for ${student.name}`);
  };

  const removeStudent = (index: number) => {
    setAttendanceRecords(prev => prev.filter((_, i) => i !== index));
    toast.info('Student removed from attendance list');
  };

  const startSession = () => {
    if (!selectedSession) {
      toast.error('Please select a session first');
      return;
    }
    setSessionActive(true);
    setSessionStartTime(new Date());
    toast.success('Session started! QR code is now active.');
  };

  const endSession = async () => {
    if (attendanceRecords.length === 0) {
      toast.error('No attendance records to submit');
      return;
    }

    try {
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Session ended. ${attendanceRecords.length} attendance records submitted.`);
      setSessionActive(false);
      setAttendanceRecords([]);
      setSessionStartTime(null);
      
    } catch (error) {
      toast.error('Failed to end session');
    }
  };

  const currentSession = todaySessions.find(s => s.id === selectedSession) || todaySessions[0];

  return (
    <DashboardLayout title="QR Code Generator">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <QrCode className="h-7 w-7 text-blue-500" />
              Secure QR Code Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate time-limited QR codes for attendance tracking
            </p>
            {sessionStartTime && (
              <p className="text-xs text-gray-500 mt-1">
                Session started: {sessionStartTime.toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {!sessionActive ? (
              <Button onClick={startSession} disabled={!selectedSession}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Start Session
              </Button>
            ) : (
              <Button onClick={endSession} variant="destructive">
                <CheckCircle className="h-4 w-4 mr-2" />
                End Session ({attendanceRecords.length})
              </Button>
            )}
          </div>
        </div>

        {/* Security Alert */}
        {suspiciousCount > 0 && (
          <Card className="glass border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-700 dark:text-red-300">
                    {suspiciousCount} suspicious {suspiciousCount === 1 ? 'activity' : 'activities'} detected
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Review flagged submissions for potential fraud
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Selection */}
        {todaySessions.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>{todaySessions.length > 1 ? 'Select Active Session' : 'Today\'s Session'}</CardTitle>
            </CardHeader>
            <CardContent>
              {todaySessions.length === 1 ? (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default">{todaySessions[0].course_code}</Badge>
                    <span className="font-medium text-lg">{todaySessions[0].course_name}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{todaySessions[0].start_time} - {todaySessions[0].end_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{todaySessions[0].enrolled_students} students enrolled</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {todaySessions.map((session) => (
                    <Button
                      key={session.id}
                      variant={selectedSession === session.id ? "default" : "outline"}
                      className="h-auto p-4 text-left"
                      onClick={() => setSelectedSession(session.id)}
                    >
                      <div className="w-full">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{session.course_code}</Badge>
                          <span className="font-medium">{session.course_name}</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {session.start_time} - {session.end_time} • {session.location}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* No Sessions Warning */}
        {todaySessions.length === 0 && (
          <Card className="glass border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-900/20">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto text-orange-500 mb-3" />
              <h3 className="font-semibold text-lg mb-2">No Sessions Scheduled</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You don't have any sessions scheduled for today. Please check your schedule or contact administration.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Generator */}
          <div className="space-y-4">
            {sessionActive && currentSession ? (
              <QRGenerator
                sessionId={currentSession.id}
                courseCode={currentSession.course_code}
                courseName={currentSession.course_name}
                facultyName={user?.name || 'Faculty'}
                facultyId={user?.id || ''}
                timestamp={new Date().toISOString()}
                onRegenerateCode={() => {
                  toast.info('QR code regenerated with new security token');
                }}
              />
            ) : (
              <Card className="glass">
                <CardContent className="p-12 text-center">
                  <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Select a session and click "Start Session" to generate QR code
                  </p>
                  <Button onClick={startSession} disabled={!selectedSession}>
                    Start Session
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Manual Entry */}
            <Card className="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Manual Entry
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualEntry} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-id">Student ID / Username / Email</Label>
                    <Input
                      id="student-id"
                      placeholder="Enter student identifier"
                      value={manualStudentId}
                      onChange={(e) => setManualStudentId(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    <UserCheck className="h-4 w-4 mr-2" />
                    Mark Present
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Attendance List */}
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Live Attendance
                </CardTitle>
                <div className="flex items-center gap-2">
                  {sessionActive && (
                    <Badge variant="default" className="bg-green-500">
                      <Activity className="h-3 w-3 mr-1 animate-pulse" />
                      Live
                    </Badge>
                  )}
                  <Badge variant="secondary">{attendanceRecords.length} recorded</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {attendanceRecords.length > 0 ? (
                  attendanceRecords.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                          record.status === 'present' ? 'bg-gradient-to-br from-green-500 to-teal-600' :
                          record.status === 'late' ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                          'bg-gradient-to-br from-red-500 to-pink-600'
                        }`}>
                          {record.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{record.studentName}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(record.timestamp).toLocaleTimeString()}
                            {record.deviceFingerprint && (
                              <span className="ml-2 text-gray-500">
                                • {record.deviceFingerprint.substring(0, 8)}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          record.status === 'present' ? 'default' :
                          record.status === 'late' ? 'secondary' : 'destructive'
                        }>
                          {record.status === 'present' ? <CheckCircle className="h-3 w-3 mr-1" /> :
                           record.status === 'late' ? <Clock className="h-3 w-3 mr-1" /> :
                           <AlertTriangle className="h-3 w-3 mr-1" />}
                          {record.status.toUpperCase()}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStudent(index)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {sessionActive ? 'Waiting for students to scan...' : 'No attendance records yet'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {sessionActive ? 'Students will appear here as they scan the QR code' : 'Start a session to begin tracking'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Session Summary */}
        {todaySessions.length > 0 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Session Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {todaySessions.map((session) => (
                  <div key={session.id} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{session.course_code}</Badge>
                      <span className="font-medium text-sm">{session.course_name}</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{session.start_time} - {session.end_time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{session.enrolled_students} students enrolled</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>
                          {selectedSession === session.id ? attendanceRecords.length : 0} present
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FacultyQRGenerator;