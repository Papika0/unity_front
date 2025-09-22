import api from '@/plugins/axios/api'
import type { GalleryImage } from './galleryApi'

export interface GalleryPageParams {
  groups?: string[]
  locale?: string
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
