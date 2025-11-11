'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { 
  LayoutDashboard,
  BarChart3,
  Users,
  Search,
  Building2,
  BookOpen,
  FileText,
  Settings,
  Bell,
  Phone,
  History,
  LogOut,
  Calendar,
  Camera,
  FileQuestion,
  QrCode,
  PieChart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const getRoleMenuItems = (role: string) => {
  switch (role) {
    case 'super_admin':
    case 'admin':
      return [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
        { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
        { icon: Users, label: 'Users', href: '/admin/users' },
        { icon: Search, label: 'Search', href: '/admin/search' },
        { icon: Building2, label: 'Institutions', href: '/admin/institutions' },
        { icon: BookOpen, label: 'Courses', href: '/admin/courses' },
        { icon: FileText, label: 'Reports', href: '/admin/reports' },
        { icon: Settings, label: 'Settings', href: '/admin/settings' },
        { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
        { icon: Phone, label: 'Support', href: '/admin/support' },
        { icon: History, label: 'History', href: '/admin/history' },
      ];
    case 'faculty':
      return [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/faculty/dashboard' },
        { icon: Calendar, label: 'Sessions', href: '/faculty/sessions' },
        { icon: QrCode, label: 'QR Generator', href: '/faculty/generator' },
        { icon: PieChart, label: 'Reports', href: '/faculty/reports' },
        { icon: Settings, label: 'Settings', href: '/faculty/settings' },
      ];
    case 'student':
      return [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/student/dashboard' },
        { icon: Camera, label: 'Scan QR', href: '/student/scanner' },
        { icon: FileQuestion, label: 'Submit Apology', href: '/student/apology' },
        { icon: PieChart, label: 'My Reports', href: '/student/reports' },
        { icon: Settings, label: 'Settings', href: '/student/settings' },
      ];
    default:
      return [];
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'super_admin':
    case 'admin':
      return 'text-blue-600 dark:text-blue-400';
    case 'faculty':
      return 'text-green-600 dark:text-green-400';
    case 'student':
      return 'text-purple-600 dark:text-purple-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  defaultExpanded?: boolean;
  onToggle?: (isExpanded: boolean) => void;
  isExpanded?: boolean; // Controlled prop from parent
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  defaultExpanded = true, 
  onToggle,
  isExpanded: propExpanded 
}) => {
  // Use controlled pattern if propExpanded is provided, otherwise use internal state
  const [internalExpanded, setInternalExpanded] = React.useState(defaultExpanded);
  const isExpanded = propExpanded !== undefined ? propExpanded : internalExpanded;
  
  const handleToggle = () => {
    const newState = !isExpanded;
    if (propExpanded === undefined) {
      setInternalExpanded(newState);
    }
    onToggle?.(newState);
  };
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const menuItems = getRoleMenuItems(user?.role || 'student');

  // Close sidebar when clicking outside on mobile
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const sidebar = document.querySelector('aside');
      const menuButton = document.querySelector('button[aria-label="Open menu"]');
      
      if (isOpen && sidebar && !sidebar.contains(target) && menuButton && !menuButton.contains(target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Always render the sidebar, but control visibility with CSS

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out',
          isExpanded ? 'w-64' : 'w-20',
          'overflow-hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'shadow-lg lg:shadow-none',
          'transform transition-transform duration-300 ease-in-out',
          'lg:flex' // Ensure sidebar is always visible on lg screens
        )}
      >
        {/* Logo and App Name */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg bg-blue-600">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div className={cn("flex flex-col", !isExpanded && 'opacity-0 w-0 h-0 overflow-hidden')}>
              <span className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">
                SmartAttend
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
                      isExpanded ? 'justify-start' : 'justify-center',
                      'min-h-[44px]' // Ensure consistent height
                    )}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <div className={cn(
                      'flex items-center',
                      isExpanded ? 'w-6' : 'w-full justify-center'
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {isExpanded && (
                      <span className={cn('ml-3')}>
                        {item.label}
                      </span>
                    )}
                    {isActive && isExpanded && (
                      <span className="ml-auto h-2 w-2 rounded-full bg-blue-600" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User profile */}
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className={`text-sm font-medium ${getRoleColor(user?.role || '')}`}>
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
            {isExpanded && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || ''}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-8 w-8"
              onClick={handleToggle}
              title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isExpanded ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isExpanded ? 'Collapse' : 'Expand'} sidebar
              </span>
            </Button>
          </div>
          
          {isExpanded && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start mt-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          )}
        </div>
      </aside>
    </>
  );
};