<script setup lang="ts">
/**
 * Edit Payment Modal
 * Allows editing payment amounts with reason tracking
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
    newAmount: number
    reason: string
    notes: string
  }]
}>()

const { t } = useTranslations()
const { formatNumber: formatNum } = useLocaleFormatter()

// Form state
const newAmount = ref(0)
const reason = ref('')
const customReason = ref('')
const notes = ref('')
const isSubmitting = ref(false)

// Computed
const currencySymbol = computed(() => CURRENCY_SYMBOLS[props.currency])

const originalAmount = computed(() => {
  return props.payment?.amount_due || 0
})

const amountDifference = computed(() => {
  return newAmount.value - originalAmount.value
})

const isValid = computed(() => {
  if (!props.payment) return false
  if (newAmount.value <= 0) return false
  if (newAmount.value === originalAmount.value) return false
  if (!reason.value) return false
  if (reason.value === 'other' && !customReason.value) return false
  return true
})

const canEdit = computed(() => {
  if (!props.payment) return false
  return props.payment.status === 'pending' || props.payment.status === 'partially_paid'
})

const effectiveReason = computed(() => {
  return reason.value === 'other' ? customReason.value : reason.value
})

// Watch payment changes to reset form
watch(() => props.payment, (newPayment) => {
  if (newPayment) {
    resetForm()
    newAmount.value = newPayment.amount_due
  }
})

function resetForm() {
  newAmount.value = 0
  reason.value = ''
  customReason.value = ''
  notes.value = ''
}

async function handleSubmit() {
  if (!isValid.value || !props.payment) return

  isSubmitting.value = true
  try {
    emit('submit', {
      paymentId: props.payment.id,
      newAmount: newAmount.value,
      reason: effectiveReason.value,
      notes: notes.value,
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
</script>

<template>
  <Modal :show="isOpen" :title="t('admin.crm.payment.edit_payment')" @close="handleClose">
    <div v-if="payment" class="space-y-4">
      <!-- Cannot Edit Warning -->
      <div v-if="!canEdit" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div class="flex-1">
            <p class="text-sm font-medium text-yellow-800">{{ t('admin.crm.payment.cannot_edit_paid') }}</p>
            <p class="text-xs text-yellow-700 mt-1">{{ t('admin.crm.payment.cannot_edit_paid_desc') }}</p>
          </div>
        </div>
      </div>

      <!-- Payment Info -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="text-sm text-gray-600 mb-1">{{ payment.title }}</div>
        <div class="flex items-baseline gap-2">
          <span class="text-sm text-gray-500">{{ t('admin.crm.payment.original_amount') }}:</span>
          <span class="text-lg font-bold text-gray-900">{{ currencySymbol }}{{ formatNumber(originalAmount) }}</span>
        </div>
      </div>

      <!-- New Amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('admin.crm.payment.new_amount') }}
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span class="text-gray-500 sm:text-sm">{{ currencySymbol }}</span>
          </div>
          <input
            type="number"
            v-model.number="newAmount"
            :min="0"
            step="0.01"
            :disabled="!canEdit"
            class="block w-full rounded-md border-gray-300 pl-7 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
        <p v-if="amountDifference !== 0" class="mt-1 text-sm" :class="amountDifference > 0 ? 'text-red-600' : 'text-green-600'">
          {{ amountDifference > 0 ? '+' : '' }}{{ currencySymbol }}{{ formatNumber(Math.abs(amountDifference)) }}
          {{ amountDifference > 0 ? t('admin.crm.payment.increase') : t('admin.crm.payment.decrease') }}
        </p>
      </div>

      <!-- Reason -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('admin.crm.payment.reason_for_change') }}
        </label>
        <select
          v-model="reason"
          :disabled="!canEdit"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">{{ t('admin.crm.payment.select_reason') }}</option>
          <option value="discount_applied">{{ t('admin.crm.payment.reasons.discount_applied') }}</option>
          <option value="price_adjustment">{{ t('admin.crm.payment.reasons.price_adjustment') }}</option>
          <option value="customer_negotiation">{{ t('admin.crm.payment.reasons.customer_negotiation') }}</option>
          <option value="correction">{{ t('admin.crm.payment.reasons.correction') }}</option>
          <option value="other">{{ t('admin.crm.payment.reasons.other') }}</option>
        </select>

        <input
          v-if="reason === 'other'"
          type="text"
          v-model="customReason"
          :disabled="!canEdit"
          class="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          :placeholder="t('admin.crm.payment.specify_reason')"
        />
      </div>

      <!-- Notes -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('admin.crm.form.notes') }}
          <span class="text-gray-500 font-normal">({{ t('admin.crm.form.optional') }})</span>
        </label>
        <textarea
          v-model="notes"
          rows="3"
          :disabled="!canEdit"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          :placeholder="t('admin.crm.payment.edit_notes_placeholder')"
        ></textarea>
      </div>

      <!-- Warning -->
      <div v-if="canEdit" class="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p class="text-xs text-amber-800">
          ⚠️ {{ t('admin.crm.payment.edit_warning') }}
        </p>
      </div>
    </div>

    <!-- Actions -->
    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          type="button"
          @click="handleClose"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {{ t('admin.crm.form.cancel') }}
        </button>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="!isValid || isSubmitting || !canEdit"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? t('admin.crm.messages.saving') : t('admin.crm.payment.save_changes') }}
        </button>
      </div>
    </template>
  </Modal>
</template>
