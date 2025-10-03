<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import GlobalLoadingOverlay from '@/components/ui/GlobalLoadingOverlay.vue'
import { useTranslationsStore } from '@/stores/ui/translations'
import { usePageTitle } from '@/composables/usePageTitle'
import { useTranslationLoader } from '@/composables/useTranslationLoader'

const route = useRoute()
const translationsStore = useTranslationsStore()
const translationLoader = useTranslationLoader()

// Initialize page title management
usePageTitle()

// Track if we're waiting for translations to load
const waitingForTranslations = ref(false)

// Map routes to page names for translation checking
const routeToPageMap: Record<string, string> = {
  'home': 'homepage',
  'about': 'about',
  'projects': 'projects',
  'project-detail': 'projects',
  'news': 'news',
  'news-detail': 'news',
  'gallery': 'gallery',
  'contact': 'contact',
}

// Watch for route changes and load translations
watch(() => route.name, async (newRoute) => {
  // Skip admin routes
  if (route.path.startsWith('/admin')) {
    waitingForTranslations.value = false
    return
  }
  
  const pageName = routeToPageMap[newRoute as string]
  
  if (pageName) {
    // Check if translations are already loaded
    const isLoaded = translationsStore.arePageGroupsLoaded(pageName)
    
    if (!isLoaded) {
      // Set waiting state - this will show the loading overlay
      waitingForTranslations.value = true
      translationsStore.isLoading = true
      
      try {
        // Actually fetch the translations from the API
        await translationLoader.loadPageTranslations(pageName)
        
        waitingForTranslations.value = false
        translationsStore.isLoading = false
      } catch {
        // Don't block the page even if translations fail
        waitingForTranslations.value = false
        translationsStore.isLoading = false
      }
    } else {
      waitingForTranslations.value = false
      translationsStore.isLoading = false
    }
  }
}, { immediate: true })
</script>

<template>
  <div id="app">
    <GlobalLoadingOverlay />
    <div :class="{ 'content-invisible': waitingForTranslations }">
      <RouterView />
    </div>
    <ToastContainer />
  </div>
</template>

<style>
/* Prevent flash of content */
#app {
  overflow-x: hidden;
}

/* Hide content while waiting for translations to prevent key flashing */
.content-invisible {
  opacity: 0;
  pointer-events: none;
}
</style>
