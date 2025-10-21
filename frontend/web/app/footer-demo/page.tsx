import { Heart, Mail, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Footer } from '@workspace/ui/components/ui/footer';

/**
 * Demo page showcasing the Footer component.
 * 
 * This page demonstrates the Footer component with Rwanda Cancer Relief
 * branding, relevant navigation links, and social media connections.
 * 
 * @returns A demo page with the Footer component
 */
export default function FooterDemoPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-4xl font-bold mb-4">Footer Component Demo</h1>
          <p className="text-muted-foreground mb-8">
            Scroll down to see the Rwanda Cancer Relief footer with branding,
            navigation, and social links.
          </p>
          <div className="space-y-4 text-left bg-muted/30 p-6 rounded-lg">
            <h2 className="text-xl font-semibold">Footer Features:</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Organization logo and branding</li>
              <li>Social media links (Facebook, Twitter, LinkedIn, Email)</li>
              <li>Main navigation links</li>
              <li>Legal and policy links</li>
              <li>Copyright information</li>
              <li>Fully responsive layout</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer
        logo={<Heart className="h-10 w-10 text-primary fill-primary/20" />}
        brandName="Rwanda Cancer Relief"
        socialLinks={[
          {
            icon: <Facebook className="h-5 w-5" />,
            href: 'https://facebook.com',
            label: 'Facebook',
          },
          {
            icon: <Twitter className="h-5 w-5" />,
            href: 'https://twitter.com',
            label: 'Twitter',
          },
          {
            icon: <Linkedin className="h-5 w-5" />,
            href: 'https://linkedin.com',
            label: 'LinkedIn',
          },
          {
            icon: <Mail className="h-5 w-5" />,
            href: 'mailto:info@rwandacancerrelief.org',
            label: 'Email',
          },
        ]}
        mainLinks={[
          { href: '/about', label: 'About Us' },
          { href: '/services', label: 'Our Services' },
          { href: '/programs', label: 'Programs' },
          { href: '/get-involved', label: 'Get Involved' },
          { href: '/donate', label: 'Donate' },
          { href: '/contact', label: 'Contact' },
        ]}
        legalLinks={[
          { href: '/privacy', label: 'Privacy Policy' },
          { href: '/terms', label: 'Terms of Service' },
          { href: '/disclaimer', label: 'Medical Disclaimer' },
        ]}
        copyright={{
          text: '© 2024 Rwanda Cancer Relief',
          license: 'All rights reserved. Registered nonprofit organization.',
        }}
      />
    </div>
  );
}

