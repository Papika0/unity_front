<template>
  <Modal :show="isOpen" :title="t('admin.crm.pricing.title')" @close="close">
    <!-- Stage Selection -->
    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in stages"
            :key="tab.id"
            @click="selectedStage = tab.id"
            :class="[
              selectedStage === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
              'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium'
            ]"
            :aria-current="selectedStage === tab.id ? 'page' : undefined"
          >
            {{ t(`admin.crm.pricing.stages.${tab.id}`) }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Price Inputs -->
    <div class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 mb-6">
      <div>
        <label for="price-per-sqm" class="block text-sm font-medium leading-6 text-gray-900">
          {{ t('admin.crm.pricing.price_per_sqm') }}
        </label>
        <div class="relative mt-2 rounded-md shadow-sm">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span class="text-gray-500 sm:text-sm">{{ currencySymbol }}</span>
          </div>
          <input
            type="number"
            name="price-per-sqm"
            id="price-per-sqm"
            v-model.number="pricePerSqm"
            @input="updateTotal"
            class="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label for="total-price" class="block text-sm font-medium leading-6 text-gray-900">
          {{ t('admin.crm.pricing.total_price') }}
        </label>
        <div class="relative mt-2 rounded-md shadow-sm">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span class="text-gray-500 sm:text-sm">{{ currencySymbol }}</span>
          </div>
          <input
            type="number"
            name="total-price"
            id="total-price"
            v-model.number="totalPrice"
            @input="updatePerSqm"
            class="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            placeholder="0.00"
          />
        </div>
        <p class="mt-1 text-xs text-gray-500">{{ t('admin.crm.pricing.area') }}: {{ area }} m²</p>
      </div>
    </div>

    <!-- Editable Calculator Parameters -->
    <div v-if="hasCalculatorSettings" class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 mb-6 p-4 bg-gray-50 rounded-lg">
      <div>
        <label for="down-payment-percent" class="block text-sm font-medium leading-6 text-gray-900">
          {{ t('admin.crm.pricing.down_payment_percent') }}
        </label>
        <div class="mt-2 flex items-center gap-3">
          <input
            type="range"
            id="down-payment-percent"
            v-model.number="downPaymentPercent"
            :min="currentConstraints?.downPayment.min || 10"
            :max="currentConstraints?.downPayment.max || 50"
            :disabled="!selectedAlternative || isDownPaymentFixed"
            step="5"
            :class="[
              'w-full h-2 bg-gray-200 rounded-lg appearance-none',
              !selectedAlternative || isDownPaymentFixed ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            ]"
          />
          <span class="text-sm font-medium text-gray-900 w-12">{{ downPaymentPercent }}%</span>
        </div>
        <p v-if="currentConstraints" class="mt-1 text-xs text-gray-500">
          Range: {{ currentConstraints.downPayment.min }}%-{{ currentConstraints.downPayment.max }}%
          <span v-if="isDownPaymentFixed" class="text-amber-600">(Fixed for this alternative)</span>
        </p>
      </div>

      <div>
        <label for="monthly-payment" class="block text-sm font-medium leading-6 text-gray-900">
          {{ t('admin.crm.pricing.monthly_payment') }}
        </label>
        <div class="relative mt-2 rounded-md shadow-sm">
          <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span class="text-gray-500 sm:text-sm">{{ currencySymbol }}</span>
          </div>
          <input
            type="number"
            name="monthly-payment"
            id="monthly-payment"
            v-model.number="monthlyPayment"
            :min="currentConstraints?.monthlyPayment || 0"
            :disabled="!selectedAlternative"
            class="block w-full rounded-md border-0 py-1.5 pl-7 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="800"
          />
        </div>
        <p v-if="currentConstraints?.monthlyPayment" class="mt-1 text-xs text-gray-500">
          Minimum: {{ currencySymbol }}{{ currentConstraints.monthlyPayment }}
        </p>
      </div>
    </div>

    <!-- Calculator Section -->
    <div class="border-t border-gray-200 pt-6 mb-6">
      <h4 class="text-sm font-medium text-gray-900 mb-4">{{ t('admin.crm.pricing.payment_alternatives') }}</h4>
      
      <div v-if="!hasCalculatorSettings" class="text-sm text-gray-500 italic">
        {{ t('admin.crm.pricing.no_calculator') }}
      </div>

      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="alt in calculatedAlternatives"
          :key="alt.id"
          @click="!isAlternativeDisabled(alt.id) && selectAlternative(alt.id)"
          :class="[
            selectedAlternative === alt.id
              ? 'ring-2 ring-indigo-600 bg-indigo-50'
              : isAlternativeDisabled(alt.id)
              ? 'ring-1 ring-gray-200 bg-gray-100 opacity-60 cursor-not-allowed'
              : 'ring-1 ring-gray-200 hover:bg-gray-50 cursor-pointer',
            'rounded-lg p-4 transition-all relative'
          ]"
        >
          <!-- Disabled Badge -->
          <div v-if="isAlternativeDisabled(alt.id)" class="absolute top-2 right-2">
            <span class="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded font-medium">
              {{ t('admin.crm.pricing.alternative_disabled') }}
            </span>
          </div>

          <!-- Title & Description -->
          <div class="mb-3">
            <h4 class="text-sm font-semibold text-gray-900">
              {{ getAlternativeInfo(alt.id)?.title[currentLanguage] }}
            </h4>
            <p class="text-xs text-gray-500 mt-1">
              {{ getAlternativeInfo(alt.id)?.description[currentLanguage] }}
            </p>
          </div>

          <!-- Constraint Badges -->
          <div class="flex flex-wrap gap-2 mb-3">
            <span v-if="getAlternativeInfo(alt.id)?.downPaymentRange"
                  class="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
              {{ getAlternativeInfo(alt.id)!.downPaymentRange!.min }}%-{{ getAlternativeInfo(alt.id)!.downPaymentRange!.max }}% down
            </span>
            <span v-if="getAlternativeInfo(alt.id)?.minMonthlyPayment"
                  class="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded">
              Min. {{ currencySymbol }}{{ getAlternativeInfo(alt.id)!.minMonthlyPayment }}/mo
            </span>
          </div>

          <!-- Selection Indicator -->
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-gray-600">{{ t('admin.crm.pricing.option') }} {{ alt.id }}</span>
            <span v-if="selectedAlternative === alt.id" class="text-indigo-600">
              <Check class="h-5 w-5" />
            </span>
          </div>

          <!-- Calculation Results -->
          <div class="space-y-1 text-sm text-gray-600">
            <div class="flex justify-between">
              <span>{{ t('admin.crm.pricing.down_payment') }}:</span>
              <span class="font-medium">{{ currencySymbol }}{{ formatNumber(alt.result.downPayment) }}</span>
            </div>
            <div class="flex justify-between" v-if="alt.result.monthlyPayment > 0">
              <span>{{ t('admin.crm.pricing.monthly_payment') }}:</span>
              <span class="font-medium">{{ currencySymbol }}{{ formatNumber(alt.result.monthlyPayment) }}</span>
            </div>
            <div class="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200 mt-2">
              <span>{{ t('admin.crm.pricing.total') }}:</span>
              <span>{{ currencySymbol }}{{ formatNumber(alt.result.totalPrice) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-row-reverse gap-3 pt-4 border-t border-gray-200">
      <button
        type="button"
        class="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isSaving || !pricePerSqm"
        @click="save"
      >
        <span v-if="isSaving">{{ t('admin.crm.pricing.saving') }}</span>
        <span v-else>{{ t('admin.crm.pricing.save') }}</span>
      </button>
      <button
        type="button"
        class="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
        @click="close"
      >
        {{ t('admin.crm.pricing.cancel') }}
      </button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Check } from 'lucide-vue-next'
import Modal from '@/components/admin/ui/Modal.vue'
import { usePaymentCalculator } from '@/composables/calculator/usePaymentCalculator'
import { useAlternativeDescriptions } from '@/composables/calculator/useAlternativeDescriptions'
import { useCrmStore } from '@/stores/admin/crm'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useLocaleFormatter } from '@/composables/i18n/useLocaleFormatter'
import { useToastStore } from '@/stores/ui/toast'
import type { CrmDeal } from '@/types/crm'
import type { CalculationInput, ProjectCalculatorSettings } from '@/types/admin/calculator'

const props = defineProps<{
  isOpen: boolean
  deal: CrmDeal
}>()

const emit = defineEmits(['close', 'saved'])

const { t } = useTranslations()
const { formatNumber: formatNum, getCurrencySymbol } = useLocaleFormatter()
const store = useCrmStore()
const toast = useToastStore()
const { calculate } = usePaymentCalculator()

// Get current language (default to 'en')
const currentLanguage = computed<'ka' | 'en' | 'ru'>(() => {
  // Try to detect from document or localStorage, fallback to 'en'
  const savedLang = localStorage.getItem('language')
  if (savedLang === 'ka' || savedLang === 'en' || savedLang === 'ru') {
    return savedLang
  }
  return 'en'
})

// State
const selectedStage = ref<'offered' | 'reserved' | 'final'>('offered')
const pricePerSqm = ref<number>(0)
const totalPrice = ref<number>(0)
const selectedAlternative = ref<number | null>(null)
const isSaving = ref(false)

// Editable calculator parameters
const downPaymentPercent = ref<number>(20)
const monthlyPayment = ref<number>(800)

const stages = [
  { id: 'offered' },
  { id: 'reserved' },
  { id: 'final' },
] as const

// Area from deal apartment
const area = computed(() => props.deal.apartment?.area_total || 0)

// Calculator Settings
const calculatorSettings = computed(() => {
  return props.deal.apartment?.building?.project?.calculator_settings ?? null
})

// Alternative descriptions - NOW DYNAMIC based on calculator settings
const alternativeDescriptions = computed(() =>
  useAlternativeDescriptions(calculatorSettings.value as ProjectCalculatorSettings | null)
)

const hasCalculatorSettings = computed(() => !!calculatorSettings.value)

// Derived Calculations for all 6 alternatives
const calculatedAlternatives = computed(() => {
  if (!calculatorSettings.value || !area.value || !pricePerSqm.value) return []

  const results: Array<{ id: number; result: ReturnType<typeof calculate> }> = []
  for (let i = 1; i <= 6; i++) {
    try {
      const input: CalculationInput = {
        basePrice: pricePerSqm.value,
        area: area.value,
        alternative: i as 1 | 2 | 3 | 4 | 5 | 6,
        projectSettings: calculatorSettings.value as CalculationInput['projectSettings'],
        downPaymentPercent: downPaymentPercent.value,
        monthlyPayment: monthlyPayment.value,
      }
      results.push({
        id: i,
        result: calculate(input)
      })
    } catch (e) {
      console.warn(`Failed to calculate alternative ${i}`, e)
    }
  }
  return results
})

// Helper: Get alternative info by ID
function getAlternativeInfo(id: number) {
  return alternativeDescriptions.value.find(alt => alt.id === id)
}

// Helper: Check if alternative is disabled in project settings
function isAlternativeDisabled(id: number): boolean {
  if (!calculatorSettings.value) return true
  const altKey = `alt${id}` as 'alt1' | 'alt2' | 'alt3' | 'alt4' | 'alt5' | 'alt6'
  return calculatorSettings.value.alternatives?.[altKey]?.enabled === false
}

// Constraint enforcement - NOW DYNAMIC based on selected alternative's metadata
const currentConstraints = computed(() => {
  if (!selectedAlternative.value || !alternativeDescriptions.value) return null

  const altInfo = alternativeDescriptions.value.find(a => a.id === selectedAlternative.value)
  if (!altInfo) return null

  return {
    downPayment: altInfo.downPaymentRange || { min: 0, max: 100 },
    monthlyPayment: altInfo.minMonthlyPayment
  }
})

// Check if down payment is fixed (alternatives 5 and 6)
const isDownPaymentFixed = computed(() => {
  return selectedAlternative.value === 5 || selectedAlternative.value === 6
})

// Auto-adjust down payment when switching alternatives to respect new constraints
watch(selectedAlternative, (newAlt) => {
  if (!newAlt || !currentConstraints.value) return

  const { downPayment } = currentConstraints.value

  // Adjust downPaymentPercent to fit within new constraints
  if (downPaymentPercent.value < downPayment.min) {
    downPaymentPercent.value = downPayment.min
  } else if (downPaymentPercent.value > downPayment.max) {
    downPaymentPercent.value = downPayment.max
  }

  // Auto-set monthly payment to minimum if constraint exists
  if (currentConstraints.value.monthlyPayment && monthlyPayment.value < currentConstraints.value.monthlyPayment) {
    monthlyPayment.value = currentConstraints.value.monthlyPayment
  }
})

// Initialize on mount if already open
onMounted(() => {
  if (props.isOpen) {
    initialize()
  }
})

// Initialize form when opened
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    initialize()
  }
}, { immediate: true })

function initialize() {
  // Determine relevant stage based on deal's current stage
  if (props.deal.stage?.type === 'won') {
    selectedStage.value = 'final'
  } else if (props.deal.stage?.name?.toLowerCase().includes('reserved')) {
    selectedStage.value = 'reserved'
  } else {
    selectedStage.value = 'offered'
  }
  
  // Load existing price for that stage
  loadPriceForStage(selectedStage.value)
  
  // Load existing calculator parameters
  selectedAlternative.value = props.deal.selected_payment_alternative || null
  
  // Load existing payment params if available
  if (props.deal.payment_alternative_params) {
    if (props.deal.payment_alternative_params.initial_payment_percent) {
      downPaymentPercent.value = props.deal.payment_alternative_params.initial_payment_percent
    }
  }
}

function loadPriceForStage(stage: 'offered' | 'reserved' | 'final') {
  let price: number = 0
  
  switch(stage) {
    case 'final':
      price = Number(props.deal.final_price_per_sqm) || 0
      break
    case 'reserved':
      price = Number(props.deal.reserved_price_per_sqm) || 0
      break
    case 'offered':
      price = Number(props.deal.offered_price_per_sqm) || 0
      break
  }

  // Fallback to agreed_price / budget based logic if specific fields empty
  if (!price && area.value > 0) {
    if (stage === 'offered' && props.deal.budget) {
      price = Number(props.deal.budget) / area.value
    } else if (stage === 'reserved' && props.deal.agreed_price) {
      price = Number(props.deal.agreed_price) / area.value
    } else if (stage === 'final' && props.deal.agreed_price) {
      price = Number(props.deal.agreed_price) / area.value
    }
  }

  pricePerSqm.value = price ? Number(price.toFixed(2)) : 0
  updateTotal()
}

// Watch stage change to reload relevant price
watch(selectedStage, (newStage) => {
  loadPriceForStage(newStage)
})

// Update functions
function updateTotal() {
  totalPrice.value = Number((pricePerSqm.value * area.value).toFixed(2))
}

function updatePerSqm() {
  if (area.value > 0) {
    pricePerSqm.value = Number((totalPrice.value / area.value).toFixed(2))
  }
}

function selectAlternative(id: number) {
  selectedAlternative.value = id
}

// Currency symbol based on deal currency
const currencySymbol = computed(() => getCurrencySymbol(props.deal.currency || 'USD'))

function formatNumber(val: number) {
  return formatNum(val, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function close() {
  emit('close')
}

async function save() {
  // Validate constraints before saving
  if (selectedAlternative.value && currentConstraints.value) {
    const { downPayment, monthlyPayment: minMonthly } = currentConstraints.value

    // Validate down payment
    if (downPaymentPercent.value < downPayment.min || downPaymentPercent.value > downPayment.max) {
      toast.error(t('admin.crm.pricing.validation.down_payment_range', { min: downPayment.min, max: downPayment.max }))
      return
    }

    // Validate monthly payment
    if (minMonthly && monthlyPayment.value < minMonthly) {
      toast.error(t('admin.crm.pricing.validation.monthly_minimum', { min: currencySymbol.value + formatNumber(minMonthly) }))
      return
    }
  }

  isSaving.value = true
  try {
    // Collect payment params if alternative selected
    const paymentParams = selectedAlternative.value ? {
      price_per_sqm: pricePerSqm.value,
      initial_payment_percent: downPaymentPercent.value,
      internal_installment_months: monthlyPayment.value > 0 ? Math.ceil((totalPrice.value * (1 - downPaymentPercent.value / 100)) / monthlyPayment.value) : undefined,
    } : undefined

    await store.updateDealPricing(props.deal.id, {
      stage: selectedStage.value,
      price_per_sqm: pricePerSqm.value,
      payment_alternative: selectedAlternative.value || undefined,
      payment_params: paymentParams
    })

    emit('saved')
    close()
  } catch (error) {
    console.error('Failed to save pricing', error)
  } finally {
    isSaving.value = false
  }
}
</script>
