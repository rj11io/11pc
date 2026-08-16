import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

import "./globals.css"
import { SiteFooter } from "./components/footer"
import { SiteHeader } from "./components/header"
import { ThemeProvider } from "@/components/theme-provider"
import { siteOrigin } from "@/lib/site"
import { cn } from "@/lib/utils"

// Every page builds its Open Graph image from a post or publication cover, and
// those are root-relative once the bundler hashes them. Social networks need an
// absolute address, so the production origin has to be declared here. Without
// it, Next falls back to localhost and every link preview points at a machine
// that is not on the internet. The origin itself lives in lib/site.ts, because
// share links need the same value and two copies would drift apart.
//
// The image below is the site-wide fallback, used by any page that does not set
// an Open Graph image of its own: the landing page, the browse page, and author
// pages. A post or publication with a cover overrides it, because those pages
// declare their own openGraph block. Copied from the versioned set of record at
// Retained from the original 11blog asset set. Kept as a plain file in
// public rather than an import so the address stays stable and readable, which
// matters for something social networks cache. Note that nothing verifies this
// path, so open a page and read the tag after changing it.
//
// Moved from v4 to v5 on 2026-08-02, so the fallback matches the post and
// publication covers, which gained a second signal square the same day. The v4
// file is still in public alongside it: social networks cache an image against
// the address they first saw, and deleting it would blank the preview on
// anything already shared. It costs 44KB to leave it there.
export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  openGraph: {
    images: [
      {
        url: "/static/og/11blog-default-og-v5.png",
        width: 1200,
        height: 630,
        alt: "11blog",
      },
    ],
  },
}

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn(
        "scroll-smooth antialiased motion-reduce:scroll-auto",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
