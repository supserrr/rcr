import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeft } from "lucide-react"

/**
 * Component Demos Page
 * 
 * Central hub for all component demonstrations
 */
export default function DemosPage() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-4">Component Demos</h1>
          <p className="text-lg text-muted-foreground">
            Explore all available UI components and their demonstrations
          </p>
        </div>

        {/* Component Demos */}
        <div className="grid gap-8">
          
          {/* UI Components */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">UI Components</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <Link href="/demo">
                <Button variant="outline" className="w-full justify-start">Mini Navbar</Button>
              </Link>
              <Link href="/helix-demo">
                <Button variant="outline" className="w-full justify-start">Helix Hero</Button>
              </Link>
              <Link href="/feature-spotlight-demo">
                <Button variant="outline" className="w-full justify-start">Feature Spotlight</Button>
              </Link>
              <Link href="/services-demo">
                <Button variant="outline" className="w-full justify-start">Services Demo</Button>
              </Link>
              <Link href="/parallax-demo">
                <Button variant="outline" className="w-full justify-start">Parallax Scroll</Button>
              </Link>
              <Link href="/features-demo">
                <Button variant="outline" className="w-full justify-start">Features Grid</Button>
              </Link>
              <Link href="/faq-demo">
                <Button variant="outline" className="w-full justify-start">FAQ Section</Button>
              </Link>
              <Link href="/cta-demo">
                <Button variant="outline" className="w-full justify-start">Call to Action</Button>
              </Link>
              <Link href="/footer-demo">
                <Button variant="outline" className="w-full justify-start">Footer</Button>
              </Link>
              <Link href="/svg-scroll-demo">
                <Button variant="outline" className="w-full justify-start">SVG Scroll</Button>
              </Link>
              <Link href="/profile-card-demo">
                <Button variant="outline" className="w-full justify-start">Profile Card</Button>
              </Link>
              <Link href="/user-profile-card-demo">
                <Button variant="outline" className="w-full justify-start">User Profile</Button>
              </Link>
              <Link href="/stats-demo">
                <Button variant="outline" className="w-full justify-start">Stats Section</Button>
              </Link>
              <Link href="/feature-card-demo">
                <Button variant="outline" className="w-full justify-start">Feature Cards</Button>
              </Link>
              <Link href="/logo-cloud-demo">
                <Button variant="outline" className="w-full justify-start">Logo Cloud</Button>
              </Link>
              <Link href="/multi-step-form-demo">
                <Button variant="outline" className="w-full justify-start">Multi-Step Form</Button>
              </Link>
            </div>
          </section>

          {/* AI & Interactive */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">AI & Interactive Components</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <Link href="/ai-demo">
                <Button variant="outline" className="w-full justify-start">AI Chat</Button>
              </Link>
              <Link href="/orb-demo">
                <Button variant="outline" className="w-full justify-start">ElevenLabs Orb</Button>
              </Link>
              <Link href="/audio-player-demo">
                <Button variant="outline" className="w-full justify-start">Audio Player</Button>
              </Link>
              <Link href="/waveform-demo">
                <Button variant="outline" className="w-full justify-start">Waveform</Button>
              </Link>
              <Link href="/shimmering-text-demo">
                <Button variant="outline" className="w-full justify-start">Shimmering Text</Button>
              </Link>
              <Link href="/conversation-bar-demo">
                <Button variant="outline" className="w-full justify-start">Conversation Bar</Button>
              </Link>
            </div>
          </section>

          {/* Admin Dashboards */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Admin Dashboards</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <a href="http://localhost:3001/demo" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-start">Dash Dashboard</Button>
              </a>
              <a href="http://localhost:3002/pages/demo" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-start">Dashy Analytics</Button>
              </a>
            </div>
          </section>

          {/* Page Demos */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 pb-2 border-b">Page Demos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <Link href="/cancer-services">
                <Button variant="outline" className="w-full justify-start">Cancer Services</Button>
              </Link>
            </div>
          </section>

        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Link href="/">
            <Button size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Landing Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

