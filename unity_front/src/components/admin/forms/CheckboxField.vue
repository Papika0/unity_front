<template>
  <div>
    <label :for="fieldId" class="block text-sm font-semibold text-slate-800 mb-3">
      {{ label }}
    </label>
    <div class="flex items-center space-x-3">
      <input
        :id="fieldId"
        :checked="modelValue"
        @change="handleChange"
        type="checkbox"
        :class="checkboxClasses"
      />
      <label :for="fieldId" class="text-sm font-semibold text-slate-800">
        {{ label }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  fieldId: string
  label: string
  modelValue: boolean
  variant?: 'amber' | 'emerald' | 'violet'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'emerald',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}

const checkboxClasses = computed(() => {
  const colors = {
    amber: 'text-amber-500 focus:ring-amber-500',
    emerald: 'text-emerald-500 focus:ring-emerald-500',
    violet: 'text-violet-500 focus:ring-violet-500',
  }

  const baseClasses =
    'w-5 h-5 bg-slate-50 border-slate-300 rounded-lg focus:ring-2 transition-all duration-300'

  return `${baseClasses} ${colors[props.variant]}`
})
</script>
