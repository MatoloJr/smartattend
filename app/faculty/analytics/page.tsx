'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Download, 
  Calendar, 
  Filter, 
  BarChart3,
  PieChart as PieChartIcon,
  FileText,
  FileDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockSessions, mockAttendance } from '@/lib/mock-data';
import { toast } from 'sonner';

type TimeRange = '7days' | '30days' | '90days' | 'all';
type ChartType = 'bar' | 'pie';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const FacultyAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');

  // Get faculty sessions
  const facultySessions = mockSessions.filter(s => s.faculty_id === user?.id);
  
  // Filter sessions by time range
  const filteredSessions = React.useMemo(() => {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case '7days':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '90days':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      default:
        cutoffDate = new Date(0); // All time
    }
    
    return facultySessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= cutoffDate;
    });
  }, [facultySessions, timeRange]);

  // Prepare chart data
  const chartData = React.useMemo(() => {
    // Group by course code
    const courseData: Record<string, { 
      name: string; 
      sessions: number; 
      attendance: number; 
      totalStudents: number;
    }> = {};

    filteredSessions.forEach(session => {
      if (!courseData[session.course_code]) {
        courseData[session.course_code] = {
          name: session.course_name,
          sessions: 0,
          attendance: 0,
          totalStudents: 0
        };
      }
      
      const attendance = mockAttendance.filter(a => a.session_id === session.id).length;
      const attendanceRate = session.enrolled_students > 0 
        ? (attendance / session.enrolled_students) * 100 
        : 0;
      
      courseData[session.course_code].sessions += 1;
      courseData[session.course_code].attendance += attendanceRate;
      courseData[session.course_code].totalStudents += session.enrolled_students;
    });

    // Calculate average attendance per course
    return Object.entries(courseData).map(([code, data]) => ({
      name: code,
      fullName: data.name,
      sessions: data.sessions,
      avgAttendance: Math.round((data.attendance / data.sessions) * 10) / 10,
      totalStudents: data.totalStudents
    }));
  }, [filteredSessions]);

  // Prepare pie chart data
  const pieData = chartData.map(item => ({
    name: item.name,
    value: item.avgAttendance,
    fullName: item.fullName
  }));

  // Export functionality
  const handleExport = () => {
    try {
      const data = chartData.map(item => ({
        'Course Code': item.name,
        'Course Name': item.fullName,
        'Sessions': item.sessions,
        'Average Attendance (%)': item.avgAttendance,
        'Total Students': item.totalStudents
      }));

      if (exportFormat === 'csv') {
        // Generate CSV
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).map(value => 
          `"${String(value).replace(/"/g, '""')}"`
        ).join(','));
        const csvContent = [headers, ...rows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `attendance_analytics_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For PDF, we'll use the browser's print functionality
        // In a real app, you might want to use a library like jsPDF
        window.print();
      }
      
      toast.success(`Exported analytics as ${exportFormat.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export analytics');
    }
  };

  return (
    <DashboardLayout title="Session Analytics">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Session Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track and analyze attendance patterns and session metrics
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={timeRange} onValueChange={(v: TimeRange) => setTimeRange(v)}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={chartType} onValueChange={(v: ChartType) => setChartType(v)}>
              <SelectTrigger className="w-[150px]">
                {chartType === 'bar' ? (
                  <BarChart3 className="h-4 w-4 mr-2" />
                ) : (
                  <PieChartIcon className="h-4 w-4 mr-2" />
                )}
                <SelectValue placeholder="Chart Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Bar Chart</SelectItem>
                <SelectItem value="pie">Pie Chart</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex">
              <Select value={exportFormat} onValueChange={(v: 'pdf' | 'csv') => setExportFormat(v)}>
                <SelectTrigger className="w-[120px] rounded-r-none border-r-0">
                  <FileText className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleExport} className="rounded-l-none">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredSessions.length}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {timeRange === '7days' ? 'Last 7 days' : 
                 timeRange === '30days' ? 'Last 30 days' : 
                 timeRange === '90days' ? 'Last 90 days' : 'All time'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Average Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {chartData.length > 0 
                  ? Math.round(chartData.reduce((sum, item) => sum + item.avgAttendance, 0) / chartData.length) 
                  : 0}%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Across all courses
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {chartData.reduce((sum, item) => sum + item.totalStudents, 0)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Enrolled in all courses
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Attendance by Course</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'bar' ? (
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis 
                      label={{ value: 'Attendance %', angle: -90, position: 'insideLeft' }}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Attendance']}
                      labelFormatter={(label) => {
                        const course = chartData.find(c => c.name === label);
                        return course ? course.fullName : label;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="avgAttendance" name="Average Attendance" fill="#8884d8">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => 
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, 'Attendance']}
                      labelFormatter={(label, payload) => {
                        const data = payload[0]?.payload;
                        return data?.fullName || label;
                      }}
                    />
                    <Legend />
                  </PieChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <BarChart3 className="h-12 w-12 mb-4 opacity-30" />
                <p>No data available for the selected time range</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredSessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Attendance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredSessions.slice(0, 5).map((session) => {
                      const attendance = mockAttendance.filter(a => a.session_id === session.id).length;
                      const attendanceRate = session.enrolled_students > 0 
                        ? Math.round((attendance / session.enrolled_students) * 100) 
                        : 0;
                      
                      return (
                        <tr key={session.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {session.course_code}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {session.course_name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {new Date(session.date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {session.start_time} - {session.end_time}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {session.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {attendance} / {session.enrolled_students}
                            </div>
                            <div className="attendance-bar">
                              <div 
                                className="attendance-bar-fill"
                                style={{ width: `${attendanceRate}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {attendanceRate}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              session.status === 'completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {session.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No sessions found for the selected time range
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #analytics-content, #analytics-content * {
            visibility: visible;
          }
          #analytics-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default FacultyAnalytics;
