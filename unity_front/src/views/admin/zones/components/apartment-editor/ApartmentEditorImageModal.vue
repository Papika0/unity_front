<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in">
      <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-emerald-100 rounded-lg">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900">{{ t('admin.zones.apartment_editor.plan_upload') }}</h2>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <div class="p-6 space-y-6">
        <!-- File Upload -->
        <div>
          <label class="flex items-center text-sm font-medium text-gray-900 mb-3">
            <svg class="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ t('admin.zones.image') }}
          </label>
          <div
            class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 cursor-pointer group"
            @drop.prevent="handleDrop"
            @dragover.prevent
            @click="triggerInput"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleChange"
            />
            <div class="relative inline-block mb-4">
              <div class="absolute inset-0 bg-emerald-100 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <svg
                class="relative mx-auto h-16 w-16 text-emerald-400 group-hover:text-emerald-600 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <p class="text-base text-gray-700">
              <span class="font-semibold text-emerald-600">{{ t('admin.apartments.import.drag_drop').split(' ')[0] }}</span>
              <span class="text-gray-500"> {{ t('admin.apartments.import.drag_drop').split(' ').slice(1).join(' ') }}</span>
            </p>
            <p class="text-xs text-gray-500 mt-2 flex items-center justify-center space-x-4">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                PNG, JPG, WebP
              </span>
              <span>•</span>
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {{ t('admin.apartments.import.file_types').split('(')[1].replace(')', '') }}
              </span>
            </p>
          </div>

          <!-- Preview -->
          <div v-if="previewImageUrl" class="mt-4 p-4 bg-gradient-to-br from-gray-50 to-emerald-50 rounded-xl border border-gray-200">
            <img :src="previewImageUrl" alt="Preview" class="w-full rounded-lg shadow-md border border-gray-300" />
            <div class="mt-3 flex items-center justify-between">
              <div class="flex items-center space-x-2 text-sm text-gray-700">
                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span class="font-medium">{{ previewImageFile?.name }}</span>
              </div>
              <button 
                @click="clearPreview" 
                class="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 px-3 py-1 rounded-lg hover:bg-red-50 transition-all"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{{ t('admin.polygon_editor.delete') }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ViewBox (auto-detected) -->
        <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <label class="flex items-center text-sm font-medium text-blue-900 mb-2">
            <svg class="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ t('admin.zones.viewbox_auto') }}
          </label>
          <input
            :value="viewBox"
            type="text"
            readonly
            class="w-full px-4 py-2 border-blue-300 rounded-lg bg-white text-sm text-gray-900 font-mono"
            placeholder="0 0 1200 800"
          />
          <p class="text-xs text-blue-700 mt-2 flex items-start">
            <svg class="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <span>{{ t('admin.zones.viewbox_auto_desc') }}</span>
          </p>
        </div>
      </div>

      <div class="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="px-5 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-white hover:border-gray-400 transition-all duration-200"
        >
          {{ t('admin.common.cancel') }}
        </button>
        <button
          @click="$emit('upload')"
          :disabled="!previewImageFile || isUploading"
          class="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
        >
          <svg
            v-if="isUploading"
            class="animate-spin h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg
            v-else
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>{{ isUploading ? t('admin.common.uploading') : t('admin.common.upload') }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()

defineProps<{
  show: boolean
  previewImageUrl: string
  previewImageFile: File | null
  isUploading: boolean
  viewBox: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'upload'): void
  (e: 'file-selected', file: File): void
  (e: 'clear-preview'): void
}>()

const fileInput = ref<HTMLInputElement>()

function triggerInput() {
  fileInput.value?.click()
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('file-selected', file)
  }
}

function handleDrop(event: DragEvent) {
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    emit('file-selected', file)
  }
}

function clearPreview() {
  emit('clear-preview')
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}
</script>
