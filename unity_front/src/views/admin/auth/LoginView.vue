<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4"
  >
    <!-- Loading overlay when redirecting -->
    <div
      v-if="redirecting"
      class="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-10 w-10 border-2 border-amber-500 border-t-transparent mx-auto mb-3"
        ></div>
        <p class="text-slate-600 text-sm font-medium">{{ t('admin.login.redirecting') }}</p>
      </div>
    </div>

    <div class="w-full max-w-sm mx-auto">
      <!-- Header Section -->
      <div class="text-center mb-6">
        <!-- Logo -->
        <div
          class="mx-auto h-16 w-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm p-2"
        >
          <img
            src="@/assets/logo_black.png"
            alt="Unity Logo"
            class="h-full w-full object-contain"
          />
        </div>
        <h1 class="text-2xl font-bold text-slate-800 mb-1">{{ t('admin.login.title') }}</h1>
        <p class="text-slate-500 text-sm">{{ t('admin.login.subtitle') }}</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 sm:p-8">
        <form class="space-y-5" @submit.prevent="handleLogin">
          <!-- Email Field -->
          <div>
            <label for="email" class="block text-sm font-medium text-slate-700 mb-2"
              >{{ t('admin.login.email') }}</label
            >
            <input
              id="email"
              v-model="form.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 placeholder-slate-400 text-slate-700 transition-all duration-200 text-sm"
              :placeholder="t('admin.login.email_placeholder')"
            />
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-slate-700 mb-2"
              >{{ t('admin.login.password') }}</label
            >
            <input
              id="password"
              v-model="form.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 placeholder-slate-400 text-slate-700 transition-all duration-200 text-sm"
              :placeholder="t('admin.login.password_placeholder')"
            />
          </div>

          <!-- Remember Me -->
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-amber-500 focus:ring-amber-400 border-slate-300 rounded"
            />
            <label for="remember-me" class="ml-2 text-sm text-slate-600">{{ t('admin.login.remember_me') }}</label>
          </div>

          <!-- Error Message -->
          <div
            v-if="authStore.error"
            class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start space-x-2"
          >
            <svg
              class="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ authStore.error }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            <svg
              v-if="authStore.loading"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ authStore.loading ? t('admin.login.logging_in') : t('admin.login.submit') }}
          </button>

          <!-- Back Link -->
          <div class="text-center pt-2">
            <router-link
              to="/"
              class="text-sm text-slate-500 hover:text-amber-600 transition-colors duration-200 inline-flex items-center space-x-1"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>{{ t('admin.login.back_to_site') }}</span>
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
import { useAuthStore } from '@/stores/auth/auth'
import { useTranslations } from '@/composables/i18n/useTranslations'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useTranslations()
const redirecting = ref(false)

const form = reactive({
  email: '',
  password: '',
  rememberMe: false,
})

const handleLogin = async () => {
  const result = await authStore.login(form.email, form.password, form.rememberMe)

 

  if (result.success) {
    redirecting.value = true
    // Small delay to ensure reactive state is updated
    await new Promise((resolve) => setTimeout(resolve, 100))
    
    // Redirect based on user role
    if (authStore.isMarketing) {
      await router.replace('/admin/customers')
    } else {
      await router.replace('/admin/dashboard')
    }
    
  } else {
    console.log('Login failed:', result.error)
  }
}

onMounted(() => {
  // If already authenticated, redirect based on role
  if (authStore.isAuthenticated) {
    redirecting.value = true
    
    if (authStore.isMarketing) {
      router.replace('/admin/customers')
    } else {
      router.replace('/admin/dashboard')
    }
  }
})
</script>
