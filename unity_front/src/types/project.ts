import type { ImageData } from './common'

export interface Project {
  id: number
  title: string
  title_en: string
  title_ru: string
  title_ka: string
  description: string
  description_en: string
  description_ru: string
  description_ka: string
  location: string
  location_en: string
  location_ru: string
  location_ka: string
  status_name: string
  status: string
  start_date: string
  completion_date: string
  main_image: ImageData | null
  render_image: ImageData | null
  gallery_images: ImageData[]
  year: number
  is_active: boolean
  is_featured: boolean
  is_onHomepage: boolean
  latitude: number | null
  longitude: number | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  // Legacy support
  image?: string
}
