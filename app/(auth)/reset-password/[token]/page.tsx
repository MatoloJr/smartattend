'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Lock, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const ResetPassword: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      const emailFromUrl = searchParams.get('email');
      
      console.log('Verifying token:', token);
      
      if (!token) {
        console.log('No token found in URL');
        setIsValidToken(false);
        setIsLoading(false);
        return;
      }

      try {
        // Log token verification
        console.log('Token verification in progress...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, we'll accept any token that exists
        // In a real app, you would verify the token with your backend
        const userEmail = emailFromUrl || 'user@example.com';
        console.log('Token verified for email:', userEmail);
        
        setEmail(userEmail);
        setIsValidToken(true);
      } catch (error) {
        console.error('Error verifying token:', error);
        setIsValidToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsResetting(true);
    
    try {
      const token = searchParams.get('token');
      if (!token) throw new Error('Invalid token');
      
      // Log the password reset attempt
      console.log('Password reset attempt:', {
        token,
        email,
        newPassword: password // In a real app, never log actual passwords!
      });
      
      // Simulate API call
      console.log('Sending password reset request to server...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Password reset successful for email:', email);
      setIsSuccess(true);
      toast.success('Password reset successfully!');
      
      // Redirect to login after a short delay
      setTimeout(() => {
        console.log('Redirecting to login page...');
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <CardTitle className="text-2xl font-bold">Invalid or Expired Link</CardTitle>
            <CardDescription>
              The password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/forgot-password">Request New Reset Link</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <CardTitle className="text-2xl font-bold">Password Reset Successful!</CardTitle>
            <CardDescription>
              Your password has been updated successfully. Redirecting to login...
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild variant="outline">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold mt-4">Reset Your Password</CardTitle>
          <CardDescription>
            Enter a new password for {email}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                minLength={8}
                className="pl-3"
              />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                className="pl-3"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isResetting}>
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button variant="ghost" asChild>
            <Link href="/login" className="text-sm">
              Back to login
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
