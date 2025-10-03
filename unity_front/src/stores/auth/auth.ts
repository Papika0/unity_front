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
  const isMarketing = computed(() => user.value && user.value.role === 'marketing')

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
    } catch (err: any) {
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
      // Logout error
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
    } catch (err) {
      // If fetching user fails, token might be invalid
      await logout()
    }
  }

  const initAuth = async () => {
    if (token.value) {
      await fetchUser()
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isMarketing,
    login,
    logout,
    fetchUser,
    initAuth,
  }
})
