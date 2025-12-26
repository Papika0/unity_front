<script setup lang="ts">
/**
 * CRM Pipeline View
 * Unified sales pipeline - leads automatically flow in from website forms
 */

import { ref, computed, onMounted, watch } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useCrmStore } from '@/stores/admin/crm'
import { useToastStore } from '@/stores/ui/toast'
import { getAdminProjects } from '@/services/projects'
import { crmApi } from '@/services/crmApi'
import KanbanBoard from './components/KanbanBoard.vue'
import DealDrawer from './components/DealDrawer.vue'
import LostReasonModal from './components/LostReasonModal.vue'
import StageChangeConfirmModal from './components/StageChangeConfirmModal.vue'
import DealPricingModal from './components/DealPricingModal.vue'
import type { CrmDeal } from '@/types/crm'
import { User, Phone, Mail, Building, FileText, Search } from 'lucide-vue-next'

interface Project {
  id: number
  title: string
}

// Composables
const { t } = useTranslations()

// Stores
const crmStore = useCrmStore()
const toast = useToastStore()

// State
const showDealDrawer = ref(false)
const showCreateModal = ref(false)
const showLostModal = ref(false)
const showStageChangeModal = ref(false)
const showPricingModalFromStageChange = ref(false)
const pendingLostDeal = ref<{ dealId: number; targetStageId: number } | null>(null)
const pendingStageChangeDeal = ref<{ deal: CrmDeal; targetStageId: number } | null>(null)
const selectedDealId = ref<number | null>(null)
const filterUserId = ref<number | null>(null)
const isCreating = ref(false)

// Search and filter state
const searchQuery = ref('')
const filterPriority = ref<'high' | 'medium' | 'low' | ''>('')
const showStaleOnly = ref(false)

// Projects for multi-select
const projects = ref<Project[]>([])
const loadingProjects = ref(false)

// New Lead Form
const newLeadForm = ref({
  name: '',
  surname: '',
  phone: '',
  email: '',
  project_ids: [] as number[],
  apartment_info: '',
  notes: '',
})

// Computed
const isLoading = computed(() => crmStore.isLoadingPipeline)
const statistics = computed(() => crmStore.statistics)

// Filtered pipeline based on search and filters
const filteredPipeline = computed(() => {
  return crmStore.pipeline.map(column => ({
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
})

// Load pipeline and projects on mount
onMounted(async () => {
  try {
    await Promise.all([
      crmStore.fetchPipeline(filterUserId.value ?? undefined),
      crmStore.fetchStatistics(),
      crmStore.fetchStages(),
      loadProjects(),
    ])
  } catch (error) {
    console.error('Failed to load CRM data:', error)
    toast.error(t('admin.crm.messages.load_failed'))
  }
})

// Load projects for multi-select
async function loadProjects(): Promise<void> {
  loadingProjects.value = true
  try {
    const response = await getAdminProjects()
    projects.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load projects:', error)
  } finally {
    loadingProjects.value = false
  }
}

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
  await handleStageChange(dealId, stageId, undefined, true) // Skip pricing check
}

// Handle stage change modal - update price
function handleStageChangeUpdatePrice(_dealId: number, _stageId: number): void {
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


// Toggle project selection
function toggleProject(projectId: number): void {
  const index = newLeadForm.value.project_ids.indexOf(projectId)
  if (index === -1) {
    newLeadForm.value.project_ids.push(projectId)
  } else {
    newLeadForm.value.project_ids.splice(index, 1)
  }
}

// Check if project is selected
function isProjectSelected(projectId: number): boolean {
  return newLeadForm.value.project_ids.includes(projectId)
}

// Handle create lead
async function handleCreateLead(): Promise<void> {
  if (!newLeadForm.value.name || !newLeadForm.value.phone) {
    toast.error(t('admin.crm.messages.fill_required'))
    return
  }

  isCreating.value = true
  try {
    await crmApi.createLead({
      name: newLeadForm.value.name,
      surname: newLeadForm.value.surname || undefined,
      phone: newLeadForm.value.phone,
      email: newLeadForm.value.email || undefined,
      project_ids: newLeadForm.value.project_ids.length > 0 ? newLeadForm.value.project_ids : undefined,
      apartment_info: newLeadForm.value.apartment_info || undefined,
      notes: newLeadForm.value.notes || undefined,
    })
    
    showCreateModal.value = false
    resetNewLeadForm()
    toast.success(t('admin.crm.messages.lead_created'))

    // Refresh pipeline
    await crmStore.fetchPipeline(filterUserId.value ?? undefined)
  } catch {
    toast.error(t('admin.crm.messages.lead_create_failed'))
  } finally {
    isCreating.value = false
  }
}

// Reset new lead form
function resetNewLeadForm(): void {
  newLeadForm.value = {
    name: '',
    surname: '',
    phone: '',
    email: '',
    project_ids: [],
    apartment_info: '',
    notes: '',
  }
}

// Close deal drawer
function closeDealDrawer(): void {
  showDealDrawer.value = false
  selectedDealId.value = null
}

// Format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ka-GE', { maximumFractionDigits: 0 }).format(value)
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
                ${{ formatCurrency(statistics.total_value) }}
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

          <!-- Add Deal Button -->
          <button
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            @click="showCreateModal = true"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            {{ t('admin.crm.pipeline.new_lead') }}
          </button>
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

    <!-- Create Lead Modal -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="showCreateModal = false"
        ></div>

        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h3 class="text-lg font-semibold text-white">{{ t('admin.crm.pipeline.new_lead') }}</h3>
            <p class="text-sm text-blue-100 mt-1">{{ t('admin.crm.form.add_lead_subtitle') }}</p>
          </div>

          <div class="p-6 space-y-4 overflow-y-auto flex-1">
            <!-- Name & Surname -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">{{ t('admin.crm.form.first_name') }}</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User class="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    v-model="newLeadForm.name"
                    type="text"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    :placeholder="t('admin.crm.form.first_name_placeholder')"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-900 mb-1">{{ t('admin.crm.form.last_name') }}</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User class="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    v-model="newLeadForm.surname"
                    type="text"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                    :placeholder="t('admin.crm.form.last_name_placeholder')"
                  />
                </div>
              </div>
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-1">{{ t('admin.crm.form.phone') }}</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone class="h-5 w-5 text-gray-500" />
                </div>
                <input
                  v-model="newLeadForm.phone"
                  type="tel"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 font-medium"
                  placeholder="+995 5XX XXX XXX"
                />
              </div>
            </div>

            <!-- Email (optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-1">{{ t('admin.crm.form.email') }}</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail class="h-5 w-5 text-gray-500" />
                </div>
                <input
                  v-model="newLeadForm.email"
                  type="email"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <!-- Projects Multi-select -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-2">{{ t('admin.crm.form.interested_projects') }}</label>
              <div v-if="loadingProjects" class="text-sm text-gray-700">{{ t('admin.crm.messages.loading') }}</div>
              <div v-else class="flex flex-wrap gap-2">
                <button
                  v-for="project in projects"
                  :key="project.id"
                  type="button"
                  class="px-3 py-1.5 text-sm rounded-full border transition-all"
                  :class="isProjectSelected(project.id)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'"
                  @click="toggleProject(project.id)"
                >
                  {{ project.title }}
                </button>
              </div>
              <p v-if="projects.length === 0 && !loadingProjects" class="text-sm text-gray-700 mt-1">
                {{ t('admin.crm.messages.no_projects') }}
              </p>
            </div>

            <!-- Block/Apartment Info (optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-1">{{ t('admin.crm.form.apartment_info') }}</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building class="h-5 w-5 text-gray-500" />
                </div>
                <input
                  v-model="newLeadForm.apartment_info"
                  type="text"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
                  :placeholder="t('admin.crm.form.apartment_info_placeholder')"
                />
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-900 mb-1">{{ t('admin.crm.form.notes') }}</label>
              <div class="relative">
                <div class="absolute top-3 left-3 pointer-events-none">
                  <FileText class="h-5 w-5 text-gray-500" />
                </div>
                <textarea
                  v-model="newLeadForm.notes"
                  rows="3"
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500 resize-none"
                  :placeholder="t('admin.crm.form.notes_placeholder')"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t">
            <button
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              @click="showCreateModal = false"
              :disabled="isCreating"
            >
              {{ t('admin.crm.form.cancel') }}
            </button>
            <button
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="handleCreateLead"
              :disabled="isCreating"
            >
              <span v-if="isCreating">{{ t('admin.crm.messages.creating') }}</span>
              <span v-else>{{ t('admin.crm.form.create') }}</span>
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>