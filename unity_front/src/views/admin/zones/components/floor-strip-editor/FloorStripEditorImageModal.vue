<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">სართულების გეგმის ატვირთვა</h2>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded transition-colors">
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
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">სურათის ფაილი</label>
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer"
            @drop.prevent="handleDrop"
            @dragover.prevent
            @click="triggerInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleChange"
            />
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
            <p class="mt-2 text-sm text-gray-600">
              <span class="font-medium text-indigo-600">დააჭირეთ ატვირთვისთვის</span>
              ან გადმოიტანეთ ფაილი
            </p>
            <p class="text-xs text-gray-500 mt-1">PNG, JPG, WebP - მაქს. 10MB</p>
          </div>

          <div v-if="previewImageUrl" class="mt-4">
            <img :src="previewImageUrl" alt="Preview" class="w-full rounded-lg border border-gray-300" />
            <div class="mt-2 flex items-center justify-between text-sm text-gray-600">
              <span>{{ previewImageFile?.name }}</span>
              <button @click="clearPreview" class="text-red-600 hover:text-red-700">წაშლა</button>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            ViewBox (ავტომატური განსაზღვრა)
          </label>
          <input
            :value="viewBox"
            type="text"
            readonly
            class="w-full border-gray-300 rounded bg-gray-50 text-sm text-gray-900"
            placeholder="0 0 1200 800"
          />
        </div>
      </div>

      <div class="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          გაუქმება
        </button>
        <button
          @click="$emit('upload')"
          :disabled="!previewImageFile || isUploading"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {{ isUploading ? 'ატვირთვა...' : 'ატვირთვა' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  show: boolean
  previewImageUrl: string
  previewImageFile: File | null
  viewBox: string
  isUploading: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'upload'): void
  (e: 'fileSelected', file: File): void
  (e: 'clearPreview'): void
}>()

const fileInputRef = ref<HTMLInputElement>()

function triggerInput() {
  fileInputRef.value?.click()
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('fileSelected', file)
  }
}

function handleDrop(event: DragEvent) {
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    emit('fileSelected', file)
  }
}

function clearPreview() {
  emit('clearPreview')
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}
</script>
