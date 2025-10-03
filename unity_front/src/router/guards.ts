import { useAuthStore } from '@/stores/auth/auth'

export const requireAuth = (to: any, from: any, next: any) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    next('/admin/login')
  } else {
    next()
  }
}

export const requireAdmin = (to: any, from: any, next: any) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    next('/admin/login')
  } else if (!authStore.isAdmin) {
    next('/admin/customers')
  } else {
    next()
  }
}

export const redirectIfAuthenticated = (to: any, from: any, next: any) => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    next('/admin/dashboard')
  } else {
    next()
  }
}
