<template>
  <teleport to="body">
    <transition
      enter-active-class="transition-all duration-300 ease-out"
      leave-active-class="transition-all duration-200 ease-in"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="close"
      >
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          leave-active-class="transition-all duration-200 ease-in"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="modelValue"
            class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <!-- Header -->
            <div class="bg-gradient-to-r from-amber-500 to-yellow-500 p-6 rounded-t-2xl">
              <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold text-white">{{ t.title }}</h2>
                <button
                  @click="close"
                  class="text-white hover:bg-white/20 rounded-lg p-2 transition-all"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p class="text-white/80 mt-2">{{ t.subtitle }}</p>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6">
              <!-- Project Selection -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">
                  {{ t.selectProject }}
                </label>
                <select
                  v-model="selectedProjectId"
                  @change="loadProjectSettings"
                  class="w-full px-4 py-3 bg-white border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-slate-900 font-medium"
                >
                  <option :value="null">{{ t.selectProjectPlaceholder }}</option>
                  <option v-for="project in projects" :key="project.id" :value="project.id">
                    {{ getLocalizedProjectName(project) }} 
                  </option>
                </select>
              </div>

              <!-- Loading State -->
              <div v-if="loading" class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div>
              </div>

              <!-- Settings Form -->
              <div v-else-if="selectedProjectId" class="space-y-6">
                <!-- Base Price per SQM -->
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                  <label class="block text-sm font-semibold text-green-900 mb-2">
                    💰 {{ t.basePricePerSqm }}
                  </label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                    <input
                      v-model.number="formData.base_price_per_sqm"
                      type="number"
                      min="0"
                      step="0.01"
                      class="w-full pl-8 pr-4 py-3 bg-white border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all text-slate-900 font-medium"
                      :placeholder="t.basePricePlaceholder"
                    />
                  </div>
                  <p class="text-xs text-slate-600 mt-1">{{ t.basePriceHint }}</p>
                </div>

                <!-- Universal Deadline -->
                <div class="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-4">
                  <label class="block text-sm font-semibold text-blue-900 mb-2">
                    📅 {{ t.deadline }}
                  </label>
                  <input
                    v-model="formData.deadline"
                    type="date"
                    class="w-full px-4 py-3 bg-white border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 font-medium"
                  />
                  <p class="text-xs text-slate-600 mt-1">{{ t.deadlineHint }}</p>
                </div>

                <!-- Payment Alternatives Configuration -->
                <div class="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
                  <h3 class="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    {{ t.paymentAlternatives }}
                  </h3>
                  <div class="space-y-3">
                    <!-- Alt 1 -->
                    <div class="bg-white border-2 border-slate-200 rounded-lg p-3">
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-semibold text-slate-900 text-sm">{{ t.alt1 }}</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" v-model="formData.alternatives.alt1.enabled" class="sr-only peer">
                          <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>
                      <p class="text-xs text-slate-500">{{ t.alt1Desc }}</p>
                    </div>

                    <!-- Alt 2 -->
                    <div class="bg-white border-2 border-slate-200 rounded-lg p-3">
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-semibold text-slate-900 text-sm">{{ t.alt2 }}</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" v-model="formData.alternatives.alt2.enabled" class="sr-only peer">
                          <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>
                      <p class="text-xs text-slate-500 mb-2">{{ t.alt2Desc }}</p>
                      <div v-if="formData.alternatives.alt2.enabled">
                        <label class="block text-xs font-medium text-slate-700 mb-1">{{ t.surchargePercent }}</label>
                        <div class="relative">
                          <input
                            v-model.number="formData.alternatives.alt2.surcharge_percent"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-slate-900"
                            placeholder="12"
                          />
                          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
                        </div>
                      </div>
                    </div>

                    <!-- Alt 3 -->
                    <div class="bg-white border-2 border-slate-200 rounded-lg p-3">
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-semibold text-slate-900 text-sm">{{ t.alt3 }}</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" v-model="formData.alternatives.alt3.enabled" class="sr-only peer">
                          <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>
                      <p class="text-xs text-slate-500 mb-2">{{ t.alt3Desc }}</p>
                      <div v-if="formData.alternatives.alt3.enabled">
                        <label class="block text-xs font-medium text-slate-700 mb-1">{{ t.discountPercent }}</label>
                        <div class="relative">
                          <input
                            v-model.number="formData.alternatives.alt3.discount_percent"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-slate-900"
                            placeholder="10"
                          />
                          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
                        </div>
                      </div>
                    </div>

                    <!-- Alt 4 -->
                    <div class="bg-white border-2 border-slate-200 rounded-lg p-3">
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-semibold text-slate-900 text-sm">{{ t.alt4 }}</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" v-model="formData.alternatives.alt4.enabled" class="sr-only peer">
                          <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>
                      <p class="text-xs text-slate-500 mb-2">{{ t.alt4Desc }}</p>
                      <div v-if="formData.alternatives.alt4.enabled">
                        <label class="block text-xs font-medium text-slate-700 mb-1">{{ t.discountPercent }}</label>
                        <div class="relative">
                          <input
                            v-model.number="formData.alternatives.alt4.discount_percent"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            class="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-slate-900"
                            placeholder="15"
                          />
                          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
                        </div>
                      </div>
                    </div>

                    <!-- Alt 5 -->
                    <div class="bg-white border-2 border-slate-200 rounded-lg p-3">
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-semibold text-slate-900 text-sm">{{ t.alt5 }}</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" v-model="formData.alternatives.alt5.enabled" class="sr-only peer">
                          <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>
                      <p class="text-xs text-slate-500 mb-2">{{ t.alt5Desc }}</p>
                      <div v-if="formData.alternatives.alt5.enabled">
                        <label class="block text-xs font-medium text-slate-700 mb-1">{{ t.priceIncrease }}</label>
                        <div class="relative">
                          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                          <input
                            v-model.number="formData.alternatives.alt5.price_increase_per_sqm"
                            type="number"
                            min="0"
                            step="1"
                            class="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-slate-900"
                            placeholder="50"
                          />
                          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">/m²</span>
                        </div>
                      </div>
                    </div>

                    <!-- Alt 6 -->
                    <div class="bg-white border-2 border-slate-200 rounded-lg p-3">
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-semibold text-slate-900 text-sm">{{ t.alt6 }}</span>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" v-model="formData.alternatives.alt6.enabled" class="sr-only peer">
                          <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                        </label>
                      </div>
                      <p class="text-xs text-slate-500 mb-2">{{ t.alt6Desc }}</p>
                      <div v-if="formData.alternatives.alt6.enabled">
                        <label class="block text-xs font-medium text-slate-700 mb-1">{{ t.priceIncrease }}</label>
                        <div class="relative">
                          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                          <input
                            v-model.number="formData.alternatives.alt6.price_increase_per_sqm"
                            type="number"
                            min="0"
                            step="1"
                            class="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm text-slate-900"
                            placeholder="100"
                          />
                          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">/m²</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Error Message -->
              <div v-if="error" class="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p class="text-red-600 text-sm">{{ error }}</p>
              </div>
            </div>

            <!-- Footer -->
            <div class="border-t-2 border-slate-200 p-6 flex justify-end gap-3">
              <button
                @click="close"
                class="px-6 py-3 text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all font-medium"
              >
                {{ t.cancel }}
              </button>
              <button
                @click="saveSettings"
                :disabled="!selectedProjectId || saving || !hasChanges"
                class="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all shadow-lg hover:shadow-xl font-medium transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span v-if="saving" class="flex items-center gap-2">
                  <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ t.saving }}
                </span>
                <span v-else>{{ t.save }}</span>
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { adminCalculatorApi } from '@/services/adminCalculatorApi'
import type { ActiveProject } from '@/types/admin/calculator'
import { format } from 'date-fns'

interface Props {
  modelValue: boolean
  projects: ActiveProject[]
  currentLang: 'ka' | 'en' | 'ru'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'saved': []
}>()

const translations = {
  ka: {
    title: 'პროექტის პარამეტრების რედაქტირება',
    subtitle: 'განაახლეთ საბაზრო ფასი, ვადა და გადახდის ვარიანტები',
    selectProject: 'აირჩიეთ პროექტი',
    selectProjectPlaceholder: '-- აირჩიეთ პროექტი --',
    basePricePerSqm: 'საბაზრო ფასი კვ.მ-ზე',
    basePricePlaceholder: 'შეიყვანეთ ფასი',
    basePriceHint: 'ფასი დოლარებში თითო კვადრატულ მეტრზე',
    deadline: 'ვადა (ყველა ვარიანტისთვის)',
    deadlineHint: 'ეს თარიღი გამოიყენება ყველა გადახდის ვარიანტში',
    paymentAlternatives: 'გადახდის ვარიანტები',
    alt1: 'ვარიანტი 1 - სტანდარტული',
    alt1Desc: '20-30% შენატანი, პროპორციული განვადება',
    alt2: 'ვარიანტი 2 - შიდა განვადება',
    alt2Desc: '20-30% შენატანი, $800/თვე, +მოსაკრებელი',
    alt3: 'ვარიანტი 3 - სრული წინასწარ გადახდა',
    alt3Desc: '80-100% წინასწარ გადახდა, -ფასდაკლება',
    alt4: 'ვარიანტი 4 - დიდი წინასწარ გადახდა',
    alt4Desc: '50-80% წინასწარ გადახდა, -ფასდაკლება',
    alt5: 'ვარიანტი 5 - 0% შენატანი',
    alt5Desc: '0% შენატანი, მინ. $800/თვე, +ფასის მატება',
    alt6: 'ვარიანტი 6 - 0% შენატანი (გაფართოებული)',
    alt6Desc: '0% შენატანი, მინ. $1500/თვე, +ფასის მატება',
    surchargePercent: 'მოსაკრებელი %',
    discountPercent: 'ფასდაკლება %',
    priceIncrease: 'ფასის მატება კვ.მ-ზე',
    cancel: 'გაუქმება',
    save: 'შენახვა',
    saving: 'ინახება...',
    successMessage: 'პარამეტრები წარმატებით განახლდა',
    errorMessage: 'შეცდომა პარამეტრების განახლებისას'
  },
  en: {
    title: 'Edit Project Settings',
    subtitle: 'Update base price, deadline and payment alternatives',
    selectProject: 'Select Project',
    selectProjectPlaceholder: '-- Select Project --',
    basePricePerSqm: 'Base Price per SQM',
    basePricePlaceholder: 'Enter price',
    basePriceHint: 'Price in dollars per square meter',
    deadline: 'Deadline (All Alternatives)',
    deadlineHint: 'This date will be used for all payment alternatives',
    paymentAlternatives: 'Payment Alternatives',
    alt1: 'Option 1 - Standard',
    alt1Desc: '20-30% down, proportional installments',
    alt2: 'Option 2 - Internal Installment',
    alt2Desc: '20-30% down, $800/month, +surcharge',
    alt3: 'Option 3 - Full Upfront',
    alt3Desc: '80-100% upfront payment, -discount',
    alt4: 'Option 4 - Large Upfront',
    alt4Desc: '50-80% upfront payment, -discount',
    alt5: 'Option 5 - 0% Down Payment',
    alt5Desc: '0% down, min. $800/month, +price increase',
    alt6: 'Option 6 - 0% Down (Extended)',
    alt6Desc: '0% down, min. $1500/month, +price increase',
    surchargePercent: 'Surcharge %',
    discountPercent: 'Discount %',
    priceIncrease: 'Price Increase per SQM',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    successMessage: 'Settings updated successfully',
    errorMessage: 'Error updating settings'
  },
  ru: {
    title: 'Редактировать параметры проекта',
    subtitle: 'Обновить базовую цену, срок и варианты оплаты',
    selectProject: 'Выберите проект',
    selectProjectPlaceholder: '-- Выберите проект --',
    basePricePerSqm: 'Базовая цена за кв.м',
    basePricePlaceholder: 'Введите цену',
    basePriceHint: 'Цена в долларах за квадратный метр',
    deadline: 'Срок (все варианты)',
    deadlineHint: 'Эта дата будет использоваться для всех вариантов оплаты',
    paymentAlternatives: 'Варианты оплаты',
    alt1: 'Вариант 1 - Стандарт',
    alt1Desc: '20-30% первоначальный взнос, пропорциональные платежи',
    alt2: 'Вариант 2 - Внутренняя рассрочка',
    alt2Desc: '20-30% первоначальный взнос, $800/месяц, +надбавка',
    alt3: 'Вариант 3 - Полная предоплата',
    alt3Desc: '80-100% предоплата, -скидка',
    alt4: 'Вариант 4 - Большая предоплата',
    alt4Desc: '50-80% предоплата, -скидка',
    alt5: 'Вариант 5 - 0% первоначальный взнос',
    alt5Desc: '0% первоначальный взнос, мин. $800/месяц, +увеличение цены',
    alt6: 'Вариант 6 - 0% первоначальный взнос (расширенная)',
    alt6Desc: '0% первоначальный взнос, мин. $1500/месяц, +увеличение цены',
    surchargePercent: 'Наценка %',
    discountPercent: 'Скидка %',
    priceIncrease: 'Увеличение цены за кв.м',
    cancel: 'Отмена',
    save: 'Сохранить',
    saving: 'Сохранение...',
    successMessage: 'Настройки успешно обновлены',
    errorMessage: 'Ошибка при обновлении настроек'
  }
}

const t = computed(() => translations[props.currentLang])

const getLocalizedProjectName = (project: ActiveProject) => {
  if (props.currentLang === 'ka' && project.title_ka) {
    return project.title_ka
  } else if (props.currentLang === 'en' && project.title_en) {
    return project.title_en
  } else if (props.currentLang === 'ru' && project.title_ru) {
    return project.title_ru
  }
  return project.title
}

const selectedProjectId = ref<number | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref('')

const formData = ref({
  base_price_per_sqm: 0,
  deadline: '',
  alternatives: {
    alt1: {
      enabled: true
    },
    alt2: {
      enabled: true,
      surcharge_percent: 0
    },
    alt3: {
      enabled: true,
      discount_percent: 0
    },
    alt4: {
      enabled: true,
      discount_percent: 0
    },
    alt5: {
      enabled: true,
      price_increase_per_sqm: 0
    },
    alt6: {
      enabled: true,
      price_increase_per_sqm: 0
    }
  }
})

const originalValues = ref({
  base_price_per_sqm: 0,
  deadline: '',
  alternatives: {
    alt1: { enabled: true },
    alt2: { enabled: true, surcharge_percent: 0 },
    alt3: { enabled: true, discount_percent: 0 },
    alt4: { enabled: true, discount_percent: 0 },
    alt5: { enabled: true, price_increase_per_sqm: 0 },
    alt6: { enabled: true, price_increase_per_sqm: 0 }
  }
})

const hasChanges = computed(() => {
  return JSON.stringify(formData.value) !== JSON.stringify(originalValues.value)
})

const loadProjectSettings = async () => {
  if (!selectedProjectId.value) return

  try {
    loading.value = true
    error.value = ''

    const settings = await adminCalculatorApi.getProjectCalculatorSettings(selectedProjectId.value)
    
    // Get the deadline from calculator_settings (use alt1's deadline as the common deadline)
    const deadline = settings.calculator_settings?.alternatives?.alt1?.deadline || ''
    const alts = settings.calculator_settings?.alternatives
    
    formData.value = {
      base_price_per_sqm: settings.base_price_per_sqm || 0,
      deadline: deadline,
      alternatives: {
        alt1: {
          enabled: alts?.alt1?.enabled ?? true
        },
        alt2: {
          enabled: alts?.alt2?.enabled ?? true,
          surcharge_percent: alts?.alt2?.surcharge_percent || 0
        },
        alt3: {
          enabled: alts?.alt3?.enabled ?? true,
          discount_percent: alts?.alt3?.discount_percent || 0
        },
        alt4: {
          enabled: alts?.alt4?.enabled ?? true,
          discount_percent: alts?.alt4?.discount_percent || 0
        },
        alt5: {
          enabled: alts?.alt5?.enabled ?? true,
          price_increase_per_sqm: alts?.alt5?.price_increase_per_sqm || 0
        },
        alt6: {
          enabled: alts?.alt6?.enabled ?? true,
          price_increase_per_sqm: alts?.alt6?.price_increase_per_sqm || 0
        }
      }
    }

    originalValues.value = JSON.parse(JSON.stringify(formData.value))
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { message?: string } } }
    error.value = axiosError.response?.data?.message || t.value.errorMessage
    console.error('Error loading project settings:', err)
  } finally {
    loading.value = false
  }
}

const saveSettings = async () => {
  if (!selectedProjectId.value) return

  try {
    saving.value = true
    error.value = ''

    // Get current calculator settings
    const currentSettings = await adminCalculatorApi.getProjectCalculatorSettings(selectedProjectId.value)

    // Safely access calculator settings with null fallback
    const existingCalculatorSettings = currentSettings.calculator_settings || {}
    const existingAlternatives = existingCalculatorSettings.alternatives || {}

    // Build updated calculator settings with all form data
    const updatedCalculatorSettings = {
      ...existingCalculatorSettings,
      alternatives: {
        alt1: {
          ...existingAlternatives.alt1,
          enabled: formData.value.alternatives.alt1.enabled,
          deadline: formData.value.deadline
        },
        alt2: {
          ...existingAlternatives.alt2,
          enabled: formData.value.alternatives.alt2.enabled,
          surcharge_percent: formData.value.alternatives.alt2.enabled
            ? formData.value.alternatives.alt2.surcharge_percent
            : 0,
          deadline: formData.value.deadline
        },
        alt3: {
          ...existingAlternatives.alt3,
          enabled: formData.value.alternatives.alt3.enabled,
          discount_percent: formData.value.alternatives.alt3.enabled
            ? formData.value.alternatives.alt3.discount_percent
            : 0,
          deadline: formData.value.deadline
        },
        alt4: {
          ...existingAlternatives.alt4,
          enabled: formData.value.alternatives.alt4.enabled,
          discount_percent: formData.value.alternatives.alt4.enabled
            ? formData.value.alternatives.alt4.discount_percent
            : 0,
          deadline: formData.value.deadline
        },
        alt5: {
          ...existingAlternatives.alt5,
          enabled: formData.value.alternatives.alt5.enabled,
          price_increase_per_sqm: formData.value.alternatives.alt5.enabled
            ? formData.value.alternatives.alt5.price_increase_per_sqm
            : 0,
          deadline: formData.value.deadline
        },
        alt6: {
          ...existingAlternatives.alt6,
          enabled: formData.value.alternatives.alt6.enabled,
          price_increase_per_sqm: formData.value.alternatives.alt6.enabled
            ? formData.value.alternatives.alt6.price_increase_per_sqm
            : 0,
          deadline: formData.value.deadline
        }
      }
    }

    // Update with new values
    await adminCalculatorApi.updateProjectCalculatorSettings(selectedProjectId.value, {
      base_price_per_sqm: formData.value.base_price_per_sqm,
      calculator_settings: updatedCalculatorSettings
    })

    originalValues.value = { ...formData.value }
    emit('saved')
    close()
  } catch (err: unknown) {
    const axiosError = err as { response?: { data?: { message?: string } } }
    error.value = axiosError.response?.data?.message || t.value.errorMessage
    console.error('Error saving project settings:', err)
  } finally {
    saving.value = false
  }
}

/**
 * Format a date string for display
 * @internal - Kept for potential future use
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return ''
  try {
    return format(new Date(dateString), 'MMM dd, yyyy')
  } catch {
    return dateString
  }
}

const close = () => {
  emit('update:modelValue', false)
  // Reset form after animation completes
  setTimeout(() => {
    selectedProjectId.value = null
    error.value = ''
    formData.value = {
      base_price_per_sqm: 0,
      deadline: '',
      alternatives: {
        alt1: { enabled: true },
        alt2: { enabled: true, surcharge_percent: 0 },
        alt3: { enabled: true, discount_percent: 0 },
        alt4: { enabled: true, discount_percent: 0 },
        alt5: { enabled: true, price_increase_per_sqm: 0 },
        alt6: { enabled: true, price_increase_per_sqm: 0 }
      }
    }
    originalValues.value = JSON.parse(JSON.stringify(formData.value))
  }, 300)
}

// Watch for modal open
watch(() => props.modelValue, (isOpen) => {
  if (!isOpen) {
    selectedProjectId.value = null
    error.value = ''
  }
})
</script>
