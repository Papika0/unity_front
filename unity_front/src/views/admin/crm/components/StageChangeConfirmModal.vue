<template>
  <Modal :show="isOpen" :title="t('admin.crm.stage_change.title')" @close="handleKeepSame">
    <div class="space-y-4">
      <!-- Message -->
      <p class="text-sm text-gray-600">
        {{ t('admin.crm.stage_change.message') }}
      </p>

      <!-- Current Price Info -->
      <div v-if="deal && deal.current_price" class="p-4 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-500 mb-1">{{ t('admin.crm.pricing.current_price') }}</div>
        <div class="text-xl font-bold text-gray-900">${{ formatNumber(deal.current_price) }}</div>
        <div v-if="deal.selected_payment_alternative" class="mt-2 text-sm text-gray-600">
          {{ t('admin.crm.pricing.selected_plan') }}: {{ t('admin.crm.pricing.option') }} {{ deal.selected_payment_alternative }}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-3 pt-4">
        <button
          type="button"
          class="w-full inline-flex justify-center rounded-md bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-200 transition-colors"
          @click="handleKeepSame"
        >
          {{ t('admin.crm.stage_change.keep_same') }}
        </button>
        <button
          type="button"
          class="w-full inline-flex justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          @click="handleUpdatePrice"
        >
          {{ t('admin.crm.stage_change.update_price') }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/admin/ui/Modal.vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import type { CrmDeal } from '@/types/crm'

const props = defineProps<{
  isOpen: boolean
  deal: CrmDeal | null
  targetStageId: number | null
}>()

const emit = defineEmits<{
  keepSame: [dealId: number, stageId: number]
  updatePrice: [dealId: number, stageId: number]
  close: []
}>()

const { t } = useTranslations()

function formatNumber(val: number) {
  return val.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

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
