'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  Save,
  Bell,
  Shield,
  Database,
  Mail,
  Smartphone,
  Globe,
  Download,
  Clock,
  Users,
  Building2,
  Key
} from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    // General Settings
    institutionName: 'Tech University',
    timezone: 'America/New_York',
    academicYear: '2024-2025',
    defaultSessionDuration: 90,
    
    // Attendance Settings
    lateThreshold: 15,
    autoMarkAbsent: true,
    qrCodeExpiry: 30,
    locationVerification: false,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    notificationFrequency: 'immediate',
    
    // Security Settings
    sessionTimeout: 30,
    passwordPolicy: 'medium',
    twoFactorAuth: false,
    ipWhitelist: '',
    
    // System Settings
    maintenanceMode: false,
    debugMode: false,
    dataRetention: 365,
    backupFrequency: 'daily'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real app, this would be an API call to trigger a backup
      console.log('Backup process started');
      
      // Create a download link for the backup file
      const backupData = {
        timestamp: new Date().toISOString(),
        settings,
        status: 'completed'
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartattend-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Backup completed and downloaded successfully!');
    } catch (error) {
      console.error('Backup failed:', error);
      toast.error('Failed to create backup');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, this would fetch data from the API
      const exportData = {
        timestamp: new Date().toISOString(),
        settings,
        // Add other system data as needed
        systemInfo: {
          version: '1.0.0',
          lastBackup: new Date().toISOString(),
          totalUsers: 0, // This would come from your API
          totalSessions: 0 // This would come from your API
        }
      };
      
      // Create and trigger download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartattend-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('System data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export system data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DashboardLayout title="System Settings">
      <div className="space-y-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              System Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configure system-wide settings and preferences
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
          {/* General Settings */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="institution-name">Institution Name</Label>
                <Input
                  id="institution-name"
                  value={settings.institutionName}
                  onChange={(e) => handleSettingChange('institutionName', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academic-year">Academic Year</Label>
                <Input
                  id="academic-year"
                  value={settings.academicYear}
                  onChange={(e) => handleSettingChange('academicYear', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="session-duration">Default Session Duration (minutes)</Label>
                <Input
                  id="session-duration"
                  type="number"
                  value={settings.defaultSessionDuration}
                  onChange={(e) => handleSettingChange('defaultSessionDuration', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Attendance Settings */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Attendance Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="late-threshold">Late Threshold (minutes)</Label>
                <Input
                  id="late-threshold"
                  type="number"
                  value={settings.lateThreshold}
                  onChange={(e) => handleSettingChange('lateThreshold', parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-mark Absent</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatically mark students absent after session ends
                  </p>
                </div>
                <Switch
                  checked={settings.autoMarkAbsent}
                  onCheckedChange={(checked) => handleSettingChange('autoMarkAbsent', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qr-expiry">QR Code Expiry (minutes)</Label>
                <Input
                  id="qr-expiry"
                  type="number"
                  value={settings.qrCodeExpiry}
                  onChange={(e) => handleSettingChange('qrCodeExpiry', parseInt(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Location Verification</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Verify student location when marking attendance
                  </p>
                </div>
                <Switch
                  checked={settings.locationVerification}
                  onCheckedChange={(checked) => handleSettingChange('locationVerification', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
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
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label>Push Notifications</Label>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Notification Frequency</Label>
                <Select value={settings.notificationFrequency} onValueChange={(value) => handleSettingChange('notificationFrequency', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Summary</SelectItem>
                    <SelectItem value="weekly">Weekly Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session-timeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Password Policy</Label>
                <Select value={settings.passwordPolicy} onValueChange={(value) => handleSettingChange('passwordPolicy', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic (6+ characters)</SelectItem>
                    <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                    <SelectItem value="strong">Strong (12+ chars, symbols)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Require 2FA for admin accounts
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ip-whitelist">IP Whitelist (optional)</Label>
                <Textarea
                  id="ip-whitelist"
                  placeholder="Enter IP addresses, one per line"
                  value={settings.ipWhitelist}
                  onChange={(e) => handleSettingChange('ipWhitelist', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Maintenance */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Temporarily disable system access
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => handleSettingChange('maintenanceMode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Debug Mode</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enable detailed logging
                    </p>
                  </div>
                  <Switch
                    checked={settings.debugMode}
                    onCheckedChange={(checked) => handleSettingChange('debugMode', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data-retention">Data Retention (days)</Label>
                  <Input
                    id="data-retention"
                    type="number"
                    value={settings.dataRetention}
                    onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Select value={settings.backupFrequency} onValueChange={(value) => handleSettingChange('backupFrequency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleBackupNow}
                    disabled={isBackingUp}
                  >
                    {isBackingUp ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Backing Up...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Backup Now
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleExportData}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Export System Data
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;