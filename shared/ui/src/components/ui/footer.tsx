import { Button } from '@workspace/ui/components/button';

/**
 * Social link item with icon and URL.
 */
interface SocialLink {
  /**
   * Icon element to display.
   */
  icon: React.ReactNode;
  /**
   * URL to link to.
   */
  href: string;
  /**
   * Accessible label for the link.
   */
  label: string;
}

/**
 * Navigation link item.
 */
interface NavLink {
  /**
   * URL to link to.
   */
  href: string;
  /**
   * Display text for the link.
   */
  label: string;
}

/**
 * Copyright information.
 */
interface CopyrightInfo {
  /**
   * Copyright text (e.g., "© 2024 Company Name").
   */
  text: string;
  /**
   * Optional license text (e.g., "All rights reserved").
   */
  license?: string;
}

/**
 * Props for the Footer component.
 */
interface FooterProps {
  /**
   * Logo element to display.
   */
  logo: React.ReactNode;
  /**
   * Brand name text.
   */
  brandName: string;
  /**
   * Array of social media links with icons.
   */
  socialLinks: SocialLink[];
  /**
   * Array of main navigation links.
   */
  mainLinks: NavLink[];
  /**
   * Array of legal/policy links.
   */
  legalLinks: NavLink[];
  /**
   * Copyright and license information.
   */
  copyright: CopyrightInfo;
  /**
   * Optional theme toggle component.
   */
  themeToggle?: React.ReactNode;
}

/**
 * Footer component displays site-wide footer with branding, navigation, and legal links.
 * 
 * This component provides a comprehensive footer layout with:
 * - Brand logo and name
 * - Social media links with icon buttons
 * - Main navigation links
 * - Legal/policy links
 * - Copyright information
 * 
 * The layout is responsive and adapts from mobile to desktop screens.
 * 
 * @param props - Component props
 * @returns A footer element with navigation and branding
 */
export function Footer({
  logo,
  brandName,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
  themeToggle,
}: FooterProps) {
  return (
    <footer className="pb-6 pt-16 lg:pb-8 lg:pt-24 bg-background border-t border-primary/10 w-full">
      <div className="px-6 lg:px-12">
        <div className="md:flex md:items-start md:justify-between">
          <a href="/" className="flex items-center gap-x-2" aria-label={brandName}>
            {logo}
            <span className="font-jakarta-sans font-bold text-xl text-foreground">{brandName}</span>
          </a>
          <div className="flex items-center gap-3 mt-6 md:mt-0">
            <ul className="flex list-none space-x-3">
              {socialLinks.map((link, i) => (
                <li key={i}>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-full"
                    asChild
                  >
                    <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                      {link.icon}
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
            {themeToggle && (
              <div className="flex items-center">
                {themeToggle}
              </div>
            )}
          </div>
        </div>
        <div className="border-t border-primary/10 mt-6 pt-6 md:mt-4 md:pt-8 lg:grid lg:grid-cols-10">
          <nav className="lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-2 lg:justify-end">
              {mainLinks.map((link, i) => (
                <li key={i} className="my-1 mx-2 shrink-0">
                  <a
                    href={link.href}
                    className="font-jakarta-sans text-sm text-foreground hover:text-primary underline-offset-4 hover:underline transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6 lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end">
              {legalLinks.map((link, i) => (
                <li key={i} className="my-1 mx-3 shrink-0">
                  <a
                    href={link.href}
                    className="font-jakarta-sans text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 text-sm leading-6 text-muted-foreground whitespace-nowrap lg:mt-0 lg:row-[1/3] lg:col-[1/4]">
            <div className="font-jakarta-sans">{copyright.text}</div>
            {copyright.license && <div className="font-jakarta-sans text-xs mt-1">{copyright.license}</div>}
          </div>
        </div>
      </div>
    </footer>
  );
}

