import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, logout as apiLogout, getUser } from '@/services/auth'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  // ==================== STATE ====================
  const user = ref<User | null>(null)
  const token = ref(localStorage.getItem('jwt_token'))
  const loading = ref(false)
  const error = ref('')

  // ==================== GETTERS ====================
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value && user.value.role === 'admin')
  const isMarketing = computed(() => user.value && user.value.role === 'marketing')

  // ==================== ACTIONS ====================
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      loading.value = true
      error.value = ''

      const response = await apiLogin(email, password, rememberMe)

      // Access the nested data structure
      token.value = response.data.data.token
      user.value = response.data.data.user

      if (token.value) {
        localStorage.setItem('jwt_token', token.value)
      }

      return { success: true }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      error.value = axiosError.response?.data?.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      // Logout error - silently ignore
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('jwt_token')
    }
  }

  const fetchUser = async () => {
    try {
      if (!token.value) {
        return
      }

      const response = await getUser()
      user.value = response.data
    } catch {
      // If fetching user fails, token might be invalid
      await logout()
    }
  }

  const initAuth = async () => {
    if (token.value) {
      await fetchUser()
    }
  }

  // ==================== RESET ====================
  const $reset = () => {
    user.value = null
    token.value = null
    loading.value = false
    error.value = ''
    localStorage.removeItem('jwt_token')
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Getters
    isAuthenticated,
    isAdmin,
    isMarketing,
    // Actions
    login,
    logout,
    fetchUser,
    initAuth,
    $reset,
  }
})
