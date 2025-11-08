'use client';

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Navbar } from "@workspace/ui/components/ui/mini-navbar";
import { Footer } from '@workspace/ui/components/ui/footer';
import { ThemeTogglerButton } from '@workspace/ui/components/animate-ui/components/buttons/theme-toggler';
import { RCRLogo } from '@workspace/ui/components/rcr-logo';
import { 
  IconPhone, 
  IconMail, 
  IconClock,
  IconHeart,
  IconShield,
  IconUsers
} from '@tabler/icons-react';

/**
 * Get Help page component for Rwanda Cancer Relief
 */
export default function GetHelpPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-48 pb-16 px-6 lg:px-12 bg-background">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-jakarta-sans text-4xl lg:text-6xl font-semibold text-foreground mb-6 drop-shadow-lg">
            Get Help Now
          </h1>
          <p className="font-jakarta-sans text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            You don't have to face this journey alone. We're here to provide immediate support, guidance, and care when you need it most.
          </p>
        </div>
      </section>

      {/* Emergency Support Section */}
      <section className="py-16 px-6 lg:px-12 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-jakarta-sans text-3xl lg:text-4xl font-semibold text-foreground mb-6 drop-shadow-lg">
              Immediate Support
            </h2>
            <p className="font-jakarta-sans text-lg text-muted-foreground max-w-3xl mx-auto">
              If you're in crisis or need immediate emotional support, we're here 24/7.
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

      {/* Support Options Section */}
      <section className="py-16 px-6 lg:px-12 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-jakarta-sans text-3xl lg:text-4xl font-semibold text-foreground mb-6 drop-shadow-lg">
              How We Can Help
            </h2>
            <p className="font-jakarta-sans text-lg text-muted-foreground max-w-3xl mx-auto">
              We offer comprehensive support services tailored to your needs and situation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="relative p-8 text-center">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconHeart className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-jakarta-sans text-xl font-semibold text-foreground mb-4">
                    Emotional Support
                  </h3>
                  <p className="font-jakarta-sans text-muted-foreground leading-relaxed">
                    Professional counseling and emotional support to help you navigate through difficult times and build resilience.
                  </p>
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
                    <IconShield className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-jakarta-sans text-xl font-semibold text-foreground mb-4">
                    Medical Guidance
                  </h3>
                  <p className="font-jakarta-sans text-muted-foreground leading-relaxed">
                    Connect with healthcare professionals and get guidance on treatment options, side effects, and care planning.
                  </p>
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
                    <IconUsers className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-jakarta-sans text-xl font-semibold text-foreground mb-4">
                    Peer Support
                  </h3>
                  <p className="font-jakarta-sans text-muted-foreground leading-relaxed">
                    Connect with others who understand your journey through support groups and peer mentoring programs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 px-6 lg:px-12 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-jakarta-sans text-3xl lg:text-4xl font-semibold text-foreground mb-6 drop-shadow-lg">
              Quick Actions
            </h2>
            <p className="font-jakarta-sans text-lg text-muted-foreground max-w-3xl mx-auto">
              Get started with the support you need right away.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Button 
              asChild
              className="h-auto p-6 bg-primary hover:bg-primary/90 text-primary-foreground font-jakarta-sans font-medium rounded-2xl transition-all duration-200 flex flex-col items-center gap-3"
            >
              <a href="/counselors">
                <IconHeart className="w-8 h-8" />
                <span>Find a Counselor</span>
              </a>
            </Button>

            <Button 
              asChild
              variant="outline"
              className="h-auto p-6 font-jakarta-sans font-medium rounded-2xl transition-all duration-200 flex flex-col items-center gap-3"
            >
              <a href="/signup/patient">
                <IconUsers className="w-8 h-8" />
                <span>Join Support Group</span>
              </a>
            </Button>

            <Button 
              asChild
              variant="outline"
              className="h-auto p-6 font-jakarta-sans font-medium rounded-2xl transition-all duration-200 flex flex-col items-center gap-3"
            >
              <a href="/contact">
                <IconMail className="w-8 h-8" />
                <span>Contact Us</span>
              </a>
            </Button>

            <Button 
              asChild
              variant="outline"
              className="h-auto p-6 font-jakarta-sans font-medium rounded-2xl transition-all duration-200 flex flex-col items-center gap-3"
            >
              <a href="/about">
                <IconShield className="w-8 h-8" />
                <span>Learn More</span>
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer
        logo={<RCRLogo variant="simple" width={32} height={32} />}
        brandName="Rwanda Cancer Relief"
        mainLinks={[
          { href: "/get-help", label: "Get Help" },
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
            <ThemeTogglerButton variant="outline" size="default" direction="ltr" modes={['light', 'dark']} className="h-10 w-10 rounded-full" />
          </div>
        }
      />
    </main>
  );
}
