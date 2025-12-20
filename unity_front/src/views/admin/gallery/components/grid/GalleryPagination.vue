<template>
  <div v-if="totalPages > 1" class="flex justify-center mt-12">
    <nav class="flex items-center space-x-2">
      <button
        @click="$emit('pageChange', Math.max(1, currentPage - 1))"
        :disabled="currentPage === 1"
        class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <template v-for="page in pages" :key="page">
        <button
          v-if="page !== '...'"
          @click="$emit('pageChange', Number(page))"
          :class="[
            'px-3 py-2 text-sm font-medium rounded-lg',
            currentPage === page
              ? 'bg-purple-500 text-white'
              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50',
          ]"
        >
          {{ page }}
        </button>
        <span v-else class="px-3 py-2 text-sm text-gray-500">...</span>
      </template>

      <button
        @click="$emit('pageChange', Math.min(totalPages, currentPage + 1))"
        :disabled="currentPage === totalPages"
        class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentPage: number
  totalPages: number
  pages: (number | string)[]
}>()

defineEmits<{
  (e: 'pageChange', page: number): void
}>()
</script>
