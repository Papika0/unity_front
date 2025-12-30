<script setup lang="ts">
/**
 * CRM Pipeline View
 * Unified sales pipeline - leads automatically flow in from website forms
 */

import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useLocaleFormatter } from '@/composables/i18n/useLocaleFormatter'
import { useCrmStore } from '@/stores/admin/crm'
import { useToastStore } from '@/stores/ui/toast'
import { usePerformanceMonitor } from '@/composables/crm/usePerformanceMonitor'
import KanbanBoard from './components/KanbanBoard.vue'
import DealDrawer from './components/DealDrawer.vue'
import LostReasonModal from './components/LostReasonModal.vue'
import StageChangeConfirmModal from './components/StageChangeConfirmModal.vue'
import DealPricingModal from './components/DealPricingModal.vue'
import CreateLeadModal from './components/CreateLeadModal.vue'
import RegisterSoldDealModal from './components/RegisterSoldDealModal.vue'
import type { CrmDeal } from '@/types/crm'
import type { ProjectCalculatorSettings } from '@/types/admin/calculator'
import { Search, ChevronDown, Plus, FileCheck } from 'lucide-vue-next'

// Composables
const route = useRoute()
const { t } = useTranslations()
const { formatNumber, getCurrencySymbol } = useLocaleFormatter()

// Stores
const crmStore = useCrmStore()
const toast = useToastStore()

// Performance monitoring (dev mode only)
const perfMonitor = usePerformanceMonitor()

// State
const showDealDrawer = ref(false)
const showCreateLeadModal = ref(false)
const showRegisterSoldModal = ref(false)
const showCreateDropdown = ref(false)
const showLostModal = ref(false)
const showStageChangeModal = ref(false)
const showPricingModalFromStageChange = ref(false)
const pendingLostDeal = ref<{ dealId: number; targetStageId: number } | null>(null)
const pendingStageChangeDeal = ref<{ deal: CrmDeal; targetStageId: number } | null>(null)
const selectedDealId = ref<number | null>(null)
const filterUserId = ref<number | null>(null)

// Extract calculator settings from pending deal for stage change modal
const stageChangeCalculatorSettings = computed(() => {
  const settings = pendingStageChangeDeal.value?.deal?.apartment?.building?.project?.calculator_settings ?? null
  return settings as ProjectCalculatorSettings | null
})

// Search and filter state
const searchQuery = ref('')
const filterPriority = ref<'high' | 'medium' | 'low' | ''>('')
const showStaleOnly = ref(false)

// Computed
const isLoading = computed(() => crmStore.isLoadingPipeline)
const statistics = computed(() => crmStore.statistics)

// Filtered pipeline based on search and filters
const filteredPipeline = computed(() => {
  perfMonitor.markStart('filter')

  const filtered = crmStore.pipeline.map(column => ({
    ...column,
    deals: column.deals.filter(deal => {
      // Search filter (name, phone, apartment)
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        const matchName = deal.customer?.name?.toLowerCase().includes(query)
        const matchPhone = deal.customer?.phone?.includes(query)
        const matchApt = deal.apartment?.apartment_number?.toString().includes(query)
        if (!matchName && !matchPhone && !matchApt) return false
      }

      // Priority filter
      if (filterPriority.value && deal.priority !== filterPriority.value) {
        return false
      }

      // Stale filter
      if (showStaleOnly.value && !deal.is_stale) {
        return false
      }

      return true
    })
  }))

  const filterTime = perfMonitor.markEnd('filter')

  // Update metrics
  const totalDeals = crmStore.pipeline.reduce((sum, col) => sum + col.deals.length, 0)
  const visibleDeals = filtered.reduce((sum, col) => sum + col.deals.length, 0)
  perfMonitor.updateDealCounts(totalDeals, visibleDeals)

  // Warn if filter is slow
  if (filterTime > 50 && import.meta.env.DEV) {
    console.warn(`⚠️ Slow filter: ${filterTime.toFixed(2)}ms`)
  }

  return filtered
})

// Load pipeline on mount
onMounted(async () => {
  perfMonitor.markApiStart()
  perfMonitor.markRenderStart()

  try {
    await Promise.all([
      crmStore.fetchPipeline(filterUserId.value ?? undefined),
      crmStore.fetchStatistics(),
      crmStore.fetchStages(),
    ])

    perfMonitor.markApiEnd()

    // Wait for DOM to render
    await nextTick()
    perfMonitor.markRenderEnd()
    perfMonitor.calculateInitialLoad()

    // Check if there's a deal ID in the query parameter and open it
    if (route.query.deal) {
      const dealId = parseInt(route.query.deal as string)
      if (!isNaN(dealId)) {
        selectedDealId.value = dealId
        showDealDrawer.value = true
      }
    }

  } catch (error) {
    console.error('Failed to load CRM data:', error)
    toast.error(t('admin.crm.messages.load_failed'))
    perfMonitor.markApiEnd()
    perfMonitor.markRenderEnd()
  }
})

// Watch for filter changes
watch(filterUserId, async (newUserId) => {
  await crmStore.fetchPipeline(newUserId ?? undefined)
})

// Handle deal click
function handleDealClick(deal: CrmDeal): void {
  selectedDealId.value = deal.id
  showDealDrawer.value = true
}

// Handle stage change
async function handleStageChange(dealId: number, newStageId: number, lostReasonId?: number, skipPricingCheck = false): Promise<void> {
  // Check if stages are loaded
  if (!crmStore.stages || crmStore.stages.length === 0) {
    toast.error(t('admin.crm.messages.wait_for_data'))
    return
  }

  try {
    // Check if moving to lost stage
    const targetStage = crmStore.pipeline.find((col) => col.id === newStageId)
    if (targetStage?.type === 'lost' && !lostReasonId) {
      // Show lost reason modal
      pendingLostDeal.value = { dealId, targetStageId: newStageId }
      showLostModal.value = true
      return
    }

    // Check if deal has pricing and moving to reserved/won stage - show confirmation
    if (!skipPricingCheck) {
      const deal = findDealById(dealId)
      if (deal && deal.current_price && deal.current_price > 0) {
        // Check if moving to a stage that might require pricing update
        if (targetStage?.type === 'open' || targetStage?.type === 'won') {
          const isProgressingStage = targetStage.name?.toLowerCase().includes('reserved') || 
                                     targetStage.name?.toLowerCase().includes('final') ||
                                     targetStage.type === 'won'
          if (isProgressingStage) {
            pendingStageChangeDeal.value = { deal, targetStageId: newStageId }
            showStageChangeModal.value = true
            return
          }
        }
      }
    }

    await crmStore.updateDealStage(dealId, { stage_id: newStageId, lost_reason_id: lostReasonId })
    toast.success(t('admin.crm.messages.deal_moved'))
  } catch {
    toast.error(t('admin.crm.messages.move_failed'))
    // Reload pipeline to restore state
    await crmStore.fetchPipeline(filterUserId.value ?? undefined)
  }
}

// Find deal by ID in pipeline
function findDealById(dealId: number): CrmDeal | null {
  for (const column of crmStore.pipeline) {
    const deal = column.deals.find(d => d.id === dealId)
    if (deal) return deal
  }
  return null
}

// Handle stage change modal - keep same price
async function handleStageChangeKeepSame(dealId: number, stageId: number): Promise<void> {
  showStageChangeModal.value = false
  pendingStageChangeDeal.value = null

  try {
    // Pass carry_forward_pricing flag to auto-carry forward pricing
    await crmStore.updateDealStage(dealId, {
      stage_id: stageId,
      carry_forward_pricing: true
    })
    toast.success(t('admin.crm.messages.deal_moved'))
  } catch {
    toast.error(t('admin.crm.messages.move_failed'))
    // Reload pipeline to restore state
    await crmStore.fetchPipeline(filterUserId.value ?? undefined)
  }
}

// Handle stage change modal - update price
function handleStageChangeUpdatePrice(): void {
  showStageChangeModal.value = false
  // Open pricing modal with the pending deal
  if (pendingStageChangeDeal.value) {
    showPricingModalFromStageChange.value = true
  }
}

// Handle pricing saved from stage change flow
async function handlePricingSavedFromStageChange(): Promise<void> {
  showPricingModalFromStageChange.value = false
  if (pendingStageChangeDeal.value) {
    const { deal, targetStageId } = pendingStageChangeDeal.value
    pendingStageChangeDeal.value = null
    await handleStageChange(deal.id, targetStageId, undefined, true) // Skip pricing check
  }
}

// Handle lost reason selection
async function handleLostReasonSelected(reasonId: number): Promise<void> {
  if (!pendingLostDeal.value) return

  showLostModal.value = false
  await handleStageChange(pendingLostDeal.value.dealId, pendingLostDeal.value.targetStageId, reasonId)
  pendingLostDeal.value = null
}

// Handle lost modal cancel
function handleLostModalCancel(): void {
  showLostModal.value = false
  pendingLostDeal.value = null
  // Reload pipeline to restore card position
  crmStore.fetchPipeline(filterUserId.value ?? undefined)
}


// Handle modal created event
async function handleLeadCreated(dealId: number): Promise<void> {
  await crmStore.fetchPipeline(filterUserId.value ?? undefined)
  selectedDealId.value = dealId
  showDealDrawer.value = true
}

async function handleSoldDealCreated(dealId: number): Promise<void> {
  await crmStore.fetchPipeline(filterUserId.value ?? undefined)
  selectedDealId.value = dealId
  showDealDrawer.value = true
}

// Close deal drawer
function closeDealDrawer(): void {
  showDealDrawer.value = false
  selectedDealId.value = null
}

// Format currency
function formatCurrency(value: number): string {
  return formatNumber(value, { maximumFractionDigits: 0 })
}
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-gray-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900">{{ t('admin.crm.title') }}</h1>
          <p class="mt-1 text-sm text-gray-700">{{ t('admin.crm.subtitle') }}</p>
        </div>

        <div class="flex items-center gap-3">
          <!-- Statistics Summary -->
          <div
            v-if="statistics"
            class="hidden lg:flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-lg"
          >
            <div class="text-center">
              <div class="text-lg font-bold text-gray-900">{{ statistics.total_deals }}</div>
              <div class="text-xs text-gray-700">{{ t('admin.crm.statistics.total_deals') }}</div>
            </div>
            <div class="w-px h-8 bg-gray-200"></div>
            <div class="text-center">
              <div class="text-lg font-bold text-green-600">
                {{ getCurrencySymbol('USD') }}{{ formatCurrency(statistics.total_value) }}
              </div>
              <div class="text-xs text-gray-700">{{ t('admin.crm.statistics.total_value') }}</div>
            </div>
            <div class="w-px h-8 bg-gray-200"></div>
            <div class="text-center">
              <div class="text-lg font-bold text-blue-600">
                {{ statistics.conversion_rate?.toFixed(1) }}%
              </div>
              <div class="text-xs text-gray-700">{{ t('admin.crm.statistics.conversion_rate') }}</div>
            </div>
          </div>

          <!-- Create Deal Dropdown -->
          <div class="relative">
            <button
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              @click="showCreateDropdown = !showCreateDropdown"
            >
              <Plus class="w-5 h-5 mr-2" />
              {{ t('admin.crm.pipeline.create_deal') }}
              <ChevronDown class="w-4 h-4 ml-2" />
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showCreateDropdown"
              class="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
              @click="showCreateDropdown = false"
            >
              <div class="py-1">
                <button
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                  @click="showCreateLeadModal = true"
                >
                  <Plus class="w-4 h-4 text-blue-600" />
                  <div>
                    <div class="font-medium">{{ t('admin.crm.pipeline.new_lead') }}</div>
                    <div class="text-xs text-gray-500">{{ t('admin.crm.pipeline.new_lead_desc') }}</div>
                  </div>
                </button>
                <button
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                  @click="showRegisterSoldModal = true"
                >
                  <FileCheck class="w-4 h-4 text-emerald-600" />
                  <div>
                    <div class="font-medium">{{ t('admin.crm.pipeline.register_sold') }}</div>
                    <div class="text-xs text-gray-500">{{ t('admin.crm.pipeline.register_sold_desc') }}</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filter Bar -->
    <div class="px-4 sm:px-6 lg:px-8 py-3 bg-gray-50 border-b border-gray-200">
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Search Input -->
        <div class="flex-1">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-5 w-5 text-gray-600" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('admin.crm.pipeline.search_placeholder')"
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 placeholder:text-gray-500"
            />
          </div>
        </div>

        <!-- Priority Filter -->
        <select
          v-model="filterPriority"
          class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">{{ t('admin.crm.pipeline.all_priorities') }}</option>
          <option value="high">{{ t('admin.crm.priority.high') }}</option>
          <option value="medium">{{ t('admin.crm.priority.medium') }}</option>
          <option value="low">{{ t('admin.crm.priority.low') }}</option>
        </select>

        <!-- Stale Filter Toggle -->
        <button
          @click="showStaleOnly = !showStaleOnly"
          class="inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors"
          :class="showStaleOnly
            ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
        >
          {{ t('admin.crm.pipeline.stale_deals') }}
        </button>

        <!-- Clear Filters -->
        <button
          v-if="searchQuery || filterPriority || showStaleOnly"
          @click="searchQuery = ''; filterPriority = ''; showStaleOnly = false"
          class="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
        >
          {{ t('admin.crm.form.clear_filters') }}
        </button>
      </div>
    </div>

    <!-- Pipeline Content -->
    <div class="flex-1 overflow-hidden">
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex items-center justify-center h-full"
      >
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p class="mt-4 text-gray-700">{{ t('admin.crm.messages.loading') }}</p>
        </div>
      </div>

      <!-- Kanban Board -->
      <div v-else class="h-full">
        <KanbanBoard
          :columns="filteredPipeline"
          @deal-click="handleDealClick"
          @stage-change="handleStageChange"
        />
      </div>
    </div>

    <!-- Deal Drawer -->
    <DealDrawer
      v-if="showDealDrawer && selectedDealId"
      :deal-id="selectedDealId"
      @close="closeDealDrawer"
    />

    <!-- Lost Reason Modal -->
    <LostReasonModal
      v-if="showLostModal"
      @select="handleLostReasonSelected"
      @cancel="handleLostModalCancel"
    />

    <!-- Stage Change Confirm Modal (for pricing confirmation) -->
    <StageChangeConfirmModal
      :is-open="showStageChangeModal"
      :deal="pendingStageChangeDeal?.deal || null"
      :target-stage-id="pendingStageChangeDeal?.targetStageId || null"
      :calculator-settings="stageChangeCalculatorSettings"
      @keep-same="handleStageChangeKeepSame"
      @update-price="handleStageChangeUpdatePrice"
      @close="showStageChangeModal = false; pendingStageChangeDeal = null"
    />

    <!-- Pricing Modal from Stage Change Flow -->
    <DealPricingModal
      v-if="pendingStageChangeDeal"
      :is-open="showPricingModalFromStageChange"
      :deal="pendingStageChangeDeal.deal"
      @close="showPricingModalFromStageChange = false"
      @saved="handlePricingSavedFromStageChange"
    />

    <!-- Modals -->
    <CreateLeadModal
      :is-open="showCreateLeadModal"
      @close="showCreateLeadModal = false"
      @created="handleLeadCreated"
    />

    <RegisterSoldDealModal
      :is-open="showRegisterSoldModal"
      @close="showRegisterSoldModal = false"
      @created="handleSoldDealCreated"
    />
  </div>
</template>