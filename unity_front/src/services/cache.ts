import api from '@/plugins/axios/api'

export interface ClearCacheResponse {
  message: string
  cleared: string[]
  errors?: string[]
}

export interface CacheStats {
  message?: string
  error?: string
  [key: string]: string | number | boolean | undefined
}

/**
 * Clear all cache in the backend
 */
export const clearAllCache = async () => {
  return api.post<ClearCacheResponse>('/admin/cache/clear')
}

/**
 * Clear specific cache types
 */
export const clearSpecificCache = async (types: string[]) => {
  return api.post<ClearCacheResponse>('/admin/cache/clear-specific', { types })
}

/**
 * Get cache statistics
 */
export const getCacheStats = async () => {
  return api.get<CacheStats>('/admin/cache/stats')
}
