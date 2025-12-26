<script setup lang="ts">
/**
 * Deal Drawer Component
 * Slide-out panel for viewing and editing deal details
 */

import { ref, computed, onMounted, watch } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useCrmStore } from '@/stores/admin/crm'
import { useToastStore } from '@/stores/ui/toast'
import { useBuildingsAdminStore } from '@/stores/admin/buildings'
import { projectsApi, type ProjectApiResponse } from '@/services/projectsApi'
import { apartmentService, type ApartmentSearchResult } from '@/services/apartmentService'
import { adminBuildingsApi } from '@/services/adminBuildingsApi'
import type { ActivityType } from '@/types/crm'
import { CURRENCY_SYMBOLS } from '@/types/crm'
import DealActivityForm from './DealActivityForm.vue'
import DealPayments from './DealPayments.vue'
import DealPricingModal from './DealPricingModal.vue'
import {
  FileText,
  Phone,
  Mail,
  Users,
  RefreshCw,
  CreditCard,
  Settings,
  Pin
} from 'lucide-vue-next'

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
const { t, currentLocale } = useTranslations()

// Stores
const crmStore = useCrmStore()
const toast = useToastStore()
const buildingsStore = useBuildingsAdminStore()

// State
const activeTab = ref<'details' | 'activities' | 'payments'>('details')
const isLoading = ref(false)
const isLoadingActivities = ref(false)
const loadError = ref<string | null>(null)
let currentDealId: number | null = null
const lastDealIdLoaded = ref<number | null>(null) // New: To prevent race conditions

// Apartment Connection State
const isConnectingApartment = ref(false)
const isSavingConnection = ref(false)
const projects = ref<ProjectApiResponse[]>([])
const loadingProjects = ref(false)
const selectedProjectId = ref<number | null>(null)
const selectedBuildingId = ref<number | null>(null)
const selectedFloor = ref<number | null>(null)
const selectedApartmentId = ref<number | null>(null)
// const allBuildingApartments = ref<ApartmentSearchResult[]>([]) // Removed
const availableFloorsList = ref<number[]>([]) // Store available floors
const availableApartments = ref<ApartmentSearchResult[]>([]) // Store apartments for floor
const loadingApartments = ref(false)

// Pricing Modal State
const isPricingModalOpen = ref(false)

// Use buildings from store (or local ref if store overwrites too much)
// Using store is fine as this is admin context
const buildings = computed(() => buildingsStore.buildings)
const loadingBuildings = computed(() => buildingsStore.isLoading)

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
  
  // Show payments tab if deal is Won/Sold/Reserved
  // Accessing types directly or checking name as fallback
  return stageType === 'won' || 
         stageName.includes('sold') || 
         stageName.includes('reserved') ||
         stageName.includes('done')
})

// Validation for apartments availability
// availableApartments is now a Ref populated by fetch
// const availableApartments = computed(() => { ... }) // Removed

const availableFloors = computed(() => {
  return availableFloorsList.value
})

function getLocalizedName(item: any): string {
  if (!item) return ''
  
  // Try to find a name/title property
  const nameVal = item.name || item.title
  
  // If value is an object (translations), pick the current locale
  if (nameVal && typeof nameVal === 'object') {
    const locale = (currentLocale as unknown as string) || 'ka'
    const key = locale
    if (nameVal[key]) return nameVal[key]
    // Fallbacks
    return nameVal['en'] || nameVal['ka'] || nameVal['ru'] || Object.values(nameVal)[0]
  }
  
  // If it's a string, return it
  if (typeof nameVal === 'string') return nameVal
  
  // Fallback to legacy flat fields
  const locale = (currentLocale as unknown as string) || 'ka'
  const key = `name_${locale}`
  if (item[key]) return item[key]
  
  // Fallbacks
  if (locale === 'ka' && item.name_ka) return item.name_ka
  if (locale === 'en' && item.name_en) return item.name_en
  if (locale === 'ru' && item.name_ru) return item.name_ru
  
  return item.identifier || ''
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
  // Track the deal ID for this request to prevent race conditions
  const dealIdToLoad = props.dealId
  currentDealId = dealIdToLoad
  lastDealIdLoaded.value = dealIdToLoad // New: Update lastDealIdLoaded

  isLoading.value = true
  loadError.value = null
  try {
    await crmStore.fetchDeal(dealIdToLoad)

    // Only continue if we're still on the same deal
    if (currentDealId !== dealIdToLoad) {
      return
    }

    await loadActivities()
  } catch (error) {
    // Only show error if we're still on the same deal
    if (currentDealId !== dealIdToLoad) {
      return
    }

    console.error('Failed to load deal:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    loadError.value = errorMessage
    toast.error(t('admin.crm.messages.deal_load_failed'))
    // Don't close - show error UI with retry button
  } finally {
    // Only clear loading if we're still on the same deal
    if (currentDealId === dealIdToLoad) {
      isLoading.value = false
    }
  }
}

// Retry loading deal
async function retryLoadDeal(): Promise<void> {
  await loadDeal()
}

// Load activities
async function loadActivities(): Promise<void> {
  isLoadingActivities.value = true
  try {
    await crmStore.fetchActivities(props.dealId)
  } catch (error) {
    console.error('Failed to load activities:', error)
  } finally {
    isLoadingActivities.value = false
  }
}

// Handle add activity
async function handleAddActivity(data: { type: ActivityType; description: string }): Promise<void> {
  try {
    await crmStore.createActivity({
      deal_id: props.dealId,
      type: data.type,
      content: data.description,  // Backend expects 'content'
    })
    toast.success(t('admin.crm.messages.activity_added'))
  } catch (error) {
    console.error('Failed to add activity:', error)
    toast.error(t('admin.crm.messages.activity_add_failed'))
  }
}

// Apartment Connection Logic
async function startConnectingApartment() {
  isConnectingApartment.value = true
  selectedProjectId.value = null
  selectedBuildingId.value = null
  selectedFloor.value = null
  selectedApartmentId.value = null
  selectedFloor.value = null
  selectedApartmentId.value = null
  availableFloorsList.value = []
  availableApartments.value = []
  
  if (projects.value.length === 0) {
    loadingProjects.value = true
    try {
      projects.value = await projectsApi.getAll()
    } catch (e) {
      toast.error(t('admin.crm.messages.load_failed'))
    } finally {
      loadingProjects.value = false
    }
  }
}

function cancelConnecting() {
  isConnectingApartment.value = false
  selectedProjectId.value = null
  selectedBuildingId.value = null
  selectedFloor.value = null
  selectedApartmentId.value = null
}

watch(selectedProjectId, async (newId) => {
  selectedBuildingId.value = null
  selectedFloor.value = null
  selectedApartmentId.value = null
  selectedFloor.value = null
  selectedApartmentId.value = null
  availableFloorsList.value = []
  availableApartments.value = []
  
  if (newId) {
    try {
      await buildingsStore.fetchBuildings(newId)
    } catch (e) {
      toast.error(t('admin.crm.messages.load_failed'))
    }
  } else {
    buildingsStore.$reset()
  }
})

watch(selectedBuildingId, async (newId) => {
  selectedFloor.value = null
  selectedApartmentId.value = null
  availableFloorsList.value = []
  availableApartments.value = []
  
  if (newId) {
    loadingApartments.value = true // Reuse loading spinner for floors too
    try {
      const { data } = await adminBuildingsApi.getFloors(newId)
      if (data && data.success) {
        availableFloorsList.value = data.data
      }
    } catch (e) {
      toast.error(t('admin.crm.messages.load_failed'))
    } finally {
      loadingApartments.value = false
    }
  }
})

watch(selectedFloor, async (newFloor) => {
  selectedApartmentId.value = null
  availableApartments.value = []
  
  if (newFloor !== null && selectedBuildingId.value) {
    loadingApartments.value = true
    try {
      const result = await apartmentService.search({
        building_id: selectedBuildingId.value,
        floor_number: newFloor,
        // Removed status property to fix TS error, controller defaults to Available
        per_page: 100,
      })
      availableApartments.value = result.data
    } catch (e) {
      toast.error(t('admin.crm.messages.load_failed'))
    } finally {
      loadingApartments.value = false
    }
  }
})

async function saveConnection() {
  if (!selectedApartmentId.value || !deal.value) return
  
  isSavingConnection.value = true
  try {
    await crmStore.updateDeal(deal.value.id, {
      apartment_id: selectedApartmentId.value
    })
    toast.success(t('admin.crm.messages.saved'))
    isConnectingApartment.value = false
    // Refresh deal
    crmStore.fetchDeal(deal.value.id)
  } catch (e) {
    toast.error(t('admin.crm.messages.save_failed'))
  } finally {
    isSavingConnection.value = false
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

// Handle close
function handleClose(): void {
  crmStore.resetCurrentDeal()
  emit('close')
}

// Format number with null handling
function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0'
  return new Intl.NumberFormat('ka-GE', { maximumFractionDigits: 0 }).format(value)
}

// Format date
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Format date time
function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('ka-GE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get activity icon
// Get activity icon component
function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'note':
      return FileText
    case 'call':
      return Phone
    case 'email':
      return Mail
    case 'meeting':
      return Users
    case 'status_change':
      return RefreshCw
    case 'payment':
      return CreditCard
    case 'system':
      return Settings
    default:
      return Pin
  }
}

// Get activity type label
function getActivityTypeLabel(type: ActivityType): string {
  switch (type) {
    case 'note':
      return t('admin.crm.activity.types.note')
    case 'call':
      return t('admin.crm.activity.types.call')
    case 'email':
      return t('admin.crm.activity.types.email')
    case 'meeting':
      return t('admin.crm.activity.types.meeting')
    case 'status_change':
      return t('admin.crm.activity.types.status_change')
    case 'payment':
      return t('admin.crm.activity.types.payment')
    case 'system':
      return t('admin.crm.activity.types.system')
    default:
      return type
  }
}
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <div
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      @click="handleClose"
    ></div>

    <!-- Drawer -->
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="deal-drawer-title"
      class="fixed right-0 top-0 bottom-0 z-50 w-full sm:max-w-2xl bg-white shadow-2xl flex flex-col animate-slide-in-right overflow-hidden"
    >
      <!-- Loading State with Skeleton -->
      <div v-if="isLoading" class="flex-1 overflow-hidden">
        <!-- Header Skeleton -->
        <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div class="h-6 bg-white/20 rounded w-2/3 mb-2 animate-pulse"></div>
          <div class="h-4 bg-white/10 rounded w-1/2 animate-pulse"></div>
        </div>

        <!-- Tabs Skeleton -->
        <div class="border-b border-gray-200 bg-white flex">
          <div class="flex-1 px-6 py-3 border-b-2 border-blue-600"></div>
          <div class="flex-1 px-6 py-3"></div>
          <div class="flex-1 px-6 py-3"></div>
        </div>

        <!-- Content Skeleton -->
        <div class="p-6 space-y-4 bg-gray-50">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white p-4 rounded-lg border border-gray-200">
              <div class="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
              <div class="h-5 bg-gray-300 rounded w-24 animate-pulse"></div>
            </div>
            <div class="bg-white p-4 rounded-lg border border-gray-200">
              <div class="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
              <div class="h-5 bg-gray-300 rounded w-24 animate-pulse"></div>
            </div>
          </div>
          <div class="bg-white p-6 rounded-lg border border-gray-200">
            <div class="h-5 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            <div class="space-y-3">
              <div class="h-4 bg-gray-100 rounded animate-pulse"></div>
              <div class="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="loadError"
        class="flex-1 flex items-center justify-center p-6"
      >
        <div class="text-center max-w-md">
          <div class="mb-4">
            <svg class="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ t('admin.crm.messages.deal_load_failed') }}</h3>
          <p class="text-sm text-gray-600 mb-6">{{ loadError }}</p>
          <div class="flex gap-3 justify-center">
            <button
              type="button"
              aria-label="Retry loading deal"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              @click="retryLoadDeal"
            >
              {{ t('admin.crm.actions.retry') }}
            </button>
            <button
              type="button"
              aria-label="Close drawer"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              @click="handleClose"
            >
              {{ t('admin.crm.actions.close') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <template v-else-if="deal">
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-start justify-between">
          <div class="flex-1">
            <h2 id="deal-drawer-title" class="text-xl font-bold text-white mb-2">{{ deal.title }}</h2>
            <div class="flex items-center gap-4 text-sm text-blue-100">
              <span v-if="deal.customer">👤 {{ deal.customer.name }}</span>
              <span>{{ currencySymbol }}{{ formatNumber(deal.budget) }}</span>
              <span v-if="deal.stage" class="px-2 py-0.5 bg-white/20 rounded">
                {{ deal.stage.name }}
              </span>
            </div>
          </div>

          <!-- Close Button -->
          <button
            type="button"
            aria-label="Close deal drawer"
            class="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            @click="handleClose"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 bg-white" role="tablist" aria-label="Deal information tabs">
          <div class="flex">
            <button
              type="button"
              role="tab"
              :aria-selected="activeTab === 'details'"
              :aria-controls="activeTab === 'details' ? 'details-panel' : undefined"
              class="flex-1 px-6 py-3 text-sm font-medium transition-all"
              :class="
                activeTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              "
              @click="activeTab = 'details'"
            >
              {{ t('admin.crm.tabs.details') }}
            </button>
            <button
              class="flex-1 px-6 py-3 text-sm font-medium transition-all"
              :class="
                activeTab === 'activities'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              "
              @click="activeTab = 'activities'"
            >
              {{ t('admin.crm.tabs.activities') }}
              <span class="ml-1 text-xs">({{ crmStore.dealActivities.length }})</span>
            </button>
            <button
              v-if="showPaymentsTab"
              class="flex-1 px-6 py-3 text-sm font-medium transition-all"
              :class="
                activeTab === 'payments'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              "
              @click="activeTab = 'payments'"
            >
              {{ t('admin.crm.tabs.payments') }}
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
          <!-- Details Tab -->
          <div v-if="activeTab === 'details'" class="space-y-6">
            <!-- Info Cards -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white p-4 rounded-lg border border-gray-200">
                <div class="text-sm text-gray-700 mb-1">{{ t('admin.crm.deal.priority_label') }}</div>
                <div class="font-medium text-gray-900 capitalize">{{ deal.priority }}</div>
              </div>

              <div class="bg-white p-4 rounded-lg border border-gray-200">
                <div class="text-sm text-gray-700 mb-1">{{ t('admin.crm.deal.currency') }}</div>
                <div class="font-medium">{{ deal.currency }}</div>
              </div>

              <div v-if="deal.expected_close_date" class="bg-white p-4 rounded-lg border border-gray-200">
                <div class="text-sm text-gray-700 mb-1">{{ t('admin.crm.deal.expected_close_date') }}</div>
                <div class="font-medium text-gray-900">{{ formatDate(deal.expected_close_date) }}</div>
              </div>

              <div v-if="deal.days_in_stage" class="bg-white p-4 rounded-lg border border-gray-200">
                <div class="text-sm text-gray-700 mb-1">{{ t('admin.crm.deal.days_in_stage') }}</div>
                <div class="font-medium text-gray-900">{{ deal.days_in_stage }} {{ t('admin.crm.deal.days') }}</div>
              </div>
            </div>

            <!-- Pricing & Terms Card -->
            <div class="bg-white p-6 rounded-lg border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900">{{ t('admin.crm.pricing.pricing_title') }}</h3>
                <button
                  type="button"
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  @click="isPricingModalOpen = true"
                >
                  {{ deal.current_price ? t('admin.crm.pricing.edit_price') : t('admin.crm.pricing.set_price') }}
                </button>
              </div>

              <div v-if="deal.current_price" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <div class="text-sm text-gray-500">{{ t('admin.crm.pricing.current_price') }}</div>
                    <div class="text-lg font-bold text-gray-900">{{ currencySymbol }}{{ formatNumber(deal.current_price) }}</div>
                  </div>
                  <div v-if="deal.apartment">
                    <div class="text-sm text-gray-500">{{ t('admin.crm.pricing.price_per_sqm') }}</div>
                    <div class="text-lg font-medium text-gray-900">
                      {{ currencySymbol }}{{ formatNumber(deal.current_price / deal.apartment.area_total) }}
                    </div>
                  </div>
                </div>

                <!-- Stage Specific Prices -->
                <div class="pt-3 border-t border-gray-100 text-sm space-y-1">
                  <div v-if="deal.offered_price_total" class="flex justify-between text-gray-600">
                    <span>{{ t('admin.crm.pricing.offered') }}:</span>
                    <span>{{ currencySymbol }}{{ formatNumber(deal.offered_price_total) }}</span>
                  </div>
                  <div v-if="deal.reserved_price_total" class="flex justify-between text-gray-600">
                    <span>{{ t('admin.crm.pricing.reserved') }}:</span>
                    <span>{{ currencySymbol }}{{ formatNumber(deal.reserved_price_total) }}</span>
                  </div>
                  <div v-if="deal.final_price_total" class="flex justify-between text-gray-900 font-medium">
                    <span>{{ t('admin.crm.pricing.final') }}:</span>
                    <span>{{ currencySymbol }}{{ formatNumber(deal.final_price_total) }}</span>
                  </div>
                </div>

                 <!-- Selected Payment Alternative -->
                <div v-if="deal.selected_payment_alternative" class="pt-3 border-t border-gray-100">
                   <div class="text-sm text-gray-500 mb-1">{{ t('admin.crm.pricing.selected_plan') }}</div>
                   <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                     {{ t('admin.crm.pricing.option') }} {{ deal.selected_payment_alternative }}
                   </div>
                </div>
              </div>
              
              <div v-else class="text-sm text-gray-500 italic">
                {{ t('admin.crm.pricing.no_pricing_set') }}
              </div>
            </div>

            <!-- Customer Info -->
            <div v-if="deal.customer" class="bg-white p-6 rounded-lg border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-4">{{ t('admin.crm.customer.title') }}</h3>
              <div class="space-y-3">
                <div>
                  <div class="text-sm text-gray-700 flex items-center gap-2">
                    <Users class="w-4 h-4 text-blue-500" />
                    {{ t('admin.crm.customer.name') }}
                  </div>
                  <div class="font-medium text-gray-900 ml-6">{{ deal.customer.name }}</div>
                </div>
                <div v-if="deal.customer.email">
                  <div class="text-sm text-gray-700 flex items-center gap-2">
                    <Mail class="w-4 h-4 text-blue-500" />
                    {{ t('admin.crm.customer.email') }}
                  </div>
                  <div class="font-medium text-gray-900 ml-6">{{ deal.customer.email }}</div>
                </div>
                <div v-if="deal.customer.phone">
                  <div class="text-sm text-gray-700 flex items-center gap-2">
                    <Phone class="w-4 h-4 text-blue-500" />
                    {{ t('admin.crm.customer.phone') }}
                  </div>
                  <div class="font-medium text-gray-900 ml-6">{{ deal.customer.phone }}</div>
                </div>
              </div>
            </div>

            <!-- Apartment Info -->
            <div class="bg-white p-6 rounded-lg border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900">{{ t('admin.crm.deal.apartment') }}</h3>
                <button
                  v-if="!deal.apartment && !isConnectingApartment"
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  @click="startConnectingApartment"
                >
                  {{ t('admin.crm.deal.connect_apartment') }}
                </button>
              </div>

              <!-- Connected Apartment Info -->
              <div v-if="deal.apartment" class="space-y-3">
                <!-- Project -->
                <div v-if="deal.apartment.building?.project">
                  <div class="text-sm text-gray-700">{{ t('admin.crm.deal.project') || 'Project' }}</div>
                  <div class="font-medium text-gray-900">{{ getLocalizedName(deal.apartment.building.project) }}</div>
                </div>

                <div v-if="deal.apartment.building">
                  <div class="text-sm text-gray-700">{{ t('admin.crm.deal.building') }}</div>
                  <div class="font-medium text-gray-900">{{ getLocalizedName(deal.apartment.building) }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-700">{{ t('admin.crm.deal.apartment_number') }}</div>
                  <div class="font-medium text-gray-900">#{{ deal.apartment.apartment_number }}</div>
                </div>
              </div>

              <!-- Connection Helper -->
              <div v-else-if="isConnectingApartment" class="space-y-4">
                <!-- Project Select -->
                <div>
                  <label class="block text-sm text-gray-700 mb-1">{{ t('admin.crm.deal.select_project') }}</label>
                  <select
                    v-model="selectedProjectId"
                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    :disabled="loadingProjects"
                  >
                    <option :value="null" disabled>Select Project...</option>
                    <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.title }}</option>
                  </select>
                </div>

                <!-- Building Select -->
                <div v-if="selectedProjectId">
                  <label class="block text-sm text-gray-700 mb-1">{{ t('admin.crm.deal.select_building') }}</label>
                  <select
                    v-model="selectedBuildingId"
                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    :disabled="loadingBuildings || buildings.length === 0"
                  >
                    <option :value="null" disabled>Select Building...</option>
                    <option v-for="b in buildings" :key="b.id" :value="b.id">{{ getLocalizedName(b) }}</option>
                  </select>
                </div>

                <!-- Floor Select -->
                <div v-if="selectedBuildingId && availableFloors.length > 0">
                  <label class="block text-sm text-gray-700 mb-1">{{ t('admin.crm.deal.select_floor') }}</label>
                  <select
                    v-model="selectedFloor"
                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    :disabled="loadingApartments"
                  >
                    <option :value="null" disabled>Select Floor...</option>
                    <option v-for="floor in availableFloors" :key="floor" :value="floor">
                      {{ floor }}
                    </option>
                  </select>
                </div>

                <!-- Apartment Select -->
                <div v-if="selectedFloor">
                  <label class="block text-sm text-gray-700 mb-1">{{ t('admin.crm.deal.select_apartment') }}</label>
                  <select
                    v-model="selectedApartmentId"
                    class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                    :disabled="loadingApartments"
                  >
                    <option :value="null" disabled>Select Apartment...</option>
                    <option v-for="apt in availableApartments" :key="apt.id" :value="apt.id">
                      #{{ apt.apartment_number }} ({{ apt.area_total }}m²) - {{ formatCurrency(apt.price) }}
                    </option>
                  </select>
                  <p v-if="availableApartments.length === 0" class="text-xs text-red-500 mt-1">
                    {{ t('admin.crm.deal.no_available_apartments') }}
                  </p>
                </div>

                <!-- Actions -->
                <div class="flex gap-2 justify-end pt-2">
                  <button
                    class="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    @click="cancelConnecting"
                  >
                    {{ t('admin.crm.actions.cancel') }}
                  </button>
                  <button
                    class="px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                    :disabled="!selectedApartmentId || isSavingConnection"
                    @click="saveConnection"
                  >
                    {{ isSavingConnection ? t('admin.crm.deal.connecting') : t('admin.crm.deal.save_connection') }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="deal.notes" class="bg-white p-6 rounded-lg border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-4">{{ t('admin.crm.deal.notes') }}</h3>
              <p class="text-gray-900 whitespace-pre-wrap">{{ deal.notes }}</p>
            </div>

            <!-- Metadata -->
            <div class="bg-white p-6 rounded-lg border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-4">{{ t('admin.crm.fields.metadata') }}</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-700">{{ t('admin.crm.fields.created') }}</span>
                  <span class="font-medium text-gray-900">{{ formatDateTime(deal.created_at) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-700">{{ t('admin.crm.fields.updated') }}</span>
                  <span class="font-medium text-gray-900">{{ formatDateTime(deal.updated_at) }}</span>
                </div>
                <div v-if="deal.last_activity_at" class="flex justify-between">
                  <span class="text-gray-700">{{ t('admin.crm.fields.last_activity') }}</span>
                  <span class="font-medium text-gray-900">{{ formatDateTime(deal.last_activity_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Activities Tab -->
          <div v-else-if="activeTab === 'activities'" class="space-y-4">
            <!-- Activity Form -->
            <DealActivityForm :deal-id="dealId" @submit="handleAddActivity" />

            <!-- Activities List -->
            <div v-if="isLoadingActivities" class="text-center py-8">
              <div
                class="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"
              ></div>
              <p class="mt-4 text-gray-700 text-sm">{{ t('admin.crm.messages.loading') }}</p>
            </div>

            <div v-else-if="crmStore.dealActivities.length > 0" class="space-y-3">
              <div
                v-for="activity in crmStore.dealActivities"
                :key="activity.id"
                class="bg-white p-4 rounded-lg border border-gray-200"
              >
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 mt-1">
                    <component :is="getActivityIcon(activity.type)" class="w-5 h-5 text-gray-600" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-sm font-medium text-gray-900">
                        {{ getActivityTypeLabel(activity.type) }}
                      </span>
                      <span v-if="activity.user" class="text-xs text-gray-600">
                        • {{ activity.user.name }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-900 whitespace-pre-wrap">
                      {{ activity.content }}
                    </p>
                    <div class="text-xs text-gray-600 mt-2">
                      {{ formatDateTime(activity.created_at) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12 bg-white rounded-lg border border-gray-200">
              <svg
                class="w-12 h-12 text-gray-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p class="text-sm text-gray-700">{{ t('admin.crm.activity.no_activities') }}</p>
              <p class="text-xs text-gray-600 mt-1">{{ t('admin.crm.activity.add_first') }}</p>
            </div>
          </div>

          <!-- Payments Tab -->
          <div v-else-if="activeTab === 'payments'">
            <DealPayments :deal="deal" />
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
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
</style>
