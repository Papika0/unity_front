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
