<script setup lang="ts">
/**
 * Mark Payment as Paid Modal
 * Allows marking payments as paid with date selection, partial payment support, and payment tracking
 */

import { ref, computed, watch } from 'vue'
import Modal from '@/components/admin/ui/Modal.vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useLocaleFormatter } from '@/composables/i18n/useLocaleFormatter'
import type { CrmPayment, DealCurrency } from '@/types/crm'
import { CURRENCY_SYMBOLS } from '@/types/crm'

const props = defineProps<{
  isOpen: boolean
  payment: CrmPayment | null
  currency: DealCurrency
}>()

const emit = defineEmits<{
  close: []
  submit: [{
    paymentId: number
    paidDate: string
    amountPaid: number
    paymentMethod: string | null
    transactionReference: string | null
    notes: string | null
  }]
}>()

const { t } = useTranslations()
const { formatNumber: formatNum, formatDate: formatDt } = useLocaleFormatter()

// Form state
const paymentOnTime = ref(true)
const customDate = ref('')
const isPartialPayment = ref(false)
const amountPaid = ref(0)
const paymentMethod = ref<string>('')
const transactionReference = ref('')
const notes = ref('')
const isSubmitting = ref(false)

// Computed
const currencySymbol = computed(() => CURRENCY_SYMBOLS[props.currency])

const paymentTitle = computed(() => {
  if (!props.payment) return ''
  
  // Use installment_number to determine the correct translation key
  // 0 = Down Payment
  // >0 = Installment / Monthly Payment
  if (props.payment.installment_number === 0) {
    return t('admin.crm.payment.down_payment')
  } else if (props.payment.installment_number && props.payment.installment_number > 0) {
    return t('admin.crm.payment.monthly_payment')
  }
  
  // Fallback to title but try to clean up if it looks like "English / Georgian"
  // This is a safety fallback if installment_number is missing
  return props.payment.title
})

const dueDate = computed(() => {
  if (!props.payment) return ''
  return props.payment.due_date
})

const amountDue = computed(() => {
  if (!props.payment) return 0
  return props.payment.amount_due - props.payment.amount_paid
})

const effectivePaidDate = computed(() => {
  return paymentOnTime.value ? dueDate.value : customDate.value
})

const isValid = computed(() => {
  if (!props.payment) return false
  if (!paymentOnTime.value && !customDate.value) return false
  if (isPartialPayment.value && (amountPaid.value <= 0 || amountPaid.value > amountDue.value)) return false
  if (!isPartialPayment.value && amountDue.value <= 0) return false
  return true
})

// Watch payment changes to reset form
watch(() => props.payment, (newPayment) => {
  if (newPayment) {
    resetForm()
    amountPaid.value = amountDue.value
  }
})

// Watch partial payment toggle
watch(isPartialPayment, (partial) => {
  if (!partial) {
    amountPaid.value = amountDue.value
  }
})

function resetForm() {
  paymentOnTime.value = true
  customDate.value = ''
  isPartialPayment.value = false
  amountPaid.value = 0
  paymentMethod.value = ''
  transactionReference.value = ''
  notes.value = ''
}

async function handleSubmit() {
  if (!isValid.value || !props.payment) return

  isSubmitting.value = true
  try {
    emit('submit', {
      paymentId: props.payment.id,
      paidDate: effectivePaidDate.value,
      amountPaid: isPartialPayment.value ? amountPaid.value : amountDue.value,
      paymentMethod: paymentMethod.value || null,
      transactionReference: transactionReference.value || null,
      notes: notes.value || null,
    })
    resetForm()
  } finally {
    isSubmitting.value = false
  }
}

function handleClose() {
  resetForm()
  emit('close')
}

function formatNumber(value: number): string {
  return formatNum(value, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function formatDate(dateStr: string): string {
  return formatDt(dateStr, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>

<template>
  <Modal :show="isOpen" :title="t('admin.crm.payment.mark_as_paid')" @close="handleClose">
    <div v-if="payment" class="space-y-6">
      <!-- Payment Info Card -->
      <div class="bg-blue-50/50 rounded-xl p-5 border border-blue-100">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-base font-semibold text-gray-900">{{ paymentTitle }}</h3>
            <div class="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ t('admin.crm.payment.due_date') }}: <span class="font-medium text-gray-900">{{ formatDate(payment.due_date) }}</span></span>
            </div>
          </div>
          <div class="text-right">
            <span class="block text-xs text-gray-500 uppercase tracking-wider mb-1">{{ t('admin.crm.payment.amount_due') }}</span>
            <span class="text-2xl font-bold text-blue-600 block leading-none">{{ currencySymbol }}{{ formatNumber(amountDue) }}</span>
          </div>
        </div>
      </div>

      <!-- Date Selection -->
      <div class="space-y-3">
        <label class="block text-sm font-medium text-gray-900">
          {{ t('admin.crm.payment.payment_date_question') }}
        </label>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <!-- On Due Date Option -->
          <label 
            class="relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none"
            :class="paymentOnTime ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50 bg-blue-50/30' : 'border-gray-200 bg-white hover:border-gray-300'"
          >
            <input 
              type="radio" 
              name="payment-date" 
              :value="true" 
              v-model="paymentOnTime" 
              class="sr-only" 
            />
            <span class="flex flex-1">
              <span class="flex flex-col">
                <span id="project-type-0-label" class="block text-sm font-medium text-gray-900">
                  {{ t('admin.crm.payment.on_due_date') }}
                </span>
                <span id="project-type-0-description-0" class="mt-1 flex items-center text-sm text-gray-500">
                  {{ formatDate(dueDate) }}
                </span>
              </span>
            </span>
            <svg v-if="paymentOnTime" class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span v-else class="h-5 w-5 rounded-full border border-gray-300" aria-hidden="true"></span>
          </label>

          <!-- Different Date Option -->
          <label 
            class="relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none"
            :class="!paymentOnTime ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50 bg-blue-50/30' : 'border-gray-200 bg-white hover:border-gray-300'"
          >
            <input 
              type="radio" 
              name="payment-date" 
              :value="false" 
              v-model="paymentOnTime" 
              class="sr-only" 
            />
            <span class="flex flex-1">
              <span class="flex flex-col">
                <span class="block text-sm font-medium text-gray-900">
                  {{ t('admin.crm.payment.different_date') }}
                </span>
                <span v-if="!paymentOnTime" class="mt-2 block">
                  <input
                    type="date"
                    v-model="customDate"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs"
                    @click.stop
                  />
                </span>
                <span v-else class="mt-1 flex items-center text-sm text-gray-500">
                   {{ t('admin.crm.form.select_date') || 'Select date' }}
                </span>
              </span>
            </span>
            <svg v-if="!paymentOnTime" class="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <span v-else class="h-5 w-5 rounded-full border border-gray-300" aria-hidden="true"></span>
          </label>
        </div>
      </div>

      <!-- Payment Details Section -->
      <div class="border-t border-gray-100 pt-5 space-y-5">
        
        <!-- Amount Selection -->
        <div>
          <label class="flex items-center gap-3 mb-3 cursor-pointer group">
            <div class="relative flex items-center">
              <input
                type="checkbox"
                v-model="isPartialPayment"
                class="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-blue-500 checked:bg-blue-500 hover:border-blue-400"
              />
              <svg class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">{{ t('admin.crm.payment.partial_payment') }}</span>
          </label>

          <div v-if="isPartialPayment" class="relative group">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span class="text-gray-500 font-medium">{{ currencySymbol }}</span>
            </div>
            <input
              type="number"
              v-model.number="amountPaid"
              :max="amountDue"
              :min="0"
              step="0.01"
              class="block w-full rounded-lg border-gray-300 pl-8 pr-12 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 transition-shadow"
              :placeholder="formatNumber(amountDue)"
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span class="text-gray-400 text-xs">/ {{ formatNumber(amountDue) }}</span>
            </div>
          </div>
          <p v-if="isPartialPayment" class="mt-2 text-xs text-blue-600 font-medium flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ t('admin.crm.payment.remaining') }}: {{ currencySymbol }}{{ formatNumber(amountDue - amountPaid) }}
          </p>
          <div v-else class="pl-0.5 text-sm text-gray-500">
             {{ t('admin.crm.payment.full_payment_desc') || 'Full amount will be marked as paid' }}: <span class="font-bold text-gray-900">{{ currencySymbol }}{{ formatNumber(amountDue) }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
           <!-- Payment Method -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('admin.crm.payment.payment_method') }}
            </label>
            <div class="relative">
              <select
                v-model="paymentMethod"
                class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5 pl-3 pr-10 appearance-none bg-none"
              >
                <option value="">{{ t('admin.crm.payment.select_method') }}</option>
                <option value="bank_transfer">{{ t('admin.crm.payment.methods.bank_transfer') }}</option>
                <option value="credit_card">{{ t('admin.crm.payment.methods.credit_card') }}</option>
                <option value="cash">{{ t('admin.crm.payment.methods.cash') }}</option>
                <option value="check">{{ t('admin.crm.payment.methods.check') }}</option>
                <option value="other">{{ t('admin.crm.payment.methods.other') }}</option>
              </select>
               <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
            </div>
          </div>

          <!-- Transaction Reference -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('admin.crm.payment.transaction_reference') }}
              <span class="text-gray-400 font-normal text-xs ml-1">({{ t('admin.crm.form.optional') }})</span>
            </label>
            <input
              type="text"
              v-model="transactionReference"
              class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2.5"
              :placeholder="t('admin.crm.payment.transaction_reference_placeholder')"
            />
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('admin.crm.form.notes') }}
            <span class="text-gray-400 font-normal text-xs ml-1">({{ t('admin.crm.form.optional') }})</span>
          </label>
          <textarea
            v-model="notes"
            rows="3"
            class="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
            :placeholder="t('admin.crm.payment.notes_placeholder')"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <template #footer>
      <div class="flex justify-end gap-3 pt-2">
        <button
          type="button"
          @click="handleClose"
          class="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
        >
          {{ t('admin.crm.form.cancel') }}
        </button>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="!isValid || isSubmitting"
          class="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2"
        >
          <svg v-if="isSubmitting" class="animate-spin -ml-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ isSubmitting ? t('admin.crm.messages.saving') : t('admin.crm.payment.mark_as_paid') }}
        </button>
      </div>
    </template>
  </Modal>
</template>
