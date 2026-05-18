import React from "react"
import type { Metadata, Viewport } from 'next'
import dynamic from 'next/dynamic'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
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
  verification: {
    google: 'Zs7XwmUKbJX1CmGr0yNNDKj4GT2sCxQmJqXf7-xQ7Zs',
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
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MWQZ4V86"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>

        <ThemeProviderWrapper>
          {children}
        </ThemeProviderWrapper>
        <Analytics />

        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-475RH5YLBH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-475RH5YLBH');
          `}
        </Script>

        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-MWQZ4V86');
          `}
        </Script>
      </body>
    </html>
  )
}
