<script setup lang="ts">
/**
 * Deal Drawer Component
 * Slide-out panel for viewing and editing deal details
 */

import { ref, computed, onMounted, watch } from 'vue'
import { useCrmStore } from '@/stores/admin/crm'
import { useToastStore } from '@/stores/ui/toast'
import type { ActivityType } from '@/types/crm'
import { CURRENCY_SYMBOLS } from '@/types/crm'
import DealActivityForm from './DealActivityForm.vue'
import DealPayments from './DealPayments.vue'

// Props
interface Props {
  dealId: number
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'close'): void
}>()

// Stores
const crmStore = useCrmStore()
const toast = useToastStore()

// State
const activeTab = ref<'details' | 'activities' | 'payments'>('details')
const isLoading = ref(false)
const isLoadingActivities = ref(false)

// Computed
const deal = computed(() => crmStore.currentDeal)

const currencySymbol = computed(() => {
  if (!deal.value) return '$'
  return CURRENCY_SYMBOLS[deal.value.currency]
})

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

// Load deal
async function loadDeal(): Promise<void> {
  isLoading.value = true
  try {
    await crmStore.fetchDeal(props.dealId)
    await loadActivities()
  } catch (error) {
    console.error('Failed to load deal:', error)
    toast.error('გარიგების ჩატვირთვა ვერ მოხერხდა')
    emit('close')
  } finally {
    isLoading.value = false
  }
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
    toast.success('აქტივობა დამატებულია')
  } catch (error) {
    console.error('Failed to add activity:', error)
    toast.error('აქტივობის დამატება ვერ მოხერხდა')
  }
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
function getActivityIcon(type: ActivityType): string {
  switch (type) {
    case 'note':
      return '📝'
    case 'call':
      return '📞'
    case 'email':
      return '✉️'
    case 'meeting':
      return '🤝'
    case 'status_change':
      return '🔄'
    case 'payment':
      return '💰'
    case 'system':
      return '⚙️'
    default:
      return '📌'
  }
}

// Get activity type label
function getActivityTypeLabel(type: ActivityType): string {
  switch (type) {
    case 'note':
      return 'შენიშვნა'
    case 'call':
      return 'ზარი'
    case 'email':
      return 'ელ. ფოსტა'
    case 'meeting':
      return 'შეხვედრა'
    case 'status_change':
      return 'სტატუსის ცვლილება'
    case 'payment':
      return 'გადახდა'
    case 'system':
      return 'სისტემა'
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
      class="fixed right-0 top-0 bottom-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-slide-in-right overflow-hidden"
    >
      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex-1 flex items-center justify-center"
      >
        <div class="text-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"
          ></div>
          <p class="mt-4 text-gray-500">იტვირთება...</p>
        </div>
      </div>

      <!-- Content -->
      <template v-else-if="deal">
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-start justify-between">
          <div class="flex-1">
            <h2 class="text-xl font-bold text-white mb-2">{{ deal.title }}</h2>
            <div class="flex items-center gap-4 text-sm text-blue-100">
              <span v-if="deal.customer">👤 {{ deal.customer.full_name }}</span>
              <span>{{ currencySymbol }}{{ formatNumber(deal.budget) }}</span>
              <span v-if="deal.stage" class="px-2 py-0.5 bg-white/20 rounded">
                {{ deal.stage.name }}
              </span>
            </div>
          </div>

          <!-- Close Button -->
          <button
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
        <div class="border-b border-gray-200 bg-white">
          <div class="flex">
            <button
              class="flex-1 px-6 py-3 text-sm font-medium transition-all"
              :class="
                activeTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              "
              @click="activeTab = 'details'"
            >
              დეტალები
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
              აქტივობები
              <span class="ml-1 text-xs">({{ crmStore.dealActivities.length }})</span>
            </button>
            <button
              class="flex-1 px-6 py-3 text-sm font-medium transition-all"
              :class="
                activeTab === 'payments'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              "
              @click="activeTab = 'payments'"
            >
              გადახდები
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
                <div class="text-sm text-gray-500 mb-1">პრიორიტეტი</div>
                <div class="font-medium capitalize">{{ deal.priority }}</div>
              </div>

              <div class="bg-white p-4 rounded-lg border border-gray-200">
                <div class="text-sm text-gray-500 mb-1">ვალუტა</div>
                <div class="font-medium">{{ deal.currency }}</div>
              </div>

              <div v-if="deal.expected_close_date" class="bg-white p-4 rounded-lg border border-gray-200">
                <div class="text-sm text-gray-500 mb-1">მოსალოდნელი დახურვა</div>
                <div class="font-medium">{{ formatDate(deal.expected_close_date) }}</div>
              </div>

              <div v-if="deal.days_in_stage" class="bg-white p-4 rounded-lg border border-gray-200">
                <div class="text-sm text-gray-500 mb-1">სტადიაში</div>
                <div class="font-medium">{{ deal.days_in_stage }} დღე</div>
              </div>
            </div>

            <!-- Customer Info -->
            <div v-if="deal.customer" class="bg-white p-6 rounded-lg border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-4">კლიენტი</h3>
              <div class="space-y-3">
                <div>
                  <div class="text-sm text-gray-500">სახელი</div>
                  <div class="font-medium">{{ deal.customer.full_name }}</div>
                </div>
                <div v-if="deal.customer.email">
                  <div class="text-sm text-gray-500">ელ. ფოსტა</div>
                  <div class="font-medium">{{ deal.customer.email }}</div>
                </div>
                <div v-if="deal.customer.phone">
                  <div class="text-sm text-gray-500">ტელეფონი</div>
                  <div class="font-medium">{{ deal.customer.phone }}</div>
                </div>
              </div>
            </div>

            <!-- Apartment Info -->
            <div v-if="deal.apartment" class="bg-white p-6 rounded-lg border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-4">ბინა</h3>
              <div class="space-y-3">
                <div v-if="deal.apartment.building">
                  <div class="text-sm text-gray-500">შენობა</div>
                  <div class="font-medium">{{ deal.apartment.building.identifier }}</div>
                </div>
                <div>
                  <div class="text-sm text-gray-500">ნომერი</div>
                  <div class="font-medium">#{{ deal.apartment.number }}</div>
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="deal.notes" class="bg-white p-6 rounded-lg border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-4">შენიშვნები</h3>
              <p class="text-gray-700 whitespace-pre-wrap">{{ deal.notes }}</p>
            </div>

            <!-- Metadata -->
            <div class="bg-white p-6 rounded-lg border border-gray-200">
              <h3 class="font-semibold text-gray-900 mb-4">მეტა-ინფორმაცია</h3>
              <div class="space-y-2 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">შექმნილი:</span>
                  <span class="font-medium">{{ formatDateTime(deal.created_at) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">განახლებული:</span>
                  <span class="font-medium">{{ formatDateTime(deal.updated_at) }}</span>
                </div>
                <div v-if="deal.last_activity_at" class="flex justify-between">
                  <span class="text-gray-500">ბოლო აქტივობა:</span>
                  <span class="font-medium">{{ formatDateTime(deal.last_activity_at) }}</span>
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
              <p class="mt-4 text-gray-500 text-sm">იტვირთება...</p>
            </div>

            <div v-else-if="crmStore.dealActivities.length > 0" class="space-y-3">
              <div
                v-for="activity in crmStore.dealActivities"
                :key="activity.id"
                class="bg-white p-4 rounded-lg border border-gray-200"
              >
                <div class="flex items-start gap-3">
                  <div class="text-2xl flex-shrink-0">{{ getActivityIcon(activity.type) }}</div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-sm font-medium text-gray-900">
                        {{ getActivityTypeLabel(activity.type) }}
                      </span>
                      <span v-if="activity.user" class="text-xs text-gray-500">
                        • {{ activity.user.name }}
                      </span>
                    </div>
                    <p class="text-sm text-gray-700 whitespace-pre-wrap">
                      {{ activity.description }}
                    </p>
                    <div class="text-xs text-gray-500 mt-2">
                      {{ formatDateTime(activity.created_at) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-12 bg-white rounded-lg border border-gray-200">
              <svg
                class="w-12 h-12 text-gray-300 mx-auto mb-3"
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
              <p class="text-sm text-gray-500">არ არის აქტივობები</p>
              <p class="text-xs text-gray-400 mt-1">დაამატეთ პირველი აქტივობა ზემოთ</p>
            </div>
          </div>

          <!-- Payments Tab -->
          <div v-else-if="activeTab === 'payments'">
            <DealPayments :deal="deal" />
          </div>
        </div>
      </template>
    </div>
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
