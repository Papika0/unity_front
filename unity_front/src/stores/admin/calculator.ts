import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { adminCalculatorApi } from '@/services/adminCalculatorApi'
import { usePaymentCalculator } from '@/composables/calculator/usePaymentCalculator'
import { useBankCalculator } from '@/composables/calculator/useBankCalculator'
import type {
  ActiveProject,
  CalculationResult,
  BankLoanResult,
  BankRate,
} from '@/types/admin/calculator'

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

export const useCalculatorStore = defineStore('calculator', () => {
  const paymentCalculator = usePaymentCalculator()
  const bankCalculator = useBankCalculator()

  // ==================== STATE ====================
  const activeProjects = ref<ActiveProject[]>([])
  const selectedProject = ref<ActiveProject | null>(null)
  const usesCustomPrice = ref(false)
  const customBasePrice = ref<number>(0)
  const apartmentArea = ref<number>(0)
  const selectedAlternative = ref<1 | 2 | 3 | 4 | 5 | 6 | null>(null)
  const selectedBank = ref<BankRate | null>(null)
  const downPaymentPercent = ref<number>(20)
  const monthlyPayment = ref<number>(800)
  const loanTermYears = ref<number>(10)

  const calculationResult = ref<CalculationResult | null>(null)
  const bankLoanResult = ref<BankLoanResult | null>(null)

  const loading = ref(false)
  const calculating = ref(false)
  const error = ref('')

  // ==================== GETTERS ====================
  const basePrice = computed(() => {
    if (usesCustomPrice.value) {
      return customBasePrice.value
    }
    // Ensure base_price_per_sqm is converted to number (API may return it as string)
    const projectPrice = selectedProject.value?.base_price_per_sqm
    return projectPrice ? Number(projectPrice) : 0
  })

  const baseTotal = computed(() => {
    return basePrice.value * apartmentArea.value
  })

  const canCalculate = computed(() => {
    return selectedProject.value && apartmentArea.value > 0 && basePrice.value > 0
  })

  const currentResult = computed(() => {
    if (selectedBank.value) {
      return bankLoanResult.value
    }
    return calculationResult.value
  })

  // ==================== ACTIONS ====================
  const loadActiveProjects = async () => {
    try {
      loading.value = true
      error.value = ''
      activeProjects.value = await adminCalculatorApi.getActiveProjects()
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to load active projects')
      console.error('Error loading active projects:', err)
    } finally {
      loading.value = false
    }
  }

  const selectProject = (project: ActiveProject | null) => {
    selectedProject.value = project
    usesCustomPrice.value = false
    customBasePrice.value = 0
    // Reset calculation
    calculationResult.value = null
    bankLoanResult.value = null
  }

  const setCustomBasePrice = (price: number) => {
    usesCustomPrice.value = true
    customBasePrice.value = price
    // Reset calculation
    calculationResult.value = null
    bankLoanResult.value = null
  }

  const setArea = (area: number) => {
    apartmentArea.value = area
    // Reset calculation
    calculationResult.value = null
    bankLoanResult.value = null
  }

  const selectAlternative = (alternative: 1 | 2 | 3 | 4 | 5 | 6) => {
    selectedAlternative.value = alternative
    selectedBank.value = null // Clear bank selection
    bankLoanResult.value = null
  }

  const selectBankOption = (bank: BankRate | null) => {
    selectedBank.value = bank
    selectedAlternative.value = null // Clear alternative selection
    calculationResult.value = null
  }

  const calculatePayment = () => {
    if (!canCalculate.value || !selectedProject.value || !selectedAlternative.value) {
      error.value = 'Please select a project, enter area, and choose an alternative'
      return
    }

    if (!selectedProject.value.calculator_settings) {
      error.value = 'Project calculator settings are not configured'
      return
    }

    try {
      calculating.value = true
      error.value = ''

      const result = paymentCalculator.calculate({
        basePrice: basePrice.value,
        area: apartmentArea.value,
        alternative: selectedAlternative.value,
        projectSettings: selectedProject.value.calculator_settings,
        downPaymentPercent: downPaymentPercent.value,
        monthlyPayment: monthlyPayment.value,
      })

      calculationResult.value = result
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to calculate payment')
      console.error('Error calculating payment:', err)
    } finally {
      calculating.value = false
    }
  }

  const calculateBankLoan = () => {
    if (!canCalculate.value || !selectedBank.value) {
      error.value = 'Please select a project, enter area, and choose a bank'
      return
    }

    try {
      calculating.value = true
      error.value = ''

      const result = bankCalculator.calculate({
        basePrice: basePrice.value,
        area: apartmentArea.value,
        selectedBank: selectedBank.value,
        downPaymentPercent: downPaymentPercent.value,
        loanTermYears: loanTermYears.value,
      })

      bankLoanResult.value = result
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'Failed to calculate bank loan')
      console.error('Error calculating bank loan:', err)
    } finally {
      calculating.value = false
    }
  }

  const $reset = () => {
    selectedProject.value = null
    usesCustomPrice.value = false
    customBasePrice.value = 0
    apartmentArea.value = 0
    selectedAlternative.value = null
    selectedBank.value = null
    downPaymentPercent.value = 20
    monthlyPayment.value = 800
    loanTermYears.value = 10
    calculationResult.value = null
    bankLoanResult.value = null
    error.value = ''
  }

  const clearError = () => {
    error.value = ''
  }

  // Initialize
  const initialize = async () => {
    await loadActiveProjects()
  }

  return {
    // State
    activeProjects,
    selectedProject,
    usesCustomPrice,
    customBasePrice,
    apartmentArea,
    selectedAlternative,
    selectedBank,
    downPaymentPercent,
    monthlyPayment,
    loanTermYears,
    calculationResult,
    bankLoanResult,
    loading,
    calculating,
    error,

    // Computed
    basePrice,
    baseTotal,
    canCalculate,
    currentResult,

    // Actions
    loadActiveProjects,
    selectProject,
    setCustomBasePrice,
    setArea,
    selectAlternative,
    selectBankOption,
    calculatePayment,
    calculateBankLoan,
    $reset,
    clearError,
    initialize,
  }
})
