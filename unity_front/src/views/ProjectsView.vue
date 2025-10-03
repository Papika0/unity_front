<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useTranslations } from '../composables/useTranslations'
import { useProjectsPage } from '../composables/useProjectsPage'
import { useProjectsStore } from '@/stores/public/projects'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

const { t } = useTranslations()
const {
  allProjects,
  totalProjects,
  hasMorePages,
  currentPage,
  isLoading,
  error,
  loadProjectsPage,
} = useProjectsPage()

// Initialize projects store
const projectsStore = useProjectsStore()

const selectedCategory = ref('all')
const scrollProgress = ref(0)
const isTransitioning = ref(false)

// Hero is always visible since it's at the top
const heroVisible = ref(false)

// Scroll animations for sections
const {
  element: filterSectionRef,
  isVisible: filterSectionVisible,
} = useScrollAnimation({ threshold: 0.05, rootMargin: '200px', once: false })

const {
  element: projectsGridRef,
  isVisible: projectsGridVisible,
} = useScrollAnimation({ threshold: 0.05, rootMargin: '200px', once: false })

// Scroll progress tracking
const handleScroll = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = (scrollTop / docHeight) * 100
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // Scroll to top on mount
  window.scrollTo(0, 0)
  // Trigger hero animation immediately
  setTimeout(() => {
    heroVisible.value = true
  }, 100)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

const categories = computed(() => [
  { value: 'all', label: t('projects.categories.all') },
  { value: 'ongoing', label: t('projects.categories.ongoing') },
  { value: 'completed', label: t('projects.categories.completed') },
  { value: 'planning', label: t('projects.categories.planning') },
])

// No longer need client-side filtering - we fetch filtered data from server
const filteredProjects = computed(() => {
  return allProjects.value
})

// Function to load projects and update store
const loadProjectsAndUpdateStore = async (page: number = 1, loadMore: boolean = false) => {
  // Pass the selected category as status filter to the API
  const statusFilter = selectedCategory.value === 'all' ? undefined : selectedCategory.value
  await loadProjectsPage(page, loadMore, statusFilter)

  // Update the projects store with the loaded projects
  if (allProjects.value.length > 0) {
    // Transform ProjectApiResponse to Project interface
    const transformedProjects = allProjects.value.map((project) => ({
      ...project,
      status: project.status as 'planning' | 'ongoing' | 'completed',
      year: parseInt(project.year as string),
      main_image: project.main_image || null,
      render_image: project.render_image || null,
      gallery_images: project.gallery_images || [],
      latitude: project.latitude ? parseFloat(project.latitude) : null,
      longitude: project.longitude ? parseFloat(project.longitude) : null,
      created_at: new Date().toISOString(), // Fallback
      updated_at: new Date().toISOString(), // Fallback
    }))

    projectsStore.$patch({
      projects: transformedProjects,
    })
  }
}

// Reset and reload projects when category changes
watch(selectedCategory, async () => {
  // Start transition
  isTransitioning.value = true
  
  // Wait for fade-out animation
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // Load new projects
  await loadProjectsAndUpdateStore(1, false)
  
  // Wait a bit then fade back in
  await new Promise(resolve => setTimeout(resolve, 50))
  isTransitioning.value = false
})

// Load projects page data on component mount
onMounted(async () => {
  await loadProjectsAndUpdateStore()
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-600 text-white border border-green-300 shadow-lg'
    case 'ongoing':
      return 'bg-amber-600 text-white border border-amber-300 shadow-lg'
    case 'planning':
      return 'bg-gray-600 text-white border border-gray-300 shadow-lg'
    default:
      return 'bg-zinc-600 text-white border border-zinc-300 shadow-lg'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return t('projects.status.completed')
    case 'ongoing':
      return t('projects.status.ongoing')
    case 'planning':
      return t('projects.status.planning')
    default:
      return status
  }
}
</script>

<template>
  <div class="projects-page">
    <!-- Scroll Progress Bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50">
      <div
        class="h-full bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transition-all duration-150 ease-out shadow-[0_0_10px_rgba(255,205,75,0.5)]"
        :style="{ width: scrollProgress + '%' }"
      ></div>
    </div>

    <!-- Hero Section -->
    <section class="relative h-[45vh] min-h-[350px] overflow-hidden bg-black">
      <!-- Diagonal overlay accent -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-[#FFCD4B]/10 via-transparent to-transparent transition-opacity duration-1000 delay-200"
        :class="{ 'opacity-100': heroVisible, 'opacity-0': !heroVisible }"
      ></div>

      <!-- Decorative corner elements -->
      <div
        class="absolute top-0 right-0 w-64 h-64 opacity-20 transition-all duration-1000 delay-300"
        :class="{
          'opacity-20 translate-x-0 translate-y-0': heroVisible,
          'opacity-0 translate-x-8 -translate-y-8': !heroVisible,
        }"
      >
        <div
          class="absolute top-0 right-0 w-24 h-24 border-t-2 border-r-2 border-[#FFCD4B]"
        ></div>
      </div>
      <div
        class="absolute bottom-0 left-0 w-64 h-64 opacity-20 transition-all duration-1000 delay-400"
        :class="{
          'opacity-20 translate-x-0 translate-y-0': heroVisible,
          'opacity-0 -translate-x-8 translate-y-8': !heroVisible,
        }"
      >
        <div
          class="absolute bottom-0 left-0 w-24 h-24 border-b-2 border-l-2 border-[#FFCD4B]"
        ></div>
      </div>

      <!-- Content -->
      <div class="relative z-10 h-full flex flex-col justify-center">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 w-full">
          <div
            class="max-w-3xl transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-100"
            :class="{
              'opacity-100 translate-y-0 blur-0': heroVisible,
              'opacity-0 translate-y-12 blur-sm': !heroVisible,
            }"
          >
            <h1
              class="text-4xl md:text-5xl lg:text-6xl font-light mb-6 leading-tight text-white"
            >
              {{ t('projects.title') }}
            </h1>
            <div
              class="w-20 h-1 bg-gradient-to-r from-[#FFCD4B] to-transparent mb-6 transition-all duration-1000 delay-300"
              :class="{ 'scale-x-100': heroVisible, 'scale-x-0': !heroVisible }"
              style="transform-origin: left"
            ></div>
            <p class="text-lg md:text-xl text-[#FFCD4B] font-light leading-relaxed max-w-2xl">
              {{ t('projects.subtitle') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Filter Section -->
    <section
      ref="filterSectionRef"
      class="py-16 bg-zinc-50 border-b border-zinc-100"
    >
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <div class="flex flex-wrap gap-3 justify-center">
          <button
            v-for="(category, index) in categories"
            :key="category.value"
            @click="selectedCategory = category.value"
            class="px-6 py-2.5 text-sm uppercase tracking-wider font-light transition-all duration-[800ms] ease-[cubic-bezier(0.16,1,0.3,1)] transform hover:scale-105"
            :class="[
              selectedCategory === category.value
                ? 'bg-black text-[#FFCD4B] shadow-lg'
                : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200 hover:border-zinc-300',
              filterSectionVisible
                ? 'opacity-100 translate-y-0 scale-100 blur-0'
                : 'opacity-0 translate-y-8 scale-95 blur-sm',
            ]"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            {{ category.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Projects Grid -->
    <section ref="projectsGridRef" class="py-16 lg:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <!-- Loading Overlay (non-blocking) -->
        <div
          v-if="isLoading && allProjects.length === 0"
          class="fixed top-16 right-8 z-50 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-[#FFCD4B]/30"
        >
          <div class="flex items-center gap-3">
            <div
              class="animate-spin rounded-full h-4 w-4 border-2 border-transparent border-t-[#FFCD4B]"
            ></div>
            <span class="text-sm text-[#FFCD4B] font-light uppercase tracking-wider">
              {{ t('projects.loading') }}
            </span>
          </div>
        </div>

        <!-- Error Toast (non-blocking) -->
        <div
          v-if="error"
          class="fixed top-16 right-8 z-50 bg-red-500/90 backdrop-blur-sm px-6 py-4 rounded border border-red-400 max-w-md"
        >
          <div class="flex items-start gap-3">
            <div class="text-2xl">⚠️</div>
            <div class="flex-1">
              <h3 class="text-white font-medium mb-1">{{ t('projects.error_title') }}</h3>
              <p class="text-white/90 text-sm">{{ error }}</p>
              <button
                @click="() => loadProjectsAndUpdateStore(1, false)"
                class="mt-2 px-4 py-1 bg-white/20 hover:bg-white/30 text-white text-xs uppercase tracking-wider transition-all duration-300 rounded"
              >
                {{ t('buttons.retry') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Projects Grid (always visible) -->
        <div>
          <!-- No Projects Found -->
          <div
            v-if="filteredProjects.length === 0 && !isLoading"
            class="text-center py-20 transition-all duration-1000"
            :class="{
              'opacity-100 translate-y-0': projectsGridVisible,
              'opacity-0 translate-y-12': !projectsGridVisible,
            }"
          >
            <div class="text-5xl mb-6 text-zinc-300">🏗️</div>
            <h3 class="text-xl font-light text-zinc-600 mb-3">
              {{ t('projects.no_projects_title') }}
            </h3>
            <p class="text-base text-zinc-500 font-light">{{ t('projects.no_projects_text') }}</p>
          </div>

          <!-- Projects Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300"
            :class="{
              'opacity-0 scale-95': isTransitioning,
              'opacity-100 scale-100': !isTransitioning,
            }"
          >
            <div
              v-for="(project, index) in filteredProjects"
              :key="project.id"
              class="group bg-white overflow-hidden hover:shadow-2xl transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] border border-zinc-100 hover:border-[#FFCD4B]/30"
              :class="{
                'opacity-100 translate-y-0 scale-100 blur-0': projectsGridVisible && !isTransitioning,
                'opacity-0 translate-y-12 scale-95 blur-sm': !projectsGridVisible || isTransitioning,
              }"
              :style="{ transitionDelay: isTransitioning ? '0ms' : `${index * 80}ms` }"
            >
              <!-- Project Image -->
              <div class="relative h-72 bg-zinc-100 overflow-hidden">
                <img
                  v-if="project.main_image"
                  :src="project.main_image.url"
                  :alt="project.main_image.alt_text || project.title"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <svg class="w-16 h-16 text-zinc-300" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    />
                  </svg>
                </div>

                <!-- Gradient overlay on hover -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>

                <!-- Golden accent line on hover -->
                <div
                  class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                ></div>

                <!-- Status and Year badges -->
                <div class="absolute top-4 left-4 flex gap-2">
                  <span
                    class="px-3 py-1 text-xs font-light uppercase tracking-wider backdrop-blur-sm"
                    :class="getStatusColor(project.status)"
                  >
                    {{ getStatusText(project.status) }}
                  </span>
                </div>

                <div class="absolute top-4 right-4">
                  <span
                    class="px-3 py-1 text-xs font-light bg-white/90 text-zinc-900 backdrop-blur-sm"
                  >
                    {{ project.year }}
                  </span>
                </div>
              </div>

              <!-- Project Content -->
              <div class="p-6 bg-white relative overflow-hidden">
                <!-- Subtle background accent -->
                <div
                  class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>

                <h3
                  class="text-lg font-light text-zinc-900 mb-3 line-clamp-1 relative z-10 group-hover:text-[#C89116] transition-colors duration-300"
                >
                  {{ project.title }}
                </h3>

                <div class="flex items-center gap-2 mb-5 text-zinc-500 relative z-10">
                  <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span class="text-sm font-light line-clamp-1">{{ project.location }}</span>
                </div>

                <router-link
                  :to="{ name: 'project-detail', params: { id: project.id } }"
                  class="block w-full bg-gradient-to-b from-[#FFCD4B] via-[#EBB738] to-[#C89116] text-black py-3 text-center text-sm uppercase tracking-wider font-light hover:opacity-90 transition-all duration-300 relative z-10 group-hover:shadow-lg transform group-hover:-translate-y-0.5"
                >
                  {{ t('projects.details') }}
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination Info -->
        <div v-if="filteredProjects.length > 0" class="text-center mt-16">
          <p class="text-sm text-zinc-500 font-light uppercase tracking-wider">
            {{ t('projects.showing') }} {{ filteredProjects.length }} {{ t('projects.of') }}
            {{ totalProjects }}
          </p>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMorePages" class="text-center mt-10">
          <button
            @click="() => loadProjectsAndUpdateStore(currentPage + 1, true)"
            class="inline-flex items-center gap-3 px-10 py-4 bg-black text-[#FFCD4B] text-sm uppercase tracking-wider font-light transition-all duration-300 hover:bg-zinc-900 group"
          >
            <span>{{ t('projects.load_more') }}</span>
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
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Smooth animations */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom gradient text */
.gradient-text {
  background: linear-gradient(135deg, #ffcd4b, #ebb738);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Enhanced shadow effects */
.shadow-luxury {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Custom backdrop blur */
.backdrop-blur-luxury {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Smooth transitions for all interactive elements */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #18181b;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #ffcd4b, #ebb738, #c89116);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #ebb738, #c89116, #a37814);
}

/* Selection color */
::selection {
  background: #ffcd4b;
  color: #000;
}

::-moz-selection {
  background: #ffcd4b;
  color: #000;
}

/* Smooth image loading */
img {
  will-change: transform;
  transition: opacity 0.5s ease-out, transform 0.7s ease-out;
}
</style>
