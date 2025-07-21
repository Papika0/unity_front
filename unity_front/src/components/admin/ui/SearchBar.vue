<template>
  <div class="max-w-lg">
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
      </div>
      <input
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="text"
        class="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl leading-5 bg-white text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm hover:shadow-md transition-all duration-300"
        :placeholder="placeholder"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  placeholder: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<style scoped>
/* Enhanced focus styles */
input:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}
</style>
