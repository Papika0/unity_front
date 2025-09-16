<template>
  <div class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-2xl font-semibold text-gray-900">{{ image.title }}</h2>
        <div class="flex items-center space-x-3">
          <button
            @click="$emit('edit', image)"
            class="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="Edit"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Image -->
          <div class="space-y-4">
            <div class="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                :src="image.url"
                :alt="image.alt_text || image.title"
                class="w-full h-full object-cover"
              />
            </div>

            <!-- Image Actions -->
            <div class="flex space-x-3">
              <button
                @click="downloadImage"
                class="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                ჩამოტვირთვა
              </button>
              <button
                @click="copyImageUrl"
                class="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                URL-ის კოპირება
              </button>
            </div>
          </div>

          <!-- Details -->
          <div class="space-y-6">
            <!-- Basic Info -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">სურათის ინფორმაცია</h3>
              <div class="space-y-3">
                <div class="flex items-center">
                  <span class="w-24 text-sm font-medium text-gray-500">ID:</span>
                  <span class="text-sm text-gray-900">{{ image.id }}</span>
                </div>
                <div class="flex items-center">
                  <span class="w-24 text-sm font-medium text-gray-500">სტატუსი:</span>
                  <span
                    :class="
                      image.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    "
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ image.is_active ? 'აქტიური' : 'არააქტიური' }}
                  </span>
                </div>
                <div class="flex items-center">
                  <span class="w-24 text-sm font-medium text-gray-500">კატეგორია:</span>
                  <span class="text-sm text-gray-900">{{
                    getCategoryLabel(image.category) || 'არ არის'
                  }}</span>
                </div>
                <div class="flex items-center">
                  <span class="w-24 text-sm font-medium text-gray-500">პროექტი:</span>
                  <span class="text-sm text-gray-900">{{ image.project || 'არ არის' }}</span>
                </div>
                <div class="flex items-center">
                  <span class="w-24 text-sm font-medium text-gray-500">შექმნა:</span>
                  <span class="text-sm text-gray-900">{{ formatDate(image.created_at) }}</span>
                </div>
                <div class="flex items-center">
                  <span class="w-24 text-sm font-medium text-gray-500">განახლება:</span>
                  <span class="text-sm text-gray-900">{{ formatDate(image.updated_at) }}</span>
                </div>
              </div>
            </div>

            <!-- Alt Text -->
            <div v-if="image.alt_text">
              <h3 class="text-lg font-semibold text-gray-900 mb-2">Alt Text</h3>
              <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{{ image.alt_text }}</p>
            </div>

            <!-- URL -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">სურათის URL</h3>
              <div class="flex items-center space-x-2">
                <input
                  :value="image.url"
                  readonly
                  class="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg font-mono"
                />
                <button
                  @click="copyImageUrl"
                  class="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  title="Copy URL"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="pt-4 border-t border-gray-200">
              <div class="flex space-x-3">
                <button
                  @click="$emit('edit', image)"
                  class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  რედაქტირება
                </button>
                <button
                  @click="confirmDelete"
                  class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  წაშლა
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { AdminImage } from '@/services/adminImageApi'

interface Props {
  image: AdminImage
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  edit: [image: AdminImage]
  delete: [image: AdminImage]
}>()

const showDeleteConfirm = ref(false)

const getCategoryLabel = (category: string | null): string => {
  if (!category) return ''

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
  return new Date(dateString).toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const downloadImage = async () => {
  try {
    const response = await fetch(props.image.url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = props.image.title || 'image'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Failed to download image:', error)
  }
}

const copyImageUrl = async () => {
  try {
    await navigator.clipboard.writeText(props.image.url)
    // You could add a toast notification here
  } catch (error) {
    console.error('Failed to copy URL:', error)
  }
}

const confirmDelete = () => {
  if (confirm(`Are you sure you want to delete "${props.image.title}"?`)) {
    emit('delete', props.image)
  }
}
</script>
