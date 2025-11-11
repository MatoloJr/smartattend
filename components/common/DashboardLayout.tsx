'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title 
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useLocalStorage('sidebar-expanded', true);
  
  const handleSidebarToggle = (expanded: boolean) => {
    setIsSidebarExpanded(expanded);
  };
  const pathname = usePathname();

    useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);  // Extract current section from pathname
  const currentSection = pathname.split('/')[2] || 'dashboard';
  const rolePrefix = pathname.split('/')[1] || 'admin';
  
  // Generate dynamic title
  const pageTitle = `${rolePrefix.charAt(0).toUpperCase() + rolePrefix.slice(1)} ${
    currentSection.charAt(0).toUpperCase() + currentSection.slice(1)
  }`;

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isExpanded={isSidebarExpanded}
        onToggle={handleSidebarToggle}
      />
      
      <div className={cn(
        'flex-1 transition-all duration-300 ease-in-out',
        isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'
      )}>
        <div className="flex flex-col h-screen">
          <Header 
            title={pageTitle}
            onMenuClick={() => setSidebarOpen(true)}
            isSidebarExpanded={isSidebarExpanded}
            onSidebarExpandToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
          />
          
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-4 lg:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};