import api from '@/plugins/axios/api'

// Public endpoints
export const getNews = async (params?: {
  category?: string
  featured?: boolean
  search?: string
  per_page?: number
  page?: number
}) => {
  const queryString = new URLSearchParams()
  if (params?.category) queryString.append('category', params.category)
  if (params?.featured) queryString.append('featured', params.featured.toString())
  if (params?.search) queryString.append('search', params.search)
  if (params?.per_page) queryString.append('per_page', params.per_page.toString())
  if (params?.page) queryString.append('page', params.page.toString())

  const url = queryString.toString() ? `/news?${queryString}` : '/news'
  return api.get(url)
}

export const getNewsArticle = async (id: number) => api.get(`/news/${id}`)

export const getRecentNews = async (params?: { limit?: number }) => {
  const queryString = new URLSearchParams()
  if (params?.limit) queryString.append('limit', params.limit.toString())

  const url = queryString.toString() ? `/news/recent?${queryString}` : '/news/recent'
  return api.get(url)
}

export const getFeaturedNews = async () => api.get('/news/featured')

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
