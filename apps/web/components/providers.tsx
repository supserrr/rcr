"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { Toaster } from "sonner"
import { AuthProvider } from "./auth/AuthProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      storageKey="theme"
      enableSystem
      enableColorScheme
      disableTransitionOnChange={false}
    >
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </NextThemesProvider>
  )
}
