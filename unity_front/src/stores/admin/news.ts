import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAdminNews,
  getAdminNewsArticle,
  createNews,
  updateNews,
  deleteNews,
} from '@/services/news'
import type { NewsTranslation, NewsArticle } from '@/types'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

interface PaginationMeta {
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}

interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export const useAdminNewsStore = defineStore('adminNews', () => {
  // State
  const articles = ref<NewsArticle[]>([])
  const currentArticle = ref<NewsArticle | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const validationErrors = ref<Record<string, string[]>>({})
  const searchQuery = ref('')
  const selectedCategory = ref('')

  // Pagination state
  const currentPage = ref(1)
  const perPage = ref(15)
  const totalPages = ref(1)
  const totalItems = ref(0)

  // Getters
  const activeArticles = computed(() =>
    Array.isArray(articles.value) ? articles.value.filter((article) => article.is_active) : [],
  )
  const featuredArticles = computed(() =>
    Array.isArray(articles.value) ? articles.value.filter((article) => article.is_featured) : [],
  )
  const articlesCount = computed(() => totalItems.value)

  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  const paginationInfo = computed(() => ({
    currentPage: currentPage.value,
    totalPages: totalPages.value,
    totalItems: totalItems.value,
    perPage: perPage.value,
    hasNext: hasNextPage.value,
    hasPrev: hasPrevPage.value,
    from: (currentPage.value - 1) * perPage.value + 1,
    to: Math.min(currentPage.value * perPage.value, totalItems.value),
  }))

  const categorizedArticles = computed(() => {
    const categorized: Record<string, NewsArticle[]> = {
      company: [],
      project: [],
      industry: [],
      event: [],
    }

    if (Array.isArray(articles.value)) {
      articles.value.forEach((article) => {
        if (!categorized[article.category]) {
          categorized[article.category] = []
        }
        categorized[article.category].push(article)
      })
    }
    return categorized
  })

  // Actions
  const loadArticles = async (page: number = 1) => {
    loading.value = true
    error.value = ''

    try {
      const params = {
        page,
        per_page: perPage.value,
        search: searchQuery.value || undefined,
        category: selectedCategory.value || undefined,
      }

      const response = await getAdminNews(params)

      // Handle the nested data structure from the API
      // API returns: {success: true, data: {data: [...], meta: {...}}}
      if (response.data && response.data.data) {
        const result = response.data.data as PaginatedResponse<NewsArticle>
        articles.value = result.data || []

        // Update pagination state from meta
        if (result.meta) {
          currentPage.value = result.meta.current_page
          totalPages.value = result.meta.last_page
          totalItems.value = result.meta.total
          perPage.value = result.meta.per_page
        }
      } else if (response.data && Array.isArray(response.data)) {
        articles.value = response.data
        // Fallback pagination info
        totalItems.value = response.data.length
        totalPages.value = 1
        currentPage.value = 1
      } else {
        articles.value = []
        totalItems.value = 0
        totalPages.value = 1
        currentPage.value = 1
      }
    } catch (err: any) {
      error.value = 'Failed to load articles'
      console.error('Admin news load error:', err)
      articles.value = []
      totalItems.value = 0
      totalPages.value = 1
      currentPage.value = 1
    } finally {
      loading.value = false
    }
  }

  const loadArticle = async (id: number) => {
    try {
      loading.value = true
      error.value = ''
      const response = await getAdminNewsArticle(id)
      currentArticle.value = response.data || null
    } catch (err) {
      error.value = 'Failed to load article'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const fetchArticle = async (
    id: number,
  ): Promise<{ success: boolean; data?: NewsArticle; error?: string }> => {
    try {
      loading.value = true
      error.value = ''

      const response = await getAdminNewsArticle(id)
      const article: NewsArticle = response.data.data || response.data

      // Update current article and articles array if needed
      currentArticle.value = article
      const index = articles.value.findIndex((a: NewsArticle) => a.id === id)
      if (index !== -1) {
        articles.value[index] = article
      }

      return { success: true, data: article }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch article'
      error.value = errorMessage
      console.error('fetchArticle error:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const addArticle = async (articleData: FormData) => {
    try {
      saving.value = true
      error.value = ''
      validationErrors.value = {}

      const response = await createNews(articleData)
      const newArticle: NewsArticle = response.data.data

      articles.value.unshift(newArticle)
      currentArticle.value = newArticle

      return { success: true, data: newArticle }
    } catch (err: any) {
      console.error('addArticle error:', err)

      // Handle validation errors (422)
      if (err?.response?.status === 422 && err?.response?.data?.errors) {
        validationErrors.value = err.response.data.errors
        error.value = err?.response?.data?.message || 'Validation failed'
        return { success: false, error: error.value, validationErrors: validationErrors.value }
      }

      // Handle other errors
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to create article'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      saving.value = false
    }
  }

  const editArticle = async (id: number, articleData: FormData) => {
    try {
      saving.value = true
      error.value = ''
      validationErrors.value = {}

      const response = await updateNews(id, articleData)
      const updatedArticle: NewsArticle = response.data.data

      // Update the article in the array
      const index = articles.value.findIndex((article) => article.id === id)
      if (index !== -1) {
        articles.value[index] = updatedArticle
      }

      // Update current article if it's the one being edited
      if (currentArticle.value?.id === id) {
        currentArticle.value = updatedArticle
      }

      return { success: true, data: updatedArticle }
    } catch (err: any) {
      console.error('editArticle error:', err)

      // Handle validation errors (422)
      if (err?.response?.status === 422 && err?.response?.data?.errors) {
        validationErrors.value = err.response.data.errors
        error.value = err?.response?.data?.message || 'Validation failed'
        return { success: false, error: error.value, validationErrors: validationErrors.value }
      }

      // Handle other errors
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to update article'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      saving.value = false
    }
  }

  const removeArticle = async (id: number) => {
    try {
      saving.value = true
      error.value = ''

      await deleteNews(id)

      // Remove from array
      articles.value = articles.value.filter((article) => article.id !== id)

      // Clear current article if it's the one being deleted
      if (currentArticle.value?.id === id) {
        currentArticle.value = null
      }

      return { success: true }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || 'Failed to delete article'
      error.value = errorMessage
      console.error('removeArticle error:', err)
      return { success: false, error: errorMessage }
    } finally {
      saving.value = false
    }
  }

  const searchArticles = async (query: string) => {
    searchQuery.value = query
    currentPage.value = 1 // Reset to first page when searching
    await loadArticles(1)
  }

  const filterByCategory = async (category: string) => {
    selectedCategory.value = category
    currentPage.value = 1 // Reset to first page when filtering
    await loadArticles(1)
  }

  const goToPage = async (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      await loadArticles(page)
    }
  }

  const nextPage = async () => {
    if (hasNextPage.value) {
      await loadArticles(currentPage.value + 1)
    }
  }

  const prevPage = async () => {
    if (hasPrevPage.value) {
      await loadArticles(currentPage.value - 1)
    }
  }

  const clearFilters = async () => {
    searchQuery.value = ''
    selectedCategory.value = ''
    currentPage.value = 1
    await loadArticles(1)
  }

  const clearValidationErrors = () => {
    validationErrors.value = {}
    error.value = ''
  }

  const clearError = () => {
    error.value = ''
  }

  const clearCurrentArticle = () => {
    currentArticle.value = null
  }

  return {
    // State
    articles,
    currentArticle,
    loading,
    saving,
    error,
    validationErrors,
    searchQuery,
    selectedCategory,

    // Pagination state
    currentPage,
    perPage,
    totalPages,
    totalItems,

    // Getters
    activeArticles,
    featuredArticles,
    articlesCount,
    categorizedArticles,
    hasNextPage,
    hasPrevPage,
    paginationInfo,

    // Actions
    loadArticles,
    loadArticle,
    fetchArticle,
    addArticle,
    editArticle,
    removeArticle,
    searchArticles,
    filterByCategory,
    goToPage,
    nextPage,
    prevPage,
    clearFilters,
    clearValidationErrors,
    clearError,
    clearCurrentArticle,
  }
})

export type { NewsArticle }
