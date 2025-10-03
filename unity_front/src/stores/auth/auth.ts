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
  const isAdmin = computed(() => {
    const result = user.value && user.value.role === 'admin'
    console.log('isAdmin computed - user:', user.value, 'role:', user.value?.role, 'result:', result)
    return result
  })
  const isMarketing = computed(() => {
    const result = user.value && user.value.role === 'marketing'
    console.log('isMarketing computed - user:', user.value, 'role:', user.value?.role, 'result:', result)
    return result
  })

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
      if (!token.value) {
        console.log('fetchUser: No token found, skipping')
        return
      }

      console.log('fetchUser: Fetching user with token:', token.value)
      const response = await getUser()
      console.log('fetchUser: Response received:', response)
      console.log('fetchUser: Response data:', response.data)
      
      user.value = response.data
      
      console.log('fetchUser: User set to:', user.value)
      console.log('fetchUser: User role:', user.value?.role)
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
    isMarketing,
    login,
    logout,
    fetchUser,
    initAuth,
  }
})
