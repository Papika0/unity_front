<template>
  <Modal :show="isOpen" :title="t('admin.crm.stage_change.title')" @close="handleKeepSame">
    <div class="space-y-4">
      <!-- Message -->
      <p class="text-sm text-gray-600">
        {{ t('admin.crm.stage_change.message') }}
      </p>

      <!-- Current Price Info -->
      <div v-if="deal && deal.current_price" class="p-4 bg-gray-50 rounded-lg space-y-3">
        <!-- Current Price -->
        <div>
          <div class="text-sm text-gray-500">{{ t('admin.crm.pricing.current_price') }}</div>
          <div class="text-2xl font-bold text-gray-900">{{ currencySymbol }}{{ formatNumber(deal.current_price) }}</div>
        </div>

        <!-- Payment Alternative Details -->
        <div v-if="deal.selected_payment_alternative" class="pt-3 border-t border-gray-200">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <div class="text-xs text-gray-500">{{ t('admin.crm.pricing.payment_plan') }}</div>
              <div class="text-sm font-medium text-gray-900">
                {{ alternativeTitle(deal.selected_payment_alternative) }}
              </div>
            </div>

            <div v-if="deal.payment_alternative_params?.initial_payment_percent">
              <div class="text-xs text-gray-500">{{ t('admin.crm.pricing.down_payment') }}</div>
              <div class="text-sm font-medium text-gray-900">
                {{ deal.payment_alternative_params.initial_payment_percent }}%
              </div>
            </div>

            <div v-if="monthlyPaymentAmount" class="col-span-2">
              <div class="text-xs text-gray-500">{{ t('admin.crm.pricing.monthly_payment') }}</div>
              <div class="text-sm font-medium text-gray-900">
                {{ currencySymbol }}{{ formatNumber(monthlyPaymentAmount) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Question Flow -->
      <div class="space-y-4">
        <!-- Question -->
        <div class="text-center py-2">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ t('admin.crm.stage_change.offer_changed_question') }}
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            {{ t('admin.crm.stage_change.offer_changed_hint') }}
          </p>
        </div>

        <!-- Answer Buttons -->
        <div class="grid grid-cols-2 gap-4">
          <!-- No - Keep Same -->
          <button
            type="button"
            class="flex flex-col items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-4 py-6 text-center hover:border-green-500 hover:bg-green-50 transition-all"
            @click="handleKeepSame"
          >
            <span class="text-3xl mb-2">✓</span>
            <span class="text-sm font-semibold text-gray-900">
              {{ t('admin.crm.stage_change.no_keep_same') }}
            </span>
            <span class="text-xs text-gray-600 mt-1">
              {{ t('admin.crm.stage_change.carry_forward') }}
            </span>
          </button>

          <!-- Yes - Update Price -->
          <button
            type="button"
            class="flex flex-col items-center justify-center rounded-lg border-2 border-gray-300 bg-white px-4 py-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all"
            @click="handleUpdatePrice"
          >
            <span class="text-3xl mb-2">✏️</span>
            <span class="text-sm font-semibold text-gray-900">
              {{ t('admin.crm.stage_change.yes_update') }}
            </span>
            <span class="text-xs text-gray-600 mt-1">
              {{ t('admin.crm.stage_change.open_pricing_modal') }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Modal from '@/components/admin/ui/Modal.vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useLocaleFormatter } from '@/composables/i18n/useLocaleFormatter'
import { useAlternativeDescriptions } from '@/composables/calculator/useAlternativeDescriptions'
import type { CrmDeal } from '@/types/crm'
import type { ProjectCalculatorSettings } from '@/types/admin/calculator'

const props = defineProps<{
  isOpen: boolean
  deal: CrmDeal | null
  targetStageId: number | null
  calculatorSettings?: ProjectCalculatorSettings | null
}>()

const emit = defineEmits<{
  keepSame: [dealId: number, stageId: number]
  updatePrice: [dealId: number, stageId: number]
  close: []
}>()

const { t } = useTranslations()
const { formatNumber: formatNum, getCurrencySymbol } = useLocaleFormatter()
// NOW DYNAMIC: Pass calculator settings to get dynamic constraints
const alternativeDescriptions = computed(() =>
  useAlternativeDescriptions(props.calculatorSettings ?? null)
)

// Get current language (default to 'en')
const currentLanguage = computed<'ka' | 'en' | 'ru'>(() => {
  const savedLang = localStorage.getItem('language')
  if (savedLang === 'ka' || savedLang === 'en' || savedLang === 'ru') {
    return savedLang
  }
  return 'en'
})

// Get alternative title in current language
function alternativeTitle(altId: number): string {
  const alt = alternativeDescriptions.value.find(a => a.id === altId)
  return alt ? alt.title[currentLanguage.value] : `${t('admin.crm.pricing.option')} ${altId}`
}

// Calculate monthly payment amount for display
const monthlyPaymentAmount = computed(() => {
  if (!props.deal?.payment_alternative_params) return null

  // Try to get monthly payment from params (may be stored with different key)
  const params = props.deal.payment_alternative_params as Record<string, unknown>
  if (props.deal.selected_payment_alternative && [2, 5, 6].includes(props.deal.selected_payment_alternative)) {
    return (params.monthly_payment as number) || null
  }

  return null
})

function formatNumber(val: number) {
  return formatNum(val, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

// Currency symbol based on deal currency
const currencySymbol = computed(() => getCurrencySymbol(props.deal?.currency || 'USD'))

function handleKeepSame() {
  if (props.deal && props.targetStageId) {
    emit('keepSame', props.deal.id, props.targetStageId)
  }
  emit('close')
}

function handleUpdatePrice() {
  if (props.deal && props.targetStageId) {
    emit('updatePrice', props.deal.id, props.targetStageId)
  }
  emit('close')
}
</script>
