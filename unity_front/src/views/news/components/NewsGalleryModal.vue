<script setup lang="ts">
import type { ImageData } from '@/types/common'
import { useTranslations } from '@/composables/useTranslations'

defineProps<{
  images: ImageData[]
  currentIndex: number
  articleTitle: string
}>()

const emit = defineEmits<{
  close: []
  next: []
  prev: []
}>()

const { t } = useTranslations()
</script>

<template>
  <Teleport to="body">
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
        @click="emit('close')"
      >
        <!-- Close Button -->
        <button
          class="absolute top-6 right-6 z-20 text-white hover:text-[#FFCD4B] transition-colors"
          @click="emit('close')"
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

        <!-- Previous Button -->
        <button
          v-if="images.length > 1"
          class="absolute left-6 top-1/2 -translate-y-1/2 z-20 text-white hover:text-[#FFCD4B] transition-colors"
          @click.stop="emit('prev')"
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

        <!-- Image -->
        <div class="max-w-7xl max-h-[90vh] px-16" @click.stop>
          <img
            :src="images[currentIndex].url"
            :alt="images[currentIndex].alt_text || `${articleTitle} - ${t('news.gallery.image')} ${currentIndex + 1}`"
            class="max-w-full max-h-[90vh] object-contain"
          />
          <p class="text-white text-center mt-4 font-light">
            {{ currentIndex + 1 }} / {{ images.length }}
          </p>
        </div>

        <!-- Next Button -->
        <button
          v-if="images.length > 1"
          class="absolute right-6 top-1/2 -translate-y-1/2 z-20 text-white hover:text-[#FFCD4B] transition-colors"
          @click.stop="emit('next')"
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
      </div>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
