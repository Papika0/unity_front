<template>
  <div class="h-screen flex overflow-hidden bg-gray-100">
    <!-- Sidebar -->
    <div class="hidden md:flex md:flex-shrink-0">
      <div class="flex flex-col w-64">
        <div class="flex flex-col h-0 flex-1 bg-gray-800">
          <!-- Logo/Brand -->
          <div class="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div class="flex items-center flex-shrink-0 px-4">
              <div class="flex items-center">
                <div class="bg-indigo-600 p-2 rounded-lg">
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    ></path>
                  </svg>
                </div>
                <h1 class="ml-3 text-xl font-bold text-white">Admin Panel</h1>
              </div>
            </div>

            <!-- Navigation -->
            <nav class="mt-8 flex-1 px-2 space-y-1">
              <router-link
                to="/admin/dashboard"
                class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                :class="
                  $route.name === 'admin-dashboard'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                "
              >
                <svg class="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2H3zm0 0h18"
                  ></path>
                </svg>
                Dashboard
              </router-link>

              <router-link
                to="/admin/projects"
                class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                :class="
                  $route.name === 'admin-projects'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                "
              >
                <svg class="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
                Projects
              </router-link>

              <router-link
                to="/admin/translations"
                class="group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                :class="
                  $route.name === 'admin-translations'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                "
              >
                <svg class="mr-3 h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  ></path>
                </svg>
                Translations
              </router-link>
            </nav>
          </div>

          <!-- User info at bottom -->
          <div class="flex-shrink-0 flex bg-gray-700 p-4">
            <div class="flex items-center">
              <div class="bg-gray-500 rounded-full p-2">
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-white">
                  {{ authStore.user?.name || authStore.user?.email }}
                </p>
                <button @click="handleLogout" class="text-xs text-gray-300 hover:text-white">
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <div v-if="mobileMenuOpen" class="md:hidden">
      <div class="fixed inset-0 flex z-40">
        <div class="fixed inset-0 bg-gray-600 bg-opacity-75" @click="mobileMenuOpen = false"></div>
        <div class="relative flex-1 flex flex-col max-w-xs w-full bg-gray-800">
          <div class="absolute top-0 right-0 -mr-12 pt-2">
            <button
              @click="mobileMenuOpen = false"
              class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          <!-- Mobile menu content -->
          <div class="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div class="flex-shrink-0 flex items-center px-4">
              <h1 class="text-xl font-bold text-white">Admin Panel</h1>
            </div>
            <nav class="mt-5 px-2 space-y-1">
              <!-- Same navigation items as desktop -->
              <router-link
                to="/admin/dashboard"
                @click="mobileMenuOpen = false"
                class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Dashboard
              </router-link>
              <router-link
                to="/admin/projects"
                @click="mobileMenuOpen = false"
                class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Projects
              </router-link>
              <router-link
                to="/admin/translations"
                @click="mobileMenuOpen = false"
                class="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Translations
              </router-link>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <!-- Top bar -->
      <div class="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
        <!-- Mobile menu button -->
        <button
          @click="mobileMenuOpen = true"
          class="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
        >
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h7"
            ></path>
          </svg>
        </button>

        <!-- Breadcrumb/Title -->
        <div class="flex-1 px-4 flex justify-between items-center">
          <div class="flex-1 flex">
            <h2 class="text-lg font-semibold text-gray-900 capitalize">
              {{ $route.name?.toString().replace('admin-', '') || 'Dashboard' }}
            </h2>
          </div>

          <!-- User menu -->
          <div class="ml-4 flex items-center md:ml-6">
            <div class="relative">
              <button
                @click="userMenuOpen = !userMenuOpen"
                class="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <div class="bg-gray-300 rounded-full p-2">
                  <svg
                    class="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                </div>
              </button>

              <!-- User dropdown -->
              <div
                v-if="userMenuOpen"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
              >
                <div class="py-1">
                  <div class="px-4 py-2 text-sm text-gray-700 border-b">
                    {{ authStore.user?.email }}
                  </div>
                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Page Content -->
      <main class="flex-1 relative overflow-y-auto focus:outline-none">
        <div class="py-6">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <router-view />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/admin/login')
}
</script>
