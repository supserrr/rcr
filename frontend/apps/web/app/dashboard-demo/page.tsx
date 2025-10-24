import React, { useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { 
  Users, 
  UserCheck, 
  Shield, 
  ArrowRight,
  Heart,
  MessageCircle,
  Calendar,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardDemo() {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'counselor' | 'admin' | null>(null);

  const roles = [
    {
      id: 'patient',
      title: 'Patient Dashboard',
      description: 'Access your learning modules, connect with counselors, and track your progress',
      icon: Users,
      color: 'bg-blue-500',
      features: [
        'Module progress tracking',
        'Counselor directory',
        'Educational resources',
        'Session scheduling',
        'AI chat support',
        'Personal settings'
      ],
      stats: [
        { label: 'Current Module', value: 'Coping with Anxiety' },
        { label: 'Progress', value: '65%' },
        { label: 'Upcoming Sessions', value: '2' },
        { label: 'Resources Completed', value: '8' }
      ]
    },
    {
      id: 'counselor',
      title: 'Counselor Dashboard',
      description: 'Manage your patients, schedule sessions, and access professional resources',
      icon: UserCheck,
      color: 'bg-green-500',
      features: [
        'Patient management',
        'Session scheduling',
        'Resource library',
        'Progress tracking',
        'Professional AI assistant',
        'Communication tools'
      ],
      stats: [
        { label: 'Active Patients', value: '3' },
        { label: 'Upcoming Sessions', value: '2' },
        { label: 'Rating', value: '4.8/5' },
        { label: 'Experience', value: '8 years' }
      ]
    },
    {
      id: 'admin',
      title: 'Admin Dashboard',
      description: 'Oversee platform operations, manage users, and monitor system health',
      icon: Shield,
      color: 'bg-purple-500',
      features: [
        'User management',
        'Support ticket system',
        'System monitoring',
        'Platform settings',
        'Analytics & reports',
        'Security controls'
      ],
      stats: [
        { label: 'Total Users', value: '156' },
        { label: 'Active Sessions', value: '12' },
        { label: 'Support Tickets', value: '5' },
        { label: 'System Health', value: '100%' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">Rwanda Cancer Relief</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">Role-Based Dashboard Interface</p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            A comprehensive platform supporting cancer patients, counselors, and administrators 
            with tailored interfaces for each user role.
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card 
                key={role.id} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedRole === role.id ? 'ring-2 ring-blue-500 shadow-lg' : ''
                }`}
                onClick={() => setSelectedRole(role.id as any)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${role.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{role.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {role.stats.map((stat, index) => (
                        <div key={index} className="text-center p-2 bg-muted rounded">
                          <p className="text-sm font-medium">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Key Features:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {role.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-current rounded-full" />
                            {feature}
                          </li>
                        ))}
                        {role.features.length > 3 && (
                          <li className="text-xs text-muted-foreground">
                            +{role.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Selected Role Details */}
        {selectedRole && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${roles.find(r => r.id === selectedRole)?.color} rounded-lg flex items-center justify-center`}>
                    {React.createElement(roles.find(r => r.id === selectedRole)?.icon || Users, { className: "h-5 w-5 text-white" })}
                  </div>
                  <div>
                    <CardTitle>{roles.find(r => r.id === selectedRole)?.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {roles.find(r => r.id === selectedRole)?.description}
                    </p>
                  </div>
                </div>
                <Link href={`/dashboard/${selectedRole}`}>
                  <Button>
                    View Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">Available Features</h4>
                  <div className="grid gap-2">
                    {roles.find(r => r.id === selectedRole)?.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Current Statistics</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {roles.find(r => r.id === selectedRole)?.stats.map((stat, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg text-center">
                        <p className="text-lg font-semibold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Technology Stack */}
        <Card>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">R</span>
                </div>
                <p className="font-medium">React</p>
                <p className="text-xs text-muted-foreground">Frontend Framework</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-gray-800 rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">N</span>
                </div>
                <p className="font-medium">Next.js</p>
                <p className="text-xs text-muted-foreground">React Framework</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-cyan-500 rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">T</span>
                </div>
                <p className="font-medium">Tailwind CSS</p>
                <p className="text-xs text-muted-foreground">Styling</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-gray-900 rounded mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">S</span>
                </div>
                <p className="font-medium">shadcn/ui</p>
                <p className="text-xs text-muted-foreground">Component Library</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Ready to explore? Choose a role above or access directly:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/dashboard/patient">
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Patient Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/counselor">
              <Button variant="outline" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Counselor Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/admin">
              <Button variant="outline" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
