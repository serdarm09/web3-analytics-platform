import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/lib/providers'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VelocityCrypto - Advanced Crypto Analytics & Portfolio Management',
  description: 'VelocityCrypto offers advanced crypto analytics, portfolio tracking, whale movement analysis, and comprehensive DeFi insights for serious traders.',
  keywords: ['velocitycrypto', 'crypto', 'analytics', 'portfolio', 'blockchain', 'defi', 'trading', 'whale tracker', 'velocity crypto'],
  authors: [{ name: 'VelocityCrypto Team' }],
  creator: 'VelocityCrypto',
  publisher: 'VelocityCrypto',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.velocitycrypto.tech'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'VelocityCrypto - Advanced Crypto Analytics & Portfolio Management',
    description: 'VelocityCrypto offers advanced crypto analytics, portfolio tracking, whale movement analysis, and comprehensive DeFi insights for serious traders.',
    url: 'https://www.velocitycrypto.tech',
    siteName: 'VelocityCrypto',
    images: [
      {
        url: '/logo-512.svg',
        width: 512,
        height: 512,
        alt: 'VelocityCrypto',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VelocityCrypto - Advanced Crypto Analytics & Portfolio Management',
    description: 'VelocityCrypto offers advanced crypto analytics, portfolio tracking, whale movement analysis, and comprehensive DeFi insights for serious traders.',
    images: ['/logo-512.svg'],
    creator: '@velocitycrypto',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo-192.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/logo-192.svg' },
      { url: '/logo-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/logo-192.svg',
      },
    ],
  },
  manifest: '/manifest.json',
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Additional SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* PWA Meta Tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="W3Analytics" />
        
        {/* Additional Icons */}
        <link rel="mask-icon" href="/logo-192.svg" color="#3B82F6" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
        {/* Preconnect for Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        <Script
          id="crypto-polyfill"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Only run on client side to prevent hydration issues
                if (typeof window === 'undefined') return;
                
                const global = globalThis || window || self;
                
                console.log('🔧 Enhanced Crypto Polyfill: Starting client-side initialization...');
                
                // Ensure crypto exists
                if (!global.crypto) {
                  global.crypto = {};
                  console.log('🔧 Enhanced Crypto Polyfill: Created crypto object');
                }
                
                // ALWAYS override randomUUID - even if it exists but is broken
                const originalRandomUUID = global.crypto.randomUUID;
                console.log('🔧 Enhanced Crypto Polyfill: Original randomUUID type:', typeof originalRandomUUID);
                
                global.crypto.randomUUID = function() {
                  console.log('🔧 Enhanced Crypto Polyfill: randomUUID called');
                  
                  // Try crypto.getRandomValues first (best entropy)
                  if (global.crypto && global.crypto.getRandomValues) {
                    try {
                      console.log('🔧 Enhanced Crypto Polyfill: Using crypto.getRandomValues');
                      const randomArray = new Uint8Array(16);
                      global.crypto.getRandomValues(randomArray);
                      
                      // Set version to 4
                      randomArray[6] = (randomArray[6] & 0x0f) | 0x40;
                      // Set variant bits
                      randomArray[8] = (randomArray[8] & 0x3f) | 0x80;
                      
                      const hex = Array.from(randomArray)
                        .map(byte => byte.toString(16).padStart(2, '0'))
                        .join('');
                      
                      const uuid = [
                        hex.slice(0, 8),
                        hex.slice(8, 12),
                        hex.slice(12, 16),
                        hex.slice(16, 20),
                        hex.slice(20, 32)
                      ].join('-');
                      
                      console.log('✅ Enhanced Crypto Polyfill: Generated UUID via getRandomValues:', uuid);
                      return uuid;
                    } catch (e) {
                      console.warn('⚠️ Enhanced Crypto Polyfill: crypto.getRandomValues failed:', e);
                      // Fall through to Math.random fallback
                    }
                  }
                  
                  // Try original implementation if it exists and works
                  if (originalRandomUUID && typeof originalRandomUUID === 'function') {
                    try {
                      console.log('🔧 Enhanced Crypto Polyfill: Trying original randomUUID');
                      const result = originalRandomUUID.call(global.crypto);
                      if (result && typeof result === 'string' && result.length >= 36) {
                        console.log('✅ Enhanced Crypto Polyfill: Used original randomUUID:', result);
                        return result;
                      }
                    } catch (e) {
                      console.warn('⚠️ Enhanced Crypto Polyfill: Original randomUUID failed:', e);
                    }
                  }
                  
                  // Final fallback to deterministic Math.random without Date.now()
                  console.log('🔧 Enhanced Crypto Polyfill: Using Math.random fallback');
                  let seed = 0x2F6E2B1;
                  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    seed = (seed * 9301 + 49297) % 233280;
                    const r = (seed / 233280) * 16 | 0;
                    const v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                  });
                  console.log('✅ Enhanced Crypto Polyfill: Generated UUID via Math.random:', uuid);
                  return uuid;
                };
                
                // Also ensure it's available on window for extensions that might check there
                if (typeof window !== 'undefined' && window !== global) {
                  if (!window.crypto) window.crypto = {};
                  window.crypto.randomUUID = global.crypto.randomUUID;
                  console.log('🔧 Enhanced Crypto Polyfill: Also set on window.crypto');
                }
                
                console.log('✅ Enhanced crypto polyfill loaded - randomUUID available:', typeof global.crypto.randomUUID);
                
                // Test the function immediately
                try {
                  const testUuid = global.crypto.randomUUID();
                  console.log('✅ Crypto polyfill test successful:', testUuid);
                  // Make test results available globally for debugging
                  global.__cryptoPolyfillTest = { success: true, uuid: testUuid };
                } catch (e) {
                  console.error('❌ Crypto polyfill test failed:', e);
                  global.__cryptoPolyfillTest = { success: false, error: e.message };
                }
              })();
            `
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}