<template>
  <div v-if="totalPages > 1" class="mt-16">
    <div class="flex flex-col items-center space-y-6">
      <!-- Pagination Info -->
      <div class="text-center">
        <p class="text-slate-600 text-sm">
          {{ t('admin.news.showing_range', { from, to, total: totalItems }) }}
        </p>
      </div>

      <!-- Pagination Navigation -->
      <div class="flex items-center space-x-2">
        <!-- Previous Button -->
        <button
          @click="$emit('prev')"
          :disabled="!hasPrev || loading"
          class="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-slate-700 font-medium"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {{ t('admin.common.prev') }}
        </button>

        <!-- Page Numbers -->
        <div class="flex space-x-1">
          <!-- First page -->
          <button
            v-if="currentPage > 3"
            @click="$emit('goToPage', 1)"
            :disabled="loading"
            class="px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 text-slate-700 font-medium"
          >
            1
          </button>

          <!-- Ellipsis -->
          <span v-if="currentPage > 4" class="px-3 py-2 text-slate-400">
            ...
          </span>

          <!-- Page range around current page -->
          <button
            v-for="page in getPageRange()"
            :key="page"
            @click="$emit('goToPage', page)"
            :disabled="loading"
            :class="[
              'px-3 py-2 rounded-lg font-medium transition-all duration-200',
              page === currentPage
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
            ]"
          >
            {{ page }}
          </button>

          <!-- Ellipsis -->
          <span
            v-if="currentPage < totalPages - 3"
            class="px-3 py-2 text-slate-400"
          >
            ...
          </span>

          <!-- Last page -->
          <button
            v-if="currentPage < totalPages - 2"
            @click="$emit('goToPage', totalPages)"
            :disabled="loading"
            class="px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200 text-slate-700 font-medium"
          >
            {{ totalPages }}
          </button>
        </div>

        <!-- Next Button -->
        <button
          @click="$emit('next')"
          :disabled="!hasNext || loading"
          class="px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-slate-700 font-medium"
        >
          {{ t('admin.common.next') }}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTranslations } from '@/composables/i18n/useTranslations'
const { t } = useTranslations()

const props = defineProps<{
  currentPage: number
  totalPages: number
  totalItems: number
  from: number
  to: number
  hasPrev: boolean
  hasNext: boolean
  loading: boolean
}>()

defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'goToPage', page: number): void
}>()

const getPageRange = () => {
  const current = props.currentPage
  const total = props.totalPages
  const range = []

  // Show 2 pages before and after current page
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)

  for (let i = start; i <= end; i++) {
    range.push(i)
  }

  return range
}
</script>
