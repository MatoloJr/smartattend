'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { MetricCard } from '@/components/ui/metric-card';
import { AttendanceChart } from '@/components/charts/AttendanceChart';
import { DepartmentChart } from '@/components/charts/DepartmentChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserCheck, 
  Building2, 
  GraduationCap,
  Clock,
  TrendingUp,
  Calendar,
  AlertCircle,
  Download,
  Filter,
  Search,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockAnalytics, mockDepartmentStats, mockUsers, mockSessions, mockAttendance } from '@/lib/mock-data';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [realtimeData, setRealtimeData] = useState({
    activeSessions: 12,
    onlineUsers: 847,
    pendingApologies: 23
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        activeSessions: prev.activeSessions + Math.floor(Math.random() * 3) - 1,
        onlineUsers: prev.onlineUsers + Math.floor(Math.random() * 20) - 10,
        pendingApologies: Math.max(0, prev.pendingApologies + Math.floor(Math.random() * 3) - 1)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const totalUsers = mockUsers.length;
  const activeUsers = mockUsers.filter(u => u.status === 'active').length;
  const totalSessions = mockSessions.length;
  const completedSessions = mockSessions.filter(s => s.status === 'completed').length;
  const avgAttendance = 87.3;
  const attendanceTrend = 2.1;

  const recentSessions = mockSessions.slice(0, 5);
  const todayAttendance = mockAttendance.filter(a => 
    new Date(a.timestamp).toDateString() === new Date().toDateString()
  );

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6 animate-fadeIn">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 dark:from-blue-800 dark:via-purple-800 dark:to-blue-900 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="opacity-90">
                Here's what's happening at your institution today
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="secondary" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Members"
            value={totalUsers.toLocaleString()}
            subtitle="All users in system"
            icon={Users}
            trend={{
              value: 2.3,
              label: "vs last month",
              isPositive: true
            }}
            color="blue"
          />
          <MetricCard
            title="Active Members"
            value={`${activeUsers} (${Math.round((activeUsers/totalUsers) * 100)}%)`}
            subtitle={`${realtimeData.onlineUsers} online now`}
            icon={UserCheck}
            trend={{
              value: attendanceTrend,
              label: "vs last week",
              isPositive: true
            }}
            color="green"
          />
          <MetricCard
            title="Sessions Today"
            value={realtimeData.activeSessions}
            subtitle={`${completedSessions}/${totalSessions} completed`}
            icon={Calendar}
            trend={{
              value: 8.1,
              label: "vs yesterday",
              isPositive: true
            }}
            color="purple"
          />
          <MetricCard
            title="Avg Attendance"
            value={`${avgAttendance}%`}
            subtitle="Institution-wide"
            icon={TrendingUp}
            trend={{
              value: attendanceTrend,
              label: "this month",
              isPositive: true
            }}
            color="orange"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Campus Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Main Campus</span>
                  <span className="text-sm font-medium">68%</span>
                </div>
                <Progress value={68} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm">North Campus</span>
                  <span className="text-sm font-medium">22%</span>
                </div>
                <Progress value={22} className="h-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm">Downtown</span>
                  <span className="text-sm font-medium">10%</span>
                </div>
                <Progress value={10} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Peak Attendance Times
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-green-500" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Morning (8-11 AM)</span>
                      <span className="text-sm font-medium">90%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Afternoon (1-4 PM)</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Evening (6-8 PM)</span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm">Pending Apologies</p>
                    <p className="text-xs text-gray-500">{realtimeData.pendingApologies} awaiting review</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm">System Status</p>
                    <p className="text-xs text-green-600">All systems operational</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-purple-500" />
                  <div className="flex-1">
                    <p className="text-sm">New Registrations</p>
                    <p className="text-xs text-gray-500">12 this week</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceChart 
            data={mockAnalytics} 
            title="Institution-wide Attendance Trends"
          />
          <DepartmentChart 
            data={mockDepartmentStats}
            title="Department Performance Comparison" 
          />
        </div>

        {/* Recent Activity & Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Sessions</CardTitle>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{session.course_code}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{session.course_name}</p>
                      <p className="text-xs text-gray-500">{session.faculty_name} • {session.location}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        session.status === 'completed' ? 'default' :
                        session.status === 'active' ? 'destructive' : 'secondary'
                      }>
                        {session.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {session.start_time} - {session.end_time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Attendance</CardTitle>
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayAttendance.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                        {record.student_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{record.student_name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{record.student_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        record.status === 'present' ? 'default' :
                        record.status === 'late' ? 'destructive' : 'secondary'
                      }>
                        {record.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;