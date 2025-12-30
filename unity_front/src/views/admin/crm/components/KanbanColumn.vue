<script setup lang="ts">
/**
 * Kanban Column Component
 * Single stage column in the pipeline
 * Features virtual scrolling for columns with > 30 deals
 */

import { computed } from 'vue'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useLocaleFormatter } from '@/composables/i18n/useLocaleFormatter'
import type { KanbanColumn, CrmDeal } from '@/types/crm'
import KanbanCard from './KanbanCard.vue'

// Props
interface Props {
  column: KanbanColumn
  draggedDealId?: number | null
}

const props = withDefaults(defineProps<Props>(), {
  draggedDealId: null,
})

// Emits
defineEmits<{
  (e: 'deal-click', deal: CrmDeal): void
  (e: 'dragstart', deal: CrmDeal, stageId: number): void
  (e: 'dragover', event: DragEvent): void
  (e: 'drop', event: DragEvent, stageId: number): void
}>()

// Composables
const { t } = useTranslations()
const { formatNumber, getCurrencySymbol } = useLocaleFormatter()

// Virtual scrolling configuration
const VIRTUAL_SCROLL_THRESHOLD = 30
const ESTIMATED_ITEM_HEIGHT = 180

// Computed
const isDraggingOver = computed(() => false) // Can be enhanced with hover state

// Use virtual scrolling for columns with > 30 deals
const useVirtualScroll = computed(() => {
  return props.column.deals.length > VIRTUAL_SCROLL_THRESHOLD
})

// Get currency from first deal in column, default to USD
const columnCurrency = computed(() => {
  return props.column.deals?.[0]?.currency || 'USD'
})

// Currency symbol
const currencySymbol = computed(() => getCurrencySymbol(columnCurrency.value))

// Average price display logic (only for Reserved and Won stages)
const shouldShowAveragePrice = computed(() => {
  // Only show for contract (Reserved) and won (Sold) stages
  return ['contract', 'won'].includes(props.column.slug ?? '') &&
         props.column.deal_count > 0
})

const averagePriceLabel = computed(() => {
  if (props.column.slug === 'won') {
    return t('admin.crm.kanban.average_sale_price')
  }
  return t('admin.crm.kanban.average_agreed_price')
})

const averagePrice = computed(() => {
  if (props.column.deal_count === 0) return 0
  return props.column.total_value / props.column.deal_count
})

// Format currency
function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0'
  }
  return formatNumber(value, { maximumFractionDigits: 0 })
}
</script>

<template>
  <div
    class="flex flex-col w-80 bg-gray-50 rounded-xl border border-gray-200 transition-all"
    :class="{ 'ring-2 ring-blue-400': isDraggingOver }"
    @dragover="$emit('dragover', $event)"
    @drop="$emit('drop', $event, column.id)"
  >
    <!-- Column Header -->
    <div
      class="px-4 py-3 bg-white rounded-t-xl border-b border-gray-200"
      :style="{ borderLeftColor: column.color, borderLeftWidth: '4px' }"
    >
      <div class="flex items-center justify-between mb-1">
        <h3 class="font-bold text-gray-900 text-sm">{{ column.name }}</h3>
        <span class="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
          {{ column.deal_count }}
        </span>
      </div>
      <div class="text-xs font-medium text-gray-600">
        {{ currencySymbol }}{{ formatCurrency(column.total_value) }}
      </div>
    </div>

    <!-- Deals List - Virtual Scrolling for large columns (> 30 deals) -->
    <RecycleScroller
      v-if="useVirtualScroll"
      class="flex-1 p-3 kanban-scroller"
      :items="column.deals"
      :item-size="ESTIMATED_ITEM_HEIGHT"
      key-field="id"
      :buffer="200"
      list-tag="div"
      item-tag="div"
    >
      <template #default="{ item: deal }">
        <div class="mb-3">
          <KanbanCard
            :deal="deal"
            :is-dragging="draggedDealId === deal.id"
            @click="$emit('deal-click', deal)"
            @dragstart="$emit('dragstart', deal, column.id)"
          />
        </div>
      </template>
    </RecycleScroller>

    <!-- Deals List - Regular rendering for small columns (<= 30 deals) -->
    <div v-else class="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
      <KanbanCard
        v-for="deal in column.deals"
        :key="deal.id"
        :deal="deal"
        :is-dragging="draggedDealId === deal.id"
        @click="$emit('deal-click', deal)"
        @dragstart="$emit('dragstart', deal, column.id)"
      />

      <!-- Empty State -->
      <div
        v-if="column.deals.length === 0"
        class="flex flex-col items-center justify-center py-12 text-center"
      >
        <svg class="w-12 h-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p class="text-sm text-gray-400">{{ t('admin.crm.kanban.no_deals') }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ t('admin.crm.kanban.empty_column_hint') }}</p>
      </div>
    </div>

    <!-- Column Footer (Stats) - Only for Reserved and Won stages -->
    <div v-if="shouldShowAveragePrice" class="px-4 py-2 bg-white rounded-b-xl border-t border-gray-200">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>{{ averagePriceLabel }}</span>
        <span class="font-medium text-gray-700">
          {{ currencySymbol }}{{ formatCurrency(averagePrice) }}
        </span>
      </div>
    </div>
  </div>
</template>
