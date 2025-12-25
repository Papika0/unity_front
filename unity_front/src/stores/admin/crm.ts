/**
 * CRM Store
 * State management for CRM system
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { crmApi } from '@/services/crmApi'
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
} from '@/types/crm'

export const useCrmStore = defineStore('crm', () => {
  // State
  const stages = ref<CrmStage[]>([])
  const lostReasons = ref<CrmLostReason[]>([])
  const pipeline = ref<KanbanColumn[]>([])
  const currentDeal = ref<CrmDeal | null>(null)
  const dealActivities = ref<CrmActivity[]>([])
  const dealPayments = ref<CrmPayment[]>([])
  const statistics = ref<CrmStatistics | null>(null)

  const isLoadingStages = ref(false)
  const isLoadingPipeline = ref(false)
  const isLoadingDeal = ref(false)
  const isLoadingActivities = ref(false)
  const isLoadingPayments = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const activeStages = computed(() => stages.value.filter((s) => s.is_active))
  const activeLostReasons = computed(() => lostReasons.value.filter((r) => r.is_active))

  // ======================
  // Stages
  // ======================
  async function fetchStages(): Promise<void> {
    isLoadingStages.value = true
    error.value = null

    try {
      stages.value = await crmApi.getStages()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load stages'
      error.value = message
      throw err
    } finally {
      isLoadingStages.value = false
    }
  }

  // ======================
  // Lost Reasons
  // ======================
  async function fetchLostReasons(): Promise<void> {
    try {
      lostReasons.value = await crmApi.getLostReasons()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load lost reasons'
      error.value = message
      throw err
    }
  }

  // ======================
  // Pipeline
  // ======================
  async function fetchPipeline(userId?: number): Promise<void> {
    isLoadingPipeline.value = true
    error.value = null

    try {
      pipeline.value = await crmApi.getPipeline(userId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load pipeline'
      error.value = message
      throw err
    } finally {
      isLoadingPipeline.value = false
    }
  }

  // ======================
  // Deals
  // ======================
  async function fetchDeal(id: number): Promise<CrmDeal> {
    isLoadingDeal.value = true
    error.value = null

    try {
      const deal = await crmApi.getDeal(id)
      currentDeal.value = deal
      return deal
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load deal'
      error.value = message
      throw err
    } finally {
      isLoadingDeal.value = false
    }
  }

  async function createDeal(data: DealFormData): Promise<CrmDeal> {
    try {
      // If stage_id is not provided, use the first 'open' stage
      const dealData = { ...data }
      if (!dealData.stage_id) {
        const openStage = stages.value.find((s) => s.type === 'open' && s.is_active)
        if (openStage) {
          dealData.stage_id = openStage.id
        } else if (pipeline.value.length > 0) {
          // Fallback: use first column from pipeline
          const firstOpenColumn = pipeline.value.find((col) => col.type === 'open')
          if (firstOpenColumn) {
            dealData.stage_id = firstOpenColumn.id
          }
        }
      }
      
      const deal = await crmApi.createDeal(dealData)

      // Add deal to pipeline
      const stageColumn = pipeline.value.find((col) => col.id === deal.stage_id)
      if (stageColumn) {
        stageColumn.deals.unshift(deal)
        stageColumn.deal_count++
        stageColumn.total_value += deal.budget ?? 0
      }

      return deal
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create deal'
      error.value = message
      throw err
    }
  }

  async function updateDeal(id: number, data: DealUpdateData): Promise<CrmDeal> {
    try {
      const deal = await crmApi.updateDeal(id, data)

      // Update in currentDeal if it's the same
      if (currentDeal.value?.id === id) {
        currentDeal.value = deal
      }

      // Update in pipeline
      for (const column of pipeline.value) {
        const index = column.deals.findIndex((d) => d.id === id)
        if (index !== -1) {
          const oldValue = column.deals[index].budget ?? 0
          column.deals[index] = deal
          column.total_value = column.total_value - oldValue + (deal.budget ?? 0)
          break
        }
      }

      return deal
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update deal'
      error.value = message
      throw err
    }
  }

  async function updateDealStage(id: number, data: StageChangeData): Promise<CrmDeal> {
    try {
      const deal = await crmApi.updateDealStage(id, data)

      // Find and remove from old column
      for (const column of pipeline.value) {
        const index = column.deals.findIndex((d) => d.id === id)
        if (index !== -1) {
          const [removedDeal] = column.deals.splice(index, 1)
          column.deal_count--
          column.total_value -= removedDeal.budget ?? 0
          break
        }
      }

      // Add to new column
      const newColumn = pipeline.value.find((col) => col.id === data.stage_id)
      if (newColumn) {
        newColumn.deals.unshift(deal)
        newColumn.deal_count++
        newColumn.total_value += deal.budget ?? 0
      }

      // Update currentDeal if it's the same
      if (currentDeal.value?.id === id) {
        currentDeal.value = deal
      }

      return deal
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update deal stage'
      error.value = message
      throw err
    }
  }

  async function deleteDeal(id: number): Promise<void> {
    try {
      await crmApi.deleteDeal(id)

      // Remove from pipeline
      for (const column of pipeline.value) {
        const index = column.deals.findIndex((d) => d.id === id)
        if (index !== -1) {
          const [removedDeal] = column.deals.splice(index, 1)
          column.deal_count--
          column.total_value -= removedDeal.budget ?? 0
          break
        }
      }

      // Clear currentDeal if it's the same
      if (currentDeal.value?.id === id) {
        currentDeal.value = null
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete deal'
      error.value = message
      throw err
    }
  }

  // ======================
  // Activities
  // ======================
  async function fetchActivities(dealId: number): Promise<void> {
    isLoadingActivities.value = true
    error.value = null

    try {
      dealActivities.value = await crmApi.getActivities(dealId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load activities'
      error.value = message
      throw err
    } finally {
      isLoadingActivities.value = false
    }
  }

  async function createActivity(data: ActivityFormData): Promise<CrmActivity> {
    try {
      const activity = await crmApi.createActivity(data)
      dealActivities.value.unshift(activity)
      return activity
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create activity'
      error.value = message
      throw err
    }
  }

  // ======================
  // Payments
  // ======================
  async function fetchPayments(dealId: number): Promise<void> {
    isLoadingPayments.value = true
    error.value = null

    try {
      dealPayments.value = await crmApi.getPayments(dealId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load payments'
      error.value = message
      throw err
    } finally {
      isLoadingPayments.value = false
    }
  }

  async function createPayment(data: PaymentFormData): Promise<CrmPayment> {
    try {
      const payment = await crmApi.createPayment(data)
      dealPayments.value.push(payment)
      return payment
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create payment'
      error.value = message
      throw err
    }
  }

  async function updatePayment(id: number, data: PaymentUpdateData): Promise<CrmPayment> {
    try {
      const payment = await crmApi.updatePayment(id, data)

      const index = dealPayments.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        dealPayments.value[index] = payment
      }

      return payment
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update payment'
      error.value = message
      throw err
    }
  }

  async function deletePayment(id: number): Promise<void> {
    try {
      await crmApi.deletePayment(id)

      const index = dealPayments.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        dealPayments.value.splice(index, 1)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete payment'
      error.value = message
      throw err
    }
  }

  async function generatePaymentSchedule(
    dealId: number,
    data: PaymentScheduleData
  ): Promise<void> {
    try {
      const payments = await crmApi.generatePaymentSchedule(dealId, data)
      dealPayments.value = payments
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate payment schedule'
      error.value = message
      throw err
    }
  }

  // ======================
  // Statistics
  // ======================
  async function fetchStatistics(userId?: number): Promise<void> {
    try {
      statistics.value = await crmApi.getStatistics(userId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load statistics'
      error.value = message
      throw err
    }
  }

  // ======================
  // Reset
  // ======================
  function resetCurrentDeal(): void {
    currentDeal.value = null
    dealActivities.value = []
    dealPayments.value = []
  }

  return {
    // State
    stages,
    lostReasons,
    pipeline,
    currentDeal,
    dealActivities,
    dealPayments,
    statistics,
    isLoadingStages,
    isLoadingPipeline,
    isLoadingDeal,
    isLoadingActivities,
    isLoadingPayments,
    error,

    // Computed
    activeStages,
    activeLostReasons,

    // Actions
    fetchStages,
    fetchLostReasons,
    fetchPipeline,
    fetchDeal,
    createDeal,
    updateDeal,
    updateDealStage,
    deleteDeal,
    fetchActivities,
    createActivity,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
    generatePaymentSchedule,
    fetchStatistics,
    resetCurrentDeal,
  }
})
