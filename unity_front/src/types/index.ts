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
  description: string
  image?: string
  created_at: string
  updated_at: string
}

export interface Translation {
  id: number
  key: string
  en: string
  ka: string
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
