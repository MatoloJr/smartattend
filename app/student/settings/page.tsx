'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Save,
  User,
  Bell,
  Clock,
  Camera,
  Mail,
  Smartphone,
  Eye,
  EyeOff,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const StudentSettings: React.FC = () => {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Profile Settings
    name: user?.name || '',
    email: user?.email || '',
    studentId: user?.student_id || '',
    program: user?.program || '',
    year: user?.year || 1,
    
    // Scanner Preferences
    cameraPreference: 'back',
    autoSubmitAttendance: false,
    vibrationFeedback: true,
    soundFeedback: true,
    
    // Notification Preferences
    emailNotifications: true,
    smsNotifications: false,
    attendanceReminders: true,
    apologyUpdates: true,
    gradeNotifications: true,
    
    // Privacy Settings
    profileVisibility: 'classmates',
    showAttendanceStats: true,
    allowPeerComparison: false,
    
    // Security
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Validate password change if attempted
      if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Settings saved successfully!');
      
      // Clear password fields
      setSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout title="Student Settings">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Student Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your profile and attendance preferences
            </p>
          </div>
          <Button onClick={saveSettings} disabled={isSaving}>
            {isSaving ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => handleSettingChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="student-id">Student ID</Label>
                <Input
                  id="student-id"
                  value={settings.studentId}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  value={settings.program}
                  onChange={(e) => handleSettingChange('program', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Academic Year</Label>
                <Select value={settings.year.toString()} onValueChange={(value) => handleSettingChange('year', parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Year 1</SelectItem>
                    <SelectItem value="2">Year 2</SelectItem>
                    <SelectItem value="3">Year 3</SelectItem>
                    <SelectItem value="4">Year 4</SelectItem>
                    <SelectItem value="5">Year 5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Scanner Preferences */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Scanner Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Camera Preference</Label>
                <Select value={settings.cameraPreference} onValueChange={(value) => handleSettingChange('cameraPreference', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="back">Back Camera</SelectItem>
                    <SelectItem value="front">Front Camera</SelectItem>
                    <SelectItem value="auto">Auto Select</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-submit Attendance</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically submit after successful scan
                  </p>
                </div>
                <Switch
                  checked={settings.autoSubmitAttendance}
                  onCheckedChange={(checked) => handleSettingChange('autoSubmitAttendance', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Vibration Feedback</Label>
                <Switch
                  checked={settings.vibrationFeedback}
                  onCheckedChange={(checked) => handleSettingChange('vibrationFeedback', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Sound Feedback</Label>
                <Switch
                  checked={settings.soundFeedback}
                  onCheckedChange={(checked) => handleSettingChange('soundFeedback', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <Label>Email Notifications</Label>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  <Label>SMS Notifications</Label>
                </div>
                <Switch
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Attendance Reminders</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get reminded about upcoming classes
                  </p>
                </div>
                <Switch
                  checked={settings.attendanceReminders}
                  onCheckedChange={(checked) => handleSettingChange('attendanceReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Apology Status Updates</Label>
                <Switch
                  checked={settings.apologyUpdates}
                  onCheckedChange={(checked) => handleSettingChange('apologyUpdates', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Grade Notifications</Label>
                <Switch
                  checked={settings.gradeNotifications}
                  onCheckedChange={(checked) => handleSettingChange('gradeNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Visibility</Label>
                <Select value={settings.profileVisibility} onValueChange={(value) => handleSettingChange('profileVisibility', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="classmates">Classmates Only</SelectItem>
                    <SelectItem value="faculty">Faculty Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Attendance Statistics</Label>
                <Switch
                  checked={settings.showAttendanceStats}
                  onCheckedChange={(checked) => handleSettingChange('showAttendanceStats', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Peer Comparison</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Let classmates see your attendance ranking
                  </p>
                </div>
                <Switch
                  checked={settings.allowPeerComparison}
                  onCheckedChange={(checked) => handleSettingChange('allowPeerComparison', checked)}
                />
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium">Change Password</h4>
                
                <div className="space-y-2">
                  <Label htmlFor="current-password-student">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password-student"
                      type={showPassword ? 'text' : 'password'}
                      value={settings.currentPassword}
                      onChange={(e) => handleSettingChange('currentPassword', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password-student">New Password</Label>
                  <Input
                    id="new-password-student"
                    type={showPassword ? 'text' : 'password'}
                    value={settings.newPassword}
                    onChange={(e) => handleSettingChange('newPassword', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password-student">Confirm New Password</Label>
                  <Input
                    id="confirm-password-student"
                    type={showPassword ? 'text' : 'password'}
                    value={settings.confirmPassword}
                    onChange={(e) => handleSettingChange('confirmPassword', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentSettings;