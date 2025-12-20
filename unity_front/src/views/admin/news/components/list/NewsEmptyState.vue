<template>
  <div class="text-center py-20">
    <div class="text-slate-300 mb-8">
      <svg class="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
        />
      </svg>
    </div>
    <h3 class="text-2xl font-light text-slate-700 mb-4">სიახლეები ვერ მოიძებნა</h3>
    <p class="text-slate-500 text-lg mb-8">
      {{
        hasSearchQuery
          ? 'სცადეთ სხვა საძიებო სიტყვები'
          : 'ჯერ არცერთი სიახლე არ არის დამატებული'
      }}
    </p>
    <button
      v-if="!hasSearchQuery"
      @click="$emit('addFirst')"
      class="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-8 py-4 rounded-2xl font-medium shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
    >
      პირველი სიახლის დამატება
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hasSearchQuery: boolean
}>()

defineEmits<{
  (e: 'addFirst'): void
}>()
</script>
