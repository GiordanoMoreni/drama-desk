import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Theater, Users, Calendar, Star, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  // Check authentication - but don't redirect, show landing page for all users
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error('Error checking authentication:', error);
    user = null;
  }

  // Always show landing page - authenticated users can still see it
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Theater className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Drama Desk</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/organizations/select">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <Link href="/admin">
                    <Button>Admin Panel</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Badge variant="secondary" className="px-4 py-2">
                <Sparkles className="h-4 w-4 mr-2" />
                Theatre Management Made Simple
              </Badge>
            </div>
            {user ? (
              <>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Welcome back to
                  <span className="text-blue-600 block">Drama Desk</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Continue managing your theatre operations. Access your dashboard to manage
                  students, classes, shows, and productions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/organizations/select">
                    <Button size="lg" className="text-lg px-8 py-3">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/admin">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                      Admin Panel
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Manage Your Theatre
                  <span className="text-blue-600 block">Like a Pro</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Drama Desk is the complete multi-tenant SaaS solution for theatre associations.
                  Manage students, classes, shows, and productions with ease.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button size="lg" className="text-lg px-8 py-3">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                      Sign In
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Theatre Management
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From student enrollment to curtain call, manage every aspect of your theatre operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Student Management</CardTitle>
                <CardDescription>
                  Track student information, emergency contacts, and enrollment history.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Class Scheduling</CardTitle>
                <CardDescription>
                  Create and manage classes with flexible scheduling and capacity management.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Theater className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Production Management</CardTitle>
                <CardDescription>
                  Plan shows, assign roles, and track casting decisions with ease.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Theatre Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of theatre professionals who trust Drama Desk to manage their productions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Start Your Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
                Sign In to Your Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Theater className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Drama Desk</span>
            </div>
            <div className="flex space-x-6">
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="text-gray-400 hover:text-white transition-colors">
                Register
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Drama Desk. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
