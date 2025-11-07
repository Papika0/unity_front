<template>
  <div class="space-y-6">
    <!-- Bank Selection -->
    <div>
      <label class="block text-sm font-semibold text-slate-700 mb-3">
        {{ t.selectBank }}
      </label>
      <select
        v-model="selectedBankId"
        @change="handleBankChange"
        class="w-full px-6 py-4 bg-white border-2 border-indigo-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-900 font-medium shadow-sm"
      >
        <option value="">{{ t.selectBankPlaceholder }}</option>
        <option v-for="bank in bankRates" :key="bank.id" :value="bank.id">
          {{ getBankName(bank) }} - {{ bank.interest_rate }}%
        </option>
      </select>
    </div>

    <!-- Interest Rate Display -->
    <div v-if="selectedBank" class="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6">
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm font-semibold text-slate-700">{{ t.interestRate }}</span>
        <span class="text-3xl font-bold text-indigo-600">{{ selectedBank.interest_rate }}%</span>
      </div>
      <p class="text-xs text-slate-600">
        {{ t.loanTerm }}: {{ selectedBank.min_loan_term_years }}-{{ selectedBank.max_loan_term_years }} {{ t.years }}
      </p>
    </div>

    <!-- Down Payment Slider -->
    <div v-if="selectedBank">
      <label class="block text-sm font-semibold text-slate-700 mb-3">
        {{ t.downPayment }}: {{ downPaymentPercent }}%
      </label>
      <input
        v-model.number="downPaymentPercent"
        type="range"
        :min="selectedBank.min_down_payment_percent"
        max="80"
        class="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-indigo-200 to-purple-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-indigo-500 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
      />
      <div class="flex justify-between text-sm text-slate-600 mt-2">
        <span>{{ selectedBank.min_down_payment_percent }}%</span>
        <span class="font-bold text-indigo-600">${{ downPaymentAmount.toLocaleString() }}</span>
        <span>80%</span>
      </div>
    </div>

    <!-- Loan Term Slider -->
    <div v-if="selectedBank">
      <label class="block text-sm font-semibold text-slate-700 mb-3">
        {{ t.loanTerm }}: {{ loanTermYears }} {{ loanTermYears === 1 ? t.year : t.years }}
      </label>
      <input
        v-model.number="loanTermYears"
        type="range"
        :min="selectedBank.min_loan_term_years"
        :max="selectedBank.max_loan_term_years"
        class="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-indigo-200 to-purple-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-indigo-500 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
      />
      <div class="flex justify-between text-sm text-slate-600 mt-2">
        <span>{{ selectedBank.min_loan_term_years }} {{ t.years }}</span>
        <span class="font-bold text-indigo-600">{{ loanTermYears * 12 }} {{ t.months }}</span>
        <span>{{ selectedBank.max_loan_term_years }} {{ t.years }}</span>
      </div>
    </div>

    <!-- Validation Errors -->
    <div v-if="!canCalculate" class="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div class="text-sm">
          <p class="font-semibold text-yellow-800 mb-1">{{ t.pleaseCheck }}</p>
          <ul class="list-disc list-inside text-yellow-700 space-y-1">
            <li v-if="!selectedBank">{{ t.bankNotSelected }}</li>
            <li v-if="area <= 0">{{ t.areaNotEntered }}</li>
            <li v-if="basePrice <= 0">{{ t.basePriceNotSet }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Calculate Button -->
    <button
      @click="handleCalculate"
      :disabled="!canCalculate"
      class="w-full px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {{ t.calculate }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBankCalculator } from '@/composables/useBankCalculator'
import { useBankRatesStore } from '@/stores/admin/bankRates'
import type { BankLoanResult, BankRate } from '@/types/admin/calculator'

interface Props {
  basePrice: number
  area: number
  currentLang?: 'ka' | 'en' | 'ru'
}

const props = withDefaults(defineProps<Props>(), {
  currentLang: 'ka'
})

const translations = {
  ka: {
    selectBank: 'აირჩიეთ ბანკი',
    selectBankPlaceholder: '-- აირჩიეთ ბანკი / Select Bank --',
    interestRate: 'საპროცენტო განაკვეთი',
    loanTerm: 'სესხის ვადა',
    downPayment: 'შენატანი',
    years: 'წელი',
    year: 'წელი',
    months: 'თვე',
    calculate: 'გამოთვლა',
    bankNotSelected: 'ბანკი არ არის არჩეული',
    areaNotEntered: 'ფართობი არ არის შეყვანილი',
    basePriceNotSet: 'საბაზრო ფასი არ არის დაყენებული',
    pleaseCheck: 'გთხოვთ შეამოწმოთ შემდეგი:'
  },
  en: {
    selectBank: 'Select Bank',
    selectBankPlaceholder: '-- Select Bank --',
    interestRate: 'Interest Rate',
    loanTerm: 'Loan Term',
    downPayment: 'Down Payment',
    years: 'years',
    year: 'year',
    months: 'months',
    calculate: 'Calculate Bank Loan',
    bankNotSelected: 'Bank not selected',
    areaNotEntered: 'Area not entered',
    basePriceNotSet: 'Base price not set',
    pleaseCheck: 'Please check the following:'
  },
  ru: {
    selectBank: 'Выберите банк',
    selectBankPlaceholder: '-- Выберите банк --',
    interestRate: 'Процентная ставка',
    loanTerm: 'Срок кредита',
    downPayment: 'Первоначальный взнос',
    years: 'лет',
    year: 'год',
    months: 'месяцев',
    calculate: 'Рассчитать банковский кредит',
    bankNotSelected: 'Банк не выбран',
    areaNotEntered: 'Площадь не введена',
    basePriceNotSet: 'Базовая цена не установлена',
    pleaseCheck: 'Пожалуйста, проверьте следующее:'
  }
}

const t = computed(() => translations[props.currentLang])
const emit = defineEmits<{ calculate: [result: BankLoanResult] }>()

const bankCalculator = useBankCalculator()
const bankRatesStore = useBankRatesStore()

const selectedBankId = ref<number | ''>('')
const downPaymentPercent = ref(20)
const loanTermYears = ref(10)

const bankRates = computed(() => bankRatesStore.activeBankRates)

const selectedBank = computed(() => {
  if (!selectedBankId.value) return null
  return bankRates.value.find(b => b.id === selectedBankId.value) || null
})

const downPaymentAmount = computed(() => {
  return (props.basePrice * props.area) * (downPaymentPercent.value / 100)
})

const canCalculate = computed(() => {
  return selectedBank.value && props.area > 0 && props.basePrice > 0
})

const getBankName = (bank: BankRate) => {
  // Try to parse bank_name as JSON first
  try {
    const names = JSON.parse(bank.bank_name)
    if (props.currentLang === 'ka' && names.ka) return names.ka
    if (props.currentLang === 'ru' && names.ru) return names.ru
    if (props.currentLang === 'en' && names.en) return names.en
    return names.en || names.ka || bank.bank_name
  } catch {
    // If not JSON, check the language-specific properties
    if (props.currentLang === 'ka' && bank.bank_name_ka) return bank.bank_name_ka
    if (props.currentLang === 'ru' && bank.bank_name_ru) return bank.bank_name_ru
    if (props.currentLang === 'en' && bank.bank_name_en) return bank.bank_name_en
    return bank.bank_name_en || bank.bank_name_ka || bank.bank_name
  }
}

onMounted(() => {
  bankRatesStore.loadActiveBankRates()
})

const handleBankChange = () => {
  if (selectedBank.value) {
    // Reset to bank's minimum requirements
    downPaymentPercent.value = selectedBank.value.min_down_payment_percent
    loanTermYears.value = Math.min(10, selectedBank.value.max_loan_term_years)
  }
}

const handleCalculate = () => {
  if (!selectedBank.value) return

  const result = bankCalculator.calculate({
    basePrice: props.basePrice,
    area: props.area,
    selectedBank: selectedBank.value,
    downPaymentPercent: downPaymentPercent.value,
    loanTermYears: loanTermYears.value
  })

  emit('calculate', result)
}
</script>
