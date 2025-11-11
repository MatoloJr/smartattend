'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { AttendanceChart } from '@/components/charts/AttendanceChart';
import { DepartmentChart } from '@/components/charts/DepartmentChart';
import { MetricCard } from '@/components/ui/metric-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Clock,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Target
} from 'lucide-react';
import { mockAnalytics, mockDepartmentStats, mockTimePatterns } from '@/lib/mock-data';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const AdminAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('attendance');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const campusDistribution = [
    { name: 'Main Campus', value: 68, students: 8736 },
    { name: 'North Campus', value: 22, students: 2826 },
    { name: 'Downtown', value: 10, students: 1285 }
  ];

  const attendanceTrends = mockAnalytics.slice(-7).map(day => ({
    ...day,
    efficiency: Math.round((day.present / (day.present + day.absent + day.late)) * 100)
  }));

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-blue-600 dark:text-blue-400">
            {data.value}% ({data.students.toLocaleString()} students)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout title="Advanced Analytics">
      <div className="space-y-6 animate-fadeIn">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive insights into institutional performance
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Institution Average"
            value="87.3%"
            subtitle="Overall attendance rate"
            icon={TrendingUp}
            trend={{
              value: 2.1,
              label: "vs last month",
              isPositive: true
            }}
            color="blue"
          />
          <MetricCard
            title="Active Sessions"
            value="1,247"
            subtitle="This month"
            icon={Calendar}
            trend={{
              value: 8.3,
              label: "vs last month",
              isPositive: true
            }}
            color="green"
          />
          <MetricCard
            title="Peak Efficiency"
            value="94.2%"
            subtitle="Best performing hour"
            icon={Target}
            trend={{
              value: 1.8,
              label: "improvement",
              isPositive: true
            }}
            color="purple"
          />
          <MetricCard
            title="System Uptime"
            value="99.8%"
            subtitle="Last 30 days"
            icon={Activity}
            color="orange"
          />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceChart 
            data={mockAnalytics} 
            title="30-Day Attendance Trends"
          />
          <DepartmentChart 
            data={mockDepartmentStats}
            title="Department Performance" 
          />
        </div>

        {/* Secondary Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campus Distribution */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Campus Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={campusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {campusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-4">
                {campusDistribution.map((campus, index) => (
                  <div key={campus.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{campus.name}</span>
                    </div>
                    <span className="text-sm font-medium">{campus.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Time Patterns */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Peak Hours Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTimePatterns.slice(0, 6).map((pattern, index) => (
                  <div key={pattern.time} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{pattern.time}</span>
                      <span className="text-sm">{pattern.attendance}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pattern.attendance}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{pattern.sessions} sessions</span>
                      <span>
                        {pattern.attendance >= 85 ? '🟢 High' : 
                         pattern.attendance >= 70 ? '🟡 Medium' : '🔴 Low'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Efficiency */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Weekly Efficiency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'Efficiency']}
                      labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Area
                      type="monotone"
                      dataKey="efficiency"
                      stroke="hsl(var(--chart-3))"
                      fill="hsl(var(--chart-3))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Performance Table */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Department Performance Details</CardTitle>
              <div className="flex gap-2">
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">Attendance Rate</SelectItem>
                    <SelectItem value="students">Student Count</SelectItem>
                    <SelectItem value="sessions">Session Count</SelectItem>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Attendance</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Students</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Sessions</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDepartmentStats.map((dept, index) => (
                    <tr key={dept.department} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium">{dept.department}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{dept.attendance}%</span>
                          <Badge variant={
                            dept.attendance >= 85 ? 'default' :
                            dept.attendance >= 75 ? 'secondary' : 'destructive'
                          }>
                            {dept.attendance >= 85 ? 'Excellent' :
                             dept.attendance >= 75 ? 'Good' : 'Needs Improvement'}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4">{dept.students.toLocaleString()}</td>
                      <td className="py-3 px-4">{dept.sessions}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">+2.3%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;