<template>
  <div
    ref="element"
    class="bg-white overflow-hidden hover:shadow-2xl transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] border border-zinc-100 hover:border-[#FFCD4B]/30"
    :class="{
      'opacity-100 translate-y-0 scale-100 blur-0': isVisible,
      'opacity-0 translate-y-12 scale-95 blur-sm': !isVisible,
    }"
  >
    <!-- Main Image -->
    <div
      class="aspect-[4/3] bg-zinc-100 relative overflow-hidden group cursor-pointer"
      @click="$emit('openFullscreen')"
    >
      <img
        v-if="project.gallery_images && project.gallery_images[selectedImageIndex]"
        :src="project.gallery_images[selectedImageIndex].url"
        :alt="project.gallery_images[selectedImageIndex].alt_text || project.title"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
      />
      <img
        v-else-if="project.main_image"
        :src="project.main_image.url"
        :alt="project.main_image.alt_text || project.title"
        class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
      />

      <!-- Gradient overlay on hover -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      ></div>

      <!-- Golden accent line on hover -->
      <div
        class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
      ></div>

      <!-- Image Counter -->
      <div
        v-if="project.gallery_images && project.gallery_images.length > 1"
        class="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-light"
      >
        {{ selectedImageIndex + 1 }} / {{ project.gallery_images.length }}
      </div>

      <!-- Fullscreen Icon -->
      <div
        class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center"
      >
        <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <svg
            class="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
        </div>
      </div>
    </div>

    <!-- Thumbnail Gallery -->
    <div
      v-if="project.gallery_images && project.gallery_images.length > 1"
      class="p-4 bg-zinc-50"
    >
      <div class="grid grid-cols-6 gap-2">
        <button
          v-for="(image, index) in project.gallery_images"
          :key="index"
          @click="$emit('selectImage', index)"
          class="aspect-square overflow-hidden transition-all duration-300 focus:outline-none hover:shadow-lg"
          :class="
            selectedImageIndex === index
              ? 'ring-2 ring-[#FFCD4B] ring-offset-2 scale-95'
              : 'hover:ring-2 hover:ring-[#FFCD4B]/50 hover:ring-offset-1 opacity-70 hover:opacity-100'
          "
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <img
            :src="image.url"
            :alt="image.alt_text || `${project.title} ${index + 1}`"
            class="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'
import type { ProjectApiResponse } from '@/services/projectsApi'

defineProps<{
  project: ProjectApiResponse
  selectedImageIndex: number
}>()

defineEmits<{
  (e: 'selectImage', index: number): void
  (e: 'openFullscreen'): void
}>()

const { element, isVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })
</script>
