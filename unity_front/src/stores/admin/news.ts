import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AxiosError } from 'axios'
import {
  getAdminNews,
  getAdminNewsArticle,
  createNews,
  updateNews,
  deleteNews,
  setFeaturedNews,
  getArticlesForFeaturedModal,
} from '@/services/news'
import type { AdminNewsArticle } from '@/types'

export const useAdminNewsStore = defineStore('adminNews', () => {
  // State
  const articles = ref<AdminNewsArticle[]>([])
  const currentArticle = ref<AdminNewsArticle | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const validationErrors = ref<Record<string, string[]>>({})
  const searchQuery = ref('')
  const selectedCategory = ref('')

  // Featured modal state
  const modalArticles = ref<AdminNewsArticle[]>([])
  const loadingModal = ref(false)

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
  const modalFeaturedArticles = computed(() =>
    Array.isArray(modalArticles.value)
      ? modalArticles.value.filter((article) => article.is_featured)
      : [],
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
    const categorized: Record<string, AdminNewsArticle[]> = {
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

      // Handle the simplified response structure
      if (response.data && response.data.data) {
        const result = response.data.data

        // Set paginated articles for display
        articles.value = result.data || []

        // Update pagination state from meta
        if (result.meta) {
          currentPage.value = result.meta.current_page
          totalPages.value = result.meta.last_page
          totalItems.value = result.meta.total
          perPage.value = result.meta.per_page
        }
      } else if (response.data && Array.isArray(response.data)) {
        // Fallback for old response structure
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
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      error.value = 'Failed to load article'
      console.error(err)
    } finally {
      loading.value = false
    }
  }

  const fetchArticle = async (
    id: number,
  ): Promise<{ success: boolean; data?: AdminNewsArticle; error?: string }> => {
    try {
      loading.value = true
      error.value = ''

      const response = await getAdminNewsArticle(id)
      const article: AdminNewsArticle = response.data.data || response.data

      // Update current article and articles array if needed
      currentArticle.value = article
      const index = articles.value.findIndex((a: AdminNewsArticle) => a.id === id)
      if (index !== -1) {
        articles.value[index] = article
      }

      return { success: true, data: article }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>
      const errorMessage =
        axiosError?.response?.data?.message || axiosError?.message || 'Failed to fetch article'
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
      const newArticle: AdminNewsArticle = response.data.data

      articles.value.unshift(newArticle)
      currentArticle.value = newArticle

      return { success: true, data: newArticle }
    } catch (err: unknown) {
      console.error('addArticle error:', err)

      const axiosError = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>

      // Handle validation errors (422)
      if (axiosError?.response?.status === 422 && axiosError?.response?.data?.errors) {
        validationErrors.value = axiosError.response.data.errors
        error.value = axiosError?.response?.data?.message || 'Validation failed'
        return { success: false, error: error.value, validationErrors: validationErrors.value }
      }

      // Handle other errors
      const errorMessage =
        axiosError?.response?.data?.message || axiosError?.message || 'Failed to create article'
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
      const updatedArticle: AdminNewsArticle = response.data.data

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
    } catch (err: unknown) {
      console.error('editArticle error:', err)

      const axiosError = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>

      // Handle validation errors (422)
      if (axiosError?.response?.status === 422 && axiosError?.response?.data?.errors) {
        validationErrors.value = axiosError.response.data.errors
        error.value = axiosError?.response?.data?.message || 'Validation failed'
        return { success: false, error: error.value, validationErrors: validationErrors.value }
      }

      // Handle other errors
      const errorMessage =
        axiosError?.response?.data?.message || axiosError?.message || 'Failed to update article'
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
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>
      const errorMessage =
        axiosError?.response?.data?.message || axiosError?.message || 'Failed to delete article'
      error.value = errorMessage
      console.error('removeArticle error:', err)
      return { success: false, error: errorMessage }
    } finally {
      saving.value = false
    }
  }

  const setFeaturedNewsAction = async (newsIds: number[]) => {
    try {
      saving.value = true
      error.value = ''

      await setFeaturedNews(newsIds)

      // Update the articles array with new featured status
      articles.value = articles.value.map((article) => ({
        ...article,
        is_featured: newsIds.includes(article.id),
      }))

      // Update modal articles if they exist
      modalArticles.value = modalArticles.value.map((article) => ({
        ...article,
        is_featured: newsIds.includes(article.id),
      }))

      return { success: true }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>
      const errorMessage =
        axiosError?.response?.data?.message || axiosError?.message || 'Failed to set featured news'
      error.value = errorMessage
      console.error('setFeaturedNews error:', err)
      return { success: false, error: errorMessage }
    } finally {
      saving.value = false
    }
  }

  const loadArticlesForFeaturedModal = async () => {
    try {
      loadingModal.value = true
      error.value = ''

      const response = await getArticlesForFeaturedModal()
      const result = response.data

      if (result.success) {
        modalArticles.value = result.data.articles || []
        return { success: true }
      } else {
        error.value = result.message || 'Failed to load articles for featured modal'
        return { success: false, error: result.message }
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>
      const errorMessage =
        axiosError?.response?.data?.message ||
        axiosError?.message ||
        'Failed to load articles for featured modal'
      error.value = errorMessage
      console.error('loadArticlesForFeaturedModal error:', err)
      return { success: false, error: errorMessage }
    } finally {
      loadingModal.value = false
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
    modalArticles,
    currentArticle,
    loading,
    loadingModal,
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
    modalFeaturedArticles,
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
    setFeaturedNews: setFeaturedNewsAction,
    loadArticlesForFeaturedModal,
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

export type { AdminNewsArticle }
