<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <!-- Area Input -->
    <div>
      <label class="block text-sm font-semibold text-slate-800 mb-3">
        {{ t.areaLabel }}
      </label>
      <input
        :value="area"
        @input="emit('update:area', Number(($event.target as HTMLInputElement).value))"
        type="number"
        min="0"
        step="0.01"
        :placeholder="t.areaPlaceholder"
        class="w-full px-6 py-4 bg-white border-2 border-amber-300 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900 font-medium shadow-sm"
      />
    </div>

    <!-- Base Total Display -->
    <div>
      <label class="block text-sm font-semibold text-slate-800 mb-3">
        {{ t.baseTotal }}
      </label>
      <div class="px-6 py-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-2xl">
        <p class="text-3xl font-bold text-amber-600">
          ${{ baseTotal.toLocaleString() }}
        </p>
        <p class="text-sm text-slate-600 mt-1">
          {{ area }} m² × ${{ basePrice.toLocaleString() }}/m²
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  area: number
  basePrice: number
  baseTotal: number
  currentLang: 'ka' | 'en' | 'ru'
}

const props = defineProps<Props>()

const translations = {
  ka: {
    areaLabel: 'ფართობი (კვ.მ)',
    areaPlaceholder: 'შეიყვანეთ ფართობი',
    baseTotal: 'საბაზო საერთო'
  },
  en: {
    areaLabel: 'Area (m²)',
    areaPlaceholder: 'Enter area',
    baseTotal: 'Base Total'
  },
  ru: {
    areaLabel: 'Площадь (м²)',
    areaPlaceholder: 'Введите площадь',
    baseTotal: 'Базовая сумма'
  }
}

const t = computed(() => translations[props.currentLang])

const emit = defineEmits<{
  'update:area': [value: number]
}>()
</script>
