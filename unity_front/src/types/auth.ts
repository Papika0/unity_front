export interface User {
  id: number
  email: string
  name: string
  role: string
  created_at: string
  updated_at: string
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
