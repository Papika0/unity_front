import api from '@/plugins/axios/api'

export interface CustomerData {
  name: string
  email: string
  phone: string
  subject?: string
  message?: string
  source: 'contact_form' | 'call_request'
}

export interface CustomerResponse {
  success: boolean
  message?: string
  data?: {
    id: number
    created_at: string
  }
  errors?: Record<string, string[]>
}

export const customerApi = {
  /**
   * Submit a customer inquiry
   */
  async submit(data: CustomerData): Promise<CustomerResponse> {
    const response = await api.post<CustomerResponse>('/customers', data)
    return response.data
  },
}
