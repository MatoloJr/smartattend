'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { QrCode, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Campus {
  name: string;
  location: string;
  country: string;
}

interface InstitutionData {
  name: string;
  type: string;
  country: string;
  primaryCampus: Campus;
  additionalCampuses: Campus[];
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
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AG', name: 'Antigua and Barbuda' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CD', name: 'Congo (Democratic Republic)' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'CI', name: 'Ivory Coast' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KP', name: 'North Korea' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PS', name: 'Palestine' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'KN', name: 'Saint Kitts and Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'VC', name: 'Saint Vincent and the Grenadines' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome and Principe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' }
];

const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  // Step 1: Institution Setup
  const [institutionData, setInstitutionData] = useState<InstitutionData>(() => ({
    name: '',
    type: '',
    country: 'Kenya',
    primaryCampus: {
      name: '',
      location: '',
      country: 'Kenya',
    },
    additionalCampuses: [],
  }));

  // Ensure primaryCampus is always an object with required properties
  useEffect(() => {
    setInstitutionData(prev => ({
      ...prev,
      primaryCampus: {
        name: prev.primaryCampus?.name || '',
        location: prev.primaryCampus?.location || '',
        country: prev.primaryCampus?.country || prev.country || 'Kenya',
      }
    }));
  }, []); // Run once on mount
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const selectCountry = (countryName: string) => {
    setInstitutionData(prev => ({
      ...prev,
      country: countryName,
      primaryCampus: {
        ...prev.primaryCampus,
        country: countryName
      }
    }));
    setIsCountryOpen(false);
    setSearchTerm('');
  };

  // Step 2: Email Verification  
  const [contactEmail, setContactEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  
  // Generate a random 6-digit alphanumeric code (uppercase)
  const generateVerificationCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'; // Excluding easily confused characters
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log('Generated verification code:', result);
    return result;
  };
  
  // Handle verification code input with auto-capitalization and auto-verification
  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // Only allow alphanumeric characters and limit to 6 characters
    const filteredValue = value.replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setVerificationCode(filteredValue);
    
    // Auto-verify when 6 characters are entered
    if (filteredValue.length === 6) {
      verifyCode(filteredValue);
    }
  };
  
  // Verify the entered code
  const verifyCode = (code: string): Promise<boolean> => {
    if (!code || code.length !== 6) {
      return Promise.resolve(false);
    }
    
    setIsVerifying(true);
    // Simulate API call
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        const isValid = code === generatedCode;
        setIsCodeVerified(isValid);
        setIsVerifying(false);
        
        if (isValid) {
          toast.success('Email verified successfully!');
        } else if (code.length === 6) {
          toast.error('Invalid verification code');
        }
        
        resolve(isValid);
      }, 500);
    });
  };
  
  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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
      additionalCampuses: [
        ...prev.additionalCampuses, 
        { name: '', location: '', country: institutionData.country }
      ]
    }));
  };

  const removeCampus = (index: number) => {
    setInstitutionData(prev => ({
      ...prev,
      additionalCampuses: prev.additionalCampuses.filter((_, i) => i !== index)
    }));
  };

  const updateCampus = (index: number, field: 'name' | 'location' | 'country', value: string) => {
    setInstitutionData(prev => {
      const updatedCampuses = [...prev.additionalCampuses];
      updatedCampuses[index] = {
        ...updatedCampuses[index],
        [field]: value,
        ...(field === 'country' ? { country: value } : {})
      };
      return { ...prev, additionalCampuses: updatedCampuses };
    });
  };
  
  const updatePrimaryCampus = (field: keyof Campus, value: string) => {
    setInstitutionData(prev => {
      const updated = {
        ...prev,
        primaryCampus: {
          ...(prev.primaryCampus || {}),
          [field]: value,
        },
      };
      console.log('Updated primary campus:', updated.primaryCampus);
      return updated;
    });
  };

  const sendVerificationCode = async (isResend = false) => {
    if (!contactEmail) {
      toast.error('Please enter your email address');
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    // Generate new code
    const newCode = generateVerificationCode();
    setGeneratedCode(newCode);
    
    try {
      // Send the verification email
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: contactEmail,
          code: newCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send verification code');
      }
      
      setCodeSent(true);
      setCountdown(60);
      setVerificationCode('');
      setIsCodeVerified(false);
      
      if (isResend) {
        toast.success('New verification code sent!');
      } else {
        toast.success(`Verification code sent to ${contactEmail}`);
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast.error('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get form data directly from the form elements
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Get all form values
    const formValues = {
      institutionName: formData.get('institutionName') as string || '',
      institutionType: formData.get('institutionType') as string || '',
      country: formData.get('country') as string || '',
      primaryCampusName: formData.get('primaryCampusName') as string || '',
      primaryCampusLocation: formData.get('primaryCampusLocation') as string || '',
    };
    
    console.log('Form values:', formValues);
    
    // Update state with form values
    setInstitutionData(prev => ({
      ...prev,
      name: formValues.institutionName,
      type: formValues.institutionType,
      country: formValues.country,
      primaryCampus: {
        name: formValues.primaryCampusName,
        location: formValues.primaryCampusLocation,
        country: formValues.country, // Use the same country as institution
      },
    }));
    
    // Validate required fields
    const requiredFields = [
      { name: 'Institution Name', value: formValues.institutionName },
      { name: 'Institution Type', value: formValues.institutionType },
      { name: 'Country', value: formValues.country },
      { name: 'Campus Name', value: formValues.primaryCampusName },
      { name: 'Campus Location', value: formValues.primaryCampusLocation }
    ];
    
    const missingFields = requiredFields.filter(field => !field.value.trim());
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      toast.error(`Please fill in: ${missingFields.map(f => f.name).join(', ')}`);
      return;
    }
    
    // If we got here, all validations passed
    console.log('All validations passed, proceeding to step 2');
    setStep(2);
  };

  // Close country dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isCountryOpen && !target.closest('.country-selector')) {
        setIsCountryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCountryOpen]);

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit verification code');
      return;
    }

    const verified = await verifyCode(verificationCode);
    if (verified) {
      setUserData(prev => ({ 
        ...prev, 
        institutionName: institutionData.name,
        email: contactEmail
      }));
      // Auto-continue to next step after verification
      setStep(3);
    } else {
      toast.error('Invalid verification code. Please try again.');
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const requiredFields = [
      { name: 'Username', value: userData.username },
      { name: 'Role', value: userData.role },
      { name: 'Full Name', value: userData.name },
      { name: 'Password', value: userData.password },
      { name: 'Confirm Password', value: userData.confirmPassword }
    ];
    
    const missingFields = requiredFields.filter(field => !field.value.trim());
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      toast.error(`Please fill in: ${missingFields.map(f => f.name).join(', ')}`);
      return;
    }
    
    if (userData.password !== userData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (userData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Extract domain from email or use a default
    const emailDomain = userData.email.split('@')[1] || '';
    
    // Prepare the request payload
    const payload = {
      email: userData.email,
      password: userData.password,
      name: userData.name,
      institutionName: institutionData.name,
      institutionDomain: emailDomain
    };
    
    console.log('Submitting registration:', payload);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Registration failed:', data);
        throw new Error(data.error || 'Registration failed');
      }
      
      console.log('Registration successful:', data);
      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/login');
      
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account. Please try again.';
      toast.error(errorMessage);
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
          <Card className="w-full max-w-3xl mx-auto">
            <form onSubmit={handleStep1Submit} id="institution-form">
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
                    name="institutionName"
                    placeholder="e.g., University of Nairobi"
                    value={institutionData.name}
                    onChange={(e) => setInstitutionData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    aria-required="true"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution-type">Institution Type *</Label>
                  <Select 
                    name="institutionType"
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
                  <div className="relative">
                    <Input
                      id="country"
                      name="country"
                      placeholder="Search or select country"
                      value={searchTerm || institutionData.country}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!isCountryOpen) setIsCountryOpen(true);
                        setInstitutionData(prev => ({
                          ...prev,
                          country: e.target.value,
                          primaryCampus: {
                            ...prev.primaryCampus,
                            country: e.target.value
                          }
                        }));
                      }}
                      onFocus={() => setIsCountryOpen(true)}
                      onClick={() => setIsCountryOpen(true)}
                      required
                      aria-required="true"
                      className="w-full"
                    />
                    {isCountryOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((country) => (
                            <div
                              key={country.code}
                              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              onClick={() => selectCountry(country.name)}
                            >
                              {country.name}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No countries found</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Primary Campus *</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="primary-campus-name">Campus Name *</Label>
                      <Input
                        id="primary-campus-name"
                        name="primaryCampusName"
                        placeholder="e.g., Main Campus"
                        value={institutionData.primaryCampus?.name || ''}
                        onChange={(e) => {
                          console.log('Updating campus name:', e.target.value);
                          updatePrimaryCampus('name', e.target.value);
                        }}
                        required
                        aria-required="true"
                        className="w-full"
                      />
                      {!institutionData.primaryCampus?.name?.trim() && (
                        <p className="text-xs text-red-500 mt-1">Campus name is required</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="primary-campus-location">Location (City) *</Label>
                      <Input
                        id="primary-campus-location"
                        name="primaryCampusLocation"
                        placeholder="e.g., Nairobi"
                        value={institutionData.primaryCampus?.location || ''}
                        onChange={(e) => {
                          console.log('Updating campus location:', e.target.value);
                          updatePrimaryCampus('location', e.target.value);
                        }}
                        required
                        aria-required="true"
                        className="w-full"
                      />
                      {!institutionData.primaryCampus?.location?.trim() && (
                        <p className="text-xs text-red-500 mt-1">Campus location is required</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Campuses (Optional)</Label>
                  {institutionData.additionalCampuses.map((campus, index) => (
                    <div key={index} className="space-y-2 p-4 border rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor={`additional-campus-name-${index}`}>Name</Label>
                          <Input
                            id={`additional-campus-name-${index}`}
                            placeholder="Campus name"
                            value={campus.name}
                            onChange={(e) => updateCampus(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`additional-campus-location-${index}`}>Location (City)</Label>
                          <Input
                            id={`additional-campus-location-${index}`}
                            placeholder="e.g., Mombasa"
                            value={campus.location}
                            onChange={(e) => updateCampus(index, 'location', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="w-1/2 pr-2">
                          <Label htmlFor={`additional-campus-country-${index}`}>Country</Label>
                          <Select
                            value={campus.country || institutionData.country}
                            onValueChange={(value) => updateCampus(index, 'country', value)}
                          >
                            <SelectTrigger id={`additional-campus-country-${index}`}>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map(country => (
                                <SelectItem key={country.code} value={country.name}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="mt-6"
                          onClick={() => removeCampus(index)}
                        >
                          Remove Campus
                        </Button>
                      </div>
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
                <Button 
                  type="submit" 
                  form="institution-form"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Continue'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Card>
        </Card>

        {/* Step 2: Email Verification */}
        {step === 2 && (
          <Card>
            <form onSubmit={handleStep2Submit}>
              <CardHeader>
                <CardTitle>Email Verification</CardTitle>
                <CardDescription>Enter your email and we&apos;ll send you a verification code</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      disabled={codeSent}
                      required
                    />
                    <Button
                      type="button"
                      onClick={() => sendVerificationCode(false)}
                      disabled={!contactEmail || isLoading || (codeSent && countdown > 0)}
                      className="w-32"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : countdown > 0 ? (
                        `Resend (${countdown})`
                      ) : (
                        'Send Code'
                      )}
                    </Button>
                  </div>
                </div>

                {codeSent && (
                  <div className="space-y-2">
                    <Label htmlFor="verificationCode">Verification Code</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="verificationCode"
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={handleVerificationCodeChange}
                        className="text-center text-lg font-mono tracking-widest uppercase"
                        maxLength={6}
                        autoComplete="one-time-code"
                        disabled={isCodeVerified}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => sendVerificationCode(true)}
                        disabled={isLoading || countdown > 0}
                        className="w-32"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : countdown > 0 ? (
                          `Resend (${countdown})`
                        ) : (
                          'Resend Code'
                        )}
                      </Button>
                    </div>
                    {isVerifying && (
                      <p className="text-sm text-muted-foreground">Verifying code...</p>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-6">
                <Button type="submit" className="w-full">
                  {isVerifying ? 'Verifying...' : 'Continue'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Step 3: Account Creation */}
        {step === 3 && (
          <Card className="w-full max-w-3xl mx-auto">
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

              <CardFooter className="flex justify-between p-6">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  type="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Create Account
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

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