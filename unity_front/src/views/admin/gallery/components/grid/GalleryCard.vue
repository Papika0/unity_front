<template>
  <div
    class="group bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300"
  >
    <!-- Image -->
    <div class="aspect-square relative overflow-hidden">
      <img
        :src="image.url"
        :alt="getGeorgianText(image.alt_text) || getGeorgianText(image.title)"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      <!-- Overlay Actions -->
      <div
        class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center"
      >
        <div
          class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <button
            @click="$emit('view', image)"
            class="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            title="View"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </button>
          <button
            @click="$emit('edit', image)"
            class="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            title="Edit"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            @click="$emit('delete', image)"
            class="p-2 bg-red-500 bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
            title="Delete"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Status Badge -->
      <div class="absolute top-3 right-3">
        <span
          :class="image.is_active ? 'bg-green-500' : 'bg-red-500'"
          class="px-2 py-1 text-xs font-medium text-white rounded-full"
        >
          {{ image.is_active ? 'აქტიური' : 'არააქტიური' }}
        </span>
      </div>
    </div>

    <!-- Image Info -->
    <div class="p-4">
      <h3 class="font-semibold text-gray-900 mb-2 truncate">{{ getGeorgianText(image.title) }}</h3>
      <div class="space-y-1 text-sm text-gray-600">
        <div v-if="getGeorgianText(image.project)" class="flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          {{ getGeorgianText(image.project) }}
        </div>
        <div v-if="image.category" class="flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          {{ getCategoryLabel(image.category) }}
        </div>
        <div class="text-xs text-gray-500">
          {{ formatDate(image.created_at) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GalleryImage } from '../../composables/useGalleryList'
import type { MultilingualText } from '@/services/contactApi'

defineProps<{
  image: GalleryImage
}>()

defineEmits<{
  (e: 'view', image: GalleryImage): void
  (e: 'edit', image: GalleryImage): void
  (e: 'delete', image: GalleryImage): void
}>()

const getGeorgianText = (value: string | null | MultilingualText): string => {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.ka || ''
}

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    exterior: 'ფასადები',
    interior: 'ინტერიერი',
    landscape: 'ლანდშაფტი',
    commercial: 'კომერციული',
    residential: 'საცხოვრებელი',
    about: 'ჩვენ შესახებ',
    projects: 'პროექტები',
    news: 'სიახლეები',
  }
  return labels[category] || category
}

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ka-GE')
}
</script>
