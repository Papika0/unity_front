<template>
  <div class="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-10 border-3 border-amber-300 shadow-2xl">
    <!-- Total Price (Large Display) -->
    <div class="text-center mb-8">
      <p class="text-slate-600 text-sm uppercase tracking-wider mb-3 font-medium">
        {{ t.totalPrice }}
      </p>
      <p class="text-6xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
        ${{ result.totalPrice.toLocaleString() }}
      </p>
      <div class="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full text-base font-medium shadow-lg">
        {{ result.priceModifier }}
      </div>
    </div>

    <!-- Details Grid -->
    <div class="grid grid-cols-2 gap-6">
      <div v-if="result.downPayment > 0">
        <p class="text-slate-600 text-sm mb-1">{{ t.downPayment }}</p>
        <p class="text-2xl font-bold text-slate-900">${{ result.downPayment.toLocaleString() }}</p>
      </div>

      <div v-if="result.monthlyPayment > 0">
        <p class="text-slate-600 text-sm mb-1">{{ t.monthly }}</p>
        <p class="text-2xl font-bold text-slate-900">${{ result.monthlyPayment.toLocaleString() }}</p>
      </div>

      <div v-if="result.numberOfMonths > 0">
        <p class="text-slate-600 text-sm mb-1">{{ t.months }}</p>
        <p class="text-2xl font-bold text-slate-900">{{ result.numberOfMonths }}</p>
      </div>

      <div v-if="result.finalBalloonPayment > 0">
        <p class="text-slate-600 text-sm mb-1">{{ t.finalPayment }}</p>
        <p class="text-2xl font-bold text-slate-900">${{ result.finalBalloonPayment.toLocaleString() }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CalculationResult } from '@/types/admin/calculator'

interface Props {
  result: CalculationResult
  currentLang?: 'ka' | 'en' | 'ru'
}

const props = withDefaults(defineProps<Props>(), {
  currentLang: 'ka'
})

const translations = {
  ka: {
    totalPrice: 'საერთო ფასი',
    downPayment: 'შენატანი',
    monthly: 'ყოველთვიური',
    months: 'თვეების რაოდენობა',
    finalPayment: 'საბოლოო გადახდა'
  },
  en: {
    totalPrice: 'Total Price',
    downPayment: 'Down Payment',
    monthly: 'Monthly',
    months: 'Months',
    finalPayment: 'Final Payment'
  },
  ru: {
    totalPrice: 'Общая цена',
    downPayment: 'Первоначальный взнос',
    monthly: 'Ежемесячно',
    months: 'Количество месяцев',
    finalPayment: 'Окончательный платеж'
  }
}

const t = computed(() => translations[props.currentLang])
</script>
