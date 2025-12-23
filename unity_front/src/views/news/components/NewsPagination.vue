<script setup lang="ts">
interface Pagination {
  current_page: number
  last_page: number
  total: number
}

defineProps<{
  pagination: Pagination
  generatePageNumbers: () => (number | string)[]
}>()

const emit = defineEmits<{
  handlePageChange: [page: number]
}>()
</script>

<template>
  <div v-if="pagination.last_page > 1" class="flex items-center justify-center">
    <nav class="flex items-center space-x-2">
      <!-- Previous Button -->
      <button
        @click="emit('handlePageChange', pagination.current_page - 1)"
        :disabled="pagination.current_page === 1"
        :class="[
          'px-4 py-2 text-sm font-light transition-all duration-300',
          pagination.current_page === 1
            ? 'text-zinc-400 cursor-not-allowed'
            : 'text-zinc-700 hover:text-[#FFCD4B]',
        ]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <!-- Page Numbers -->
      <template v-for="page in generatePageNumbers()" :key="page">
        <button
          v-if="page !== '...'"
          @click="emit('handlePageChange', page as number)"
          :class="[
            'px-4 py-2 text-sm font-light transition-all duration-300',
            page === pagination.current_page
              ? 'bg-black text-[#FFCD4B] shadow-lg'
              : 'text-zinc-700 hover:text-[#FFCD4B] hover:bg-zinc-100',
          ]"
        >
          {{ page }}
        </button>
        <span v-else class="px-2 text-zinc-400">...</span>
      </template>

      <!-- Next Button -->
      <button
        @click="emit('handlePageChange', pagination.current_page + 1)"
        :disabled="pagination.current_page === pagination.last_page"
        :class="[
          'px-4 py-2 text-sm font-light transition-all duration-300',
          pagination.current_page === pagination.last_page
            ? 'text-zinc-400 cursor-not-allowed'
            : 'text-zinc-700 hover:text-[#FFCD4B]',
        ]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </nav>
  </div>
</template>
