<script setup lang="ts">
import { onMounted, watch, ref, onBeforeUnmount } from 'vue'
import HeroSection from '../components/home/HeroSection.vue'
import AboutSection from '../components/home/AboutSection.vue'
import ProjectsSection from '../components/home/ProjectsSection.vue'
import FeaturedProject from '../components/home/FeaturedProject.vue'
import NewsSection from '../components/home/NewsSection.vue'
import { useHomepageStore } from '@/stores/public/homepage'
import { useLocaleStore } from '@/stores/ui/locale'
import { useSeo, useStructuredData, useAnalytics } from '@/composables/useSeo'

const homepageStore = useHomepageStore()
const localeStore = useLocaleStore()

// SEO setup for homepage
useSeo({
  url: '/',
})

// Add Organization schema for homepage
const { addOrganizationSchema, addBreadcrumbSchema } = useStructuredData()
addOrganizationSchema()
addBreadcrumbSchema([
  { name: 'Unity Development', url: '/' }
])

// Analytics tracking
const { trackPageView } = useAnalytics()
trackPageView('/', 'Unity Development - Homepage')

// Scroll progress indicator
const scrollProgress = ref(0)

const handleScroll = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = (scrollTop / docHeight) * 100
}

onMounted(async () => {
  // Force scroll to top on mount/refresh
  window.scrollTo(0, 0)
  
  await homepageStore.loadHomepageData()
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  // Enable smooth scrolling
  document.documentElement.style.scrollBehavior = 'smooth'
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

// Watch for locale changes and refetch data
watch(
  () => localeStore.currentLocale,
  async (newLocale, oldLocale) => {
    if (newLocale !== oldLocale) {
      await homepageStore.loadHomepageData()
    }
  },
)
</script>

<template>
  <div class="relative">
    <!-- Scroll Progress Bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50">
      <div
        class="h-full bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transition-all duration-150 ease-out"
        :style="{ width: scrollProgress + '%' }"
      ></div>
    </div>

    <HeroSection />
    <AboutSection />
    <ProjectsSection />
    <FeaturedProject />
    <NewsSection />
  </div>
</template>

<style scoped>
/* Smooth scrolling improvements */
:deep(*) {
  scroll-behavior: smooth;
}

/* Hardware acceleration for smoother animations */
:deep(.group) {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>
