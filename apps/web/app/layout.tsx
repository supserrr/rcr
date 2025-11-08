import { Suspense } from "react"
import { Ubuntu } from "next/font/google"
import type { Metadata } from "next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/next"

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"
import { ThemeColorMeta } from "@/components/ThemeColorMeta"
import { Spinner } from "@workspace/ui/components/ui/shadcn-io/spinner"

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
      <Spinner variant="bars" size={32} className="text-primary" />
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
        <Analytics />
      </body>
    </html>
  )
}
