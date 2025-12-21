<script setup lang="ts">
import type { BankRate } from '@/types/admin/calculator'
import { useTranslations } from '@/composables/useTranslations'

defineProps<{
  bankRates: BankRate[]
}>()

const emit = defineEmits<{
  edit: [bank: BankRate]
  delete: [bank: BankRate]
  toggleActive: [bank: BankRate]
  moveUp: [index: number]
  moveDown: [index: number]
}>()

const { t } = useTranslations()
</script>

<template>
  <div class="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
    <table class="w-full">
      <thead class="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
        <tr>
          <th class="px-6 py-4 text-left font-semibold">{{ t('admin.bank_rates.bank') }}</th>
          <th class="px-6 py-4 text-center font-semibold">{{ t('admin.bank_rates.rate') }} (%)</th>
          <th class="px-6 py-4 text-center font-semibold">{{ t('admin.bank_rates.term') }} ({{ t('admin.bank_rates.years') }})</th>
          <th class="px-6 py-4 text-center font-semibold">{{ t('admin.bank_rates.min_down') }} (%)</th>
          <th class="px-6 py-4 text-center font-semibold">{{ t('admin.common.status') }}</th>
          <th class="px-6 py-4 text-center font-semibold">{{ t('admin.common.actions') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(bank, idx) in bankRates"
          :key="bank.id"
          :class="idx % 2 === 0 ? 'bg-amber-50' : 'bg-white'"
          class="hover:bg-amber-100 transition-colors"
        >
          <!-- Bank Name -->
          <td class="px-6 py-4">
            <div class="font-medium text-slate-900">{{ bank.bank_name }}</div>
          </td>

          <!-- Interest Rate -->
          <td class="px-6 py-4 text-center">
            <span class="inline-block px-4 py-2 bg-amber-500 text-white rounded-full font-semibold text-lg">
              {{ bank.interest_rate }}%
            </span>
          </td>

          <!-- Loan Term -->
          <td class="px-6 py-4 text-center text-slate-700 font-medium">
            {{ bank.min_loan_term_years }} - {{ bank.max_loan_term_years }}
          </td>

          <!-- Min Down Payment -->
          <td class="px-6 py-4 text-center text-slate-700 font-medium">
            {{ bank.min_down_payment_percent }}%
          </td>

          <!-- Status -->
          <td class="px-6 py-4 text-center">
            <button
              @click="emit('toggleActive', bank)"
              :class="[
                'inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-all',
                bank.is_active
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              ]"
            >
              <span class="w-2 h-2 rounded-full mr-2" :class="bank.is_active ? 'bg-green-500' : 'bg-slate-400'"></span>
              {{ bank.is_active ? t('admin.common.active') : t('admin.common.inactive') }}
            </button>
          </td>

          <!-- Actions -->
          <td class="px-6 py-4">
            <div class="flex items-center justify-center gap-2">
              <!-- Edit -->
              <button
                @click="emit('edit', bank)"
                class="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                :title="t('admin.common.edit')"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              <!-- Delete -->
              <button
                @click="emit('delete', bank)"
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                :title="t('admin.common.delete')"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              <!-- Move Up -->
              <button
                @click="emit('moveUp', idx)"
                :disabled="idx === 0"
                class="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
              </button>

              <!-- Move Down -->
              <button
                @click="emit('moveDown', idx)"
                :disabled="idx === bankRates.length - 1"
                class="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
