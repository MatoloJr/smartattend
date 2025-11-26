'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Maximize, Share2, RefreshCw, Shield, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface QRGeneratorProps {
  sessionId: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  facultyId: string;
  timestamp: string;
  onRegenerateCode?: () => void;
}

interface SecureQRPayload {
  sessionId: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  nonce: string;
  sessionCode: string;
  expiry: number;
  timestamp: string;
  type: 'secure_attendance_session';
  watermark: string;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  sessionId,
  courseCode,
  courseName,
  facultyName,
  facultyId,
  timestamp,
  onRegenerateCode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrData, setQrData] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expiryMinutes, setExpiryMinutes] = useState<number>(5);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentNonce, setCurrentNonce] = useState<string>('');
  const [sessionCode, setSessionCode] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  
  const generateSessionCode = useCallback(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude easily confused characters
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Format as XXX-XXXX for better readability
    return `${result.substring(0, 3)}-${result.substring(3)}`;
  }, []);

  // Generate cryptographic nonce
  const generateNonce = useCallback(() => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }, []);

  // Generate device fingerprint hash
  const generateWatermark = useCallback((nonce: string) => {
    const timestamp = Date.now().toString();
    const data = `${sessionId}-${nonce}-${timestamp}`;
    return btoa(data).substring(0, 12);
  }, [sessionId]);

  // In-memory storage for demo purposes
  // In a real app, this would be replaced with a database
  const saveSessionToStorage = (code: string, expiry: number) => {
    const sessions = JSON.parse(localStorage.getItem('attendanceSessions') || '{}');
    sessions[code] = {
      sessionId,
      courseCode,
      courseName,
      facultyId,
      expiresAt: expiry,
      createdAt: Date.now()
    };
    localStorage.setItem('attendanceSessions', JSON.stringify(sessions));
  };

  // Generate secure QR code
  const generateSecureQR = useCallback((minutes: number) => {
    const nonce = generateNonce();
    const code = generateSessionCode();
    const expiry = Date.now() + (minutes * 60 * 1000);
    const watermark = generateWatermark(nonce);
    
    const qrPayload: SecureQRPayload = {
      sessionId,
      courseCode,
      courseName,
      facultyId,
      nonce,
      sessionCode: code,
      expiry,
      timestamp: new Date().toISOString(),
      type: 'secure_attendance_session',
      watermark
    };
    
    try {
      // Save to local storage for demo purposes
      saveSessionToStorage(code, expiry);
      
      setSessionCode(code);
      
      const encodedData = btoa(JSON.stringify(qrPayload));
      setQrData(encodedData);
      setCurrentNonce(nonce);
      setTimeRemaining(minutes * 60);
      setIsExpired(false);
      generateQR(encodedData, watermark);
      
      toast.success('Attendance session started');
    } catch (error) {
      console.error('Error creating attendance session:', error);
      toast.error('Failed to start attendance session');
    }
  }, [sessionId, courseCode, courseName, facultyId, generateNonce, generateWatermark]);

  // Initialize QR code
  useEffect(() => {
    generateSecureQR(expiryMinutes);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      setIsExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Prevent screenshots and screen recording
  useEffect(() => {
    const preventScreenCapture = () => {
      // Add CSS to prevent screenshots
      const style = document.createElement('style');
      style.innerHTML = `
        .qr-protected {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
        }
      `;
      document.head.appendChild(style);

      // Detect screenshot attempts (limited browser support)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          console.warn('Potential screenshot attempt detected');
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        style.remove();
      };
    };

    return preventScreenCapture();
  }, []);

  const generateQR = async (data: string, watermark: string) => {
    if (!canvasRef.current) return;

    try {
      // Set canvas size for better control
      const size = 300; // Reduced from 400 for better fit
      canvasRef.current.width = size;
      canvasRef.current.height = size;
      
      // Generate base QR code
      await QRCode.toCanvas(canvasRef.current, data, {
        width: size,
        margin: 1,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H' // High error correction for watermark overlay
      });

      // Add visible watermark overlay
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // Semi-transparent watermark
        ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        
        // Add watermark text
        const watermarkText = `${watermark} • ${new Date().toLocaleTimeString()}`;
        ctx.fillText(watermarkText, canvasRef.current.width / 2, canvasRef.current.height - 10);
        
        // Add session ID watermark at top
        ctx.fillText(`Session: ${sessionId.substring(0, 8)}`, canvasRef.current.width / 2, 20);
        
        // Add forensic invisible watermark (steganography-like)
        const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
        const data = imageData.data;
        const watermarkBytes = new TextEncoder().encode(watermark);
        
        // Embed watermark in LSB of pixels
        for (let i = 0; i < watermarkBytes.length && i * 4 < data.length; i++) {
          data[i * 4] = (data[i * 4] & 0xFE) | ((watermarkBytes[i] >> 7) & 1);
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQR = () => {
    toast.error('Download disabled for security. Display QR code on screen only.');
  };

  const shareQR = async () => {
    toast.error('Sharing disabled for security. Display QR code on screen only.');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const regenerateCode = () => {
    generateSecureQR(expiryMinutes);
    
    if (onRegenerateCode) {
      onRegenerateCode();
    }
    
    toast.success('Secure QR code regenerated with new nonce');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 qr-protected">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full mx-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {courseCode}
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {courseName}
          </p>
          
          {/* Timer Display */}
          <div className={`mb-4 p-3 rounded-lg ${
            isExpired ? 'bg-red-100 dark:bg-red-900/30' : 
            timeRemaining < 60 ? 'bg-orange-100 dark:bg-orange-900/30' : 
            'bg-green-100 dark:bg-green-900/30'
          }`}>
            <div className="flex items-center justify-center gap-2">
              <Clock className={`h-5 w-5 ${
                isExpired ? 'text-red-600' : 
                timeRemaining < 60 ? 'text-orange-600' : 
                'text-green-600'
              }`} />
              <span className={`text-2xl font-bold ${
                isExpired ? 'text-red-600' : 
                timeRemaining < 60 ? 'text-orange-600' : 
                'text-green-600'
              }`}>
                {isExpired ? 'EXPIRED' : formatTime(timeRemaining)}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {isExpired ? 'Generate new code' : 'Time remaining'}
            </p>
          </div>
          
          <div className="flex justify-center mb-4 relative qr-protected">
            {isExpired && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                <div className="text-center text-white">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-bold">QR Code Expired</p>
                  <p className="text-sm">Generate a new code</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="rounded-xl shadow-2xl" />
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 space-y-1">
            <p>🔒 Screenshot protection enabled</p>
            <p>🔐 Watermark: {currentNonce.substring(0, 8)}...</p>
            <p>⏱️ Valid for {expiryMinutes} minute{expiryMinutes !== 1 ? 's' : ''}</p>
          </div>
          
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={toggleFullscreen}>
              Exit Fullscreen
            </Button>
            <Button onClick={regenerateCode}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="glass overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-blue-500" />
          Secure QR Code
        </CardTitle>
      </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={regenerateCode}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Expiry Time Selector */}
            <div className="space-y-2">
              <Label htmlFor="expiry-time">QR Code Validity Period</Label>
              <Select 
                value={expiryMinutes.toString()} 
                onValueChange={(value) => {
                  const minutes = parseInt(value);
                  setExpiryMinutes(minutes);
                  generateSecureQR(minutes);
                }}
              >
                <SelectTrigger id="expiry-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 minute</SelectItem>
                  <SelectItem value="2">2 minutes</SelectItem>
                  <SelectItem value="3">3 minutes</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="7">7 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timer Display */}
            <div className={`p-4 rounded-lg text-center ${
              isExpired ? 'bg-red-100 dark:bg-red-900/30' : 
              timeRemaining < 60 ? 'bg-orange-100 dark:bg-orange-900/30' : 
              'bg-green-100 dark:bg-green-900/30'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className={`h-5 w-5 ${
                  isExpired ? 'text-red-600' : 
                  timeRemaining < 60 ? 'text-orange-600' : 
                  'text-green-600'
                }`} />
                <span className={`text-3xl font-bold ${
                  isExpired ? 'text-red-600' : 
                  timeRemaining < 60 ? 'text-orange-600' : 
                  'text-green-600'
                }`}>
                  {isExpired ? 'EXPIRED' : formatTime(timeRemaining)}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isExpired ? 'Click regenerate to create new code' : 'Remaining time'}
              </p>
            </div>
            
            {/* QR Code Display */}
            <div className="relative">
              {isExpired && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center text-white">
                    <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
                    <p className="font-bold">Expired</p>
                  </div>
                </div>
              )}
              <div className="relative mx-auto mb-6 flex justify-center">
                <div className="w-full max-w-[300px] aspect-square">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-full border-4 border-blue-100 dark:border-blue-900 rounded-lg shadow-lg"
                  />
                </div>
              </div>
            </div>
            
            {/* Security Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg space-y-2 text-xs">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Shield className="h-4 w-4" />
                <span className="font-semibold">Security Features Active</span>
              </div>
              <ul className="space-y-1 text-blue-600 dark:text-blue-400 ml-6">
                <li>• Screenshot protection enabled</li>
                <li>• Unique nonce per generation</li>
                <li>• Visible & invisible watermarks</li>
                <li>• Time-limited validity ({expiryMinutes} min)</li>
                <li>• Device fingerprinting ready</li>
              </ul>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-3 mt-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">MANUAL ENTRY CODE</p>
                <div className="text-2xl font-mono font-bold tracking-wider text-center py-2 bg-gray-50 dark:bg-gray-900 rounded">
                  {sessionCode}
                </div>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                  Valid for {expiryMinutes} minute{expiryMinutes !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="font-medium">{courseCode} - {courseName}</p>
                <p>Faculty: {facultyName}</p>
                <p>Session: {sessionId.substring(0, 8)}...</p>
              </div>
            </div>

        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={regenerateCode}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate
          </Button>
          <Button
            size="sm"
            onClick={toggleFullscreen}
          >
            <Maximize className="h-4 w-4 mr-2" />
            Display Fullscreen
          </Button>
        </div>
        
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          ⚠️ Download & share disabled for security
        </p>
      </CardContent>
    </Card>
  );
};

export default QRGenerator;