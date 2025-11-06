import api from '@/plugins/axios/api'
import type {
  BankRate,
  BankRateFormData,
  BankRatesResponse,
  BankRateResponse,
} from '@/types/admin/calculator'

export const adminBankRatesApi = {
  /**
   * Get all bank rates
   */
  async getAll(): Promise<BankRate[]> {
    const response = await api.get<BankRatesResponse>('/admin/bank-rates')
    return response.data.data
  },

  /**
   * Get active bank rates only
   */
  async getActive(): Promise<BankRate[]> {
    const response = await api.get<BankRatesResponse>('/admin/bank-rates/active')
    return response.data.data
  },

  /**
   * Get single bank rate
   */
  async get(id: number): Promise<BankRate> {
    const response = await api.get<BankRateResponse>(`/admin/bank-rates/${id}`)
    if (!response.data.data) {
      throw new Error('Bank rate not found')
    }
    return response.data.data
  },

  /**
   * Create bank rate
   */
  async create(data: BankRateFormData): Promise<BankRateResponse> {
    const response = await api.post<BankRateResponse>('/admin/bank-rates', data)
    return response.data
  },

  /**
   * Update bank rate
   */
  async update(id: number, data: BankRateFormData): Promise<BankRateResponse> {
    const response = await api.put<BankRateResponse>(`/admin/bank-rates/${id}`, data)
    return response.data
  },

  /**
   * Delete bank rate
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/bank-rates/${id}`)
  },

  /**
   * Toggle active status
   */
  async toggleActive(id: number): Promise<BankRateResponse> {
    const response = await api.post<BankRateResponse>(`/admin/bank-rates/${id}/toggle-active`)
    return response.data
  },

  /**
   * Reorder bank rates
   */
  async reorder(bankRateIds: number[]): Promise<void> {
    await api.put('/admin/bank-rates/reorder', { bank_rate_ids: bankRateIds })
  },
}
