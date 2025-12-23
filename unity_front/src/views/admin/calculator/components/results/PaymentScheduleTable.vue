<template>
  <div>
    <!-- Toggle Button -->
    <button
      @click="expanded = !expanded"
      class="flex items-center justify-between w-full px-6 py-4 bg-amber-100 hover:bg-amber-200 rounded-xl transition-all mb-4"
    >
      <span class="font-semibold text-amber-900">
        {{ t.paymentSchedule }} ({{ schedule.length }} {{ t.payments }})
      </span>
      <svg
        :class="['w-5 h-5 transition-transform', expanded && 'rotate-180']"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Table -->
    <div v-if="expanded" class="overflow-x-auto rounded-2xl border-2 border-amber-200">
      <table class="w-full">
        <thead class="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
          <tr>
            <th class="px-6 py-4 text-left font-semibold">{{ t.month }}</th>
            <th class="px-6 py-4 text-left font-semibold">{{ t.date }}</th>
            <th class="px-6 py-4 text-right font-semibold">{{ t.payment }}</th>
            <th class="px-6 py-4 text-right font-semibold">{{ t.balance }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, idx) in schedule"
            :key="idx"
            :class="idx % 2 === 0 ? 'bg-amber-50' : 'bg-white'"
            class="hover:bg-amber-100 transition-colors"
          >
            <td class="px-6 py-3 font-medium text-amber-900">{{ item.month }}</td>
            <td class="px-6 py-3 text-slate-700">{{ formatDate(item.date) }}</td>
            <td class="px-6 py-3 text-right font-semibold text-amber-600">
              ${{ formatAmount('payment' in item ? item.payment : item.amount) }}
            </td>
            <td class="px-6 py-3 text-right text-slate-700">${{ formatAmount(item.remainingBalance) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import { ka, enUS, ru } from 'date-fns/locale'
import type { PaymentScheduleItem, BankPaymentItem } from '@/types/admin/calculator'

interface Props {
  schedule: PaymentScheduleItem[] | BankPaymentItem[]
  isBankSchedule?: boolean
  currentLang?: 'ka' | 'en' | 'ru'
}

const props = withDefaults(defineProps<Props>(), {
  isBankSchedule: false,
  currentLang: 'ka'
})

const translations = {
  ka: {
    paymentSchedule: 'გადახდის გრაფიკი',
    payments: 'გადახდები',
    month: 'თვე',
    date: 'თარიღი',
    payment: 'გადახდა',
    balance: 'ბალანსი'
  },
  en: {
    paymentSchedule: 'Payment Schedule',
    payments: 'payments',
    month: 'Month',
    date: 'Date',
    payment: 'Payment',
    balance: 'Balance'
  },
  ru: {
    paymentSchedule: 'График платежей',
    payments: 'платежей',
    month: 'Месяц',
    date: 'Дата',
    payment: 'Платеж',
    balance: 'Баланс'
  }
}

const t = computed(() => translations[props.currentLang])

const dateLocales = {
  ka: ka,
  en: enUS,
  ru: ru
}

const expanded = ref(true)

const formatDate = (date: Date) => {
  const locale = dateLocales[props.currentLang]
  return format(new Date(date), 'MMM dd, yyyy', { locale })
}

const formatAmount = (amount: number) => {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
</script>
