<script setup lang="ts">
/**
 * Register Sold Deal Modal - 4-Step Wizard
 * Allows admins to register already-sold apartments with payment schedules
 * Supports both calculator-generated and manual payment schedules
 */

import { ref, computed, watch, onMounted } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useToastStore } from '@/stores/ui/toast'
import { useApartmentSelector } from '@/composables/crm/useApartmentSelector'
import { crmApi } from '@/services/crmApi'
import { adminCalculatorApi } from '@/services/adminCalculatorApi'
import { usePaymentCalculator } from '@/composables/calculator/usePaymentCalculator'
import { useAlternativeDescriptions } from '@/composables/calculator/useAlternativeDescriptions'
import { useLocaleFormatter } from '@/composables/i18n/useLocaleFormatter'
import type { ProjectCalculatorSettings, CalculationInput, PaymentScheduleItem } from '@/types/admin/calculator'
import { User, Phone, Mail, Building, ChevronLeft, ChevronRight, Check, Calendar, AlertTriangle } from 'lucide-vue-next'
import { format } from 'date-fns'

// Props
interface Props {
  isOpen: boolean
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  created: [dealId: number]
}>()

// Composables
const { t, currentLocale } = useTranslations()
const { getCurrencySymbol, formatNumber } = useLocaleFormatter()
const toast = useToastStore()
const { calculate } = usePaymentCalculator()

// Apartment selector composable
const apartmentSelector = useApartmentSelector({
  onError: (message: string) => toast.error(message)
})

// State
const currentStep = ref(1)
const isCreating = ref(false)

// Step 1: Customer data
const customerData = ref({
  name: '',
  surname: '',
  phone: '',
  email: '',
})

// Step 3: Pricing data
const pricingData = ref({
  price_per_sqm: 0,
  total_price: 0,
  payment_method: 'payment_plan' as 'full' | 'payment_plan',
})

// Step 4: Calculator State
const calculatorSettings = ref<ProjectCalculatorSettings | null>(null)
const selectedAlternative = ref<number | null>(null)
const downPaymentPercent = ref<number>(20)
const downPaymentMode = ref<'percent' | 'amount'>('percent') // Toggle state
const monthlyPayment = ref<number>(800)

// Manual schedule data (kept for fallback/result storage)
const scheduleData = ref({
  payment_alternative: null as number | null,
  down_payment: 0,
  number_of_installments: 12,
  start_date: new Date().toISOString().split('T')[0],
  interval_months: 1,
})

// Retrospective Payments State
const retrospectivePayments = ref<Array<PaymentScheduleItem & { isPaid: boolean }>>([])

// Helper: Get current language
const currentLanguage = computed<'ka' | 'en' | 'ru'>(() => {
  return (currentLocale as 'ka' | 'en' | 'ru') || 'ka'
})

// Calculator Computed
const alternativeDescriptions = computed(() => 
  useAlternativeDescriptions(calculatorSettings.value)
)

const hasCalculatorSettings = computed(() => !!calculatorSettings.value)

// Derived Calculations
const calculatedAlternatives = computed(() => {
  if (!calculatorSettings.value || !pricingData.value.total_price) return []
  
  const area = selectedApartment.value?.area_total || 0
  if (!area) return []

  const results: Array<{ id: number; result: ReturnType<typeof calculate> }> = []
  const startDate = new Date(scheduleData.value.start_date)

  for (let i = 1; i <= 6; i++) {
    try {
      const input: CalculationInput = {
        basePrice: pricingData.value.price_per_sqm,
        area: area,
        alternative: i as 1 | 2 | 3 | 4 | 5 | 6,
        projectSettings: calculatorSettings.value as CalculationInput['projectSettings'],
        downPaymentPercent: downPaymentPercent.value,
        monthlyPayment: monthlyPayment.value,
        startDate: startDate,
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

// Constraints
const currentConstraints = computed(() => {
  if (!selectedAlternative.value || !alternativeDescriptions.value) return null
  const altInfo = alternativeDescriptions.value.find(a => a.id === selectedAlternative.value)
  return altInfo ? {
    downPayment: altInfo.downPaymentRange || { min: 0, max: 100 },
    monthlyPayment: altInfo.minMonthlyPayment
  } : null
})

const isDownPaymentFixed = computed(() => 
  selectedAlternative.value === 5 || selectedAlternative.value === 6
)

// Helpers
function getAlternativeInfo(id: number) {
  return alternativeDescriptions.value.find(alt => alt.id === id)
}

function isAlternativeDisabled(id: number): boolean {
  if (!calculatorSettings.value) return true
  const altKey = `alt${id}` as 'alt1' | 'alt2' | 'alt3' | 'alt4' | 'alt5' | 'alt6'
  return calculatorSettings.value.alternatives?.[altKey]?.enabled === false
}

function selectAlternative(id: number) {
  selectedAlternative.value = id
}

function formatDate(date: Date | string): string {
  try {
    return format(new Date(date), 'MMM dd, yyyy')
  } catch {
    return String(date)
  }
}

// Writeable computed for Amount <-> Percent sync
const downPaymentAmount = computed({
  get: () => {
    return Math.round(pricingData.value.total_price * (downPaymentPercent.value / 100))
  },
  set: (val: number) => {
    if (pricingData.value.total_price > 0) {
      // Calculate percent from amount
      let percent = (val / pricingData.value.total_price) * 100
      // Clamp to min constraint, but allow going up to 100% (user request: allow >30% on standard options)
      if (currentConstraints.value) {
        percent = Math.max(currentConstraints.value.downPayment.min, Math.min(percent, 100))
      } else {
        percent = Math.max(0, Math.min(percent, 100))
      }
      // Round to 6 decimal places to avoid floating point weirdness but keep precision for amount->percent
      downPaymentPercent.value = Math.round(percent * 1000000) / 1000000
    }
  }
})

// Watchers
// Fetch calculator settings when project changes
watch(() => apartmentSelector.selectedProjectId.value, async (newId) => {
  calculatorSettings.value = null
  selectedAlternative.value = null
  if (newId) {
    try {
     const { calculator_settings } = await adminCalculatorApi.getProjectCalculatorSettings(newId)
     calculatorSettings.value = calculator_settings
    } catch (e) {
      console.error('Failed to load calculator settings:', e)
    }
  }
})

// Auto-adjust constraints
watch(selectedAlternative, (newAlt) => {
  if (!newAlt || !currentConstraints.value) return
  const { downPayment } = currentConstraints.value

  if (downPaymentPercent.value < downPayment.min) {
    downPaymentPercent.value = downPayment.min
  } else if (downPaymentPercent.value > downPayment.max) {
    downPaymentPercent.value = downPayment.max
  }

  if (currentConstraints.value.monthlyPayment && monthlyPayment.value < currentConstraints.value.monthlyPayment) {
    monthlyPayment.value = currentConstraints.value.monthlyPayment
  }
})

// Update scheduleData and Retrospective Payments when calculation results change
watch([selectedAlternative, downPaymentPercent, monthlyPayment, pricingData.value.total_price, () => scheduleData.value.start_date], () => {
    if (!selectedAlternative.value) {
      retrospectivePayments.value = []
      return
    }

    const result = calculatedAlternatives.value.find(a => a.id === selectedAlternative.value)?.result
    if (result) {
        scheduleData.value.payment_alternative = selectedAlternative.value
        scheduleData.value.down_payment = result.downPayment
        scheduleData.value.number_of_installments = result.numberOfMonths
        scheduleData.value.interval_months = 1
        
        // Calculate retrospective payments
        const now = new Date()
        // Reset to start of day for accurate comparison
        now.setHours(0, 0, 0, 0)
        
        const existingPaidMap = new Map(retrospectivePayments.value.map(p => [p.month, p.isPaid]))
        
        retrospectivePayments.value = result.paymentSchedule
          .filter(p => new Date(p.date) < now)
          .map(p => ({
            ...p,
            isPaid: existingPaidMap.get(p.month) || false // Preserve status if possible, default false
          }))
    }
})

// Load projects on mount
onMounted(async () => {
  await apartmentSelector.loadProjects()
})

// Computed
const canProceedStep1 = computed(() => {
  return customerData.value.name.trim().length >= 2 &&
         customerData.value.phone.trim().length > 0
})

const canProceedStep2 = computed(() => {
  return apartmentSelector.selectedApartmentId.value !== null
})

const canProceedStep3 = computed(() => {
  return pricingData.value.price_per_sqm > 0 &&
         pricingData.value.total_price > 0
})

const canProceedStep4 = computed(() => {
  if (pricingData.value.payment_method === 'full') return true
  // Must select an alternative if calculator settings exist
  if (hasCalculatorSettings.value) {
    return selectedAlternative.value !== null
  }
  return false // Block if no settings (user sees error in UI)
})

const selectedApartment = computed(() => apartmentSelector.selectedApartment.value)

// Step titles
const stepTitles = computed(() => [
  t('admin.crm.sold_deal.steps.customer'),
  t('admin.crm.sold_deal.steps.unit'),
  t('admin.crm.sold_deal.steps.pricing'),
  t('admin.crm.sold_deal.steps.schedule')
])

// Watch apartment selection to auto-calculate total price
watch(() => apartmentSelector.selectedApartmentId.value, () => {
  if (selectedApartment.value && pricingData.value.price_per_sqm > 0) {
    pricingData.value.total_price = pricingData.value.price_per_sqm * (selectedApartment.value.area_total || 0)
  }
})

// Watch price per sqm to update total
watch(() => pricingData.value.price_per_sqm, (newPriceSqm) => {
  if (selectedApartment.value) {
    pricingData.value.total_price = newPriceSqm * (selectedApartment.value.area_total || 0)
  }
})

// Watch total to update price per sqm
function handleTotalChange() {
  if (selectedApartment.value && selectedApartment.value.area_total) {
    pricingData.value.price_per_sqm = pricingData.value.total_price / selectedApartment.value.area_total
  }
}

// Validation
function validateStep(step: number): boolean {
  if (step === 1) {
    if (!canProceedStep1.value) {
      toast.error(t('admin.crm.messages.validation.required_fields'))
      return false
    }

    // Phone validation
    const phoneRegex = /^[\d\s+\-()]+$/
    if (!phoneRegex.test(customerData.value.phone)) {
      toast.error(t('admin.crm.messages.validation.invalid_phone'))
      return false
    }

    // Email validation (if provided)
    if (customerData.value.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(customerData.value.email)) {
        toast.error(t('admin.crm.messages.validation.invalid_email'))
        return false
      }
    }
    return true
  }

  if (step === 2) {
    if (!canProceedStep2.value) {
      toast.error(t('admin.crm.messages.validation.select_apartment'))
      return false
    }
    return true
  }

  if (step === 3) {
    if (!canProceedStep3.value) {
      toast.error(t('admin.crm.messages.validation.valid_pricing'))
      return false
    }
    return true
  }

  if (step === 4) {
    if (!canProceedStep4.value) {
       toast.error(t('admin.crm.messages.validation.select_alternative'))
       return false
    }
    return true
  }

  return true
}

// Navigation
function nextStep() {
  if (validateStep(currentStep.value)) {
    if (currentStep.value === 3 && pricingData.value.payment_method === 'full') {
      // Skip payment schedule step for full payment
      handleCreate()
    } else if (currentStep.value < 4) {
      currentStep.value++
    }
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Create sold deal
async function handleCreate() {
  if (!validateStep(currentStep.value)) return

  isCreating.value = true
  try {
    const requestData: Parameters<typeof crmApi.createSoldDeal>[0] = {
      customer: {
        name: customerData.value.name,
        surname: customerData.value.surname || undefined,
        phone: customerData.value.phone,
        email: customerData.value.email || undefined,
      },
      apartment_id: apartmentSelector.selectedApartmentId.value!,
      final_price_per_sqm: pricingData.value.price_per_sqm,
      notes: undefined,
    }

    // Add payment schedule if payment plan selected
    if (pricingData.value.payment_method === 'payment_plan') {
      if (selectedAlternative.value) {
        requestData.payment_alternative = selectedAlternative.value
        requestData.payment_params = {
           initial_payment_percent: downPaymentPercent.value,
           price_per_sqm: pricingData.value.price_per_sqm,
           internal_installment_months: scheduleData.value.number_of_installments,
           start_date: scheduleData.value.start_date,
           // Include list of paid installments
           paid_installments: retrospectivePayments.value
            .filter(p => p.isPaid)
            .map(p => p.month)
        }
      }
    }

    const createdDeal = await crmApi.createSoldDeal(requestData)

    toast.success(t('admin.crm.messages.deal_created'))
    resetForm()
    emit('created', createdDeal.id)
    emit('close')
  } catch (error: unknown) {
    console.error('Failed to create sold deal:', error)
    const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || t('admin.crm.messages.create_failed')
    toast.error(errorMessage)
  } finally {
    isCreating.value = false
  }
}

// Reset form
function resetForm() {
  currentStep.value = 1
  customerData.value = {
    name: '',
    surname: '',
    phone: '',
    email: '',
  }
  pricingData.value = {
    price_per_sqm: 0,
    total_price: 0,
    payment_method: 'payment_plan',
  }
  // Reset calculator state
  selectedAlternative.value = null
  downPaymentPercent.value = 20
  monthlyPayment.value = 0
  retrospectivePayments.value = []
  
  scheduleData.value = {
    payment_alternative: null,
    down_payment: 0,
    number_of_installments: 12,
    start_date: new Date().toISOString().split('T')[0],
    interval_months: 1,
  }
  apartmentSelector.reset()
}

// Handle close
function handleClose() {
  if (!isCreating.value) {
    resetForm()
    emit('close')
  }
}

// Get localized building name
function getLocalizedName(item: { name?: string | Record<string, string>; title?: string | Record<string, string> } | null | undefined): string {
  if (!item) return ''
  const nameVal = item.name || item.title
  if (typeof nameVal === 'object' && nameVal !== null) {
    return nameVal.en || nameVal.ka || nameVal.ru || Object.values(nameVal)[0] || ''
  }
  return String(nameVal || '')
}

</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        @click="handleClose"
      ></div>

      <!-- Modal Container -->
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4 overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6 flex-shrink-0 relative overflow-hidden">
          <div class="relative z-10 flex items-center justify-between">
            <div>
               <h3 class="text-lg font-bold text-white tracking-tight">{{ t('admin.crm.sold_deal.title') }}</h3>
               <p class="text-sm text-emerald-100 mt-1 font-medium">{{ t('admin.crm.sold_deal.subtitle') }}</p>
            </div>
            <button @click="handleClose" class="text-emerald-100 hover:text-white transition-colors p-1 bg-white/10 hover:bg-white/20 rounded-lg">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
          
          <!-- Decorative Pattern -->
          <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        </div>

        <!-- Progress Steps -->
        <div class="px-6 py-4 border-b border-gray-100 bg-white">
          <div class="flex items-center justify-between relative">
            <!-- Background Line -->
            <div class="absolute left-0 top-1/2 w-full h-0.5 bg-gray-100 -z-10 transform -translate-y-1/2 rounded-full"></div>
            
            <div
              v-for="(title, index) in stepTitles"
              :key="index"
              class="relative z-10 flex flex-col items-center group cursor-pointer"
              @click="currentStep > index + 1 ? currentStep = index + 1 : null"
            >
              <!-- Step circle -->
              <div
                class="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 border-2"
                :class="
                  currentStep > index + 1
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : currentStep === index + 1
                    ? 'bg-white border-emerald-500 text-emerald-600 shadow-md ring-4 ring-emerald-50'
                    : 'bg-white border-gray-200 text-gray-400'
                "
              >
                <Check v-if="currentStep > index + 1" class="w-4 h-4" />
                <span v-else>{{ index + 1 }}</span>
              </div>

              <!-- Step label -->
              <span
                class="mt-2 text-[10px] uppercase font-bold tracking-wider transition-colors duration-300"
                :class="currentStep >= index + 1 ? 'text-emerald-700' : 'text-gray-400'"
              >
                {{ title }}
              </span>
            </div>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="p-8 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/30">
          
          <!-- Step 1: Customer Information -->
          <div v-if="currentStep === 1" class="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h4 class="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">{{ t('admin.crm.sold_deal.customer_details') }}</h4>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="group">
                 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">{{ t('admin.crm.form.first_name') }} <span class="text-red-500">*</span></label>
                 <div class="relative">
                   <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                     <User class="h-4 w-4 text-gray-400" />
                   </div>
                   <input
                     v-model="customerData.name"
                     type="text"
                     class="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 placeholder-gray-400 transition-all font-medium shadow-sm"
                     :placeholder="t('admin.crm.form.first_name_placeholder')"
                   />
                 </div>
              </div>
              <div class="group">
                 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">{{ t('admin.crm.form.last_name') }}</label>
                 <div class="relative">
                   <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                     <User class="h-4 w-4 text-gray-400" />
                   </div>
                   <input
                     v-model="customerData.surname"
                     type="text"
                     class="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 placeholder-gray-400 transition-all font-medium shadow-sm"
                     :placeholder="t('admin.crm.form.last_name_placeholder')"
                   />
                 </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div class="group">
                 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">{{ t('admin.crm.form.phone') }} <span class="text-red-500">*</span></label>
                 <div class="relative">
                   <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                     <Phone class="h-4 w-4 text-gray-400" />
                   </div>
                   <input
                     v-model="customerData.phone"
                     type="tel"
                     class="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 placeholder-gray-400 transition-all font-medium shadow-sm"
                     :placeholder="t('admin.crm.form.phone_placeholder')"
                   />
                 </div>
              </div>
              <div class="group">
                 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">{{ t('admin.crm.form.email') }}</label>
                 <div class="relative">
                   <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-emerald-500">
                     <Mail class="h-4 w-4 text-gray-400" />
                   </div>
                   <input
                     v-model="customerData.email"
                     type="email"
                     class="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 placeholder-gray-400 transition-all font-medium shadow-sm"
                     :placeholder="t('admin.crm.form.email_placeholder')"
                   />
                 </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Apartment Selection -->
          <div v-if="currentStep === 2" class="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h4 class="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">{{ t('admin.crm.sold_deal.select_unit') }}</h4>
            
            <div class="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
               <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                   <label class="block text-xs font-medium text-gray-500 mb-1.5">{{ t('admin.crm.form.project') }} *</label>
                   <select
                     v-model="apartmentSelector.selectedProjectId.value"
                     class="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-gray-900 transition-all shadow-sm"
                   >
                     <option :value="null">{{ t('admin.crm.form.select_project') }}</option>
                     <option v-for="project in apartmentSelector.projects.value" :key="project.id" :value="project.id">
                       {{ project.title }}
                     </option>
                   </select>
                 </div>

                 <div>
                   <label class="block text-xs font-medium text-gray-500 mb-1.5" :class="{'opacity-50': !apartmentSelector.selectedProjectId.value}">{{ t('admin.crm.form.building') }} *</label>
                   <select
                     v-model="apartmentSelector.selectedBuildingId.value"
                     class="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-gray-900 transition-all shadow-sm disabled:bg-gray-100"
                     :disabled="apartmentSelector.loadingBuildings.value || !apartmentSelector.selectedProjectId.value"
                   >
                     <option :value="null">{{ t('admin.crm.form.select_building') }}</option>
                     <option v-for="building in apartmentSelector.buildings.value" :key="building.id" :value="building.id">
                       {{ getLocalizedName(building) }}
                     </option>
                   </select>
                 </div>

                 <div>
                   <label class="block text-xs font-medium text-gray-500 mb-1.5" :class="{'opacity-50': !apartmentSelector.selectedBuildingId.value}">{{ t('admin.crm.form.floor') }} *</label>
                   <select
                     v-model="apartmentSelector.selectedFloor.value"
                     class="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-gray-900 transition-all shadow-sm disabled:bg-gray-100"
                     :disabled="apartmentSelector.loadingFloors.value || !apartmentSelector.selectedBuildingId.value"
                   >
                     <option :value="null">{{ t('admin.crm.form.select_floor') }}</option>
                     <option v-for="floor in apartmentSelector.availableFloors.value" :key="floor" :value="floor">
                       {{ t('admin.crm.form.floor_number', { number: floor }) }}
                     </option>
                   </select>
                 </div>

                 <div>
                   <label class="block text-xs font-medium text-gray-500 mb-1.5" :class="{'opacity-50': apartmentSelector.selectedFloor.value === null}">{{ t('admin.crm.form.apartment') }} *</label>
                   <select
                     v-model="apartmentSelector.selectedApartmentId.value"
                     class="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-gray-900 transition-all shadow-sm disabled:bg-gray-100"
                     :disabled="apartmentSelector.loadingApartments.value || apartmentSelector.selectedFloor.value === null"
                   >
                     <option :value="null">{{ t('admin.crm.form.select_apartment') }}</option>
                     <option v-for="apt in apartmentSelector.availableApartments.value" :key="apt.id" :value="apt.id">
                       #{{ apt.apartment_number }} ({{ apt.area_total }}m²)
                     </option>
                   </select>
                 </div>
               </div>

               <!-- Selection Summary -->
               <div v-if="selectedApartment" class="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-4 animate-in fade-in zoom-in duration-300">
                 <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                   <Building class="h-6 w-6" />
                 </div>
                 <div>
                   <span class="text-xs font-bold text-emerald-600 uppercase tracking-widest">{{ t('admin.crm.sold_deal.selected_unit') }}</span>
                   <p class="text-lg font-bold text-gray-900">{{ t('admin.crm.form.apartment') }} #{{ selectedApartment.apartment_number }}</p>
                   <p class="text-sm text-gray-600">{{ selectedApartment.area_total }}m² • {{ t(`admin.apartments.status.${selectedApartment.status}`) }}</p>
                 </div>
               </div>
            </div>
          </div>

          <!-- Step 3: Pricing -->
          <div v-if="currentStep === 3" class="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h4 class="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">{{ t('admin.crm.sold_deal.pricing_terms') }}</h4>
            
            <div v-if="selectedApartment" class="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm mb-4 text-sm text-gray-600">
               <Building class="w-4 h-4 text-gray-400" />
               <span>{{ t('admin.crm.form.apartment') }} #{{ selectedApartment.apartment_number }} ({{ selectedApartment.area_total }}m²)</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div class="group">
                 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">{{ t('admin.crm.form.price_per_sqm') }} ({{ t('admin.crm.currencies.usd') }}) <span class="text-red-500">*</span></label>
                 <div class="relative">
                   <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600 font-bold">
                     $
                   </div>
                   <input
                     v-model.number="pricingData.price_per_sqm"
                     type="number"
                     min="0"
                     step="0.01"
                     class="w-full pl-8 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-lg text-gray-900 placeholder-gray-300 shadow-sm transition-all"
                     placeholder="0.00"
                   />
                 </div>
               </div>

               <div class="group">
                 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">{{ t('admin.crm.payment.total_amount') }} ({{ t('admin.crm.currencies.usd') }}) <span class="text-red-500">*</span></label>
                 <div class="relative">
                   <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600 font-bold">
                     $
                   </div>
                   <input
                     v-model.number="pricingData.total_price"
                     type="number"
                     min="0"
                     step="0.01"
                     class="w-full pl-8 pr-4 py-3 bg-emerald-50/50 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-lg text-emerald-700 placeholder-gray-300 shadow-sm transition-all"
                     placeholder="0.00"
                     @input="handleTotalChange"
                   />
                 </div>
               </div>
            </div>

            <div class="pt-4">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-1">{{ t('admin.crm.payment.payment_method') }} <span class="text-red-500">*</span></label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label 
                  class="relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200"
                  :class="pricingData.payment_method === 'full' 
                    ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-sm' 
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'"
                >
                  <input
                    v-model="pricingData.payment_method"
                    type="radio"
                    value="full"
                    class="sr-only"
                  />
                  <div class="w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-colors"
                     :class="pricingData.payment_method === 'full' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 bg-white'"
                  >
                     <div class="w-2 h-2 rounded-full bg-white" v-if="pricingData.payment_method === 'full'"></div>
                  </div>
                  <div>
                     <span class="block text-sm font-bold text-gray-900">{{ t('admin.crm.sold_deal.full_payment') }}</span>
                     <span class="text-xs text-gray-500">{{ t('admin.crm.sold_deal.full_payment_desc') }}</span>
                  </div>
                </label>

                <label 
                  class="relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200"
                  :class="pricingData.payment_method === 'payment_plan' 
                    ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500 shadow-sm' 
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'"
                >
                  <input
                    v-model="pricingData.payment_method"
                    type="radio"
                    value="payment_plan"
                    class="sr-only"
                  />
                  <div class="w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-colors"
                     :class="pricingData.payment_method === 'payment_plan' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 bg-white'"
                  >
                     <div class="w-2 h-2 rounded-full bg-white" v-if="pricingData.payment_method === 'payment_plan'"></div>
                  </div>
                  <div>
                     <span class="block text-sm font-bold text-gray-900">{{ t('admin.crm.sold_deal.payment_plan') }}</span>
                     <span class="text-xs text-gray-500">{{ t('admin.crm.sold_deal.payment_plan_desc') }}</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Step 4: Payment Schedule -->
          <div v-if="currentStep === 4" class="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h4 class="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2">{{ t('admin.crm.sold_deal.schedule_config') }}</h4>

            <div class="p-4 bg-gray-900 rounded-xl text-white shadow-lg flex justify-between items-center">
               <span class="text-sm text-gray-400 font-medium">{{ t('admin.crm.sold_deal.total_contract_value') }}</span>
               <span class="text-xl font-bold tracking-tight">{{ formatNumber(pricingData.total_price) }} {{ getCurrencySymbol('USD') }}</span>
            </div>

            <!-- Calculator Settings Panel -->
            <div v-if="hasCalculatorSettings" class="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 p-5 bg-gray-50 rounded-xl border border-gray-100">
              <!-- Down Payment Control -->
              <div>
                <div class="flex items-center justify-between mb-2">
                    <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {{ t('admin.crm.payment.down_payment') }}
                    </label>
                    <!-- Toggle -->
                    <div class="flex bg-gray-100 rounded-lg p-0.5">
                        <button 
                            @click="downPaymentMode = 'percent'"
                            :class="['px-2 py-0.5 text-xs font-medium rounded-md transition-all', downPaymentMode === 'percent' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                        >%</button>
                        <button 
                            @click="downPaymentMode = 'amount'"
                            :class="['px-2 py-0.5 text-xs font-medium rounded-md transition-all', downPaymentMode === 'amount' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700']"
                        >$</button>
                    </div>
                </div>

                <!-- Percent Mode: Slider -->
                <div v-if="downPaymentMode === 'percent'">
                    <div class="flex items-center gap-4">
                       <input
                        type="range"
                         v-model.number="downPaymentPercent"
                         :min="currentConstraints?.downPayment.min || 0"
                         :max="currentConstraints?.downPayment.max || 100"
                         :disabled="!selectedAlternative || isDownPaymentFixed"
                         step="1" 
                         :class="[
                           'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600',
                           (!selectedAlternative || isDownPaymentFixed) && 'opacity-50 cursor-not-allowed'
                         ]"
                       />
                       <span class="text-lg font-bold text-gray-900 w-12 text-right">{{ parseFloat(downPaymentPercent.toFixed(2)) }}%</span>
                    </div>
                     <p v-if="currentConstraints" class="mt-2 text-xs text-gray-500 flex items-center gap-1">
                       <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                       {{ t('admin.crm.pricing.constraints.down_payment_range', { min: currentConstraints.downPayment.min, max: currentConstraints.downPayment.max }) }}
                     </p>
                     <!-- Amount Display -->
                     <div class="mt-2 text-sm text-emerald-600 font-medium">
                        {{ t('admin.crm.payment.amount') }}: {{ formatNumber(downPaymentAmount) }} {{ getCurrencySymbol('USD') }}
                     </div>
                </div>

                <!-- Amount Mode: Input -->
                <div v-else>
                     <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold">
                          $
                        </div>
                        <input
                          v-model.number="downPaymentAmount"
                          type="number"
                          :min="Math.round(pricingData.total_price * (currentConstraints?.downPayment.min || 0) / 100)"
                          :max="Math.round(pricingData.total_price * 1)"
                          :disabled="!selectedAlternative || isDownPaymentFixed"
                          class="block w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-gray-900 placeholder-gray-300 transition-all disabled:bg-gray-100 disabled:text-gray-400"
                        />
                     </div>
                     <p v-if="currentConstraints" class="mt-2 text-xs text-gray-500 flex items-center gap-1">
                       <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                       {{ t('common.min') }}: {{ formatNumber(Math.round(pricingData.total_price * (currentConstraints.downPayment.min / 100))) }} - {{ t('common.max') }}: {{ formatNumber(Math.round(pricingData.total_price * (currentConstraints.downPayment.max / 100))) }}
                     </p>
                     <!-- Percent Display -->
                     <div class="mt-2 text-sm text-emerald-600 font-medium">
                        {{ parseFloat(downPaymentPercent.toFixed(2)) }}%
                     </div>
                </div>
              </div>

              <!-- Monthly Payment Input -->
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                   {{ t('admin.crm.payment.monthly_payment') }} ({{ getCurrencySymbol('USD') }})
                </label>
                 <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold">
                      $
                    </div>
                    <input
                      v-model.number="monthlyPayment"
                      type="number"
                      :min="currentConstraints?.monthlyPayment || 0"
                      :disabled="!selectedAlternative"
                      class="block w-full pl-8 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-gray-900 placeholder-gray-300 transition-all disabled:bg-gray-100 disabled:text-gray-400"
                    />
                 </div>
                <p v-if="currentConstraints?.monthlyPayment" class="mt-2 text-xs text-gray-500 flex items-center gap-1">
                   <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                   {{ t('admin.crm.pricing.constraints.min_monthly', { amount: getCurrencySymbol('USD') + currentConstraints.monthlyPayment }) }}
                </p>
              </div>

              <!-- Start Date Input -->
              <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                   {{ t('admin.crm.sold_deal.start_date') }}
                </label>
                 <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Calendar class="w-4 h-4" />
                    </div>
                    <input
                      v-model="scheduleData.start_date"
                      type="date"
                      class="block w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-gray-900 transition-all"
                    />
                 </div>
              </div>
            </div>
            
            <!-- Alternatives Grid -->
            <div class="space-y-4">
               <h4 v-if="hasCalculatorSettings" class="text-sm font-medium text-gray-900">{{ t('admin.crm.pricing.payment_alternatives') }}</h4>
               
               <div v-if="!hasCalculatorSettings" class="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <div class="text-gray-400 mb-2">
                     <svg class="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                  </div>
                  <p class="text-sm text-gray-500">{{ t('admin.crm.pricing.no_calculator') }}</p>
                  <p class="text-xs text-gray-400 mt-1">Check project settings</p>
               </div>

               <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div
                    v-for="alt in calculatedAlternatives"
                    :key="alt.id"
                    @click="!isAlternativeDisabled(alt.id) && selectAlternative(alt.id)"
                    :class="[
                      'relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200',
                      selectedAlternative === alt.id
                        ? 'border-emerald-500 bg-emerald-50/30'
                        : isAlternativeDisabled(alt.id)
                        ? 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                        : 'border-gray-200 hover:border-emerald-200 hover:shadow-sm'
                    ]"
                  >
                      <!-- Selection Checkmark -->
                      <div v-if="selectedAlternative === alt.id" class="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-sm z-10">
                         <Check class="w-3 h-3" stroke-width="3" />
                      </div>

                      <!-- Disabled Badge -->
                      <div v-if="isAlternativeDisabled(alt.id)" class="absolute top-2 right-2">
                        <span class="px-2 py-0.5 text-[10px] uppercase bg-gray-200 text-gray-500 rounded font-bold tracking-wider">
                          {{ t('admin.crm.pricing.alternative_disabled') }}
                        </span>
                      </div>

                      <!-- Header -->
                      <div class="mb-4">
                        <div class="flex items-center gap-2 mb-1">
                           <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Option {{ alt.id }}</span>
                        </div>
                        <h4 class="text-sm font-bold text-gray-900 leading-tight">
                           {{ getAlternativeInfo(alt.id)?.title[currentLanguage] }}
                        </h4>
                        <p class="text-xs text-gray-500 mt-1 line-clamp-2">
                           {{ getAlternativeInfo(alt.id)?.description[currentLanguage] }}
                        </p>
                      </div>

                      <!-- Results -->
                      <div class="space-y-2 text-sm">
                         <!-- Down Payment -->
                         <div class="flex justify-between items-center py-1 border-b border-gray-100 border-dashed">
                            <span class="text-gray-500 text-xs">{{ t('admin.crm.payment.down_payment') }}</span>
                            <span class="font-bold text-gray-900">{{ formatNumber(alt.result.downPayment) }} {{ getCurrencySymbol('USD') }}</span>
                         </div>
                         
                         <!-- Monthly Payment -->
                         <div v-if="alt.result.monthlyPayment > 0" class="flex justify-between items-center py-1 border-b border-gray-100 border-dashed">
                            <span class="text-gray-500 text-xs">{{ t('admin.crm.payment.monthly_payment') }}</span>
                            <span class="font-bold text-gray-900">{{ formatNumber(alt.result.monthlyPayment) }} {{ getCurrencySymbol('USD') }}</span>
                         </div>

                         <!-- Installments Count -->
                          <div v-if="alt.result.numberOfMonths > 0" class="flex justify-between items-center py-1 border-b border-gray-100 border-dashed">
                            <span class="text-gray-500 text-xs">{{ t('admin.crm.payment.installments') }}</span>
                            <span class="font-medium text-gray-700">{{ alt.result.numberOfMonths }}</span>
                         </div>

                         <!-- Total -->
                         <div class="flex justify-between items-center pt-2 mt-2">
                            <span class="font-bold text-gray-900 text-xs uppercase">{{ t('admin.crm.payment.total') }}</span>
                            <span class="font-bolder text-emerald-600">{{ formatNumber(alt.result.totalPrice) }} {{ getCurrencySymbol('USD') }}</span>
                         </div>
                      </div>
                  </div>
               </div>
            </div>

            <!-- Retrospective Payments Review -->
            <div v-if="retrospectivePayments.length > 0" class="mt-6 bg-amber-50 rounded-xl border border-amber-200 p-5 animate-in fade-in zoom-in-95 duration-300">
               <h4 class="flex items-center gap-2 text-sm font-bold text-amber-900 mb-3">
                  <AlertTriangle class="w-4 h-4 text-amber-600" />
                  {{ t('admin.crm.payment.retrospective_payments') }}
               </h4>
               <p class="text-xs text-amber-700 mb-4">{{ t('admin.crm.payment.retrospective_desc') }}</p>
               
               <div class="space-y-2">
                  <div v-for="(payment, idx) in retrospectivePayments" :key="idx" class="flex items-center justify-between bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                     <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs">
                           {{ payment.month === 0 ? 'DP' : payment.month }}
                        </div>
                        <div>
                           <p class="text-sm font-medium text-gray-900">{{ payment.description }}</p>
                           <p class="text-xs text-gray-500">{{ formatDate(payment.date) }}</p>
                        </div>
                     </div>
                     <div class="flex items-center gap-4">
                        <span class="font-bold text-gray-900">{{ formatNumber(payment.amount) }} {{ getCurrencySymbol('USD') }}</span>
                        <label class="flex items-center gap-2 cursor-pointer">
                           <input type="checkbox" v-model="payment.isPaid" class="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500" />
                           <span class="text-xs font-medium" :class="payment.isPaid ? 'text-emerald-600' : 'text-gray-500'">
                              {{ payment.isPaid ? t('admin.crm.payment.paid') : t('admin.crm.payment.pending') }}
                           </span>
                        </label>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-8 py-5 bg-white border-t border-gray-100 flex justify-between gap-3 flex-shrink-0 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
          <button
            v-if="currentStep > 1"
            class="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all flex items-center gap-2"
            @click="prevStep"
            :disabled="isCreating"
          >
            <ChevronLeft class="w-4 h-4" />
            {{ t('admin.crm.form.back') }}
          </button>
          <div v-else>
             <button
               class="px-5 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
               @click="handleClose"
               :disabled="isCreating"
             >
               {{ t('admin.crm.form.cancel') }}
             </button>
          </div>

          <button
            v-if="currentStep < 4 || (currentStep === 3 && pricingData.payment_method === 'full')"
            class="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transform transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            @click="nextStep"
            :disabled="
              (currentStep === 1 && !canProceedStep1) ||
              (currentStep === 2 && !canProceedStep2) ||
              (currentStep === 3 && !canProceedStep3)
            "
          >
            <span v-if="currentStep === 3 && pricingData.payment_method === 'full'">{{ t('admin.crm.sold_deal.create_deal') }}</span>
            <span v-else>{{ t('admin.crm.form.next') }}</span>
            <ChevronRight class="w-4 h-4" />
          </button>
          <button
            v-if="currentStep === 4"
            class="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transform transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
            @click="handleCreate"
            :disabled="isCreating"
          >
            <span v-if="isCreating" class="flex items-center gap-2">
               <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               {{ t('admin.crm.form.creating') }}
            </span>
            <span v-else class="flex items-center gap-2">
               {{ t('admin.crm.sold_deal.create_deal') }}
               <Check class="w-4 h-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
