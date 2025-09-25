<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useTranslations } from '../composables/useTranslations'
import { useNewsStore } from '@/stores/public/news'
import type { NewsArticle } from '@/types'

const { t } = useTranslations()
const newsStore = useNewsStore()

const selectedCategory = ref<string>('all')
const searchQuery = ref('')
const isLoading = ref(true)
const currentPage = ref(1)

const categoryLabels = {
  all: { ka: 'ყველა', en: 'All' },
  company: { ka: 'კომპანია', en: 'Company' },
  project: { ka: 'პროექტი', en: 'Project' },
  industry: { ka: 'ინდუსტრია', en: 'Industry' },
  event: { ka: 'ღონისძიება', en: 'Event' },
}

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

const loadArticles = async (page = 1, resetPagination = false) => {
  try {
    isLoading.value = true

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
    console.error('Failed to load articles:', error)
  } finally {
    isLoading.value = false
  }
}

const loadFeaturedArticle = async () => {
  try {
    await newsStore.loadFeaturedArticles()
  } catch (error) {
    console.error('Failed to load featured articles:', error)
  }
}

const handleCategoryChange = (category: string) => {
  selectedCategory.value = category
  loadArticles(1, true)
}

const handleSearch = () => {
  loadArticles(1, true)
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
  await Promise.all([loadFeaturedArticle(), loadArticles(1)])
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-stone-50">
    <!-- Hero Section -->
    <section
      class="relative bg-gradient-to-r from-slate-900 via-slate-800 to-stone-900 py-24 lg:py-32 overflow-hidden"
    >
      <div class="absolute inset-0 bg-black/20"></div>
      <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent"></div>

      <div class="relative max-w-7xl mx-auto px-4 md:px-8 text-center">
        <div class="mb-6">
          <div
            class="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-8"
          ></div>
        </div>
        <h1 class="text-5xl md:text-7xl font-light text-white mb-8 tracking-wide">
          <span class="font-thin">სია</span><span class="font-normal text-amber-400">ხლე</span
          ><span class="font-thin">ები</span>
        </h1>
        <p class="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed">
          იყავით ინფორმირებული უნიტის უახლეს პროექტებზე, მიღწევებზე და ინდუსტრიის სიახლეებზე
        </p>
        <div
          class="w-20 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-8"
        ></div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 md:px-8 py-16">
      <!-- Search and Filter Section -->
      <div class="mb-16">
        <div class="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
          <!-- Search Input -->
          <div class="flex-1 max-w-2xl">
            <div class="relative group">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="ძებნა სიახლეებში..."
                class="w-full px-6 py-4 pl-14 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/20 focus:border-amber-400 transition-all duration-300 text-slate-800 placeholder-slate-500 shadow-sm hover:shadow-md"
              />
              <svg
                class="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-500 transition-colors"
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
          </div>

          <!-- Category Filter -->
          <div class="flex flex-wrap gap-3">
            <button
              v-for="(label, category) in categoryLabels"
              :key="category"
              @click="handleCategoryChange(category)"
              :class="[
                'px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 border-2 backdrop-blur-sm',
                selectedCategory === category
                  ? 'bg-amber-400 text-slate-900 border-amber-400 shadow-lg transform scale-105'
                  : 'bg-white/60 text-slate-700 border-slate-200 hover:bg-white/80 hover:border-amber-300 hover:text-amber-700 shadow-sm',
              ]"
            >
              {{ label.ka }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex items-center justify-center py-32">
        <div class="relative">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-slate-200"></div>
          <div
            class="animate-spin rounded-full h-16 w-16 border-4 border-amber-400 border-t-transparent absolute top-0 left-0"
          ></div>
        </div>
      </div>

      <div v-else>
        <!-- Featured Article -->
        <div
          v-if="featuredArticle && selectedCategory === 'all' && !searchQuery.trim()"
          class="mb-20"
        >
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-light text-slate-800 mb-4">
              გამო<span class="text-amber-600">რჩეული</span> სიახლე
            </h2>
            <div
              class="w-16 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"
            ></div>
          </div>

          <div
            class="bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-200/50"
          >
            <div class="lg:flex">
              <div class="lg:w-3/5 relative group overflow-hidden">
                <img
                  :src="featuredArticle.main_image || 'https://placehold.co/800x500'"
                  :alt="featuredArticle.title"
                  class="w-full h-64 lg:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div class="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-center">
                <div class="flex items-center gap-4 mb-6">
                  <span
                    class="px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 text-sm font-medium rounded-full border border-amber-200"
                  >
                    {{ categoryLabels[featuredArticle.category].ka }}
                  </span>
                  <time class="text-slate-500 text-sm font-medium">
                    {{ formatDate(featuredArticle.publish_date) }}
                  </time>
                </div>

                <h3 class="text-2xl lg:text-3xl font-light text-slate-800 mb-6 leading-tight">
                  {{ featuredArticle.title }}
                </h3>

                <p class="text-slate-600 leading-relaxed mb-8 text-lg">
                  {{ featuredArticle.excerpt }}
                </p>

                <router-link
                  :to="`/news/${featuredArticle.id}`"
                  class="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium text-lg group/link"
                >
                  სრულად წაკითხვა
                  <svg
                    class="ml-3 w-5 h-5 group-hover/link:translate-x-1 transition-transform duration-300"
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

        <!-- Articles Header -->
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-light text-slate-800 mb-4">
            {{ searchQuery.trim() ? 'ძებნის შედეგები' : 'ყველა სიახლე' }}
          </h2>
          <div
            class="w-16 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent mx-auto mb-6"
          ></div>
          <p class="text-slate-600">
            {{ newsStore.pagination.total }} სტატია, გვერდი
            {{ newsStore.pagination.current_page }} / {{ newsStore.pagination.last_page }}
          </p>
        </div>

        <!-- No Results -->
        <div v-if="newsStore.articles.length === 0" class="text-center py-20">
          <div class="text-slate-300 mb-6">
            <svg class="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"
              />
            </svg>
          </div>
          <h3 class="text-2xl font-light text-slate-700 mb-3">სიახლეები ვერ მოიძებნა</h3>
          <p class="text-slate-500 text-lg">სცადეთ სხვა საძიებო სიტყვები ან კატეგორია</p>
        </div>

        <!-- Articles Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <article
            v-for="article in newsStore.articles"
            :key="article.id"
            class="group bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200/50 hover:border-amber-200"
          >
            <div class="relative overflow-hidden">
              <img
                :src="article.main_image || 'https://placehold.co/400x280'"
                :alt="article.title"
                class="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              ></div>
              <div class="absolute top-4 left-4">
                <span
                  class="px-3 py-1 bg-white/95 backdrop-blur-sm text-slate-800 text-xs font-medium rounded-full border border-slate-200"
                >
                  {{ categoryLabels[article.category].ka }}
                </span>
              </div>
              <div v-if="article.is_featured" class="absolute top-4 right-4">
                <span
                  class="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-medium rounded-full"
                >
                  ⭐ რჩეული
                </span>
              </div>
            </div>

            <div class="p-6">
              <div class="flex items-center gap-3 mb-4">
                <time class="text-slate-500 text-sm font-medium">
                  {{ formatDate(article.publish_date) }}
                </time>
                <span class="text-slate-300">•</span>
                <span class="text-slate-500 text-sm">{{ article.views }} ნახვა</span>
              </div>

              <h3
                class="text-lg font-medium text-slate-800 mb-4 line-clamp-2 group-hover:text-amber-700 transition-colors duration-300 leading-snug"
              >
                {{ article.title }}
              </h3>

              <p class="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                {{ article.excerpt }}
              </p>

              <router-link
                :to="`/news/${article.id}`"
                class="inline-flex items-center text-amber-600 hover:text-amber-700 text-sm font-medium group/link"
              >
                სრულად წაკითხვა
                <svg
                  class="ml-2 w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300"
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
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
                newsStore.pagination.current_page === 1
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50',
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
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
                  page === newsStore.pagination.current_page
                    ? 'bg-amber-400 text-slate-900 shadow-lg transform scale-105'
                    : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50',
                ]"
              >
                {{ page }}
              </button>
              <span v-else class="px-2 text-slate-400">...</span>
            </template>

            <!-- Next Button -->
            <button
              @click="handlePageChange(newsStore.pagination.current_page + 1)"
              :disabled="newsStore.pagination.current_page === newsStore.pagination.last_page"
              :class="[
                'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
                newsStore.pagination.current_page === newsStore.pagination.last_page
                  ? 'text-slate-400 cursor-not-allowed'
                  : 'text-slate-600 hover:text-amber-600 hover:bg-amber-50',
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
</style>

<style scoped>
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
</style>
