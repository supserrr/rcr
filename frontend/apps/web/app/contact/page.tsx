'use client';

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Badge } from '@workspace/ui/components/badge';
import { Navbar } from "@workspace/ui/components/ui/mini-navbar";
import { Footer } from '@workspace/ui/components/ui/footer';
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  IconMapPin, 
  IconPhone, 
  IconMail, 
  IconClock,
  IconSend
} from '@tabler/icons-react';
import { useState } from 'react';

/**
 * Contact page component
 */
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-48 pb-16 px-6 lg:px-12 bg-background">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-jakarta-sans text-4xl lg:text-6xl font-semibold text-foreground mb-6 drop-shadow-lg">
            Get in Touch
          </h1>
          <p className="font-jakarta-sans text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            We're here to help and support you. Reach out to us for any questions, concerns, or support you may need on your journey.
          </p>
        </div>
      </section>

      {/* Contact Form Section - Priority */}
      <section className="py-16 px-6 lg:px-12 bg-muted/20">
        <div className="max-w-4xl mx-auto">
          <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20">
            <CardContent className="relative p-8">
              {/* Decorative gradient blob */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h2 className="font-jakarta-sans text-3xl lg:text-4xl font-semibold text-foreground mb-6 drop-shadow-lg">
                    Send us a Message
                  </h2>
                  <p className="font-jakarta-sans text-lg text-muted-foreground max-w-2xl mx-auto">
                    Fill out the form below and we'll get back to you as soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block font-jakarta-sans text-sm font-medium text-foreground mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block font-jakarta-sans text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block font-jakarta-sans text-sm font-medium text-foreground mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="What is this about?"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block font-jakarta-sans text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <div className="text-center">
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-jakarta-sans font-medium px-8 py-3 rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto"
                    >
                      <IconSend className="w-4 h-4" />
                      Send Message
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-16 px-6 lg:px-12 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-jakarta-sans text-3xl lg:text-4xl font-semibold text-foreground mb-6 drop-shadow-lg">
              Get in Touch
            </h2>
            <p className="font-jakarta-sans text-lg text-muted-foreground max-w-3xl mx-auto">
              We're here to support you. Choose the most convenient way to reach us.
            </p>
          </div>

          {/* Main Contact Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            
            {/* Location Card - Larger */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 rounded-3xl border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="relative p-8">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/15 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/15 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center">
                      <IconMapPin className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-jakarta-sans text-2xl font-semibold text-foreground">
                        Visit Our Office
                      </h3>
                      <p className="font-jakarta-sans text-muted-foreground">
                        We're located in the heart of Kigali
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-jakarta-sans font-medium text-foreground">Kigali, Rwanda</p>
                        <p className="font-jakarta-sans text-sm text-muted-foreground">Near King Faisal Hospital</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-jakarta-sans font-medium text-foreground">Easy Access</p>
                        <p className="font-jakarta-sans text-sm text-muted-foreground">Public transport and parking available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Methods Card - Larger */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 rounded-3xl border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
              <CardContent className="relative p-8">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/15 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/15 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10">
                  <h3 className="font-jakarta-sans text-2xl font-semibold text-foreground mb-6">
                    Contact Methods
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Phone */}
                    <div className="flex items-center gap-4 p-4 bg-background/50 rounded-2xl border border-primary/10">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <IconPhone className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-jakarta-sans font-medium text-foreground">Phone</p>
                        <div className="space-y-1">
                          <p className="font-jakarta-sans text-sm text-muted-foreground">+250 788 123 456</p>
                          <p className="font-jakarta-sans text-sm text-muted-foreground">+250 788 789 012</p>
                        </div>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-4 p-4 bg-background/50 rounded-2xl border border-primary/10">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <IconMail className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-jakarta-sans font-medium text-foreground">Email</p>
                        <div className="space-y-1">
                          <p className="font-jakarta-sans text-sm text-muted-foreground">info@rwandacancerrelief.org</p>
                          <p className="font-jakarta-sans text-sm text-muted-foreground">support@rwandacancerrelief.org</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Office Hours Card - Full Width */}
          <Card className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-background to-primary/5 rounded-3xl border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardContent className="relative p-8">
              {/* Decorative gradient blob */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-0"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-0"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <IconClock className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-jakarta-sans text-2xl font-semibold text-foreground">
                        Office Hours
                      </h3>
                      <p className="font-jakarta-sans text-muted-foreground">
                        We're available during these times
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-background/50 rounded-xl border border-primary/10">
                      <p className="font-jakarta-sans font-semibold text-foreground mb-1">Weekdays</p>
                      <p className="font-jakarta-sans text-sm text-muted-foreground">Monday - Friday</p>
                      <p className="font-jakarta-sans text-sm font-medium text-primary">8:00 AM - 5:00 PM</p>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-xl border border-primary/10">
                      <p className="font-jakarta-sans font-semibold text-foreground mb-1">Saturday</p>
                      <p className="font-jakarta-sans text-sm text-muted-foreground">Limited Hours</p>
                      <p className="font-jakarta-sans text-sm font-medium text-primary">9:00 AM - 1:00 PM</p>
                    </div>
                    <div className="text-center p-4 bg-background/50 rounded-xl border border-primary/10">
                      <p className="font-jakarta-sans font-semibold text-foreground mb-1">Sunday</p>
                      <p className="font-jakarta-sans text-sm text-muted-foreground">Closed</p>
                      <p className="font-jakarta-sans text-sm font-medium text-muted-foreground">Emergency only</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section className="py-16 px-6 lg:px-12 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-jakarta-sans text-3xl lg:text-4xl font-semibold text-foreground mb-6 drop-shadow-lg">
              Need Immediate Support?
            </h2>
            <p className="font-jakarta-sans text-lg text-muted-foreground max-w-3xl mx-auto">
              If you're experiencing a crisis or need immediate emotional support, please don't hesitate to reach out.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="relative overflow-hidden bg-gradient-to-br from-red-500/5 via-background to-red-500/10 rounded-3xl border-red-500/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="relative p-8 text-center">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconPhone className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="font-jakarta-sans text-xl font-semibold text-foreground mb-4">
                    Emergency Hotline
                  </h3>
                  <p className="font-jakarta-sans text-muted-foreground mb-6">
                    Available 24/7 for immediate support and crisis intervention.
                  </p>
                  <Button 
                    asChild
                    className="bg-red-500 hover:bg-red-600 text-white font-jakarta-sans font-medium px-6 py-3 rounded-lg transition-all duration-200"
                  >
                    <a href="tel:+250788123456">
                      Call Now: +250 788 123 456
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="relative p-8 text-center">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconMail className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-jakarta-sans text-xl font-semibold text-foreground mb-4">
                    Crisis Email Support
                  </h3>
                  <p className="font-jakarta-sans text-muted-foreground mb-6">
                    Send us an urgent message and we'll respond within 2 hours.
                  </p>
                  <Button 
                    asChild
                    variant="outline"
                    className="font-jakarta-sans font-medium px-6 py-3 rounded-lg transition-all duration-200"
                  >
                    <a href="mailto:crisis@rwandacancerrelief.org">
                      Email Crisis Support
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        logo={
          <div className="relative w-8 h-8 flex items-center justify-center">
            <span className="absolute w-2 h-2 rounded-full bg-primary top-0 left-1/2 transform -translate-x-1/2"></span>
            <span className="absolute w-2 h-2 rounded-full bg-primary left-0 top-1/2 transform -translate-y-1/2"></span>
            <span className="absolute w-2 h-2 rounded-full bg-primary right-0 top-1/2 transform -translate-y-1/2"></span>
            <span className="absolute w-2 h-2 rounded-full bg-primary bottom-0 left-1/2 transform -translate-x-1/2"></span>
          </div>
        }
        brandName="Rwanda Cancer Relief"
        mainLinks={[
          { href: "/counselors", label: "Find a Counselor" },
          { href: "/about", label: "About Us" },
          { href: "/resources", label: "Resources" },
          { href: "/contact", label: "Contact" },
          { href: "/signin", label: "Sign In" },
          { href: "/signup/patient", label: "Patient Sign Up" },
          { href: "/signup/counselor", label: "Counselor Sign Up" }
        ]}
        legalLinks={[
          { href: "/privacy", label: "Privacy Policy" },
          { href: "/terms", label: "Terms of Service" }
        ]}
        socialLinks={[
          { 
            label: "Facebook", 
            href: "https://facebook.com/rwandacancerrelief",
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          },
          { 
            label: "Twitter", 
            href: "https://twitter.com/rwandacancerrelief",
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
          },
          { 
            label: "Instagram", 
            href: "https://instagram.com/rwandacancerrelief",
            icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281h-1.297v1.297h1.297V7.707zm-5.543 1.297c.718 0 1.297.579 1.297 1.297s-.579 1.297-1.297 1.297-1.297-.579-1.297-1.297.579-1.297 1.297-1.297z"/></svg>
          }
        ]}
        copyright={{
          text: "© 2025 Rwanda Cancer Relief",
          license: "All rights reserved."
        }}
        themeToggle={
          <div className="flex items-center justify-center">
            <ThemeToggle />
          </div>
        }
      />
    </main>
  );
}
