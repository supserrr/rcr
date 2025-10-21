import Link from "next/link"
import { Button } from "@workspace/ui/components/button"

/**
 * Component Demos Hub
 * 
 * Central hub for all component demonstrations
 * Running on http://localhost:4000
 */
export default function DemosHomePage() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">Rwanda Cancer Relief</h1>
          <h2 className="text-3xl font-semibold mb-4">Component Demos</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore all available UI components and their demonstrations
          </p>
          <div className="mt-6">
            <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
              <Button size="lg">View Main Landing Page →</Button>
            </a>
          </div>
        </div>

        {/* Component Demos Grid */}
        <div className="grid gap-8">
          
          {/* UI Components */}
          <section>
            <h3 className="text-2xl font-semibold mb-4 pb-2 border-b">UI Components</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <Link href="/demo">
                <Button variant="outline" className="w-full justify-start h-12">Mini Navbar</Button>
              </Link>
              <Link href="/helix-demo">
                <Button variant="outline" className="w-full justify-start h-12">Helix Hero</Button>
              </Link>
              <Link href="/feature-spotlight-demo">
                <Button variant="outline" className="w-full justify-start h-12">Feature Spotlight</Button>
              </Link>
              <Link href="/services-demo">
                <Button variant="outline" className="w-full justify-start h-12">Services Demo</Button>
              </Link>
              <Link href="/parallax-demo">
                <Button variant="outline" className="w-full justify-start h-12">Parallax Scroll</Button>
              </Link>
              <Link href="/features-demo">
                <Button variant="outline" className="w-full justify-start h-12">Features Grid</Button>
              </Link>
              <Link href="/faq-demo">
                <Button variant="outline" className="w-full justify-start h-12">FAQ Section</Button>
              </Link>
              <Link href="/cta-demo">
                <Button variant="outline" className="w-full justify-start h-12">Call to Action</Button>
              </Link>
              <Link href="/footer-demo">
                <Button variant="outline" className="w-full justify-start h-12">Footer</Button>
              </Link>
              <Link href="/svg-scroll-demo">
                <Button variant="outline" className="w-full justify-start h-12">SVG Scroll</Button>
              </Link>
              <Link href="/profile-card-demo">
                <Button variant="outline" className="w-full justify-start h-12">Profile Card</Button>
              </Link>
              <Link href="/user-profile-card-demo">
                <Button variant="outline" className="w-full justify-start h-12">User Profile</Button>
              </Link>
              <Link href="/stats-demo">
                <Button variant="outline" className="w-full justify-start h-12">Stats Section</Button>
              </Link>
              <Link href="/feature-card-demo">
                <Button variant="outline" className="w-full justify-start h-12">Feature Cards</Button>
              </Link>
              <Link href="/logo-cloud-demo">
                <Button variant="outline" className="w-full justify-start h-12">Logo Cloud</Button>
              </Link>
              <Link href="/multi-step-form-demo">
                <Button variant="outline" className="w-full justify-start h-12">Multi-Step Form</Button>
              </Link>
            </div>
          </section>

          {/* AI & Interactive */}
          <section>
            <h3 className="text-2xl font-semibold mb-4 pb-2 border-b">AI & Interactive Components</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <Link href="/ai-demo">
                <Button variant="outline" className="w-full justify-start h-12">AI Chat</Button>
              </Link>
              <Link href="/orb-demo">
                <Button variant="outline" className="w-full justify-start h-12">ElevenLabs Orb</Button>
              </Link>
              <Link href="/audio-player-demo">
                <Button variant="outline" className="w-full justify-start h-12">Audio Player</Button>
              </Link>
              <Link href="/waveform-demo">
                <Button variant="outline" className="w-full justify-start h-12">Waveform</Button>
              </Link>
              <Link href="/shimmering-text-demo">
                <Button variant="outline" className="w-full justify-start h-12">Shimmering Text</Button>
              </Link>
              <Link href="/conversation-bar-demo">
                <Button variant="outline" className="w-full justify-start h-12">Conversation Bar</Button>
              </Link>
            </div>
          </section>

          {/* Admin Dashboards */}
          <section>
            <h3 className="text-2xl font-semibold mb-4 pb-2 border-b">Admin Dashboards</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <a href="http://localhost:3001/demo" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-start h-12">Dash Dashboard</Button>
              </a>
              <a href="http://localhost:3002/pages/demo" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-start h-12">Dashy Analytics</Button>
              </a>
            </div>
          </section>

          {/* Page Demos */}
          <section>
            <h3 className="text-2xl font-semibold mb-4 pb-2 border-b">Page Demos</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <Link href="/cancer-services">
                <Button variant="outline" className="w-full justify-start h-12">Cancer Services</Button>
              </Link>
            </div>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t text-center space-y-4">
          <p className="text-muted-foreground">
            Component demos running on <strong>http://localhost:4000</strong>
          </p>
          <div className="flex gap-4 justify-center">
            <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Main Site (Port 3000)</Button>
            </a>
            <a href="http://localhost:3001" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Dash (Port 3001)</Button>
            </a>
            <a href="http://localhost:3002" target="_blank" rel="noopener noreferrer">
              <Button variant="outline">Dashy (Port 3002)</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
