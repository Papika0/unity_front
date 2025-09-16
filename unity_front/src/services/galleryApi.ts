import api from '@/plugins/axios/api'

export interface GalleryImage {
  id: number
  url: string
  title: string
  project: string | null
  alt_text: string | null
  category: string | null
  created_at: string
}

export interface GalleryResponse {
  success: boolean
  data: GalleryImage[]
  meta: {
    category: string
    limit: number
    featured: boolean
    total: number
  }
}

export interface GalleryCategoriesResponse {
  success: boolean
  data: string[]
}

export interface GalleryImageResponse {
  success: boolean
  data: GalleryImage
}

export const galleryApi = {
  /**
   * Get gallery images with optional filtering
   */
  async getImages(
    params: {
      category?: string
      limit?: number
      featured?: boolean
    } = {},
  ): Promise<GalleryResponse> {
    const response = await api.get('/gallery', { params })
    return response.data
  },

  /**
   * Get available categories
   */
  async getCategories(): Promise<GalleryCategoriesResponse> {
    const response = await api.get('/gallery/categories')
    return response.data
  },

  /**
   * Get single image details
   */
  async getImage(id: number): Promise<GalleryImageResponse> {
    const response = await api.get(`/gallery/${id}`)
    return response.data
  },
}
