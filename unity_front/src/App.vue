<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'

const route = useRoute()

// Use transparent header only on home page and pages with hero images
const isTransparentHeader = computed(() => {
  const transparentRoutes = ['home'] // Add other routes that should have transparent header
  return transparentRoutes.includes(route.name as string)
})

// Check if we're in admin routes - make this check immediate
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})
</script>

<template>
  <div id="app" class="min-h-screen flex flex-col">
    <!-- Only show header and footer for non-admin routes -->
    <template v-if="!isAdminRoute">
      <AppHeader :transparent="isTransparentHeader" />
      <main :class="isTransparentHeader ? '' : 'flex-1'">
        <RouterView />
      </main>
      <AppFooter />
    </template>

    <!-- Admin routes get full control with no flashing -->
    <template v-else>
      <div class="min-h-screen">
        <RouterView />
      </div>
    </template>
  </div>
</template>

<style>
/* Prevent flash of content */
#app {
  overflow-x: hidden;
}

/* Admin route specific styling to prevent flashing */
.admin-route {
  min-height: 100vh;
  background-color: #1f2937; /* gray-800 for login page */
}
</style>

<style scoped>
/* Additional styles if needed */
</style>
