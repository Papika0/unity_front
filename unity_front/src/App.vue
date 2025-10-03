<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import GlobalLoadingOverlay from '@/components/ui/GlobalLoadingOverlay.vue'
import { useTranslationsStore } from '@/stores/ui/translations'

const route = useRoute()
const translationsStore = useTranslationsStore()

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

// Watch for route changes and check if translations are loaded
watch(() => route.name, (newRoute) => {
  // Skip admin routes
  if (route.path.startsWith('/admin')) {
    waitingForTranslations.value = false
    return
  }
  
  const pageName = routeToPageMap[newRoute as string]
  
  if (pageName) {
    // Check if translations are already loaded
    const isLoaded = translationsStore.arePageGroupsLoaded(pageName)
    
    console.log(`🌐 Route changed to: ${String(newRoute)}, page: ${pageName}, Loaded: ${isLoaded}`)
    
    if (!isLoaded) {
      // Set waiting state - this will show the loading overlay
      waitingForTranslations.value = true
      translationsStore.isLoading = true
      
      // Watch for translations to be loaded
      const unwatch = watch(
        () => translationsStore.arePageGroupsLoaded(pageName),
        (loaded) => {
          if (loaded) {
            console.log(`✅ Translations loaded for page: ${pageName}`)
            waitingForTranslations.value = false
            translationsStore.isLoading = false
            unwatch()
          }
        },
        { immediate: true }
      )
      
      // Timeout after 2 seconds (reduced from 3 for faster UX)
      setTimeout(() => {
        if (waitingForTranslations.value) {
          console.log(`⏱️ Translation load timeout for page: ${pageName}`)
          waitingForTranslations.value = false
          translationsStore.isLoading = false
          unwatch()
        }
      }, 2000)
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
