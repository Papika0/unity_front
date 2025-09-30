import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getNews,
  getNewsArticle,
  getRecentNews,
  getFeaturedNews,
  getNewsByCategory,
} from '@/services/news'
import type { NewsArticle } from '@/types'
import { useTranslationsStore } from '@/stores/ui/translations'

interface PaginatedResponse {
  data: NewsArticle[]
  total?: number
  per_page?: number
  current_page?: number
  last_page?: number
  meta?: {
    total: number
    per_page: number
    current_page: number
    last_page: number
    from: number
    to: number
  }
  links?: Record<string, unknown>
}

export const useNewsStore = defineStore('news', () => {
  // State
  const articles = ref<NewsArticle[]>([])
  const recentArticles = ref<NewsArticle[]>([])
  const featuredArticles = ref<NewsArticle[]>([])
  const currentArticle = ref<NewsArticle | null>(null)
  const loading = ref(false)
  const error = ref('')
  const searchQuery = ref('')
  const selectedCategory = ref('')
  const pagination = ref({
    total: 0,
    per_page: 12,
    current_page: 1,
    last_page: 1,
  })

  // Getters

  const activeArticles = computed(() => articles.value.filter((article) => article.is_active))

  const categorizedArticles = computed(() => {
    const categorized: Record<string, NewsArticle[]> = {
      company: [],
      project: [],
      industry: [],
      event: [],
    }

    activeArticles.value.forEach((article) => {
      if (!categorized[article.category]) {
        categorized[article.category] = []
      }
      categorized[article.category].push(article)
    })

    return categorized
  })

  // Actions
  const loadArticles = async (params?: {
    category?: string
    featured?: boolean
    search?: string
    per_page?: number
    page?: number
  }) => {
    try {
      loading.value = true
      error.value = ''

      const response = await getNews(params)
      const responseData = response.data

      console.log('🗞️ loadArticles: response.data:', responseData)
      console.log('🗞️ loadArticles: responseData.data:', responseData.data)
      console.log('🗞️ loadArticles: responseData.data.translations:', responseData.data?.translations)

      // Handle translations if present - they are at responseData.data.translations
      if (responseData.data?.translations) {
        const translationsStore = useTranslationsStore()
        console.log('🗞️ Merging translations:', Object.keys(responseData.data.translations).length, 'keys')
        translationsStore.mergeTranslations(responseData.data.translations)
      }

      // Handle nested response structure: response.data.data
      const data: PaginatedResponse = responseData.data || responseData

      articles.value = data.data || []
      pagination.value = {
        total: data.meta?.total || data.total || 0,
        per_page: data.meta?.per_page || data.per_page || 12,
        current_page: data.meta?.current_page || data.current_page || 1,
        last_page: data.meta?.last_page || data.last_page || 1,
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load articles'
      error.value = errorMessage
      console.error('loadArticles error:', err)
    } finally {
      loading.value = false
    }
  }

  const loadRecentArticles = async (limit: number = 4) => {
    try {
      const response = await getRecentNews({ limit })
      const responseData = response.data

      // Handle translations if present
      if (responseData.translations) {
        const translationsStore = useTranslationsStore()
        translationsStore.mergeTranslations(responseData.translations)
      }

      // Handle nested response structure
      const data = responseData.data || responseData
      recentArticles.value = Array.isArray(data) ? data : []
    } catch (err: unknown) {
      console.error('loadRecentArticles error:', err)
    }
  }

  const loadFeaturedArticles = async () => {
    try {
      const response = await getFeaturedNews()
      const responseData = response.data

      // Handle translations if present
      if (responseData.translations) {
        const translationsStore = useTranslationsStore()
        translationsStore.mergeTranslations(responseData.translations)
      }

      // Handle nested response structure
      const data = responseData.data || responseData
      featuredArticles.value = Array.isArray(data) ? data : []
    } catch (err: unknown) {
      console.error('loadFeaturedArticles error:', err)
    }
  }

  const loadArticlesByCategory = async (category: string) => {
    try {
      loading.value = true
      error.value = ''

      const response = await getNewsByCategory(category)
      // Handle nested response structure
      const data = response.data.data || response.data
      articles.value = Array.isArray(data) ? data : []
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load articles'
      error.value = errorMessage
      console.error('loadArticlesByCategory error:', err)
    } finally {
      loading.value = false
    }
  }

  const loadArticle = async (id: number) => {
    try {
      loading.value = true
      error.value = ''

      const response = await getNewsArticle(id)
      const responseData = response.data

      console.log('loadArticle: Full response:', response)
      console.log('loadArticle: responseData:', responseData)
      console.log('loadArticle: responseData.data:', responseData.data)
      console.log(
        'loadArticle: responseData.data.translations keys:',
        responseData.data?.translations ? Object.keys(responseData.data.translations).length : 'none',
      )

      // Handle translations if present - they are at responseData.data.translations
      if (responseData.data?.translations) {
        const translationsStore = useTranslationsStore()
        translationsStore.mergeTranslations(responseData.data.translations)
        console.log('loadArticle: Merged translations')
      }

      // Extract the actual article data from responseData.data.data
      const articleData = responseData.data?.data || responseData.data
      console.log('loadArticle: Setting currentArticle to:', articleData)
      currentArticle.value = articleData || null

      return currentArticle.value
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load article'
      error.value = errorMessage
      console.error('loadArticle error:', err)
      currentArticle.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  const searchArticles = async (query: string) => {
    searchQuery.value = query
    await loadArticles({ search: query })
  }

  const filterByCategory = async (category: string) => {
    selectedCategory.value = category
    if (category) {
      await loadArticlesByCategory(category)
    } else {
      await loadArticles()
    }
  }

  const loadMore = async () => {
    if (pagination.value.current_page < pagination.value.last_page) {
      const nextPage = pagination.value.current_page + 1
      await loadArticles({
        page: nextPage,
        search: searchQuery.value || undefined,
        category: selectedCategory.value || undefined,
      })
    }
  }

  const clearFilters = async () => {
    searchQuery.value = ''
    selectedCategory.value = ''
    await loadArticles()
  }

  const clearError = () => {
    error.value = ''
  }

  const clearCurrentArticle = () => {
    currentArticle.value = null
  }

  // Initialize store with recent articles for homepage
  const initialize = async () => {
    await loadRecentArticles()
    await loadFeaturedArticles()
  }

  // Custom patch method with cache update
  const $patch = (
    state: Partial<{
      recentArticles: NewsArticle[]
      featuredArticles: NewsArticle[]
      articles: NewsArticle[]
    }>,
  ) => {
    if (state.recentArticles !== undefined) {
      recentArticles.value = state.recentArticles
    }
    if (state.featuredArticles !== undefined) {
      featuredArticles.value = state.featuredArticles
    }
    if (state.articles !== undefined) {
      articles.value = state.articles
    }
  }

  return {
    // State
    articles,
    recentArticles,
    featuredArticles,
    currentArticle,
    loading,
    error,
    searchQuery,
    selectedCategory,
    pagination,

    // Getters
    activeArticles,
    categorizedArticles,

    // Actions
    loadArticles,
    loadRecentArticles,
    loadFeaturedArticles,
    loadArticlesByCategory,
    loadArticle,
    searchArticles,
    filterByCategory,
    loadMore,
    clearFilters,
    clearError,
    clearCurrentArticle,
    initialize,
    $patch,
  }
})
