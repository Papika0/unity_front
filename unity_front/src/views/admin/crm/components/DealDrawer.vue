<script setup lang="ts">
/**
 * Deal Drawer Component (Refactored)
 * Slide-out panel for viewing and editing deal details
 * Uses extracted components: DealDetails, DealActivities, DealPayments
 */

import { ref, computed, onMounted, watch } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useLocaleFormatter } from '@/composables/i18n/useLocaleFormatter'
import { useCrmStore } from '@/stores/admin/crm'
import { useToastStore } from '@/stores/ui/toast'
import { useBuildingsAdminStore } from '@/stores/admin/buildings'
import { CURRENCY_SYMBOLS } from '@/types/crm'
import DealDetails from './DealDetails.vue'
import DealActivities from './DealActivities.vue'
import DealPayments from './DealPayments.vue'
import DealPricingModal from './DealPricingModal.vue'
import { X, User, DollarSign, Tag } from 'lucide-vue-next'

// Props
interface Props {
  dealId: number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'close'): void
}>()

// Composables
const { t } = useTranslations()
const { formatNumber: formatNum } = useLocaleFormatter()

// Stores
const crmStore = useCrmStore()
const toast = useToastStore()
const buildingsStore = useBuildingsAdminStore() // Kept if needed for dependency injection or future use

// State
const activeTab = ref<'details' | 'activities' | 'payments'>('details')
const isLoading = ref(false)
const loadError = ref<string | null>(null)
let currentDealId: number | null = null
const lastDealIdLoaded = ref<number | null>(null)

// Pricing Modal State
const isPricingModalOpen = ref(false)

// Computed
const deal = computed(() => crmStore.currentDeal)

const currencySymbol = computed(() => {
  if (!deal.value) return '$'
  return CURRENCY_SYMBOLS[deal.value.currency]
})

const showPaymentsTab = computed(() => {
  if (!deal.value || !deal.value.stage) return false
  const stageName = deal.value.stage.name.toLowerCase()
  const stageType = deal.value.stage.type
  return stageType === 'won' || 
         stageName.includes('sold') || 
         stageName.includes('reserved') ||
         stageName.includes('done')
})

// Format number with null handling
function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0'
  return formatNum(value, { maximumFractionDigits: 0 })
}

// Load deal on mount
onMounted(async () => {
  await loadDeal()
})

// Watch for dealId changes
watch(
  () => props.dealId,
  async () => {
    await loadDeal()
  },
)

// Watch for visibility changes to switch tab if needed
watch(showPaymentsTab, (show) => {
  if (!show && activeTab.value === 'payments') {
    activeTab.value = 'details'
  }
})

// Load deal
async function loadDeal(): Promise<void> {
  const dealIdToLoad = props.dealId
  currentDealId = dealIdToLoad
  lastDealIdLoaded.value = dealIdToLoad

  isLoading.value = true
  loadError.value = null
  try {
    await crmStore.fetchDeal(dealIdToLoad)

    if (currentDealId !== dealIdToLoad) return
    
    // Automatically fetch activities if we are already on tabs
    // But since we split components, DealActivities handles its own loading now!
    // We only need to load the deal itself here.
  } catch (error) {
    if (currentDealId !== dealIdToLoad) return

    console.error('Failed to load deal:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    loadError.value = errorMessage
    toast.error(t('admin.crm.messages.deal_load_failed'))
  } finally {
    if (currentDealId === dealIdToLoad) {
      isLoading.value = false
    }
  }
}

// Retry loading deal
async function retryLoadDeal(): Promise<void> {
  await loadDeal()
}

// Handle close
function handleClose(): void {
  crmStore.resetCurrentDeal()
  emit('close')
}

// New Refresh Logic
async function handleRefresh() {
    await loadDeal()
}
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <div
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
      @click="handleClose"
    ></div>

    <!-- Drawer -->
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="deal-drawer-title"
      class="fixed right-0 top-2 bottom-2 z-50 w-full sm:max-w-2xl bg-white shadow-2xl rounded-l-2xl flex flex-col animate-slide-in-right overflow-hidden mr-2"
    >
      <!-- Loading State (Skeleton) -->
      <div v-if="isLoading" class="flex-1 flex flex-col overflow-hidden">
        <div class="px-6 py-6 bg-white border-b border-gray-100">
           <div class="h-8 bg-gray-100 rounded-md w-3/4 mb-3 animate-pulse"></div>
           <div class="h-4 bg-gray-50 rounded-md w-1/2 animate-pulse"></div>
        </div>
        <div class="flex-1 p-6 space-y-6">
           <div class="grid grid-cols-2 gap-4">
              <div class="h-32 bg-gray-50 rounded-xl animate-pulse"></div>
              <div class="h-32 bg-gray-50 rounded-xl animate-pulse"></div>
           </div>
           <div class="h-64 bg-gray-50 rounded-xl animate-pulse"></div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="loadError" class="flex-1 flex items-center justify-center p-8 text-center">
        <div>
           <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-500 mb-4">
              <X class="w-8 h-8" />
           </div>
           <h3 class="text-lg font-bold text-gray-900 mb-2">{{ t('admin.crm.messages.deal_load_failed') }}</h3>
           <p class="text-sm text-gray-500 mb-6 max-w-xs mx-auto">{{ loadError }}</p>
           <button
             class="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
             @click="retryLoadDeal"
           >
             {{ t('admin.crm.actions.retry') }}
           </button>
        </div>
      </div>

      <!-- Content -->
      <template v-else-if="deal">
        <!-- Modern Header -->
        <div class="px-8 py-6 bg-white border-b border-gray-100 flex items-start justify-between relative z-10">
          <div class="flex-1">
            <h2 id="deal-drawer-title" class="text-2xl font-black text-gray-900 mb-1 tracking-tight">{{ deal.title }}</h2>
            <div class="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 font-medium">
              <span v-if="deal.customer" class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                <User class="w-3.5 h-3.5" /> {{ deal.customer.name }}
              </span>
              <span class="flex items-center gap-1.5 text-gray-900">
                <DollarSign class="w-3.5 h-3.5 text-emerald-500" /> 
                {{ currencySymbol }}{{ formatNumber(deal.budget) }}
              </span>
              <span v-if="deal.stage" class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
                <Tag class="w-3 h-3" /> {{ deal.stage.name }}
              </span>
            </div>
          </div>

          <button
            type="button"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all"
            @click="handleClose"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Modern Tabs -->
        <div class="px-8 border-b border-gray-100 bg-white sticky top-0 z-20" role="tablist">
          <div class="flex gap-6">
            <button
              v-for="tab in ['details', 'activities', ...(showPaymentsTab ? ['payments'] : [])]"
              :key="tab"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab"
              class="pb-4 pt-2 text-sm font-bold relative transition-colors capitalize"
              :class="activeTab === tab ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'"
              @click="activeTab = tab as any"
            >
              {{ t(`admin.crm.tabs.${tab}`) }}
              <span v-if="tab === 'activities'" class="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">
                 {{ crmStore.dealActivities.length }}
              </span>
              
              <!-- Active Indicator -->
              <span 
                v-if="activeTab === tab" 
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"
                ></span>
            </button>
          </div>
        </div>

        <!-- Scrollable Content Area -->
        <div class="flex-1 overflow-y-auto bg-white customize-scrollbar">
           <div class="p-8 pb-20">
             
             <Transition name="fade-slide" mode="out-in">
                <!-- Details Tab -->
                <div v-if="activeTab === 'details'" key="details">
                   <DealDetails 
                      :deal="deal" 
                      @edit-price="isPricingModalOpen = true" 
                      @refresh="handleRefresh"
                   />
                </div>

                <!-- Activities Tab -->
                <div v-else-if="activeTab === 'activities'" key="activities">
                   <DealActivities :deal-id="deal.id" />
                </div>

                <!-- Payments Tab -->
                <div v-else-if="activeTab === 'payments'" key="payments">
                   <DealPayments :deal="deal" />
                </div>
             </Transition>

           </div>
        </div>
      </template>
    </div>

    <!-- Pricing Modal -->
    <DealPricingModal
      v-if="isPricingModalOpen && deal"
      :is-open="isPricingModalOpen"
      :deal="deal"
      @close="isPricingModalOpen = false"
      @saved="loadDeal"
    />
  </Teleport>
</template>

<style scoped>
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.customize-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.customize-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.customize-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}

/* Transition for tabs */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
