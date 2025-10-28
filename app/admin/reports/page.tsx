'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  Send,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  Building2,
  BookOpen,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'attendance' | 'performance' | 'analytics' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'semester' | 'on-demand';
  recipients: string[];
  last_generated: string;
  status: 'active' | 'inactive';
}

const mockReportTemplates: ReportTemplate[] = [
  {
    id: 'report_1',
    name: 'Daily Attendance Summary',
    description: 'Daily overview of attendance across all departments',
    type: 'attendance',
    frequency: 'daily',
    recipients: ['admin@university.edu', 'dean@university.edu'],
    last_generated: '2024-01-20T08:00:00Z',
    status: 'active'
  },
  {
    id: 'report_2',
    name: 'Weekly Performance Report',
    description: 'Weekly analysis of student and faculty performance',
    type: 'performance',
    frequency: 'weekly',
    recipients: ['admin@university.edu'],
    last_generated: '2024-01-15T09:00:00Z',
    status: 'active'
  },
  {
    id: 'report_3',
    name: 'Monthly Analytics Dashboard',
    description: 'Comprehensive monthly analytics and trends',
    type: 'analytics',
    frequency: 'monthly',
    recipients: ['admin@university.edu', 'board@university.edu'],
    last_generated: '2024-01-01T10:00:00Z',
    status: 'active'
  }
];

const AdminReports: React.FC = () => {
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);

  const departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Engineering', 'Biology'];
  const campuses = ['Main Campus', 'North Campus', 'Downtown Campus'];

  const handleDepartmentToggle = (department: string) => {
    setSelectedDepartments(prev => 
      prev.includes(department) 
        ? prev.filter(d => d !== department)
        : [...prev, department]
    );
  };

  const handleCampusToggle = (campus: string) => {
    setSelectedCampuses(prev => 
      prev.includes(campus) 
        ? prev.filter(c => c !== campus)
        : [...prev, campus]
    );
  };

  const generateReport = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast.error('Please select a date range');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast.success(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully!`);
      
      // Simulate file download
      const link = document.createElement('a');
      link.href = '#';
      link.download = `${reportType}-report-${dateRange.from}-to-${dateRange.to}.${exportFormat}`;
      link.click();
      
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const scheduleReport = async (templateId: string) => {
    toast.success('Report scheduled successfully!');
  };

  return (
    <DashboardLayout title="Reports & Analytics">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Generate comprehensive reports and schedule automated analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Email Reports
            </Button>
            <Button size="sm">
              <FileText className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>

        {/* Report Generation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generate Custom Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">Attendance Report</SelectItem>
                    <SelectItem value="performance">Performance Analysis</SelectItem>
                    <SelectItem value="analytics">Analytics Dashboard</SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-3">
                <Label>Departments</Label>
                <div className="grid grid-cols-2 gap-2">
                  {departments.map((dept) => (
                    <div key={dept} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dept-${dept}`}
                        checked={selectedDepartments.includes(dept)}
                        onCheckedChange={() => handleDepartmentToggle(dept)}
                      />
                      <Label htmlFor={`dept-${dept}`} className="text-sm">
                        {dept}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Campuses</Label>
                <div className="grid grid-cols-1 gap-2">
                  {campuses.map((campus) => (
                    <div key={campus} className="flex items-center space-x-2">
                      <Checkbox
                        id={`campus-${campus}`}
                        checked={selectedCampuses.includes(campus)}
                        onCheckedChange={() => handleCampusToggle(campus)}
                      />
                      <Label htmlFor={`campus-${campus}`} className="text-sm">
                        {campus}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                    <SelectItem value="csv">CSV File</SelectItem>
                    <SelectItem value="json">JSON Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateReport} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Reports */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Quick Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="h-4 w-4 mr-2" />
                Today's Attendance Summary
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Weekly Performance Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" />
                Campus Utilization Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                Course Enrollment Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Target className="h-4 w-4 mr-2" />
                Department Performance
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Reports */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Scheduled Reports</CardTitle>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockReportTemplates.map((template) => (
                <div key={template.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">{template.type}</Badge>
                      <h4 className="font-medium">{template.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Frequency: {template.frequency}</span>
                      <span>Recipients: {template.recipients.length}</span>
                      <span>Last: {new Date(template.last_generated).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                      {template.status}
                    </Badge>
                    <Button 
                      size="sm" 
                      onClick={() => scheduleReport(template.id)}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;