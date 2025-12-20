/**
 * Admin Contact Info API Service
 * Handles contact information CRUD operations
 */

import api from '@/plugins/axios/api'
import type { ContactInfo } from '@/composables/useContactInfo'

export interface ContactInfoFormData {
  email: string
  phone_numbers: Array<{
    number: string
    display: string
  }>
  google_maps_url: string
}

export interface ContactInfoResponse {
  data: ContactInfo
}

export const adminContactInfoApi = {
  /**
   * Get contact information
   */
  async get(): Promise<ContactInfo | null> {
    const response = await api.get<ContactInfoResponse>('/admin/contact-info')
    return response.data?.data || null
  },

  /**
   * Update contact information
   */
  async update(formData: ContactInfoFormData): Promise<ContactInfo> {
    const response = await api.put<ContactInfoResponse>('/admin/contact-info', formData)
    if (!response.data) {
      throw new Error('Failed to update contact information')
    }
    return response.data.data
  }
}
