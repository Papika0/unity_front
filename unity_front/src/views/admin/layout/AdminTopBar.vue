<template>
  <div class="relative z-10 flex-shrink-0 flex h-14 sm:h-16 bg-white border-b border-slate-200">
    <!-- Mobile menu button -->
    <button
      @click="emit('open-mobile-menu')"
      class="px-3 sm:px-4 border-r border-slate-200 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 md:hidden"
    >
      <svg class="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    </button>

    <!-- Breadcrumb/Title -->
    <div class="flex-1 px-3 sm:px-4 md:px-6 flex justify-between items-center">
      <div class="flex-1 flex">
        <h2 class="text-base sm:text-lg font-semibold text-slate-800 truncate">
          {{ pageTitle }}
        </h2>
      </div>

      <!-- User menu -->
      <div class="ml-2 sm:ml-4 flex items-center md:ml-6 user-menu-container">
        <div class="relative">
          <button
            @click="emit('toggle-user-menu')"
            class="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <div class="bg-gradient-to-br from-amber-400 to-amber-500 rounded-full p-1.5 sm:p-2">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                {{ user?.email }}
              </div>
              <button
                @click="emit('clear-cache')"
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
                <span v-if="clearingCache">{{ translationsStore.t('admin.topbar.refreshing') || 'მონაცემების განახლება...' }}</span>
                <span v-else>{{ translationsStore.t('admin.topbar.refresh_data') || 'მონაცემების განახლება' }}</span>
              </button>
              <button
                @click="emit('logout')"
                class="flex items-center w-full text-left px-4 py-2.5 text-xs sm:text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-all duration-150 border-t border-slate-100 group"
              >
                <svg class="h-4 w-4 mr-2.5 text-slate-400 group-hover:text-amber-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {{ translationsStore.t('admin.sidebar.logout') || 'გასვლა' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTranslationsStore } from '@/stores/ui/translations'

const translationsStore = useTranslationsStore()

defineProps<{
  user: { name?: string; email?: string } | null
  userMenuOpen: boolean
  clearingCache: boolean
}>()

const emit = defineEmits<{
  'open-mobile-menu': []
  'toggle-user-menu': []
  'clear-cache': []
  logout: []
}>()

const route = useRoute()

const pageTitle = computed(() => {
  switch (route.name) {
    case 'admin-dashboard': return translationsStore.t('admin.sidebar.dashboard') || 'დაშბორდი'
    case 'admin-projects': return translationsStore.t('admin.sidebar.projects') || 'პროექტები'
    case 'admin-translations': return translationsStore.t('admin.sidebar.translations') || 'თარგმანები'
    case 'admin-about-settings': return translationsStore.t('admin.sidebar.about_settings') || '"ჩვენს შესახებ" პარამეტრები'
    default:
      if (typeof route.name === 'string' && route.name.startsWith('admin-feature')) return translationsStore.t('admin.sidebar.features') || 'ფუნქციები'
      return translationsStore.t('admin.sidebar.dashboard') || 'დაშბორდი'
  }
})
</script>
