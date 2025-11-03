import { Suspense } from "react"
import { Ubuntu } from "next/font/google"
import type { Metadata } from "next"
import { SpeedInsights } from "@vercel/speed-insights/next"

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"
import { ThemeColorMeta } from "@/components/ThemeColorMeta"

const fontSans = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Rwanda Cancer Relief",
  description: "Compassionate cancer support and counseling for patients and families in Rwanda",
}

/**
 * Loading fallback for Providers Suspense boundary
 */
function ProvidersLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} font-sans antialiased overflow-x-hidden`}
        style={{ fontFamily: 'Ubuntu, ui-sans-serif, system-ui, sans-serif' }}
      >
        <ThemeColorMeta />
        <Suspense fallback={<ProvidersLoading />}>
          <Providers>{children}</Providers>
        </Suspense>
        <SpeedInsights />
      </body>
    </html>
  )
}
