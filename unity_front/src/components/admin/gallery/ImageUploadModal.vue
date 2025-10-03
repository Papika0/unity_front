<template>
  <div 
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-2xl font-semibold text-gray-900">ახალი სურათის ატვირთვა</h2>
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
        <!-- File Upload -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2"> სურათის ფაილი * </label>
          <div
            @drop="handleDrop"
            @dragover.prevent
            @dragenter.prevent
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors"
            :class="{ 'border-purple-400 bg-purple-50': isDragOver }"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleFileSelect"
              class="hidden"
            />

            <div v-if="!selectedFile" class="space-y-4">
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
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div>
                <p class="text-lg font-medium text-gray-900">ატვირთეთ სურათი</p>
                <p class="text-sm text-gray-500">გადაათრიეთ ფაილი აქ ან დააწკაპუნეთ ასარჩევად</p>
              </div>
              <button
                type="button"
                @click="() => ($refs.fileInput as HTMLInputElement)?.click()"
                class="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                :disabled="compressing"
              >
                ფაილის არჩევა
              </button>
            </div>

            <!-- Compressing State -->
            <div v-else-if="compressing" class="space-y-4">
              <div class="flex flex-col items-center justify-center py-8">
                <svg
                  class="animate-spin h-12 w-12 text-purple-500 mb-4"
                  xmlns="http://www.w3.org/2000/svg"
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
                <p class="text-lg font-medium text-gray-900">სურათის შეკუმშვა...</p>
                <p class="text-sm text-gray-500">გთხოვთ დაელოდოთ</p>
              </div>
            </div>

            <div v-else class="space-y-4">
              <img
                :src="previewUrl || ''"
                :alt="selectedFile.name"
                class="mx-auto h-32 w-32 object-cover rounded-lg"
              />
              <div>
                <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
                <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                
                <!-- Compression Stats -->
                <div v-if="compressionStats && compressionStats.compressionRatio < 1" class="mt-2 text-xs text-green-600">
                  <p>✓ შეკუმშული: {{ formatFileSize(compressionStats.originalSize) }} → {{ formatFileSize(compressionStats.compressedSize) }}</p>
                  <p>დაზოგილია: {{ formatFileSize(compressionStats.originalSize - compressionStats.compressedSize) }} ({{ ((1 - compressionStats.compressionRatio) * 100).toFixed(1) }}%)</p>
                </div>
              </div>
              <button
                type="button"
                @click="removeFile"
                class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                ფაილის წაშლა
              </button>
            </div>
          </div>
        </div>

        <!-- Image Details (only in full mode) -->
        <div v-if="!simpleMode" class="space-y-6">
          <!-- Title (Multilingual) -->
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
                  :required="!simpleMode"
                  class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                  placeholder="სათაური ქართულად"
                />
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">🇬🇧 English</label>
                <input
                  v-model="form.title.en"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                  placeholder="Title in English"
                />
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">🇷🇺 Русский</label>
                <input
                  v-model="form.title.ru"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                  placeholder="Название на русском"
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

          <!-- Project (Multilingual) -->
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

          <!-- Alt Text (Multilingual) -->
          <div class="bg-green-50 p-4 rounded-lg border border-green-200">
            <label class="block text-sm font-medium text-gray-900 mb-3"> 
              Alt Text <span class="text-xs text-gray-500">(ყველა ენა)</span>
            </label>
            
            <div class="space-y-3">
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">🇬🇪 ქართული</label>
                <input
                  v-model="form.alt_text.ka"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                  placeholder="სურათის აღწერა ქართულად"
                />
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">🇬🇧 English</label>
                <input
                  v-model="form.alt_text.en"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                  placeholder="Image description in English"
                />
              </div>
              
              <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">🇷🇺 Русский</label>
                <input
                  v-model="form.alt_text.ru"
                  type="text"
                  class="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
                  placeholder="Описание изображения на русском"
                />
              </div>
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
            :disabled="!selectedFile || uploading || compressing"
            class="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="uploading" class="flex items-center">
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
              ატვირთვა...
            </span>
            <span v-else-if="compressing">შეკუმშვა...</span>
            <span v-else>ატვირთვა</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { adminImageApi, type AdminImage } from '@/services/adminImageApi'
import { compressImage, type CompressionResult } from '@/utils/imageCompression'

interface MultilingualText {
  ka: string
  en: string
  ru: string
}

interface FormData {
  title: MultilingualText
  category: string
  project: MultilingualText
  alt_text: MultilingualText
  is_active: boolean
}

interface Props {
  simpleMode?: boolean // If true, only shows file upload without metadata fields
}

const { simpleMode = false } = defineProps<Props>()

const emit = defineEmits<{
  close: []
  uploaded: [image: AdminImage]
}>()

// State
const selectedFile = ref<File | null>(null)
const originalFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const isDragOver = ref(false)
const uploading = ref(false)
const compressing = ref(false)
const error = ref<string | null>(null)
const compressionStats = ref<CompressionResult | null>(null)

const form = reactive<FormData>({
  title: { ka: '', en: '', ru: '' },
  category: '',
  project: { ka: '', en: '', ru: '' },
  alt_text: { ka: '', en: '', ru: '' },
  is_active: true,
})

// Methods
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    setFile(file)
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer?.files
  if (files && files[0]) {
    setFile(files[0])
  }
}

const setFile = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file'
    return
  }

  originalFile.value = file
  error.value = null
  compressing.value = true

  try {
    // Compress the image using the about preset (high quality)
    const result = await compressImage(file, {
      imageType: 'gallery', // Use gallery preset for admin uploads
      onProgress: (progress) => {
        console.log(`Compression progress: ${progress}%`)
      },
    })

    selectedFile.value = result.file
    compressionStats.value = result
    previewUrl.value = URL.createObjectURL(result.file)

 

    // Auto-fill title if empty
    if (!form.title.ka) {
      const filename = file.name.replace(/\.[^/.]+$/, '')
      form.title.ka = filename
    }
  } catch (err) {
    console.error('Compression failed:', err)
    // Fall back to original file if compression fails
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    error.value = 'Image compression failed, using original file'
    
    // Auto-fill title even on error
    if (!form.title.ka) {
      const filename = file.name.replace(/\.[^/.]+$/, '')
      form.title.ka = filename
    }
  } finally {
    compressing.value = false
  }
}

const removeFile = () => {
  selectedFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleSubmit = async () => {
  if (!selectedFile.value) return

  try {
    uploading.value = true
    error.value = null

    const formData = new FormData()
    formData.append('image', selectedFile.value)
    
    // In simple mode, use filename as default title
    const titleKa = simpleMode ? (form.title.ka || selectedFile.value.name.replace(/\.[^/.]+$/, '')) : form.title.ka
    formData.append('title[ka]', titleKa)
    formData.append('title[en]', form.title.en)
    formData.append('title[ru]', form.title.ru)
    formData.append('category', form.category)
    formData.append('project[ka]', form.project.ka)
    formData.append('project[en]', form.project.en)
    formData.append('project[ru]', form.project.ru)
    formData.append('alt_text[ka]', form.alt_text.ka)
    formData.append('alt_text[en]', form.alt_text.en)
    formData.append('alt_text[ru]', form.alt_text.ru)
    formData.append('is_active', form.is_active ? '1' : '0')

    const response = await adminImageApi.uploadImage(formData)

    if (response.success) {
      emit('uploaded', response.data)
      resetForm()
    } else {
      error.value = response.message || 'Upload failed'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Upload failed'
  } finally {
    uploading.value = false
  }
}

const resetForm = () => {
  form.title = { ka: '', en: '', ru: '' }
  form.category = ''
  form.project = { ka: '', en: '', ru: '' }
  form.alt_text = { ka: '', en: '', ru: '' }
  form.is_active = true
  removeFile()
  error.value = null
}
</script>
