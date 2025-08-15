import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token')
      // Redirect to login if needed
    }
    return Promise.reject(error)
  },
)

// API response interface
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
}

// Generic API methods
export const api = {
  get: <T = any>(url: string): Promise<AxiosResponse<ApiResponse<T>>> => apiClient.get(url),

  post: <T = any>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.post(url, data),

  put: <T = any>(url: string, data?: any): Promise<AxiosResponse<ApiResponse<T>>> =>
    apiClient.put(url, data),

  delete: <T = any>(url: string): Promise<AxiosResponse<ApiResponse<T>>> => apiClient.delete(url),
}

export default apiClient
