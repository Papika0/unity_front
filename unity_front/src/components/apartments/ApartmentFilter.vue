<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { projectsApi } from '@/services/projectsApi'
import { apartmentService } from '@/services/apartmentService'
import type { Project } from '@/types/index'

const { t } = useTranslations()

export interface FilterState {
  project_id: number | null
  bedrooms: number[]
  min_area: number | null
  max_area: number | null
}

interface Props {
  modelValue: FilterState
  loading?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  compact: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: FilterState]
  'search': []
}>()

const projects = ref<Project[]>([])
const loadingProjects = ref(false)
const maxBedrooms = ref(4)

// Local state for form inputs
const form = ref<FilterState>({
  project_id: props.modelValue.project_id,
  bedrooms: [...props.modelValue.bedrooms],
  min_area: props.modelValue.min_area,
  max_area: props.modelValue.max_area,
})

// Bedroom options
const bedroomOptions = computed(() => {
  const options = []
  for (let i = 1; i <= maxBedrooms.value; i++) {
    options.push(i)
  }
  return options
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  form.value = {
    project_id: newValue.project_id,
    bedrooms: [...newValue.bedrooms],
    min_area: newValue.min_area,
    max_area: newValue.max_area,
  }
}, { deep: true })

const toggleBedroom = (count: number) => {
  const index = form.value.bedrooms.indexOf(count)
  if (index === -1) {
    form.value.bedrooms.push(count)
  } else {
    form.value.bedrooms.splice(index, 1)
  }
  emitChange()
}

const emitChange = () => {
  emit('update:modelValue', form.value)
}

const handleSearch = () => {
  emit('search')
}

// Load filters
const loadFilters = async () => {
  try {
    const filters = await apartmentService.getFilters()
    maxBedrooms.value = filters.max_bedrooms
  } catch (e) {
    console.error('Failed to load filters', e)
  }
}

// Load projects for dropdown
onMounted(async () => {
  loadFilters()
  try {
    loadingProjects.value = true
    const response = await projectsApi.getAll()
    // Check if response is array or object with data property
    if (Array.isArray(response)) {
      projects.value = response as any
    } else if (response && 'data' in response) {
      // @ts-ignore - Handle various API response shapes
      projects.value = response.data as any
    } else {
       projects.value = []
    }
  } catch (error) {
    console.error('Failed to load projects:', error)
  } finally {
    loadingProjects.value = false
  }
})
</script>

<template>
  <div 
    class="bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden transition-all duration-300"
    :class="compact ? 'p-4' : 'p-6 lg:p-8'"
  >
    <div class="grid grid-cols-1 gap-6" :class="compact ? '' : 'lg:grid-cols-12 lg:gap-8 items-end'">
      
      <!-- Project Selector -->
      <div :class="compact ? '' : 'lg:col-span-3'">
        <label class="block text-xs uppercase tracking-wider text-zinc-500 font-medium mb-2">
          {{ t('apartments.projects') || 'Projects' }}
        </label>
        <div class="relative">
          <select 
            v-model="form.project_id"
            @change="emitChange"
            class="w-full appearance-none bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#FFCD4B] focus:border-transparent transition-all cursor-pointer"
            :disabled="loadingProjects"
          >
            <option :value="null">{{ t('common.all_projects') || 'All Projects' }}</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.title }}
            </option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Bedrooms -->
      <div :class="compact ? '' : 'lg:col-span-4'">
        <label class="block text-xs uppercase tracking-wider text-zinc-500 font-medium mb-2">
          {{ t('apartments.bedrooms') }}
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="count in bedroomOptions"
            :key="count"
            type="button"
            @click="toggleBedroom(count)"
            class="flex-1 min-w-[3rem] h-11 flex items-center justify-center rounded-lg border transition-all duration-200 font-medium"
            :class="[
              form.bedrooms.includes(count)
                ? 'bg-zinc-900 border-zinc-900 text-white shadow-md transform -translate-y-0.5'
                : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
            ]"
          >
            {{ count }}
          </button>
        </div>
      </div>

      <!-- Area Range -->
      <div :class="compact ? '' : 'lg:col-span-3'">
        <label class="block text-xs uppercase tracking-wider text-zinc-500 font-medium mb-2">
          {{ t('apartments.area') }} ({{ t('common.sqm') }})
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model.number="form.min_area"
            type="number"
            :placeholder="t('common.min') || 'Min'"
            class="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFCD4B] focus:border-transparent transition-all"
            @input="emitChange"
          />
          <span class="text-zinc-400">-</span>
          <input
            v-model.number="form.max_area"
            type="number"
            :placeholder="t('common.max') || 'Max'"
            class="w-full bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-[#FFCD4B] focus:border-transparent transition-all"
            @input="emitChange"
          />
        </div>
      </div>

      <!-- Search Button -->
      <div :class="compact ? '' : 'lg:col-span-2'">
        <button
          @click="handleSearch"
          :disabled="loading"
          class="w-full py-3 bg-[#FFCD4B] hover:bg-[#ffc11a] text-black font-medium uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform active:scale-95"
        >
          <span v-if="loading" class="animate-spin w-4 h-4 border-2 border-black/20 border-t-black rounded-full"></span>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>{{ t('buttons.search') || 'Search' }}</span>
        </button>
      </div>

    </div>
  </div>
</template>
