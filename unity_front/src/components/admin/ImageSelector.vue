<template>
  <div class="space-y-4">
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div
      class="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-indigo-400 transition-colors"
    >
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-6">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
        <p class="mt-2 text-sm text-gray-500">სურათის ჩატვირთვა...</p>
      </div>

      <!-- Current Image Display -->
      <div v-else-if="selectedImage" class="space-y-3">
        <div class="flex items-center space-x-4">
          <img
            :src="selectedImage.url"
            :alt="selectedImage.alt_text || selectedImage.title"
            class="w-24 h-24 object-cover rounded-lg shadow-md border border-gray-200"
          />
          <div class="flex-1">
            <h4 class="text-sm font-medium text-gray-900">{{ selectedImage.title }}</h4>
            <p v-if="selectedImage.alt_text" class="text-xs text-gray-500">
              {{ selectedImage.alt_text }}
            </p>
            <div class="flex space-x-2 mt-2">
              <button
                type="button"
                @click="openGalleryModal"
                class="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors"
              >
                სურათის შეცვლა
              </button>
              <button
                type="button"
                @click="removeImage"
                class="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 transition-colors"
              >
                წაშლა
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-6">
        <svg
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">სურათი არ არის არჩეული</h3>
        <p class="mt-1 text-sm text-gray-500">აირჩიეთ სურათი გალერეიდან ან ატვირთეთ ახალი</p>
        <div class="mt-4 flex justify-center space-x-3">
          <button
            type="button"
            @click="openGalleryModal"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            გალერეიდან არჩევა
          </button>
          <button
            type="button"
            @click="openUploadModal"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            ახალი სურათი
          </button>
        </div>
      </div>
    </div>

    <p v-if="helpText" class="text-xs text-gray-500">{{ helpText }}</p>

    <!-- Gallery Selection Modal -->
    <ImageGalleryModal
      v-if="showGalleryModal"
      :category="category"
      @close="closeGalleryModal"
      @select="handleImageSelect"
    />

    <!-- Upload Modal -->
    <ImageUploadModal
      v-if="showUploadModal"
      :category="category"
      @close="closeUploadModal"
      @uploaded="handleImageUploaded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { adminImageApi, type AdminImage } from '@/services/adminImageApi'
import ImageGalleryModal from './gallery/ImageGalleryModal.vue'
import ImageUploadModal from './gallery/ImageUploadModal.vue'

interface Props {
  modelValue?: number | null
  imageData?: { id: number; url: string; title?: string; alt_text?: string } | null
  label?: string
  helpText?: string
  category?: string
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  imageData: null,
  category: 'about',
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const selectedImage = ref<AdminImage | null>(null)
const showGalleryModal = ref(false)
const showUploadModal = ref(false)
const loading = ref(false)

// Use provided image data or fallback to API call
watch(
  [() => props.modelValue, () => props.imageData],
  async ([newValue, newImageData]) => {
    if (newValue) {
      // If image data is provided, use it directly
      if (newImageData && newImageData.id === newValue) {
        selectedImage.value = {
          id: newImageData.id,
          url: newImageData.url,
          title: newImageData.title || `Image ${newImageData.id}`,
          alt_text: newImageData.alt_text || null,
          category: props.category,
          is_active: true,
          created_at: '',
          updated_at: '',
        } as AdminImage
        return
      }

      // Fallback to API call if no image data provided
      if (newValue !== selectedImage.value?.id) {
        try {
          loading.value = true
          const response = await adminImageApi.getImage(newValue)
          if (response.success) {
            selectedImage.value = response.data
          }
        } catch (error) {
          console.error('Failed to load image:', error)
          selectedImage.value = null
        } finally {
          loading.value = false
        }
      }
    } else {
      selectedImage.value = null
    }
  },
  { immediate: true },
)

// Modal control methods
const openGalleryModal = () => {
  showGalleryModal.value = true
}

const closeGalleryModal = () => {
  showGalleryModal.value = false
}

const openUploadModal = () => {
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
}

// Image selection handlers
const handleImageSelect = (image: AdminImage) => {
  selectedImage.value = image
  emit('update:modelValue', image.id)
  closeGalleryModal()
}

const handleImageUploaded = (image: AdminImage) => {
  selectedImage.value = image
  emit('update:modelValue', image.id)
  closeUploadModal()
}

const removeImage = () => {
  selectedImage.value = null
  emit('update:modelValue', null)
}
</script>
