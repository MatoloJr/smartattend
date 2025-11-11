'use client';

import React, { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  Filter,
  Send,
  Users,
  BarChart3,
  TrendingUp,
  Building2,
  BookOpen,
  Target,
  Plus,
  X,
  Check,
  Mail,
  FileSpreadsheet,
  FileJson,
  Loader2,
  Trash2,
  CalendarDays,
  Clock8,
  CalendarCheck,
  CalendarClock,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import { generatePDFReport, AdminReportData, generateExcelCSV } from '@/lib/report-generator';
import { randomUUID } from 'crypto';

// Mock function for sending email reports
const sendEmailReport = async (emailData: any) => {
  // In a real application, this would be an API call to your backend
  console.log('Sending email with data:', emailData);
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Email sent successfully');
      resolve(true);
    }, 1000);
  });
};
import { mockSessions, mockAttendance, mockUsers } from '@/lib/mock-data';
import { format } from 'date-fns';

interface DateRange {
  from: string;
  to: string;
}

interface ReportParameters {
  dateRange: DateRange;
  departments?: string[];
  campuses?: string[];
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'attendance' | 'performance' | 'analytics' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'semester' | 'on-demand';
  recipients: string;
  last_generated: string;
  next_run?: string;
  status: 'active' | 'inactive';
  parameters: ReportParameters;
}

const mockReportTemplates: ReportTemplate[] = [
  {
    id: 'report_1',
    name: 'Daily Attendance Summary',
    description: 'Daily overview of attendance across all departments',
    type: 'attendance',
    frequency: 'daily',
    recipients: 'admin@university.edu, dean@university.edu',
    last_generated: '2024-01-20T08:00:00Z',
    next_run: '2024-01-21T08:00:00Z',
    status: 'active',
    parameters: {
      dateRange: {
        from: format(new Date(), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd')
      },
      format: 'pdf'
    }
  },
  {
    id: 'report_2',
    name: 'Weekly Performance Report',
    description: 'Weekly analysis of student and faculty performance',
    type: 'performance',
    frequency: 'weekly',
    recipients: 'admin@university.edu',
    last_generated: '2024-01-15T09:00:00Z',
    next_run: '2024-01-22T09:00:00Z',
    status: 'active',
    parameters: {
      dateRange: {
        from: format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd')
      },
      format: 'xlsx'
    }
  },
  {
    id: 'report_3',
    name: 'Monthly Analytics Dashboard',
    description: 'Comprehensive monthly analytics and trends',
    type: 'analytics',
    frequency: 'monthly',
    recipients: 'admin@university.edu, board@university.edu',
    last_generated: '2024-01-01T10:00:00Z',
    next_run: '2024-02-01T10:00:00Z',
    status: 'active',
    parameters: {
      dateRange: {
        from: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd')
      },
      format: 'pdf'
    }
  }
];

const AdminReports: React.FC = () => {
  // Report generation state
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState({ from: format(new Date(), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') });
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedCampuses, setSelectedCampuses] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Dialog states
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Template form state
  const defaultDateRange: DateRange = {
    from: format(new Date(), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  };

  const [templateForm, setTemplateForm] = useState<Omit<ReportTemplate, 'last_generated' | 'next_run'>>({
    id: '',
    name: '',
    description: '',
    type: 'attendance',
    frequency: 'weekly',
    recipients: '',
    status: 'active',
    parameters: {
      dateRange: defaultDateRange,
      format: 'pdf',
      departments: [],
      campuses: []
    }
  });

  const departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Engineering', 'Biology'];
  const campuses = ['Main Campus', 'North Campus', 'Downtown Campus'];
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>(mockReportTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const generateReport = async (template?: ReportTemplate) => {
    const reportConfig = template ? {
      type: template.type,
      dateRange: template.parameters?.dateRange || { from: '', to: '' },
      format: template.parameters?.format || 'pdf',
      departments: template.parameters?.departments || [],
      campuses: template.parameters?.campuses || []
    } : {
      type: reportType,
      dateRange,
      format: exportFormat,
      departments: selectedDepartments,
      campuses: selectedCampuses
    };

    if (!reportConfig.dateRange.from || !reportConfig.dateRange.to) {
      toast.error('Please select a date range');
      return null;
    }

    setIsGenerating(true);
    
    try {
      // Prepare report data
      const startDate = new Date(reportConfig.dateRange.from);
      const endDate = new Date(reportConfig.dateRange.to);
      
      // Filter departments if any are selected
      const filteredDepartments = reportConfig.departments.length > 0 
        ? reportConfig.departments 
        : departments;
      
      // Calculate department statistics
      const departmentStats = filteredDepartments.map(dept => ({
        name: dept,
        totalStudents: Math.floor(Math.random() * 500) + 100,
        totalFaculty: Math.floor(Math.random() * 30) + 5,
        averageAttendance: Math.floor(Math.random() * 20) + 75,
        courses: Math.floor(Math.random() * 20) + 10
      }));
      
      const reportData: AdminReportData = {
        title: `${reportConfig.type.charAt(0).toUpperCase() + reportConfig.type.slice(1)} Report`,
        subtitle: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
        generatedAt: new Date(),
        generatedBy: 'Admin',
        period: {
          start: startDate,
          end: endDate,
          label: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
        },
        data: departmentStats,
        institution: 'SmartAttend University',
        departments: departmentStats,
        overallStats: {
          totalStudents: departmentStats.reduce((sum, d) => sum + d.totalStudents, 0),
          totalFaculty: departmentStats.reduce((sum, d) => sum + d.totalFaculty, 0),
          totalSessions: mockSessions.length,
          averageAttendance: Math.round(departmentStats.reduce((sum, d) => sum + d.averageAttendance, 0) / departmentStats.length),
          attendanceTrend: 'up' as const
        }
      };
      
      // Generate report based on format
      let reportBlob: Blob | null = null;
      
      if (reportConfig.format === 'csv' || reportConfig.format === 'xlsx') {
        reportBlob = await generateExcelCSV(reportData);
      } else if (reportConfig.format === 'pdf') {
        reportBlob = await generatePDFReport(reportData, 'admin');
      } else if (reportConfig.format === 'json') {
        reportBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      }
      
      if (!template) {
        toast.success(`${reportConfig.type.charAt(0).toUpperCase() + reportConfig.type.slice(1)} report generated successfully!`);
      }
      
      return { reportData, reportBlob };
      
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Failed to generate report');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailRecipients) {
      toast.error('Please enter at least one email recipient');
      return;
    }

    setIsSendingEmail(true);
    
    try {
      // Generate the report first
      const reportResult = await generateReport();
      
      if (!reportResult) {
        toast.error('Failed to generate report for email');
        return;
      }
      
      const { reportData, reportBlob } = reportResult;
      
      // Prepare email data
      const emailData = {
        to: emailRecipients.split(',').map(email => email.trim()),
        subject: emailSubject || `${reportData.title} - ${new Date().toLocaleDateString()}`,
        message: emailMessage || `Please find attached the ${reportData.title} for ${reportData.period.label}.`,
        attachment: {
          blob: reportBlob,
          filename: `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${exportFormat}`,
          type: exportFormat === 'pdf' ? 'application/pdf' : 
                exportFormat === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                exportFormat === 'csv' ? 'text/csv' : 'application/json'
        }
      };
      
      // In a real app, this would be an API call to your backend
      await sendEmailReport(emailData);
      
      toast.success('Report sent successfully!');
      setIsEmailDialogOpen(false);
      
    } catch (error) {
      console.error('Email sending error:', error);
      toast.error('Failed to send report');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const newTemplate: ReportTemplate = {
      ...templateForm,
      id: `report_${Date.now()}`,
      last_generated: new Date().toISOString(),
      next_run: calculateNextRun(templateForm.frequency)
    };
    
    setReportTemplates(prev => [...prev, newTemplate]);
    setIsTemplateDialogOpen(false);
    toast.success('Report template created successfully!');
    
    // Reset form with required id field
    setTemplateForm({
      id: `report_${Date.now() + 1}`, // Add a new unique ID
      name: '',
      description: '',
      type: 'attendance',
      frequency: 'weekly',
      recipients: '',
      status: 'active',
      parameters: {
        dateRange: defaultDateRange,
        format: 'pdf',
        departments: [],
        campuses: []
      }
    });
  };
  
  const handleScheduleReport = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setIsScheduleDialogOpen(true);
  };
  
  const confirmScheduleReport = async () => {
    if (!selectedTemplate) return;
    
    try {
      // In a real app, this would be an API call to schedule the report
      const nextRun = calculateNextRun(selectedTemplate.frequency);
      
      setReportTemplates(prev => 
        prev.map(t => 
          t.id === selectedTemplate.id 
            ? { ...t, status: 'active', next_run: nextRun }
            : t
        )
      );
      
      toast.success(`Report scheduled successfully! Next run: ${new Date(nextRun).toLocaleString()}`);
      
    } catch (error) {
      console.error('Error scheduling report:', error);
      toast.error('Failed to schedule report');
    } finally {
      setIsScheduleDialogOpen(false);
      setSelectedTemplate(null);
    }
  };
  
  const handleSendNow = async (template: ReportTemplate) => {
    try {
      const reportResult = await generateReport(template);
      
      if (!reportResult) {
        toast.error('Failed to generate report');
        return;
      }
      
      const { reportData, reportBlob } = reportResult;
      
      // Prepare email data
      const emailData = {
        to: template.recipients.split(',').map(email => email.trim()),
        subject: `${reportData.title} - ${new Date().toLocaleDateString()}`,
        message: `Please find attached the ${reportData.title} for ${reportData.period.label}.`,
        attachment: {
          blob: reportBlob,
          filename: `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${template.parameters?.format || 'pdf'}`,
          type: template.parameters?.format === 'pdf' ? 'application/pdf' : 
                template.parameters?.format === 'xlsx' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' :
                template.parameters?.format === 'csv' ? 'text/csv' : 'application/json'
        }
      };
      
      // In a real app, this would be an API call to your backend
      await sendEmailReport(emailData);
      
      // Update last generated time
      setReportTemplates(prev => 
        prev.map(t => 
          t.id === template.id 
            ? { 
                ...t, 
                last_generated: new Date().toISOString(),
                next_run: calculateNextRun(t.frequency)
              }
            : t
        )
      );
      
      toast.success('Report sent successfully!');
      
    } catch (error) {
      console.error('Error sending report:', error);
      toast.error('Failed to send report');
    }
  };
  
  const toggleTemplateStatus = (templateId: string, currentStatus: 'active' | 'inactive') => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setReportTemplates(prev => 
      prev.map(t => 
        t.id === templateId 
          ? { 
              ...t, 
              status: newStatus,
              next_run: newStatus === 'active' ? calculateNextRun(t.frequency) : undefined
            }
          : t
      )
    );
    toast.success(`Report template ${newStatus}d`);
  };
  
  const deleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this report template? This action cannot be undone.')) {
      setReportTemplates(prev => prev.filter(t => t.id !== templateId));
      toast.success('Report template deleted');
    }
  };
  
  // Helper function to calculate next run time based on frequency
  const calculateNextRun = (frequency: string): string => {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        now.setHours(8, 0, 0, 0); // 8 AM
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        now.setHours(9, 0, 0, 0); // Next Monday 9 AM
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        now.setDate(1);
        now.setHours(10, 0, 0, 0); // 1st of next month 10 AM
        break;
      case 'semester':
        // Assuming semesters start in January and August
        if (now.getMonth() >= 7) {
          now.setFullYear(now.getFullYear() + 1, 0, 1); // January 1st next year
        } else {
          now.setMonth(7, 1); // August 1st this year
        }
        now.setHours(10, 0, 0, 0);
        break;
      default: // on-demand
        return '';
    }
    
    return now.toISOString();
  };
  
  // Handle quick report generation
  const handleQuickReport = async (type: string) => {
    // Define a type for our quick template that ensures parameters are always defined
    type QuickTemplate = Omit<ReportTemplate, 'id' | 'last_generated' | 'status' | 'frequency' | 'recipients' | 'next_run'> & {
      parameters: ReportParameters;
    };
    
    // Initialize with required fields and proper typing
    let quickTemplate: QuickTemplate = {
      name: '',
      description: '',
      type: 'custom',
      parameters: {
        format: 'pdf',
        dateRange: {
          from: format(new Date(), 'yyyy-MM-dd'),
          to: format(new Date(), 'yyyy-MM-dd')
        }
      }
    };
    
    switch (type) {
      case 'today':
        quickTemplate = {
          ...quickTemplate,
          name: "Today's Attendance Summary",
          description: 'Summary of attendance for today',
          type: 'attendance',
          parameters: {
            ...quickTemplate.parameters,
            dateRange: {
              from: format(new Date(), 'yyyy-MM-dd'),
              to: format(new Date(), 'yyyy-MM-dd')
            }
          }
        };
        break;
        
      case 'weekly':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        quickTemplate = {
          ...quickTemplate,
          name: 'Weekly Performance Report',
          description: 'Performance metrics for the past week',
          type: 'performance',
          parameters: {
            ...quickTemplate.parameters,
            format: 'xlsx',
            dateRange: {
              from: format(weekAgo, 'yyyy-MM-dd'),
              to: format(new Date(), 'yyyy-MM-dd')
            }
          }
        };
        break;
        
      case 'campus':
        quickTemplate = {
          ...quickTemplate,
          name: 'Campus Utilization Report',
          description: 'Analysis of campus space and resource utilization',
          type: 'analytics',
          parameters: {
            ...quickTemplate.parameters,
            campuses: campuses
          }
        };
        break;
        
      case 'enrollment':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        
        quickTemplate = {
          ...quickTemplate,
          name: 'Course Enrollment Report',
          description: 'Overview of course enrollments and capacities',
          type: 'analytics',
          parameters: {
            ...quickTemplate.parameters,
            format: 'pdf',
            dateRange: {
              from: format(monthAgo, 'yyyy-MM-dd'),
              to: format(new Date(), 'yyyy-MM-dd')
            }
          }
        };
        break;
        
      case 'department':
        quickTemplate = {
          ...quickTemplate,
          name: 'Department Performance',
          description: 'Performance metrics by department',
          type: 'performance',
          parameters: {
            ...quickTemplate.parameters,
            departments: departments,
            format: 'pdf',
            dateRange: quickTemplate.parameters.dateRange // Ensure dateRange is included
          }
        };
        break;
    }
    
    // Generate the quick report
    await generateReport(quickTemplate as ReportTemplate);
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEmailDialogOpen(true)}
            >
              <Send className="h-4 w-4 mr-2" />
              Email Reports
            </Button>
            <Button 
              size="sm"
              onClick={() => setIsTemplateDialogOpen(true)}
            >
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
                onClick={(e) => generateReport()} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
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
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickReport('today')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Today&apos;s Attendance Summary
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickReport('weekly')}
              >
                <Users className="h-4 w-4 mr-2" />
                Weekly Performance Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickReport('campus')}
              >
                <Building2 className="h-4 w-4 mr-2" />
                Campus Utilization Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickReport('enrollment')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Course Enrollment Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleQuickReport('department')}
              >
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
              <Button 
                size="sm"
                onClick={() => {
                  setTemplateForm({
                    id: crypto.randomUUID(), // Generate a new unique ID
                    name: '',
                    description: '',
                    type: 'attendance',
                    frequency: 'weekly',
                    recipients: '',
                    status: 'active',
                    parameters: {
                      dateRange: defaultDateRange,
                      format: 'pdf'
                    }
                  });
                  setIsTemplateDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Schedule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportTemplates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No scheduled reports found.</p>
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => setIsTemplateDialogOpen(true)}
                  >
                    Create your first report template
                  </Button>
                </div>
              ) : (
                reportTemplates.map((template) => (
                  <div key={template.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex-1 mb-3 sm:mb-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <Badge variant="outline">{template.type}</Badge>
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge 
                          variant={template.status === 'active' ? 'default' : 'secondary'}
                          className="ml-0 sm:ml-2"
                        >
                          {template.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {template.frequency}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {template.recipients.split(',').length} {template.recipients.split(',').length === 1 ? 'recipient' : 'recipients'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock8 className="h-3 w-3" />
                          Last: {new Date(template.last_generated).toLocaleDateString()}
                        </span>
                        {template.next_run && (
                          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                            <CalendarClock className="h-3 w-3" />
                            Next: {new Date(template.next_run).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleSendNow(template)}
                        disabled={isGenerating}
                        className="w-full sm:w-auto"
                      >
                        {isGenerating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Send Now
                      </Button>
                      
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setTemplateForm({
                              ...template,
                              recipients: template.recipients
                            });
                            setIsTemplateDialogOpen(true);
                          }}
                          className="px-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => toggleTemplateStatus(template.id, template.status)}
                          className="px-2"
                        >
                          {template.status === 'active' ? (
                            <X className="h-4 w-4 text-red-500" />
                          ) : (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => deleteTemplate(template.id)}
                          className="px-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Email Report Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Email Report</DialogTitle>
            <DialogDescription>
              Send the generated report via email to recipients
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-recipients">Recipients *</Label>
              <Input
                id="email-recipients"
                placeholder="recipient1@example.com, recipient2@example.com"
                value={emailRecipients}
                onChange={(e) => setEmailRecipients(e.target.value)}
              />
              <p className="text-xs text-gray-500">Separate multiple emails with commas</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                placeholder="Report: Attendance Summary"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                placeholder="Please find attached the report you requested."
                rows={4}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select 
                value={exportFormat} 
                onValueChange={(value: 'pdf' | 'xlsx' | 'csv' | 'json') => setExportFormat(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV File</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEmailDialogOpen(false)}
              disabled={isSendingEmail}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendEmail}
              disabled={isSendingEmail || !emailRecipients}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Report
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {templateForm.id ? 'Edit Report Template' : 'New Report Template'}
            </DialogTitle>
            <DialogDescription>
              {templateForm.id 
                ? 'Update the report template details'
                : 'Create a new report template to schedule automated reports'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name *</Label>
              <Input
                id="template-name"
                placeholder="e.g., Weekly Attendance Report"
                value={templateForm.name}
                onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                placeholder="Brief description of the report"
                rows={3}
                value={templateForm.description}
                onChange={(e) => setTemplateForm({...templateForm, description: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-type">Report Type</Label>
                <Select 
                  value={templateForm.type}
                  onValueChange={(value: 'attendance' | 'performance' | 'analytics' | 'custom') => 
                    setTemplateForm({...templateForm, type: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="attendance">Attendance Report</SelectItem>
                    <SelectItem value="performance">Performance Report</SelectItem>
                    <SelectItem value="analytics">Analytics Dashboard</SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-frequency">Frequency</Label>
                <Select 
                  value={templateForm.frequency}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'semester' | 'on-demand') => 
                    setTemplateForm({...templateForm, frequency: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="semester">Semester</SelectItem>
                    <SelectItem value="on-demand">On Demand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-recipients">Email Recipients</Label>
              <Input
                id="template-recipients"
                placeholder="recipient1@example.com, recipient2@example.com"
                value={templateForm.recipients}
                onChange={(e) => setTemplateForm({...templateForm, recipients: e.target.value})}
              />
              <p className="text-xs text-gray-500">Separate multiple emails with commas</p>
            </div>
            
            <div className="space-y-2">
              <Label>Report Parameters</Label>
              <div className="p-4 border rounded-md space-y-4">
                <div>
                  <Label className="text-sm font-medium">Date Range</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <Input
                        type="date"
                        value={templateForm.parameters.dateRange.from}
                        onChange={(e) => 
                          setTemplateForm(prev => ({
                            ...prev,
                            parameters: {
                              ...prev.parameters,
                              dateRange: {
                                ...prev.parameters.dateRange,
                                from: e.target.value
                              }
                            }
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Input
                        type="date"
                        value={templateForm.parameters.dateRange.to}
                        onChange={(e) => 
                          setTemplateForm(prev => ({
                            ...prev,
                            parameters: {
                              ...prev.parameters,
                              dateRange: {
                                ...prev.parameters.dateRange,
                                to: e.target.value
                              }
                            }
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Export Format</Label>
                  <Select 
                    value={templateForm.parameters.format}
                    onValueChange={(value: 'pdf' | 'xlsx' | 'csv' | 'json') => 
                      setTemplateForm({
                        ...templateForm, 
                        parameters: {
                          ...templateForm.parameters,
                          format: value
                        }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Departments</Label>
                  <div className="mt-1 space-y-1 max-h-32 overflow-y-auto p-2 border rounded">
                    {departments.map((dept) => (
                      <div key={dept} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dept-${dept}`}
                          checked={templateForm.parameters?.departments?.includes(dept) || false}
                          onCheckedChange={(checked) => {
                            const currentDepts = templateForm.parameters?.departments || [];
                            setTemplateForm({
                              ...templateForm,
                              parameters: {
                                ...templateForm.parameters,
                                departments: checked
                                  ? [...currentDepts, dept]
                                  : currentDepts.filter(d => d !== dept)
                              }
                            });
                          }}
                        />
                        <Label htmlFor={`dept-${dept}`} className="text-sm font-normal">
                          {dept}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Campuses</Label>
                  <div className="mt-1 space-y-1 max-h-32 overflow-y-auto p-2 border rounded">
                    {campuses.map((campus) => (
                      <div key={campus} className="flex items-center space-x-2">
                        <Checkbox
                          id={`campus-${campus}`}
                          checked={templateForm.parameters?.campuses?.includes(campus) || false}
                          onCheckedChange={(checked) => {
                            const currentCampuses = templateForm.parameters?.campuses || [];
                            setTemplateForm({
                              ...templateForm,
                              parameters: {
                                ...templateForm.parameters,
                                campuses: checked
                                  ? [...currentCampuses, campus]
                                  : currentCampuses.filter(c => c !== campus)
                              }
                            });
                          }}
                        />
                        <Label htmlFor={`campus-${campus}`} className="text-sm font-normal">
                          {campus}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Status</Label>
                <p className="text-sm text-gray-500">
                  {templateForm.status === 'active' ? 'Active' : 'Inactive'} - 
                  {templateForm.status === 'active' 
                    ? 'Report will be sent according to schedule'
                    : 'Report scheduling is paused'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {templateForm.status === 'active' ? 'Active' : 'Inactive'}
                </span>
                <Switch
                  checked={templateForm.status === 'active'}
                  onCheckedChange={(checked) => 
                    setTemplateForm({
                      ...templateForm, 
                      status: checked ? 'active' : 'inactive'
                    })
                  }
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsTemplateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateTemplate}
              disabled={!templateForm.name}
            >
              {templateForm.id ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Schedule Confirmation Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to schedule this report?
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-2 py-4">
              <p className="font-medium">{selectedTemplate.name}</p>
              <p className="text-sm text-gray-500">{selectedTemplate.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="space-y-1">
                  <p className="font-medium">Frequency:</p>
                  <p className="text-gray-500 capitalize">{selectedTemplate.frequency}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Next Run:</p>
                  <p className="text-gray-500">
                    {selectedTemplate.next_run 
                      ? new Date(selectedTemplate.next_run).toLocaleString() 
                      : 'Not scheduled'}
                  </p>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="font-medium">Recipients:</p>
                  <p className="text-gray-500">{selectedTemplate.recipients}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsScheduleDialogOpen(false);
                setSelectedTemplate(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmScheduleReport}
              disabled={!selectedTemplate}
            >
              <CalendarCheck className="h-4 w-4 mr-2" />
              Confirm Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminReports;