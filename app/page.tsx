'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  QrCode, 
  Users, 
  BarChart3, 
  Shield, 
  Clock, 
  Smartphone,
  CheckCircle2,
  ArrowRight,
  Zap,
  Globe,
  UserCog,
  GraduationCap,
  UserCheck,
  ArrowUpRight
} from 'lucide-react';

const DemoAccountCard = ({ role, description, icon: Icon, onClick }: { 
  role: string; 
  description: string; 
  icon: React.ElementType; 
  onClick: () => void 
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700 flex flex-col">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
        Demo Account
      </span>
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{role}</h3>
    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-grow">{description}</p>
    <Button 
      onClick={onClick}
      variant="outline" 
      className="w-full mt-auto group"
    >
      Try as {role}
      <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Button>
  </div>
);

export default function Home() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = React.useState<string | null>(null);

  const handleDemoLogin = async (role: 'admin' | 'faculty' | 'student') => {
    setIsLoading(role);
    const demoCredentials = {
      admin: { username: 'admin001', password: 'admin123' },
      faculty: { username: 'prof.smith', password: 'faculty123' },
      student: { username: 'john.doe', password: 'student123' }
    };

    const { username, password } = demoCredentials[role];
    const success = await login(username, password);
    
    if (success) {
      toast.success(`Logged in as demo ${role}!`);
      router.push('/dashboard');
    } else {
      toast.error('Failed to log in with demo account');
      setIsLoading(null);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <QrCode className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SmartAttend
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6">
            <Zap className="h-4 w-4 mr-2" />
            Modern Attendance Management
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Attendance Made
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Simple & Smart
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            Transform your institution&apos;s attendance tracking with QR code technology. 
            Fast, secure, and effortless attendance management for the modern classroom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 h-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-2">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Demo Accounts Section */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Try Demo Accounts
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Experience SmartAttend with our pre-configured demo accounts
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <DemoAccountCard
                role="Admin"
                description="Full system access to manage users, courses, and view analytics."
                icon={UserCog}
                onClick={() => handleDemoLogin('admin')}
              />
              <DemoAccountCard
                role="Faculty"
                description="Manage your classes, take attendance, and track student progress."
                icon={GraduationCap}
                onClick={() => handleDemoLogin('faculty')}
              />
              <DemoAccountCard
                role="Student"
                description="View your attendance records and class schedules in one place."
                icon={UserCheck}
                onClick={() => handleDemoLogin('student')}
              />
            </div>
            
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
              Note: Demo accounts reset every hour. All data is for demonstration purposes only.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose SmartAttend?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful features designed to make attendance tracking seamless for everyone
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="bg-blue-100 dark:bg-blue-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <QrCode className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              QR Code Technology
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Scan and mark attendance in seconds. No manual entry, no errors, just quick and accurate tracking.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="bg-purple-100 dark:bg-purple-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Clock className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Real-Time Tracking
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Monitor attendance as it happens. Get instant updates and notifications for every session.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="bg-green-100 dark:bg-green-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <BarChart3 className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Advanced Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive reports and insights to track patterns, trends, and student engagement.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="bg-orange-100 dark:bg-orange-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Shield className="h-7 w-7 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Secure & Reliable
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Enterprise-grade security with role-based access control and encrypted data storage.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="bg-pink-100 dark:bg-pink-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Smartphone className="h-7 w-7 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Mobile Friendly
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Works seamlessly on any device. Mark attendance from your phone, tablet, or computer.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-700">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Users className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Multi-Role Support
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Tailored dashboards for admins, faculty, and students with role-specific features.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Three simple steps to revolutionize your attendance management
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              1
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Create Session
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Faculty creates an attendance session and generates a unique QR code for the class.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              2
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Students Scan
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Students scan the QR code using their mobile devices to mark their attendance instantly.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-gradient-to-br from-pink-500 to-orange-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              3
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Track & Analyze
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              View real-time attendance data and generate comprehensive reports with detailed analytics.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Attendance System?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of institutions already using SmartAttend to streamline their attendance management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-6 h-auto font-semibold">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-2 border-white text-white hover:bg-white/10">
                Sign In Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <QrCode className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SmartAttend
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 max-w-md">
                Modern QR-based attendance management system for educational institutions. 
                Making attendance tracking simple, secure, and efficient.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Register
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Features</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  QR Code Scanning
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Real-time Tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Analytics & Reports
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center text-gray-600 dark:text-gray-300">
            <p>&copy; {new Date().getFullYear()} SmartAttend. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
