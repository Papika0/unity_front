<template>
  <div>
    <label :for="fieldId" class="block text-sm font-semibold text-slate-800 mb-3">
      {{ label }}
    </label>
    <input
      v-if="fieldType === 'input'"
      :id="fieldId"
      :value="modelValue"
      :type="inputType"
      :required="required"
      :min="min"
      :max="max"
      :class="inputClasses"
      @input="handleInput"
    />
    <select
      v-else-if="fieldType === 'select'"
      :id="fieldId"
      :value="modelValue"
      :required="required"
      :min="min"
      :max="max"
      :class="inputClasses"
      @input="handleInput"
    >
      <slot />
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  fieldId: string
  label: string
  modelValue: string | number
  fieldType?: 'input' | 'select'
  inputType?: string
  required?: boolean
  min?: string | number
  max?: string | number
  variant?: 'amber' | 'emerald' | 'violet'
}

const props = withDefaults(defineProps<Props>(), {
  fieldType: 'input',
  inputType: 'text',
  required: false,
  variant: 'emerald',
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputClasses = computed(() => {
  const focusColors = {
    amber: 'focus:ring-amber-500 focus:border-amber-500',
    emerald: 'focus:ring-emerald-500 focus:border-emerald-500',
    violet: 'focus:ring-violet-500 focus:border-violet-500',
  }

  const baseClasses =
    'w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 transition-all duration-300 text-slate-900 font-medium shadow-sm'
  const selectClass = props.fieldType === 'select' ? 'appearance-none' : 'placeholder-slate-500'

  return `${baseClasses} ${focusColors[props.variant]} ${selectClass}`
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>
