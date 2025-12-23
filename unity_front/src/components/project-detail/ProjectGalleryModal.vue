<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
      @click="$emit('close')"
    >
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-6 right-6 z-10 text-white hover:text-[#FFCD4B] transition-colors"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Navigation Arrows -->
      <button
        v-if="project?.gallery_images && project.gallery_images.length > 1"
        @click.stop="$emit('prev')"
        class="absolute left-6 top-1/2 -translate-y-1/2 z-10 text-white hover:text-[#FFCD4B] transition-colors"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        v-if="project?.gallery_images && project.gallery_images.length > 1"
        @click.stop="$emit('next')"
        class="absolute right-6 top-1/2 -translate-y-1/2 z-10 text-white hover:text-[#FFCD4B] transition-colors"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      <!-- Main Image -->
      <div class="max-w-7xl max-h-[90vh] mx-auto px-16" @click.stop>
        <img
          v-if="project?.gallery_images && project.gallery_images[selectedImageIndex]"
          :src="project.gallery_images[selectedImageIndex].url"
          :alt="project.gallery_images[selectedImageIndex].alt_text || project.title"
          class="max-w-full max-h-full object-contain"
        />
        <img
          v-else-if="project?.main_image"
          :src="project.main_image.url"
          :alt="project.main_image.alt_text || project.title"
          class="max-w-full max-h-full object-contain"
        />
      </div>

      <!-- Image Counter -->
      <div
        v-if="project?.gallery_images && project.gallery_images.length > 1"
        class="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-lg font-light"
      >
        {{ selectedImageIndex + 1 }} / {{ project.gallery_images.length }}
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ProjectApiResponse } from '@/services/projectsApi'

defineProps<{
  show: boolean
  project: ProjectApiResponse
  selectedImageIndex: number
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'prev'): void
  (e: 'next'): void
}>()
</script>
