/**
 * CRM API Service
 * Handles all CRM-related API calls
 */

import api from '@/plugins/axios/api'
import type {
  CrmStage,
  CrmLostReason,
  CrmDeal,
  CrmActivity,
  CrmPayment,
  CrmStatistics,
  KanbanColumn,
  DealFormData,
  DealUpdateData,
  StageChangeData,
  ActivityFormData,
  PaymentFormData,
  PaymentUpdateData,
  PaymentScheduleData,
  CrmStagesResponse,
  CrmLostReasonsResponse,
  CrmDealResponse,
  CrmDealsResponse,
  CrmActivitiesResponse,
  CrmPaymentsResponse,
  CrmStatisticsResponse,
  DealPricingFormData,

} from '@/types/crm'

export const crmApi = {
  // ======================
  // Stages
  // ======================
  async getStages(): Promise<CrmStage[]> {
    const response = await api.get<CrmStagesResponse>('/admin/crm/stages')
    return response.data.data
  },

  // ======================
  // Lost Reasons
  // ======================
  async getLostReasons(): Promise<CrmLostReason[]> {
    const response = await api.get<CrmLostReasonsResponse>('/admin/crm/lost-reasons')
    return response.data.data
  },

  // ======================
  // Pipeline
  // ======================
  async getPipeline(userId?: number): Promise<KanbanColumn[]> {
    const params = userId ? { user_id: userId } : {}
    const response = await api.get<{ success: boolean; data: KanbanColumn[] }>('/admin/crm/deals/pipeline', { params })
    return response.data.data
  },

  // ======================
  // Deals
  // ======================
  async getDeals(params?: {
    stage_id?: number
    user_id?: number
    customer_id?: number
    page?: number
    per_page?: number
  }): Promise<CrmDealsResponse> {
    const response = await api.get<CrmDealsResponse>('/admin/crm/deals', { params })
    return response.data
  },

  async getDeal(id: number): Promise<CrmDeal> {
    const response = await api.get<CrmDealResponse>(`/admin/crm/deals/${id}`)
    return response.data.data
  },

  async createDeal(data: DealFormData): Promise<CrmDeal> {
    const response = await api.post<CrmDealResponse>('/admin/crm/deals', data)
    return response.data.data
  },

  async createLead(data: {
    name: string
    surname?: string
    phone: string
    email?: string
    project_ids?: number[]
    apartment_info?: string
    notes?: string
  }): Promise<CrmDeal> {
    const response = await api.post<CrmDealResponse>('/admin/crm/deals/lead', data)
    return response.data.data
  },

  async updateDeal(id: number, data: DealUpdateData): Promise<CrmDeal> {
    const response = await api.put<CrmDealResponse>(`/admin/crm/deals/${id}`, data)
    return response.data.data
  },

  async deleteDeal(id: number): Promise<void> {
    await api.delete(`/admin/crm/deals/${id}`)
  },

  async updateDealStage(id: number, data: StageChangeData): Promise<CrmDeal> {
    const response = await api.put<CrmDealResponse>(`/admin/crm/deals/${id}/stage`, data)
    return response.data.data
  },

  async updateDealPricing(id: number, data: DealPricingFormData): Promise<CrmDeal> {
    const response = await api.put<CrmDealResponse>(`/admin/crm/deals/${id}/pricing`, {
      stage: data.stage,
      price_per_sqm: data.price_per_sqm,
      payment_alternative: data.payment_alternative,
      payment_params: data.payment_params // JSON field for calculator params
    })
    return response.data.data
  },

  // ======================
  // Activities
  // ======================
  async getActivities(dealId: number): Promise<CrmActivity[]> {
    // The response is paginated, so data.data contains { data: [], meta: ... }
    // We need to cast it to any first to access the nested structure since types might be slightly off
    const response = await api.get<any>(`/admin/crm/deals/${dealId}/activities`)
    
    // Check if we have the nested pagination structure
    if (response.data.data && Array.isArray(response.data.data.data)) {
      return response.data.data.data
    }
    
    // Fallback for non-paginated or direct array response
    return Array.isArray(response.data.data) ? response.data.data : []
  },

  async createActivity(data: ActivityFormData): Promise<CrmActivity> {
    const response = await api.post<{ success: boolean; data: CrmActivity }>(`/admin/crm/deals/${data.deal_id}/activities`, {
      type: data.type,
      content: data.content,
      scheduled_at: data.scheduled_at,
    })
    return response.data.data
  },

  // ======================
  // Payments
  // ======================
  async getPayments(dealId: number): Promise<CrmPayment[]> {
    const response = await api.get<CrmPaymentsResponse>(`/admin/crm/deals/${dealId}/payments`)
    return response.data.data
  },

  async createPayment(data: PaymentFormData): Promise<CrmPayment> {
    const response = await api.post<{ data: CrmPayment }>('/admin/crm/payments', data)
    return response.data.data
  },

  async updatePayment(id: number, data: PaymentUpdateData): Promise<CrmPayment> {
    const response = await api.put<{ data: CrmPayment }>(`/admin/crm/payments/${id}`, data)
    return response.data.data
  },

  async deletePayment(id: number): Promise<void> {
    await api.delete(`/admin/crm/payments/${id}`)
  },

  async generatePaymentSchedule(dealId: number, data: PaymentScheduleData): Promise<CrmPayment[]> {
    const response = await api.post<CrmPaymentsResponse>(
      `/admin/crm/deals/${dealId}/payments/generate-schedule`,
      data
    )
    return response.data.data
  },

  // ======================
  // Statistics
  // ======================
  async getStatistics(userId?: number): Promise<CrmStatistics> {
    const params = userId ? { user_id: userId } : {}
    const response = await api.get<CrmStatisticsResponse>('/admin/crm/deals/statistics', { params })
    return response.data.data
  },
}
