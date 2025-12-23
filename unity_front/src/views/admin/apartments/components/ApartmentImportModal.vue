<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div
        class="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-t-2xl z-10"
      >
        <h2 class="text-2xl font-bold">{{ t('admin.apartments.import.title') }}</h2>
        <p class="text-amber-100 text-sm mt-1">{{ t('admin.apartments.import.subtitle') }}</p>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Building Selection -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            {{ t('admin.apartments.form.building') }} <span class="text-red-500">*</span>
          </label>
          <select
            v-model="selectedBuildingId"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
          >
            <option :value="null">-- {{ t('admin.apartments.form.building') }} --</option>
            <option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </option>
          </select>
        </div>

        <!-- Template Download -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <svg class="w-6 h-6 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="flex-1">
              <h3 class="font-semibold text-slate-900 mb-1">{{ t('admin.apartments.import.template_info') }}</h3>
              <p class="text-slate-600 text-sm mb-3">
                {{ t('admin.apartments.import.template_desc') }}
              </p>
              <button
                @click="downloadTemplate"
                :disabled="isDownloading"
                class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-medium text-sm disabled:opacity-50"
              >
                {{ isDownloading ? t('admin.common.loading') : t('admin.apartments.import.download_template') }}
              </button>
            </div>
          </div>
        </div>

        <!-- File Upload -->
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-2">
            {{ t('admin.apartments.import.upload_file') }} <span class="text-red-500">*</span>
          </label>
          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            :class="[
              'border-2 border-dashed rounded-xl p-8 text-center transition-all',
              isDragging
                ? 'border-amber-500 bg-amber-50'
                : 'border-slate-300 bg-slate-50 hover:border-amber-400',
            ]"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".csv,.xlsx,.xls"
              @change="handleFileSelect"
              class="hidden"
            />

            <div v-if="!selectedFile">
              <svg
                class="w-12 h-12 text-slate-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p class="text-slate-600 font-medium mb-2">{{ t('admin.apartments.import.drag_drop') }}</p>
              <p class="text-slate-500 text-sm">{{ t('admin.apartments.import.file_types') }}</p>
              <button
                @click="fileInput?.click()"
                type="button"
                class="mt-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-2 rounded-lg hover:from-amber-600 hover:to-orange-700 transition-all duration-300 font-medium"
              >
                {{ t('admin.common.select') }}
              </button>
            </div>

            <div v-else class="flex items-center justify-between bg-white p-4 rounded-lg">
              <div class="flex items-center gap-3">
                <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                <div class="text-left">
                  <p class="font-medium text-slate-900">{{ selectedFile.name }}</p>
                  <p class="text-slate-500 text-sm">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
              </div>
              <button
                @click="selectedFile = null"
                type="button"
                class="text-red-600 hover:text-red-700 p-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Import Results -->
        <div v-if="importResult" class="space-y-3">
          <!-- Success Message -->
          <div
            v-if="importResult.success"
            class="bg-green-50 border border-green-200 rounded-xl p-4"
          >
            <div class="flex items-center gap-3">
              <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div>
                <p class="font-semibold text-green-900">{{ importResult.message }}</p>
                <p class="text-green-700 text-sm">
                  {{ t('admin.apartments.import.imported', { count: importResult.imported_count ?? 0 }) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-else class="bg-red-50 border border-red-200 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div class="flex-1">
                <p class="font-semibold text-red-900 mb-2">{{ importResult.message }}</p>
                <div v-if="importResult.errors && importResult.errors.length > 0" class="space-y-2">
                  <p class="text-red-700 text-sm">{{ t('admin.apartments.import.errors') }}:</p>
                  <div class="max-h-40 overflow-y-auto bg-red-100 rounded p-3 text-sm">
                    <div
                      v-for="(err, idx) in importResult.errors"
                      :key="idx"
                      class="mb-2 last:mb-0"
                    >
                      <span class="font-medium">{{ t('admin.apartments.import.row') }} {{ err.row }}:</span>
                      <ul class="list-disc list-inside ml-2">
                        <li v-for="(error, errIdx) in err.errors" :key="errIdx" class="text-red-800">
                          {{ error }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="$emit('close')"
            :disabled="isImporting"
            class="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300 font-medium disabled:opacity-50"
          >
            {{ importResult?.success ? t('admin.common.close') : t('admin.common.cancel') }}
          </button>
          <button
            v-if="!importResult?.success"
            @click="handleImport"
            :disabled="isImporting || !selectedFile || !selectedBuildingId"
            type="button"
            class="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-orange-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {{ isImporting ? t('admin.apartments.import.importing') : t('admin.common.import') }}
          </button>
          <button
            v-else
            @click="$emit('imported')"
            type="button"
            class="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
          >
            {{ t('admin.apartments.import.finish') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useApartmentsAdminStore } from '@/stores/admin/apartments'
import { useTranslations } from '@/composables/i18n/useTranslations'
import type { Building } from '@/types/apartments'

interface Props {
  projectId: number | null
  buildings: Building[]
}

interface Emits {
  (e: 'close'): void
  (e: 'imported'): void
}

interface ImportResult {
  success: boolean
  message: string
  imported_count?: number
  failed_count?: number
  errors?: Array<{
    row: number
    errors: string[]
  }>
}

const props = defineProps<Props>()
defineEmits<Emits>()

const apartmentsStore = useApartmentsAdminStore()
const { t } = useTranslations()

const selectedBuildingId = ref<number | null>(null)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const isImporting = ref(false)
const isDownloading = ref(false)
const fileInput = ref<HTMLInputElement>()
const importResult = ref<ImportResult | null>(null)

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    selectedFile.value = event.dataTransfer.files[0]
  }
}

async function downloadTemplate() {
  if (!props.projectId || !selectedBuildingId.value) {
    alert(t('admin.apartments.form.building'))
    return
  }

  isDownloading.value = true
  try {
    await apartmentsStore.downloadTemplate()
  } catch (error: unknown) {
    const apiError = error as { message?: string }
    alert(t('admin.errors.loading_failed') + ': ' + (apiError.message || 'Template download failed'))
  } finally {
    isDownloading.value = false
  }
}

async function handleImport() {
  if (!props.projectId || !selectedBuildingId.value || !selectedFile.value) {
    return
  }

  isImporting.value = true
  importResult.value = null

  try {
    const result = await apartmentsStore.bulkImport(
      props.projectId,
      selectedBuildingId.value,
      selectedFile.value
    )
    importResult.value = result

    if (result.success) {
      selectedFile.value = null
    }
  } catch (error: unknown) {
    const apiError = error as {
      response?: { data?: { message?: string; errors?: Array<{ row: number; errors: string[] }> } }
      message?: string
    }
    importResult.value = {
      success: false,
      message: apiError.response?.data?.message || apiError.message || t('admin.errors.unknown_error'),
      errors: apiError.response?.data?.errors || [],
    }
  } finally {
    isImporting.value = false
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>
