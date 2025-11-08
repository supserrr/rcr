"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@workspace/ui/components/button"
import { motion } from "framer-motion"

/**
 * Animated Theme Toggle Component
 * 
 * Allows users to switch between light and dark mode
 * with smooth animations and cancer purple theme colors
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="w-10 h-10">
        <Sun className="h-5 w-5" />
      </Button>
    )
  }

  const currentTheme = resolvedTheme || theme

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
        className="w-10 h-10 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all duration-200"
      >
        <motion.div
          initial={false}
          animate={{ 
            rotate: currentTheme === "dark" ? 180 : 0,
            scale: currentTheme === "dark" ? 0.8 : 1
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.3 
          }}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        </motion.div>
        <motion.div
          initial={false}
          animate={{ 
            rotate: currentTheme === "dark" ? 0 : -180,
            scale: currentTheme === "dark" ? 1 : 0.8
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.3 
          }}
          className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        >
          <Moon className="h-5 w-5" />
        </motion.div>
        <span className="sr-only">Toggle theme</span>
      </Button>
    </motion.div>
  )
}

