import { useEffect, useState } from 'react'

/**
 * Hook to prevent hydration mismatches by ensuring component only renders on client
 * after hydration is complete
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return hydrated
}

/**
 * Hook for client-side only operations
 * Returns true only when running on client side after hydration
 */
export function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}
