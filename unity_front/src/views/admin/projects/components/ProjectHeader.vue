<script setup lang="ts">
import type { Project } from '@/types'
import { useTranslations } from '@/composables/useTranslations'

defineProps<{
  project: Project
}>()

const { t } = useTranslations()
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold text-slate-900 mb-4 leading-tight">{{ project.title }}</h1>
    <div class="flex flex-wrap gap-3 mb-6">
      <span
        v-if="project.is_featured"
        class="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm border border-yellow-200"
      >
        <svg class="w-4 h-4 mr-1.5 inline" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
        </svg>
        {{ t('admin.common.featured') }}
      </span>
      <span
        :class="
          project.status === 'completed'
            ? 'bg-green-100 text-green-800 border-green-200'
            : project.status === 'in_progress'
              ? 'bg-blue-100 text-blue-800 border-blue-200'
              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
        "
        class="px-4 py-2 rounded-full text-sm font-semibold shadow-sm border"
      >
        {{ project.status_name }}
      </span>
      <span
        v-if="!project.is_active"
        class="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm border border-red-200"
      >
        {{ t('admin.common.inactive') }}
      </span>
    </div>
  </div>
</template>
