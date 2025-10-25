"use client"

import React, { useState, useEffect } from "react"
import { motion } from "motion/react"
import { AIChatInput } from "./ai-chat-input"
import { Orb } from "./ui/orb"
import { Button } from "./button"
import { Search, Plus, X } from "lucide-react"
import { UserRole } from "../../apps/web/lib/types"
import { cn } from "../lib/utils"

interface AIChatInterfaceProps {
  userName?: string
  className?: string
  onClose?: () => void
  userRole?: UserRole
  user?: {
    name: string
    email: string
    role: UserRole
    avatar?: string
  }
  currentPath?: string
  onNavigate?: (path: string) => void
  onLogout?: () => void
  notifications?: number
  onNotificationClick?: () => void
  sidebarComponent?: (props: {
    isCollapsed: boolean
    onToggleCollapse: () => void
  }) => React.ReactNode
}

export function AIChatInterface({ 
  userName = "Toby",
  className = "",
  onClose,
  userRole,
  user,
  currentPath,
  onNavigate,
  onLogout,
  notifications = 0,
  onNotificationClick,
  sidebarComponent
}: AIChatInterfaceProps) {
  const [agentState, setAgentState] = useState<"thinking" | "listening" | "talking" | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed)
  }

  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const getCurrentGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }


  return (
    <div className={`fixed inset-0 z-50 flex h-screen bg-background ${className}`}>
      {/* Sidebar */}
      {sidebarComponent && (
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          isSidebarOpen ? (isSidebarCollapsed ? "w-16" : "w-64") : "w-0",
          "hidden md:block"
        )}>
          {sidebarComponent({
            isCollapsed: isSidebarCollapsed,
            onToggleCollapse: toggleSidebarCollapse
          })}
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* TopBar */}
        {user && onLogout && (
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-20 items-center justify-between px-6 w-full">
              {/* Left side - Menu toggle and title */}
              <div className="flex items-center space-x-4">
                <div className="hidden md:block">
                  <h1 className="text-2xl font-semibold">AI Chat</h1>
                </div>
              </div>

              {/* Right side - Empty for clean look */}
              <div className="flex items-center space-x-3">
              </div>
            </div>
          </header>
        )}
        
        {/* AI Chat Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Sidebar */}
          <div className="w-80 bg-gradient-to-br from-primary/5 via-background to-primary/10 border-r border-border flex flex-col">
          {/* Search in sidebar */}
          <div className="p-6 border-b border-border">
            <div className="relative">
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full pl-4 pr-10 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-sm bg-background text-foreground placeholder:text-muted-foreground"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          {/* New Chat Button */}
          <div className="p-6 border-b border-border">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>

          {/* Chat History */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Today</h3>
              <div className="space-y-3">
                {["What's something you've learned recently?", "Best travel experience", "Favorite book"].map((chat, index) => (
                  <div key={index} className="p-4 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <p className="text-sm text-foreground truncate">{chat}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Yesterday</h3>
              <div className="space-y-3">
                <div className="p-4 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                  <p className="text-sm text-foreground truncate">If you could teleport anywhere...</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">7 Days Ago</h3>
              <div className="space-y-3">
                {["What's one goal you want to achieve?", "Favorite programming language", "Learning new skills", "Weekend plans", "Evening reflections"].map((chat, index) => (
                  <div key={index} className="p-4 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                    <p className="text-sm text-foreground truncate">{chat}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>


        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-background border-l border-border">
          {/* Orb */}
          <div className="w-64 h-64 mb-12 relative">
            <div className="bg-muted relative h-full w-full rounded-full p-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
              <div className="bg-background h-full w-full overflow-hidden rounded-full shadow-[inset_0_0_12px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.3)]">
                <Orb 
                  colors={["#A78BFA", "#A78BFA"]}
                  agentState={agentState}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Greeting */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-foreground mb-3">
              {getCurrentGreeting()}, {userName}
            </h1>
            <p className="text-xl text-muted-foreground">
              How Can I <span className="text-primary font-semibold">Assist You Today?</span>
            </p>
          </motion.div>

          {/* Chat Input */}
          <motion.div 
            className="w-full max-w-4xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <AIChatInput />
          </motion.div>

        </div>
        </div>
      </div>
    </div>
  )
}
