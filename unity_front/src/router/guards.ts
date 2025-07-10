import { useAuthStore } from '@/stores/auth'

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

  if (!authStore.isAuthenticated) {
    next('/admin/login')
  } else if (!authStore.isAdmin) {
    next('/admin/login') // or a forbidden page
  } else {
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
