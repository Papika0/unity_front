import api from '@/plugins/axios/api'
import type {
  ActiveProject,
  ActiveProjectsResponse,
  ProjectCalculatorSettings,
  ProjectCalculatorSettingsResponse,
} from '@/types/admin/calculator'

export const adminCalculatorApi = {
  /**
   * Get active/ongoing projects for calculator
   */
  async getActiveProjects(): Promise<ActiveProject[]> {
    const response = await api.get<ActiveProjectsResponse>('/admin/calculator/active-projects')
    return response.data.data
  },

  /**
   * Get calculator settings for a specific project
   */
  async getProjectCalculatorSettings(projectId: number): Promise<{
    base_price_per_sqm: number
    construction_completion_date: string
    calculator_settings: ProjectCalculatorSettings
  }> {
    const response = await api.get<ProjectCalculatorSettingsResponse>(
      `/admin/projects/${projectId}/calculator-settings`,
    )
    return response.data.data
  },

  /**
   * Update calculator settings for a specific project
   */
  async updateProjectCalculatorSettings(
    projectId: number,
    data: {
      base_price_per_sqm: number
      calculator_settings: ProjectCalculatorSettings
    },
  ): Promise<void> {
    await api.put(`/admin/projects/${projectId}/calculator-settings`, data)
  },

  /**
   * Quick update just the base price for a project
   */
  async updateBasePrice(projectId: number, basePrice: number): Promise<void> {
    await api.put(`/admin/projects/${projectId}/base-price`, { base_price_per_sqm: basePrice })
  },
}
