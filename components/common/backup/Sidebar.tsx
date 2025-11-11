'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
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
  User,
  LogOut,
  QrCode,
  Calendar,
  Camera,
  FileQuestion,
  PieChart
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isExpanded: boolean;
}

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

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isExpanded }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  if (!user) return null;

  const menuItems = getRoleMenuItems(user.role);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out lg:translate-x-0 lg:relative lg:z-auto flex-shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        isExpanded ? "w-64" : "w-16"
      )}>
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto scrollbar-none">
            <div className="p-4 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive 
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                    title={isExpanded ? undefined : item.label}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 flex-shrink-0",
                      !isExpanded && "mx-auto"
                    )} />
                    {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20",
                isExpanded ? "justify-start gap-3" : "justify-center"
              )}
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              {isExpanded && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};