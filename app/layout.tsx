import React from "react"
import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const ThemeProviderWrapper = dynamic(
  () => import('@/components/theme-provider-wrapper'),
  { ssr: true }
)

export const metadata: Metadata = {
  title: 'ONEMYJOB - Smart Recruitment & Bidding Platform',
  description: 'Revolutionary job recruitment platform with bidding system for candidates, companies, and agencies',
  // generator: 'v0.app',
  icons: {
    icon: [{ url: '/one_my_job_icon-.png', type: 'image/png' }],
    apple: '/one_my_job_icon-.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4faf7' },
    { media: '(prefers-color-scheme: dark)', color: '#141a22' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){
  var o=new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1){n.querySelectorAll && n.querySelectorAll('[bis_skin_checked]').forEach(function(el){el.removeAttribute('bis_skin_checked')});if(n.hasAttribute && n.hasAttribute('bis_skin_checked'))n.removeAttribute('bis_skin_checked')}})})});o.observe(document.documentElement,{attributes:true,childList:true,subtree:true});})();`,
          }}
        />
      </head>
      <body
        className="font-sans font-normal antialiased min-h-screen overflow-x-hidden"
        suppressHydrationWarning
      >
        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>
        <Analytics />
      </body>
    </html>
  )
}
