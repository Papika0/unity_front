<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useTranslations } from '@/composables/useTranslations'
import { useProjectsStore } from '@/stores/public/projects'
import { getImageUrl, preloadImages } from '@/utils/imageUrl'

const { t } = useTranslations()
const projectsStore = useProjectsStore()

// Get featured projects for hero - show all featured projects
const heroProjects = computed(() => {
  const featured = projectsStore.featuredProjects

  if (featured.length > 0) {
    return featured
  }

  // Fallback to active projects if no featured projects
  return projectsStore.activeProjects.slice(0, 3)
})

// Current slide index
const currentSlide = ref(0)
const previousSlide = ref(0)
const isAnimating = ref(false)
const isPaused = ref(false)
const hasInitiallyLoaded = ref(false)
const scrollProgress = ref(0)
const slideDirection = ref<'next' | 'prev'>('next')
let slideInterval: number | null = null

// Intersection Observer for scroll animations
const heroRef = ref<HTMLElement>()
const isInView = ref(false)

// Track scroll progress for animations
const handleScroll = () => {
  if (!heroRef.value) return
  
  const rect = heroRef.value.getBoundingClientRect()
  const windowHeight = window.innerHeight
  
  // Calculate scroll progress (0 to 1)
  // 0 = hero is at top (fully visible)
  // 1 = hero has scrolled past (not visible)
  // This way, when you scroll back up, progress goes back to 0
  const progress = Math.max(0, Math.min(1, -rect.top / windowHeight))
  scrollProgress.value = progress
}

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
  previousSlide.value = currentSlide.value
  slideDirection.value = 'next'
  currentSlide.value = (currentSlide.value + 1) % heroProjects.value.length
  setTimeout(() => {
    isAnimating.value = false
  }, 1800)
}

const prevSlide = () => {
  if (isAnimating.value) return
  isAnimating.value = true
  previousSlide.value = currentSlide.value
  slideDirection.value = 'prev'
  currentSlide.value =
    currentSlide.value === 0 ? heroProjects.value.length - 1 : currentSlide.value - 1
  setTimeout(() => {
    isAnimating.value = false
  }, 1800)
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

// Preload hero images
const preloadHeroImages = () => {
  const imageUrls = heroProjects.value.map((project) => getImageUrl(project.main_image))
  preloadImages(imageUrls)
}

onMounted(async () => {
  // Trigger initial load animation
  setTimeout(() => {
    hasInitiallyLoaded.value = true
  }, 100)
  
  // Projects are now loaded via homepage bootstrap, no need to fetch here
  const cleanup = setupIntersectionObserver()
  preloadHeroImages()
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', handleScroll, { passive: true })

  return () => {
    cleanup?.()
    document.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  stopAutoScroll()
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleScroll)
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
        class="absolute inset-0 transition-all duration-[1800ms] ease-[cubic-bezier(0.65,0,0.35,1)]"
        :class="{
          'opacity-100 z-10 scale-100': index === currentSlide,
          'opacity-0 z-0 scale-105': index !== currentSlide && index === previousSlide && slideDirection === 'next',
          'opacity-0 z-0 scale-95': index !== currentSlide && index === previousSlide && slideDirection === 'prev',
          'opacity-0 z-0 scale-100': index !== currentSlide && index !== previousSlide,
        }"
      >
        <!-- Background Image with enhanced animations -->
        <div
          class="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[2500ms] ease-out will-change-transform"
          :style="`
            background-image: url('${getImageUrl(project.main_image)}');
            transform: scale(${index === currentSlide ? 1.05 + (scrollProgress * 0.1) : index === previousSlide && slideDirection === 'next' ? 1.15 : 1}) 
                       translateX(${index === previousSlide && slideDirection === 'next' ? '-10%' : index === previousSlide && slideDirection === 'prev' ? '10%' : '0'});
            opacity: ${index === currentSlide ? 1 - (scrollProgress * 0.3) : 0};
            filter: blur(${index === previousSlide ? '8px' : '0px'});
          `"
          :class="{
            'scale-110 opacity-0': index === currentSlide && !hasInitiallyLoaded,
          }"
        ></div>

        <!-- Elegant Gradient Overlay with fade-in -->
        <div
          class="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 transition-opacity duration-1000"
          :class="hasInitiallyLoaded ? 'opacity-100' : 'opacity-0'"
          :style="`opacity: ${hasInitiallyLoaded ? 1 - (scrollProgress * 0.5) : 0}`"
        ></div>
        <div
          class="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent transition-opacity duration-1000"
          :class="hasInitiallyLoaded ? 'opacity-100' : 'opacity-0'"
          :style="`opacity: ${hasInitiallyLoaded ? 1 - (scrollProgress * 0.5) : 0}`"
        ></div>

        <!-- Hero Content -->
        <div 
          class="absolute inset-0 flex items-end pb-20 md:pb-32 px-8 md:px-16 lg:px-24 transition-all duration-300"
          :style="`
            opacity: ${1 - (scrollProgress * 1.2)};
            transform: translateY(${scrollProgress * 30}px);
          `"
        >
          <div class="max-w-7xl mx-auto w-full">
            <div
              class="space-y-6 transition-all duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              :class="{
                'translate-y-0 opacity-100 translate-x-0': index === currentSlide && hasInitiallyLoaded,
                'translate-y-12 opacity-0 translate-x-12': index !== currentSlide && index === previousSlide && slideDirection === 'next',
                'translate-y-12 opacity-0 -translate-x-12': index !== currentSlide && index === previousSlide && slideDirection === 'prev',
                'translate-y-12 opacity-0': index !== currentSlide && index !== previousSlide || !hasInitiallyLoaded,
              }"
            >
              <!-- Location with Golden Accent -->
              <div
                class="flex items-center space-x-2 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100"
                :class="{
                  'translate-x-0 opacity-100 blur-0 scale-100': index === currentSlide && hasInitiallyLoaded,
                  'translate-x-[-60px] opacity-0 blur-sm scale-95': (index !== currentSlide || !hasInitiallyLoaded) && slideDirection === 'next',
                  'translate-x-[60px] opacity-0 blur-sm scale-95': (index !== currentSlide || !hasInitiallyLoaded) && slideDirection === 'prev',
                }"
              >
                <div class="w-12 h-[1px] bg-gradient-to-r from-[#FFCD4B] to-[#EBB738] shadow-[0_0_10px_rgba(255,205,75,0.5)]"></div>
                <p class="text-[#FFCD4B] text-sm font-light tracking-[0.2em] uppercase drop-shadow-[0_2px_10px_rgba(255,205,75,0.3)]">
                  {{ project.location }}
                </p>
              </div>

              <!-- Title with Luxury Typography -->
              <h1
                class="text-white font-thin tracking-tight transition-all duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-200"
                style="text-shadow: 0 4px 30px rgba(0,0,0,0.8);"
                :class="{
                  'translate-x-0 opacity-100 blur-0 scale-100': index === currentSlide && hasInitiallyLoaded,
                  'translate-x-[-70px] opacity-0 blur-sm scale-95': (index !== currentSlide || !hasInitiallyLoaded) && slideDirection === 'next',
                  'translate-x-[70px] opacity-0 blur-sm scale-95': (index !== currentSlide || !hasInitiallyLoaded) && slideDirection === 'prev',
                }"
              >
                <span class="text-5xl md:text-7xl lg:text-8xl block leading-none">
                  {{ project.title }}
                </span>
              </h1>

              <!-- Refined Action Button -->
              <div
                class="pt-8 transition-all duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-400"
                :class="{
                  'translate-y-0 opacity-100 scale-100 blur-0': index === currentSlide && hasInitiallyLoaded,
                  'translate-y-12 opacity-0 scale-90 blur-sm': index !== currentSlide || !hasInitiallyLoaded,
                }"
              >
                <router-link
                  :to="`/projects/${project.id}`"
                  class="group relative inline-block px-12 py-4 overflow-hidden transition-all duration-500 hover:scale-105"
                >
                  <span
                    class="relative z-10 text-[#FFCD4B] text-sm tracking-[0.3em] uppercase font-light drop-shadow-[0_2px_10px_rgba(255,205,75,0.4)]"
                  >
                    {{ t('buttons.see_details') }}
                  </span>
                  <div
                    class="absolute inset-0 border border-[#FFCD4B]/30 transition-all duration-500 group-hover:border-[#FFCD4B]/80 group-hover:shadow-[0_0_20px_rgba(255,205,75,0.3)]"
                  ></div>
                  <div
                    class="absolute inset-0 bg-[#FFCD4B]/0 transition-all duration-500 group-hover:bg-[#FFCD4B]/10"
                  ></div>
                  <svg 
                    class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FFCD4B] transition-transform duration-300 group-hover:translate-x-1 opacity-0 group-hover:opacity-100" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation with Golden Accent -->
    <div 
      class="absolute bottom-8 left-8 md:left-16 lg:left-24 flex items-center space-x-8 z-30 transition-all duration-1000 ease-out delay-1000"
      :class="hasInitiallyLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      :style="`opacity: ${hasInitiallyLoaded ? 1 - (scrollProgress * 1.5) : 0}`"
    >
      <!-- Slide Counter with smooth transition -->
      <div class="text-white/60 font-thin tracking-[0.2em] relative">
        <transition name="slide-counter" mode="out-in">
          <span :key="currentSlide" class="inline-block">
            <span class="text-2xl text-[#FFCD4B] drop-shadow-[0_2px_10px_rgba(255,205,75,0.4)]">
              {{ String(currentSlide + 1).padStart(2, '0') }}
            </span>
            <span class="text-sm mx-2">/</span>
            <span class="text-sm">{{ String(heroProjects.length).padStart(2, '0') }}</span>
          </span>
        </transition>
      </div>

      <!-- Progress Line with Golden Gradient and animation -->
      <div class="relative w-32 h-[1px] bg-white/20 overflow-hidden rounded-full">
        <div
          class="absolute left-0 top-0 h-full bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transition-all duration-[1800ms] ease-[cubic-bezier(0.65,0,0.35,1)] shadow-[0_0_15px_rgba(255,205,75,0.6)]"
          :style="`width: ${((currentSlide + 1) / heroProjects.length) * 100}%`"
        ></div>
      </div>
    </div>

    <!-- Minimal Navigation Arrows with enhanced effects -->
    <div
      class="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-8 md:px-16 lg:px-24 pointer-events-none z-30 transition-opacity duration-1000 delay-1200"
      :class="hasInitiallyLoaded ? 'opacity-100' : 'opacity-0'"
      :style="`opacity: ${hasInitiallyLoaded ? 1 - (scrollProgress * 1.5) : 0}`"
    >
      <button
        @click="prevSlide"
        class="group pointer-events-auto p-4 transition-all duration-500 hover:scale-110 active:scale-95 relative"
        :disabled="isAnimating"
        aria-label="Previous slide"
      >
        <!-- Glow effect on hover -->
        <div class="absolute inset-0 rounded-full bg-[#FFCD4B]/0 group-hover:bg-[#FFCD4B]/10 transition-all duration-500 blur-xl scale-150"></div>
        <svg
          class="relative w-12 h-12 text-white/40 group-hover:text-[#FFCD4B] transition-all duration-500 group-hover:drop-shadow-[0_0_15px_rgba(255,205,75,0.6)]"
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
        class="group pointer-events-auto p-4 transition-all duration-500 hover:scale-110 active:scale-95 relative"
        :disabled="isAnimating"
        aria-label="Next slide"
      >
        <!-- Glow effect on hover -->
        <div class="absolute inset-0 rounded-full bg-[#FFCD4B]/0 group-hover:bg-[#FFCD4B]/10 transition-all duration-500 blur-xl scale-150"></div>
        <svg
          class="relative w-12 h-12 text-white/40 group-hover:text-[#FFCD4B] transition-all duration-500 group-hover:drop-shadow-[0_0_15px_rgba(255,205,75,0.6)]"
          fill="none"
          stroke="currentColor"
          stroke-width="0.5"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Scroll Down Indicator -->
    <div 
      class="absolute bottom-24 right-8 md:right-16 lg:right-24 flex flex-col items-center space-y-3 z-30 transition-all duration-1000 delay-1400"
      :class="hasInitiallyLoaded ? 'opacity-100' : 'opacity-0'"
      :style="`opacity: ${hasInitiallyLoaded ? 1 - (scrollProgress * 2) : 0}`"
    >
      <span class="text-white/40 text-xs tracking-[0.3em] uppercase font-light rotate-90 origin-center mb-8">
        Scroll
      </span>
      <div class="relative w-[1px] h-16 bg-white/20 overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-[#FFCD4B] to-transparent animate-scroll-indicator"></div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Smooth animations */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scroll indicator animation */
@keyframes scroll-indicator {
  0% {
    transform: translateY(-100%);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(200%);
    opacity: 0;
  }
}

.animate-scroll-indicator {
  animation: scroll-indicator 2s ease-in-out infinite;
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

/* Smooth counter transition */
.slide-counter-enter-active,
.slide-counter-leave-active {
  transition: all 0.4s cubic-bezier(0.65, 0, 0.35, 1);
}

.slide-counter-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-counter-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Prevent layout shift during counter animation */
.slide-counter-enter-active,
.slide-counter-leave-active {
  display: inline-block;
  min-width: 2ch;
}
</style>
