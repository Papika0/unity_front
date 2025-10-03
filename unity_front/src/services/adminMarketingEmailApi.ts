import api from '@/plugins/axios/api'

export interface MarketingEmail {
  id: number
  email: string
  name?: string
  is_active: boolean
  description?: string
  created_at: string
  updated_at: string
}

export interface MarketingEmailsResponse {
  success: boolean
  data: MarketingEmail[]
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
}

export interface MarketingEmailResponse {
  success: boolean
  data?: MarketingEmail
  message?: string
}

export interface MarketingEmailFilters {
  active?: string
  search?: string
  per_page?: number
  page?: number
}

export interface MarketingEmailFormData {
  email: string
  name?: string
  description?: string
  is_active?: boolean
}

export const adminMarketingEmailApi = {
  /**
   * Get all marketing emails with filtering
   */
  async getAll(filters?: MarketingEmailFilters): Promise<MarketingEmailsResponse> {
    const response = await api.get<{ success: boolean; data: MarketingEmailsResponse }>('/admin/marketing-emails', {
      params: filters,
    })
    return response.data.data
  },

  /**
   * Get single marketing email
   */
  async get(id: number): Promise<MarketingEmail> {
    const response = await api.get<{ success: boolean; data: MarketingEmail }>(
      `/admin/marketing-emails/${id}`,
    )
    return response.data.data
  },

  /**
   * Create marketing email
   */
  async create(data: MarketingEmailFormData): Promise<MarketingEmailResponse> {
    const response = await api.post<MarketingEmailResponse>('/admin/marketing-emails', data)
    return response.data
  },

  /**
   * Update marketing email
   */
  async update(id: number, data: MarketingEmailFormData): Promise<MarketingEmailResponse> {
    const response = await api.put<MarketingEmailResponse>(
      `/admin/marketing-emails/${id}`,
      data,
    )
    return response.data
  },

  /**
   * Delete marketing email
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/marketing-emails/${id}`)
  },

  /**
   * Toggle active status
   */
  async toggleActive(id: number): Promise<MarketingEmailResponse> {
    const response = await api.post<MarketingEmailResponse>(
      `/admin/marketing-emails/${id}/toggle-active`,
    )
    return response.data
  },

  /**
   * Bulk delete
   */
  async bulkDelete(emailIds: number[]): Promise<void> {
    await api.post('/admin/marketing-emails/bulk-delete', {
      email_ids: emailIds,
    })
  },
}
