<script setup lang="ts">
/**
 * Payment Schedule Modal Component
 * Form for generating payment schedule with installments
 */

import { ref, computed, watch } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useLocaleFormatter } from '@/composables/i18n/useLocaleFormatter'
import type { PaymentScheduleData, DealCurrency } from '@/types/crm'
import { CURRENCY_SYMBOLS } from '@/types/crm'

// Composables
const { t } = useTranslations()
const { formatNumber: formatNum, formatDate: formatDt } = useLocaleFormatter()

// Props
interface Props {
  currency: DealCurrency
  totalAmount?: number
}

const props = withDefaults(defineProps<Props>(), {
  totalAmount: 0,
})

// Emits
const emit = defineEmits<{
  (e: 'submit', data: PaymentScheduleData): void
  (e: 'cancel'): void
}>()

// Form state
const totalAmount = ref(props.totalAmount || 0)
const downPayment = ref(0)
const numberOfInstallments = ref(12)
const startDate = ref('')
const intervalMonths = ref(1)
const isSubmitting = ref(false)

// Set default start date to next month
const today = new Date()
today.setMonth(today.getMonth() + 1)
startDate.value = today.toISOString().split('T')[0]

// Computed
const currencySymbol = computed(() => CURRENCY_SYMBOLS[props.currency])

const remainingAmount = computed(() => {
  return Math.max(0, totalAmount.value - downPayment.value)
})

const installmentAmount = computed(() => {
  if (numberOfInstallments.value <= 0) return 0
  return Math.round((remainingAmount.value / numberOfInstallments.value) * 100) / 100
})

const schedulePreview = computed(() => {
  const preview: Array<{ date: string; amount: number; label: string }> = []

  // Down payment
  if (downPayment.value > 0) {
    preview.push({
      date: new Date().toISOString().split('T')[0],
      amount: downPayment.value,
      label: t('admin.crm.payment.down_payment'),
    })
  }

  // Installments
  if (startDate.value && numberOfInstallments.value > 0) {
    const start = new Date(startDate.value)
    for (let i = 0; i < Math.min(numberOfInstallments.value, 6); i++) {
      const date = new Date(start)
      date.setMonth(date.getMonth() + i * intervalMonths.value)
      preview.push({
        date: date.toISOString().split('T')[0],
        amount: installmentAmount.value,
        label: `${t('admin.crm.payment.installment')} ${i + 1}`,
      })
    }
    if (numberOfInstallments.value > 6) {
      preview.push({
        date: '',
        amount: 0,
        label: `... ${t('admin.crm.payment.and_more', { count: numberOfInstallments.value - 6 })}`,
      })
    }
  }

  return preview
})

const isValid = computed(() => {
  return (
    totalAmount.value > 0 &&
    downPayment.value >= 0 &&
    downPayment.value < totalAmount.value &&
    numberOfInstallments.value > 0 &&
    startDate.value !== ''
  )
})

// Watch for prop changes
watch(
  () => props.totalAmount,
  (newVal) => {
    if (newVal) totalAmount.value = newVal
  },
)

// Submit
async function handleSubmit(): Promise<void> {
  if (!isValid.value) return

  isSubmitting.value = true

  try {
    const data: PaymentScheduleData = {
      total_amount: totalAmount.value,
      down_payment: downPayment.value,
      number_of_installments: numberOfInstallments.value,
      start_date: startDate.value,
      interval_months: intervalMonths.value,
    }

    emit('submit', data)
  } finally {
    isSubmitting.value = false
  }
}

// Format date for display
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return formatDt(dateStr, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Format number
function formatNumber(value: number): string {
  return formatNum(value, { maximumFractionDigits: 0 })
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="$emit('cancel')"
      ></div>

      <!-- Modal -->
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-schedule-modal-title"
        class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden"
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h3 id="payment-schedule-modal-title" class="text-lg font-semibold text-white">{{ t('admin.crm.payment.create_payment_schedule') }}</h3>
          <p class="text-sm text-blue-100 mt-1">{{ t('admin.crm.payment.define_terms') }}</p>
        </div>

        <div class="p-6 space-y-6">
          <!-- Amount Settings -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.crm.payment.total_amount') }}</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700">{{
                  currencySymbol
                }}</span>
                <input
                  v-model.number="totalAmount"
                  type="number"
                  min="0"
                  step="100"
                  :aria-label="t('admin.crm.payment.total_amount')"
                  class="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.crm.payment.down_payment') }}</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700">{{
                  currencySymbol
                }}</span>
                <input
                  v-model.number="downPayment"
                  type="number"
                  min="0"
                  :max="totalAmount - 1"
                  step="100"
                  :aria-label="t('admin.crm.payment.down_payment')"
                  class="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          <!-- Installment Settings -->
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.crm.payment.number_of_installments') }}</label>
              <input
                v-model.number="numberOfInstallments"
                type="number"
                min="1"
                max="120"
                :aria-label="t('admin.crm.payment.number_of_installments')"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.crm.payment.start_date') }}</label>
              <input
                v-model="startDate"
                type="date"
                :aria-label="t('admin.crm.payment.start_date')"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.crm.payment.interval') }}</label>
              <select
                v-model.number="intervalMonths"
                :aria-label="t('admin.crm.payment.interval')"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
              >
                <option :value="1">{{ t('admin.crm.payment.intervals.monthly') }}</option>
                <option :value="2">{{ t('admin.crm.payment.intervals.bimonthly') }}</option>
                <option :value="3">{{ t('admin.crm.payment.intervals.quarterly') }}</option>
                <option :value="6">{{ t('admin.crm.payment.intervals.semiannual') }}</option>
                <option :value="12">{{ t('admin.crm.payment.intervals.annual') }}</option>
              </select>
            </div>
          </div>

          <!-- Summary -->
          <div class="bg-blue-50 rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-medium text-blue-900">{{ t('admin.crm.payment.payment_plan') }}</span>
              <span class="text-lg font-bold text-blue-600">
                {{ currencySymbol }}{{ formatNumber(installmentAmount) }} / {{ t('admin.crm.payment.per_month') }}
              </span>
            </div>
            <div class="text-sm text-blue-700 space-y-1">
              <div class="flex justify-between">
                <span>{{ t('admin.crm.payment.total_amount') }}:</span>
                <span>{{ currencySymbol }}{{ formatNumber(totalAmount) }}</span>
              </div>
              <div class="flex justify-between">
                <span>{{ t('admin.crm.payment.down_payment') }}:</span>
                <span>{{ currencySymbol }}{{ formatNumber(downPayment) }}</span>
              </div>
              <div class="flex justify-between font-medium">
                <span>{{ t('admin.crm.payment.installment_amount') }}:</span>
                <span>{{ currencySymbol }}{{ formatNumber(remainingAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- Preview -->
          <div class="border border-gray-200 rounded-xl overflow-hidden">
            <div class="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <span class="text-sm font-medium text-gray-700">{{ t('admin.crm.payment.schedule_preview') }}</span>
            </div>
            <div class="max-h-48 overflow-y-auto">
              <div
                v-for="(item, index) in schedulePreview"
                :key="index"
                class="flex items-center justify-between px-4 py-2 border-b border-gray-100 last:border-b-0"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                    :class="
                      index === 0 && downPayment > 0
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    "
                  >
                    {{ item.amount ? index + 1 : '...' }}
                  </div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ item.label }}</div>
                    <div
                      v-if="item.date"
                      class="text-xs text-gray-600"
                    >
                      {{ formatDate(item.date) }}
                    </div>
                  </div>
                </div>
                <div
                  v-if="item.amount"
                  class="text-sm font-medium text-gray-900"
                >
                  {{ currencySymbol }}{{ formatNumber(item.amount) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            aria-label="Cancel payment schedule creation"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            @click="$emit('cancel')"
          >
            {{ t('admin.crm.form.cancel') }}
          </button>
          <button
            type="button"
            aria-label="Create payment schedule"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!isValid || isSubmitting"
            @click="handleSubmit"
          >
            {{ isSubmitting ? t('admin.crm.messages.creating') : t('admin.crm.payment.create_schedule') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
