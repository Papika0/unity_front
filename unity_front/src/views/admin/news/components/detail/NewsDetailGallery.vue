<template>
  <div class="space-y-8">
    <!-- Main Image -->
    <div v-if="article.main_image" class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div class="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
        <h2 class="text-xl font-semibold text-white">{{ t('admin.news.main_image') }}</h2>
      </div>
      <div class="p-6">
        <img
          :src="getImageUrl(article.main_image)"
          :alt="article.title.ka || article.title.en"
          class="w-full max-h-96 object-cover rounded-xl"
        />
      </div>
    </div>

    <!-- Gallery Images -->
    <div
      v-if="article.gallery_images && article.gallery_images.length"
      class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
    >
      <div class="bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-4">
        <h2 class="text-xl font-semibold text-white">{{ t('admin.news.gallery_images') }}</h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div
            v-for="(image, index) in article.gallery_images"
            :key="index"
            class="group cursor-pointer"
            @click="$emit('open-image', image)"
          >
            <img
              :src="getImageUrl(image)"
              :alt="`Gallery image ${index + 1}`"
              class="w-full h-32 object-cover rounded-lg group-hover:shadow-lg transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslations } from '@/composables/i18n/useTranslations'
import type { AdminNewsArticle, ImageData } from '@/types'

defineProps<{
  article: AdminNewsArticle
}>()

defineEmits<{
  'open-image': [image: string | ImageData]
}>()

const { t } = useTranslations()
const backendUrl = import.meta.env.VITE_BACKEND_URL || ''

function getImageUrl(imagePath: string | ImageData | null): string {
  if (!imagePath) return ''
  
  if (typeof imagePath === 'object' && imagePath !== null && 'url' in imagePath) {
    return (imagePath as ImageData).url
  }
  
  if (typeof imagePath === 'string') {
    return imagePath.startsWith('http') ? imagePath : backendUrl + imagePath
  }
  
  return ''
}
</script>
