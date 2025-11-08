/**
 * Offline data persistence utilities for CarbonFlux
 * Provides caching and recovery mechanisms for API responses
 */

interface CachedData {
  data: any
  timestamp: number
  expiresAt: number
  context: string
}

const CACHE_PREFIX = 'carbonflux-offline-'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export class OfflineStorage {
  /**
   * Cache API response data for offline use
   */
  static cacheData(context: string, data: any): void {
    try {
      const cached: CachedData = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION,
        context
      }
      localStorage.setItem(`${CACHE_PREFIX}${context}`, JSON.stringify(cached))
    } catch (error) {
      console.warn('Failed to cache data:', error)
    }
  }

  /**
   * Retrieve cached data if available and not expired
   */
  static getCachedData(context: string): any | null {
    try {
      const cachedStr = localStorage.getItem(`${CACHE_PREFIX}${context}`)
      if (!cachedStr) return null

      const cached: CachedData = JSON.parse(cachedStr)

      // Check if data has expired
      if (Date.now() > cached.expiresAt) {
        this.clearCachedData(context)
        return null
      }

      return cached.data
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error)
      return null
    }
  }

  /**
   * Clear cached data for a specific context
   */
  static clearCachedData(context: string): void {
    try {
      localStorage.removeItem(`${CACHE_PREFIX}${context}`)
    } catch (error) {
      console.warn('Failed to clear cached data:', error)
    }
  }

  /**
   * Clear all cached data
   */
  static clearAllCachedData(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear all cached data:', error)
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { totalItems: number; totalSize: number; contexts: string[] } {
    try {
      const keys = Object.keys(localStorage)
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX))
      let totalSize = 0
      const contexts: string[] = []

      cacheKeys.forEach(key => {
        const item = localStorage.getItem(key)
        if (item) {
          totalSize += item.length
          contexts.push(key.replace(CACHE_PREFIX, ''))
        }
      })

      return {
        totalItems: cacheKeys.length,
        totalSize,
        contexts
      }
    } catch (error) {
      console.warn('Failed to get cache stats:', error)
      return { totalItems: 0, totalSize: 0, contexts: [] }
    }
  }
}

/**
 * Enhanced API wrapper with offline support
 */
export class OfflineApi {
  static async fetchWithOfflineFallback(
    url: string,
    options: RequestInit = {},
    context: string
  ): Promise<any> {
    try {
      const response = await fetch(url, options)

      if (response.ok) {
        const data = await response.json()
        // Cache successful responses
        OfflineStorage.cacheData(context, data)
        return data
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.warn(`API call failed for ${context}:`, error)

      // Try to return cached data
      const cachedData = OfflineStorage.getCachedData(context)
      if (cachedData) {
        console.info(`Returning cached data for ${context}`)
        return cachedData
      }

      throw error
    }
  }
}

/**
 * React hook for offline data management
 */
export function useOfflineData() {
  const cacheStats = OfflineStorage.getCacheStats()

  const clearCache = (context?: string) => {
    if (context) {
      OfflineStorage.clearCachedData(context)
    } else {
      OfflineStorage.clearAllCachedData()
    }
  }

  return {
    cacheStats,
    clearCache,
    isOnline: navigator.onLine
  }
}