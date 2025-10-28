'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ className }) => {
  const [isMobile, setIsMobile] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  if (isMobile && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn("p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800", className)}
      >
        <Search className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className={cn("relative flex items-center", className, {
      'absolute left-0 right-0 px-4 bg-white dark:bg-gray-900 py-2': isMobile && isExpanded
    })}>
      <div className="relative flex-1 max-w-2xl">
        <Input
          type="search"
          placeholder="Search..."
          className="pl-10 pr-4 w-full"
          onBlur={() => isMobile && setIsExpanded(false)}
          autoFocus={isMobile && isExpanded}
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      </div>
    </div>
  );
};