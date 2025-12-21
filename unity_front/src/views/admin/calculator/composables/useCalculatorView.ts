/**
 * useCalculatorView - Composable for calculator view management
 * Handles translations, PDF export, and print functionality
 */

import { computed, ref, onMounted } from 'vue'
import { useCalculatorStore } from '@/stores/admin/calculator'
import { useAuthStore } from '@/stores/auth/auth'
import { useCalculatorExport } from '@/composables/calculator/useCalculatorExport'
import { useCalculatorPrint } from '@/composables/calculator/useCalculatorPrint'
import type { CalculationResult, BankLoanResult } from '@/types/admin/calculator'

type Language = 'ka' | 'en' | 'ru'

const translations: Record<Language, Record<string, string>> = {
  ka: {
    title: 'გადახდის კალკულატორი',
    subtitle: 'პროექტის შერჩევა და გადახდის გეგმის გაანგარიშება',
    projectSelection: 'პროექტის არჩევა',
    apartmentDetails: 'ბინის დეტალები',
    paymentAlternatives: 'გადახდის ალტერნატივები',
    results: 'შედეგები',
    schedule: 'გრაფიკი',
    reset: 'გადატვირთვა',
    print: 'დაბეჭდვა',
    exportPDF: 'PDF ექსპორტი',
    retry: 'ხელახლა ცდა',
    monthsAndPayment: 'თვეების რაოდენობა და ყოველთვიური გადასახადი',
    month: 'თვე',
    months: 'თვე',
    perMonth: 'თვე',
    projectSettings: 'პროექტის პარამეტრები'
  },
  en: {
    title: 'Payment Calculator',
    subtitle: 'Select project and calculate payment plan',
    projectSelection: 'Project Selection',
    apartmentDetails: 'Apartment Details',
    paymentAlternatives: 'Payment Alternatives',
    results: 'Results',
    schedule: 'Schedule',
    reset: 'Reset',
    print: 'Print',
    exportPDF: 'Export PDF',
    retry: 'Retry',
    monthsAndPayment: 'Number of Months & Monthly Payment',
    month: 'month',
    months: 'months',
    perMonth: 'month',
    projectSettings: 'Project Settings'
  },
  ru: {
    title: 'Калькулятор платежей',
    subtitle: 'Выберите проект и рассчитайте план платежей',
    projectSelection: 'Выбор проекта',
    apartmentDetails: 'Детали квартиры',
    paymentAlternatives: 'Альтернативы оплаты',
    results: 'Результаты',
    schedule: 'График',
    reset: 'Сбросить',
    print: 'Печать',
    exportPDF: 'Экспорт PDF',
    retry: 'Повторить',
    monthsAndPayment: 'Количество месяцев и ежемесячный платеж',
    month: 'месяц',
    months: 'месяцев',
    perMonth: 'месяц',
    projectSettings: 'Настройки проекта'
  }
}

const langLabels: Record<Language, string> = {
  ka: '🇬🇪 ქართული',
  en: '🇬🇧 English',
  ru: '🇷🇺 Русский'
}

export function useCalculatorView() {
  // ============================================
  // STORES & COMPOSABLES
  // ============================================
  const calculatorStore = useCalculatorStore()
  const authStore = useAuthStore()
  const { exportCalculationToPDF, exportBankLoanToPDF } = useCalculatorExport()
  const { printCalculation } = useCalculatorPrint()

  // ============================================
  // STATE
  // ============================================
  const showProjectSettingsModal = ref(false)
  const currentLang = ref<Language>('ka')

  // ============================================
  // COMPUTED
  // ============================================
  const currentResult = computed(() => {
    return calculatorStore.calculationResult || calculatorStore.bankLoanResult
  })

  const hasSchedule = computed(() => {
    return (
      (calculatorStore.calculationResult?.paymentSchedule &&
        calculatorStore.calculationResult.paymentSchedule.length > 0) ||
      (calculatorStore.bankLoanResult?.paymentSchedule &&
        calculatorStore.bankLoanResult.paymentSchedule.length > 0)
    )
  })

  // ============================================
  // TRANSLATIONS
  // ============================================
  const t = (key: string) => translations[currentLang.value][key] || key

  // ============================================
  // HANDLERS
  // ============================================
  const handleProjectSettingsSaved = async () => {
    await calculatorStore.initialize()
    
    if (calculatorStore.selectedProject) {
      const projectId = calculatorStore.selectedProject.id
      const updatedProject = calculatorStore.activeProjects.find(p => p.id === projectId)
      if (updatedProject) {
        calculatorStore.selectProject(updatedProject)
      }
    }
  }

  const handleCalculation = (result: CalculationResult) => {
    calculatorStore.calculationResult = result
    calculatorStore.bankLoanResult = null
  }

  const handleBankCalculation = (result: BankLoanResult) => {
    calculatorStore.bankLoanResult = result
    calculatorStore.calculationResult = null
  }

  const handleExportPDF = () => {
    if (!calculatorStore.selectedProject) return

    if (calculatorStore.calculationResult) {
      exportCalculationToPDF(
        calculatorStore.calculationResult,
        calculatorStore.selectedProject.title,
        'Payment Alternative',
        calculatorStore.apartmentArea,
        calculatorStore.basePrice,
        currentLang.value
      )
    } else if (calculatorStore.bankLoanResult) {
      exportBankLoanToPDF(
        calculatorStore.bankLoanResult,
        calculatorStore.selectedProject.title,
        'Bank Loan',
        calculatorStore.apartmentArea,
        calculatorStore.basePrice,
        calculatorStore.loanTermYears,
        currentLang.value
      )
    }
  }

  const handlePrint = () => {
    if (!calculatorStore.selectedProject) return

    if (calculatorStore.calculationResult) {
      printCalculation(
        calculatorStore.calculationResult,
        calculatorStore.selectedProject.title,
        'Payment Alternative',
        calculatorStore.apartmentArea,
        calculatorStore.basePrice,
        currentLang.value,
        false
      )
    } else if (calculatorStore.bankLoanResult) {
      printCalculation(
        calculatorStore.bankLoanResult,
        calculatorStore.selectedProject.title,
        'Bank Loan',
        calculatorStore.apartmentArea,
        calculatorStore.basePrice,
        currentLang.value,
        true
      )
    }
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(() => {
    calculatorStore.initialize()
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // Stores
    calculatorStore,
    authStore,

    // State
    showProjectSettingsModal,
    currentLang,
    langLabels,

    // Computed
    currentResult,
    hasSchedule,

    // Translations
    t,

    // Handlers
    handleProjectSettingsSaved,
    handleCalculation,
    handleBankCalculation,
    handleExportPDF,
    handlePrint,
  }
}
