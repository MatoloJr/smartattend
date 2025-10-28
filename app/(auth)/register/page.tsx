'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { QrCode, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface InstitutionData {
  name: string;
  type: string;
  country: string;
  primaryCampus: string;
  additionalCampuses: string[];
}

interface UserData {
  username: string;
  role: string;
  institutionName: string;
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

const countries = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Japan', 'India', 'China', 'Brazil', 'South Africa', 'Other'
];

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  // Step 1: Institution Setup
  const [institutionData, setInstitutionData] = useState<InstitutionData>({
    name: '',
    type: '',
    country: '',
    primaryCampus: '',
    additionalCampuses: []
  });

  // Step 2: Email Verification  
  const [contactEmail, setContactEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Step 3: Account Creation
  const [userData, setUserData] = useState<UserData>({
    username: '',
    role: '',
    institutionName: '',
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });

  const addCampus = () => {
    setInstitutionData(prev => ({
      ...prev,
      additionalCampuses: [...prev.additionalCampuses, '']
    }));
  };

  const removeCampus = (index: number) => {
    setInstitutionData(prev => ({
      ...prev,
      additionalCampuses: prev.additionalCampuses.filter((_, i) => i !== index)
    }));
  };

  const updateCampus = (index: number, value: string) => {
    setInstitutionData(prev => ({
      ...prev,
      additionalCampuses: prev.additionalCampuses.map((campus, i) => 
        i === index ? value : campus
      )
    }));
  };

  const sendVerificationCode = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCodeSent(true);
    setCountdown(60);
    setIsLoading(false);
    toast.success('Verification code sent to your email');
    
    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return false;
    }
    
    setIsLoading(true);
    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    // For demo, accept any 6-digit code
    toast.success('Email verified successfully');
    return true;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionData.name || !institutionData.type || !institutionData.country || !institutionData.primaryCampus) {
      toast.error('Please fill in all required fields');
      return;
    }
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verified = await verifyCode();
    if (verified) {
      setUserData(prev => ({ 
        ...prev, 
        institutionName: institutionData.name,
        email: contactEmail
      }));
      setStep(3);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userData.password !== userData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (userData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    const success = await register({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      role: userData.role as any,
      name: userData.name,
      institution: institutionData.name,
      department: userData.role === 'faculty' ? 'Computer Science' : undefined
    });

    if (success) {
  toast.success('Account created successfully!');
  router.push('/login');
    } else {
      toast.error('Failed to create account');
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length < 6) return { strength: 'weak', color: 'red' };
    if (password.length < 8) return { strength: 'medium', color: 'yellow' };
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 'strong', color: 'green' };
    return { strength: 'medium', color: 'yellow' };
  };

  const passwordStrength = getPasswordStrength(userData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <QrCode className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                SmartAttend
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Institution Registration
              </p>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <div className={`w-8 h-1 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {step > 2 ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <div className={`w-8 h-1 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
        </div>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800">
          {/* Step 1: Institution Setup */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Institution Setup</CardTitle>
                  <ThemeToggle />
                </div>
                <CardDescription>
                  Tell us about your educational institution
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="institution-name">Institution Name *</Label>
                  <Input
                    id="institution-name"
                    placeholder="e.g., Tech University"
                    value={institutionData.name}
                    onChange={(e) => setInstitutionData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution-type">Institution Type *</Label>
                  <Select 
                    value={institutionData.type} 
                    onValueChange={(value) => setInstitutionData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="University">University</SelectItem>
                      <SelectItem value="College">College</SelectItem>
                      <SelectItem value="School">School</SelectItem>
                      <SelectItem value="Training Center">Training Center</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select 
                    value={institutionData.country} 
                    onValueChange={(value) => setInstitutionData(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary-campus">Primary Campus Location *</Label>
                  <Input
                    id="primary-campus"
                    placeholder="e.g., Main Campus, City Name"
                    value={institutionData.primaryCampus}
                    onChange={(e) => setInstitutionData(prev => ({ ...prev, primaryCampus: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Additional Branches/Campuses (Optional)</Label>
                  {institutionData.additionalCampuses.map((campus, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="Campus name"
                        value={campus}
                        onChange={(e) => updateCampus(index, e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCampus(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCampus}
                  >
                    Add Campus
                  </Button>
                </div>
              </CardContent>

              <div className="flex justify-between p-6">
                <Link href="/login">
                  <Button variant="ghost">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login
                  </Button>
                </Link>
                <Button type="submit">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Email Verification */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit}>
              <CardHeader>
                <CardTitle>Email Verification</CardTitle>
                <CardDescription>
                  Verify your institution's contact email
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="admin@yourinstitution.edu"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={sendVerificationCode}
                  disabled={!contactEmail || isLoading || countdown > 0}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend in ${countdown}s`
                  ) : codeSent ? (
                    'Resend Code'
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>

                {codeSent && (
                  <div className="space-y-2">
                    <Label htmlFor="verification-code">6-Digit Verification Code</Label>
                    <Input
                      id="verification-code"
                      placeholder="000000"
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setVerificationCode(value);
                      }}
                      maxLength={6}
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Check your email for the verification code (for demo, enter any 6 digits)
                    </p>
                  </div>
                )}
              </CardContent>

              <div className="flex justify-between p-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button type="submit" disabled={!codeSent || verificationCode.length !== 6}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Account Creation */}
          {step === 3 && (
            <form onSubmit={handleStep3Submit}>
              <CardHeader>
                <CardTitle>Create Your Account</CardTitle>
                <CardDescription>
                  Set up your administrator account
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    placeholder="admin001"
                    value={userData.username}
                    onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role/Access Level *</Label>
                  <Select 
                    value={userData.role} 
                    onValueChange={(value) => setUserData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Campus Admin</SelectItem>
                      <SelectItem value="faculty">Faculty Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name *</Label>
                  <Input
                    id="full-name"
                    placeholder="John Administrator"
                    value={userData.name}
                    onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution-name-readonly">Institution</Label>
                  <Input
                    id="institution-name-readonly"
                    value={institutionData.name}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-readonly">Email</Label>
                  <Input
                    id="email-readonly"
                    value={contactEmail}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="6-12 characters"
                    value={userData.password}
                    onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                    maxLength={12}
                  />
                  {userData.password && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`h-2 w-full rounded ${
                        passwordStrength.color === 'red' ? 'bg-red-200' :
                        passwordStrength.color === 'yellow' ? 'bg-yellow-200' :
                        'bg-green-200'
                      }`}>
                        <div className={`h-full rounded transition-all ${
                          passwordStrength.color === 'red' ? 'bg-red-500 w-1/3' :
                          passwordStrength.color === 'yellow' ? 'bg-yellow-500 w-2/3' :
                          'bg-green-500 w-full'
                        }`} />
                      </div>
                      <span className={
                        passwordStrength.color === 'red' ? 'text-red-600' :
                        passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                        'text-green-600'
                      }>
                        {passwordStrength.strength}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password *</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Repeat password"
                    value={userData.confirmPassword}
                    onChange={(e) => setUserData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                  {userData.confirmPassword && (
                    <p className={`text-xs ${
                      userData.password === userData.confirmPassword ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {userData.password === userData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>
              </CardContent>

              <div className="flex justify-between p-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Create Account
                </Button>
              </div>
            </form>
          )}
        </Card>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Already have an account? 
          </span>{' '}
          <Link 
            href="/login"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;