'use client';

import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Filter, Search, Download, Calendar, User, Clock, AlertCircle, CheckCircle2, XCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

type ActivityType = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'error' | 'warning' | 'info';

interface ActivityLog {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  type: ActivityType;
  action: string;
  entity: string;
  entityId: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, unknown>;
}

const activityTypes: { value: ActivityType; label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' }[] = [
  { value: 'login', label: 'Login', variant: 'success' },
  { value: 'logout', label: 'Logout', variant: 'secondary' },
  { value: 'create', label: 'Created', variant: 'default' },
  { value: 'update', label: 'Updated', variant: 'info' },
  { value: 'delete', label: 'Deleted', variant: 'destructive' },
  { value: 'error', label: 'Error', variant: 'destructive' },
  { value: 'warning', label: 'Warning', variant: 'warning' },
  { value: 'info', label: 'Info', variant: 'outline' },
];

// Mock data - replace with actual API call in production
const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin',
      avatar: '/avatars/01.png'
    },
    type: 'login',
    action: 'User logged in',
    entity: 'User',
    entityId: 'user-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  },
  {
    id: '2',
    user: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'Admin'
    },
    type: 'update',
    action: 'Updated course details',
    entity: 'Course',
    entityId: 'course-101',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    ipAddress: '192.168.1.1',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    details: {
      courseId: 'course-101',
      changes: {
        name: { from: 'Introduction to React', to: 'Advanced React Concepts' },
        description: { from: 'Basic React concepts', to: 'Advanced React patterns and best practices' }
      }
    }
  },
  // Add more mock data as needed
];

const getActivityIcon = (type: ActivityType) => {
  switch (type) {
    case 'login':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'logout':
      return <Clock className="h-4 w-4 text-gray-500" />;
    case 'create':
      return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    case 'update':
      return <Info className="h-4 w-4 text-yellow-500" />;
    case 'delete':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'info':
    default:
      return <Info className="h-4 w-4 text-blue-500" />;
  }
};

export default function HistoryPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)), // Default to last 7 days
    to: new Date(),
  });
  const [selectedTypes, setSelectedTypes] = useState<ActivityType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // In a real app, you would fetch this data from an API
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  
  // Filter logs based on selected filters
  const filteredLogs = activityLogs.filter(log => {
    // Filter by date range
    if (dateRange?.from && new Date(log.timestamp) < dateRange.from) return false;
    if (dateRange?.to && new Date(log.timestamp) > new Date(dateRange.to.setHours(23, 59, 59, 999))) return false;
    
    // Filter by activity type
    if (selectedTypes.length > 0 && !selectedTypes.includes(log.type)) return false;
    
    // Filter by search query
    if (searchQuery && !(
      log.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.ipAddress.includes(searchQuery)
    )) {
      return false;
    }
    
    return true;
  });
  
  const toggleActivityType = (type: ActivityType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  const clearFilters = () => {
    setDateRange({
      from: new Date(new Date().setDate(new Date().getDate() - 7)),
      to: new Date(),
    });
    setSelectedTypes([]);
    setSearchQuery('');
  };
  
  const exportToCSV = () => {
    // In a real app, this would generate a CSV file
    const headers = ['Timestamp', 'User', 'Action', 'Entity', 'Entity ID', 'IP Address'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        `"${log.user.name} (${log.user.email})"`,
        `"${log.action}"`,
        log.entity,
        log.entityId,
        log.ipAddress
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout title="Activity History">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Activity History</h2>
            <p className="text-muted-foreground">
              View and manage system activity logs
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={exportToCSV} className="gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="w-full md:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search activities..."
                    className="pl-9 w-full md:w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full md:w-[280px] justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Filter</span>
                      {selectedTypes.length > 0 && (
                        <Badge variant="secondary" className="px-1.5">
                          {selectedTypes.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-2" align="end">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Activity Types</h4>
                      <div className="space-y-2">
                        {activityTypes.map((type) => (
                          <div key={type.value} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`type-${type.value}`}
                              checked={selectedTypes.includes(type.value)}
                              onChange={() => toggleActivityType(type.value)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label
                              htmlFor={`type-${type.value}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                            >
                              {getActivityIcon(type.value)}
                              {type.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-xs"
                        onClick={clearFilters}
                      >
                        Clear filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => {
                      const activityType = activityTypes.find(t => t.value === log.type);
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              {getActivityIcon(log.type)}
                              <div>
                                <div className="font-medium">{log.action}</div>
                                {log.details && (
                                  <div className="text-xs text-muted-foreground">
                                    {JSON.stringify(log.details)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={log.user.avatar} alt={log.user.name} />
                                <AvatarFallback>
                                  {log.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{log.user.name}</div>
                                <div className="text-xs text-muted-foreground">{log.user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{log.entity}</div>
                              <div className="text-xs text-muted-foreground">{log.entityId}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="whitespace-nowrap">
                              {format(new Date(log.timestamp), 'MMM d, yyyy')}
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(log.timestamp), 'h:mm a')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">{log.ipAddress}</div>
                            <div className="text-xs text-muted-foreground">
                              {log.userAgent.split(' ').slice(0, 3).join(' ')}...
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No activity logs found matching your filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {filteredLogs.length > 0 && (
              <div className="flex items-center justify-between px-2 mt-4 text-sm text-muted-foreground">
                <div>Showing {filteredLogs.length} of {activityLogs.length} activities</div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
