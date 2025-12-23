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
            <div v-if="result.errors?.length" class="mt-3 max-h-32 overflow-y-auto">
              <p class="text-xs font-medium text-slate-500 mb-1">{{ t('admin.apartments.batch_upload.errors') }}:</p>
              <ul class="text-xs text-red-600 space-y-0.5">
              <!-- Show only first 10 errors to preserve performance if many fail -->
                <li v-for="(err, i) in result.errors.slice(0, 50)" :key="i">{{ err }}</li>
                <li v-if="result.errors.length > 50">... {{ result.errors.length - 50 }} more errors</li>
              </ul>
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

const folderInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const uploading = ref(false)
const error = ref('')
const result = ref<{ uploaded: number; failed: number; errors: string[] } | null>(null)

// Progress tracking
const processedCount = ref(0)
const totalFiles = ref(0)
const progressPercentage = computed(() => {
  if (totalFiles.value === 0) return 0
  return Math.min(Math.round((processedCount.value / totalFiles.value) * 100), 100)
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
        
        // 3. Upload single file
        await adminApartmentsApi.uploadBatchImage(
          props.projectId,
          props.buildingId,
          compressionResult.file,
          originalPath
        )
        
        // 4. Update success count
        if (result.value) {
          result.value.uploaded++
        }
      } catch (err: unknown) {
        // Collect errors but continue uploading other files
        if (result.value) {
          result.value.failed++
          const fileName = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name
          const apiError = err as { response?: { data?: { message?: string } }; message?: string }
          const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error'
          result.value.errors.push(`${fileName}: ${errorMessage}`)
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
