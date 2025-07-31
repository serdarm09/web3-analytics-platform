import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/lib/providers'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Web3 Analytics Platform - Track, Analyze, and Manage Your Crypto Portfolio',
  description: 'Modern Web3 analytics platform for tracking crypto projects, whale movements, trend analysis, and portfolio management.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
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