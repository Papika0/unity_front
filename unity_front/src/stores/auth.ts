import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, logout as apiLogout, getUser } from '@/services/auth'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref(localStorage.getItem('jwt_token'))
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value && user.value.role === 'admin')

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      loading.value = true
      error.value = ''

      console.log('Attempting login with:', { email, rememberMe })

      const response = await apiLogin(email, password, rememberMe)

      console.log('Login response:', response.data)

      // Access the nested data structure
      token.value = response.data.data.token
      user.value = response.data.data.user

      if (token.value) {
        localStorage.setItem('jwt_token', token.value)
        console.log('Token saved to localStorage')
      }

      console.log('Login successful, user:', user.value)
      return { success: true }
    } catch (err: any) {
      console.error('Login error:', err)
      error.value = err.response?.data?.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('jwt_token')
    }
  }

  const fetchUser = async () => {
    try {
      if (!token.value) return

      const response = await getUser()
      user.value = response.data
    } catch (err) {
      console.error('Fetch user error:', err)
      // If fetching user fails, token might be invalid
      await logout()
    }
  }

  const initAuth = () => {
    if (token.value) {
      fetchUser()
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    fetchUser,
    initAuth,
  }
})
