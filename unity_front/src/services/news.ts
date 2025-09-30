import api from '@/plugins/axios/api'
import { useLocaleStore } from '@/stores/ui/locale'
import { useTranslationsStore } from '@/stores/ui/translations'

// Flag to prevent duplicate translation requests during page load
let translationsRequested = false

// Function to reset the flag (useful for testing or when navigating between pages)
export const resetTranslationFlag = () => {
  translationsRequested = false
}

// Public endpoints
export const getNews = async (params?: {
  category?: string
  featured?: boolean
  search?: string
  per_page?: number
  page?: number
}) => {
  const localeStore = useLocaleStore()
  const translationsStore = useTranslationsStore()

  const queryString = new URLSearchParams()
  queryString.append('locale', localeStore.currentLocale)

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

  return api.get(`/news?${queryString}`)
}

export const getNewsArticle = async (id: number) => {
  const localeStore = useLocaleStore()
  const translationsStore = useTranslationsStore()

  const queryString = new URLSearchParams()
  queryString.append('locale', localeStore.currentLocale)

  // Only request translation groups for individual article pages that might need them
  const missingGroups = translationsStore.getMissingGroups('news')
  if (missingGroups.length > 0) {
    missingGroups.forEach((group) => queryString.append('groups[]', group))
  }

  return api.get(`/news/${id}?${queryString}`)
}

export const getRecentNews = async (params?: { limit?: number }) => {
  const localeStore = useLocaleStore()

  const queryString = new URLSearchParams()
  queryString.append('locale', localeStore.currentLocale)

  // Don't request translation groups - let the main getNews call handle translations

  if (params?.limit) queryString.append('limit', params.limit.toString())

  return api.get(`/news/recent?${queryString}`)
}

export const getFeaturedNews = async () => {
  const localeStore = useLocaleStore()

  const queryString = new URLSearchParams()
  queryString.append('locale', localeStore.currentLocale)

  // Never request translation groups - let the main getNews call handle translations

  return api.get(`/news/featured?${queryString}`)
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
