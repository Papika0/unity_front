<template>
  <div
    class="border-2 border-dashed border-slate-300 rounded-2xl p-8 transition-all duration-300 bg-white/90"
    :class="hoverBorderColor"
  >
    <input
      :id="fieldId"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :class="inputClasses"
      @change="handleChange"
    />

    <!-- Compression Progress Indicator -->
    <div v-if="isCompressing" class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
      <div class="flex items-center space-x-3">
        <svg
          class="animate-spin h-5 w-5 text-blue-600"
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
        <div class="flex-1">
          <p class="text-sm font-medium text-blue-800">კომპრესია მიმდინარეობს...</p>
          <div class="w-full bg-blue-200 rounded-full h-2 mt-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: compressionProgress + '%' }"
            ></div>
          </div>
          <p class="text-xs text-blue-600 mt-1">{{ compressionProgress }}% დასრულდა</p>
        </div>
      </div>
    </div>

    <div v-if="preview" class="mt-6">
      <img
        v-if="!multiple && typeof preview === 'string'"
        :src="preview"
        :alt="altText"
        class="w-40 h-40 object-cover rounded-2xl border border-slate-300 shadow-lg"
      />
      <div
        v-else-if="multiple && Array.isArray(preview) && preview.length > 0"
        class="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        <div v-for="(image, index) in preview" :key="index" class="relative group">
          <img
            :src="getImageUrl(image)"
            :alt="`${altText} ${index + 1}`"
            class="w-full h-28 object-cover rounded-2xl border border-slate-300 shadow-lg group-hover:scale-105 transition-transform duration-300"
          />
          <button
            @click="handleRemove(index)"
            type="button"
            class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm hover:bg-red-600 hover:scale-110 shadow-lg"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { compressFileIfNeeded, type ConstructionImageType } from '@/utils/imageCompression'

interface Props {
  fieldId: string
  accept?: string
  multiple?: boolean
  preview?: string | string[]
  altText?: string
  variant?: 'amber' | 'emerald' | 'violet'
  backendUrl?: string
  enableCompression?: boolean
  imageType?: ConstructionImageType
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/*',
  multiple: false,
  altText: 'Image preview',
  variant: 'violet',
  backendUrl: '',
  enableCompression: true,
  imageType: 'gallery',
})

const emit = defineEmits<{
  change: [files: FileList | null]
  remove: [index: number]
  'compression-progress': [progress: number]
  'compression-complete': [files: File[]]
}>()

// Compression state
const isCompressing = ref(false)
const compressionProgress = ref(0)

const hoverBorderColor = computed(() => {
  const colors = {
    amber: 'hover:border-amber-400',
    emerald: 'hover:border-emerald-400',
    violet: 'hover:border-violet-400',
  }
  return colors[props.variant]
})

const inputClasses = computed(() => {
  const focusColors = {
    amber:
      'focus:ring-amber-500 focus:border-amber-500 file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200',
    emerald:
      'focus:ring-emerald-500 focus:border-emerald-500 file:bg-emerald-100 file:text-emerald-700 hover:file:bg-emerald-200',
    violet:
      'focus:ring-violet-500 focus:border-violet-500 file:bg-violet-100 file:text-violet-700 hover:file:bg-violet-200',
  }

  const baseClasses =
    'w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 transition-all duration-300 text-slate-900 font-medium file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:transition-all file:duration-300 shadow-sm'

  return `${baseClasses} ${focusColors[props.variant]}`
})

async function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (!files || files.length === 0) {
    emit('change', null)
    return
  }

  // If compression is disabled, emit files as-is
  if (!props.enableCompression) {
    emit('change', files)
    return
  }

  // Check if any files are images that need compression
  const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))

  if (imageFiles.length === 0) {
    emit('change', files)
    return
  }

  // Start compression process
  isCompressing.value = true
  compressionProgress.value = 0

  try {
    const compressedFiles: File[] = []
    const totalFiles = imageFiles.length

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      console.log(`Compressing ${file.name} (${i + 1}/${totalFiles})...`)

      // Update progress
      compressionProgress.value = Math.round((i / totalFiles) * 100)
      emit('compression-progress', compressionProgress.value)

      // Compress the file
      const compressedFile = await compressFileIfNeeded(file, props.imageType)
      if (compressedFile) {
        compressedFiles.push(compressedFile)
        console.log(
          `Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`,
        )
      } else {
        compressedFiles.push(file) // Use original if compression failed
      }
    }

    // Add non-image files as-is
    const nonImageFiles = Array.from(files).filter((file) => !file.type.startsWith('image/'))
    const allFiles = [...compressedFiles, ...nonImageFiles]

    // Create new FileList-like object
    const dataTransfer = new DataTransfer()
    allFiles.forEach((file) => dataTransfer.items.add(file))

    compressionProgress.value = 100
    emit('compression-progress', 100)
    emit('compression-complete', compressedFiles)
    emit('change', dataTransfer.files)
  } catch (error) {
    console.error('Compression failed:', error)
    // Fallback to original files
    emit('change', files)
  } finally {
    isCompressing.value = false
    compressionProgress.value = 0
  }
}

function handleRemove(index: number) {
  emit('remove', index)
}

function getImageUrl(image: string): string {
  if (image.startsWith('blob:')) {
    return image
  }
  if (image.startsWith('http')) {
    return image
  }
  return props.backendUrl + image
}
</script>
