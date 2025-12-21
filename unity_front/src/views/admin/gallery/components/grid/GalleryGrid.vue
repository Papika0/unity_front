<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-16">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"
        ></div>
        <p class="text-gray-600">{{ t('admin.gallery.loading_images') }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-16">
      <div class="text-red-500 text-6xl mb-4">⚠️</div>
      <h2 class="text-2xl font-semibold text-gray-800 mb-2">{{ t('admin.gallery.error_loading') }}</h2>
      <p class="text-gray-600 mb-4">{{ error }}</p>
      <button
        @click="$emit('refresh')"
        class="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
      >
        {{ t('admin.common.retry') }}
      </button>
    </div>

    <!-- Images Grid -->
    <div
      v-else-if="images.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <GalleryCard
        v-for="image in images"
        :key="image.id"
        :image="image"
        @view="$emit('view', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <div class="text-gray-400 text-6xl mb-4">📷</div>
      <h2 class="text-2xl font-semibold text-gray-800 mb-2">{{ t('admin.gallery.no_images') }}</h2>
      <p class="text-gray-600 mb-4">
        {{
          hasFilters
            ? t('admin.gallery.no_images_filter')
            : t('admin.gallery.no_images_yet')
        }}
      </p>
      <button
        v-if="hasFilters"
        @click="$emit('clearFilters')"
        class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors mr-4"
      >
        {{ t('admin.gallery.clear_filters') }}
      </button>
      <button
        @click="$emit('openUpload')"
        class="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
      >
        {{ t('admin.gallery.upload_first') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GalleryImage } from '../../composables/useGalleryList'
import GalleryCard from './GalleryCard.vue'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()

defineProps<{
  images: GalleryImage[]
  loading: boolean
  error: string | null
  hasFilters: boolean
}>()

defineEmits<{
  (e: 'refresh'): void
  (e: 'clearFilters'): void
  (e: 'openUpload'): void
  (e: 'view', image: GalleryImage): void
  (e: 'edit', image: GalleryImage): void
  (e: 'delete', image: GalleryImage): void
}>()
</script>
