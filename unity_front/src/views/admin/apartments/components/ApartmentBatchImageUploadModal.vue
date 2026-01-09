<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="!uploading && $emit('close')"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <!-- Header -->
        <div class="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-t-2xl z-10">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold">{{ t('apartments.batch_upload_images') }}</h2>
            <button
              @click="!uploading && $emit('close')"
              :disabled="uploading"
              class="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-6">
          <!-- Instructions -->
          <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <h3 class="font-medium text-emerald-800 mb-2">{{ t('admin.apartments.batch_upload.instructions_title') }}</h3>
            <ul class="text-sm text-emerald-700 space-y-1">
              <li>• {{ t('admin.apartments.batch_upload.instruction_1') }}</li>
              <li>• {{ t('admin.apartments.batch_upload.instruction_2') }}</li>
              <li>• {{ t('admin.apartments.batch_upload.instruction_3') }}</li>
            </ul>
          </div>

          <!-- Folder Input -->
          <div v-if="!uploading && !result">
            <label class="block text-sm font-medium text-slate-700 mb-2">
              {{ t('admin.apartments.batch_upload.select_folder') }}
            </label>
            <input
              ref="folderInput"
              type="file"
              webkitdirectory
              multiple
              @change="handleFolderSelect"
              class="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
            />
          </div>

          <!-- Selected Files Preview -->
          <div v-if="selectedFiles.length > 0 && !uploading && !result" class="border border-slate-200 rounded-xl p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-medium text-slate-700">
                {{ t('admin.apartments.batch_upload.files_selected', { count: selectedFiles.length }) }}
              </h4>
              <button
                @click="clearSelection"
                class="text-sm text-red-500 hover:text-red-700"
              >
                {{ t('admin.common.clear') }}
              </button>
            </div>
            <div class="max-h-48 overflow-y-auto space-y-1">
              <div
                v-for="(file, index) in selectedFiles.slice(0, 20)"
                :key="index"
                class="text-sm text-slate-600 flex items-center gap-2"
              >
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span class="truncate">{{ file.webkitRelativePath || file.name }}</span>
              </div>
              <div v-if="selectedFiles.length > 20" class="text-sm text-slate-400 italic">
                ... {{ t('admin.apartments.batch_upload.and_more', { count: selectedFiles.length - 20 }) }}
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div v-if="uploading" class="border border-slate-200 rounded-xl p-6">
            <h4 class="font-medium text-slate-700 mb-4 text-center">
              {{ t('admin.apartments.batch_upload.processing_count', { current: processedCount + 1, total: totalFiles }) }}
            </h4>
            
            <div class="w-full bg-slate-100 rounded-full h-4 mb-2 overflow-hidden">
              <div 
                class="bg-emerald-500 h-4 rounded-full transition-all duration-300 ease-out flex items-center justify-end"
                :style="{ width: `${progressPercentage}%` }"
              >
              </div>
            </div>
            
            <div class="flex justify-between text-xs text-slate-500 mt-2">
               <span>0%</span>
               <span>{{ Math.round(progressPercentage) }}%</span>
               <span>100%</span>
            </div>

            <p class="text-sm text-slate-500 text-center mt-4 animate-pulse">
              {{ t('admin.apartments.batch_upload.optimizing_and_uploading') }}
            </p>
          </div>

          <!-- Upload Result -->
          <div v-if="result" class="border rounded-xl p-4" :class="result.failed > 0 ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'">
            <h4 class="font-medium mb-2" :class="result.failed > 0 ? 'text-amber-800' : 'text-green-800'">
              {{ t('admin.apartments.batch_upload.result') }}
            </h4>
            <div class="text-sm space-y-1">
              <p class="text-green-700">✓ {{ t('admin.apartments.batch_upload.uploaded', { count: result.uploaded }) }}</p>
              <p v-if="result.failed > 0" class="text-amber-700">⚠ {{ t('admin.apartments.batch_upload.failed', { count: result.failed }) }}</p>
            </div>
            <div v-if="result.errors?.length" class="mt-3 space-y-3">
              <p class="text-xs font-medium text-slate-500">{{ t('admin.apartments.batch_upload.errors') }}:</p>

              <!-- Error Summary -->
              <div v-if="result.summary" class="grid grid-cols-3 gap-2 text-xs">
                <div v-if="result.summary.parse_failures > 0" class="bg-orange-50 border border-orange-200 rounded-lg p-2">
                  <div class="font-medium text-orange-700">{{ result.summary.parse_failures }}</div>
                  <div class="text-orange-600">{{ t('apartments.batch_upload.parse_failures') }}</div>
                </div>
                <div v-if="result.summary.apartments_not_found > 0" class="bg-red-50 border border-red-200 rounded-lg p-2">
                  <div class="font-medium text-red-700">{{ result.summary.apartments_not_found }}</div>
                  <div class="text-red-600">{{ t('apartments.batch_upload.not_found') }}</div>
                </div>
                <div v-if="result.summary.upload_failures > 0" class="bg-purple-50 border border-purple-200 rounded-lg p-2">
                  <div class="font-medium text-purple-700">{{ result.summary.upload_failures }}</div>
                  <div class="text-purple-600">{{ t('apartments.batch_upload.upload_failed') }}</div>
                </div>
              </div>

              <!-- Categorized Errors -->
              <div class="max-h-64 overflow-y-auto space-y-3">
                <!-- Parse Failures -->
                <div v-if="categorizedErrors?.parse_failure.length" class="space-y-1">
                  <h5 class="text-xs font-semibold text-orange-700 flex items-center gap-1">
                    <span>⚠️</span> {{ t('apartments.batch_upload.parse_failures') }} ({{ categorizedErrors.parse_failure.length }})
                  </h5>
                  <div v-for="(err, i) in categorizedErrors.parse_failure.slice(0, 10)" :key="`parse-${i}`"
                       class="text-xs bg-orange-50 border border-orange-200 rounded p-2">
                    <div class="font-medium text-orange-800">{{ err.message }}</div>
                    <div class="text-orange-600 mt-0.5 truncate" :title="err.path">{{ err.path }}</div>
                    <div v-if="err.suggestion" class="text-orange-700 mt-1 text-xs italic">💡 {{ err.suggestion }}</div>
                  </div>
                  <div v-if="categorizedErrors.parse_failure.length > 10" class="text-xs text-orange-600 italic">
                    ... {{ categorizedErrors.parse_failure.length - 10 }} {{ t('apartments.batch_upload.more_parse_failures') }}
                  </div>
                </div>

                <!-- Apartments Not Found -->
                <div v-if="categorizedErrors?.apartment_not_found.length" class="space-y-1">
                  <h5 class="text-xs font-semibold text-red-700 flex items-center gap-1">
                    <span>❌</span> {{ t('apartments.batch_upload.apartments_not_found') }} ({{ categorizedErrors.apartment_not_found.length }})
                  </h5>
                  <div v-for="(err, i) in categorizedErrors.apartment_not_found.slice(0, 10)" :key="`notfound-${i}`"
                       class="text-xs bg-red-50 border border-red-200 rounded p-2">
                    <div class="font-medium text-red-800">{{ err.message }}</div>
                    <div class="text-red-600 mt-0.5 truncate" :title="err.path">{{ err.path }}</div>
                    <div v-if="err.parsed" class="text-xs text-slate-600 mt-1">
                      {{ t('apartments.batch_upload.parsed_prefix') }}: {{ t('apartments.batch_upload.floor_label') }} {{ err.parsed.floor }}, {{ t('apartments.batch_upload.apt_label') }} {{ err.parsed.apartment }}, {{ t('apartments.batch_upload.type_label') }} {{ err.parsed.type }}
                    </div>
                    <div v-if="err.suggestion" class="text-red-700 mt-1 text-xs bg-red-100 rounded p-1">
                      💡 {{ err.suggestion }}
                    </div>
                  </div>
                  <div v-if="categorizedErrors.apartment_not_found.length > 10" class="text-xs text-red-600 italic">
                    ... {{ categorizedErrors.apartment_not_found.length - 10 }} {{ t('apartments.batch_upload.more_not_found') }}
                  </div>
                </div>

                <!-- Upload Failures -->
                <div v-if="categorizedErrors?.upload_failure.length" class="space-y-1">
                  <h5 class="text-xs font-semibold text-purple-700 flex items-center gap-1">
                    <span>🚫</span> {{ t('apartments.batch_upload.upload_failures') }} ({{ categorizedErrors.upload_failure.length }})
                  </h5>
                  <div v-for="(err, i) in categorizedErrors.upload_failure.slice(0, 10)" :key="`upload-${i}`"
                       class="text-xs bg-purple-50 border border-purple-200 rounded p-2">
                    <div class="font-medium text-purple-800">{{ err.message }}</div>
                    <div class="text-purple-600 mt-0.5">{{ err.apartment }}</div>
                    <div v-if="err.reason" class="text-purple-700 mt-1 text-xs">{{ t('apartments.batch_upload.reason_label') }}: {{ err.reason }}</div>
                  </div>
                  <div v-if="categorizedErrors.upload_failure.length > 10" class="text-xs text-purple-600 italic">
                    ... {{ categorizedErrors.upload_failure.length - 10 }} {{ t('apartments.batch_upload.more_upload_failures') }}
                  </div>
                </div>

                <!-- Unknown Errors (Backward Compatibility) -->
                <div v-if="categorizedErrors?.unknown.length" class="space-y-1">
                  <h5 class="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <span>❓</span> {{ t('apartments.batch_upload.other_errors') }} ({{ categorizedErrors.unknown.length }})
                  </h5>
                  <div v-for="(err, i) in categorizedErrors.unknown.slice(0, 10)" :key="`unknown-${i}`"
                       class="text-xs bg-slate-50 border border-slate-200 rounded p-2">
                    <div class="font-medium text-slate-800">{{ err.message }}</div>
                    <div v-if="err.path" class="text-slate-600 mt-0.5 truncate" :title="err.path">{{ err.path }}</div>
                  </div>
                  <div v-if="categorizedErrors.unknown.length > 10" class="text-xs text-slate-600 italic">
                    ... {{ categorizedErrors.unknown.length - 10 }} {{ t('apartments.batch_upload.more_errors') }}
                  </div>
                </div>
              </div>

              <!-- Export Errors Button -->
              <div class="flex justify-end">
                <button
                  @click="exportErrors"
                  class="text-xs bg-slate-100 border border-slate-300 px-3 py-1.5 rounded hover:bg-slate-200 transition flex items-center gap-1"
                >
                  <span>📥</span> {{ t('apartments.batch_upload.export_errors_csv') }}
                </button>
              </div>
            </div>
            
            <div class="mt-4 flex justify-end">
              <button 
                @click="clearSelection" 
                class="text-sm bg-white border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 text-slate-700 transition"
              >
                {{ t('admin.common.upload_more') }}
              </button>
            </div>
          </div>

          <!-- Error -->
          <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4">
            <p class="text-red-600 text-sm">{{ error }}</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-white border-t border-slate-200 p-4 rounded-b-2xl flex gap-3">
          <button
            @click="$emit('close')"
            :disabled="uploading"
            class="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('admin.common.close') }}
          </button>
          <button
            v-if="!result"
            @click="uploadBatch"
            :disabled="uploading || selectedFiles.length === 0"
            class="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
          >
            <svg v-if="uploading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            {{ uploading ? t('admin.common.uploading') : t('admin.common.upload') }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { adminApartmentsApi } from '@/services/adminApartmentsApi'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useToast } from '@/composables/ui/useToast'
import { compressImage } from '@/utils/image-compression'

interface Props {
  show: boolean
  projectId: number | null
  buildingId: number | null
}

interface Emits {
  (e: 'close'): void
  (e: 'uploaded'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useTranslations()
const { success, error: showError } = useToast()

interface ErrorDetail {
  type?: string
  message: string
  path?: string
  parsed?: {
    floor: number | string
    apartment: number | string
    type: string
  }
  suggestion?: string
  apartment?: string
  reason?: string
}

interface ErrorSummary {
  parse_failures: number
  apartments_not_found: number
  upload_failures: number
}

const folderInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const uploading = ref(false)
const error = ref('')
const result = ref<{ uploaded: number; failed: number; errors: (string | ErrorDetail)[]; summary?: ErrorSummary } | null>(null)

// Progress tracking
const processedCount = ref(0)
const totalFiles = ref(0)
const progressPercentage = computed(() => {
  if (totalFiles.value === 0) return 0
  return Math.min(Math.round((processedCount.value / totalFiles.value) * 100), 100)
})

// Categorize errors by type
const categorizedErrors = computed(() => {
  if (!result.value?.errors) return null

  const categories: {
    parse_failure: ErrorDetail[]
    apartment_not_found: ErrorDetail[]
    upload_failure: ErrorDetail[]
    unknown: ErrorDetail[]
  } = {
    parse_failure: [],
    apartment_not_found: [],
    upload_failure: [],
    unknown: []
  }

  result.value.errors.forEach(err => {
    if (typeof err === 'object') {
      const type = err.type || 'unknown'
      if (type in categories) {
        categories[type as keyof typeof categories].push(err as ErrorDetail)
      } else {
        categories.unknown.push(err as ErrorDetail)
      }
    } else {
      // Backward compatibility with string errors
      categories.unknown.push({ message: err, path: '' })
    }
  })

  return categories
})

function handleFolderSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  if (files) {
    // Filter to only image files
    selectedFiles.value = Array.from(files).filter(file => 
      file.type.startsWith('image/') || 
      /\.(jpg|jpeg|png|webp)$/i.test(file.name)
    )
    result.value = null
    error.value = ''
    totalFiles.value = selectedFiles.value.length
    processedCount.value = 0
  }
}

function clearSelection() {
  selectedFiles.value = []
  result.value = null
  error.value = ''
  processedCount.value = 0
  totalFiles.value = 0
  if (folderInput.value) {
    folderInput.value.value = ''
  }
}

function exportErrors() {
  if (!result.value?.errors) return

  const csvRows = []
  csvRows.push(['Type', 'Message', 'Path', 'Details', 'Suggestion'])

  result.value.errors.forEach(err => {
    if (typeof err === 'object') {
      const details = err.parsed
        ? `Floor: ${err.parsed.floor}, Apt: ${err.parsed.apartment}, Type: ${err.parsed.type}`
        : err.apartment || ''

      csvRows.push([
        err.type || 'unknown',
        err.message || '',
        err.path || '',
        details,
        err.suggestion || ''
      ])
    } else {
      csvRows.push(['unknown', err, '', '', ''])
    }
  })

  const csvContent = csvRows.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `apartment_upload_errors_${Date.now()}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

async function uploadBatch() {
  if (!props.projectId || !props.buildingId || selectedFiles.value.length === 0) {
    error.value = t('admin.errors.validation_error')
    return
  }

  uploading.value = true
  error.value = ''
  processedCount.value = 0
  totalFiles.value = selectedFiles.value.length
  
  // Initialize result
  result.value = {
    uploaded: 0,
    failed: 0,
    errors: []
  }

  try {
    for (const file of selectedFiles.value) {
      try {
        // 1. Compress image
        const compressionResult = await compressImage(file, {
          imageType: 'gallery', // content type for apartment images
          maxWidth: 1920,
          quality: 0.8
        })

        // 2. Prepare for upload
        // We need to preserve the relative path.
        // When we compress, we get a new File object which might lose webkitRelativePath.
        // We explicitly pass the original path.
        const originalPath = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name

        // 3. Upload single file and check response
        const response = await adminApartmentsApi.uploadBatchImage(
          props.projectId,
          props.buildingId,
          compressionResult.file,
          originalPath
        )

        // 4. Check if backend returned failures (backend returns 200 OK even with failures)
        const responseData = response.data as { data?: { uploaded?: number; failed?: number; errors?: ErrorDetail[]; summary?: ErrorSummary } }

        if (responseData.data?.failed && responseData.data.failed > 0) {
          // Backend reported failures for this file
          if (result.value) {
            result.value.failed += responseData.data.failed
            if (responseData.data.errors && Array.isArray(responseData.data.errors)) {
              result.value.errors.push(...responseData.data.errors)
            }
            if (responseData.data.summary) {
              // Merge summary counts
              if (!result.value.summary) {
                result.value.summary = {
                  parse_failures: 0,
                  apartments_not_found: 0,
                  upload_failures: 0
                }
              }
              result.value.summary.parse_failures += responseData.data.summary.parse_failures || 0
              result.value.summary.apartments_not_found += responseData.data.summary.apartments_not_found || 0
              result.value.summary.upload_failures += responseData.data.summary.upload_failures || 0
            }
          }
        }

        // Update success count
        if (result.value && responseData.data?.uploaded) {
          result.value.uploaded += responseData.data.uploaded
        }
      } catch (err: unknown) {
        // Collect errors but continue uploading other files
        if (result.value) {
          const fileName = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name
          const apiError = err as { response?: { data?: { data?: { errors?: ErrorDetail[]; summary?: ErrorSummary }; message?: string } }; message?: string }

          // Handle structured error from backend
          if (apiError.response?.data?.data?.errors && Array.isArray(apiError.response.data.data.errors)) {
            // Backend returned structured errors
            result.value.failed += apiError.response.data.data.errors.length
            result.value.errors.push(...apiError.response.data.data.errors)

            // Update summary if provided
            if (apiError.response.data.data.summary) {
              result.value.summary = apiError.response.data.data.summary
            }
          } else {
            // Fallback to simple error
            result.value.failed++
            const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error'
            result.value.errors.push({
              type: 'unknown',
              message: errorMessage,
              path: fileName
            })
          }
        }
        console.error(`Failed to upload ${file.name}:`, err)
      } finally {
        processedCount.value++
      }
    }
    
    // Final notification
    if (result.value && result.value.uploaded > 0) {
      success(t('admin.messages.upload_success'))
      emit('uploaded')
    } else if (result.value && result.value.failed > 0 && result.value.uploaded === 0) {
       showError(t('admin.errors.all_uploads_failed'))
    }
    
  } catch (err: unknown) {
    // This should mostly not allow to happen anymore as we catch inside loop, 
    // but just in case of catastrophic failure outside loop
    const apiError = err as { response?: { data?: { message?: string } }; message?: string }
    error.value = apiError.response?.data?.message || apiError.message || t('admin.errors.unknown_error')
    showError(error.value)
  } finally {
    uploading.value = false
  }
}
</script>
