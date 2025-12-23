import type { ImageData } from './common'

// Related article minimal data
export interface RelatedArticle {
  id: number
  title: string
  excerpt: string
  main_image: ImageData | null
  category: 'company' | 'project' | 'industry' | 'event'
  publish_date: string
  views: number
}

export interface NewsArticle {
  id: number
  is_active: boolean
  is_featured: boolean
  title: string
  content: string
  excerpt: string
  main_image: ImageData | null
  gallery_images: ImageData[]
  publish_date: string
  formatted_publish_date: string
  category: 'company' | 'project' | 'industry' | 'event'
  tags: string[]
  views: number
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
  related_articles?: RelatedArticle[] // Added related articles
}

interface adminNewsTranslation {
  en: string
  ka: string
  ru: string
}

export interface AdminNewsArticle {
  id: number
  is_active: boolean
  is_featured: boolean
  title: adminNewsTranslation
  content: adminNewsTranslation
  excerpt: adminNewsTranslation
  main_image: ImageData | null
  gallery_images: ImageData[]
  publish_date: string
  formatted_publish_date: string
  category: 'company' | 'project' | 'industry' | 'event'
  tags: string[]
  views: number
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}
