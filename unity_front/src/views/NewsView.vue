<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTranslations } from '../composables/useTranslations'
import { useTranslationsStore } from '@/stores/ui/translations'
import { useNewsStore } from '@/stores/public/news'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

const { t } = useTranslations()
const newsStore = useNewsStore()
const translationsStore = useTranslationsStore()

const scrollProgress = ref(0)

// Scroll animation refs
const { element: heroElement, isVisible: heroVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
const { element: searchFilterElement, isVisible: searchFilterVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
const { element: featuredElement, isVisible: featuredVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
const { element: articlesHeaderElement, isVisible: articlesHeaderVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
const { element: articlesGridElement, isVisible: articlesGridVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })

// Scroll progress tracking
const handleScroll = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = (scrollTop / docHeight) * 100
}

// Check if translations are loaded by checking the store directly
const hasTranslations = computed(() => {
  // Check if we have any translations loaded
  return Object.keys(translationsStore.translations).length > 0
})

const selectedCategory = ref<string>('all')
const searchQuery = ref('')
const isLoading = ref(true)
const isLoadingCategories = ref(false)
const isTransitioning = ref(false)
const currentPage = ref(1)

const categoryLabels = computed(() => ({
  all: t('news.categories.all'),
  company: t('news.categories.company'),
  project: t('news.categories.project'),
  industry: t('news.categories.industry'),
  event: t('news.categories.event'),
}))

const featuredArticle = computed(() => {
  return newsStore.featuredArticles.find((article) => article.is_featured) || null
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const loadArticles = async (page = 1, resetPagination = false, isCategoryChange = false) => {
  try {
    // Only show main loading for initial load, not for category/search changes
    if (!isCategoryChange && page === 1 && !resetPagination) {
      isLoading.value = true
    } else if (isCategoryChange) {
      isLoadingCategories.value = true
    }

    const params = {
      page,
      per_page: 9,
      ...(selectedCategory.value !== 'all' && { category: selectedCategory.value }),
      ...(searchQuery.value.trim() && { search: searchQuery.value.trim() }),
    }

    await newsStore.loadArticles(params)

    if (resetPagination) {
      currentPage.value = 1
    } else {
      currentPage.value = page
    }
  } catch (error) {
    // Error handling
  } finally {
    isLoading.value = false
    isLoadingCategories.value = false
  }
}

const loadFeaturedArticle = async () => {
  try {
    await newsStore.loadFeaturedArticles()
  } catch (error) {
    // Error handling
  }
}

const handleCategoryChange = async (category: string) => {
  if (category === selectedCategory.value || isTransitioning.value) return

  // Start transition
  isTransitioning.value = true

  // Wait for fade-out animation
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Update category and load articles
  selectedCategory.value = category
  await loadArticles(1, true, true)

  // Small delay before fade-in
  await new Promise((resolve) => setTimeout(resolve, 50))

  // End transition
  isTransitioning.value = false
}

const handleSearch = () => {
  loadArticles(1, true, true)
}

const handlePageChange = (page: number) => {
  loadArticles(page)
  // Smooth scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const generatePageNumbers = () => {
  const current = newsStore.pagination.current_page
  const last = newsStore.pagination.last_page
  const delta = 2 // Number of pages to show on each side of current page

  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
    range.push(i)
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (current + delta < last - 1) {
    rangeWithDots.push('...', last)
  } else if (last > 1) {
    rangeWithDots.push(last)
  }

  return rangeWithDots
}

// Watch for search query changes with debounce
let searchTimeout: number
watch(searchQuery, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 500)
})

onMounted(async () => {
  // Load regular articles first (this will load translations)
  await loadArticles(1)
  // Then load featured articles (translations should already be loaded)
  await loadFeaturedArticle()
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Scroll Progress Bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50">
      <div
        class="h-full bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transition-all duration-150 ease-out shadow-[0_0_15px_rgba(255,205,75,0.6)]"
        :style="{ width: scrollProgress + '%' }"
      ></div>
    </div>

    <!-- Hero Section -->
    <section ref="heroElement" class="relative h-[45vh] min-h-[350px] overflow-hidden bg-black">
      <!-- Diagonal overlay accent -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-[#FFCD4B]/10 via-transparent to-transparent"
      ></div>

      <!-- Decorative corner elements -->
      <div class="absolute top-0 right-0 w-64 h-64 opacity-20 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="{
          'translate-x-0 translate-y-0': heroVisible,
          'translate-x-12 -translate-y-12': !heroVisible,
        }"
      >
        <div
          class="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-[#FFCD4B]"
        ></div>
      </div>
      <div class="absolute bottom-0 left-0 w-64 h-64 opacity-20 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="{
          'translate-x-0 translate-y-0': heroVisible,
          '-translate-x-12 translate-y-12': !heroVisible,
        }"
      >
        <div
          class="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-[#FFCD4B]"
        ></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 h-full flex flex-col justify-center">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 w-full">
          <div class="max-w-3xl transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            :class="{
              'opacity-100 translate-y-0 scale-100 blur-0': heroVisible,
              'opacity-0 translate-y-12 scale-95 blur-sm': !heroVisible,
            }"
          >
            <h1
              class="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight text-white transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100"
              :class="{
                'opacity-100 translate-y-0': heroVisible,
                'opacity-0 translate-y-8': !heroVisible,
              }"
            >
              <span v-if="hasTranslations">{{ t('news.title') }}</span>
              <span v-else class="inline-block h-12 w-48 bg-white/10 rounded animate-pulse"></span>
            </h1>
            <div class="w-20 h-1 bg-gradient-to-r from-[#FFCD4B] to-transparent mb-6 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 origin-left"
              :class="{
                'scale-x-100': heroVisible,
                'scale-x-0': !heroVisible,
              }"
            ></div>
            <p class="text-lg md:text-xl text-[#FFCD4B] font-light leading-relaxed max-w-2xl transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-300"
              :class="{
                'opacity-100 translate-y-0': heroVisible,
                'opacity-0 translate-y-8': !heroVisible,
              }"
            >
              <span v-if="hasTranslations">{{ t('news.description') }}</span>
              <span v-else class="inline-block h-8 w-96 bg-white/10 rounded animate-pulse"></span>
            </p>
          </div>
        </div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 py-16">
      <!-- Search and Filter Section -->
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
                v-model="searchQuery"
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
              @click="handleCategoryChange(category)"
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

      <!-- Loading State with Skeleton Cards (only show after brief delay to allow translations to load) -->
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

        <!-- Skeleton Articles Header -->
        <div class="text-center mb-12">
          <div class="h-10 w-48 bg-zinc-200 mx-auto mb-4 animate-pulse"></div>
          <div class="w-20 h-0.5 bg-[#FFCD4B] mx-auto mb-6"></div>
          <div class="h-4 w-64 bg-zinc-200 mx-auto animate-pulse"></div>
        </div>

        <!-- Skeleton Articles Grid -->
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

      <!-- Content (show even while loading if we have data from cache/previous load) -->
      <div v-if="!isLoading || newsStore.articles.length">
        <!-- Featured Article -->
        <div
          ref="featuredElement"
          v-if="featuredArticle && selectedCategory === 'all' && !searchQuery.trim()"
          class="mb-20 transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          :class="{
            'opacity-100 translate-y-0 scale-100 blur-0': featuredVisible && !isTransitioning,
            'opacity-0 translate-y-12 scale-95 blur-sm': !featuredVisible || isTransitioning,
          }"
        >
          <div class="text-center mb-12 transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            :class="{
              'opacity-100 translate-y-0': featuredVisible,
              'opacity-0 translate-y-8': !featuredVisible,
            }"
          >
            <h2 class="text-3xl md:text-4xl font-light text-zinc-900 mb-4">
              {{ t('news.featured.title') }}
            </h2>
            <div class="w-20 h-0.5 bg-[#FFCD4B] mx-auto transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200 origin-center"
              :class="{
                'scale-x-100': featuredVisible,
                'scale-x-0': !featuredVisible,
              }"
            ></div>
          </div>

          <div
            class="group bg-white overflow-hidden hover:shadow-2xl transition-all duration-500 border border-zinc-100 hover:border-[#FFCD4B]/30 relative"
          >
            <div class="lg:flex">
              <div class="lg:w-3/5 relative overflow-hidden">
                <img
                  :src="featuredArticle.main_image?.url || 'https://placehold.co/800x500'"
                  :alt="featuredArticle.main_image?.alt_text || featuredArticle.title"
                  class="w-full h-64 lg:h-96 object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <!-- Golden accent line on hover -->
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </div>

              <div class="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center relative">
                <!-- Subtle background accent -->
                <div class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div class="relative z-10">
                  <div class="flex items-center gap-4 mb-6">
                    <span class="px-4 py-1.5 bg-black/5 text-zinc-800 text-sm font-light uppercase tracking-wider border border-zinc-200">
                      {{ categoryLabels[featuredArticle.category] }}
                    </span>
                    <time class="text-zinc-500 text-sm font-light">
                      {{ formatDate(featuredArticle.publish_date) }}
                    </time>
                  </div>

                  <h3 class="text-2xl lg:text-3xl font-light text-zinc-900 mb-6 leading-tight group-hover:text-[#C89116] transition-colors duration-300">
                    {{ featuredArticle.title }}
                  </h3>

                  <p class="text-zinc-700 leading-relaxed mb-8 text-base font-light">
                    {{ featuredArticle.excerpt }}
                  </p>

                  <router-link
                    :to="`/news/${featuredArticle.id}`"
                    class="inline-flex items-center gap-3 text-[#FFCD4B] hover:text-[#C89116] font-light text-sm uppercase tracking-wider group/link"
                  >
                    {{ t('news.readMore') }}
                    <svg
                      class="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>

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
        <div ref="articlesGridElement" v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <article
            v-for="(article, index) in newsStore.articles"
            :key="article.id"
            class="group bg-white overflow-hidden hover:shadow-2xl transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] border border-zinc-100 hover:border-[#FFCD4B]/30 relative"
            :class="{
              'opacity-100 translate-y-0 scale-100 blur-0': articlesGridVisible && !isTransitioning,
              'opacity-0 translate-y-12 scale-95 blur-sm': !articlesGridVisible || isTransitioning,
            }"
            :style="{ transitionDelay: isTransitioning ? '0ms' : `${index * 80}ms` }"
          >
            <div class="relative h-56 bg-zinc-100 overflow-hidden">
              <img
                :src="article.main_image?.url || 'https://placehold.co/400x280'"
                :alt="article.main_image?.alt_text || article.title"
                class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
              />

              <!-- Gradient overlay on hover -->
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              ></div>

              <!-- Golden accent line on hover -->
              <div
                class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
              ></div>

              <!-- Category Badge -->
              <div class="absolute top-4 left-4">
                <span
                  class="px-3 py-1 bg-white/90 backdrop-blur-sm text-zinc-800 text-xs font-light uppercase tracking-wider"
                >
                  {{ categoryLabels[article.category] }}
                </span>
              </div>

              <!-- Featured Badge -->
              <div v-if="article.is_featured" class="absolute top-4 right-4">
                <span
                  class="px-3 py-1 bg-gradient-to-r from-[#FFCD4B] to-[#C89116] text-black text-xs font-light uppercase tracking-wider"
                >
                  {{ t('news.featured.badge') }}
                </span>
              </div>
            </div>

            <div class="p-6 bg-white relative overflow-hidden">
              <!-- Subtle background accent -->
              <div
                class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              ></div>

              <div class="relative z-10">
                <div class="flex items-center gap-3 mb-4">
                  <time class="text-zinc-500 text-sm font-light">
                    {{ formatDate(article.publish_date) }}
                  </time>
                  <span class="text-zinc-300">•</span>
                  <span class="text-zinc-500 text-sm font-light"
                    >{{ article.views }} {{ t('news.views') }}</span
                  >
                </div>

                <h3
                  class="text-lg font-light text-zinc-900 mb-4 line-clamp-2 group-hover:text-[#C89116] transition-colors duration-300 leading-snug"
                >
                  {{ article.title }}
                </h3>

                <p class="text-zinc-600 text-sm mb-6 line-clamp-3 leading-relaxed font-light">
                  {{ article.excerpt }}
                </p>

                <router-link
                  :to="`/news/${article.id}`"
                  class="inline-flex items-center gap-2 text-[#FFCD4B] hover:text-[#C89116] text-sm font-light uppercase tracking-wider group/link"
                >
                  {{ t('news.readMore') }}
                  <svg
                    class="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </router-link>
              </div>
            </div>
          </article>
        </div>

        <!-- Pagination -->
        <div v-if="newsStore.pagination.last_page > 1" class="flex items-center justify-center">
          <nav class="flex items-center space-x-2">
            <!-- Previous Button -->
            <button
              @click="handlePageChange(newsStore.pagination.current_page - 1)"
              :disabled="newsStore.pagination.current_page === 1"
              :class="[
                'px-4 py-2 text-sm font-light transition-all duration-300',
                newsStore.pagination.current_page === 1
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
                @click="handlePageChange(page as number)"
                :class="[
                  'px-4 py-2 text-sm font-light transition-all duration-300',
                  page === newsStore.pagination.current_page
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
              @click="handlePageChange(newsStore.pagination.current_page + 1)"
              :disabled="newsStore.pagination.current_page === newsStore.pagination.last_page"
              :class="[
                'px-4 py-2 text-sm font-light transition-all duration-300',
                newsStore.pagination.current_page === newsStore.pagination.last_page
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
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Line clamp utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Fade in animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}

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
