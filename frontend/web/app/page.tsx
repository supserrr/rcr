import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-6">
        <h1 className="text-2xl font-bold">Rwanda Cancer Relief</h1>
        <p className="text-muted-foreground">Welcome to the project</p>
        <div className="flex flex-col gap-3">
          <Button size="sm">Get Started</Button>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/demo">
              <Button size="sm" variant="outline">Mini Navbar</Button>
            </Link>
            <Link href="/helix-demo">
              <Button size="sm" variant="outline">Helix Hero</Button>
            </Link>
            <Link href="/feature-spotlight-demo">
              <Button size="sm" variant="outline">Feature Spotlight</Button>
            </Link>
            <Link href="/services-demo">
              <Button size="sm" variant="outline">Services Demo</Button>
            </Link>
            <Link href="/parallax-demo">
              <Button size="sm" variant="outline">Parallax Scroll</Button>
            </Link>
            <Link href="/cancer-services">
              <Button size="sm" variant="outline">Cancer Services</Button>
            </Link>
            <Link href="/features-demo">
              <Button size="sm" variant="outline">Features Grid</Button>
            </Link>
            <Link href="/faq-demo">
              <Button size="sm" variant="outline">FAQ Section</Button>
            </Link>
            <Link href="/cta-demo">
              <Button size="sm" variant="outline">Call to Action</Button>
            </Link>
            <Link href="/footer-demo">
              <Button size="sm" variant="outline">Footer</Button>
            </Link>
            <Link href="/svg-scroll-demo">
              <Button size="sm" variant="outline">SVG Scroll Animation</Button>
            </Link>
            <a href="http://localhost:3001/demo" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">Dashboard Demo</Button>
            </a>
            <a href="http://localhost:3002/pages/demo" target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline">Dashy Demo</Button>
            </a>
            <Link href="/ai-demo">
              <Button size="sm" variant="outline">AI Elements</Button>
            </Link>
            <Link href="/orb-demo">
              <Button size="sm" variant="outline">ElevenLabs Orb</Button>
            </Link>
            <Link href="/audio-player-demo">
              <Button size="sm" variant="outline">Audio Player</Button>
            </Link>
            <Link href="/waveform-demo">
              <Button size="sm" variant="outline">Waveform</Button>
            </Link>
            <Link href="/shimmering-text-demo">
              <Button size="sm" variant="outline">Shimmering Text</Button>
            </Link>
            <Link href="/conversation-bar-demo">
              <Button size="sm" variant="outline">Conversation Bar</Button>
            </Link>
            <Link href="/profile-card-demo">
              <Button size="sm" variant="outline">Profile Card</Button>
            </Link>
            <Link href="/user-profile-card-demo">
              <Button size="sm" variant="outline">User Profile Card</Button>
            </Link>
            <Link href="/stats-demo">
              <Button size="sm" variant="outline">Stats Section</Button>
            </Link>
            <Link href="/feature-card-demo">
              <Button size="sm" variant="outline">Feature Cards</Button>
            </Link>
            <Link href="/multi-step-form-demo">
              <Button size="sm" variant="outline">Multi-Step Form</Button>
            </Link>
            <Link href="/logo-cloud-demo">
              <Button size="sm" variant="outline">Logo Cloud</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
