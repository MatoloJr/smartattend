'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  Download, 
  X,
  Calendar,
  Users,
  BookOpen,
  Building2,
  Clock,
  TrendingUp,
  Eye,
  MoreVertical
} from 'lucide-react';
import { mockUsers, mockSessions, mockAttendance } from '@/lib/mock-data';

const AdminSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced filter options
  const filterOptions = {
    roles: ['admin', 'faculty', 'student'],
    status: ['active', 'inactive', 'suspended'],
    departments: ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Engineering'],
    campuses: ['Main Campus', 'North Campus', 'Downtown Campus'],
    sessionTypes: ['lecture', 'lab', 'tutorial', 'exam'],
    attendanceStatus: ['present', 'absent', 'late', 'excused']
  };

  // Search logic
  const getSearchResults = () => {
    let results: any[] = [];

    if (searchType === 'all' || searchType === 'users') {
      const userResults = mockUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             (user.student_id && user.student_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
                             (user.employee_id && user.employee_id.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesFilters = selectedFilters.length === 0 || 
                              selectedFilters.includes(user.role) ||
                              selectedFilters.includes(user.status) ||
                              (user.department && selectedFilters.includes(user.department));
        
        return matchesSearch && matchesFilters;
      }).map(user => ({ ...user, type: 'user' }));
      
      results = [...results, ...userResults];
    }

    if (searchType === 'all' || searchType === 'sessions') {
      const sessionResults = mockSessions.filter(session => {
        const matchesSearch = session.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             session.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             session.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             session.location.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDateRange = !dateRange.from || !dateRange.to || 
                                (new Date(session.date) >= new Date(dateRange.from) &&
                                 new Date(session.date) <= new Date(dateRange.to));
        
        return matchesSearch && matchesDateRange;
      }).map(session => ({ ...session, type: 'session' }));
      
      results = [...results, ...sessionResults];
    }

    if (searchType === 'all' || searchType === 'attendance') {
      const attendanceResults = mockAttendance.filter(record => {
        const matchesSearch = record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             record.student_number.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilters = selectedFilters.length === 0 || 
                              selectedFilters.includes(record.status);
        
        const matchesDateRange = !dateRange.from || !dateRange.to || 
                                (new Date(record.timestamp) >= new Date(dateRange.from) &&
                                 new Date(record.timestamp) <= new Date(dateRange.to));
        
        return matchesSearch && matchesFilters && matchesDateRange;
      }).map(record => ({ ...record, type: 'attendance' }));
      
      results = [...results, ...attendanceResults];
    }

    return results;
  };

  const searchResults = getSearchResults();

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    setDateRange({ from: '', to: '' });
    setSearchTerm('');
  };

  const renderResultItem = (item: any) => {
    switch (item.type) {
      case 'user':
        return (
          <div key={`user-${item.id}`} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {item.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.email}</p>
                <p className="text-xs text-gray-500">{item.student_id || item.employee_id || item.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{item.role}</Badge>
              <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                {item.status}
              </Badge>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'session':
        return (
          <div key={`session-${item.id}`} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline">{item.course_code}</Badge>
                <h4 className="font-medium">{item.course_name}</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{item.faculty_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(item.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{item.start_time} - {item.end_time}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                item.status === 'completed' ? 'default' :
                item.status === 'active' ? 'destructive' : 'secondary'
              }>
                {item.status}
              </Badge>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div key={`attendance-${item.id}`} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xs font-medium">
                {item.student_name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div>
                <h4 className="font-medium">{item.student_name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.student_number}</p>
                <p className="text-xs text-gray-500">{new Date(item.timestamp).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                item.status === 'present' ? 'default' :
                item.status === 'late' ? 'destructive' : 'secondary'
              }>
                {item.status}
              </Badge>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout title="Advanced Search">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Advanced Search
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Search across users, sessions, and attendance records
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>

        {/* Search Interface */}
        <Card className="glass">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Primary Search */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by ID, name, course, email, or any keyword..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                      <SelectItem value="sessions">Sessions</SelectItem>
                      <SelectItem value="attendance">Attendance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-from">From Date</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to">To Date</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(filterOptions).map(([category, options]) => (
                      <div key={category} className="space-y-2">
                        <Label className="text-sm font-medium capitalize">
                          {category.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <div className="space-y-1">
                          {options.map((option) => (
                            <div key={option} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${category}-${option}`}
                                checked={selectedFilters.includes(option)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    toggleFilter(option);
                                  } else {
                                    toggleFilter(option);
                                  }
                                }}
                              />
                              <Label htmlFor={`${category}-${option}`} className="text-sm capitalize">
                                {option.replace('_', ' ')}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Filters */}
              {(selectedFilters.length > 0 || dateRange.from || dateRange.to) && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium">Active Filters:</span>
                  {selectedFilters.map((filter) => (
                    <Badge key={filter} variant="secondary" className="gap-1">
                      {filter}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => toggleFilter(filter)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                  {dateRange.from && (
                    <Badge variant="secondary" className="gap-1">
                      From: {dateRange.from}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => setDateRange(prev => ({ ...prev, from: '' }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {dateRange.to && (
                    <Badge variant="secondary" className="gap-1">
                      To: {dateRange.to}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => setDateRange(prev => ({ ...prev, to: '' }))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Search Results ({searchResults.length})</CardTitle>
              <div className="flex gap-2">
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="users">Users Only</SelectItem>
                    <SelectItem value="sessions">Sessions Only</SelectItem>
                    <SelectItem value="attendance">Attendance Only</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.length > 0 ? (
                searchResults.map((item) => renderResultItem(item))
              ) : (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminSearch;