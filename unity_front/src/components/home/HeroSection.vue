<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useTranslations } from '@/composables/useTranslations'
import { useProjectsStore } from '@/stores/public/projects'

const { t } = useTranslations()
const projectsStore = useProjectsStore()
const backendUrl = import.meta.env.VITE_BACKEND_URL
const isDevelopment = true

// Get featured projects for hero
const heroProjects = computed(() => {
  const featured = projectsStore.featuredProjects

  if (featured.length >= 2) {
    return featured.slice(0, 2)
  }

  if (featured.length === 1) {
    const nonFeatured = projectsStore.activeProjects.filter((p) => !p.is_featured).slice(0, 1)
    return [...featured, ...nonFeatured]
  }

  return projectsStore.activeProjects.slice(0, 2)
})

// Current slide index
const currentSlide = ref(0)
const isAnimating = ref(false)
const isPaused = ref(false)
let slideInterval: number | null = null

// Intersection Observer for scroll animations
const heroRef = ref<HTMLElement>()
const isInView = ref(false)

// Auto-scroll functionality
const startAutoScroll = () => {
  if (slideInterval || isPaused.value || heroProjects.value.length <= 1) return

  slideInterval = window.setInterval(() => {
    if (!isPaused.value && !isAnimating.value) {
      nextSlide()
    }
  }, 8000) // Slower for luxury feel
}

const stopAutoScroll = () => {
  if (slideInterval) {
    clearInterval(slideInterval)
    slideInterval = null
  }
}

// Navigation functions
const nextSlide = () => {
  if (isAnimating.value) return
  isAnimating.value = true
  currentSlide.value = (currentSlide.value + 1) % heroProjects.value.length
  setTimeout(() => {
    isAnimating.value = false
  }, 1500)
}

const prevSlide = () => {
  if (isAnimating.value) return
  isAnimating.value = true
  currentSlide.value =
    currentSlide.value === 0 ? heroProjects.value.length - 1 : currentSlide.value - 1
  setTimeout(() => {
    isAnimating.value = false
  }, 1500)
}

// const goToSlide = (index: number) => {
//   if (isAnimating.value || index === currentSlide.value) return
//   isAnimating.value = true
//   currentSlide.value = index
//   stopAutoScroll()
//   setTimeout(() => {
//     isAnimating.value = false
//     setTimeout(startAutoScroll, 3000)
//   }, 1500)
// }

// Pause/resume on hover
const pauseAutoScroll = () => {
  isPaused.value = true
}

const resumeAutoScroll = () => {
  isPaused.value = false
  if (!slideInterval) {
    startAutoScroll()
  }
}

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault()
      prevSlide()
      break
    case 'ArrowRight':
      event.preventDefault()
      nextSlide()
      break
    case ' ':
      event.preventDefault()
      if (isPaused.value) {
        resumeAutoScroll()
      } else {
        pauseAutoScroll()
      }
      break
  }
}

// Intersection Observer setup
const setupIntersectionObserver = () => {
  if (!heroRef.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isInView.value = entry.isIntersecting
        if (entry.isIntersecting) {
          startAutoScroll()
        } else {
          stopAutoScroll()
        }
      })
    },
    { threshold: 0.5 },
  )

  observer.observe(heroRef.value)

  return () => observer.disconnect()
}

// Helper function to get full image URL
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return ''

  // If backendUrl is not defined, use a placeholder for testing
  if (!backendUrl) {
    if (isDevelopment) {
      console.warn('Backend URL not defined, using placeholder')
    }
    return `https://via.placeholder.com/1920x1080/1a1a1a/666666?text=${encodeURIComponent('Configure VITE_API_BASE_URL')}`
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // Ensure no double slashes
  const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`

  const fullUrl = `${baseUrl}${path}`

  return fullUrl
}

// Preload images
const preloadImages = () => {
  heroProjects.value.forEach((project) => {
    const img = new Image()
    img.src = getImageUrl(project.main_image)
  })
}

onMounted(async () => {
  // Projects are now loaded via homepage bootstrap, no need to fetch here
  const cleanup = setupIntersectionObserver()
  preloadImages()
  document.addEventListener('keydown', handleKeydown)

  return () => {
    cleanup?.()
    document.removeEventListener('keydown', handleKeydown)
  }
})

onUnmounted(() => {
  stopAutoScroll()
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <!-- Hero Section -->
  <section
    ref="heroRef"
    class="relative h-screen overflow-hidden bg-black"
    @mouseenter="pauseAutoScroll"
    @mouseleave="resumeAutoScroll"
  >
    <!-- Project Slides -->
    <div v-if="heroProjects.length > 0" class="relative w-full h-full">
      <div
        v-for="(project, index) in heroProjects"
        :key="project.id"
        class="absolute inset-0 transition-all duration-[1500ms] ease-in-out"
        :class="{
          'opacity-100 z-10': index === currentSlide,
          'opacity-0 z-0': index !== currentSlide,
        }"
      >
        <!-- Background Image -->
        <div
          class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-out"
          :style="`background-image: url('${getImageUrl(project.main_image)}')`"
          :class="{
            'scale-105': index === currentSlide,
            'scale-100': index !== currentSlide,
          }"
        ></div>

        <!-- Elegant Gradient Overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent"
        ></div>

        <!-- Hero Content -->
        <div class="absolute inset-0 flex items-end pb-20 md:pb-32 px-8 md:px-16 lg:px-24">
          <div class="max-w-7xl mx-auto w-full">
            <div
              class="space-y-6 transition-all duration-[2000ms] ease-out"
              :class="{
                'translate-y-0 opacity-100': index === currentSlide,
                'translate-y-8 opacity-0': index !== currentSlide,
              }"
            >
              <!-- Location with Minimal Style -->
              <div
                class="flex items-center space-x-2 transition-all duration-[2000ms] delay-300"
                :class="{
                  'translate-x-0 opacity-100': index === currentSlide,
                  'translate-x-[-20px] opacity-0': index !== currentSlide,
                }"
              >
                <div class="w-12 h-[1px] bg-white/60"></div>
                <p class="text-white/80 text-sm font-light tracking-[0.2em] uppercase">
                  {{ project.location }}
                </p>
              </div>

              <!-- Title with Luxury Typography -->
              <h1
                class="text-white font-thin tracking-tight transition-all duration-[2000ms] delay-500"
                :class="{
                  'translate-x-0 opacity-100': index === currentSlide,
                  'translate-x-[-30px] opacity-0': index !== currentSlide,
                }"
              >
                <span class="text-5xl md:text-7xl lg:text-8xl block leading-none">
                  {{ project.title }}
                </span>
              </h1>

              <!-- Refined Action Button -->
              <div
                class="pt-8 transition-all duration-[2000ms] delay-700"
                :class="{
                  'translate-y-0 opacity-100': index === currentSlide,
                  'translate-y-4 opacity-0': index !== currentSlide,
                }"
              >
                <button
                  class="group relative px-12 py-4 overflow-hidden transition-all duration-500"
                >
                  <span
                    class="relative z-10 text-white text-sm tracking-[0.3em] uppercase font-light"
                  >
                    {{ t('buttons.see_details') }}
                  </span>
                  <div
                    class="absolute inset-0 border border-white/30 transition-all duration-500 group-hover:border-white/60"
                  ></div>
                  <div
                    class="absolute inset-0 bg-white/0 transition-all duration-500 group-hover:bg-white/10"
                  ></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Minimalist Navigation -->
    <div class="absolute bottom-8 left-8 md:left-16 lg:left-24 flex items-center space-x-8 z-30">
      <!-- Slide Counter -->
      <div class="text-white/60 font-thin tracking-[0.2em]">
        <span class="text-2xl text-white">{{ String(currentSlide + 1).padStart(2, '0') }}</span>
        <span class="text-sm mx-2">/</span>
        <span class="text-sm">{{ String(heroProjects.length).padStart(2, '0') }}</span>
      </div>

      <!-- Progress Line -->
      <div class="relative w-32 h-[1px] bg-white/20 overflow-hidden">
        <div
          class="absolute left-0 top-0 h-full bg-white transition-all duration-[1500ms] ease-out"
          :style="`width: ${((currentSlide + 1) / heroProjects.length) * 100}%`"
        ></div>
      </div>
    </div>

    <!-- Minimal Navigation Arrows -->
    <div
      class="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-8 md:px-16 lg:px-24 pointer-events-none z-30"
    >
      <button
        @click="prevSlide"
        class="group pointer-events-auto p-4 transition-all duration-300"
        :disabled="isAnimating"
        aria-label="Previous slide"
      >
        <svg
          class="w-12 h-12 text-white/40 group-hover:text-white/80 transition-all duration-300 group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          stroke-width="0.5"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        @click="nextSlide"
        class="group pointer-events-auto p-4 transition-all duration-300"
        :disabled="isAnimating"
        aria-label="Next slide"
      >
        <svg
          class="w-12 h-12 text-white/40 group-hover:text-white/80 transition-all duration-300 group-hover:scale-110"
          fill="none"
          stroke="currentColor"
          stroke-width="0.5"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </section>
</template>

<style scoped>
/* Smooth animations */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Luxury button hover effect */
button {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

button:hover {
  transform: translateZ(10px);
}

/* Smooth image loading */
[style*='background-image'] {
  will-change: transform;
  transition: opacity 1.5s ease-out;
}

/* Typography refinements */
h1 {
  font-weight: 100;
  letter-spacing: -0.02em;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  h1 span {
    font-size: 3rem;
  }
}

/* Loading animation keyframes */
@keyframes subtle-pulse {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.5;
  }
}

/* Disable text selection for UI elements */
button,
.text-white\/60 {
  user-select: none;
}
</style>
