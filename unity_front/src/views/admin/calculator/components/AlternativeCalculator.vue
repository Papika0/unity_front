<template>
  <div class="space-y-6">
    <!-- Alternative Info -->
    <div class="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
      <h3 class="text-lg font-semibold text-amber-900 mb-2">{{ alternativeTitle }}</h3>
      <p class="text-sm text-slate-600">{{ alternativeDescription }}</p>
    </div>

    <!-- Down Payment Slider (for Alt 1-4) -->
    <div v-if="needsDownPayment">
      <div class="flex items-center justify-between mb-3">
        <label class="block text-sm font-semibold text-slate-700">
          {{ t.downPayment }}
        </label>
        <div class="flex gap-2">
          <button
            @click="downPaymentMode = 'percent'"
            :class="[
              'px-3 py-1 text-xs rounded-lg transition-all',
              downPaymentMode === 'percent'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            ]"
          >
            %
          </button>
          <button
            @click="downPaymentMode = 'dollars'"
            :class="[
              'px-3 py-1 text-xs rounded-lg transition-all',
              downPaymentMode === 'dollars'
                ? 'bg-amber-500 text-white'
                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
            ]"
          >
            $
          </button>
        </div>
      </div>

      <!-- Percent Mode -->
      <div v-if="downPaymentMode === 'percent'">
        <input
          v-model.number="downPaymentPercent"
          type="range"
          :min="minDownPayment"
          :max="maxDownPayment"
          class="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-amber-200 to-yellow-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-amber-500 [&::-webkit-slider-thumb]:to-yellow-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:transition-transform"
        />
        <div class="flex justify-between text-sm text-black mt-2">
          <span>{{ minDownPayment }}%</span>
          <span class="font-bold text-amber-600">{{ downPaymentPercent }}% = ${{ downPaymentAmount.toLocaleString() }}</span>
          <span>{{ maxDownPayment }}%</span>
        </div>
      </div>

      <!-- Dollar Mode -->
      <div v-else>
        <input
          v-model.number="downPaymentDollars"
          type="number"
          :min="effectiveTotalPrice * (minDownPayment / 100)"
          :max="effectiveTotalPrice * (maxDownPayment / 100)"
          step="100"
          class="w-full px-4 py-3 bg-white border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900 font-medium"
          placeholder="Enter amount in dollars"
        />
        <div class="flex justify-between text-sm text-black mt-2">
          <span>${{ (effectiveTotalPrice * (minDownPayment / 100)).toLocaleString() }}</span>
          <span class="font-bold text-amber-600">${{ downPaymentDollars.toLocaleString() }} = {{ downPaymentPercent.toFixed(1) }}%</span>
          <span>${{ (effectiveTotalPrice * (maxDownPayment / 100)).toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- Monthly Payment (for Alt 2, 5, 6) -->
    <div v-if="needsMonthlyPayment">
      <label class="block text-sm font-semibold text-slate-700 mb-3">
        {{ t.monthlyPayment }}
      </label>
      <input
        v-model.number="monthlyPayment"
        type="number"
        :min="minMonthlyPayment"
        step="100"
        class="w-full px-4 py-3 bg-white border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-black font-medium"
        :placeholder="`Min: $${minMonthlyPayment}`"
      />
      <p class="text-xs text-slate-500 mt-2">{{ t.minimum }}: ${{ minMonthlyPayment }}/month</p>
    </div>

    <!-- Custom Payment Options (for Alt 3 & 4) -->
    <div v-if="needsCustomPayment" class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-semibold text-slate-700">
          {{ t.balancePaymentOptions }}
        </h4>
        <button
          @click="toggleCustomPayment"
          :class="[
            'px-4 py-2 text-sm rounded-lg transition-all font-medium',
            useCustomPayment
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          ]"
        >
          {{ useCustomPayment ? t.disable : t.enable }}
        </button>
      </div>

      <div v-if="useCustomPayment" class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-4">
        <div v-if="customPayments.length">
          <h5 class="text-xs font-semibold text-blue-700 mb-2">{{ t.scheduledPayments }}</h5>
          <ul class="mb-2">
            <li v-for="(p, idx) in customPayments" :key="idx" class="flex items-center justify-between text-sm mb-1 text-black">
              <span>{{ p.date }}: <b>${{ p.amount.toLocaleString() }}</b></span>
              <button @click="removeCustomPayment(idx)" class="ml-2 text-xs text-red-500 hover:underline">{{ t.remove }}</button>
            </li>
          </ul>
        </div>
        <div class="flex gap-2">
          <input
            v-model="newPaymentDate"
            type="date"
            class="w-1/2 px-4 py-2 bg-white border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
          />
          <input
            v-model.number="newPaymentAmount"
            type="number"
            min="0"
            :max="remainingBalance"
            step="100"
            class="w-1/2 px-4 py-2 bg-white border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-medium"
            placeholder="Amount"
          />
          <button @click="addCustomPayment" :disabled="!newPaymentDate || !newPaymentAmount || newPaymentAmount > remainingBalance" class="px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50">{{ t.add }}</button>
        </div>
        <div class="text-xs text-blue-700 mt-2">
          {{ t.remainingToAllocate }}: <b>${{ remainingBalance.toLocaleString() }}</b>
        </div>
      </div>
    </div>

    <!-- Validation Errors -->
    <div v-if="!canCalculate" class="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
      <div class="flex items-start gap-3">
        <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div class="text-sm">
          <p class="font-semibold text-yellow-800 mb-1">{{ t.pleaseCheck }}</p>
          <ul class="list-disc list-inside text-yellow-700 space-y-1">
            <li v-if="!project">{{ t.projectNotSelected }}</li>
            <li v-if="area <= 0">{{ t.areaNotEntered }}</li>
            <li v-if="basePrice <= 0">{{ t.basePriceNotSet }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Calculate Button -->
    <button
      @click="handleCalculate"
      :disabled="!canCalculate"
      class="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {{ t.calculate }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePaymentCalculator } from '@/composables/usePaymentCalculator'
import type { ActiveProject, CalculationResult } from '@/types/admin/calculator'

interface Props {
  alternative: 1 | 2 | 3 | 4 | 5 | 6
  project: ActiveProject
  basePrice: number
  area: number
  currentLang: 'ka' | 'en' | 'ru'
}

const props = defineProps<Props>()

const translations = {
  ka: {
    downPayment: 'შენატანი',
    monthlyPayment: 'ყოველთვიური გადახდა',
    balancePaymentOptions: 'დარჩენილი თანხის გადახდა',
    disable: 'გამორთვა',
    enable: 'გამოყენება',
    scheduledPayments: 'დაგეგმილი გადახდები',
    remove: 'წაშლა',
    add: 'დამატება',
    remainingToAllocate: 'დარჩენილი გადასახდელი',
    calculate: 'გამოთვლა',
    date: 'თარიღი',
    amount: 'თანხა',
    invalidDate: 'გთხოვთ აირჩიოთ სწორი თარიღი',
    invalidAmount: 'გთხოვთ შეიყვანოთ თანხა',
    maxDownPayment: 'შენატანი არ უნდა აღემატებოდეს ბინის ფასს',
    minimum: 'მინიმალური',
    pleaseCheck: 'გთხოვთ შეამოწმოთ შემდეგი:',
    projectNotSelected: 'პროექტი არ არის არჩეული',
    areaNotEntered: 'ფართობი არ არის შეყვანილი',
    basePriceNotSet: 'საბაზრო ფასი არ არის დაყენებული',
    alt1Title: 'ალტერნატივა 1: სტანდარტული',
    alt2Title: 'ალტერნატივა 2: შიდა განვადება',
    alt3Title: 'ალტერნატივა 3: სრული წინასწარ გადახდა',
    alt4Title: 'ალტერნატივა 4: დიდი წინასწარ გადახდა',
    alt5Title: 'ალტერნატივა 5: 0% შენატანი',
    alt6Title: 'ალტერნატივა 6: 0% შენატანი',
    alt1Desc: '20-30% შენატანი, პროპორციული განვადება',
    alt2Desc: '20-30% შენატანი, $800/თვე, +12% მოსაკრებელი',
    alt3Desc: '80-100% წინასწარ გადახდა, -10% ფასდაკლება',
    alt4Desc: '50-80% წინასწარ გადახდა, -5% ფასდაკლება',
    alt5Desc: '0% შენატანი, მინ. $800/თვე, +$250/კვ.მ',
    alt6Desc: '0% შენატანი, მინ. $1500/თვე, +$180/კვ.მ'
  },
  en: {
    downPayment: 'Down Payment',
    monthlyPayment: 'Monthly Payment',
    balancePaymentOptions: 'Balance Payment Options',
    disable: 'Disable',
    enable: 'Enable',
    scheduledPayments: 'Scheduled Payments',
    remove: 'Remove',
    add: 'Add',
    remainingToAllocate: 'Remaining to allocate',
    calculate: 'Calculate',
    date: 'Date',
    amount: 'Amount',
    invalidDate: 'Please select a valid date',
    invalidAmount: 'Please enter an amount',
    maxDownPayment: 'Down payment cannot exceed apartment price',
    minimum: 'Minimum',
    pleaseCheck: 'Please check the following:',
    projectNotSelected: 'Project not selected',
    areaNotEntered: 'Area not entered',
    basePriceNotSet: 'Base price not set',
    alt1Title: 'Alternative 1: Standard',
    alt2Title: 'Alternative 2: Internal Installment',
    alt3Title: 'Alternative 3: Full Upfront',
    alt4Title: 'Alternative 4: Large Upfront',
    alt5Title: 'Alternative 5: 0% Down Payment',
    alt6Title: 'Alternative 6: 0% Down Payment',
    alt1Desc: '20-30% down, proportional installments',
    alt2Desc: '20-30% down, $800/month, +12% surcharge',
    alt3Desc: '80-100% upfront, -10% discount',
    alt4Desc: '50-80% upfront, -5% discount',
    alt5Desc: '0% down, min. $800/month, +$250/m²',
    alt6Desc: '0% down, min. $1500/month, +$180/m²'
  },
  ru: {
    downPayment: 'Первоначальный взнос',
    monthlyPayment: 'Ежемесячный платеж',
    balancePaymentOptions: 'Варианты оплаты остатка',
    disable: 'Отключить',
    enable: 'Включить',
    scheduledPayments: 'Запланированные платежи',
    remove: 'Удалить',
    add: 'Добавить',
    remainingToAllocate: 'Осталось распределить',
    calculate: 'Рассчитать',
    date: 'Дата',
    amount: 'Сумма',
    invalidDate: 'Пожалуйста, выберите правильную дату',
    invalidAmount: 'Пожалуйста, введите сумму',
    maxDownPayment: 'Первоначальный взнос не может превышать стоимость квартиры',
    minimum: 'Минимум',
    pleaseCheck: 'Пожалуйста, проверьте следующее:',
    projectNotSelected: 'Проект не выбран',
    areaNotEntered: 'Площадь не введена',
    basePriceNotSet: 'Базовая цена не установлена',
    alt1Title: 'Альтернатива 1: Стандарт',
    alt2Title: 'Альтернатива 2: Внутренняя рассрочка',
    alt3Title: 'Альтернатива 3: Полная предоплата',
    alt4Title: 'Альтернатива 4: Большая предоплата',
    alt5Title: 'Альтернатива 5: 0% первоначальный взнос',
    alt6Title: 'Альтернатива 6: 0% первоначальный взнос',
    alt1Desc: '20-30% первоначальный взнос, пропорциональные платежи',
    alt2Desc: '20-30% первоначальный взнос, $800/месяц, +12% надбавка',
    alt3Desc: '80-100% предоплата, -10% скидка',
    alt4Desc: '50-80% предоплата, -5% скидка',
    alt5Desc: '0% первоначальный взнос, мин. $800/месяц, +$250/м²',
    alt6Desc: '0% первоначальный взнос, мин. $1500/месяц, +$180/м²'
  }
}

const t = computed(() => translations[props.currentLang])
const emit = defineEmits<{ calculate: [result: CalculationResult] }>()

const paymentCalculator = usePaymentCalculator()

const downPaymentPercent = ref(
  props.alternative === 3 ? 80 :
  props.alternative === 4 ? 50 :
  20
)

// Ensure downPaymentPercent is always at least minDownPayment on load and when alternative changes
watch(() => props.alternative, (alt) => {
  if (alt === 3 && downPaymentPercent.value < 80) downPaymentPercent.value = 80
  if (alt === 4 && downPaymentPercent.value < 50) downPaymentPercent.value = 50
  if ((alt === 1 || alt === 2) && downPaymentPercent.value < 20) downPaymentPercent.value = 20
})
const downPaymentDollars = ref(0)
const downPaymentMode = ref<'percent' | 'dollars'>('percent')
const monthlyPayment = ref(800)

// Custom payment options (for Alt 3 & 4) - support multiple dates/amounts
const useCustomPayment = ref(false)
const customPayments = ref<Array<{ date: string, amount: number }>>([])
const newPaymentDate = ref('')
const newPaymentAmount = ref(0)

const toggleCustomPayment = () => {
  useCustomPayment.value = !useCustomPayment.value
  if (!useCustomPayment.value) {
    customPayments.value = []
    newPaymentDate.value = ''
    newPaymentAmount.value = 0
  }
}

const addCustomPayment = () => {
  if (newPaymentDate.value && newPaymentAmount.value > 0 && newPaymentAmount.value <= remainingBalance.value) {
    customPayments.value.push({ date: newPaymentDate.value, amount: newPaymentAmount.value })
    newPaymentDate.value = ''
    newPaymentAmount.value = 0
  }
}

const removeCustomPayment = (idx: number) => {
  customPayments.value.splice(idx, 1)
}

const totalCustomPayments = computed(() => customPayments.value.reduce((sum, p) => sum + p.amount, 0))
const remainingBalance = computed(() => {
  return Math.max(0, effectiveTotalPrice.value - downPaymentDollars.value - totalCustomPayments.value)
})

// Watch for changes and sync
watch(() => [props.basePrice, props.area, downPaymentPercent.value, downPaymentDollars.value, downPaymentMode.value, props.alternative, props.project.calculator_settings], () => {
  const baseTotal = props.basePrice * props.area

  // Apply discount for Alt 3 and Alt 4
  let totalPrice = baseTotal
  if (props.project.calculator_settings) {
    if (props.alternative === 3) {
      const discountPercent = props.project.calculator_settings.alternatives.alt3.discount_percent
      totalPrice = baseTotal * (1 - discountPercent / 100)
    } else if (props.alternative === 4) {
      const discountPercent = props.project.calculator_settings.alternatives.alt4.discount_percent
      totalPrice = baseTotal * (1 - discountPercent / 100)
    }
  }

  if (downPaymentMode.value === 'percent') {
    downPaymentDollars.value = totalPrice * (downPaymentPercent.value / 100)
  } else {
    if (totalPrice > 0) {
      downPaymentPercent.value = Math.min(maxDownPayment.value, Math.max(minDownPayment.value, (downPaymentDollars.value / totalPrice) * 100))
    }
  }
}, { immediate: true })

const alternativeTitle = computed(() => {
  const titles: Record<number, string> = {
    1: t.value.alt1Title,
    2: t.value.alt2Title,
    3: t.value.alt3Title,
    4: t.value.alt4Title,
    5: t.value.alt5Title,
    6: t.value.alt6Title
  }
  return titles[props.alternative]
})

const alternativeDescription = computed(() => {
  const descriptions: Record<number, string> = {
    1: t.value.alt1Desc,
    2: t.value.alt2Desc,
    3: t.value.alt3Desc,
    4: t.value.alt4Desc,
    5: t.value.alt5Desc,
    6: t.value.alt6Desc
  }
  return descriptions[props.alternative]
})

// Computed property for effective total price (with discount for Alt 3 & 4)
const effectiveTotalPrice = computed(() => {
  const baseTotal = props.basePrice * props.area

  // Apply discount for Alt 3 and Alt 4
  if (props.project.calculator_settings) {
    if (props.alternative === 3) {
      const discountPercent = props.project.calculator_settings.alternatives.alt3.discount_percent
      return baseTotal * (1 - discountPercent / 100)
    } else if (props.alternative === 4) {
      const discountPercent = props.project.calculator_settings.alternatives.alt4.discount_percent
      return baseTotal * (1 - discountPercent / 100)
    }
  }

  return baseTotal
})

const needsDownPayment = computed(() => [1, 2, 3, 4].includes(props.alternative))
const needsMonthlyPayment = computed(() => [2, 5, 6].includes(props.alternative))
const needsCustomPayment = computed(() => [3, 4].includes(props.alternative))

const minDownPayment = computed(() => {
  if (props.alternative === 3) return 80
  if (props.alternative === 4) return 50
  return 20
})

const maxDownPayment = computed(() => {
  if (props.alternative === 3) return 100
  if (props.alternative === 4) return 80
  return 30
})

const minMonthlyPayment = computed(() => {
  if (props.alternative === 6) return 1500
  return 800
})

const downPaymentAmount = computed(() => {
  return effectiveTotalPrice.value * (downPaymentPercent.value / 100)
})

const canCalculate = computed(() => {
  return props.project && props.area > 0 && props.basePrice > 0
})

const handleCalculate = () => {
  if (!props.project.calculator_settings) {
    console.error('No calculator settings for project')
    return
  }

  const result = paymentCalculator.calculate({
    basePrice: props.basePrice,
    area: props.area,
    alternative: props.alternative,
    projectSettings: props.project.calculator_settings,
    downPaymentPercent: downPaymentPercent.value,
    monthlyPayment: monthlyPayment.value,
    // Pass all custom payments for Alt 3 & 4
    customPayments:
      useCustomPayment.value && customPayments.value.length > 0
        ? customPayments.value
        : undefined,
    // Keep legacy single payment support for backwards compatibility
    customPaymentDate:
      useCustomPayment.value && customPayments.value.length > 0
        ? customPayments.value[0].date
        : undefined,
    customPaymentAmount:
      useCustomPayment.value && customPayments.value.length > 0
        ? customPayments.value[0].amount
        : undefined,
  })

  emit('calculate', result)
}
</script>
