<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useTranslations } from '../../composables/useTranslations'
import { useProjectsStore, type Project } from '@/stores/public/projects'
import { getImageUrl } from '@/utils/imageUrl'
import { useParallax } from '@/composables/useScrollAnimation'

const { t } = useTranslations()
const projectsStore = useProjectsStore()

// Simple visibility state that triggers on scroll
const sectionVisible = ref(false)
const sectionElement = ref<HTMLElement | null>(null)

// Check if element is in viewport
const checkVisibility = () => {
  if (!sectionElement.value) return
  
  const rect = sectionElement.value.getBoundingClientRect()
  const windowHeight = window.innerHeight
  
  // Trigger when element is within 200px of viewport
  if (rect.top < windowHeight + 200 && rect.bottom > -200) {
    sectionVisible.value = true
    // Remove listener once triggered
    window.removeEventListener('scroll', checkVisibility)
  }
}

onMounted(() => {
  // Check immediately in case it's already visible
  setTimeout(() => {
    checkVisibility()
  }, 100)
  
  // Add scroll listener
  window.addEventListener('scroll', checkVisibility, { passive: true })
})

// Parallax effect for background image with very slow, subtle movement
const { element: parallaxElement, translateY } = useParallax(0.05)

// Get the first featured project or fallback to first active project
const featuredProject = computed((): Project | null => {
  // First, try to get the "alone" project (not featured, not on homepage)
  if (projectsStore.aloneProjectsData) {
    return projectsStore.aloneProjectsData
  }

  // Fallback 1: Try to get a project from homepageProjects
  if (projectsStore.homepageProjects.length > 0) {
    return projectsStore.homepageProjects[0]
  }

  // Fallback 2: Get any active project
  if (projectsStore.activeProjects.length > 0) {
    return projectsStore.activeProjects[0]
  }

  // Otherwise return null (will hide the section)
  return null
})

// Truncate description to a specific character limit
const truncatedDescription = computed(() => {
  if (!featuredProject.value?.description) return ''
  const maxLength = 200
  const description = featuredProject.value.description
  return description.length > maxLength
    ? description.substring(0, maxLength).trim() + '...'
    : description
})
</script>

<template>
  <!-- Featured Project -->
  <section v-if="featuredProject" ref="sectionElement" class="bg-black min-h-[800px] relative overflow-hidden">
    <div class="w-full h-full">
      <div class="relative overflow-hidden h-[800px]">
        <!-- Parallax background image with zoom effect -->
        <div
          ref="parallaxElement"
          class="absolute inset-0 w-full transition-all duration-[1200ms] ease-out"
          :class="sectionVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-110'"
          :style="{ 
            transform: `translate3d(0, ${translateY}px, 0) scale(${sectionVisible ? 1 : 1.1})`,
            height: '120%',
            top: '-10%'
          }"
        >
          <img
            :src="getImageUrl(featuredProject.main_image) || 'https://placehold.co/900x806'"
            :alt="featuredProject.title"
            class="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        
        <!-- Gradient overlay with fade-in -->
        <div 
          class="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 transition-opacity duration-1000"
          :class="sectionVisible ? 'opacity-100' : 'opacity-0'"
        ></div>

        <!-- Content with staggered animations -->
        <div class="absolute inset-0 flex flex-col justify-center items-center text-center px-8">
          <!-- Divider line with slide and expand -->
          <div
            class="w-20 h-0.5 bg-gradient-to-r from-[#FFCD4B] to-[#EBB738] mb-8 transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-center shadow-[0_0_20px_rgba(255,205,75,0.5)]"
            :class="sectionVisible ? 'opacity-100 scale-x-100 blur-0' : 'opacity-0 scale-x-0 blur-sm'"
            style="transition-delay: 300ms"
          ></div>
          
          <!-- Title with slide up and fade -->
          <h3
            class="text-white text-4xl md:text-5xl font-extralight uppercase tracking-wider mb-8 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] transform"
            :class="sectionVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-12 blur-sm'"
            style="transition-delay: 500ms; text-shadow: 0 2px 20px rgba(0,0,0,0.5);"
          >
            {{ featuredProject.title }}
          </h3>
          
          <!-- Description with slide up and fade -->
          <p
            class="text-zinc-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl mb-12 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] transform"
            :class="sectionVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-12 blur-sm'"
            style="transition-delay: 700ms; text-shadow: 0 1px 10px rgba(0,0,0,0.5);"
          >
            {{ truncatedDescription }}
          </p>
          
          <!-- Button with slide up, scale, and glow -->
          <router-link
            :to="`/projects/${featuredProject.id}`"
            class="group inline-flex items-center gap-3 px-10 py-4 bg-[#FFCD4B] hover:bg-[#EBB738] text-black border-2 border-[#FFCD4B] font-light tracking-wider uppercase text-sm transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] transform hover:scale-105 hover:shadow-[0_0_30px_rgba(255,205,75,0.6)]"
            :class="sectionVisible ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-12 scale-90 blur-sm'"
            style="transition-delay: 900ms; box-shadow: 0 4px 20px rgba(0,0,0,0.3);"
          >
            <span>{{ t('buttons.discover') }}</span>
            <svg 
              class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
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
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
