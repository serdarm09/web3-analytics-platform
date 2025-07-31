// Crypto polyfill test utility
export function testCryptoPolyfill(): {
  isSupported: boolean;
  method: string;
  testResult: string | null;
  error?: string;
} {
  try {
    // Test if crypto.randomUUID is available
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      const testUUID = crypto.randomUUID();
      return {
        isSupported: true,
        method: 'crypto.randomUUID',
        testResult: testUUID
      };
    }
    
    // Test if our polyfill is working
    if (typeof window !== 'undefined' && window.crypto && typeof window.crypto.randomUUID === 'function') {
      const testUUID = window.crypto.randomUUID();
      return {
        isSupported: true,
        method: 'polyfill',
        testResult: testUUID
      };
    }
    
    return {
      isSupported: false,
      method: 'none',
      testResult: null,
      error: 'No UUID generation method available'
    };
  } catch (error) {
    return {
      isSupported: false,
      method: 'error',
      testResult: null,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Log crypto polyfill status for debugging
export function logCryptoStatus() {
  const result = testCryptoPolyfill();
  console.log('🔐 Crypto Polyfill Status:', result);
  return result;
}
