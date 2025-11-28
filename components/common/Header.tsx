'use client';

import React from 'react';
import { Menu, Bell, User, Sun, Moon, Laptop, Mail, Settings, HelpCircle, LogOut, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { SearchBar } from './SearchBar';
import { useTheme } from 'next-themes';
import { useEffect, useState, useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Theme = 'light' | 'dark' | 'system';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  isSidebarExpanded: boolean;
  onSidebarExpandToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onMenuClick,
  isSidebarExpanded,
  onSidebarExpandToggle,
}) => {
  const { user, logout } = useAuth();
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSwitchingTheme, setIsSwitchingTheme] = useState(false);
  const themeIconRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Only show the UI after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New update available', description: 'Version 2.0 is now available', read: false, time: '2 hours ago' },
    { id: 2, title: 'New message', description: 'You have 3 unread messages', read: false, time: '5 hours ago' },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Get the current theme, falling back to system theme if set to 'system'
  const currentTheme = theme === 'system' ? systemTheme : theme;

  const getThemeIcon = () => {
    if (!mounted) return <Laptop className="h-4 w-4" />;
    
    switch (currentTheme) {
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'light':
        return <Sun className="h-4 w-4" />;
      default:
        return <Laptop className="h-4 w-4" />;
    }
  };
  
  const handleThemeChange = (newTheme: Theme) => {
    if (isSwitchingTheme) return;
    
    setIsSwitchingTheme(true);
    setTheme(newTheme);
    
    // Add animation class
    if (themeIconRef.current) {
      themeIconRef.current.classList.add('animate-ping-once');
      
      // Remove animation class after it completes
      setTimeout(() => {
        if (themeIconRef.current) {
          themeIconRef.current.classList.remove('animate-ping-once');
        }
        setIsSwitchingTheme(false);
      }, 300);
    } else {
      setIsSwitchingTheme(false);
    }
  };

  const handleProfileAction = (action: string) => {
    switch (action) {
      case 'profile':
        router.push(`/${user?.role}/profile`);
        break;
      case 'settings':
        router.push(`/${user?.role}/settings`);
        break;
      case 'help':
        router.push('/help');
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const markAsRead = (id?: number) => {
    if (id) {
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      ));
    } else {
      // Mark all as read
      setNotifications(notifications.map(notification => ({
        ...notification,
        read: true
      })));
    }
  };

  // Simulate real-time notifications
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new notification
        const newNotification = {
          id: Date.now(),
          title: 'System Update',
          description: 'New features are available',
          read: false,
          time: 'Just now'
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md flex-shrink-0">
      <div className="flex items-center h-14">
        <div className="flex items-center gap-3 px-4 lg:px-6 w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9 p-0 -ml-2"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onSidebarExpandToggle}
            className="hidden lg:flex h-9 w-9 p-0"
            aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
            <h1 className="order-1 flex-1 min-w-0 truncate text-base font-semibold text-gray-900 dark:text-white sm:text-lg lg:text-xl">
              {title}
            </h1>

            <div className="order-3 w-full md:order-2 md:flex-1 md:max-w-2xl">
              <SearchBar className="w-full" />
            </div>

            <div className="order-2 flex flex-shrink-0 items-center gap-2 md:order-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-9 w-9 relative ${isSwitchingTheme ? 'opacity-70' : ''}`}
                    disabled={isSwitchingTheme}
                  >
                    <div 
                      ref={themeIconRef}
                      className="flex items-center justify-center w-full h-full"
                    >
                      {getThemeIcon()}
                    </div>
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end"
                  className="transition-all duration-200 ease-in-out transform"
                >
                  <DropdownMenuLabel className="flex items-center justify-between px-2">
                    <span>Theme</span>
                    <span className="text-xs text-muted-foreground">
                      {isSwitchingTheme ? 'Applying...' : ''}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleThemeChange('light')} 
                    className={`cursor-pointer ${currentTheme === 'light' ? 'bg-accent' : ''} ${isSwitchingTheme ? 'opacity-70' : 'hover:bg-accent'}`}
                    disabled={isSwitchingTheme}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Light</span>
                      </div>
                      {theme === 'light' && <span className="ml-auto">✓</span>}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleThemeChange('dark')} 
                    className={`cursor-pointer ${theme === 'dark' ? 'bg-accent' : ''} ${isSwitchingTheme ? 'opacity-70' : 'hover:bg-accent'}`}
                    disabled={isSwitchingTheme}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Dark</span>
                      </div>
                      {theme === 'dark' && <span className="ml-auto">✓</span>}
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleThemeChange('system')} 
                    className={`cursor-pointer ${theme === 'system' ? 'bg-accent' : ''} ${isSwitchingTheme ? 'opacity-70' : 'hover:bg-accent'}`}
                    disabled={isSwitchingTheme}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Laptop className="mr-2 h-4 w-4" />
                        <span>System</span>
                      </div>
                      {theme === 'system' && <span className="ml-auto">✓</span>}
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-80" align="end">
                  <div className="flex items-center justify-between px-2 py-1.5 border-b">
                    <h4 className="font-medium">Notifications</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead();
                      }}
                    >
                      Mark all as read
                    </Button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={cn(
                            'p-3 border-b hover:bg-accent/50 transition-colors',
                            !notification.read && 'bg-blue-50 dark:bg-blue-900/20'
                          )}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              <div className="h-2 w-2 rounded-full bg-blue-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <p className="text-xs text-muted-foreground">{notification.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                            {!notification.read && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <span className="sr-only">Mark as read</span>
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No new notifications
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                      <AvatarFallback>{(user?.name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || 'No email'}
                      </p>
                      {user?.role && (
                        <Badge variant="outline" className="w-fit mt-1">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => handleProfileAction('settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleProfileAction('logout')}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};