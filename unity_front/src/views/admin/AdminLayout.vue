<template>
  <div class="h-screen flex overflow-hidden bg-slate-50">
    <!-- Sidebar -->
    <div class="hidden md:flex md:flex-shrink-0">
      <div class="flex flex-col w-72">
        <div class="flex flex-col h-0 flex-1 bg-white border-r border-slate-200 shadow-sm">
          <!-- Logo/Brand -->
          <div class="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
            <div class="flex items-center flex-shrink-0 px-6">
              <div class="flex items-center">
                <div
                  class="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 p-1"
                >
                  <img
                    src="@/assets/logo_black.png"
                    alt="Unity Logo"
                    class="h-full w-full object-contain"
                  />
                </div>
                <div class="ml-3">
                  <h1 class="text-lg font-bold text-slate-800">ადმინისტრაციული პანელი</h1>
                  <p class="text-xs text-slate-500">მართვის სისტემა</p>
                </div>
              </div>
            </div>

            <!-- Navigation -->
            <nav class="mt-8 flex-1 px-4 space-y-2">
              <router-link
                to="/admin/dashboard"
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                :class="
                  $route.name === 'admin-dashboard'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25'
                    : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                "
              >
                <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2H3zm0 0h18"
                  ></path>
                </svg>
                დაშბორდი
              </router-link>

              <router-link
                to="/admin/projects"
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                :class="
                  $route.name === 'admin-projects'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25'
                    : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                "
              >
                <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
                პროექტები
              </router-link>

              <router-link
                to="/admin/features"
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                :class="
                  typeof $route.name === 'string' && $route.name.startsWith('admin-feature')
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                "
              >
                <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                ფუნქციები
              </router-link>

              <router-link
                to="/admin/news"
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                :class="
                  typeof $route.name === 'string' && $route.name.startsWith('admin-news')
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                "
              >
                <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  ></path>
                </svg>
                სიახლეები
              </router-link>

              <router-link
                to="/admin/gallery"
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                :class="
                  $route.name === 'admin-gallery'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                "
              >
                <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                გალერეა
              </router-link>

              <router-link
                to="/admin/translations"
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                :class="
                  $route.name === 'admin-translations'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25'
                    : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                "
              >
                <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  ></path>
                </svg>
                თარგმანები
              </router-link>

              <router-link
                to="/admin/contact-info"
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                :class="
                  $route.name === 'admin-contact-info'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                "
              >
                <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                კონტაქტის ინფორმაცია
              </router-link>
            </nav>
          </div>

          <!-- User info at bottom -->
          <div class="flex-shrink-0 border-t border-slate-200 p-4">
            <div class="flex items-center">
              <div class="bg-gradient-to-br from-amber-400 to-amber-500 rounded-full p-2">
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
                <p class="text-sm font-medium text-slate-700">
                  {{ authStore.user?.name || authStore.user?.email }}
                </p>
                <button
                  @click="handleLogout"
                  class="text-xs text-slate-500 hover:text-amber-600 transition-colors"
                >
                  გასვლა
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
        <div class="fixed inset-0 bg-slate-900 bg-opacity-50" @click="mobileMenuOpen = false"></div>
        <div class="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div class="absolute top-0 right-0 -mr-12 pt-2">
            <button
              @click="mobileMenuOpen = false"
              class="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
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
              <div
                class="h-8 w-8 bg-white rounded-lg flex items-center justify-center border border-slate-200"
              >
                <img
                  src="@/assets/logo_black.png"
                  alt="Unity Logo"
                  class="h-full w-full object-contain"
                />
              </div>
              <h1 class="ml-3 text-lg font-bold text-slate-800">ადმინისტრაციული პანელი</h1>
            </div>
            <nav class="mt-5 px-4 space-y-2">
              <!-- Same navigation items as desktop -->
              <router-link
                to="/admin/dashboard"
                @click="mobileMenuOpen = false"
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                :class="
                  $route.name === 'admin-dashboard'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                    : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                "
              >
                დაშბორდი
              </router-link>
              <router-link
                to="/admin/projects"
                @click="mobileMenuOpen = false"
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                :class="
                  $route.name === 'admin-projects'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                    : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                "
              >
                პროექტები
              </router-link>
              <router-link
                to="/admin/features"
                @click="mobileMenuOpen = false"
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                :class="
                  typeof $route.name === 'string' && $route.name.startsWith('admin-feature')
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                "
              >
                ფუნქციები
              </router-link>
              <router-link
                to="/admin/news"
                @click="mobileMenuOpen = false"
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                :class="
                  typeof $route.name === 'string' && $route.name.startsWith('admin-news')
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                "
              >
                სიახლეები
              </router-link>
              <router-link
                to="/admin/gallery"
                @click="mobileMenuOpen = false"
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                :class="
                  $route.name === 'admin-gallery'
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                "
              >
                გალერეა
              </router-link>
              <router-link
                to="/admin/translations"
                @click="mobileMenuOpen = false"
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                :class="
                  $route.name === 'admin-translations'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                    : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                "
              >
                თარგმანები
              </router-link>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <!-- Top bar -->
      <div class="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-slate-200">
        <!-- Mobile menu button -->
        <button
          @click="mobileMenuOpen = true"
          class="px-4 border-r border-slate-200 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 md:hidden"
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
        <div class="flex-1 px-6 flex justify-between items-center">
          <div class="flex-1 flex">
            <h2 class="text-lg font-semibold text-slate-800">
              {{
                $route.name === 'admin-dashboard'
                  ? 'დაშბორდი'
                  : $route.name === 'admin-projects'
                    ? 'პროექტები'
                    : typeof $route.name === 'string' && $route.name.startsWith('admin-feature')
                      ? 'ფუნქციები'
                      : $route.name === 'admin-translations'
                        ? 'თარგმანები'
                        : $route.name === 'admin-site-settings'
                          ? 'საიტის პარამეტრები'
                          : 'დაშბორდი'
              }}
            </h2>
          </div>

          <!-- User menu -->
          <div class="ml-4 flex items-center md:ml-6">
            <div class="relative">
              <button
                @click="userMenuOpen = !userMenuOpen"
                class="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <div class="bg-gradient-to-br from-amber-400 to-amber-500 rounded-full p-2">
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
              </button>

              <!-- User dropdown -->
              <div
                v-if="userMenuOpen"
                class="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-slate-200 border border-slate-100"
              >
                <div class="py-1">
                  <div class="px-4 py-2 text-sm text-slate-700 border-b border-slate-100">
                    {{ authStore.user?.email }}
                  </div>
                  <button
                    @click="handleLogout"
                    class="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                  >
                    გასვლა
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Page Content -->
      <main class="flex-1 relative overflow-y-auto focus:outline-none bg-slate-50">
        <div class="py-8">
          <div class="max-w-7xl mx-auto px-6 sm:px-8 md:px-10">
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
import { useAuthStore } from '@/stores/auth/auth'

const router = useRouter()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/admin/login')
}
</script>
