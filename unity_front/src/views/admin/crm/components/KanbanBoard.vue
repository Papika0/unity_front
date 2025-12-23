<script setup lang="ts">
/**
 * Kanban Board Component
 * Main container for all pipeline columns
 */

import { computed } from 'vue'
import type { KanbanColumn, CrmDeal } from '@/types/crm'
import { useCrmKanban } from '@/composables/useCrmKanban'
import KanbanColumnComponent from './KanbanColumn.vue'

// Props
interface Props {
  columns: KanbanColumn[]
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'deal-click', deal: CrmDeal): void
  (e: 'stage-change', dealId: number, newStageId: number): void
}>()

// Composable
const { draggedDeal, handleDragStart, handleDragEnd, handleDragOver, handleDrop } = useCrmKanban()

// Computed
const draggedDealId = computed(() => draggedDeal.value?.id ?? null)

// Handle drag start from card
function onDragStart(deal: CrmDeal, stageId: number): void {
  handleDragStart(deal, stageId)
}

// Handle drop on column
function onDrop(event: DragEvent, targetStageId: number): void {
  handleDrop(event, targetStageId, (dealId, newStageId) => {
    emit('stage-change', dealId, newStageId)
  })
}
</script>

<template>
  <div class="h-full overflow-x-auto overflow-y-hidden p-6 bg-gray-50">
    <div class="flex gap-4 h-full min-w-max" @dragend="handleDragEnd">
      <KanbanColumnComponent
        v-for="column in columns"
        :key="column.id"
        :column="column"
        :dragged-deal-id="draggedDealId"
        @deal-click="$emit('deal-click', $event)"
        @dragstart="onDragStart"
        @dragover="handleDragOver"
        @drop="onDrop"
      />

      <!-- Empty State -->
      <div
        v-if="columns.length === 0"
        class="flex-1 flex items-center justify-center text-center py-12"
      >
        <div>
          <svg
            class="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p class="text-lg text-gray-500 font-medium">არ არის Pipeline-ის სტადიები</p>
          <p class="text-sm text-gray-400 mt-2">გთხოვთ დაამატოთ სტადიები პარამეტრებიდან</p>
        </div>
      </div>
    </div>
  </div>
</template>
