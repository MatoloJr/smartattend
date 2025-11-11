'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please request a new one.');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Verification failed');
        }

        setStatus('success');
        setMessage('Email verified successfully! Redirecting to login...');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Failed to verify email');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-blue-500" />}
          {status === 'success' && <CheckCircle className="h-12 w-12 text-green-500" />}
          {status === 'error' && <XCircle className="h-12 w-12 text-red-500" />}
        </div>
        <h1 className="text-2xl font-bold">
          {status === 'loading' && 'Verifying your email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
        
        {status === 'error' && (
          <div className="mt-6">
            <Button onClick={() => router.push('/login')}>
              Back to Login
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}