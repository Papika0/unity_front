import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminBankRatesApi } from '@/services/adminBankRatesApi'
import type { BankRate, BankRateFormData } from '@/types/admin/calculator'

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
}

const getErrorMessage = (err: unknown, defaultMessage: string): string => {
  const apiError = err as ApiError
  return apiError?.response?.data?.message || defaultMessage
}

export const useBankRatesStore = defineStore('bankRates', () => {
  // State
  const bankRates = ref<BankRate[]>([])
  const activeBankRates = ref<BankRate[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  // Actions
  const loadBankRates = async () => {
    try {
      loading.value = true
      error.value = ''
      bankRates.value = await adminBankRatesApi.getAll()
      // Also update active bank rates
      activeBankRates.value = bankRates.value.filter((b) => b.is_active)
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to load bank rates')
      console.error('Error loading bank rates:', err)
    } finally {
      loading.value = false
    }
  }

  const loadActiveBankRates = async () => {
    try {
      loading.value = true
      error.value = ''
      activeBankRates.value = await adminBankRatesApi.getActive()
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to load active bank rates')
      console.error('Error loading active bank rates:', err)
    } finally {
      loading.value = false
    }
  }

  const createBankRate = async (data: BankRateFormData) => {
    try {
      saving.value = true
      error.value = ''
      const response = await adminBankRatesApi.create(data)
      if (response.data) {
        bankRates.value.push(response.data)
        if (response.data.is_active) {
          activeBankRates.value.push(response.data)
        }
      }
      return { success: true }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to create bank rate')
      console.error('Error creating bank rate:', err)
      return { success: false, error: error.value }
    } finally {
      saving.value = false
    }
  }

  const updateBankRate = async (id: number, data: BankRateFormData) => {
    try {
      saving.value = true
      error.value = ''
      const response = await adminBankRatesApi.update(id, data)
      if (response.data) {
        const index = bankRates.value.findIndex((b) => b.id === id)
        if (index !== -1) {
          bankRates.value[index] = response.data
        }
        // Update active list
        const activeIndex = activeBankRates.value.findIndex((b) => b.id === id)
        if (response.data.is_active) {
          if (activeIndex === -1) {
            activeBankRates.value.push(response.data)
          } else {
            activeBankRates.value[activeIndex] = response.data
          }
        } else if (activeIndex !== -1) {
          activeBankRates.value.splice(activeIndex, 1)
        }
      }
      return { success: true }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to update bank rate')
      console.error('Error updating bank rate:', err)
      return { success: false, error: error.value }
    } finally {
      saving.value = false
    }
  }

  const deleteBankRate = async (id: number) => {
    try {
      saving.value = true
      error.value = ''
      await adminBankRatesApi.delete(id)
      bankRates.value = bankRates.value.filter((b) => b.id !== id)
      activeBankRates.value = activeBankRates.value.filter((b) => b.id !== id)
      return { success: true }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to delete bank rate')
      console.error('Error deleting bank rate:', err)
      return { success: false, error: error.value }
    } finally {
      saving.value = false
    }
  }

  const toggleActive = async (id: number) => {
    try {
      saving.value = true
      error.value = ''
      const response = await adminBankRatesApi.toggleActive(id)
      if (response.data) {
        const index = bankRates.value.findIndex((b) => b.id === id)
        if (index !== -1) {
          bankRates.value[index] = response.data
        }
        // Update active list
        if (response.data.is_active) {
          const activeIndex = activeBankRates.value.findIndex((b) => b.id === id)
          if (activeIndex === -1) {
            activeBankRates.value.push(response.data)
          }
        } else {
          activeBankRates.value = activeBankRates.value.filter((b) => b.id !== id)
        }
      }
      return { success: true }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to toggle bank rate status')
      console.error('Error toggling bank rate:', err)
      return { success: false, error: error.value }
    } finally {
      saving.value = false
    }
  }

  const reorderBankRates = async (orderedIds: number[]) => {
    try {
      saving.value = true
      error.value = ''
      await adminBankRatesApi.reorder(orderedIds)
      await loadBankRates() // Reload to get updated order
      return { success: true }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to reorder bank rates')
      console.error('Error reordering bank rates:', err)
      return { success: false, error: error.value }
    } finally {
      saving.value = false
    }
  }

  const moveBankRateUp = (index: number) => {
    if (index > 0) {
      const temp = bankRates.value[index]
      bankRates.value[index] = bankRates.value[index - 1]
      bankRates.value[index - 1] = temp
    }
  }

  const moveBankRateDown = (index: number) => {
    if (index < bankRates.value.length - 1) {
      const temp = bankRates.value[index]
      bankRates.value[index] = bankRates.value[index + 1]
      bankRates.value[index + 1] = temp
    }
  }

  const clearError = () => {
    error.value = ''
  }

  // Initialize
  const initialize = async () => {
    await loadBankRates()
  }

  return {
    // State
    bankRates,
    activeBankRates,
    loading,
    saving,
    error,

    // Actions
    loadBankRates,
    loadActiveBankRates,
    createBankRate,
    updateBankRate,
    deleteBankRate,
    toggleActive,
    reorderBankRates,
    moveBankRateUp,
    moveBankRateDown,
    clearError,
    initialize,
  }
})
