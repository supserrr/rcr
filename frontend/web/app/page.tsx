import Link from "next/link"
import { Button } from "@workspace/ui/components/button"

/**
 * Rwanda Cancer Relief - Landing Page
 * 
 * Main homepage - Let's build this together!
 * 
 * Tell me what sections you want and I'll add them here.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      
      {/* 
        YOUR LANDING PAGE WILL GO HERE
        
        Just tell me what you want to add! For example:
        - "Add a hero section at the top"
        - "Put a features grid below that"
        - "Add statistics section"
        - "Add a footer at the bottom"
      */}
      
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
