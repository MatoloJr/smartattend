'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, CameraOff, Flashlight, FlashlightOff, RotateCcw } from 'lucide-react';
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
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameras, setCameras] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  useEffect(() => {
    // Get available cameras
    Html5QrcodeScanner.getCameras().then(devices => {
      setCameras(devices);
      if (devices.length > 0) {
        setSelectedCamera(devices[0].id);
      }
    }).catch(err => {
      console.error('Error getting cameras:', err);
    });

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const startScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    const scanner = new Html5QrcodeScanner(
      "qr-scanner-container",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
        defaultZoomValueIfSupported: 2
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
    setIsScanning(true);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      toast.error('Please enter a session code');
      return;
    }

    try {
      const decodedData = JSON.parse(atob(manualCode));
      onScanSuccess(decodedData);
      setManualCode('');
      toast.success('Session code entered successfully!');
    } catch (error) {
      toast.error('Invalid session code format');
      if (onScanError) {
        onScanError('Invalid session code format');
      }
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
                placeholder="Enter the session code provided by your lecturer"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline" className="w-full">
              Submit Code
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};