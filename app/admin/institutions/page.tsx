'use client';

import React, { useState } from 'react';
import InstitutionModel from '@/models/Institution';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  Plus, 
  Search,
  Filter,
  Download,
  Users,
  GraduationCap,
  BookOpen,
  MapPin,
  Globe,
  Trash2,
  Calendar,
  TrendingUp,
  Eye,
  Edit,
  MoreVertical,
  FileText,
  FileSpreadsheet,
  FileJson,
  X,
  Check,
  ChevronDown
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { mockInstitutions } from '@/lib/mock-data';
import { Institution as InstitutionType } from '@/lib/types';

// Form data type for institution
interface InstitutionFormData {
  name: string;
  type: string;
  country: string;
  primary_campus: string;
  additional_campuses: string[];
  admin_email: string;
  status: 'active' | 'inactive' | 'suspended';
}

const AdminInstitutions: React.FC = () => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // State for dialogs
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState<InstanceType<typeof InstitutionModel> | null>(null);
  
  // State for new institution form
  const [newInstitution, setNewInstitution] = useState<InstitutionFormData>({
    name: '',
    type: 'University',
    country: '',
    primary_campus: '',
    additional_campuses: [],
    admin_email: '',
    status: 'active'
  });
  
  // State for export options
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'json'>('csv');
  
  // State for new campus input
  const [newCampus, setNewCampus] = useState('');

  // Filter institutions based on search and filters
  const filteredInstitutions = mockInstitutions.filter(institution => {
    const matchesSearch = institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institution.address?.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institution.primaryCampus.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institution.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || institution.type === selectedType;
    const matchesStatus = statusFilter === 'all' || institution.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  // Handle adding a new institution
  const handleAddInstitution = () => {
    // In a real app, you would send this to your API
    console.log('Adding new institution:', newInstitution);
    
    // Show success message
    toast.success('Institution added successfully');
    
    // Reset form and close dialog
    setNewInstitution({
      name: '',
      type: 'University',
      country: '',
      primary_campus: '',
      additional_campuses: [],
      admin_email: '',
      status: 'active'
    });
    setIsAddDialogOpen(false);
  };
  
  // Handle export functionality
  const handleExport = () => {
    try {
      const data = filteredInstitutions.map(institution => ({
        'ID': institution.id,
        'Name': institution.name,
        'Type': institution.type,
        'Country': institution.address.country,
        'Primary Campus': institution.primaryCampus,
        'Additional Campuses': institution.additionalCampuses?.join('; ') || '',
        'Admin Email': institution.contact?.email || '',
        'Status': institution.status,
        'Total Students': institution.total_students,
        'Total Faculty': institution.total_faculty,
        'Total Courses': institution.total_courses,
        'Created At': institution.createdAt ? new Date(institution.createdAt).toLocaleDateString() : ''
      }));
      
      if (data.length === 0) {
        toast.error('No data to export');
        return;
      }
      
      const filename = `institutions_export_${format(new Date(), 'yyyy-MM-dd')}`;
      
      if (exportFormat === 'csv') {
        // Generate CSV
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => 
          Object.values(obj).map(value => 
            `"${String(value).replace(/"/g, '""')}"`
          ).join(',')
        );
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
      } else if (exportFormat === 'json') {
        // Generate JSON
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.json`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (exportFormat === 'pdf') {
        // For PDF, we'll use a library like jspdf
        // This is a simplified example - in a real app, you might want to use a more robust solution
        toast.info('PDF export would be implemented here');
        console.log('PDF export data:', data);
      }
      
      setIsExportDialogOpen(false);
      toast.success(`Exported ${data.length} institutions`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };
  
  // Add a new campus to the additional campuses
  const addCampus = () => {
    if (newCampus.trim() && !newInstitution.additional_campuses.includes(newCampus.trim())) {
      setNewInstitution({
        ...newInstitution,
        additional_campuses: [...newInstitution.additional_campuses, newCampus.trim()]
      });
      setNewCampus('');
    }
  };
  
  // Remove a campus from additional campuses
  const removeCampus = (campus: string) => {
    setNewInstitution({
      ...newInstitution,
      additional_campuses: newInstitution.additional_campuses.filter(c => c !== campus)
    });
  };

  return (
    <DashboardLayout title="Institution Management">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Institution Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage educational institutions and their campuses
            </p>
          </div>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="ml-1 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <button 
                  onClick={() => {
                    setExportFormat('csv');
                    setIsExportDialogOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </button>
                <button 
                  onClick={() => {
                    setExportFormat('pdf');
                    setIsExportDialogOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as PDF
                </button>
                <button 
                  onClick={() => {
                    setExportFormat('json');
                    setIsExportDialogOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  Export as JSON
                </button>
              </PopoverContent>
            </Popover>
            
            <Button 
              size="sm" 
              onClick={() => setIsAddDialogOpen(true)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Institution
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search institutions by name, country, or campus..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsFilterDialogOpen(true)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Institutions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredInstitutions.map((institution) => (
            <Card key={institution.id} className="glass hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{institution.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{institution.type}</Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Globe className="h-3 w-3" />
                          <span>{institution.address?.country || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => setSelectedInstitution(institution)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        setNewInstitution({
                          name: institution.name,
                          type: institution.type,
                          country: institution.address.country,
                          primary_campus: institution.primaryCampus,
                          additional_campuses: [...institution.additionalCampuses],
                          admin_email: institution.contact?.email || '',
                          status: institution.status as 'active' | 'inactive' | 'suspended'
                        });
                        setIsAddDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2">
                        <button 
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center"
                          onClick={() => {
                            // Toggle status between active and inactive
                            const newStatus = institution.status === 'active' ? 'inactive' : 'active';
                            toast.success(`Institution ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
                            console.log(`Set status of ${institution.name} to ${newStatus}`);
                          }}
                        >
                          {institution.status === 'active' ? (
                            <>
                              <X className="h-4 w-4 mr-2 text-red-500" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2 text-green-500" />
                              Activate
                            </>
                          )}
                        </button>
                        <button 
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md flex items-center text-red-500"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${institution.name}?`)) {
                              toast.success(`${institution.name} deleted successfully`);
                              console.log('Delete institution:', institution.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </button>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Campus Information */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Primary Campus:</span>
                      <span className="text-gray-600 dark:text-gray-400">{institution.primaryCampus}</span>
                    </div>
                    {institution.additionalCampuses.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Additional Campuses:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {institution.additionalCampuses.map((campus: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {campus}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <Users className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                      <p className="text-lg font-bold">{institution.total_students.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Students</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <GraduationCap className="h-5 w-5 mx-auto mb-1 text-green-500" />
                      <p className="text-lg font-bold">{institution.total_faculty}</p>
                      <p className="text-xs text-gray-500">Faculty</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <BookOpen className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                      <p className="text-lg font-bold">{institution.total_courses.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Courses</p>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={institution.status === 'active' ? 'default' : 'secondary'}>
                        {institution.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {institution.createdAt ? `Since ${new Date(institution.createdAt).toLocaleDateString()}` : ''}
                      </span>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => setSelectedInstitution(institution)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Statistics */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {filteredInstitutions.length}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Institutions</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {filteredInstitutions.reduce((acc, inst) => acc + inst.total_students, 0).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {filteredInstitutions.reduce((acc, inst) => acc + inst.total_faculty, 0)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Faculty</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {filteredInstitutions.reduce((acc, inst) => acc + inst.total_courses, 0).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Add/Edit Institution Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedInstitution ? 'Edit Institution' : 'Add New Institution'}</DialogTitle>
            <DialogDescription>
              {selectedInstitution 
                ? 'Update the institution details below.'
                : 'Fill in the details to add a new institution.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Institution Name *</Label>
                <Input
                  id="name"
                  value={newInstitution.name}
                  onChange={(e) => setNewInstitution({...newInstitution, name: e.target.value})}
                  placeholder="e.g. Tech University"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <Select 
                  value={newInstitution.type}
                  onValueChange={(value) => setNewInstitution({...newInstitution, type: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="University">University</SelectItem>
                    <SelectItem value="College">College</SelectItem>
                    <SelectItem value="Institute">Institute</SelectItem>
                    <SelectItem value="School">School</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={newInstitution.country}
                  onChange={(e) => setNewInstitution({...newInstitution, country: e.target.value})}
                  placeholder="e.g. United States"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={newInstitution.status}
                  onValueChange={(value: 'active' | 'inactive' | 'suspended') => 
                    setNewInstitution({...newInstitution, status: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="primary_campus">Primary Campus *</Label>
              <Input
                id="primary_campus"
                value={newInstitution.primary_campus}
                onChange={(e) => setNewInstitution({...newInstitution, primary_campus: e.target.value})}
                placeholder="e.g. Main Campus, City"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Additional Campuses</Label>
              <div className="flex gap-2">
                <Input
                  value={newCampus}
                  onChange={(e) => setNewCampus(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCampus()}
                  placeholder="Add a campus and press Enter"
                />
                <Button type="button" onClick={addCampus}>
                  Add
                </Button>
              </div>
              
              {newInstitution.additional_campuses.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {newInstitution.additional_campuses.map((campus, index) => (
                    <div key={index} className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                      <span>{campus}</span>
                      <button 
                        type="button"
                        onClick={() => removeCampus(campus)}
                        className="text-gray-500 hover:text-red-500"
                        aria-label={`Remove campus ${campus}`}
                        title={`Remove ${campus}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin_email">Admin Email *</Label>
              <Input
                id="admin_email"
                type="email"
                value={newInstitution.admin_email}
                onChange={(e) => setNewInstitution({...newInstitution, admin_email: e.target.value})}
                placeholder="admin@institution.edu"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddDialogOpen(false);
                setSelectedInstitution(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddInstitution}
              disabled={!newInstitution.name || !newInstitution.country || !newInstitution.primary_campus || !newInstitution.admin_email}
            >
              {selectedInstitution ? 'Update Institution' : 'Add Institution'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Institutions</DialogTitle>
            <DialogDescription>
              Export the current list of institutions to {exportFormat.toUpperCase()} format.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Format</Label>
              <Select 
                value={exportFormat}
                onValueChange={(value: 'csv' | 'pdf' | 'json') => setExportFormat(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel compatible)</SelectItem>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="json">JSON (Raw data)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredInstitutions.length} institutions will be exported.
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export {exportFormat.toUpperCase()}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Filter Dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Filter Institutions</DialogTitle>
            <DialogDescription>
              Filter the list of institutions by type and status.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Institution Type</Label>
              <Select 
                value={selectedType}
                onValueChange={setSelectedType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="University">University</SelectItem>
                  <SelectItem value="College">College</SelectItem>
                  <SelectItem value="Institute">Institute</SelectItem>
                  <SelectItem value="School">School</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedType('all');
                setStatusFilter('all');
              }}
            >
              Reset Filters
            </Button>
            <Button onClick={() => setIsFilterDialogOpen(false)}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Institution Details Dialog */}
      <Dialog open={!!selectedInstitution} onOpenChange={(open) => !open && setSelectedInstitution(null)}>
        {selectedInstitution && (
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedInstitution.name}</DialogTitle>
              <DialogDescription>
                {selectedInstitution.type} • {selectedInstitution.country}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <h3 className="font-medium">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Admin Email</p>
                    <p>{selectedInstitution.admin_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge variant={selectedInstitution.status === 'active' ? 'default' : 'secondary'}>
                      {selectedInstitution.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Campuses</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">Primary:</span>
                    <span>{selectedInstitution.primary_campus}</span>
                  </div>
                  
                  {selectedInstitution.additional_campuses.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Additional Campuses:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedInstitution.additional_campuses.map((campus: string, index: number) => (
                          <li key={index}>{campus}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <Users className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                    <p className="text-lg font-bold">{selectedInstitution.total_students.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <GraduationCap className="h-5 w-5 mx-auto mb-1 text-green-500" />
                    <p className="text-lg font-bold">{selectedInstitution.total_faculty.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Faculty</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <BookOpen className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                    <p className="text-lg font-bold">{selectedInstitution.total_courses.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Courses</p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>Created on {new Date(selectedInstitution.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedInstitution(null)}>
                Close
              </Button>
              <Button 
                onClick={() => {
                  setNewInstitution({
                    name: selectedInstitution.name,
                    type: selectedInstitution.type,
                    country: selectedInstitution.country,
                    primary_campus: selectedInstitution.primary_campus,
                    additional_campuses: [...selectedInstitution.additional_campuses],
                    admin_email: selectedInstitution.admin_email,
                    status: selectedInstitution.status as 'active' | 'inactive' | 'suspended'
                  });
                  setSelectedInstitution(null);
                  setIsAddDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Institution
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminInstitutions;