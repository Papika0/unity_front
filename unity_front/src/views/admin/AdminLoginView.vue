<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900">
    <!-- Loading overlay when redirecting -->
    <div v-if="redirecting" class="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"
        ></div>
        <p class="text-white">Redirecting to dashboard...</p>
      </div>
    </div>

    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <!-- Logo -->
        <div
          class="mx-auto h-16 w-16 bg-indigo-600 rounded-lg flex items-center justify-center mb-6"
        >
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            ></path>
          </svg>
        </div>
        <h2 class="text-3xl font-bold text-white">Admin Portal</h2>
        <p class="mt-2 text-sm text-gray-400">Sign in to access the admin dashboard</p>
      </div>

      <div class="bg-white rounded-lg shadow-2xl px-8 py-8">
        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Enter your password"
            />
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <input
                id="remember-me"
                v-model="form.rememberMe"
                name="remember-me"
                type="checkbox"
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label for="remember-me" class="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
          </div>

          <div
            v-if="authStore.error"
            class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
          >
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {{ authStore.error }}
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="authStore.loading"
              class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span
                v-if="authStore.loading"
                class="absolute left-0 inset-y-0 flex items-center pl-3"
              >
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
              {{ authStore.loading ? 'Signing in...' : 'Sign in to Dashboard' }}
            </button>
          </div>

          <div class="text-center">
            <router-link to="/" class="text-sm text-indigo-600 hover:text-indigo-500 font-medium">
              ← Back to main site
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const redirecting = ref(false)

const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

const handleLogin = async () => {
  console.log('Starting login process...')
  const result = await authStore.login(form.email, form.password, form.rememberMe)

  console.log('Login result:', result)
  console.log('Auth store state after login:', {
    isAuthenticated: authStore.isAuthenticated,
    user: authStore.user,
    token: authStore.token,
  })

  if (result.success) {
    console.log('Login successful, redirecting to dashboard...')
    redirecting.value = true
    // Small delay to ensure reactive state is updated
    await new Promise((resolve) => setTimeout(resolve, 100))
    // Use replace instead of push to avoid back button issues
    await router.replace('/admin/dashboard')
    console.log('Navigation complete')
  } else {
    console.log('Login failed:', result.error)
  }
}

onMounted(() => {
  // If already authenticated, redirect to dashboard
  if (authStore.isAuthenticated) {
    console.log('Already authenticated on mount, redirecting...')
    redirecting.value = true
    router.replace('/admin/dashboard')
  }
})
</script>
