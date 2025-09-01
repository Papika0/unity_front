export interface User {
  id: number
  email: string
  name: string
  role: string
  created_at: string
  updated_at: string
}

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
  main_image: string | null
  render_image: string | null
  gallery_images: string[] | null
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

export interface Translation {
  id: number
  key: string
  text_en: string
  text_ka: string
  text_ru: string
  group: string
  active: number
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  per_page: number
  current_page: number
  last_page: number
}

export interface LoginResponse {
  token: string
  user: User
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe: boolean
}

export interface NewsArticle {
  id: number
  is_active: boolean
  is_featured: boolean
  title: string
  content: string
  excerpt: string
  main_image: string | null
  gallery_images: string[]
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

export interface AdminNewsArticle {
  id: number
  is_active: boolean
  is_featured: boolean
  title: adminNewsTranslation
  content: adminNewsTranslation
  excerpt: adminNewsTranslation
  main_image: string | null
  gallery_images: string[]
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

interface adminNewsTranslation {
  en: string
  ka: string
  ru: string
}
