interface PriceData {
  usd: number
  usd_24h_change: number
}

interface CacheEntry {
  data: Record<string, PriceData>
  timestamp: number
}

class PriceCache {
  private cache: Map<string, CacheEntry> = new Map()
  private cacheDuration = 30 * 60 * 1000 // 30 minutes cache
  private requestQueue: Map<string, Promise<Record<string, PriceData>>> = new Map()
  private lastRequestTime = 0
  private minRequestInterval = 10000 // 10 seconds between requests

  async getPrices(coinIds: string[]): Promise<Record<string, PriceData>> {
    const cacheKey = coinIds.sort().join(',')
    
    // Check if we have a valid cache entry
    const cachedEntry = this.cache.get(cacheKey)
    if (cachedEntry && Date.now() - cachedEntry.timestamp < this.cacheDuration) {
      return cachedEntry.data
    }

    // Check if there's already a request in progress for this key
    const pendingRequest = this.requestQueue.get(cacheKey)
    if (pendingRequest) {
      return pendingRequest
    }

    // Create a new request
    const requestPromise = this.fetchPrices(coinIds)
      .then(data => {
        // Cache the result
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        })
        // Remove from request queue
        this.requestQueue.delete(cacheKey)
        return data
      })
      .catch(error => {
        // Remove from request queue even on error
        this.requestQueue.delete(cacheKey)
        throw error
      })

    // Add to request queue
    this.requestQueue.set(cacheKey, requestPromise)
    return requestPromise
  }

  private async fetchPrices(coinIds: string[]): Promise<Record<string, PriceData>> {
    // Wait if we've made a request too recently
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve => setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest))
    }
    this.lastRequestTime = Date.now()

    // Implement exponential backoff for rate limiting
    let retries = 0
    const maxRetries = 3
    let delay = 5000 // Start with 5 seconds

    while (retries < maxRetries) {
      try {
        const idsString = coinIds.join(',')
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${idsString}&vs_currencies=usd&include_24hr_change=true`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        )

        if (response.status === 429) {
          // Rate limited, wait and retry
          retries++
          if (retries >= maxRetries) {
            console.error('CoinGecko rate limit exceeded, returning empty data')
            // Return empty data instead of throwing to prevent app crashes
            const emptyData: Record<string, PriceData> = {}
            coinIds.forEach(id => {
              emptyData[id] = { usd: 0, usd_24h_change: 0 }
            })
            return emptyData
          }
          await new Promise(resolve => setTimeout(resolve, delay))
          delay *= 2 // Exponential backoff
          continue
        }

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()
        this.lastRequestTime = Date.now()
        return data
      } catch (error) {
        console.error('Error fetching prices:', error)
        if (retries >= maxRetries - 1) {
          // Return empty data instead of throwing
          const emptyData: Record<string, PriceData> = {}
          coinIds.forEach(id => {
            emptyData[id] = { usd: 0, usd_24h_change: 0 }
          })
          return emptyData
        }
        retries++
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 2
      }
    }

    // Return empty data as fallback
    const emptyData: Record<string, PriceData> = {}
    coinIds.forEach(id => {
      emptyData[id] = { usd: 0, usd_24h_change: 0 }
    })
    return emptyData
  }

  // Clear cache method for testing or manual cache invalidation
  clearCache() {
    this.cache.clear()
  }
}

// Export singleton instance
export const priceCache = new PriceCache()