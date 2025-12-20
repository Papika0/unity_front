<template>
  <div class="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2">
    <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <span v-if="label" class="font-medium">{{ label }}:</span>
    <span>{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label?: string
  error: string
}>()
</script>
