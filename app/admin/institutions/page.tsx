'use client';

import React, { useState } from 'react';
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
  Calendar,
  TrendingUp,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';
import { mockInstitutions } from '@/lib/mock-data';

const AdminInstitutions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const filteredInstitutions = mockInstitutions.filter(institution => {
    const matchesSearch = institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institution.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         institution.primary_campus.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || institution.type === selectedType;
    
    return matchesSearch && matchesType;
  });

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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
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
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
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
                          <span>{institution.country}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
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
                      <span className="text-gray-600 dark:text-gray-400">{institution.primary_campus}</span>
                    </div>
                    {institution.additional_campuses.length > 0 && (
                      <div className="text-sm">
                        <span className="font-medium">Additional Campuses:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {institution.additional_campuses.map((campus, index) => (
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
                        Since {new Date(institution.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Button size="sm">
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
    </DashboardLayout>
  );
};

export default AdminInstitutions;