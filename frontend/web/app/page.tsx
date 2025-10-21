import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Navbar } from "@workspace/ui/components/ui/mini-navbar"
import { SvgFollowScroll } from "@workspace/ui/components/ui/svg-follow-scroll"
import { ThemeToggle } from "@/components/theme-toggle"

/**
 * Rwanda Cancer Relief - Landing Page
 * 
 * Main homepage - Building together!
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Navigation */}
      <Navbar />
      
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      {/* SVG Scroll Animation */}
      <SvgFollowScroll />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-5xl font-bold mb-4">Rwanda Cancer Relief</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
          Ready to build an amazing landing page together!
        </p>
        
        <div className="flex gap-4">
          <Button size="lg">Let's Start Building!</Button>
          <a href="http://localhost:4000" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline">
              View Component Demos →
            </Button>
          </a>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          All component demos are now at <strong>http://localhost:4000</strong>
        </p>
      </div>

      {/* Quick Access to Demos (Dev Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4">
          <a href="http://localhost:4000" target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline">
              📦 Component Demos (Port 4000)
            </Button>
          </a>
        </div>
      )}
    </div>
  )
}
