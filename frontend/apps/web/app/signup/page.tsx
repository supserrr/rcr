'use client'

// import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@workspace/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Heart, User, Shield } from 'lucide-react'

/**
 * Sign Up Page for Rwanda Cancer Relief Platform
 * 
 * Provides role selection for new users:
 * - Patient signup
 * - Counselor signup
 */
export default function SignUpPage() {
  const router = useRouter()

  const signupOptions = [
    {
      title: 'I&apos;m a Patient',
      description: 'I need counseling and emotional support for my cancer journey',
      icon: User,
      href: '/signup/patient',
      color: 'bg-blue-500',
      features: [
        'Access to trained counselors',
        '24/7 emotional support',
        'Culturally sensitive care',
        'Secure messaging platform'
      ]
    },
    {
      title: 'I&apos;m a Counselor',
      description: 'I want to provide counseling and support to cancer patients',
      icon: Shield,
      href: '/signup/counselor',
      color: 'bg-green-500',
      features: [
        'Connect with patients',
        'Flexible scheduling',
        'Professional resources',
        'Support community'
      ]
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Join Rwanda Cancer Relief</h1>
          <p className="text-muted-foreground mt-2">
            Choose your role to get started with our platform
          </p>
        </div>

        {/* Sign Up Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {signupOptions.map((option) => {
            const Icon = option.icon
            return (
              <Card key={option.title} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${option.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{option.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {option.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    onClick={() => router.push(option.href)}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <a
              href="/signin"
              className="text-primary hover:underline font-medium"
            >
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}