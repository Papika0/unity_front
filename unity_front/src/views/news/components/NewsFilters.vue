<script setup lang="ts">
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'

defineProps<{
  searchQuery: string
  selectedCategory: string
  categoryLabels: Record<string, string>
  isLoadingCategories: boolean
  hasTranslations: boolean
  t: (key: string) => string
}>()

const emit = defineEmits<{
  'update:searchQuery': [value: string]
  handleCategoryChange: [category: string]
}>()

// Component manages its own scroll animation
const { element: searchFilterElement, isVisible: searchFilterVisible } = useScrollAnimation({ 
  once: false, 
  threshold: 0.05, 
  rootMargin: '200px' 
})
</script>

<template>
  <div ref="searchFilterElement" class="mb-16 transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
    :class="{
      'opacity-100 translate-y-0 scale-100 blur-0': searchFilterVisible,
      'opacity-0 translate-y-12 scale-95 blur-sm': !searchFilterVisible,
    }"
  >
    <div class="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
      <!-- Search Input -->
      <div class="flex-1 max-w-2xl">
        <div v-if="hasTranslations" class="relative group">
          <input
            :value="searchQuery"
            @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            type="text"
            :placeholder="t('news.search.placeholder')"
            class="w-full px-6 py-4 pl-14 bg-white border-2 border-zinc-200 focus:ring-0 focus:border-[#FFCD4B] transition-all duration-300 text-zinc-800 placeholder-zinc-500 hover:border-zinc-300 outline-none"
          />
          <svg
            class="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-[#FFCD4B] transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div v-else class="h-14 bg-zinc-200 animate-pulse"></div>
      </div>

      <!-- Category Filter -->
      <div v-if="hasTranslations" class="flex flex-wrap gap-3">
        <button
          v-for="(label, category) in categoryLabels"
          :key="category"
          @click="emit('handleCategoryChange', category)"
          :disabled="isLoadingCategories"
          :class="[
            'px-6 py-2.5 text-sm uppercase tracking-wider font-light transition-all duration-300 transform hover:scale-105',
            selectedCategory === category
              ? 'bg-black text-[#FFCD4B] shadow-lg'
              : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300',
            isLoadingCategories && 'opacity-60 cursor-not-allowed',
          ]"
        >
          <span
            v-if="isLoadingCategories"
            class="inline-block w-4 h-4 border-2 border-transparent border-t-[#FFCD4B] rounded-full animate-spin mr-2"
          ></span>
          {{ label }}
        </button>
      </div>
      <div v-else class="flex flex-wrap gap-3">
        <div v-for="n in 5" :key="n" class="h-11 w-24 bg-zinc-200 animate-pulse"></div>
      </div>
    </div>
  </div>
</template>
