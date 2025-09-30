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
    'w-full px-6 py-4 bg-white border-2 border-slate-300 rounded-2xl focus:ring-2 transition-all duration-300 text-slate-900 font-medium shadow-sm hover:border-slate-400'
  const selectClass = props.fieldType === 'select' ? 'appearance-none' : 'placeholder-slate-500'
  const monthClass = props.inputType === 'month' ? 'cursor-pointer' : ''

  return `${baseClasses} ${focusColors[props.variant]} ${selectClass} ${monthClass}`
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
/* Enhanced styling for month/date inputs */
input[type='month'],
input[type='date'] {
  position: relative;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' fill='%2394a3b8'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.25rem center;
  background-size: 1.25rem;
  padding-right: 3.5rem;
}

input[type='month']::-webkit-calendar-picker-indicator,
input[type='date']::-webkit-calendar-picker-indicator {
  position: absolute;
  right: 1.25rem;
  width: 1.25rem;
  height: 1.25rem;
  opacity: 0;
  cursor: pointer;
}

input[type='month']:hover,
input[type='date']:hover {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' fill='%23475569'/%3E%3C/svg%3E");
}

input[type='month']:focus,
input[type='date']:focus {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z' fill='%2310b981'/%3E%3C/svg%3E");
}
</style>
