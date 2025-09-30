<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useHomepageStore } from '@/stores/public/homepage'
import { useProjectsStore } from '@/stores/public/projects'
import { useNewsStore } from '@/stores/public/news'
import { useLocaleStore } from '@/stores/ui/locale'

const homepageStore = useHomepageStore()
const projectsStore = useProjectsStore()
const newsStore = useNewsStore()
const localeStore = useLocaleStore()

const showOverlay = ref(false)
const isExiting = ref(false)
const justSwitchedLanguage = ref(false)

// Check immediately if we're in a language switching state
try {
  const wasLanguageSwitching = localStorage.getItem('app_language_switching')
  if (wasLanguageSwitching === 'true') {
    // Show overlay immediately to prevent flash
    showOverlay.value = true
    justSwitchedLanguage.value = true
  }
} catch {}

// Minimum display time in milliseconds (2 seconds)
const MINIMUM_DISPLAY_TIME = 2000

// Check if we just switched languages on page load
onMounted(() => {
  try {
    const wasLanguageSwitching = localStorage.getItem('app_language_switching')
    if (wasLanguageSwitching === 'true') {
      // Already handled above, just clean up and set timer
      localStorage.removeItem('app_language_switching')

      // After a brief moment, allow normal loading behavior and hide overlay
      setTimeout(() => {
        justSwitchedLanguage.value = false
        // Hide overlay smoothly after language switch
        if (showOverlay.value) {
          isExiting.value = true
          setTimeout(() => {
            showOverlay.value = false
            isExiting.value = false
          }, 800)
        }
      }, 1000) // Show for 1 second to cover the page reload transition
    }
  } catch {}
})

// Track when any store is loading or language is switching
const isAnyLoading = computed(() => {
  // If we just switched languages, don't show overlay for initial data loading
  if (justSwitchedLanguage.value) {
    return localeStore.isSwitching // Only show for active language switching
  }

  // COMMENTED OUT: Global loading overlay is too aggressive for quick operations
  // Better to use per-page loading indicators (spinners, skeleton screens, etc.)
  // Keep only for language switching which requires full page reload
  return (
    // homepageStore.isLoading ||
    // projectsStore.isLoading ||
    // newsStore.loading ||
    localeStore.isSwitching
  )
})

// Handle overlay visibility with minimum time and smooth animations
let overlayStartTime = 0
let hideTimeout: number | null = null

watch(
  isAnyLoading,
  (shouldShow) => {
    if (shouldShow) {
      // Show overlay immediately
      showOverlay.value = true
      isExiting.value = false
      overlayStartTime = Date.now()

      // Clear any existing timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout)
        hideTimeout = null
      }
    } else if (showOverlay.value) {
      // Only handle hide logic if overlay was actually shown
      // Calculate remaining time to meet minimum display
      const elapsedTime = Date.now() - overlayStartTime
      const remainingTime = Math.max(0, MINIMUM_DISPLAY_TIME - elapsedTime)

      // Start exit animation after minimum time
      hideTimeout = setTimeout(() => {
        isExiting.value = true

        // Hide overlay after exit animation completes
        setTimeout(() => {
          showOverlay.value = false
          isExiting.value = false
        }, 800) // Match exit animation duration
      }, remainingTime)
    }
  },
  { immediate: true },
)
</script>

<template>
  <!-- Global Unity Logo overlay for all loading states -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showOverlay"
        class="fixed inset-0 z-[10000] bg-black flex items-center justify-center"
        :class="{ 'animate-slide-out-left': isExiting }"
      >
        <div class="text-center">
          <!-- Minimalist Unity Logo Container -->
          <div class="relative w-40 h-40 mx-auto">
            <!-- Subtle background glow -->
            <div
              class="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-yellow-400/15 to-amber-500/10 rounded-full blur-2xl animate-pulse"
            ></div>

            <!-- Unity Logo with luxury styling -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="relative">
                <!-- Unity Logo with luxury styling -->
                <img
                  src="/src/assets/logo.png"
                  alt="Unity Development"
                  class="w-20 h-20 drop-shadow-2xl transform transition-all duration-1000 animate-float"
                />

                <!-- Elegant rotating ring -->
                <div
                  class="absolute inset-0 w-20 h-20 border border-white/20 rounded-full animate-spin-slow"
                ></div>

                <!-- Outer subtle ring -->
                <div class="absolute -inset-4 border border-white/5 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Slide animations */
@keyframes slideOutLeft {
  0% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(-100%);
    opacity: 0;
  }
}

.animate-slide-out-left {
  animation: slideOutLeft 0.8s cubic-bezier(0.55, 0.06, 0.68, 0.19) forwards;
}

/* Luxury floating animation for logo */
@keyframes float {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-8px) scale(1.02);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Slow elegant rotation */
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

/* Custom pulse animation */
@keyframes pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

.animate-pulse {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
