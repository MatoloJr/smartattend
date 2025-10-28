'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const DashboardRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Redirect based on user role
    switch (user?.role) {
      case 'super_admin':
      case 'admin':
        router.push('/admin/dashboard');
        break;
      case 'faculty':
        router.push('/faculty/dashboard');
        break;
      case 'student':
        router.push('/student/dashboard');
        break;
      default:
        router.push('/login');
    }
  }, [user, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default DashboardRedirect;