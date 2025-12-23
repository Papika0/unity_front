<template>
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-2xl font-semibold text-gray-900">სურათის რედაქტირება</h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition-colors">
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

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Image Preview -->
        <div class="flex justify-center">
          <div class="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img
              :src="image.url"
              :alt="form.alt_text.ka || form.title.ka"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <!-- Form Fields -->
                <!-- Current Image Preview -->
        <div v-if="props.image.path" class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2"> მიმდინარე სურათი </label>
          <div class="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
            <img
              :src="props.image.path"
              :alt="form.alt_text.ka || form.title.ka"
              class="w-full h-full object-contain"
            />
          </div>
        </div>

        <!-- Form Fields -->
        <div class="space-y-6">
          <!-- Title - Multilingual -->
          <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label class="block text-sm font-medium text-gray-900 mb-3"> 
              სათაური * <span class="text-xs text-gray-500">(ყველა ენა)</span>
            </label>
            
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">🇬🇪 ქართული *</label>
                <input
                  v-model="form.title.ka"
                  type="text"
                  required
                  class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                  placeholder="სურათის სათაური ქართულად"
                />
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">🇬🇧 English</label>
                <input
                  v-model="form.title.en"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                  placeholder="Image title in English"
                />
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">🇷🇺 Русский</label>
                <input
                  v-model="form.title.ru"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                  placeholder="Название изображения на русском"
                />
              </div>
            </div>
          </div>

          <!-- Category -->
          <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label class="block text-sm font-medium text-gray-900 mb-2"> 
              კატეგორია 
            </label>
            <select
              v-model="form.category"
              class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white font-medium text-gray-900"
            >
              <option value="" class="text-gray-500">კატეგორიის არჩევა</option>
              <option value="exterior">ფასადები</option>
              <option value="interior">ინტერიერი</option>
              <option value="landscape">ლანდშაფტი</option>
              <option value="commercial">კომერციული</option>
              <option value="residential">საცხოვრებელი</option>
              <option value="about">ჩვენ შესახებ</option>
              <option value="projects">პროექტები</option>
              <option value="news">სიახლეები</option>
            </select>
          </div>

          <!-- Project - Multilingual -->
          <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <label class="block text-sm font-medium text-gray-900 mb-3"> 
              პროექტი <span class="text-xs text-gray-500">(ყველა ენა)</span>
            </label>
            
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">🇬🇪 ქართული</label>
                <input
                  v-model="form.project.ka"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                  placeholder="პროექტის სახელი ქართულად"
                />
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">🇬🇧 English</label>
                <input
                  v-model="form.project.en"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                  placeholder="Project name in English"
                />
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">🇷🇺 Русский</label>
                <input
                  v-model="form.project.ru"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                  placeholder="Название проекта на русском"
                />
              </div>
            </div>
          </div>

          <!-- Alt Text - Multilingual -->
          <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <label class="block text-sm font-medium text-gray-900 mb-3"> 
              Alt Text <span class="text-xs text-gray-500">(ყველა ენა)</span>
            </label>
            
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">🇬🇪 ქართული</label>
                <textarea
                  v-model="form.alt_text.ka"
                  rows="2"
                  class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white resize-none text-gray-900"
                  placeholder="სურათის აღწერა ქართულად"
                ></textarea>
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">🇬🇧 English</label>
                <textarea
                  v-model="form.alt_text.en"
                  rows="2"
                  class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white resize-none text-gray-900"
                  placeholder="Image description in English"
                ></textarea>
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">🇷🇺 Русский</label>
                <textarea
                  v-model="form.alt_text.ru"
                  rows="2"
                  class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white resize-none text-gray-900"
                  placeholder="Описание изображения на русском"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="flex items-center">
            <input
              v-model="form.is_active"
              type="checkbox"
              class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
            />
            <label class="ml-2 text-sm text-gray-700"> აქტიური სურათი </label>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex">
            <svg
              class="w-5 h-5 text-red-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            @click="$emit('close')"
            class="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            გაუქმება
          </button>
          <button
            type="submit"
            :disabled="updating"
            class="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="updating" class="flex items-center">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              განახლება...
            </span>
            <span v-else>განახლება</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { adminImageApi, type AdminImage } from '@/services/adminImageApi'
import type { MultilingualText } from '@/services/contactApi'

interface Props {
  image: AdminImage
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  updated: [image: AdminImage]
}>()

// State
const updating = ref(false)
const error = ref<string | null>(null)

// Helper to normalize data - convert string to multilingual or use existing multilingual
const normalizeMultilingual = (value: string | null | MultilingualText): MultilingualText => {
  if (!value) {
    return { ka: '', en: '', ru: '' }
  }
  if (typeof value === 'string') {
    return { ka: value, en: '', ru: '' }
  }
  return value
}

const form = reactive({
  title: normalizeMultilingual(props.image.title),
  category: props.image.category || '',
  project: normalizeMultilingual(props.image.project),
  alt_text: normalizeMultilingual(props.image.alt_text),
  is_active: props.image.is_active,
})

// Watch for prop changes
watch(
  () => props.image,
  (newImage) => {
    form.title = normalizeMultilingual(newImage.title)
    form.category = newImage.category || ''
    form.project = normalizeMultilingual(newImage.project)
    form.alt_text = normalizeMultilingual(newImage.alt_text)
    form.is_active = newImage.is_active
  },
  { deep: true },
)

const handleSubmit = async () => {
  try {
    updating.value = true
    error.value = null

    const formData = new FormData()
    
    // Add multilingual fields
    formData.append('title[ka]', form.title.ka)
    formData.append('title[en]', form.title.en)
    formData.append('title[ru]', form.title.ru)
    
    formData.append('project[ka]', form.project.ka)
    formData.append('project[en]', form.project.en)
    formData.append('project[ru]', form.project.ru)
    
    formData.append('alt_text[ka]', form.alt_text.ka)
    formData.append('alt_text[en]', form.alt_text.en)
    formData.append('alt_text[ru]', form.alt_text.ru)
    
    // Add other fields
    if (form.category) {
      formData.append('category', form.category)
    }
    formData.append('is_active', form.is_active ? '1' : '0')
    formData.append('_method', 'PUT')

    const response = await adminImageApi.updateImage(props.image.id, formData)

    if (response.success) {
      emit('updated', response.data)
    } else {
      error.value = response.message || 'Update failed'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Update failed'
  } finally {
    updating.value = false
  }
}
</script>
