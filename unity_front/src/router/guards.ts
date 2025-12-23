import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth'

export const requireAuth = (
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    next('/admin/login')
  } else {
    next()
  }
}

export const requireAdmin = (
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    next('/admin/login')
  } else if (!authStore.isAdmin) {
    next('/admin/customers')
  } else {
    next()
  }
}

export const requireAdminOrMarketing = (
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    next('/admin/login')
  } else if (!authStore.isAdmin && !authStore.isMarketing) {
    next('/admin/customers')
  } else {
    next()
  }
}

export const redirectIfAuthenticated = (
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    next('/admin/dashboard')
  } else {
    next()
  }
}
