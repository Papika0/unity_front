import api from '@/plugins/axios/api'

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  subject?: string
  message?: string
  source: 'contact_form' | 'call_request'
  status: 'new' | 'contacted' | 'in_progress' | 'completed' | 'cancelled'
  notes?: string
  created_at: string
  updated_at: string
}

export interface CustomerStatistics {
  total: number
  new: number
  in_progress: number
  completed: number
  contact_form: number
  call_request: number
  today: number
  this_week: number
  this_month: number
}

export interface ChartDataPoint {
  date: string
  count: number
}

export interface CustomersResponse {
  success: boolean
  data: Customer[]
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
}

export interface AdminCustomerResponse {
  success: boolean
  data?: Customer
  message?: string
}

export interface CustomerFilters {
  status?: string
  source?: string
  search?: string
  date_from?: string
  date_to?: string
  per_page?: number
  page?: number
}

export const adminCustomerApi = {
  /**
   * Get all customers with filtering
   */
  async getAll(filters?: CustomerFilters): Promise<CustomersResponse> {
    const response = await api.get<{ success: boolean; data: CustomersResponse }>('/admin/customers', {
      params: filters,
    })
    return response.data.data
  },

  /**
   * Get customer statistics
   */
  async getStatistics(): Promise<CustomerStatistics> {
    const response = await api.get<{ success: boolean; data?: CustomerStatistics }>(
      '/admin/customers/statistics',
    )
    return response.data.data || {
      total: 0,
      new: 0,
      in_progress: 0,
      completed: 0,
      contact_form: 0,
      call_request: 0,
      today: 0,
      this_week: 0,
      this_month: 0,
    }
  },

  /**
   * Get single customer
   */
  async get(id: number): Promise<Customer> {
    const response = await api.get<{ success: boolean; data: Customer }>(
      `/admin/customers/${id}`,
    )
    return response.data.data
  },

  /**
   * Update customer
   */
  async update(
    id: number,
    data: { status?: string; notes?: string },
  ): Promise<AdminCustomerResponse> {
    const response = await api.put<AdminCustomerResponse>(`/admin/customers/${id}`, data)
    return response.data
  },

  /**
   * Delete customer
   */
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/customers/${id}`)
  },

  /**
   * Bulk update status
   */
  async bulkUpdateStatus(customerIds: number[], status: string): Promise<void> {
    await api.post('/admin/customers/bulk-update-status', {
      customer_ids: customerIds,
      status,
    })
  },

  /**
   * Bulk delete
   */
  async bulkDelete(customerIds: number[]): Promise<void> {
    await api.post('/admin/customers/bulk-delete', {
      customer_ids: customerIds,
    })
  },

  /**
   * Get chart data for last 30 days
   */
  async getChartData(): Promise<ChartDataPoint[]> {
    const response = await api.get<{ success: boolean; data: ChartDataPoint[] }>(
      '/admin/customers/chart-data',
    )
    return response.data.data || []
  },
}
