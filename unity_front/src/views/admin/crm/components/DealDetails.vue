<script setup lang="ts">
/**
 * Deal Details Component (Refactored)
 * Displays core deal information: Price, Customer, Apartment, Notes
 * Features premium styling with masonry layout and visual breakdown.
 */

import { ref, computed, watch } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useLocaleFormatter } from '@/composables/i18n/useLocaleFormatter'
import { useAlternativeDescriptions } from '@/composables/calculator/useAlternativeDescriptions'
import { useCrmStore } from '@/stores/admin/crm'
import { useToastStore } from '@/stores/ui/toast'
import { useBuildingsAdminStore } from '@/stores/admin/buildings'
import { projectsApi, type ProjectApiResponse } from '@/services/projectsApi'
import { apartmentService, type ApartmentSearchResult } from '@/services/apartmentService'
import { adminBuildingsApi } from '@/services/adminBuildingsApi'
import type { CrmDeal } from '@/types/crm'
import { CURRENCY_SYMBOLS } from '@/types/crm'
import type { ProjectCalculatorSettings } from '@/types/admin/calculator'
import {
  Users,
  Mail,
  Phone,
  Building,
  MapPin,
  Maximize,
  Calendar,
  Clock,
  DollarSign,
  Edit2,
  CheckCircle,
  FileText,
  Briefcase
} from 'lucide-vue-next'

// Props
interface Props {
  deal: CrmDeal
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  (e: 'edit-price'): void
  (e: 'refresh'): void
}>()

// Composables
const { t, currentLocale } = useTranslations()
const { formatNumber: formatNum, formatDate: formatDt, formatCurrency: formatCurr } = useLocaleFormatter()

// Stores
const crmStore = useCrmStore()
const toast = useToastStore()
const buildingsStore = useBuildingsAdminStore()

// Computed
const currencySymbol = computed(() => {
  if (!props.deal) return '$'
  return CURRENCY_SYMBOLS[props.deal.currency]
})

// Formatting helpers
function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '0'
  return formatNum(value, { maximumFractionDigits: 0 })
}

function formatDate(dateStr: string): string {
  return formatDt(dateStr, { year: 'numeric', month: 'long', day: 'numeric' })
}

function formatCurrency(amount: number) {
  return formatCurr(amount, 'USD')
}

// Priority editing state
const editablePriority = ref<'low' | 'medium' | 'high'>(props.deal.priority)
const isUpdatingPriority = ref(false)

// Watch for deal changes to update editable priority
watch(() => props.deal.priority, (newPriority) => {
  editablePriority.value = newPriority
})

// Update priority
async function handlePriorityChange(): Promise<void> {
  if (editablePriority.value === props.deal.priority) return

  isUpdatingPriority.value = true
  try {
    await crmStore.updateDeal(props.deal.id, {
      priority: editablePriority.value
    })
    toast.success(t('admin.crm.messages.deal_updated'))
    emit('refresh')
  } catch (error) {
    console.error('Failed to update priority:', error)
    toast.error(t('admin.crm.messages.update_failed'))
    // Revert to original value
    editablePriority.value = props.deal.priority
  } finally {
    isUpdatingPriority.value = false
  }
}

// Apartment Connection State
const isConnectingApartment = ref(false)
const isSavingConnection = ref(false)
const projects = ref<ProjectApiResponse[]>([])
const loadingProjects = ref(false)
const selectedProjectId = ref<number | null>(null)
const selectedBuildingId = ref<number | null>(null)
const selectedFloor = ref<number | null>(null)
const selectedApartmentId = ref<number | null>(null)
const availableFloorsList = ref<number[]>([])
const availableApartments = ref<ApartmentSearchResult[]>([])
const loadingApartments = ref(false)

const buildings = computed(() => buildingsStore.buildings)
const loadingBuildings = computed(() => buildingsStore.isLoading)
const availableFloors = computed(() => availableFloorsList.value)

// Alternative Descriptions
const alternativeDescriptions = computed(() => 
  useAlternativeDescriptions((props.deal.apartment?.building?.project?.calculator_settings as unknown as ProjectCalculatorSettings) ?? null)
)

const selectedAlternativeTitle = computed(() => {
   if (!props.deal.selected_payment_alternative) return ''
   const alt = alternativeDescriptions.value.find(a => a.id === props.deal.selected_payment_alternative)
   const locale = (currentLocale as 'ka' | 'en' | 'ru') || 'ka'
   return alt ? alt.title[locale] : ''
})

// Localization Helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getLocalizedName(item: any): string {
  if (!item) return ''
  const nameVal = item.name || item.title
  if (nameVal && typeof nameVal === 'object') {
    const locale = (currentLocale as string) || 'ka'
    const key = locale
    if (nameVal[key]) return nameVal[key]
    return nameVal['en'] || nameVal['ka'] || nameVal['ru'] || Object.values(nameVal)[0]
  }
  if (typeof nameVal === 'string') return nameVal
  return item.identifier || ''
}

// Apartment Connection Logic
async function startConnectingApartment() {
  isConnectingApartment.value = true
  selectedProjectId.value = null
  selectedBuildingId.value = null
  selectedFloor.value = null
  selectedApartmentId.value = null
  availableFloorsList.value = []
  availableApartments.value = []
  
  if (projects.value.length === 0) {
    loadingProjects.value = true
    try {
      projects.value = await projectsApi.getAll()
    } catch {
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
  availableFloorsList.value = []
  availableApartments.value = []
  
  if (newId) {
    try {
      await buildingsStore.fetchBuildings(newId)
    } catch {
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
    loadingApartments.value = true
    try {
      const { data } = await adminBuildingsApi.getFloors(newId)
      if (data && data.success) {
        availableFloorsList.value = data.data
      }
    } catch {
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
        per_page: 100,
      })
      availableApartments.value = result.data
    } catch {
      toast.error(t('admin.crm.messages.load_failed'))
    } finally {
      loadingApartments.value = false
    }
  }
})

async function saveConnection() {
  if (!selectedApartmentId.value || !props.deal) return
  
  isSavingConnection.value = true
  try {
    await crmStore.updateDeal(props.deal.id, {
      apartment_id: selectedApartmentId.value
    })
    toast.success(t('admin.crm.messages.saved'))
    isConnectingApartment.value = false
    emit('refresh')
  } catch {
    toast.error(t('admin.crm.messages.save_failed'))
  } finally {
    isSavingConnection.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Grid Layout -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      <!-- 1. Metadata Card (Priority, Dates) -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300">
        <div class="px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
          <Clock class="w-4 h-4 text-gray-500" />
          <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">{{ t('admin.crm.fields.metadata') }}</h3>
        </div>
        <div class="p-5 grid grid-cols-2 gap-y-4 gap-x-6">
          <div>
            <span class="text-xs font-medium text-gray-400 mb-1 block">{{ t('admin.crm.deal.priority_label') }}</span>
            <select
              v-model="editablePriority"
              @change="handlePriorityChange"
              :disabled="isUpdatingPriority"
              class="w-full px-2.5 py-1.5 text-xs font-medium capitalize rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1"
              :class="{
                'border-red-200 bg-red-50 text-red-700 focus:ring-red-500 hover:bg-red-100': editablePriority === 'high',
                'border-yellow-200 bg-yellow-50 text-yellow-700 focus:ring-yellow-500 hover:bg-yellow-100': editablePriority === 'medium',
                'border-blue-200 bg-blue-50 text-blue-700 focus:ring-blue-500 hover:bg-blue-100': editablePriority === 'low',
                'opacity-50 cursor-not-allowed': isUpdatingPriority
              }"
            >
              <option value="low" class="bg-white text-gray-900">{{ t('admin.crm.priority.low') }}</option>
              <option value="medium" class="bg-white text-gray-900">{{ t('admin.crm.priority.medium') }}</option>
              <option value="high" class="bg-white text-gray-900">{{ t('admin.crm.priority.high') }}</option>
            </select>
          </div>
          
          <div>
            <span class="text-xs font-medium text-gray-400 mb-1 block">{{ t('admin.crm.deal.currency') }}</span>
            <span class="text-sm font-semibold text-gray-800">{{ deal.currency }}</span>
          </div>

          <div v-if="deal.expected_close_date">
            <span class="text-xs font-medium text-gray-400 mb-1 block">{{ t('admin.crm.deal.expected_close_date') }}</span>
            <div class="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Calendar class="w-3.5 h-3.5 text-gray-400" />
              {{ formatDate(deal.expected_close_date) }}
            </div>
          </div>

          <div v-if="deal.days_in_stage">
            <span class="text-xs font-medium text-gray-400 mb-1 block">{{ t('admin.crm.deal.days_in_stage') }}</span>
            <div class="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Clock class="w-3.5 h-3.5 text-gray-400" />
              {{ deal.days_in_stage }} {{ t('admin.crm.deal.days') }}
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Customer Card -->
      <div v-if="deal.customer" class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300">
        <div class="px-5 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Users class="w-4 h-4 text-blue-500" />
            <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">{{ t('admin.crm.customer.title') }}</h3>
          </div>
        </div>
        <div class="p-5 space-y-4">
          <div class="flex items-start gap-3">
             <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-sm">
                {{ deal.customer.name.charAt(0).toUpperCase() }}
             </div>
             <div>
                <p class="font-bold text-gray-900 text-base mb-0.5">{{ deal.customer.name }}</p>
                <div class="flex flex-col gap-1.5 mt-2">
                  <a v-if="deal.customer.email" :href="`mailto:${deal.customer.email}`" class="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-2 transition-colors">
                    <Mail class="w-3.5 h-3.5 text-gray-400" />
                    {{ deal.customer.email }}
                  </a>
                  <a v-if="deal.customer.phone" :href="`tel:${deal.customer.phone}`" class="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-2 transition-colors">
                    <Phone class="w-3.5 h-3.5 text-gray-400" />
                    {{ deal.customer.phone }}
                  </a>
                </div>
             </div>
          </div>
        </div>
      </div>
    
    </div> <!-- End grid -->

    <!-- 3. Pricing & Terms (Full Width) -->
    <div class="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow duration-300">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <DollarSign class="w-5 h-5 text-emerald-500" />
          <h3 class="text-base font-bold text-gray-800">{{ t('admin.crm.pricing.pricing_title') }}</h3>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          @click="emit('edit-price')"
        >
          <Edit2 class="w-3.5 h-3.5" />
          {{ deal.current_price ? t('admin.crm.pricing.edit_price') : t('admin.crm.pricing.set_price') }}
        </button>
      </div>

      <div class="p-6">
        <div v-if="deal.current_price" class="space-y-6">
          <div class="flex flex-col md:flex-row gap-8">
            <!-- Main Price -->
            <div class="flex-1">
               <span class="text-sm font-medium text-gray-500 mb-1 block">{{ t('admin.crm.pricing.current_price') }}</span>
               <div class="text-3xl font-black text-gray-900 tracking-tight">{{ currencySymbol }}{{ formatNumber(deal.current_price) }}</div>
               <div v-if="deal.apartment" class="mt-1 text-sm text-gray-500 font-medium">
                  {{ currencySymbol }}{{ formatNumber(deal.current_price / deal.apartment.area_total) }} <span class="text-gray-400">/ m²</span>
               </div>
            </div>

            <!-- Price Breakdown -->
            <div class="flex-1 space-y-2 border-l border-gray-100 pl-0 md:pl-8">
               <div v-if="deal.offered_price_total" class="flex justify-between items-center text-sm">
                 <span class="text-gray-500">{{ t('admin.crm.pricing.offered') }}</span>
                 <span class="font-medium text-gray-700">{{ currencySymbol }}{{ formatNumber(deal.offered_price_total) }}</span>
               </div>
               <div v-if="deal.reserved_price_total" class="flex justify-between items-center text-sm">
                 <span class="text-gray-500">{{ t('admin.crm.pricing.reserved') }}</span>
                 <span class="font-medium text-gray-700">{{ currencySymbol }}{{ formatNumber(deal.reserved_price_total) }}</span>
               </div>
               <div v-if="deal.final_price_total" class="flex justify-between items-center text-base pt-2 border-t border-gray-100">
                 <span class="font-bold text-gray-900">{{ t('admin.crm.pricing.final') }}</span>
                 <span class="font-bold text-emerald-600">{{ currencySymbol }}{{ formatNumber(deal.final_price_total) }}</span>
               </div>
            </div>
          </div>

          <!-- Payment Plan - Highlighted -->
          <div v-if="deal.selected_payment_alternative" class="mt-4 bg-blue-50/50 rounded-lg p-4 border border-blue-100">
             <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                   <span class="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-0.5 block">{{ t('admin.crm.pricing.selected_plan') }}</span>
                   <span class="font-bold text-gray-800">
                     {{ selectedAlternativeTitle || `${t('admin.crm.pricing.option')} ${deal.selected_payment_alternative}` }}
                   </span>
                </div>
                <div class="flex items-center gap-1.5 text-blue-700 bg-white px-2.5 py-1 rounded-md shadow-sm border border-blue-50 text-sm font-medium">
                  <CheckCircle class="w-4 h-4" />
                  {{ t('admin.common.active') }}
                </div>
             </div>
          </div>
        </div>
        
        <div v-else class="text-center py-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-3">
            <DollarSign class="w-6 h-6" />
          </div>
          <p class="text-sm text-gray-500 italic mb-2">{{ t('admin.crm.pricing.no_pricing_set') }}</p>
        </div>
      </div>
    </div>

    <!-- 4. Apartment Card (Collapsible/Connect) -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Building class="w-5 h-5 text-indigo-500" />
          <h3 class="text-base font-bold text-gray-800">{{ t('admin.crm.deal.apartment') }}</h3>
        </div>
         <button
            v-if="!deal.apartment && !isConnectingApartment"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            @click="startConnectingApartment"
          >
            <Briefcase class="w-3.5 h-3.5" />
            {{ t('admin.crm.deal.connect_apartment') }}
          </button>
      </div>

      <div class="p-6">
        <!-- Connected State -->
        <div v-if="deal.apartment">
           <div class="flex flex-col sm:flex-row gap-6">
              <!-- Visual Hint -->
              <div class="w-full sm:w-24 h-24 bg-indigo-50 rounded-lg flex flex-col items-center justify-center text-indigo-600 border border-indigo-100">
                 <span class="text-xs font-medium uppercase text-indigo-400">Apt</span>
                 <span class="text-2xl font-black">{{ deal.apartment.apartment_number }}</span>
              </div>
              
              <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <span class="text-xs text-gray-500 mb-0.5 block flex items-center gap-1"><MapPin class="w-3 h-3" /> {{ t('admin.crm.deal.project_label') }}</span>
                    <span class="font-medium text-gray-900 block truncate">{{ deal.apartment.building?.project ? getLocalizedName(deal.apartment.building.project) : '-' }}</span>
                 </div>
                 <div>
                    <span class="text-xs text-gray-500 mb-0.5 block flex items-center gap-1"><Building class="w-3 h-3" /> {{ t('admin.crm.deal.building_label') }}</span>
                    <span class="font-medium text-gray-900 block truncate">{{ deal.apartment.building ? getLocalizedName(deal.apartment.building) : '-' }}</span>
                 </div>
                 <div>
                    <span class="text-xs text-gray-500 mb-0.5 block flex items-center gap-1"><Maximize class="w-3 h-3" /> {{ t('admin.crm.deal.area_label') }}</span>
                    <span class="font-medium text-gray-900">{{ deal.apartment.area_total }} m²</span>
                 </div>
                 <!-- Price removed -->
              </div>
           </div>
        </div>

        <!-- Connection Form -->
        <div v-else-if="isConnectingApartment" class="bg-gray-50 rounded-xl p-5 border border-gray-200 animate-in fade-in slide-in-from-top-4 duration-300">
            <h4 class="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase class="w-4 h-4 text-indigo-500" />
              {{ t('admin.crm.deal.connect_apartment') }}
            </h4>
            
            <div class="grid grid-cols-1 gap-4">
               <div>
                 <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{{ t('admin.crm.deal.select_project') }}</label>
                 <select
                   v-model="selectedProjectId"
                   class="w-full rounded-lg border-gray-200 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2"
                   :disabled="loadingProjects"
                 >
                   <option :value="null" disabled>{{ t('admin.crm.deal.select_project') }}</option>
                   <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.title }}</option>
                 </select>
               </div>

                <div v-if="selectedProjectId" class="grid grid-cols-2 gap-4">
                   <div>
                     <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{{ t('admin.crm.deal.select_building') }}</label>
                     <select
                       v-model="selectedBuildingId"
                       class="w-full rounded-lg border-gray-200 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2"
                       :disabled="loadingBuildings || buildings.length === 0"
                     >
                       <option :value="null" disabled>{{ t('admin.crm.deal.select_building') }}</option>
                       <option v-for="b in buildings" :key="b.id" :value="b.id">{{ getLocalizedName(b) }}</option>
                     </select>
                   </div>
                   
                   <div>
                     <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{{ t('admin.crm.deal.select_floor') }}</label>
                     <select
                       v-model="selectedFloor"
                       class="w-full rounded-lg border-gray-200 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2"
                       :disabled="loadingApartments || !selectedBuildingId"
                     >
                       <option :value="null" disabled>{{ t('admin.crm.deal.select_floor') }}</option>
                       <option v-for="floor in availableFloors" :key="floor" :value="floor">{{ floor }}</option>
                     </select>
                   </div>
                </div>

                <div v-if="selectedFloor">
                   <label class="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{{ t('admin.crm.deal.select_apartment') }}</label>
                   <select
                     v-model="selectedApartmentId"
                     class="w-full rounded-lg border-gray-200 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2"
                     :disabled="loadingApartments"
                   >
                     <option :value="null" disabled>{{ t('admin.crm.deal.select_apartment') }}</option>
                     <option v-for="apt in availableApartments" :key="apt.id" :value="apt.id">
                       #{{ apt.apartment_number }} ({{ apt.area_total }}m²) - {{ formatCurrency(apt.price) }}
                     </option>
                   </select>
                </div>
            </div>

            <div class="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200/50">
               <button
                 class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                 @click="cancelConnecting"
               >
                 {{ t('admin.crm.actions.cancel') }}
               </button>
               <button
                 class="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all"
                 :disabled="!selectedApartmentId || isSavingConnection"
                 @click="saveConnection"
               >
                 {{ isSavingConnection ? t('admin.crm.deal.connecting') : t('admin.crm.deal.save_connection') }}
               </button>
            </div>
        </div>
        
        <div v-else class="text-center py-8">
           <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-300 mb-3">
              <Building class="w-6 h-6" />
           </div>
           <p class="text-sm text-gray-500">{{ t('admin.crm.deal.no_apartment_connected') }}</p>
        </div>
      </div>
    </div>
    
    <!-- 5. Notes Card -->
    <div v-if="deal.notes" class="bg-amber-50 rounded-xl border border-amber-100 shadow-sm p-5 relative overflow-hidden">
       <!-- Decorative quote -->
       <div class="absolute top-2 right-4 text-amber-200 text-6xl font-serif opacity-30">”</div>
       
       <h3 class="flex items-center gap-2 text-sm font-bold text-amber-800 uppercase tracking-wide mb-3 relative z-10">
          <FileText class="w-4 h-4" />
          {{ t('admin.crm.deal.notes') }}
       </h3>
       <p class="text-gray-800 whitespace-pre-wrap relative z-10 leading-relaxed">{{ deal.notes }}</p>
    </div>

  </div>
</template>
