<template>
  <div
    class="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-amber-200"
  >
    <!-- Project Image -->
    <div class="relative overflow-hidden">
      <img
        v-if="project.main_image"
        :src="getImageUrl(project.main_image)"
        :alt="project.title"
        class="w-full h-40 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div v-else class="w-full h-40 sm:h-48 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
        <svg class="h-12 w-12 sm:h-16 sm:w-16 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      <!-- Status Badge -->
      <div class="absolute top-2 sm:top-3 right-2 sm:right-3">
        <span :class="project.is_active ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'" class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm border">
          <svg v-if="project.is_active" class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          {{ project.is_active ? t('admin.common.active') : t('admin.common.inactive') }}
        </span>
      </div>

      <!-- Featured Badge -->
      <div v-if="project.is_featured" class="absolute top-2 sm:top-3 left-2 sm:left-3">
        <span class="bg-yellow-100 text-yellow-700 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold shadow-sm border border-yellow-200">
          <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {{ t('admin.common.featured') }}
        </span>
      </div>

      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
    </div>

    <!-- Project Content -->
    <div class="p-4 sm:p-6 flex-1 flex flex-col">
      <h2 class="text-base sm:text-xl font-bold mb-2 sm:mb-3 text-slate-900 group-hover:text-amber-600 transition-colors duration-200 break-words">
        {{ project.title }}
      </h2>
      <p class="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 flex-none leading-relaxed line-clamp-3">
        {{ truncate(project.description, 120) }}
      </p>

      <!-- Project Details -->
      <div class="bg-slate-50 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 flex-none space-y-2 sm:space-y-3">
        <div class="grid grid-cols-1 gap-2 sm:gap-3 text-xs sm:text-sm">
          <div>
            <span class="font-medium text-slate-700">{{ t('admin.common.status') }}:</span>
            <div class="mt-1">
              <span :class="getStatusClass(project.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ project.status_name }}
              </span>
            </div>
          </div>
          <div v-if="project.location">
            <span class="font-medium text-slate-700">{{ t('admin.projects.location') }}:</span>
            <div class="text-slate-600 mt-1">{{ project.location }}</div>
          </div>
          <div>
            <span class="font-medium text-slate-700">{{ t('admin.projects.start_date') }}:</span>
            <div class="text-slate-600 mt-1">{{ formatDate(project.created_at) }}</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-auto space-y-2">
        <button @click.stop="$emit('viewDetail', project.id)" class="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:from-amber-600 hover:to-amber-700 text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {{ t('admin.common.details') }}
        </button>
        <button @click.stop="$emit('editZones', project.id)" class="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:from-purple-600 hover:to-indigo-700 text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md">
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          {{ t('admin.zones.building_block') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getImageUrl } from '@/utils/imageUrl'
import { useTranslations } from '@/composables/i18n/useTranslations'

interface ProjectMainImage {
  id: number
  url: string
  alt_text: string | null
  title: string
  sort_order?: number
}

interface Project {
  id: number
  title: string
  description: string
  main_image: ProjectMainImage | null
  is_active: boolean
  is_featured: boolean
  status: string
  status_name: string
  location?: string
  created_at: string
}

defineProps<{
  project: Project
}>()

defineEmits<{
  (e: 'viewDetail', id: number): void
  (e: 'editZones', id: number): void
}>()

const { t } = useTranslations()

const getStatusClass = (status: string) => {
  if (status === 'completed') return 'bg-green-100 text-green-800'
  if (status === 'in_progress') return 'bg-blue-100 text-blue-800'
  return 'bg-yellow-100 text-yellow-800'
}

const truncate = (str: string, len: number) => {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '…' : str
}

const formatDate = (dateString: string) => {
  const dt = new Date(dateString)
  return `${dt.getDate()}/${dt.getMonth() + 1}/${dt.getFullYear()}`
}
</script>
