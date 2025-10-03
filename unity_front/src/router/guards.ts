import { useAuthStore } from '@/stores/auth/auth'

export const requireAuth = (to: any, from: any, next: any) => {
  const authStore = useAuthStore()

  console.log('Route guard: requireAuth', {
    isAuthenticated: authStore.isAuthenticated,
    token: authStore.token,
    user: authStore.user,
  })

  if (!authStore.isAuthenticated) {
    console.log('Not authenticated, redirecting to login')
    next('/admin/login')
  } else {
    console.log('Authenticated, allowing access')
    next()
  }
}

export const requireAdmin = (to: any, from: any, next: any) => {
  const authStore = useAuthStore()

  console.log('Route guard: requireAdmin', {
    isAuthenticated: authStore.isAuthenticated,
    isAdmin: authStore.isAdmin,
    user: authStore.user,
    route: to.path,
  })

  if (!authStore.isAuthenticated) {
    console.log('Not authenticated, redirecting to login')
    next('/admin/login')
  } else if (!authStore.isAdmin) {
    console.log('Not admin, redirecting to customers page')
    next('/admin/customers')
  } else {
    console.log('Admin access granted')
    next()
  }
}

export const redirectIfAuthenticated = (to: any, from: any, next: any) => {
  const authStore = useAuthStore()

  console.log('Route guard: redirectIfAuthenticated', {
    isAuthenticated: authStore.isAuthenticated,
    to: to.path,
  })

  if (authStore.isAuthenticated) {
    console.log('Already authenticated, redirecting to dashboard')
    next('/admin/dashboard')
  } else {
    console.log('Not authenticated, allowing access to login')
    next()
  }
}
