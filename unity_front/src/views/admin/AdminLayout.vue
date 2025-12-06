<template>
  <div class="h-screen flex overflow-hidden bg-slate-50">
    <!-- Sidebar -->
    <transition name="slide-sidebar">
      <div v-if="sidebarOpen" class="hidden md:flex md:flex-shrink-0">
        <div class="flex flex-col w-72">
          <div class="flex flex-col h-0 flex-1 bg-white border-r border-slate-200 shadow-sm">
            <!-- Logo/Brand -->
            <div class="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto overflow-x-hidden px-2">
              <div class="flex items-center flex-shrink-0 px-4 justify-between">
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
                <button
                  @click="sidebarOpen = false"
                  class="group relative p-2 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 rounded-lg transition-all duration-200 hover:shadow-md"
                  title="დახურვა"
                >
                  <div class="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-orange-400/0 group-hover:from-amber-400/10 group-hover:to-orange-400/10 rounded-lg transition-all duration-200"></div>
                  <svg class="relative w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>

            <!-- Navigation -->
            <nav class="mt-8 flex-1 px-2 space-y-2">
              <router-link
                v-if="authStore.isAdmin"
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
                v-if="authStore.isAdmin"
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
                v-if="authStore.isAdmin"
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
                v-if="authStore.isAdmin"
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
                v-if="authStore.isAdmin"
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
                v-if="authStore.isAdmin"
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
                v-if="authStore.isAdmin"
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

              <router-link
                v-if="authStore.isAdmin"
                to="/admin/about-settings"
                class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                :class="
                  $route.name === 'admin-about-settings'
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                "
              >
                <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                "ჩვენს შესახებ" პარამეტრები
              </router-link>

              <!-- Apartment Navigation Section (Admin Only) -->
              <div v-if="authStore.isAdmin" class="pt-4 mt-4 border-t border-slate-200">
                <p class="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  ბინების ნავიგაცია
                </p>

                <router-link
                  to="/admin/buildings"
                  class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                  :class="
                    typeof $route.name === 'string' && $route.name.startsWith('admin-buildings')
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  "
                >
                  <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    ></path>
                  </svg>
                  შენობები
                </router-link>

                <router-link
                  to="/admin/apartments"
                  class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                  :class="
                    typeof $route.name === 'string' && $route.name.startsWith('admin-apartments')
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                      : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                  "
                >
                  <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    ></path>
                  </svg>
                  ბინები
                </router-link>
              </div>

              <!-- Customer Management Section -->
              <div :class="authStore.isAdmin ? 'pt-4 mt-4 border-t border-slate-200' : ''">
                <p class="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  კლიენტები
                </p>

                <router-link
                  to="/admin/customers"
                  class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                  :class="
                    $route.name === 'admin-customers'
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25'
                      : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                  "
                >
                  <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  კლიენტების მოთხოვნები
                </router-link>

                <router-link
                  v-if="authStore.isAdmin"
                  to="/admin/marketing-emails"
                  class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                  :class="
                    $route.name === 'admin-marketing-emails'
                      ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/25'
                      : 'text-slate-600 hover:bg-cyan-50 hover:text-cyan-700'
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
                  მარკეტინგის ელ. ფოსტები
                </router-link>

                <router-link
                  v-if="authStore.isAdmin"
                  to="/admin/users"
                  class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                  :class="
                    $route.name === 'admin-users'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                  "
                >
                  <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  მომხმარებლების მართვა
                </router-link>
              </div>

              <!-- Payment Calculator Section -->
              <div v-if="authStore.isAdmin || authStore.isMarketing" class="pt-4 mt-4 border-t border-slate-200">
                <p class="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  გადახდის კალკულატორი
                </p>

                <router-link
                  to="/admin/calculator"
                  class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                  :class="
                    $route.name === 'admin-calculator'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25'
                      : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                  "
                >
                  <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                  კალკულატორი
                </router-link>

                <router-link
                  to="/admin/bank-rates"
                  class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                  :class="
                    $route.name === 'admin-bank-rates'
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                  "
                >
                  <svg class="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  საბანკო განაკვეთები
                </router-link>
              </div>
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
    </transition>

    <!-- Toggle Button (when sidebar is closed) -->
    <button
      v-if="!sidebarOpen"
      @click="sidebarOpen = true"
      class="hidden md:block fixed left-0 top-1/2 transform -translate-y-1/2 z-50 group"
      title="ნავიგაციის გახსნა"
    >
      <div class="relative bg-gradient-to-r from-white to-slate-50 border-2 border-slate-200 hover:border-amber-400 rounded-r-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-3 hover:pr-4">
        <div class="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-orange-400/0 group-hover:from-amber-400/10 group-hover:to-orange-400/10 rounded-r-xl transition-all duration-300"></div>
        <svg class="relative w-6 h-6 text-slate-400 group-hover:text-amber-600 transition-all duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>

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
                v-if="authStore.isAdmin"
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
                v-if="authStore.isAdmin"
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
                v-if="authStore.isAdmin"
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
                v-if="authStore.isAdmin"
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
                v-if="authStore.isAdmin"
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
                v-if="authStore.isAdmin"
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
              
              <!-- Customers Section -->
              <div class="pt-4 mt-4 border-t border-slate-200">
                <router-link
                  to="/admin/customers"
                  @click="mobileMenuOpen = false"
                  class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                  :class="
                    $route.name === 'admin-customers'
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white'
                      : 'text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                  "
                >
                  კლიენტების მოთხოვნები
                </router-link>
                
                <router-link
                  v-if="authStore.isAdmin"
                  to="/admin/users"
                  @click="mobileMenuOpen = false"
                  class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                  :class="
                    $route.name === 'admin-users'
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                      : 'text-slate-600 hover:bg-purple-50 hover:text-purple-700'
                  "
                >
                  მომხმარებლების მართვა
                </router-link>
              </div>

              <!-- Payment Calculator Section (Mobile) -->
              <div v-if="authStore.isAdmin || authStore.isMarketing" class="pt-4 mt-4 border-t border-slate-200">
                <p class="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  გადახდის კალკულატორი
                </p>

                <router-link
                  to="/admin/calculator"
                  @click="mobileMenuOpen = false"
                  class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                  :class="
                    $route.name === 'admin-calculator'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                      : 'text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                  "
                >
                  კალკულატორი
                </router-link>

                <router-link
                  to="/admin/bank-rates"
                  @click="mobileMenuOpen = false"
                  class="group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                  :class="
                    $route.name === 'admin-bank-rates'
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white'
                      : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                  "
                >
                  საბანკო განაკვეთები
                </router-link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content -->
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <!-- Top bar -->
      <div class="relative z-10 flex-shrink-0 flex h-14 sm:h-16 bg-white border-b border-slate-200">
        <!-- Mobile menu button -->
        <button
          @click="mobileMenuOpen = true"
          class="px-3 sm:px-4 border-r border-slate-200 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 md:hidden"
        >
          <svg class="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h7"
            ></path>
          </svg>
        </button>

        <!-- Breadcrumb/Title -->
        <div class="flex-1 px-3 sm:px-4 md:px-6 flex justify-between items-center">
          <div class="flex-1 flex">
            <h2 class="text-base sm:text-lg font-semibold text-slate-800 truncate">
              {{
                $route.name === 'admin-dashboard'
                  ? 'დაშბორდი'
                  : $route.name === 'admin-projects'
                    ? 'პროექტები'
                    : typeof $route.name === 'string' && $route.name.startsWith('admin-feature')
                      ? 'ფუნქციები'
                      : $route.name === 'admin-translations'
                        ? 'თარგმანები'
                        : $route.name === 'admin-about-settings'
                          ? '"ჩვენს შესახებ" პარამეტრები'
                          : 'დაშბორდი'
              }}
            </h2>
          </div>

          <!-- User menu -->
          <div class="ml-2 sm:ml-4 flex items-center md:ml-6 user-menu-container">
            <div class="relative">
              <button
                @click="userMenuOpen = !userMenuOpen"
                class="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                <div class="bg-gradient-to-br from-amber-400 to-amber-500 rounded-full p-1.5 sm:p-2">
                  <svg
                    class="w-4 h-4 sm:w-5 sm:h-5 text-white"
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
                class="user-dropdown origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-slate-200 border border-slate-100 z-50"
              >
                <div class="py-1">
                  <div class="px-4 py-3 text-xs sm:text-sm font-medium text-slate-900 border-b border-slate-200 truncate bg-slate-50">
                    {{ authStore.user?.email }}
                  </div>
                  <button
                    @click="handleClearCache"
                    :disabled="clearingCache"
                    class="flex items-center w-full text-left px-4 py-2.5 text-xs sm:text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <svg v-if="!clearingCache" class="h-4 w-4 mr-2.5 text-slate-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <svg v-else class="animate-spin h-4 w-4 mr-2.5 text-indigo-600" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span v-if="clearingCache">მონაცემების განახლება...</span>
                    <span v-else>მონაცემების განახლება</span>
                  </button>
                  <button
                    @click="handleLogout"
                    class="flex items-center w-full text-left px-4 py-2.5 text-xs sm:text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-150 border-t border-slate-100 group"
                  >
                    <svg class="h-4 w-4 mr-2.5 text-slate-400 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    გასვლა
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      <!-- add padding for some pages -->
      <!-- Page Content -->
      <main class="flex-1 relative overflow-y-auto focus:outline-none bg-slate-50">
        <div class="py-4 sm:py-6 md:py-8">
          <div class="">
            <router-view />
          </div>
        </div>
      </main>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="showToast"
      class="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 max-w-sm transition-opacity duration-300 z-50"
      :class="{ 'opacity-0': !showToast }"
    >
      <div class="flex items-center">
        <svg class="h-5 w-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-sm font-medium text-green-900">{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth'
import { dashboardApi } from '@/services/dashboardApi'

const router = useRouter()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)
const sidebarOpen = ref(true) // Sidebar toggle state
const clearingCache = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

// Handle click outside to close dropdown
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  const userMenuButton = target.closest('button')
  const userMenuDropdown = target.closest('.user-dropdown')

  // If click is outside both the button and dropdown, close the menu
  if (!userMenuButton?.closest('.user-menu-container') && !userMenuDropdown) {
    userMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Debug logging



const handleLogout = async () => {
  await authStore.logout()
  router.push('/admin/login')
}

const handleClearCache = async () => {
  try {
    clearingCache.value = true
    const result = await dashboardApi.clearCache()
    toastMessage.value = result.message
    showToast.value = true

    // Hide toast after 3 seconds
    setTimeout(() => {
      showToast.value = false
    }, 3000)

    // Close user menu
    userMenuOpen.value = false
  } catch (error) {
    console.error('Error clearing cache:', error)
    toastMessage.value = 'მონაცემების განახლება ვერ მოხერხდა'
    showToast.value = true

    setTimeout(() => {
      showToast.value = false
    }, 3000)
  } finally {
    clearingCache.value = false
  }
}
</script>

<style scoped>
/* Slide transition for sidebar */
.slide-sidebar-enter-active,
.slide-sidebar-leave-active {
  transition: all 0.3s ease;
}

.slide-sidebar-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-sidebar-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
