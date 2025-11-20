'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, CameraOff, Flashlight, FlashlightOff, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface QRScannerProps {
  onScanSuccess: (decodedData: any) => void;
  onScanError?: (error: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  onScanSuccess,
  onScanError
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  // Generate a sample code for the placeholder
  const generateSampleCode = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${result.substring(0, 3)}-${result.substring(3)}`;
  }, []);

  useEffect(() => {
    // Get available cameras - use Html5Qrcode instead of Html5QrcodeScanner
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (err) {
        console.error('Error getting cameras:', err);
        toast.error('Unable to access camera devices');
      }
    };

    getCameras();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error('Error clearing scanner:', err));
      }
    };
  }, []);

  const startScanner = () => {
    setIsScanning(true);
    
    // Wait for DOM to update before initializing scanner
    setTimeout(() => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error(err));
      }

      const scanner = new Html5QrcodeScanner(
        "qr-scanner-container",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
          rememberLastUsedCamera: true
        },
        false
      );

      scanner.render(
        (decodedText) => {
          try {
            const decodedData = JSON.parse(atob(decodedText));
            onScanSuccess(decodedData);
            stopScanner();
            toast.success('QR code scanned successfully!');
          } catch (error) {
            console.error('Error parsing QR data:', error);
            toast.error('Invalid QR code format');
            if (onScanError) {
              onScanError('Invalid QR code format');
            }
          }
        },
        (errorMessage) => {
          // Suppress frequent scan errors
          console.log('Scan error:', errorMessage);
        }
      );

      scannerRef.current = scanner;
    }, 100);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Format manual code as XXX-XXXX and auto-capitalize
  const formatManualCode = (input: string): string => {
    // Remove all non-alphanumeric characters and convert to uppercase
    let formatted = input.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Limit to 7 characters (3+4)
    if (formatted.length > 7) {
      formatted = formatted.substring(0, 7);
    }
    
    // Add hyphen after 3 characters
    if (formatted.length > 3) {
      formatted = `${formatted.substring(0, 3)}-${formatted.substring(3)}`;
    }
    
    return formatted;
  };

  const handleManualCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatManualCode(e.target.value);
    setManualCode(formatted);
  };

  const validateSessionCode = (code: string) => {
    try {
      const sessions = JSON.parse(localStorage.getItem('attendanceSessions') || '{}');
      const session = sessions[code];
      
      if (!session) {
        throw new Error('Invalid session code');
      }
      
      if (session.expiresAt < Date.now()) {
        throw new Error('This session has expired');
      }
      
      return session;
    } catch (error) {
      console.error('Error validating session:', error);
      throw error;
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualCode.trim()) {
      toast.error('Please enter a session code');
      return;
    }

    // Validate format (XXX-XXXX)
    const codeRegex = /^[A-Z0-9]{3}-[A-Z0-9]{4}$/;
    if (!codeRegex.test(manualCode)) {
      toast.error('Please enter a valid session code (e.g., ABC-1234)');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Call the API endpoint to validate and get session info
      const response = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionCode: manualCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to record attendance');
      }

      // Call the success handler with the session data
      onScanSuccess({
        sessionId: data.session?._id || manualCode,
        courseCode: data.session?.course?.code || '',
        courseName: data.session?.course?.name || '',
        facultyId: data.session?.createdBy || '',
        timestamp: new Date().toISOString(),
        type: 'manual_attendance',
        status: data.status || 'present'
      });
      
      setManualCode('');
      toast.success(data.message || 'Attendance recorded successfully!');
    } catch (error) {
      console.error('Error submitting manual attendance:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to record attendance';
      toast.error(errorMessage);
      if (onScanError) {
        onScanError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchCamera = () => {
    const currentIndex = cameras.findIndex(camera => camera.id === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setSelectedCamera(cameras[nextIndex].id);
    
    if (isScanning) {
      stopScanner();
      setTimeout(startScanner, 100);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Attendance QR Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!isScanning ? (
              <div className="text-center py-8">
                <Camera className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Point your camera at the QR code displayed by your lecturer
                </p>
                <Button onClick={startScanner} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div id="qr-scanner-container" className="rounded-lg overflow-hidden" />
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={switchCamera}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Switch Camera
                  </Button>
                  <Button variant="outline" size="sm" onClick={stopScanner}>
                    <CameraOff className="h-4 w-4 mr-2" />
                    Stop Camera
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle>Enter Session Code Manually</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manual-code">Session Code</Label>
              <Input
                id="manual-code"
                placeholder="Enter code (e.g., ABC-1234)"
                value={manualCode}
                onChange={handleManualCodeChange}
                maxLength={8} // 3 + 1 (hyphen) + 4
                className="tracking-widest text-center font-mono uppercase"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Enter the 7-character code (e.g., {generateSampleCode()})
              </p>
            </div>
            <Button 
              type="submit" 
              variant="outline" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                'Submit Attendance'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};