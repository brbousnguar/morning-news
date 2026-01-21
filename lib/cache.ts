// Simple in-memory cache for API responses
// In production, consider using Redis or a proper caching solution

interface CacheEntry {
  data: any
  timestamp: number
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

export function getCacheKey(countryCode: string, language: string): string {
  return `news:${countryCode}:${language}`
}

export function getCached(key: string): any | null {
  const entry = cache.get(key)
  
  if (!entry) {
    return null
  }
  
  // Check if cache has expired
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  
  return entry.data
}

export function setCache(key: string, data: any): void {
  const now = Date.now()
  cache.set(key, {
    data,
    timestamp: now,
    expiresAt: now + CACHE_DURATION,
  })
  
  // Clean up old entries periodically (keep cache size manageable)
  if (cache.size > 100) {
    const entries = Array.from(cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    // Remove oldest 20 entries
    for (let i = 0; i < 20 && i < entries.length; i++) {
      cache.delete(entries[i][0])
    }
  }
}

export function clearCache(): void {
  cache.clear()
}
