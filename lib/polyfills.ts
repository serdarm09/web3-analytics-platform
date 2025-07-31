// Polyfill for crypto.randomUUID to fix wallet extension issues
// More robust polyfill implementation

// Create a robust UUID generator
function generateUUID(): string {
  // Try to use crypto.getRandomValues if available
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomArray = new Uint8Array(16);
    crypto.getRandomValues(randomArray);
    
    // Set version (4) and variant bits
    randomArray[6] = (randomArray[6] & 0x0f) | 0x40;
    randomArray[8] = (randomArray[8] & 0x3f) | 0x80;
    
    // Convert to hex string
    const hex = Array.from(randomArray)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32)
    ].join('-');
  }
  
  // Fallback to Math.random
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Apply polyfill to globalThis
if (typeof globalThis !== 'undefined') {
  if (!globalThis.crypto) {
    (globalThis as any).crypto = {};
  }
  if (!globalThis.crypto.randomUUID) {
    (globalThis.crypto as any).randomUUID = generateUUID;
  }
}

// Apply polyfill to window
if (typeof window !== 'undefined') {
  if (!window.crypto) {
    (window as any).crypto = {};
  }
  if (!window.crypto.randomUUID) {
    (window.crypto as any).randomUUID = generateUUID;
  }
}

// Export the UUID generator for direct use
export const generateRandomUUID = generateUUID;
