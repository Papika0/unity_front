<script setup lang="ts">
import type { Project } from '@/types'

defineProps<{
  project: Project
}>()
</script>

<template>
  <div class="relative h-80 overflow-hidden">
    <img
      v-if="project.main_image"
      :src="typeof project.main_image === 'string' ? project.main_image : project.main_image.url"
      :alt="typeof project.main_image === 'string' ? project.title : project.main_image.alt_text || project.title"
      class="w-full h-full object-cover"
    />
    <div
      v-else
      class="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center"
    >
      <svg class="h-24 w-24 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
    <!-- Overlay gradient -->
    <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
  </div>
</template>
