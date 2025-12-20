<template>
  <div class="h-screen flex overflow-hidden bg-slate-50">
    <!-- Sidebar -->
    <AdminSidebar
      v-model:sidebar-open="sidebarOpen"
      :is-admin="!!authStore.isAdmin"
      :is-marketing="!!authStore.isMarketing"
      :user="authStore.user"
      :nav-items="NAV_ITEMS"
      :apartment-items="APARTMENT_NAV_ITEMS"
      :customer-items="CUSTOMER_NAV_ITEMS"
      :calculator-items="CALCULATOR_NAV_ITEMS"
      @logout="handleLogout"
    />

    <!-- Mobile menu -->
    <AdminMobileMenu
      v-if="mobileMenuOpen"
      :is-admin="!!authStore.isAdmin"
      :is-marketing="!!authStore.isMarketing"
      :nav-items="NAV_ITEMS"
      :customer-items="CUSTOMER_NAV_ITEMS"
      :calculator-items="CALCULATOR_NAV_ITEMS"
      @close="mobileMenuOpen = false"
    />

    <!-- Main content -->
    <div class="flex flex-col w-0 flex-1 overflow-hidden">
      <!-- Top bar -->
      <AdminTopBar
        :user="authStore.user"
        :user-menu-open="userMenuOpen"
        :clearing-cache="clearingCache"
        @open-mobile-menu="mobileMenuOpen = true"
        @toggle-user-menu="userMenuOpen = !userMenuOpen"
        @clear-cache="handleClearCache"
        @logout="handleLogout"
      />

      <!-- Page Content -->
      <main class="flex-1 relative overflow-y-auto focus:outline-none bg-slate-50">
        <div class="py-4 sm:py-6 md:py-8">
          <router-view />
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

// Sub-components
import AdminSidebar from './layout/AdminSidebar.vue'
import AdminMobileMenu from './layout/AdminMobileMenu.vue'
import AdminTopBar from './layout/AdminTopBar.vue'
import {
  NAV_ITEMS,
  APARTMENT_NAV_ITEMS,
  CUSTOMER_NAV_ITEMS,
  CALCULATOR_NAV_ITEMS,
} from './layout/navigation'

const router = useRouter()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)
const sidebarOpen = ref(true)
const clearingCache = ref(false)
const showToast = ref(false)
const toastMessage = ref('')

// Handle click outside to close dropdown
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu-container') && !target.closest('.user-dropdown')) {
    userMenuOpen.value = false
  }
}

onMounted(() => { document.addEventListener('click', handleClickOutside) })
onUnmounted(() => { document.removeEventListener('click', handleClickOutside) })

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
    setTimeout(() => { showToast.value = false }, 3000)
    userMenuOpen.value = false
  } catch (error) {
    console.error('Error clearing cache:', error)
    toastMessage.value = 'მონაცემების განახლება ვერ მოხერხდა'
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 3000)
  } finally {
    clearingCache.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
