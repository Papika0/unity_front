import axios from 'axios'
import type { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// Create an instance of axios with custom configuration
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Use the environment variable for the base URL
  headers: {
    Accept: 'application/json', // Accept JSON responses
    'Content-Type': 'application/json', // Sending JSON in requests
  },
  // Note: withXSRFToken is not a standard axios option. You might need to implement it manually.
})

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('jwt_token') // Assuming JWT token is stored in localStorage

    if (token) {
      // Attach the token to the Authorization header
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`

      // For cPanel/shared hosting environments, also add fallback headers
      config.headers['X-Authorization'] = `Bearer ${token}`

      // Add token as query parameter as ultimate fallback for problematic hosting
      if (config.method !== 'get') {
        config.params = config.params || {}
        // Only add as param if absolutely necessary (uncomment if other methods fail)
        // config.params.token = token.replace('Bearer ', '')
      }
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  },
)

// You can also set a response interceptor to handle errors, like token expiration
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized error (e.g., token expired)

      // Remove expired token from localStorage
      localStorage.removeItem('jwt_token')

      // You can also show a notification or a message to inform the user if needed
      console.log('Unauthorized: Token expired or invalid')

      // Reject the promise so the error is propagated
      return Promise.reject(error)
    }

    return Promise.reject(error)
  },
)

// Export the configured axios instance
export default api
