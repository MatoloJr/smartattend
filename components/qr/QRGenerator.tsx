'use client';

import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Maximize, Share2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface QRGeneratorProps {
  sessionId: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  timestamp: string;
  onRegenerateCode?: () => void;
}

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  sessionId,
  courseCode,
  courseName,
  facultyName,
  timestamp,
  onRegenerateCode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrData, setQrData] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const qrPayload = {
      sessionId,
      courseCode,
      courseName,
      facultyName,
      timestamp,
      type: 'attendance_session'
    };
    
    const encodedData = btoa(JSON.stringify(qrPayload));
    setQrData(encodedData);
    generateQR(encodedData);
  }, [sessionId, courseCode, courseName, facultyName, timestamp]);

  const generateQR = async (data: string) => {
    if (!canvasRef.current) return;

    try {
      await QRCode.toCanvas(canvasRef.current, data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQR = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `attendance-qr-${courseCode}-${sessionId}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
    
    toast.success('QR code downloaded successfully');
  };

  const shareQR = async () => {
    if (!canvasRef.current) return;

    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        
        const file = new File([blob], `attendance-qr-${courseCode}.png`, { type: 'image/png' });
        
        if (navigator.share) {
          await navigator.share({
            title: `${courseCode} Attendance`,
            text: `Scan this QR code to mark attendance for ${courseName}`,
            files: [file]
          });
        } else {
          // Fallback: copy to clipboard
          toast.info('QR code ready to share');
        }
      });
    } catch (error) {
      console.error('Error sharing QR code:', error);
      toast.error('Failed to share QR code');
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const regenerateCode = () => {
    const newTimestamp = new Date().toISOString();
    const qrPayload = {
      sessionId,
      courseCode,
      courseName,
      facultyName,
      timestamp: newTimestamp,
      type: 'attendance_session'
    };
    
    const encodedData = btoa(JSON.stringify(qrPayload));
    setQrData(encodedData);
    generateQR(encodedData);
    
    if (onRegenerateCode) {
      onRegenerateCode();
    }
    
    toast.success('QR code regenerated');
  };

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {courseCode}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {courseName}
          </p>
          
          <div className="flex justify-center mb-6">
            <canvas ref={canvasRef} className="rounded-xl shadow-lg" />
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
    <Card className="glass">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Session QR Code</CardTitle>
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
        </div>
      </CardHeader>
      <CardContent className="text-center">
        <div className="mb-4">
          <canvas ref={canvasRef} className="mx-auto rounded-lg shadow-sm" />
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <p className="font-medium">{courseCode} - {courseName}</p>
          <p>Faculty: {facultyName}</p>
          <p>Generated: {new Date(timestamp).toLocaleTimeString()}</p>
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={downloadQR}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={shareQR}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            size="sm"
            onClick={toggleFullscreen}
          >
            <Maximize className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};