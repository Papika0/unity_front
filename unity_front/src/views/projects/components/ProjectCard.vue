<script setup lang="ts">
import type { ProjectApiResponse } from '@/services/projectsApi'
import { useTranslations } from '@/composables/i18n/useTranslations'

defineProps<{
  project: ProjectApiResponse
  index: number
  isVisible: boolean
  isTransitioning: boolean
  getStatusColor: (status: string) => string
  getStatusText: (status: string) => string
}>()

const { t } = useTranslations()
</script>

<template>
  <div
    class="group bg-white overflow-hidden hover:shadow-2xl transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] border border-zinc-100 hover:border-[#FFCD4B]/30"
    :class="{
      'opacity-100 translate-y-0 scale-100 blur-0': isVisible && !isTransitioning,
      'opacity-0 translate-y-12 scale-95 blur-sm': !isVisible || isTransitioning,
    }"
    :style="{ transitionDelay: isTransitioning ? '0ms' : `${index * 80}ms` }"
  >
    <!-- Project Image -->
    <div class="relative h-72 bg-zinc-100 overflow-hidden">
      <img
        v-if="project.main_image"
        :src="project.main_image.url"
        :alt="project.main_image.alt_text || project.title"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <svg class="w-16 h-16 text-zinc-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
        </svg>
      </div>

      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <!-- Golden accent line -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

      <!-- Status badge -->
      <div class="absolute top-4 left-4 flex gap-2">
        <span
          class="px-3 py-1 text-xs font-light uppercase tracking-wider backdrop-blur-sm"
          :class="getStatusColor(project.status)"
        >
          {{ getStatusText(project.status) }}
        </span>
      </div>

      <!-- Year badge -->
      <div class="absolute top-4 right-4">
        <span class="px-3 py-1 text-xs font-light bg-white/90 text-zinc-900 backdrop-blur-sm">
          {{ project.year }}
        </span>
      </div>
    </div>

    <!-- Project Content -->
    <div class="p-6 bg-white relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <h3 class="text-lg font-light text-zinc-900 mb-3 line-clamp-1 relative z-10 group-hover:text-[#C89116] transition-colors duration-300">
        {{ project.title }}
      </h3>

      <div class="flex items-center gap-2 mb-5 text-zinc-500 relative z-10">
        <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
        </svg>
        <span class="text-sm font-light line-clamp-1">{{ project.location }}</span>
      </div>

      <router-link
        :to="{ name: 'project-detail', params: { id: project.id } }"
        class="block w-full bg-gradient-to-b from-[#FFCD4B] via-[#EBB738] to-[#C89116] text-black py-3 text-center text-sm uppercase tracking-wider font-light hover:opacity-90 transition-all duration-300 relative z-10 group-hover:shadow-lg transform group-hover:-translate-y-0.5"
      >
        {{ t('projects.details') }}
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
