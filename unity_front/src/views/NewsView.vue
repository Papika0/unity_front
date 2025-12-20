<script setup lang="ts">
import { useNewsList } from './news/composables'
import { useScrollAnimation } from '@/composables/useScrollAnimation'
import {
  NewsHero,
  NewsFilters,
  NewsFeatured,
  NewsGrid,
  NewsPagination,
} from './news/components'

const {
  t,
  newsStore,
  scrollProgress,
  selectedCategory,
  searchQuery,
  isLoading,
  isLoadingCategories,
  isTransitioning,
  hasTranslations,
  categoryLabels,
  featuredArticle,
  formatDate,
  handleCategoryChange,
  handlePageChange,
  generatePageNumbers,
} = useNewsList()

// Internal scroll animation for articles header
const { element: articlesHeaderElement, isVisible: articlesHeaderVisible } = useScrollAnimation({ 
  once: false, 
  threshold: 0.05, 
  rootMargin: '200px' 
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section -->
    <NewsHero
      :scrollProgress="scrollProgress"
      :hasTranslations="hasTranslations"
      :t="t"
    />

    <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 py-16">
      <!-- Search and Filter Section -->
      <NewsFilters
        :searchQuery="searchQuery"
        :selectedCategory="selectedCategory"
        :categoryLabels="categoryLabels"
        :isLoadingCategories="isLoadingCategories"
        :hasTranslations="hasTranslations"
        :t="t"
        @update:searchQuery="searchQuery = $event"
        @handleCategoryChange="handleCategoryChange"
      />

      <!-- Loading State with Skeleton Cards -->
      <div v-if="isLoading && !newsStore.articles.length">
        <!-- Skeleton Featured Article -->
        <div class="mb-20">
          <div class="text-center mb-12">
            <div class="h-10 w-64 bg-zinc-200 mx-auto mb-4 animate-pulse"></div>
            <div class="w-20 h-0.5 bg-[#FFCD4B] mx-auto"></div>
          </div>
          <div class="bg-white overflow-hidden shadow-xl border border-zinc-100">
            <div class="lg:flex">
              <div class="lg:w-3/5 bg-zinc-200 animate-pulse h-64 lg:h-96"></div>
              <div class="lg:w-2/5 p-8 lg:p-12 space-y-4">
                <div class="flex items-center gap-4">
                  <div class="h-6 w-24 bg-zinc-200 animate-pulse"></div>
                  <div class="h-4 w-32 bg-zinc-200 animate-pulse"></div>
                </div>
                <div class="h-8 w-full bg-zinc-200 animate-pulse"></div>
                <div class="h-8 w-4/5 bg-zinc-200 animate-pulse"></div>
                <div class="space-y-2">
                  <div class="h-4 w-full bg-zinc-200 animate-pulse"></div>
                  <div class="h-4 w-full bg-zinc-200 animate-pulse"></div>
                  <div class="h-4 w-3/4 bg-zinc-200 animate-pulse"></div>
                </div>
                <div class="h-10 w-32 bg-zinc-200 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Skeleton Grid -->
        <div class="text-center mb-12">
          <div class="h-10 w-48 bg-zinc-200 mx-auto mb-4 animate-pulse"></div>
          <div class="w-20 h-0.5 bg-[#FFCD4B] mx-auto mb-6"></div>
          <div class="h-4 w-64 bg-zinc-200 mx-auto animate-pulse"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div
            v-for="n in 9"
            :key="n"
            class="bg-white overflow-hidden shadow-sm border border-zinc-100"
          >
            <div class="bg-zinc-200 h-56 animate-pulse"></div>
            <div class="p-6 space-y-4">
              <div class="flex items-center gap-2">
                <div class="h-6 w-20 bg-zinc-200 animate-pulse"></div>
                <div class="h-4 w-24 bg-zinc-200 animate-pulse"></div>
              </div>
              <div class="h-6 w-full bg-zinc-200 animate-pulse"></div>
              <div class="h-6 w-4/5 bg-zinc-200 animate-pulse"></div>
              <div class="space-y-2">
                <div class="h-4 w-full bg-zinc-200 animate-pulse"></div>
                <div class="h-4 w-full bg-zinc-200 animate-pulse"></div>
                <div class="h-4 w-2/3 bg-zinc-200 animate-pulse"></div>
              </div>
              <div class="h-8 w-28 bg-zinc-200 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-if="!isLoading || newsStore.articles.length">
        <!-- Featured Article -->
        <NewsFeatured
          :featuredArticle="featuredArticle"
          :selectedCategory="selectedCategory"
          :searchQuery="searchQuery"
          :isTransitioning="isTransitioning"
          :categoryLabels="categoryLabels"
          :formatDate="formatDate"
          :t="t"
        />

        <!-- Articles Header -->
        <div ref="articlesHeaderElement" class="text-center mb-12 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          :class="{
            'opacity-100 translate-y-0': articlesHeaderVisible && !isTransitioning,
            'opacity-0 translate-y-8': !articlesHeaderVisible || isTransitioning,
          }"
        >
          <h2 class="text-3xl md:text-4xl font-light text-zinc-900 mb-4">
            {{ searchQuery.trim() ? t('news.searchResults') : t('news.allNews') }}
          </h2>
          <div class="w-20 h-0.5 bg-[#FFCD4B] mx-auto mb-6 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 origin-center"
            :class="{
              'scale-x-100': articlesHeaderVisible,
              'scale-x-0': !articlesHeaderVisible,
            }"
          ></div>
          <p class="text-zinc-600 font-light">
            {{ newsStore.pagination.total }} {{ t('news.pagination.articles') }},
            {{ t('news.pagination.page') }} {{ newsStore.pagination.current_page }} /
            {{ newsStore.pagination.last_page }}
          </p>
        </div>

        <!-- No Results -->
        <div v-if="newsStore.articles.length === 0" class="text-center py-20">
          <div class="text-5xl mb-6 text-zinc-300">📰</div>
          <h3 class="text-xl font-light text-zinc-800 mb-3">{{ t('news.noResults.title') }}</h3>
          <p class="text-zinc-600 text-base font-light">{{ t('news.noResults.description') }}</p>
        </div>

        <!-- Articles Grid -->
        <NewsGrid
          v-else
          :articles="newsStore.articles"
          :isTransitioning="isTransitioning"
          :categoryLabels="categoryLabels"
          :formatDate="formatDate"
          :t="t"
        />

        <!-- Pagination -->
        <NewsPagination
          :pagination="newsStore.pagination"
          :generatePageNumbers="generatePageNumbers"
          @handlePageChange="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #18181b;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #ffcd4b, #ebb738, #c89116);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #ebb738, #c89116, #a37814);
}

/* Selection color */
::selection {
  background: #ffcd4b;
  color: #000;
}

::-moz-selection {
  background: #ffcd4b;
  color: #000;
}
</style>
