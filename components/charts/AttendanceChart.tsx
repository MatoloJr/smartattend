'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

import { Pie } from 'recharts';

interface AttendanceData {
  date: string;
  attendance_rate: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

interface AttendanceChartProps {
  data: AttendanceData[];
  title?: string;
  className?: string;
}

export const AttendanceChart: React.FC<AttendanceChartProps> = ({ 
  data, 
  title = "Attendance Trends",
  className = ""
}) => {
  const currentRate = data[data.length - 1]?.attendance_rate || 0;
  const previousRate = data[data.length - 2]?.attendance_rate || 0;
  const trend = currentRate - previousRate;
  const isPositive = trend >= 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">
            {new Date(label).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-green-600 dark:text-green-400">
              Present: {data.present} ({data.attendance_rate}%)
            </p>
            <p className="text-red-600 dark:text-red-400">
              Absent: {data.absent}
            </p>
            <p className="text-yellow-600 dark:text-yellow-400">
              Late: {data.late}
            </p>
            <p className="text-blue-600 dark:text-blue-400">
              Excused: {data.excused}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={`glass ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <CardDescription>30-day attendance trend</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {isPositive ? '+' : ''}{trend.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="attendance_rate"
                stroke="hsl(var(--chart-1))"
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--chart-1))', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceChart;