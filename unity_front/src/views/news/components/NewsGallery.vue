<script setup lang="ts">
import type { ImageData } from '@/types/common'
import { useTranslations } from '@/composables/i18n/useTranslations'

defineProps<{
  images: ImageData[]
  articleTitle: string
  isVisible: boolean
}>()

const emit = defineEmits<{
  openGallery: [index: number]
}>()

const { t } = useTranslations()
</script>

<template>
  <div v-if="images && images.length > 0" class="mb-12">
    <h3 class="text-2xl font-light text-zinc-900 mb-4 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
      :class="{
        'opacity-100 translate-y-0': isVisible,
        'opacity-0 translate-y-8': !isVisible,
      }"
    >
      {{ t('news.gallery.title') }}
    </h3>
    <div class="w-20 h-0.5 bg-[#FFCD4B] mb-8 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100 origin-left"
      :class="{
        'scale-x-100': isVisible,
        'scale-x-0': !isVisible,
      }"
    ></div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="group relative overflow-hidden border border-zinc-100 hover:border-[#FFCD4B]/30 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
        :class="{
          'opacity-100 translate-y-0 scale-100': isVisible,
          'opacity-0 translate-y-12 scale-95': !isVisible,
        }"
        :style="{ transitionDelay: `${200 + index * 80}ms` }"
        @click="emit('openGallery', index)"
      >
        <img
          :src="image.url"
          :alt="image.alt_text || `${articleTitle || ''} - ${t('news.gallery.image')} ${index + 1}`"
          class="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
        />
        <!-- Gradient overlay on hover -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        ></div>
        <!-- Golden accent line on hover -->
        <div
          class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
        ></div>
      </div>
    </div>
  </div>
</template>
