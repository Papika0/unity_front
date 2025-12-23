<script setup lang="ts">
import { useProjects } from './projects/composables'
import { ProjectCard, ProjectsHero, ProjectsFilter } from './projects/components'

const {
  t,
  filteredProjects,
  totalProjects,
  hasMorePages,
  currentPage,
  isLoading,
  error,
  categories,
  selectedCategory,
  scrollProgress,
  isTransitioning,
  heroVisible,
  filterSectionRef,
  filterSectionVisible,
  projectsGridRef,
  projectsGridVisible,
  loadProjectsAndUpdateStore,
  getStatusColor,
  getStatusText,
} = useProjects()

function handleCategoryChange(value: string) {
  selectedCategory.value = value
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
    <ProjectsHero :hero-visible="heroVisible" />

    <!-- Filter Section -->
    <div ref="filterSectionRef">
      <ProjectsFilter
        :categories="categories"
        :selected-category="selectedCategory"
        :is-visible="filterSectionVisible"
        @update:selected-category="handleCategoryChange"
      />
    </div>

    <!-- Projects Grid -->
    <section ref="projectsGridRef" class="py-16 lg:py-20 bg-white">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <!-- Loading Overlay -->
        <div
          v-if="isLoading && filteredProjects.length === 0"
          class="fixed top-16 right-8 z-50 bg-black/80 backdrop-blur-sm px-6 py-3 rounded-full border border-[#FFCD4B]/30"
        >
          <div class="flex items-center gap-3">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-transparent border-t-[#FFCD4B]"></div>
            <span class="text-sm text-[#FFCD4B] font-light uppercase tracking-wider">
              {{ t('projects.loading') }}
            </span>
          </div>
        </div>

        <!-- Error Toast -->
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
          <ProjectCard
            v-for="(project, index) in filteredProjects"
            :key="project.id"
            :project="project"
            :index="index"
            :is-visible="projectsGridVisible"
            :is-transitioning="isTransitioning"
            :get-status-color="getStatusColor"
            :get-status-text="getStatusText"
          />
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
            <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
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

::selection {
  background: #ffcd4b;
  color: #000;
}

::-moz-selection {
  background: #ffcd4b;
  color: #000;
}
</style>
