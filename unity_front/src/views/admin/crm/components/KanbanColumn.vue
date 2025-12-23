<script setup lang="ts">
/**
 * Kanban Column Component
 * Single stage column in the pipeline
 */

import { computed } from 'vue'
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
const emit = defineEmits<{
  (e: 'deal-click', deal: CrmDeal): void
  (e: 'dragstart', deal: CrmDeal, stageId: number): void
  (e: 'dragover', event: DragEvent): void
  (e: 'drop', event: DragEvent, stageId: number): void
}>()

// Computed
const isDraggingOver = computed(() => false) // Can be enhanced with hover state

// Format currency
function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0'
  }
  return new Intl.NumberFormat('ka-GE', { maximumFractionDigits: 0 }).format(value)
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
        ${{ formatCurrency(column.total_value) }}
      </div>
    </div>

    <!-- Deals List -->
    <div class="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
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
        <p class="text-sm text-gray-400">არ არის გარიგებები</p>
        <p class="text-xs text-gray-400 mt-1">გადაიტანეთ აქ ან შექმენით ახალი</p>
      </div>
    </div>

    <!-- Column Footer (Stats) -->
    <div v-if="column.deals.length > 0" class="px-4 py-2 bg-white rounded-b-xl border-t border-gray-200">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>საშუალო ღირებულება</span>
        <span class="font-medium text-gray-700">
          ${{
            formatCurrency(column.deal_count > 0 ? column.total_value / column.deal_count : 0)
          }}
        </span>
      </div>
    </div>
  </div>
</template>
