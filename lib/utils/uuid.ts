// Safe UUID utility with fallbacks
// This prevents crypto.randomUUID errors across different environments

import { generateRandomUUID } from '../polyfills'

/**
 * Safely generates a UUID with multiple fallback strategies
 * @returns A valid UUID string
 */
export function safeUUID(): string {
  try {
    // First try crypto.randomUUID if available and working
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
  } catch (error) {
    console.warn('crypto.randomUUID failed, using fallback:', error)
  }

  try {
    // Use our polyfill function
    return generateRandomUUID()
  } catch (error) {
    console.warn('generateRandomUUID failed, using simple fallback:', error)
  }

  // Ultimate fallback - simple timestamp + random
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate a short unique ID for component keys
 * @returns A short unique string
 */
export function shortId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Check if crypto.randomUUID is available
 * @returns boolean
 */
export function isCryptoUUIDAvailable(): boolean {
  try {
    return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
  } catch {
    return false
  }
}

// Export for backward compatibility
export { generateRandomUUID }
