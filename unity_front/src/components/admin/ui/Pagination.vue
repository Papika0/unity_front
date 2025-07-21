<template>
  <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4">
    <!-- Page Info -->
    <div class="text-sm text-slate-600 bg-slate-50/50 px-4 py-2 rounded-xl border border-slate-200">
      გვერდი <span class="font-semibold text-slate-800">{{ currentPage }}</span>
      <span class="mx-2 text-slate-400">/</span>
      <span class="font-semibold text-slate-800">{{ totalPages }}</span>
    </div>

    <!-- Pagination Controls -->
    <nav class="flex items-center space-x-2">
      <!-- First Page -->
      <button
        @click="$emit('goto', 1)"
        :disabled="currentPage === 1"
        class="flex items-center justify-center w-10 h-10 text-sm font-medium text-slate-700 rounded-xl border-2 border-slate-200 bg-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-700 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg"
        title="პირველი გვერდი"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          ></path>
        </svg>
      </button>

      <!-- Previous Page -->
      <button
        @click="$emit('previous')"
        :disabled="currentPage === 1"
        class="flex items-center justify-center w-10 h-10 text-sm font-medium text-slate-700 rounded-xl border-2 border-slate-200 bg-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-700 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg"
        title="წინა გვერდი"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
      </button>

      <!-- Page Numbers -->
      <div class="flex items-center space-x-1">
        <template v-for="page in visiblePages" :key="page">
          <button
            v-if="page === '...'"
            class="flex items-center justify-center w-10 h-10 text-sm font-medium text-slate-400 cursor-default"
          >
            ...
          </button>
          <button
            v-else
            @click="$emit('goto', page as number)"
            :class="[
              'flex items-center justify-center w-10 h-10 text-sm font-bold rounded-xl border-2 transition-all duration-300 transform hover:scale-105 shadow-sm',
              currentPage === page
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-lg'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-300 hover:text-indigo-700 hover:shadow-lg',
            ]"
          >
            {{ page }}
          </button>
        </template>
      </div>

      <!-- Next Page -->
      <button
        @click="$emit('next')"
        :disabled="currentPage === totalPages"
        class="flex items-center justify-center w-10 h-10 text-sm font-medium text-slate-700 rounded-xl border-2 border-slate-200 bg-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-700 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg"
        title="შემდეგი გვერდი"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          ></path>
        </svg>
      </button>

      <!-- Last Page -->
      <button
        @click="$emit('goto', totalPages)"
        :disabled="currentPage === totalPages"
        class="flex items-center justify-center w-10 h-10 text-sm font-medium text-slate-700 rounded-xl border-2 border-slate-200 bg-white hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:text-white hover:border-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-slate-700 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg"
        title="ბოლო გვერდი"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 5l7 7-7 7M5 5l7 7-7 7"
          ></path>
        </svg>
      </button>
    </nav>

    <!-- Quick Jump Input (for many pages) -->
    <div v-if="totalPages > 10" class="flex items-center space-x-2">
      <label for="page-jump" class="text-sm text-slate-600">გადასვლა:</label>
      <input
        id="page-jump"
        v-model.number="jumpToPage"
        @keyup.enter="handleJump"
        type="number"
        :min="1"
        :max="totalPages"
        class="w-16 px-2 py-1 text-sm text-center text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-300 bg-white placeholder:text-slate-500"
        :placeholder="`1-${totalPages}`"
      />
      <button
        @click="handleJump"
        class="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg"
      >
        გადასვლა
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  currentPage: number
  totalPages: number
}

interface Emits {
  (e: 'previous'): void
  (e: 'next'): void
  (e: 'goto', page: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const jumpToPage = ref<number>()

// Generate visible page numbers with ellipsis
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const current = props.currentPage
  const total = props.totalPages

  if (total <= 7) {
    // Show all pages if total is 7 or less
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Always show first page
    pages.push(1)

    if (current > 4) {
      pages.push('...')
    }

    // Show pages around current
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }

    if (current < total - 3) {
      pages.push('...')
    }

    // Always show last page
    if (!pages.includes(total)) {
      pages.push(total)
    }
  }

  return pages
})

const handleJump = () => {
  if (jumpToPage.value && jumpToPage.value >= 1 && jumpToPage.value <= props.totalPages) {
    emit('goto', jumpToPage.value)
    jumpToPage.value = undefined
  }
}
</script>
