<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
              >
                ფაილის არჩევა
              </button>
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

        <!-- Image Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> სათაური * </label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="სურათის სათაური"
            />
          </div>

          <!-- Category -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> კატეგორია </label>
            <select
              v-model="form.category"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">კატეგორიის არჩევა</option>
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

          <!-- Project -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> პროექტი </label>
            <input
              v-model="form.project"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="პროექტის სახელი"
            />
          </div>

          <!-- Alt Text -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"> Alt Text </label>
            <input
              v-model="form.alt_text"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="სურათის აღწერა"
            />
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
            :disabled="!selectedFile || uploading"
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

interface FormData {
  title: string
  category: string
  project: string
  alt_text: string
  is_active: boolean
}

const emit = defineEmits<{
  close: []
  uploaded: [image: AdminImage]
}>()

// State
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const isDragOver = ref(false)
const uploading = ref(false)
const error = ref<string | null>(null)

const form = reactive<FormData>({
  title: '',
  category: '',
  project: '',
  alt_text: '',
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

const setFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file'
    return
  }

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  error.value = null

  // Auto-fill title if empty
  if (!form.title) {
    form.title = file.name.replace(/\.[^/.]+$/, '')
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
    formData.append('title', form.title)
    formData.append('category', form.category)
    formData.append('project', form.project)
    formData.append('alt_text', form.alt_text)
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
  form.title = ''
  form.category = ''
  form.project = ''
  form.alt_text = ''
  form.is_active = true
  removeFile()
  error.value = null
}

// Drag and drop handlers
const handleDragEnter = () => {
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}
</script>
