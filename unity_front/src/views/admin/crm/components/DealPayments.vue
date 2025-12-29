<script setup lang="ts">
/**
 * Deal Payments Component
 * Payment schedule management for a deal
 * NOW SUPPORTS: Calculator-generated payment schedules + manual entry fallback
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useLocaleFormatter } from '@/composables/i18n/useLocaleFormatter'
import { useAlternativeDescriptions } from '@/composables/calculator/useAlternativeDescriptions'
import { useCrmStore } from '@/stores/admin/crm'
import type { CrmDeal, PaymentScheduleData, PaymentStatus, CrmPayment } from '@/types/crm'
import type { ProjectCalculatorSettings } from '@/types/admin/calculator'
import { CURRENCY_SYMBOLS } from '@/types/crm'
import PaymentScheduleModal from './PaymentScheduleModal.vue'
import MarkPaymentModal from './MarkPaymentModal.vue'
import EditPaymentModal from './EditPaymentModal.vue'

// Props
interface Props {
  deal: CrmDeal
}

const props = defineProps<Props>()

// Composables
const { t } = useTranslations()
const { formatNumber: formatNum, formatDate: formatDt } = useLocaleFormatter()

// Store
const crmStore = useCrmStore()

// Get calculator settings for alternative descriptions
const calculatorSettings = computed(() => {
  const settings = props.deal?.apartment?.building?.project?.calculator_settings ?? null
  return settings as ProjectCalculatorSettings | null
})

// Get alternative descriptions with dynamic constraints
const alternativeDescriptions = useAlternativeDescriptions(calculatorSettings.value)

// Get current language for alternative title
const currentLanguage = computed<'ka' | 'en' | 'ru'>(() => {
  const savedLang = localStorage.getItem('language')
  if (savedLang === 'ka' || savedLang === 'en' || savedLang === 'ru') {
    return savedLang
  }
  return 'en'
})

// Get alternative title in current language
const alternativeTitle = computed(() => {
  if (!props.deal?.selected_payment_alternative) return null
  const alt = alternativeDescriptions.find(a => a.id === props.deal.selected_payment_alternative)
  return alt ? alt.title[currentLanguage.value] : `${t('admin.crm.pricing.option')} ${props.deal.selected_payment_alternative}`
})

// State
const showScheduleModal = ref(false)
const showMarkPaidModal = ref(false)
const showEditModal = ref(false)
const selectedPayment = ref<CrmPayment | null>(null)
const isLoading = ref(false)
const isGenerating = ref(false)
const isRegenerating = ref(false)
let timeoutId: ReturnType<typeof setTimeout> | null = null

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Computed
const currencySymbol = computed(() => CURRENCY_SYMBOLS[props.deal.currency])

// Check if calculator-generated schedule exists
const hasCalculatorSchedule = computed(() => {
  return Array.isArray(crmStore.dealPayments) && crmStore.dealPayments.some(p => p.calculator_generated)
})

// Check if any payments exist (manual or calculator-generated)
const hasAnyPayments = computed(() => {
  return Array.isArray(crmStore.dealPayments) && crmStore.dealPayments.length > 0
})

// Use summary from backend for totals
const totalPaid = computed(() => {
  return crmStore.paymentSummary?.total_paid ?? 0
})

const totalDue = computed(() => {
  return crmStore.paymentSummary?.total_due ?? 0
})

const paymentProgress = computed(() => {
  return crmStore.paymentSummary?.payment_progress ?? 0
})

// Calculate remaining balance
const remainingBalance = computed(() => {
  return totalDue.value - totalPaid.value
})

// Use pagination metadata from backend
const totalPages = computed(() => {
  return crmStore.paymentPagination?.last_page ?? 0
})

const totalPaymentsCount = computed(() => {
  return crmStore.paymentPagination?.total ?? 0
})

const hasMultiplePages = computed(() => totalPages.value > 1)

// Safe payments count for template (current page)
const paymentsCount = computed(() => {
  return Array.isArray(crmStore.dealPayments) ? crmStore.dealPayments.length : 0
})

// Pagination controls - now fetches from backend
async function goToPage(page: number): Promise<void> {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    await loadPayments(page)
  }
}

async function nextPage(): Promise<void> {
  if (currentPage.value < totalPages.value) {
    await goToPage(currentPage.value + 1)
  }
}

async function prevPage(): Promise<void> {
  if (currentPage.value > 1) {
    await goToPage(currentPage.value - 1)
  }
}

// Error state
const loadError = ref<string | null>(null)

// Load payments on mount
onMounted(async () => {
  await loadPayments()
})

// Clean up timeout on unmount
onBeforeUnmount(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
})

// Reset pagination when payments change
function resetPagination(): void {
  currentPage.value = 1
}

// Load payments with timeout - now supports backend pagination
async function loadPayments(page: number = 1): Promise<void> {
  isLoading.value = true
  loadError.value = null

  let timedOut = false

  // Clear any existing timeout
  if (timeoutId) {
    clearTimeout(timeoutId)
  }

  // Timeout failsafe
  timeoutId = setTimeout(() => {
    timedOut = true
    isLoading.value = false
    loadError.value = t('admin.crm.messages.timeout')
  }, 10000) // 10 second timeout

  try {
    await crmStore.fetchPayments(props.deal.id, page, itemsPerPage.value)
    if (!timedOut && timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
    // Don't reset pagination when loading a specific page
    if (page === 1) {
      resetPagination()
    }
  } catch (error) {
    console.error('Failed to load payments:', error)
    if (!timedOut && timeoutId) {
      loadError.value = t('admin.crm.messages.payments_load_failed')
      clearTimeout(timeoutId)
      timeoutId = null
    }
  } finally {
    if (!timedOut) {
      isLoading.value = false
    }
  }
}

// Handle generate schedule (manual entry)
async function handleGenerateSchedule(data: PaymentScheduleData): Promise<void> {
  try {
    await crmStore.generatePaymentSchedule(props.deal.id, data)
    showScheduleModal.value = false
  } catch (error) {
    console.error('Failed to generate schedule:', error)
  }
}

// Handle generate from existing pricing
async function handleGenerateFromPricing(): Promise<void> {
  isGenerating.value = true
  try {
    await crmStore.regeneratePaymentSchedule(props.deal.id, 1, itemsPerPage.value)
    resetPagination()
  } catch (error) {
    console.error('Failed to generate payment schedule from pricing:', error)
  } finally {
    isGenerating.value = false
  }
}

// Open mark as paid modal
function openMarkPaidModal(payment: CrmPayment): void {
  selectedPayment.value = payment
  showMarkPaidModal.value = true
}

// Handle mark as paid submission
async function handleMarkPaidSubmit(data: {
  paymentId: number
  paidDate: string
  amountPaid: number
  paymentMethod: string | null
  transactionReference: string | null
  notes: string | null
}): Promise<void> {
  try {
    await crmStore.markPaymentAsPaid(data.paymentId, {
      paidDate: data.paidDate,
      amountPaid: data.amountPaid,
      paymentMethod: data.paymentMethod,
      transactionReference: data.transactionReference,
      notes: data.notes,
    })
    showMarkPaidModal.value = false
    selectedPayment.value = null
  } catch (error) {
    console.error('Failed to mark payment as paid:', error)
  }
}

// Open edit payment modal
function openEditModal(payment: CrmPayment): void {
  selectedPayment.value = payment
  showEditModal.value = true
}

// Handle edit payment submission
async function handleEditSubmit(data: {
  paymentId: number
  newAmount: number
  reason: string
  notes: string
}): Promise<void> {
  try {
    await crmStore.editPaymentAmount(data.paymentId, {
      newAmount: data.newAmount,
      reason: data.reason,
      notes: data.notes,
    })
    showEditModal.value = false
    selectedPayment.value = null
  } catch (error) {
    console.error('Failed to edit payment amount:', error)
  }
}

// Handle regenerate schedule
async function handleRegenerateSchedule(): Promise<void> {
  // Confirmation dialog
  const confirmed = confirm(
    t('admin.crm.payment.confirm_regenerate') ||
    'This will recalculate the payment schedule based on current pricing. Paid payments will be preserved. Continue?'
  )
  if (!confirmed) return

  isRegenerating.value = true
  try {
    await crmStore.regeneratePaymentSchedule(props.deal.id)
    resetPagination()
  } catch (error) {
    console.error('Failed to regenerate payment schedule:', error)
  } finally {
    isRegenerating.value = false
  }
}

// Get status badge class
function getStatusClass(status: PaymentStatus): string {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'overdue':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'partially_paid':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'cancelled':
      return 'bg-gray-100 text-gray-700 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

// Get status label
function getStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case 'paid':
      return t('admin.crm.payment.status.paid')
    case 'pending':
      return t('admin.crm.payment.status.pending')
    case 'overdue':
      return t('admin.crm.payment.status.overdue')
    case 'partially_paid':
      return t('admin.crm.payment.status.partially_paid')
    case 'cancelled':
      return t('admin.crm.payment.status.cancelled')
    default:
      return status
  }
}

// Format number with null handling
function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0'
  return formatNum(value, { maximumFractionDigits: 0 })
}

// Format date
function formatDate(dateStr: string): string {
  return formatDt(dateStr, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Error State -->
    <div v-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-red-800">{{ loadError }}</p>
          <button
            @click="() => loadPayments()"
            class="mt-2 text-sm text-red-700 hover:text-red-900 underline"
          >
            {{ t('admin.crm.messages.retry') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="text-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"
      ></div>
      <p class="mt-4 text-gray-700 text-sm">{{ t('admin.crm.messages.loading') }}</p>
    </div>

    <!-- PAYMENT SCHEDULE VIEW (Calculator or Manual) -->
    <template v-else-if="hasAnyPayments">
      <!-- Header with Alternative Info -->
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-semibold text-gray-900">{{ t('admin.crm.payment.schedule') }}</h4>
          <p class="text-sm text-gray-600 mt-1">
            <span v-if="alternativeTitle" class="font-medium text-blue-700">
              {{ alternativeTitle }}
            </span>
            <span v-else-if="deal.selected_payment_alternative">
              {{ t('admin.crm.pricing.option') }} {{ deal.selected_payment_alternative }}
            </span>
            <span class="mx-2">•</span>
            {{ totalPaymentsCount }} {{ t('admin.crm.payment.installments') }}
            <span v-if="!hasCalculatorSchedule" class="text-amber-600 ml-2">({{ t('admin.crm.payment.create_manual_schedule') }})</span>
          </p>
        </div>
        <button
          v-if="deal.selected_payment_alternative"
          @click="handleRegenerateSchedule"
          :disabled="isRegenerating"
          class="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg v-if="!isRegenerating" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <svg v-else class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ isRegenerating ? t('admin.crm.messages.saving') : t('admin.crm.payment.regenerate') }}
        </button>
      </div>

      <!-- Progress Bar -->
      <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-semibold text-gray-700">{{ t('admin.crm.payment.progress') }}</span>
          <span class="text-2xl font-bold text-blue-600">{{ paymentProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            class="h-4 rounded-full transition-all duration-500 ease-out"
            :class="paymentProgress === 100 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-indigo-600'"
            :style="{ width: `${paymentProgress}%` }"
          ></div>
        </div>
        <div class="grid grid-cols-3 gap-3 mt-3 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-green-500"></div>
            <span class="text-gray-700 font-medium">
              {{ t('admin.crm.payment.paid') }}: <span class="text-green-700 font-bold">{{ currencySymbol }}{{ formatNumber(totalPaid) }}</span>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-orange-500"></div>
            <span class="text-gray-700 font-medium">
              {{ t('admin.crm.payment.remaining') }}: <span class="text-orange-700 font-bold">{{ currencySymbol }}{{ formatNumber(remainingBalance) }}</span>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <span class="text-gray-700 font-medium">
              {{ t('admin.crm.payment.total') }}: <span class="text-blue-700 font-bold">{{ currencySymbol }}{{ formatNumber(totalDue) }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Payment Schedule Table -->
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <th class="px-3 py-2.5 text-left font-semibold text-xs tracking-wide">#</th>
                <th class="px-3 py-2.5 text-left font-semibold text-xs tracking-wide">{{ t('admin.crm.payment.description') }}</th>
                <th class="px-3 py-2.5 text-left font-semibold text-xs tracking-wide">{{ t('admin.crm.payment.due_date') }}</th>
                <th class="px-3 py-2.5 text-right font-semibold text-xs tracking-wide">{{ t('admin.crm.payment.amount') }}</th>
                <th class="px-3 py-2.5 text-center font-semibold text-xs tracking-wide">{{ t('admin.crm.payment.status_label') }}</th>
                <th class="px-3 py-2.5 text-center font-semibold text-xs tracking-wide">{{ t('admin.crm.payment.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(payment, idx) in crmStore.dealPayments"
                :key="payment.id"
                :class="idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'"
                class="hover:bg-blue-100 transition-colors"
              >
                <td class="px-3 py-2 font-medium text-gray-900 text-sm">
                  {{ (currentPage - 1) * itemsPerPage + idx + 1 }}
                </td>
                <td class="px-3 py-2 text-gray-700 text-sm">
                  <span v-if="payment.installment_number === 0">
                    {{ t('admin.crm.payment.down_payment') }}
                  </span>
                  <span v-else-if="payment.installment_number && payment.installment_number > 0">
                    {{ t('admin.crm.payment.monthly_payment') }}
                  </span>
                  <span v-else>
                    {{ payment.title }}
                  </span>
                </td>
                <td class="px-3 py-2 text-gray-700 text-sm">{{ formatDate(payment.due_date) }}</td>
                <td class="px-3 py-2 text-right font-semibold text-blue-600 text-sm">
                  {{ currencySymbol }}{{ formatNumber(payment.amount_due) }}
                </td>
                <td class="px-3 py-2 text-center">
                  <span
                    class="text-xs px-2 py-0.5 rounded-full border font-medium"
                    :class="getStatusClass(payment.status)"
                  >
                    {{ getStatusLabel(payment.status) }}
                  </span>
                </td>
                <td class="px-3 py-2 text-center">
                  <div v-if="payment.status !== 'paid'" class="flex items-center justify-center gap-1.5">
                    <button
                      class="px-2.5 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                      @click="openMarkPaidModal(payment)"
                    >
                      {{ t('admin.crm.payment.mark_as_paid') }}
                    </button>
                    <button
                      v-if="payment.status === 'pending' || payment.status === 'partially_paid'"
                      class="px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                      @click="openEditModal(payment)"
                    >
                      {{ t('admin.crm.form.edit') }}
                    </button>
                  </div>
                  <span v-else class="text-xs text-green-700 font-medium">
                    ✓ {{ payment.paid_date ? formatDate(payment.paid_date) : '' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div v-if="hasMultiplePages" class="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span>
              {{ t('admin.crm.payment.showing') }}
              <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
              -
              <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, totalPaymentsCount) }}</span>
              {{ t('admin.crm.payment.of') }}
              <span class="font-medium">{{ totalPaymentsCount }}</span>
            </span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ t('admin.crm.pagination.previous') }}
            </button>
            <div class="flex items-center gap-1">
              <button
                v-for="page in totalPages"
                :key="page"
                @click="() => goToPage(page)"
                :class="[
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                ]"
              >
                {{ page }}
              </button>
            </div>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ t('admin.crm.pagination.next') }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- MANUAL ENTRY FALLBACK -->
    <template v-else>
      <!-- No Pricing Set -->
      <div v-if="!deal.selected_payment_alternative" class="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <svg class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p class="text-sm text-gray-700 font-medium mb-2">{{ t('admin.crm.payment.no_pricing') }}</p>
        <p class="text-xs text-gray-600 mb-4">{{ t('admin.crm.payment.set_pricing_first') }}</p>
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          @click="showScheduleModal = true"
        >
          {{ t('admin.crm.payment.create_manual_schedule') }}
        </button>
      </div>

      <!-- Pricing Set but No Schedule Generated Yet -->
      <div v-else class="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <svg class="w-12 h-12 text-blue-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <p class="text-sm text-gray-700 font-medium mb-2">{{ t('admin.crm.payment.no_schedule') }}</p>
        <p class="text-xs text-gray-600 mb-4">{{ t('admin.crm.payment.pricing_set_but_no_schedule') }}</p>
        <div class="flex items-center justify-center gap-3">
          <button
            @click="handleGenerateFromPricing"
            :disabled="isGenerating"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isGenerating ? t('admin.crm.messages.generating') : t('admin.crm.payment.generate_from_pricing') }}
          </button>
          <button
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            @click="() => loadPayments()"
          >
            {{ t('admin.crm.payment.refresh') }}
          </button>
        </div>
      </div>
    </template>

    <!-- Payment Schedule Modal (Manual Entry) -->
    <PaymentScheduleModal
      v-if="showScheduleModal"
      :currency="deal.currency"
      :total-amount="deal.budget ?? 0"
      @submit="handleGenerateSchedule"
      @cancel="showScheduleModal = false"
    />

    <!-- Mark Payment as Paid Modal -->
    <MarkPaymentModal
      :is-open="showMarkPaidModal"
      :payment="selectedPayment"
      :currency="deal.currency"
      @submit="handleMarkPaidSubmit"
      @close="showMarkPaidModal = false"
    />

    <!-- Edit Payment Amount Modal -->
    <EditPaymentModal
      :is-open="showEditModal"
      :payment="selectedPayment"
      :currency="deal.currency"
      @submit="handleEditSubmit"
      @close="showEditModal = false"
    />
  </div>
</template>
