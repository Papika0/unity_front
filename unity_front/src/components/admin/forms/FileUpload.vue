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
import { computed } from 'vue'

interface Props {
  fieldId: string
  accept?: string
  multiple?: boolean
  preview?: string | string[]
  altText?: string
  variant?: 'amber' | 'emerald' | 'violet'
  backendUrl?: string
}

const props = withDefaults(defineProps<Props>(), {
  accept: 'image/*',
  multiple: false,
  altText: 'Image preview',
  variant: 'violet',
  backendUrl: '',
})

const emit = defineEmits<{
  change: [files: FileList | null]
  remove: [index: number]
}>()

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

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('change', target.files)
}

function handleRemove(index: number) {
  emit('remove', index)
}

function getImageUrl(image: string): string {
  if (image.startsWith('blob:')) {
    return image
  }
  return props.backendUrl + image
}
</script>
