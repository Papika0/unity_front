import api from '@/plugins/axios/api'
import type { GalleryImage } from './galleryApi'

// Locale is now sent via Accept-Language header automatically
export interface GalleryPageParams {
  groups?: string[]
  category?: string
  page?: number
  limit?: number
}

export interface GalleryPageResponse {
  translations: Record<string, string>
  gallery_images: GalleryImage[]
  categories: string[]
  meta: {
    locale: string
    cached_at: string
    current_page: number
    per_page: number
    has_more_pages: boolean
  }
}

export const getGalleryPage = async (params: GalleryPageParams = {}) => {
  return api.get('/gallery-page', { params })
}
