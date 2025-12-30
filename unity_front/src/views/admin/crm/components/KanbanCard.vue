<script setup lang="ts">
/**
 * Kanban Card Component
 * Individual deal card with drag support
 */

import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCrmStore } from '@/stores/admin/crm'
import { useTranslationsStore } from '@/stores/ui/translations'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useLocaleFormatter } from '@/composables/i18n/useLocaleFormatter'
import type { CrmDeal } from '@/types/crm'
import { CURRENCY_SYMBOLS } from '@/types/crm'
import { MoreHorizontal } from 'lucide-vue-next'

// Composables
const { t } = useTranslations()
const { formatNumber: formatNum } = useLocaleFormatter()
const translationsStore = useTranslationsStore()
const { currentLocale } = storeToRefs(translationsStore)

// Props
interface Props {
  deal: CrmDeal
  isDragging?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDragging: false,
})

// Emits
const emit = defineEmits<{
  (e: 'click', deal: CrmDeal): void
  (e: 'dragstart', deal: CrmDeal): void
  (e: 'move-deal', deal: CrmDeal, stageId: number): void
}>()

// Computed
const currencySymbol = computed(() => CURRENCY_SYMBOLS[props.deal.currency])

const priorityLabel = computed(() => {
  switch (props.deal.priority) {
    case 'high':
      return t('admin.crm.priority.high')
    case 'medium':
      return t('admin.crm.priority.medium')
    case 'low':
      return t('admin.crm.priority.low')
    default:
      return t('admin.crm.priority.medium')
  }
})

// Format number with null handling
function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0'
  return formatNum(value, { maximumFractionDigits: 0 })
}

function getLocalizedValue(value: string | Record<string, string> | undefined | null): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  
  if (currentLocale.value && value[currentLocale.value]) {
    return value[currentLocale.value]
  }
  
  return value['en'] || value['ka'] || Object.values(value)[0] || ''
}

// Dropdown State
const showMenu = ref(false)
const menuButton = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const menuPosition = ref({ top: 0, left: 0 })

// Get active stages excluding current
const availableStages = computed(() => {
  const store = useCrmStore()
  return store.activeStages.filter(s => s.id !== props.deal.stage_id)
})

import { nextTick } from 'vue'

const toggleMenu = async () => {
  if (showMenu.value) {
    showMenu.value = false
    return
  }
  
  showMenu.value = true
  await nextTick()
  
  if (menuButton.value) {
    const rect = menuButton.value.getBoundingClientRect()
    // Align right edge of menu with right edge of button (minus offset if needed)
    // Menu width is w-48 (12rem = 192px)
    menuPosition.value = {
      top: rect.bottom + 4, // 4px gap
      left: rect.right - 192 // Align right
    }
  }
}

function onMoveTo(stageId: number) {
  emit('move-deal', props.deal, stageId)
  showMenu.value = false
}

// Close menu on click outside
import { onBeforeUnmount } from 'vue'
const closeMenu = () => { showMenu.value = false }

if (typeof window !== 'undefined') {
  const handleGlobalClick = (e: MouseEvent) => {
    if (!showMenu.value) return
    
    const target = e.target as Node
    const isClickInsideButton = menuButton.value?.contains(target)
    const isClickInsideDropdown = dropdownRef.value?.contains(target)
    
    if (!isClickInsideButton && !isClickInsideDropdown) {
      closeMenu()
    }
  }

  // Handle scroll to close menu (as it's fixed position)
  const handleScroll = (e: Event) => {
    if (!showMenu.value) return
    
    // If scrolling inside the dropdown, don't close
    if (dropdownRef.value && dropdownRef.value.contains(e.target as Node)) {
      return
    }
    
    // If scrolling strictly outside (e.g. main window or kanban board), update position or close
    // For now, re-calculating position is better UX than closing, but tricky with complex nested scrolls.
    // Let's try to update position first. if that fails/looks janky, we revert to close.
    if (menuButton.value) {
      const rect = menuButton.value.getBoundingClientRect()
      menuPosition.value = {
        top: rect.bottom + 4,
        left: rect.right - 192
      }
    }
  }

  window.addEventListener('click', handleGlobalClick)
  window.addEventListener('scroll', handleScroll, { capture: true, passive: true })
  window.addEventListener('resize', handleScroll) // Handle resize same as scroll

  onBeforeUnmount(() => {
    window.removeEventListener('click', handleGlobalClick)
    window.removeEventListener('scroll', handleScroll, { capture: true })
    window.removeEventListener('resize', handleScroll)
  })
}
</script>

<template>
  <div
    class="deal-card"
    :class="{
      'is-stale': deal.is_stale,
      'is-dragging': isDragging,
    }"
    draggable="true"
    @click="$emit('click', deal)"
    @dragstart="$emit('dragstart', deal)"
  >
    <!-- Stale Warning Badge (Prominent) -->
    <div v-if="deal.is_stale" class="stale-indicator">
      ⚠️ {{ t('admin.crm.deal.needs_attention') }}
    </div>

    <!-- Header: Deal Title + Priority -->
    <div class="card-header">
      <div class="deal-title-row">
        <div class="deal-title">
          {{ deal.title }}
        </div>
        
        <!-- Action Menu -->
        <div class="card-menu relative" @click.stop>
          <button 
            ref="menuButton"
            @click="toggleMenu"
            class="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MoreHorizontal class="w-4 h-4 text-gray-500" />
          </button>
          
          <!-- Dropdown using Teleport -->
          <Teleport to="body">
            <div 
              v-if="showMenu"
              ref="dropdownRef"
              :style="{
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`
              }"
              class="fixed w-48 bg-white rounded-md shadow-lg border border-gray-200 z-[9999] py-1"
            >
              <div class="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100">
                {{ t('admin.crm.kanban.move_to') }}
              </div>
              <div class="max-h-48 overflow-y-auto">
                <button
                  v-for="stage in availableStages"
                  :key="stage.id"
                  @click="onMoveTo(stage.id)"
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  <span 
                    class="w-2 h-2 rounded-full"
                    :style="{ backgroundColor: stage.color || '#CBD5E1' }"
                  ></span>
                  {{ stage.name }}
                </button>
              </div>
            </div>
          </Teleport>
        </div>
      </div>
      
      <div class="priority-badge" :class="`priority-${deal.priority}`">
        {{ priorityLabel }}
      </div>
    </div>

    <!-- Customer Name (Secondary) -->
    <div v-if="deal.customer" class="card-customer">
      👤 {{ deal.customer.name }}
    </div>

    <!-- Phone Number (Prominent) -->
    <div v-if="deal.customer?.phone" class="card-phone">
      📞 {{ deal.customer.phone }}
    </div>

    <!-- Apartment Info (if linked) -->
    <div v-if="deal.apartment" class="card-apartment text-xs">
      <div v-if="deal.apartment.building?.project">
        🏙️ {{ getLocalizedValue(deal.apartment.building.project.title) }}
      </div>
      <div>
        🏠 {{ getLocalizedValue(deal.apartment.building?.name) || deal.apartment.building?.identifier }} 
        - #{{ deal.apartment.apartment_number }}
      </div>
    </div>

    <!-- Price/Budget (prefer current_price over budget) -->
    <div v-if="deal.current_price || deal.budget" class="card-budget">
      <span class="budget-label">{{ deal.current_price ? t('admin.crm.deal.price_label') || 'Price' : t('admin.crm.deal.budget_label') }}</span>
      <span class="budget-value">{{ currencySymbol }}{{ formatNumber(deal.current_price || deal.budget) }}</span>
    </div>

    <!-- Footer: Days + Assigned User -->
    <div class="card-footer">
      <div class="days-badge" :class="{ 'warning': deal.is_stale }">
        {{ deal.days_in_stage || 0 }} {{ t('admin.crm.deal.days') }}
      </div>
      <div v-if="deal.assigned_user" class="assigned-user">
        👤 {{ deal.assigned_user.name }}
      </div>
    </div>

    <!-- Payment Progress (if available) -->
    <div v-if="deal.payment_progress && deal.payment_progress > 0" class="payment-progress">
      <div class="progress-header">
        <span>{{ t('admin.crm.payment.title') }}</span>
        <span>{{ deal.payment_progress }}%</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${deal.payment_progress}%` }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deal-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: move;
  transition: all 0.2s;
  position: relative;
  user-select: none;
}

.deal-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.deal-card.is-stale {
  border: 2px solid #EF4444;
  background: #FEF2F2;
}

.deal-card.is-dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.stale-indicator {
  position: absolute;
  top: -10px;
  right: 8px;
  background: #DC2626;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: bounce 1s infinite;
  z-index: 10;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.deal-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.deal-title {
  font-weight: 700;
  color: #111827;
  font-size: 14px;
  line-height: 1.3;
}

.card-customer {
  font-size: 13px;
  color: #4B5563;
  margin-bottom: 4px;
}

.priority-badge {
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
}

.priority-high {
  background: #FEE2E2;
  color: #DC2626;
}

.priority-medium {
  background: #FEF3C7;
  color: #D97706;
}

.priority-low {
  background: #E0E7FF;
  color: #4F46E5;
}

.card-phone {
  color: #1F2937;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 8px;
  direction: ltr;
  background-color: #F3F4F6;
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
}

.card-apartment {
  color: #059669;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.card-budget {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #F9FAFB;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.budget-label {
  font-size: 12px;
  color: #6B7280;
}

.budget-value {
  color: #111827;
  font-weight: 700;
  font-size: 14px;
  direction: ltr;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid #F3F4F6;
}

.days-badge {
  background: #F3F4F6;
  color: #6B7280;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.days-badge.warning {
  background: #FEE2E2;
  color: #DC2626;
  font-weight: 600;
}

.assigned-user {
  font-size: 11px;
  color: #6B7280;
}

.payment-progress {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #F3F4F6;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #6B7280;
  margin-bottom: 4px;
}

.progress-bar {
  width: 100%;
  background: #E5E7EB;
  border-radius: 9999px;
  height: 6px;
  overflow: hidden;
}

.progress-fill {
  background: #059669;
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}
</style>
