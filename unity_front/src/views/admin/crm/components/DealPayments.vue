<script setup lang="ts">
/**
 * Deal Payments Component
 * Payment schedule management for a deal
 */

import { ref, computed, onMounted } from 'vue'
import { useCrmStore } from '@/stores/admin/crm'
import type { CrmDeal, PaymentScheduleData, PaymentStatus } from '@/types/crm'
import { CURRENCY_SYMBOLS } from '@/types/crm'
import PaymentScheduleModal from './PaymentScheduleModal.vue'

// Props
interface Props {
  deal: CrmDeal
}

const props = defineProps<Props>()

// Store
const crmStore = useCrmStore()

// State
const showScheduleModal = ref(false)
const isLoading = ref(false)

// Computed
const currencySymbol = computed(() => CURRENCY_SYMBOLS[props.deal.currency])

const totalPaid = computed(() => {
  return crmStore.dealPayments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0)
})

const paymentProgress = computed(() => {
  const budget = props.deal.budget
  if (budget === null || budget === undefined || budget === 0) return 0
  const progress = (totalPaid.value / budget) * 100
  return Math.min(Math.round(progress), 100) // Cap at 100%
})

// Error state
const loadError = ref<string | null>(null)

// Load payments on mount
onMounted(async () => {
  await loadPayments()
})

// Load payments with timeout
async function loadPayments(): Promise<void> {
  isLoading.value = true
  loadError.value = null

  let timedOut = false

  // Timeout failsafe
  const timeoutId = setTimeout(() => {
    timedOut = true
    isLoading.value = false
    loadError.value = 'დრო ამოიწურა. გთხოვთ განაახლოთ გვერდი.'
  }, 10000) // 10 second timeout

  try {
    await crmStore.fetchPayments(props.deal.id)
    if (!timedOut) {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    console.error('Failed to load payments:', error)
    if (!timedOut) {
      loadError.value = 'გადახდების ჩატვირთვა ვერ მოხერხდა'
      clearTimeout(timeoutId)
    }
  } finally {
    if (!timedOut) {
      isLoading.value = false
    }
  }
}

// Handle generate schedule
async function handleGenerateSchedule(data: PaymentScheduleData): Promise<void> {
  try {
    await crmStore.generatePaymentSchedule(props.deal.id, data)
    showScheduleModal.value = false
  } catch (error) {
    console.error('Failed to generate schedule:', error)
  }
}

// Handle mark as paid
async function handleMarkAsPaid(paymentId: number): Promise<void> {
  try {
    await crmStore.updatePayment(paymentId, {
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
    })
  } catch (error) {
    console.error('Failed to update payment:', error)
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
      return 'გადახდილი'
    case 'pending':
      return 'მოლოდინში'
    case 'overdue':
      return 'просроченный'
    case 'partially_paid':
      return 'ნაწილობრივ გადახდილი'
    case 'cancelled':
      return 'გაუქმებული'
    default:
      return status
  }
}

// Format number with null handling
function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0'
  return new Intl.NumberFormat('ka-GE', { maximumFractionDigits: 0 }).format(value)
}

// Format date
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <div class="space-y-4">
    <!-- Header & Actions -->
    <div class="flex items-center justify-between">
      <div>
        <h4 class="font-semibold text-gray-900">გადახდის გრაფიკი</h4>
        <p class="text-sm text-gray-500 mt-1">{{ crmStore.dealPayments.length }} შენატანი</p>
      </div>

      <button
        class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        @click="showScheduleModal = true"
      >
        + გრაფიკის შექმნა
      </button>
    </div>

    <!-- Progress Bar -->
    <div class="bg-gray-50 rounded-lg p-4">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">გადახდის პროგრესი</span>
        <span class="text-lg font-bold text-gray-900">{{ paymentProgress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          class="bg-green-600 h-3 rounded-full transition-all"
          :style="{ width: `${paymentProgress}%` }"
        ></div>
      </div>
      <div class="flex items-center justify-between mt-2 text-sm">
        <span class="text-gray-600">
          გადახდილი: {{ currencySymbol }}{{ formatNumber(totalPaid) }}
        </span>
        <span class="text-gray-600">
          სულ: {{ currencySymbol }}{{ formatNumber(deal.budget) }}
        </span>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div class="flex-1">
          <p class="text-sm font-medium text-red-800">{{ loadError }}</p>
          <button
            @click="loadPayments"
            class="mt-2 text-sm text-red-700 hover:text-red-900 underline"
          >
            თავიდან ცდა
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="text-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"
      ></div>
      <p class="mt-4 text-gray-500 text-sm">იტვირთება...</p>
    </div>

    <!-- Payments List -->
    <div v-else-if="crmStore.dealPayments.length > 0" class="space-y-3">
      <div
        v-for="(payment, index) in crmStore.dealPayments"
        :key="payment.id"
        class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-sm font-medium text-gray-900">შენატანი {{ index + 1 }}</span>
              <span
                class="text-xs px-2 py-0.5 rounded border"
                :class="getStatusClass(payment.status)"
              >
                {{ getStatusLabel(payment.status) }}
              </span>
            </div>

            <div class="text-lg font-bold text-gray-900 mb-1">
              {{ currencySymbol }}{{ formatNumber(payment.amount) }}
            </div>

            <div class="flex items-center gap-4 text-sm text-gray-600">
              <span>📅 {{ formatDate(payment.due_date) }}</span>
              <span v-if="payment.paid_date">✅ {{ formatDate(payment.paid_date) }}</span>
            </div>

            <p v-if="payment.notes" class="text-sm text-gray-500 mt-2">{{ payment.notes }}</p>
          </div>

          <!-- Actions -->
          <div v-if="payment.status !== 'paid'" class="flex flex-col gap-2">
            <button
              class="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
              @click="handleMarkAsPaid(payment.id)"
            >
              გადახდილად მონიშვნა
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
      <svg class="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      <p class="text-sm text-gray-500">არ არის გადახდის გრაფიკი</p>
      <p class="text-xs text-gray-400 mt-1">შექმენით გრაფიკი ავტომატურად</p>
    </div>

    <!-- Payment Schedule Modal -->
    <PaymentScheduleModal
      v-if="showScheduleModal"
      :currency="deal.currency"
      :total-amount="deal.budget ?? 0"
      @submit="handleGenerateSchedule"
      @cancel="showScheduleModal = false"
    />
  </div>
</template>
