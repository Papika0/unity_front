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
</script>

<template>
  <div id="app" class="min-h-screen flex flex-col">
    <AppHeader :transparent="isTransparentHeader" />
    <main :class="isTransparentHeader ? '' : 'flex-1'">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
/* Additional styles if needed */
</style>
