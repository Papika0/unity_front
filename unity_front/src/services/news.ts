import api from '@/plugins/axios/api'
import { useTranslationsStore } from '@/stores/ui/translations'

// Flag to prevent duplicate translation requests during page load
let translationsRequested = false

// Function to reset the flag (useful for testing or when navigating between pages)
export const resetTranslationFlag = () => {
  translationsRequested = false
}

// Public endpoints
// Locale is now sent via Accept-Language header automatically
export const getNews = async (params?: {
  category?: string
  featured?: boolean
  search?: string
  per_page?: number
  page?: number
}) => {
  const translationsStore = useTranslationsStore()

  const queryString = new URLSearchParams()

  // Only request translation groups if they haven't been requested yet in this session
  if (!translationsRequested && !translationsStore.arePageGroupsLoaded('news')) {
    const missingGroups = translationsStore.getMissingGroups('news')
    missingGroups.forEach((group) => queryString.append('groups[]', group))
    translationsRequested = true
  }

  if (params?.category) queryString.append('category', params.category)
  if (params?.featured) queryString.append('featured', params.featured.toString())
  if (params?.search) queryString.append('search', params.search)
  if (params?.per_page) queryString.append('per_page', params.per_page.toString())
  if (params?.page) queryString.append('page', params.page.toString())

  const queryPart = queryString.toString() ? `?${queryString}` : ''
  return api.get(`/news${queryPart}`)
}

export const getNewsArticle = async (id: number) => {
  const translationsStore = useTranslationsStore()

  const queryString = new URLSearchParams()

  // Only request translation groups for individual article pages that might need them
  const missingGroups = translationsStore.getMissingGroups('news')
  if (missingGroups.length > 0) {
    missingGroups.forEach((group) => queryString.append('groups[]', group))
  }

  const queryPart = queryString.toString() ? `?${queryString}` : ''
  return api.get(`/news/${id}${queryPart}`)
}

export const getRecentNews = async (params?: { limit?: number }) => {
  const queryString = new URLSearchParams()

  if (params?.limit) queryString.append('limit', params.limit.toString())

  const queryPart = queryString.toString() ? `?${queryString}` : ''
  return api.get(`/news/recent${queryPart}`)
}

export const getFeaturedNews = async () => {
  return api.get(`/news/featured`)
}

export const getNewsByCategory = async (category: string) => api.get(`/news/category/${category}`)

// Admin endpoints (require authentication)
export const getAdminNews = async (params?: {
  category?: string
  search?: string
  per_page?: number
  page?: number
}) => {
  const queryString = new URLSearchParams()
  if (params?.category) queryString.append('category', params.category)
  if (params?.search) queryString.append('search', params.search)
  if (params?.per_page) queryString.append('per_page', params.per_page.toString())
  if (params?.page) queryString.append('page', params.page.toString())

  const url = queryString.toString() ? `/admin/news?${queryString}` : '/admin/news'
  return api.get(url)
}

export const getAdminNewsArticle = async (id: number) => api.get(`/admin/news/${id}`)

export const createNews = async (data: FormData) =>
  api.post('/admin/news', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const updateNews = async (id: number, data: FormData) => {
  // Laravel doesn't handle PUT with multipart/form-data well, so we use POST with _method
  data.append('_method', 'PUT')
  return api.post(`/admin/news/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteNews = async (id: number) => api.delete(`/admin/news/${id}`)

export const setFeaturedNews = async (newsIds: number[]) =>
  api.post('/admin/news/set-featured', { news_ids: newsIds })

export const getArticlesForFeaturedModal = async () => api.get('/admin/news/for-featured-modal')
