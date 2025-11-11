'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Eye,
  FileText,
  FileSpreadsheet,
  FileBox,
  FileJson,
  ChevronDown,
  Check,
  X,
  Clock
} from 'lucide-react';
import { UserPlus, Users } from 'lucide-react';
import { mockUsers } from '@/lib/mock-data';
import { exportUsers } from '@/lib/export-utils';
import { UserDialog } from '@/components/users/UserDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { jsPDF } from 'jspdf';

const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: '',
    role: 'all',
    status: 'all'
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [isImporting, setIsImporting] = useState(false);
  const [addUserMode, setAddUserMode] = useState<'single' | 'multiple'>('single');

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters({
      searchTerm,
      role: roleFilter,
      status: statusFilter
    });
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setAppliedFilters({
      searchTerm: '',
      role: 'all',
      status: 'all'
    });
  };

  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handle bulk actions (activate, deactivate, delete)
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedUsers.length === 0) {
      toast({
        title: 'No users selected',
        description: 'Please select at least one user to perform this action.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Show loading state
      const loadingToast = toast({
        title: 'Processing...',
        description: `Performing ${action} on ${selectedUsers.length} user(s)`,
      });

      // Here you would typically make an API call to perform the bulk action
      // For example:
      // const response = await fetch('/api/admin/users/bulk-action', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ userIds: selectedUsers, action })
      // });
      // const data = await response.json();

      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      toast({
        title: 'Success',
        description: `Successfully ${action}d ${selectedUsers.length} user(s)`,
      });

      // Clear selection
      setSelectedUsers([]);

      // Refresh users data
      // fetchUsers(); // Uncomment this if you have a fetchUsers function

    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: 'Error',
        description: `Failed to ${action} users. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = useMemo(() => {
    return mockUsers.filter(user => {
      const searchLower = appliedFilters.searchTerm.toLowerCase();
      const matchesSearch =
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.username.toLowerCase().includes(searchLower) ||
        ('student_id' in user && (user as any).student_id?.toLowerCase().includes(searchLower)) ||
        ('employee_id' in user && (user as any).employee_id?.toLowerCase().includes(searchLower));

      const matchesRole = appliedFilters.role === 'all' || user.role === appliedFilters.role;
      const matchesStatus = appliedFilters.status === 'all' || user.status === appliedFilters.status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [appliedFilters]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'super_admin':
      case 'admin':
        return 'default';
      case 'faculty':
        return 'secondary';
      case 'student':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(filteredUsers.map(user => user.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  // Handle file selection for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  // Handle import submission
  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to import.',
        variant: 'destructive',
      });
      return;
    }

    setIsImporting(true);

    try {
      const fileContent = await readFile(importFile);
      let users = [];

      if (importFormat === 'csv') {
        // Parse CSV
        const lines = fileContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/[\"]/g, ''));

        users = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/[\"]/g, ''));
          return headers.reduce((obj, header, index) => ({
            ...obj,
            [header]: values[index] || ''
          }), {});
        });
      } else {
        // Parse JSON
        users = JSON.parse(fileContent);
      }

      // Validate users
      const validUsers = users.filter((user: any) =>
        user.email && user.name && user.role
      );

      if (validUsers.length === 0) {
        throw new Error('No valid users found in the file.');
      }

      // In a real app, you would send this to your API
      console.log('Importing users:', validUsers);

      toast({
        title: 'Import successful',
        description: `Successfully imported ${validUsers.length} users.`,
      });

      // Reset form
      setImportFile(null);
      setImportFormat('csv');
      setIsImportDialogOpen(false);

      // Refresh users list
      // fetchUsers();
    } catch (error) {
      console.error('Import failed:', error);
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'An error occurred during import.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Helper function to read file content
  const readFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // Handle export functionality with different formats
  const handleExport = useCallback((format: 'csv' | 'pdf' | 'json' = 'csv') => {
    try {
      // Use filteredUsers instead of mockUsers to export only the filtered results
      const data = filteredUsers.map(user => ({
        'ID': user.id,
        'Name': user.name,
        'Email': user.email,
        'Role': user.role,
        'Status': user.status,
        'Last Login': user.last_login || 'Never',
        'Created At': user.created_at || 'N/A'
      }));

      if (data.length === 0) {
        toast({
          title: 'No data to export',
          description: 'There are no users matching the current filters.',
          variant: 'destructive',
        });
        return;
      }

      const filename = `users_export_${new Date().toISOString().split('T')[0]}`;

      if (format === 'pdf') {
        // Generate PDF report
        const doc = new jsPDF();
        doc.text('Users Export', 14, 20);

        // Add table headers
        const headers = [['ID', 'Name', 'Email', 'Role', 'Status']];
        const tableData = data.map(item => [
          item.ID,
          item.Name,
          item.Email,
          item.Role,
          item.Status
        ]);

        (doc as any).autoTable({
          head: headers,
          body: tableData,
          startY: 30,
          theme: 'grid',
          headStyles: { fillColor: [41, 128, 185] },
          styles: { fontSize: 8 }
        });

        doc.save(`${filename}.pdf`);
      } else if (format === 'csv') {
        // Generate CSV
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).map(value =>
          `"${String(value).replace(/"/g, '""')}"`
        ).join(','));
        const csvContent = [headers, ...rows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (format === 'json') {
        // Generate JSON
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast({
        title: 'Export successful',
        description: `Users data has been exported as ${format.toUpperCase()}.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting the user data. Please try again.',
        variant: 'destructive',
      });
    }
  }, [selectedUsers]);

  // Handle user creation success
  const handleUserCreated = () => {
    toast({
      title: 'User created',
      description: 'The user has been created successfully.',
    });
    // In a real app, you might want to refresh the users list here
  };

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              User Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage all users across your institution
            </p>
          </div>
          <div className="flex gap-2">
            <DropdownMenu onOpenChange={setIsExportDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isExportDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Export as CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  <FileBox className="mr-2 h-4 w-4" />
                  <span>Export as PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  <FileJson className="mr-2 h-4 w-4" />
                  <span>Export as JSON</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative group">
              <Button
                onClick={() => {
                  if (addUserMode === 'single') {
                    setIsUserDialogOpen(true);
                  } else {
                    setIsImportDialogOpen(true);
                  }
                }}
                className="gap-2"
              >
                {addUserMode === 'single' ? (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Add User
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Add Multiple Users
                  </>
                )}
                <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
              </Button>
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <button
                  onClick={() => setAddUserMode('single')}
                  className={`w-full text-left px-4 py-2 text-sm ${addUserMode === 'single' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <div className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Single User
                  </div>
                </button>
                <button
                  onClick={() => setAddUserMode('multiple')}
                  className={`w-full text-left px-4 py-2 text-sm ${addUserMode === 'multiple' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Add Multiple Users
                  </div>
                </button>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={applyFilters}
                    className="whitespace-nowrap"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={resetFilters}
                    className="whitespace-nowrap"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Filter className="h-4 w-4 mr-2" />
                    <span>Filters</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedUsers.length > 0 && (
          <Card className="glass border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    Clear Selection
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4 mr-2" />
                        <span>Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleBulkAction('activate')}>
                        <Check className="h-4 w-4 mr-2" />
                        <span>Activate</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('deactivate')}>
                        <span className="h-4 w-4 mr-2">—</span>
                        <span>Deactivate</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('delete')} className="text-red-600 dark:text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Table */}
        <Card className="glass">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Users ({filteredUsers.length})</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAllUsers}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                        onChange={() => selectedUsers.length === filteredUsers.length ? clearSelection() : selectAllUsers()}
                        className="rounded"
                        aria-label="Select all users"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">User</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Last Login</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded"
                          aria-label={`Select ${user.name}`}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={`View ${user.name}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <UserDialog
                            defaultValues={{
                              firstName: user.name.split(' ')[0],
                              lastName: user.name.split(' ').slice(1).join(' '),
                              email: user.email,
                              role: user.role,
                              status: user.status,
                              studentId: 'student_id' in user ? (user as any).student_id : '',
                              employeeId: 'employee_id' in user ? (user as any).employee_id : '',
                              department: user.department || '',
                              phoneNumber: 'phone' in user ? (user as any).phone : '',
                            }}
                            onSuccess={handleUserCreated}
                            trigger={
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={`Edit ${user.name}`}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label={`More options for ${user.name}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
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

      {/* Import Users Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import Users</DialogTitle>
            <DialogDescription>
              Upload a CSV or JSON file containing user data.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="import-format">File Format</Label>
              <Select
                value={importFormat}
                onValueChange={(value: 'csv' | 'json') => setImportFormat(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>File</Label>
              <div
                className="flex items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept={importFormat === 'csv' ? '.csv' : '.json'}
                  onChange={handleFileChange}
                  aria-label="Select file to import"
                  title="Select file to import"
                />

                {importFile ? (
                  <div className="text-center">
                    <p className="font-medium">{importFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(importFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {importFormat === 'csv' ? 'CSV (max 10MB)' : 'JSON (max 10MB)'}
                    </p>
                  </div>
                )}
              </div>

              {importFormat === 'csv' && (
                <div className="mt-2 p-3 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                  <p className="font-medium mb-1">CSV Format:</p>
                  <pre className="bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto">
                    email,name,role,status
                    user1@example.com,John Doe,student,active
                    user2@example.com,Jane Smith,faculty,active
                  </pre>
                </div>
              )}

              {importFormat === 'json' && (
                <div className="mt-2 p-3 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                  <p className="font-medium mb-1">JSON Format:</p>
                  <pre className="bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto">
                    {`[
  {
    "email": "user1@example.com",
    "name": "John Doe",
    "role": "student",
    "status": "active"
  },
  {
    "email": "user2@example.com",
    "name": "Jane Smith",
    "role": "faculty",
    "status": "active"
  }
]`}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportFile(null);
                setIsImportDialogOpen(false);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!importFile || isImporting}
            >
              {isImporting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                'Import Users'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
};

export default AdminUsers;