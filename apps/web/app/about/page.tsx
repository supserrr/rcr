'use client';

import { Card, CardContent } from '@workspace/ui/components/card';
import { Navbar } from "@workspace/ui/components/ui/mini-navbar";
import { Footer } from '@workspace/ui/components/ui/footer';
import { ThemeTogglerButton } from '@workspace/ui/components/animate-ui/components/buttons/theme-toggler';
import { RCRLogo } from '@workspace/ui/components/rcr-logo';
import { HeartIcon } from '@workspace/ui/components/heart';
import { UsersIcon } from '@workspace/ui/components/users';
import { ShieldCheckIcon } from '@workspace/ui/components/shield-check';
import { HandHeartIcon } from '@workspace/ui/components/hand-heart';
import { 
  IconAward, 
  IconTarget 
} from '@tabler/icons-react';


/**
 * About page component
 */
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-48 pb-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-jakarta-sans text-4xl lg:text-6xl font-semibold text-foreground mb-6">
            Who We Are
          </h1>
          <p className="font-jakarta-sans text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Rwanda Cancer Relief (RCR) is a non-profit, non-governmental organization, provisionally 
            accredited by the Rwandan Governance Board. We ensure cancer patients have access to 
            high-standard treatment and support, regardless of background.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 px-6 lg:px-12 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-jakarta-sans text-3xl lg:text-4xl font-semibold text-foreground mb-6">
              Our Mission & Vision
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="relative p-8 text-center">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheckIcon size={24} className="text-primary" />
                </div>
                <h3 className="font-jakarta-sans relative z-10 text-2xl font-semibold text-foreground mb-4">
                  Our Mission
                </h3>
                <p className="font-jakarta-sans relative z-10 text-muted-foreground leading-relaxed">
                  Our mission is to ensure that all patients affected with cancer have access to high standard 
                  of treatment and support, regardless of their place of residence, age or their socio-economic background.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="relative p-8 text-center">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HeartIcon size={24} className="text-primary" />
                </div>
                <h3 className="font-jakarta-sans relative z-10 text-2xl font-semibold text-foreground mb-4">
                  Our Vision
                </h3>
                <p className="font-jakarta-sans relative z-10 text-muted-foreground leading-relaxed">
                  Our vision is to see a Rwanda where every patient diagnosed with cancer has a hope for the future.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-jakarta-sans text-3xl lg:text-4xl font-semibold text-foreground mb-6">
              Our Values
            </h2>
            <p className="font-jakarta-sans text-lg text-muted-foreground max-w-3xl mx-auto">
              These core values guide everything we do and shape how we support our community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="relative p-8 text-center">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HeartIcon size={24} className="text-primary" />
                </div>
                <h3 className="font-jakarta-sans relative z-10 text-xl font-semibold text-foreground mb-4">
                  Compassion
                </h3>
                <p className="font-jakarta-sans relative z-10 text-muted-foreground leading-relaxed">
                  We approach patients and families with empathy, understanding, and genuine care, recognizing the unique challenges they face.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="relative p-8 text-center">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShieldCheckIcon size={24} className="text-primary" />
                </div>
                <h3 className="font-jakarta-sans relative z-10 text-xl font-semibold text-foreground mb-4">
                  Integrity
                </h3>
                <p className="font-jakarta-sans relative z-10 text-muted-foreground leading-relaxed">
                  We maintain ethical standards, transparency, accountability, and trustworthiness in all our interactions and operations.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="relative p-8 text-center">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UsersIcon size={24} className="text-primary" />
                </div>
                <h3 className="font-jakarta-sans relative z-10 text-xl font-semibold text-foreground mb-4">
                  Unity
                </h3>
                <p className="font-jakarta-sans relative z-10 text-muted-foreground leading-relaxed">
                  We believe in the power of community and collaboration to fight cancer together, supporting one another through the journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 px-6 lg:px-12 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-jakarta-sans text-3xl lg:text-4xl font-semibold text-foreground mb-6">
              Our Programs
            </h2>
            <p className="font-jakarta-sans text-lg text-muted-foreground max-w-3xl mx-auto">
              We deliver comprehensive support through three core programs designed to address the diverse needs of cancer patients and their families.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="relative p-8 text-center">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IconAward className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-jakarta-sans relative z-10 text-xl font-semibold text-foreground mb-4">
                  Education Program
                </h3>
                <p className="font-jakarta-sans relative z-10 text-muted-foreground leading-relaxed">
                  Raising awareness and providing education about cancer prevention and early detection to communities across Rwanda.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="relative p-8 text-center">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <IconTarget className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-jakarta-sans relative z-10 text-xl font-semibold text-foreground mb-4">
                  Research Program
                </h3>
                <p className="font-jakarta-sans relative z-10 text-muted-foreground leading-relaxed">
                  Conducting vital research to improve cancer outcomes in Rwanda and contribute to global cancer knowledge.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="relative p-8 text-center">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <HandHeartIcon size={24} className="text-primary" />
                </div>
                <h3 className="font-jakarta-sans relative z-10 text-xl font-semibold text-foreground mb-4">
                  Support Program
                </h3>
                <p className="font-jakarta-sans relative z-10 text-muted-foreground leading-relaxed">
                  Providing essential support to cancer patients and their families through counseling, peer support, and community resources.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Achievements Section */}
      <section className="py-16 px-6 lg:px-12 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-jakarta-sans text-3xl lg:text-4xl font-semibold text-foreground mb-6">
              Our Achievements
            </h2>
            <p className="font-jakarta-sans text-lg text-muted-foreground max-w-3xl mx-auto">
              Since our founding, we&apos;ve made significant progress in supporting cancer patients and advancing cancer care in Rwanda.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="relative p-8 text-center">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconAward className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-jakarta-sans relative z-10 text-3xl font-bold text-foreground mb-2">6+</h3>
                <p className="font-jakarta-sans relative z-10 text-muted-foreground">Successful Projects</p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="relative p-8 text-center">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UsersIcon size={32} className="text-primary" />
                </div>
                <h3 className="font-jakarta-sans relative z-10 text-3xl font-bold text-foreground mb-2">10+</h3>
                <p className="font-jakarta-sans relative z-10 text-muted-foreground">Outreach Programs</p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="relative p-8 text-center">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeartIcon size={32} className="text-primary" />
                </div>
                <h3 className="font-jakarta-sans relative z-10 text-3xl font-bold text-foreground mb-2">200+</h3>
                <p className="font-jakarta-sans relative z-10 text-muted-foreground">Mentorship Sessions</p>
              </CardContent>
            </Card>
            
            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 rounded-3xl border-primary/20 hover:shadow-lg transition-all duration-200">
              <CardContent className="relative p-8 text-center">
                {/* Decorative gradient blob */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-0"></div>
                
                <div className="relative z-10 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheckIcon size={32} className="text-primary" />
                </div>
                <h3 className="font-jakarta-sans relative z-10 text-3xl font-bold text-foreground mb-2">550+</h3>
                <p className="font-jakarta-sans relative z-10 text-muted-foreground">Supported Patients</p>
              </CardContent>
            </Card>
          </div>

        </div>
      </section>


      {/* Footer */}
      <Footer
        logo={<RCRLogo variant="simple" width={32} height={32} />}
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
            <ThemeTogglerButton variant="outline" size="default" direction="ltr" modes={['light', 'dark']} className="h-10 w-10 rounded-full" />
          </div>
        }
      />
    </main>
  );
}
