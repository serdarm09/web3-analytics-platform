'use client'

import { useHydrated } from '@/hooks/useHydrated'

/**
 * Component that only renders children after hydration is complete
 * Useful for preventing hydration mismatches
 */
export function ClientOnly({ children, fallback = null }: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const hydrated = useHydrated()
  
  return hydrated ? <>{children}</> : <>{fallback}</>
}
