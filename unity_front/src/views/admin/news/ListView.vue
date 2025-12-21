<template>
  <div class="min-h-screen bg-white">
    <!-- Admin Header Section -->
    <NewsListHeader
      @add-news="goToAddNews"
      @open-featured-modal="openFeaturedModal"
    />

    <div class="max-w-7xl mx-auto px-4 md:px-8 py-8 sm:py-12 md:py-16">
      <!-- Search and Filter Section -->
      <NewsListFilters
        v-model:searchQuery="adminNewsStore.searchQuery"
        v-model:selectedCategory="adminNewsStore.selectedCategory"
        :articles-count="articlesCount"
        :category-options="categoryOptions"
        @search="handleSearch"
        @select-category="selectCategory"
        @clear-category="clearCategoryFilter"
      />

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-32">
        <div class="relative">
          <div class="animate-spin rounded-full h-20 w-20 border-4 border-slate-200"></div>
          <div
            class="animate-spin rounded-full h-20 w-20 border-4 border-amber-400 border-t-transparent absolute top-0 left-0"
          ></div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-3xl p-12 text-center shadow-lg"
      >
        <div class="text-red-300 mb-6">
          <svg class="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 class="text-2xl font-light text-red-800 mb-4">{{ t('admin.errors.loading_failed') }}</h3>
        <p class="text-red-600 text-lg mb-8">{{ error }}</p>
        <button
          @click="adminNewsStore.loadArticles()"
          class="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {{ t('admin.common.retry') }}
        </button>
      </div>

      <div v-else>
        <!-- Articles Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-light text-slate-800 mb-4">
            {{ adminNewsStore.searchQuery ? t('admin.messages.no_results') : t('admin.news.title') }}
          </h2>
          <div
            class="w-16 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-6"
          ></div>
        </div>

        <!-- Empty State -->
        <NewsEmptyState
          v-if="articles.length === 0"
          :has-search-query="!!adminNewsStore.searchQuery"
          @add-first="goToAddNews"
        />

        <!-- News Grid -->
        <NewsGrid
          v-else
          :articles="articles"
          @view="goToView"
          @edit="goToEdit"
          @delete="confirmDelete"
        />

        <!-- Pagination Controls -->
        <NewsPagination
          :current-page="paginationInfo.currentPage"
          :total-pages="paginationInfo.totalPages"
          :total-items="paginationInfo.totalItems"
          :from="paginationInfo.from"
          :to="paginationInfo.to"
          :has-prev="paginationInfo.hasPrev"
          :has-next="paginationInfo.hasNext"
          :loading="loading"
          @prev="adminNewsStore.prevPage()"
          @next="adminNewsStore.nextPage()"
          @go-to-page="adminNewsStore.goToPage"
        />
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <NewsDeleteModal
      :show="showDeleteModal"
      :article-title="articleToDelete?.title.ka || ''"
      :saving="saving"
      @cancel="cancelDelete"
      @confirm="deleteNews"
    />

    <!-- Featured News Selection Modal -->
    <NewsFeaturedModal
      :show="showFeaturedModal"
      :saving="savingFeatured"
      :featured-articles="featuredArticles"
      :all-articles="allArticles"
      :selected-news-ids="selectedNewsIds"
      :can-select-more="canSelectMore"
      @cancel="cancelFeaturedSelection"
      @confirm="saveFeaturedNews"
      @toggle-selection="toggleNewsSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useNewsList } from './composables/useNewsList'
import NewsListHeader from './components/list/NewsListHeader.vue'
import NewsListFilters from './components/list/NewsListFilters.vue'
import NewsGrid from './components/list/NewsGrid.vue'
import NewsEmptyState from './components/list/NewsEmptyState.vue'
import NewsPagination from './components/list/NewsPagination.vue'
import NewsDeleteModal from './components/modals/NewsDeleteModal.vue'
import NewsFeaturedModal from './components/modals/NewsFeaturedModal.vue'

const { t } = useTranslations()

const {
  // State
  adminNewsStore,
  showDeleteModal,
  articleToDelete,
  showFeaturedModal,
  selectedNewsIds,
  savingFeatured,
  categoryOptions,

  // Computed
  articles,
  allArticles,
  articlesCount,
  featuredArticles,
  loading,
  saving,
  error,
  paginationInfo,
  canSelectMore,

  // Methods
  goToAddNews,
  handleSearch,
  selectCategory,
  clearCategoryFilter,
  goToView,
  goToEdit,
  confirmDelete,
  cancelDelete,
  deleteNews,
  openFeaturedModal,
  cancelFeaturedSelection,
  toggleNewsSelection,
  saveFeaturedNews
} = useNewsList()
</script>
