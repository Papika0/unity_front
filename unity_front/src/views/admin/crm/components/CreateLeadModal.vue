<script setup lang="ts">
/**
 * Create Lead Modal Component
 * Extracted from CrmPipelineView.vue for reusability
 * Allows creation of new leads with basic contact information
 */

import { ref, onMounted, computed } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useToastStore } from '@/stores/ui/toast'
import { useCrmStore } from '@/stores/admin/crm'
import { crmApi } from '@/services/crmApi'
import { getAdminProjects } from '@/services/projects'
import { useApartmentSelector } from '@/composables/crm/useApartmentSelector'
import { User, Phone, Mail, Building, FileText, MapPin } from 'lucide-vue-next'

interface Project {
  id: number
  title: string
  status?: string
}

// Props
interface Props {
  isOpen: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
  created: [dealId: number]
}>()

// Composables
const { t } = useTranslations()
const toast = useToastStore()
const crmStore = useCrmStore()

// Apartment selector composable
const apartmentSelector = useApartmentSelector({
  onError: (message: string) => toast.error(message)
})

// State
const isCreating = ref(false)
const projects = ref<Project[]>([])
const loadingProjects = ref(false)

// Form data
const form = ref({
  name: '',
  surname: '',
  phone: '',
  email: '',
  project_ids: [] as number[],
  stage_id: null as number | null,
  notes: '',
})

// Computed
const ongoingProjects = computed(() => {
  return projects.value.filter(p => p.status === 'ongoing')
})

const openStages = computed(() => {
  return crmStore.stages.filter(stage => stage.type === 'open')
})

// Load projects and stages on mount
onMounted(async () => {
  await loadProjects()
  await apartmentSelector.loadProjects()
  if (crmStore.stages.length === 0) {
    await crmStore.fetchStages()
  }
})

// Load projects
async function loadProjects(): Promise<void> {
  loadingProjects.value = true
  try {
    const response = await getAdminProjects()
    projects.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load projects:', error)
    toast.error(t('admin.crm.messages.load_failed'))
  } finally {
    loadingProjects.value = false
  }
}

// Toggle project selection
function toggleProject(projectId: number): void {
  const index = form.value.project_ids.indexOf(projectId)
  if (index === -1) {
    form.value.project_ids.push(projectId)
  } else {
    form.value.project_ids.splice(index, 1)
  }
}

// Check if project is selected
function isProjectSelected(projectId: number): boolean {
  return form.value.project_ids.includes(projectId)
}

// Validation
function validateForm(): boolean {
  if (!form.value.name?.trim()) {
    toast.error(t('admin.crm.messages.fill_required'))
    return false
  }

  if (!form.value.phone?.trim()) {
    toast.error(t('admin.crm.messages.fill_required'))
    return false
  }

  // Basic phone validation
  const phoneRegex = /^[\d\s+\-()]+$/
  if (!phoneRegex.test(form.value.phone)) {
    toast.error(t('admin.crm.messages.validation.invalid_phone'))
    return false
  }

  // Email validation (if provided)
  if (form.value.email?.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.value.email)) {
      toast.error(t('admin.crm.messages.validation.invalid_email'))
      return false
    }
  }

  return true
}

// Handle create lead
async function handleCreate(): Promise<void> {
  if (!validateForm()) return

  isCreating.value = true
  try {
    const createdDeal = await crmApi.createLead({
      name: form.value.name,
      surname: form.value.surname || undefined,
      phone: form.value.phone,
      email: form.value.email || undefined,
      project_ids: form.value.project_ids.length > 0 ? form.value.project_ids : undefined,
      apartment_id: apartmentSelector.selectedApartmentId.value || undefined,
      stage_id: form.value.stage_id || undefined,
      notes: form.value.notes || undefined,
    })

    toast.success(t('admin.crm.messages.lead_created'))
    resetForm()
    emit('created', createdDeal.id)
    emit('close')
  } catch (error) {
    console.error('Failed to create lead:', error)
    toast.error(t('admin.crm.messages.lead_create_failed'))
  } finally {
    isCreating.value = false
  }
}

// Reset form
function resetForm(): void {
  form.value = {
    name: '',
    surname: '',
    phone: '',
    email: '',
    project_ids: [],
    stage_id: null,
    notes: '',
  }
  apartmentSelector.reset()
}

// Handle close
function handleClose(): void {
  if (!isCreating.value) {
    resetForm()
    emit('close')
  }
}

// Get localized name
function getLocalizedName(item: any): string {
  if (!item) return ''
  const nameVal = item.name || item.title
  if (typeof nameVal === 'object') {
    return nameVal.en || nameVal.ka || nameVal.ru || Object.values(nameVal)[0] || ''
  }
  return nameVal || ''
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        @click="handleClose"
      ></div>

      <!-- Modal Container -->
      <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 border-b border-white/10 flex-shrink-0">
          <div class="flex items-center justify-between">
             <div>
                <h3 class="text-lg font-bold text-white tracking-tight">{{ t('admin.crm.pipeline.new_lead') }}</h3>
                <p class="text-sm text-slate-300 mt-1 font-medium">{{ t('admin.crm.form.add_lead_subtitle') }}</p>
             </div>
             <button @click="handleClose" class="text-slate-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
          </div>
        </div>

        <!-- Scrollable Content -->
        <div class="p-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
          
          <!-- Contact Info Section -->
          <div class="space-y-4">
             <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ t('admin.crm.form.contact_info') }}</h4>
             
             <!-- Name Fields -->
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
               <div class="group">
                 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">{{ t('admin.crm.form.first_name') }} <span class="text-red-500">*</span></label>
                 <div class="relative">
                   <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
                     <User class="h-4 w-4 text-gray-400" />
                   </div>
                   <input
                     v-model="form.name"
                     type="text"
                     class="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all font-medium"
                     :placeholder="t('admin.crm.form.first_name_placeholder')"
                   />
                 </div>
               </div>
               
               <div class="group">
                 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">{{ t('admin.crm.form.last_name') }}</label>
                 <div class="relative">
                   <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
                     <User class="h-4 w-4 text-gray-400" />
                   </div>
                   <input
                     v-model="form.surname"
                     type="text"
                     class="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all font-medium"
                     :placeholder="t('admin.crm.form.last_name_placeholder')"
                   />
                 </div>
               </div>
             </div>

             <!-- Communication Fields -->
             <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
               <div class="group">
                 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">{{ t('admin.crm.form.phone') }} <span class="text-red-500">*</span></label>
                 <div class="relative">
                   <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
                     <Phone class="h-4 w-4 text-gray-400" />
                   </div>
                   <input
                     v-model="form.phone"
                     type="tel"
                     class="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all font-medium"
                     :placeholder="t('admin.crm.form.phone_placeholder')"
                   />
                 </div>
               </div>

               <div class="group">
                 <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">{{ t('admin.crm.form.email') }}</label>
                 <div class="relative">
                   <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
                     <Mail class="h-4 w-4 text-gray-400" />
                   </div>
                   <input
                     v-model="form.email"
                     type="email"
                     class="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all font-medium"
                     :placeholder="t('admin.crm.form.email_placeholder')"
                   />
                 </div>
               </div>
             </div>
          </div>
          
          <div class="h-px bg-gray-100"></div>

          <!-- Interest & Stage Section -->
          <div class="space-y-4">
             <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{ t('admin.crm.form.interest_details') }}</h4>
             
             <!-- Stage -->
             <div class="group">
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">{{ t('admin.crm.form.stage') }}</label>
                <div class="relative">
                   <select
                     v-model="form.stage_id"
                     class="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 appearance-none transition-all font-medium"
                   >
                     <option :value="null">{{ t('admin.crm.form.select_stage') }}</option>
                     <option
                       v-for="stage in openStages"
                       :key="stage.id"
                       :value="stage.id"
                     >
                       {{ stage.name }}
                     </option>
                   </select>
                   <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                   </div>
                </div>
             </div>

             <!-- Project Interest -->
             <div>
                <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-1">{{ t('admin.crm.form.interested_projects') }}</label>
                <div v-if="loadingProjects" class="flex justify-center p-4">
                   <div class="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div v-else class="flex flex-wrap gap-2">
                   <button
                     v-for="project in ongoingProjects"
                     :key="project.id"
                     type="button"
                     class="group relative px-4 py-2 text-sm font-medium rounded-xl border transition-all duration-200 overflow-hidden"
                     :class="isProjectSelected(project.id)
                       ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-transparent shadow-md shadow-blue-500/20'
                       : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:shadow-sm'"
                     @click="toggleProject(project.id)"
                   >
                     <span class="relative z-10">{{ getLocalizedName(project) }}</span>
                   </button>
                </div>
                <p v-if="ongoingProjects.length === 0 && !loadingProjects" class="text-sm text-gray-500 mt-2 italic px-1">
                  {{ t('admin.crm.messages.no_projects') }}
                </p>
             </div>
          </div>
          
          <div class="h-px bg-gray-100"></div>

          <!-- Specific Apartment Interest (Optional) -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
               {{ t('admin.crm.form.specific_apartment') }} 
               <span class="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">{{ t('admin.crm.form.optional') }}</span>
            </h4>
            
            <div class="bg-gray-50/50 rounded-2xl p-5 border border-gray-200 transition-all hover:border-gray-300 hover:shadow-sm focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-400">
               <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <!-- Project -->
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1.5">{{ t('admin.crm.form.project') }}</label>
                    <div class="relative">
                      <select
                        v-model="apartmentSelector.selectedProjectId.value"
                        class="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 transition-shadow appearance-none"
                        :disabled="apartmentSelector.loadingProjects.value"
                      >
                        <option :value="null">{{ t('admin.crm.form.select_project') }}</option>
                        <option
                          v-for="project in apartmentSelector.projects.value"
                          :key="project.id"
                          :value="project.id"
                        >
                          {{ getLocalizedName(project) }}
                        </option>
                      </select>
                      <div class="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <!-- Building -->
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1.5" :class="{'opacity-50': !apartmentSelector.selectedProjectId.value}">{{ t('admin.crm.form.building') }}</label>
                    <div class="relative">
                      <select
                        v-model="apartmentSelector.selectedBuildingId.value"
                        class="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 transition-shadow disabled:bg-gray-50 disabled:text-gray-400 appearance-none"
                        :disabled="!apartmentSelector.selectedProjectId.value || apartmentSelector.loadingBuildings.value"
                      >
                        <option :value="null">{{ t('admin.crm.form.select_building') }}</option>
                        <option
                          v-for="building in apartmentSelector.buildings.value"
                          :key="building.id"
                          :value="building.id"
                        >
                          {{ getLocalizedName(building) }}
                        </option>
                      </select>
                       <div class="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <!-- Floor -->
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1.5" :class="{'opacity-50': !apartmentSelector.selectedBuildingId.value}">{{ t('admin.crm.form.floor') }}</label>
                    <div class="relative">
                       <select
                         v-model="apartmentSelector.selectedFloor.value"
                         class="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 transition-shadow disabled:bg-gray-50 disabled:text-gray-400 appearance-none"
                         :disabled="!apartmentSelector.selectedBuildingId.value || apartmentSelector.loadingFloors.value"
                       >
                         <option :value="null">{{ t('admin.crm.form.select_floor') }}</option>
                         <option
                           v-for="floor in apartmentSelector.availableFloors.value"
                           :key="floor"
                           :value="floor"
                         >
                           {{ t('admin.crm.form.floor_number', { number: floor }) }}
                         </option>
                       </select>
                       <div class="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  <!-- Apartment -->
                  <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1.5" :class="{'opacity-50': apartmentSelector.selectedFloor.value === null}">{{ t('admin.crm.form.apartment_unit') }}</label>
                    <div class="relative">
                       <select
                         v-model="apartmentSelector.selectedApartmentId.value"
                         class="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-sm text-gray-900 transition-shadow disabled:bg-gray-50 disabled:text-gray-400 appearance-none"
                         :disabled="apartmentSelector.selectedFloor.value === null || apartmentSelector.loadingApartments.value"
                       >
                         <option :value="null">{{ t('admin.crm.form.select_apartment') }}</option>
                         <option
                           v-for="apartment in apartmentSelector.availableApartments.value"
                           :key="apartment.id"
                           :value="apartment.id"
                         >
                           #{{ apartment.apartment_number }} - {{ apartment.area_total }}m²
                         </option>
                       </select>
                       <div class="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none text-gray-400">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>
               </div>

               <!-- Selected Summary -->
               <div v-if="apartmentSelector.selectedApartment.value" class="mt-4 p-3 bg-white rounded-xl border border-blue-100 shadow-sm flex items-center gap-3 animate-in slide-in-from-top-2">
                 <div class="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                   <Building class="h-5 w-5" />
                 </div>
                 <div>
                   <p class="font-bold text-sm text-gray-900">{{ t('admin.crm.form.apartment') }} #{{ apartmentSelector.selectedApartment.value.apartment_number }}</p>
                   <p class="text-xs text-gray-500">{{ apartmentSelector.selectedBuilding.value?.title }} • {{ apartmentSelector.selectedApartment.value.area_total }}m²</p>
                 </div>
               </div>
            </div>
          </div>
          
          <div class="h-px bg-gray-100"></div>

          <!-- Notes -->
          <div class="group">
             <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">{{ t('admin.crm.form.notes') }}</label>
             <div class="relative">
                <textarea
                  v-model="form.notes"
                  rows="3"
                  class="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-gray-900 placeholder-gray-400 resize-none transition-all"
                  :placeholder="t('admin.crm.form.notes_placeholder')"
                ></textarea>
                <div class="absolute bottom-3 right-3 pointer-events-none">
                   <FileText class="h-4 w-4 text-gray-300" />
                </div>
             </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 flex-shrink-0">
          <button
            class="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all shadow-sm"
            @click="handleClose"
            :disabled="isCreating"
          >
            {{ t('admin.crm.form.cancel') }}
          </button>
          <button
            class="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all flex items-center gap-2"
            @click="handleCreate"
            :disabled="isCreating"
          >
            <span v-if="isCreating" class="flex items-center gap-2">
               <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               {{ t('admin.crm.messages.creating') }}
            </span>
            <span v-else>{{ t('admin.crm.form.create') }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
