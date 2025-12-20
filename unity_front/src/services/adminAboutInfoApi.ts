/**
 * Admin Site Settings API Service
 * Handles about info and site-wide settings
 */

import api from '@/plugins/axios/api'
import type { AboutInfo } from '@/composables/useAboutInfo'

export interface AboutInfoFormData {
  stats: {
    successful_projects: string
    years_experience: string
    satisfied_clients: string
    client_satisfaction: string
  }
  philosophy_image_id?: number | null
}

export interface AboutInfoResponse {
  data: AboutInfo
}

export const adminAboutInfoApi = {
  /**
   * Get about info/stats
   */
  async get(): Promise<AboutInfo | null> {
    const response = await api.get<AboutInfoResponse>('/admin/about-info')
    return response.data?.data || null
  },

  /**
   * Update about info/stats
   */
  async update(formData: AboutInfoFormData): Promise<AboutInfo> {
    const response = await api.put<AboutInfoResponse>('/admin/about-info', formData)
    if (!response.data) {
      throw new Error('Failed to update about info')
    }
    return response.data.data
  }
}
