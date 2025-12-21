<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useHeroSlideshow } from '@/composables/ui/useHeroSlideshow'
import { useProjectsStore } from '@/stores/public/projects'
import { getImageUrl, preloadImages } from '@/utils/imageUrl'
import { HeroSlide, HeroContent, HeroNavigation } from './hero'

const projectsStore = useProjectsStore()

// Hero section ref for intersection observer
const heroRef = ref<HTMLElement>()

// Get featured projects for hero
const heroProjects = computed(() => {
  const featured = projectsStore.featuredProjects
  if (featured.length > 0) {
    return featured
  }
  return projectsStore.activeProjects.slice(0, 3)
})

// Use slideshow composable
const {
  currentSlide,
  previousSlide,
  isAnimating,
  hasInitiallyLoaded,
  scrollProgress,
  slideDirection,
  nextSlide,
  prevSlide,
  pauseAutoScroll,
  resumeAutoScroll,
} = useHeroSlideshow(
  computed(() => heroProjects.value.length),
  heroRef
)

// Preload hero images on mount
onMounted(() => {
  const imageUrls = heroProjects.value.map((project) => getImageUrl(project.main_image))
  preloadImages(imageUrls)
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
        <!-- Background Slide -->
        <HeroSlide
          :project="project"
          :index="index"
          :current-slide="currentSlide"
          :previous-slide="previousSlide"
          :slide-direction="slideDirection"
          :has-initially-loaded="hasInitiallyLoaded"
          :scroll-progress="scrollProgress"
        />

        <!-- Content Overlay -->
        <HeroContent
          :project="project"
          :index="index"
          :current-slide="currentSlide"
          :previous-slide="previousSlide"
          :slide-direction="slideDirection"
          :has-initially-loaded="hasInitiallyLoaded"
          :scroll-progress="scrollProgress"
        />
      </div>
    </div>

    <!-- Navigation Controls -->
    <HeroNavigation
      :current-slide="currentSlide"
      :total-slides="heroProjects.length"
      :has-initially-loaded="hasInitiallyLoaded"
      :scroll-progress="scrollProgress"
      :is-animating="isAnimating"
      @next="nextSlide"
      @prev="prevSlide"
    />
  </section>
</template>

<style scoped>
/* Smooth animations */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
