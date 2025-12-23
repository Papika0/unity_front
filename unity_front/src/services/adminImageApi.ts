import api from '@/plugins/axios/api'
import type { MultilingualText } from './contactApi'

export interface AdminImage {
  id: number
  url: string
  path?: string
  title: string | MultilingualText
  project: string | null | MultilingualText
  alt_text: string | null | MultilingualText
  category: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AdminImageResponse {
  success: boolean
  data: AdminImage
  message?: string
}

export interface AdminImagesResponse {
  success: boolean
  data: {
    data: AdminImage[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  metadata?: {
    categories: string[]
    projects: string[]
  }
  message?: string
}

export interface AdminImageFilters {
  category?: string
  project?: string
  search?: string
  per_page?: number
  page?: number
}

export const adminImageApi = {
  // Get all images with pagination and filtering
  getImages: async (
    filters: AdminImageFilters = {},
    includeMetadata: boolean = false,
  ): Promise<AdminImagesResponse> => {
    const params = new URLSearchParams()

    if (filters.category) params.append('category', filters.category)
    if (filters.project) params.append('project', filters.project)
    if (filters.search) params.append('search', filters.search)
    if (filters.per_page) params.append('per_page', filters.per_page.toString())
    if (filters.page) params.append('page', filters.page.toString())
    if (includeMetadata) params.append('include_metadata', 'true')

    const url = params.toString() ? `/admin/images?${params}` : '/admin/images'
    const response = await api.get<AdminImagesResponse>(url)
    return response.data
  },

  // Get single image
  getImage: async (id: number): Promise<AdminImageResponse> => {
    const response = await api.get<AdminImageResponse>(`/admin/images/${id}`)
    return response.data
  },

  // Upload new image
  uploadImage: async (formData: FormData): Promise<AdminImageResponse> => {
    const response = await api.post<AdminImageResponse>('/admin/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Update image metadata
  updateImage: async (id: number, data: Partial<AdminImage> | FormData): Promise<AdminImageResponse> => {
    const config = data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}
    const response = await api.put<AdminImageResponse>(`/admin/images/${id}`, data, config)
    return response.data
  },

  // Delete image
  deleteImage: async (id: number): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete(`/admin/images/${id}`)
    return response.data
  },

  // Get gallery images by category
  getGalleryImages: async (category?: string): Promise<AdminImagesResponse> => {
    const params = category ? `?category=${category}` : ''
    const response = await api.get<AdminImagesResponse>(`/admin/images/gallery${params}`)
    return response.data
  },

  // Get available categories
  getCategories: async (): Promise<{ success: boolean; data: string[] }> => {
    const response = await api.get<{ success: boolean; data: string[] }>('/admin/images/categories')
    return response.data
  },

  // Get available projects
  getProjects: async (): Promise<{ success: boolean; data: string[] }> => {
    const response = await api.get<{ success: boolean; data: string[] }>('/admin/images/projects')
    return response.data
  },

  // Attach image to model
  attachImage: async (
    imageId: number,
    modelType: string,
    modelId: number,
    type: string = 'gallery',
    sortOrder: number = 0,
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post('/admin/images/attach', {
      image_id: imageId,
      model_type: modelType,
      model_id: modelId,
      type,
      sort_order: sortOrder,
    })
    return response.data
  },

  // Detach image from model
  detachImage: async (
    imageId: number,
    modelType: string,
    modelId: number,
    type: string = 'gallery',
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await api.post('/admin/images/detach', {
      image_id: imageId,
      model_type: modelType,
      model_id: modelId,
      type,
    })
    return response.data
  },
}
