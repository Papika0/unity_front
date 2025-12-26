<script setup lang="ts">
/**
 * Kanban Card Component
 * Individual deal card with drag support
 */

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTranslationsStore } from '@/stores/ui/translations'
import { useTranslations } from '@/composables/i18n/useTranslations'
import type { CrmDeal } from '@/types/crm'
import { CURRENCY_SYMBOLS } from '@/types/crm'

// Composables
const { t } = useTranslations()
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
defineEmits<{
  (e: 'click', deal: CrmDeal): void
  (e: 'dragstart', deal: CrmDeal): void
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
  return new Intl.NumberFormat('ka-GE', { maximumFractionDigits: 0 }).format(value)
}

function getLocalizedValue(value: string | Record<string, string> | undefined | null): string {
  if (!value) return ''
  if (typeof value === 'string') return value
  
  if (currentLocale.value && value[currentLocale.value]) {
    return value[currentLocale.value]
  }
  
  return value['en'] || value['ka'] || Object.values(value)[0] || ''
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
      <div class="deal-title">
        {{ deal.title }}
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
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.deal-title {
  font-weight: 700;
  color: #111827;
  font-size: 14px;
  flex: 1;
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
