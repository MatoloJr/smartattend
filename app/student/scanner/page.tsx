'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { QRScanner } from '@/components/qr/QRScanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, MapPin, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  generateDeviceFingerprint, 
  checkRateLimit, 
  verifyQRExpiry,
  verifyWatermark 
} from '@/lib/security';

interface ScannedSession {
  sessionId: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  timestamp: string;
  type: string;
}

const StudentScanner: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [scannedSession, setScannedSession] = useState<ScannedSession | null>(null);
  const [studentId, setStudentId] = useState(user?.student_id || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceSubmitted, setAttendanceSubmitted] = useState(false);

  const handleScanSuccess = async (decodedData: any) => {
    console.log('Decoded QR data:', decodedData);
    
    try {
      // Check if it's the new secure format or old format
      const isSecureFormat = decodedData.type === 'secure_attendance_session';
      const isLegacyFormat = decodedData.type === 'attendance_session';
      
      if (!isSecureFormat && !isLegacyFormat) {
        toast.error('Invalid QR code type');
        return;
      }

      // For secure format, perform additional validations
      if (isSecureFormat) {
        // Verify QR code hasn't expired
        if (!verifyQRExpiry(decodedData.expiry)) {
          toast.error('QR code has expired. Ask lecturer for a new code.');
          return;
        }

        // Generate device fingerprint
        const deviceFingerprint = await generateDeviceFingerprint();

        // Check rate limiting
        const rateLimitCheck = checkRateLimit(
          user?.id || '',
          decodedData.sessionId,
          deviceFingerprint.id,
          decodedData.nonce
        );

        if (!rateLimitCheck.allowed) {
          toast.error(rateLimitCheck.reason || 'Submission blocked. Please try again later.');
          return;
        }

        // Verify watermark
        if (!verifyWatermark(decodedData.sessionId, decodedData.nonce, decodedData.watermark)) {
          toast.error('QR code verification failed. Please scan again.');
          return;
        }

        toast.success('QR code verified successfully! ✓');
      } else {
        toast.success('QR code scanned successfully!');
      }

      setScannedSession(decodedData);
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      toast.error('Failed to process QR code');
    }
  };

  const handleScanError = (error: string) => {
    console.error('Scan error:', error);
    toast.error('Failed to scan QR code');
  };

  const submitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scannedSession) {
      toast.error('No session data found');
      return;
    }

    setIsSubmitting(true);

    try {
      // Extract session code or session ID from scanned data
      const sessionCode = scannedSession.sessionId?.includes('-') 
        ? scannedSession.sessionId 
        : null;
      const sessionId = !sessionCode ? scannedSession.sessionId : null;

      // Call the API endpoint
      const response = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionCode: sessionCode,
          sessionId: sessionId,
        }),
      });

      // Check for Vercel security checkpoint
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('text/html')) {
        const text = await response.text();
        if (text.includes('Vercel Security Checkpoint')) {
          throw new Error(
            'Security checkpoint detected. Please wait a moment and try again.'
          );
        }
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit attendance');
      }

      setAttendanceSubmitted(true);
      toast.success(data.message || 'Attendance marked successfully! ✓');
      
    } catch (error: any) {
      console.error('Error submitting attendance:', error);
      toast.error(error.message || 'Failed to submit attendance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetScanner = () => {
    setScannedSession(null);
    setAttendanceSubmitted(false);
    setStudentId(user?.student_id || '');
    setEmail(user?.email || '');
  };

  if (attendanceSubmitted && scannedSession) {
    return (
      <DashboardLayout title="Attendance Confirmed">
        <div className="max-w-md mx-auto space-y-6 animate-fadeIn">
          <Card className="glass border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
            <CardContent className="text-center py-8">
              <div className="mb-4">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                Attendance Confirmed! ✅
              </h2>
              <p className="text-green-600 dark:text-green-400 mb-6">
                You have been marked present for this session.
              </p>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold mb-2">{scannedSession.courseName}</h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <p>Course: {scannedSession.courseCode}</p>
                  <p>Lecturer: {scannedSession.facultyName}</p>
                  <p>Student ID: {studentId}</p>
                  <p>Time: {new Date().toLocaleString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={resetScanner} variant="outline" className="flex-1">
                  Scan Another
                </Button>
                <Button onClick={() => router.push('/student/dashboard')} className="flex-1">
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (scannedSession) {
    return (
      <DashboardLayout title="Confirm Attendance">
        <div className="max-w-md mx-auto space-y-6 animate-fadeIn">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Session Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">{scannedSession.courseName}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{scannedSession.courseCode}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <User className="h-4 w-4" />
                      <span>{scannedSession.facultyName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(scannedSession.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={submitAttendance} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-id">Student ID *</Label>
                    <Input
                      id="student-id"
                      placeholder="Enter your student/admission number"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Confirmation email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetScanner}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !studentId.trim()}
                      className="flex-1"
                    >
                      {isSubmitting ? 'Submitting...' : 'Mark Attendance'}
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Scan QR Code">
      <div className="max-w-md mx-auto space-y-6 animate-fadeIn">
        <QRScanner
          onScanSuccess={handleScanSuccess}
          onScanError={handleScanError}
        />
        
        <Card className="glass">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                <p>Ask your lecturer to display the QR code for the session</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                <p>Point your camera at the QR code</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                <p>Confirm your details and submit attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentScanner;