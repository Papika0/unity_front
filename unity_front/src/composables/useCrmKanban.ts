/**
 * CRM Kanban Composable
 * Handles drag-and-drop logic for Kanban board
 */

import { ref } from 'vue'
import type { CrmDeal } from '@/types/crm'

export function useCrmKanban() {
  const draggedDeal = ref<CrmDeal | null>(null)
  const draggedFromStageId = ref<number | null>(null)

  /**
   * Handle drag start
   */
  function handleDragStart(deal: CrmDeal, stageId: number): void {
    draggedDeal.value = deal
    draggedFromStageId.value = stageId
  }

  /**
   * Handle drag end
   */
  function handleDragEnd(): void {
    draggedDeal.value = null
    draggedFromStageId.value = null
  }

  /**
   * Handle drag over (prevent default to allow drop)
   */
  function handleDragOver(event: DragEvent): void {
    event.preventDefault()
  }

  /**
   * Handle drop
   */
  function handleDrop(
    event: DragEvent,
    targetStageId: number,
    onStageChange: (dealId: number, newStageId: number) => void | Promise<void>
  ): void {
    event.preventDefault()

    if (!draggedDeal.value || !draggedFromStageId.value) return

    // Don't do anything if dropped in same stage
    if (draggedFromStageId.value === targetStageId) {
      handleDragEnd()
      return
    }

    // Trigger stage change
    onStageChange(draggedDeal.value.id, targetStageId)

    handleDragEnd()
  }

  return {
    draggedDeal,
    draggedFromStageId,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  }
}
