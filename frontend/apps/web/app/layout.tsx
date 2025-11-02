import { Suspense } from "react"
import { Ubuntu } from "next/font/google"

import "@workspace/ui/globals.css"
import { Providers } from "@/components/providers"

const fontSans = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  style: ["normal", "italic"],
  variable: "--font-sans",
})

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${fontSans.variable} font-sans antialiased overflow-x-hidden`}
        style={{ fontFamily: 'Ubuntu, ui-sans-serif, system-ui, sans-serif' }}
      >
        <Suspense fallback={<ProvidersLoading />}>
          <Providers>{children}</Providers>
        </Suspense>
      </body>
    </html>
  )
}
