'use client';

import React from 'react';
import { Menu, Bell, User, Sun, Moon, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { SearchBar } from './SearchBar';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  onSidebarExpandToggle 
}) => {
  const { user, logout } = useAuth();
  const { setTheme, theme, systemTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(systemTheme === 'dark' ? 'light' : 'dark');
    } else {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    }
  };

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
          
          <div className="flex items-center justify-between min-w-0 flex-1 gap-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              {title}
            </h1>

            <div className="flex-1 max-w-2xl mx-auto">
              <SearchBar />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={toggleTheme}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Sun className="h-5 w-5" />
                ) : theme === 'dark' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Laptop className="h-5 w-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    aria-label="User menu"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => logout()}>
                    Logout
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