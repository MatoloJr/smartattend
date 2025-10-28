'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { QRScanner } from '@/components/qr/QRScanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  UserCheck, 
  Clock, 
  Users,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockSessions, mockUsers } from '@/lib/mock-data';
import { toast } from 'sonner';

interface ScannedStudent {
  studentId: string;
  studentName: string;
  sessionId: string;
  timestamp: string;
}

const FacultyScanner: React.FC = () => {
  const { user } = useAuth();
  const [scannedStudents, setScannedStudents] = useState<ScannedStudent[]>([]);
  const [manualStudentId, setManualStudentId] = useState('');
  const [selectedSession, setSelectedSession] = useState('');

  // Get faculty sessions for today
  const todaySessions = mockSessions.filter(s => 
    s.faculty_id === user?.id && 
    s.date === new Date().toISOString().split('T')[0]
  );

  const handleScanSuccess = (decodedData: any) => {
    console.log('Scanned student data:', decodedData);
    
    if (decodedData.type !== 'student_attendance') {
      toast.error('Invalid QR code type');
      return;
    }

    const student = mockUsers.find(u => u.id === decodedData.studentId);
    if (!student) {
      toast.error('Student not found');
      return;
    }

    const newScan: ScannedStudent = {
      studentId: decodedData.studentId,
      studentName: student.name,
      sessionId: selectedSession || todaySessions[0]?.id || '',
      timestamp: new Date().toISOString()
    };

    setScannedStudents(prev => [...prev, newScan]);
    toast.success(`Attendance marked for ${student.name}`);
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

    const newEntry: ScannedStudent = {
      studentId: student.id,
      studentName: student.name,
      sessionId: selectedSession || todaySessions[0]?.id || '',
      timestamp: new Date().toISOString()
    };

    setScannedStudents(prev => [...prev, newEntry]);
    setManualStudentId('');
    toast.success(`Attendance marked for ${student.name}`);
  };

  const removeStudent = (index: number) => {
    setScannedStudents(prev => prev.filter((_, i) => i !== index));
    toast.info('Student removed from attendance list');
  };

  const submitAttendance = async () => {
    if (scannedStudents.length === 0) {
      toast.error('No students to submit');
      return;
    }

    try {
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`Attendance submitted for ${scannedStudents.length} students`);
      setScannedStudents([]);
      
    } catch (error) {
      toast.error('Failed to submit attendance');
    }
  };

  return (
    <DashboardLayout title="Faculty QR Scanner">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              QR Code Scanner
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Scan student QR codes or manually mark attendance
            </p>
          </div>
          {scannedStudents.length > 0 && (
            <Button onClick={submitAttendance}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Attendance ({scannedStudents.length})
            </Button>
          )}
        </div>

        {/* Session Selection */}
        {todaySessions.length > 1 && (
          <Card className="glass">
            <CardHeader>
              <CardTitle>Select Active Session</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Scanner */}
          <div className="space-y-4">
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={(error) => toast.error(error)}
            />

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
                  Today's Attendance
                </CardTitle>
                <Badge variant="secondary">{scannedStudents.length} present</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {scannedStudents.length > 0 ? (
                  scannedStudents.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xs font-medium">
                          {student.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{student.studentName}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(student.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Present</Badge>
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
                      No students scanned yet
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Students will appear here as they scan their QR codes
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
                          {selectedSession === session.id ? scannedStudents.length : 0} present
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

export default FacultyScanner;