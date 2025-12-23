<template>
  <div
    ref="element"
    class="bg-white p-8 hover:shadow-2xl transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] border border-zinc-100 hover:border-[#FFCD4B]/30 relative overflow-hidden"
    :class="{
      'opacity-100 translate-y-0 scale-100 blur-0': isVisible,
      'opacity-0 translate-y-12 scale-95 blur-sm': !isVisible,
    }"
    style="transition-delay: 100ms"
  >
    <!-- Subtle background accent -->
    <div
      class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
    ></div>

    <h3 class="text-2xl font-light text-zinc-900 mb-6">
      {{ t('projects.details.title') }}
    </h3>

    <div class="space-y-5">
      <!-- Status -->
      <div class="flex items-center justify-between p-4 bg-zinc-50 transition-colors">
        <span class="font-light text-zinc-700">{{ t('projects.details.status') }}</span>
        <span
          class="px-4 py-1.5 text-white text-sm font-light"
          :class="statusColor"
        >
          {{ statusText }}
        </span>
      </div>

      <!-- Location -->
      <div
        class="flex items-start justify-between p-4 hover:bg-zinc-50 transition-colors"
      >
        <span class="font-light text-zinc-700">{{ t('projects.details.location') }}</span>
        <span class="text-zinc-900 font-light text-right max-w-[200px]">{{
          project.location
        }}</span>
      </div>

      <!-- Start Date -->
      <div
        v-if="project.start_date"
        class="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors"
      >
        <span class="font-light text-zinc-700">{{ t('projects.details.start_date') }}</span>
        <span class="text-zinc-900 font-light">{{ formatDate(project.start_date) }}</span>
      </div>

      <!-- Completion Date -->
      <div
        v-if="project.completion_date"
        class="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors"
      >
        <span class="font-light text-zinc-700">{{
          t('projects.details.completion_date')
        }}</span>
        <span class="text-zinc-900 font-light">{{ formatDate(project.completion_date) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'
import { useTranslations } from '@/composables/i18n/useTranslations'
import type { ProjectApiResponse } from '@/services/projectsApi'
import { formatDate } from '@/utils/formatters'

const { t } = useTranslations()

defineProps<{
  project: ProjectApiResponse
  statusText: string
  statusColor: string
}>()

const { element, isVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })
</script>
