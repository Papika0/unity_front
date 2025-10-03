import api from '@/plugins/axios/api'
import type { CustomerStatistics, ChartDataPoint } from './adminCustomerApi'

export interface DashboardStatistics {
  customer_stats: CustomerStatistics
  projects_count: number
  translations_count: number
  chart_data: ChartDataPoint[]
}

export interface CacheWarmingStats {
  homepage: { success: number; failed: number }
  news: { success: number; failed: number }
  projects: { success: number; failed: number }
  gallery: { success: number; failed: number }
  about: { success: number; failed: number }
  contact: { success: number; failed: number }
  footer: { success: number; failed: number }
}

export const dashboardApi = {
  /**
   * Get all dashboard statistics in one API call
   */
  async getStatistics(): Promise<DashboardStatistics> {
    const response = await api.get<{ success: boolean; data: DashboardStatistics }>(
      '/admin/dashboard/statistics',
    )
    return response.data.data
  },

  /**
   * Clear application cache
   */
  async clearCache(): Promise<{ message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
      '/admin/dashboard/clear-cache',
    )
    return { message: response.data.message || 'კეში გასუფთავდა' }
  },

  /**
   * Warm application cache (pre-populate all API caches)
   */
  async warmCache(): Promise<{ message: string; stats?: CacheWarmingStats }> {
    const response = await api.post<{ 
      success: boolean
      message: string
      stats?: CacheWarmingStats 
    }>('/admin/dashboard/warm-cache')
    return { 
      message: response.data.message || 'კეში გაცხელდა', 
      stats: response.data.stats 
    }
  },
}
