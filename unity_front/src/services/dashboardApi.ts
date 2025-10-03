import api from '@/plugins/axios/api'
import type { CustomerStatistics, ChartDataPoint } from './adminCustomerApi'

export interface DashboardStatistics {
  customer_stats: CustomerStatistics
  projects_count: number
  translations_count: number
  chart_data: ChartDataPoint[]
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
}
