<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ToastContainer from '@/components/ui/ToastContainer.vue'
import GlobalLoadingOverlay from '@/components/ui/GlobalLoadingOverlay.vue'
import { useTranslationsStore } from '@/stores/ui/translations'
import { usePageTitle } from '@/composables/ui/usePageTitle'

const route = useRoute()
const translationsStore = useTranslationsStore()

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

    // Only wait for translations on initial page load (when store is empty)
    // After that, show content immediately with fallback to translation keys
    const hasAnyTranslations = Object.keys(translationsStore.translations).length > 0

    if (!isLoaded && !hasAnyTranslations) {
      // Initial load - wait for translations
      waitingForTranslations.value = true
      translationsStore.isLoading = true

      // Watch for translations to be loaded
      const unwatch = watch(
        () => translationsStore.arePageGroupsLoaded(pageName),
        (loaded) => {
          if (loaded) {
            waitingForTranslations.value = false
            translationsStore.isLoading = false
            unwatch()
          }
        },
        { immediate: true }
      )

      // Shorter timeout - show content faster even if translations aren't fully loaded
      setTimeout(() => {
        if (waitingForTranslations.value) {
          waitingForTranslations.value = false
          translationsStore.isLoading = false
          unwatch()
        }
      }, 800) // Reduced from 2000ms to 800ms
    } else {
      // Already have some translations or page translations loaded - show immediately
      waitingForTranslations.value = false
      translationsStore.isLoading = false
    }
  }
}, { immediate: true })
</script>

<template>
  <div id="app">
    <GlobalLoadingOverlay />
    <div :class="[waitingForTranslations ? 'content-invisible' : 'content-visible']">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
    <ToastContainer />
  </div>
</template>

<style>
/* Prevent flash of content */
#app {
  overflow-x: hidden;
}

/* Smooth fade for content visibility */
.content-invisible {
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
  pointer-events: none;
}

.content-visible {
  opacity: 1;
  transition: opacity 0.5s ease-in-out;
}

/* Global Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
