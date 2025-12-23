<template>
  <div>
    <!-- Tab Navigation -->
    <div class="flex border-b-2 border-amber-200 overflow-x-auto">
      <button
        v-for="alt in alternatives"
        :key="alt.id"
        @click="selectTab(alt.id as 1 | 2 | 3 | 4 | 5 | 6)"
        :disabled="!alt.enabled"
        :class="[
          'px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 min-w-[140px]',
          selectedTab === alt.id
            ? 'border-b-3 border-amber-500 text-amber-600 bg-amber-50'
            : 'text-slate-600 hover:text-amber-500 hover:bg-amber-50/50',
          !alt.enabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
        ]"
      >
        <div class="text-center">
          <div class="font-semibold">{{ alt.name }}</div>
          <div class="text-xs mt-1 opacity-75">{{ alt.description }}</div>
        </div>
      </button>

      <!-- Bank Tab -->
      <button
        @click="selectTab('bank')"
        :class="[
          'px-6 py-4 font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 min-w-[140px]',
          selectedTab === 'bank'
            ? 'border-b-3 border-indigo-500 text-indigo-600 bg-indigo-50'
            : 'text-slate-600 hover:text-indigo-500 hover:bg-indigo-50/50'
        ]"
      >
        <div class="text-center">
          <div class="font-semibold">🏦 {{ t.bank }}</div>
          <div class="text-xs mt-1 opacity-75">{{ t.bankLoan }}</div>
        </div>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="mt-8">
      <AlternativeCalculator
        v-if="selectedTab !== 'bank' && project"
        :alternative="numericTab"
        :project="project"
        :basePrice="basePrice"
        :area="area"
        :currentLang="currentLang"
        @calculate="$emit('calculate', $event)"
      />

      <BankCalculator
        v-else-if="selectedTab === 'bank'"
        :basePrice="basePrice"
        :area="area"
        :currentLang="currentLang"
        @calculate="$emit('calculateBank', $event)"
      />

      <!-- No Project Selected / Missing Data -->
      <div v-else class="text-center py-12">
        <svg class="w-20 h-20 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div v-if="!project" class="text-slate-600">
          <p class="font-semibold mb-2">{{ t.selectProject }}</p>
        </div>
        <div v-else-if="area <= 0" class="text-slate-600">
          <p class="font-semibold mb-2">{{ t.enterArea }}</p>
        </div>
        <div v-else-if="basePrice <= 0" class="text-amber-600">
          <p class="font-semibold mb-2">⚠️ {{ t.basePriceNotSet }}</p>
          <p class="text-sm mb-4">{{ t.basePriceNotSetDesc }}</p>
          <p class="text-xs text-slate-500">
            💡 {{ t.useCustomPrice }}
          </p>
        </div>
        <div v-else class="text-slate-600">
          <p class="font-semibold mb-2">{{ t.fillAllFields }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ActiveProject, CalculationResult, BankLoanResult } from '@/types/admin/calculator'
import AlternativeCalculator from './AlternativeCalculator.vue'
import BankCalculator from './BankCalculator.vue'

interface Props {
  project: ActiveProject | null
  basePrice: number
  area: number
  currentLang: 'ka' | 'en' | 'ru'
}

const props = defineProps<Props>()

const translations = {
  ka: {
    bank: 'ბანკი',
    bankLoan: 'საბანკო სესხი',
    selectProject: 'გთხოვთ აირჩიოთ პროექტი',
    enterArea: 'გთხოვთ შეიყვანოთ ფართობი',
    basePriceNotSet: 'საბაზრო ფასი არ არის დაყენებული',
    basePriceNotSetDesc: 'ამ პროექტისთვის საბაზრო ფასი არ არის დაყენებული',
    useCustomPrice: 'გთხოვთ გამოიყენოთ "საკუთარი ფასი" ოფცია ზემოთ',
    fillAllFields: 'გთხოვთ შეავსოთ ყველა ველი'
  },
  en: {
    bank: 'Bank',
    bankLoan: 'Bank Loan',
    selectProject: 'Please select a project',
    enterArea: 'Please enter the area',
    basePriceNotSet: 'Base price is not set',
    basePriceNotSetDesc: 'Base price is not set for this project',
    useCustomPrice: 'Please use "Custom Price" option above',
    fillAllFields: 'Please fill in all required fields'
  },
  ru: {
    bank: 'Банк',
    bankLoan: 'Банковский кредит',
    selectProject: 'Пожалуйста, выберите проект',
    enterArea: 'Пожалуйста, введите площадь',
    basePriceNotSet: 'Базовая цена не установлена',
    basePriceNotSetDesc: 'Базовая цена не установлена для этого проекта',
    useCustomPrice: 'Пожалуйста, используйте опцию "Пользовательская цена" выше',
    fillAllFields: 'Пожалуйста, заполните все необходимые поля'
  }
}

const t = computed(() => translations[props.currentLang])

defineEmits<{
  calculate: [result: CalculationResult]
  calculateBank: [result: BankLoanResult]
}>()

const selectedTab = ref<1 | 2 | 3 | 4 | 5 | 6 | 'bank'>(1)

// Computed property to avoid inline type assertion in template
const numericTab = computed((): 1 | 2 | 3 | 4 | 5 | 6 => {
  if (selectedTab.value === 'bank') return 1 // Fallback, shouldn't be used
  return selectedTab.value
})

const alternatives = computed(() => {
  if (!props.project?.calculator_settings) {
    // Return all disabled if no project
    return [
      { id: 1, name: 'ვარიანტი 1', description: 'Standard', enabled: false },
      { id: 2, name: 'ვარიანტი 2', description: 'Internal', enabled: false },
      { id: 3, name: 'ვარიანტი 3', description: 'Full Upfront', enabled: false },
      { id: 4, name: 'ვარიანტი 4', description: 'Large Upfront', enabled: false },
      { id: 5, name: 'ვარიანტი 5', description: '0% Down', enabled: false },
      { id: 6, name: 'ვარიანტი 6', description: '0% Down', enabled: false }
    ]
  }

  const settings = props.project.calculator_settings
  
  // Get localized labels based on currentLang
  const labels = {
    ka: [
      { name: 'სტანდარტული განვადება', desc: '20-30% შენატანი' },
      { name: 'შიდა განვადება', desc: '20-30% შენატანი' },
      { name: 'სრული წინასწარი', desc: '80-100% ფასდაკლებით' },
      { name: 'დიდი წინასწარი', desc: '50-80% ფასდაკლებით' },
      { name: 'უპირველესი $800/თვე', desc: '0% შენატანი' },
      { name: 'უპირველესი $1500/თვე', desc: '0% შენატანი' }
    ],
    en: [
      { name: 'Standard Installment', desc: '20-30% down payment' },
      { name: 'Internal Installment', desc: '20-30% down payment' },
      { name: 'Full Upfront', desc: '80-100% with discount' },
      { name: 'Large Upfront', desc: '50-80% with discount' },
      { name: 'Priority $800/month', desc: '0% down payment' },
      { name: 'Priority $1500/month', desc: '0% down payment' }
    ],
    ru: [
      { name: 'Стандартная рассрочка', desc: '20-30% первонач. взнос' },
      { name: 'Внутренняя рассрочка', desc: '20-30% первонач. взнос' },
      { name: 'Полная предоплата', desc: '80-100% со скидкой' },
      { name: 'Большая предоплата', desc: '50-80% со скидкой' },
      { name: 'Приоритет $800/мес', desc: '0% первонач. взнос' },
      { name: 'Приоритет $1500/мес', desc: '0% первонач. взнос' }
    ]
  }
  
  const currentLabels = labels[props.currentLang]

  return [
    {
      id: 1 as const,
      name: currentLabels[0].name,
      description: currentLabels[0].desc,
      enabled: settings.alternatives.alt1.enabled
    },
    {
      id: 2 as const,
      name: currentLabels[1].name,
      description: currentLabels[1].desc,
      enabled: settings.alternatives.alt2.enabled
    },
    {
      id: 3 as const,
      name: currentLabels[2].name,
      description: currentLabels[2].desc,
      enabled: settings.alternatives.alt3.enabled
    },
    {
      id: 4 as const,
      name: currentLabels[3].name,
      description: currentLabels[3].desc,
      enabled: settings.alternatives.alt4.enabled
    },
    {
      id: 5 as const,
      name: currentLabels[4].name,
      description: currentLabels[4].desc,
      enabled: settings.alternatives.alt5.enabled
    },
    {
      id: 6 as const,
      name: currentLabels[5].name,
      description: currentLabels[5].desc,
      enabled: settings.alternatives.alt6.enabled
    }
  ]
})

const selectTab = (tabId: 1 | 2 | 3 | 4 | 5 | 6 | 'bank') => {
  // Check if tab is enabled before selecting
  if (tabId !== 'bank') {
    const alt = alternatives.value.find(a => a.id === tabId)
    if (!alt?.enabled) return
  }
  selectedTab.value = tabId
}
</script>
