<script setup lang="ts">
import { computed } from 'vue'
import { useTranslations } from '../../composables/useTranslations'
import { useProjectsStore } from '@/stores/public/projects'

const { t, isInitialized } = useTranslations()
const backendUrl = import.meta.env.VITE_BACKEND_URL
const projectsStore = useProjectsStore()

const statusColorMap = {
  ongoing: 'text-amber-300',
  completed: 'text-green-400',
  planning: 'text-blue-400',
}

// Computed to ensure translations are loaded when accessed
const statusTextMap = computed(() => ({
  ongoing: t('projects.status1'),
  completed: t('projects.status2'),
  planning: t('projects.statusPlanning'),
}))

// Get first 3 active projects for homepage display
const displayProjects = computed(() =>
  projectsStore.homepageProjects.slice(0, 3).map((project, index) => ({
    id: project.id,
    title: project.title,
    address: project.location,
    status: statusTextMap.value[project.status as keyof typeof statusTextMap.value],
    statusColor: statusColorMap[project.status],
    image: backendUrl ? new URL(project.main_image, backendUrl).href : project.main_image,
    overlay: index > 0, // Apply overlay to projects after the first one
  })),
)
</script>

<template>
  <!-- Projects Section -->
  <section class="bg-white py-16">
    <div class="max-w-7xl mx-auto px-4 md:px-8">
      <h2
        class="text-zinc-900 text-4xl font-normal font-roboto uppercase leading-loose tracking-[3px] mb-8"
      >
        {{ t('projects.title') }}
      </h2>
      <img src="../../assets/Vector_10.png" alt="" class="mb-16" />

      <!-- Loading State -->
      <div v-if="projectsStore.isLoading || !isInitialized" class="text-center py-16">
        <div v-if="!isInitialized" class="text-gray-600 text-lg">
          <div
            class="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"
          ></div>
          Loading translations...
        </div>
        <p v-else class="text-gray-600 text-lg">{{ t('common.loading') }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="projectsStore.error" class="text-center py-16">
        <p class="text-red-600 text-lg">{{ t('common.error') }}: {{ projectsStore.error }}</p>
      </div>

      <!-- No Projects State -->
      <div v-else-if="displayProjects.length === 0" class="text-center py-16">
        <p class="text-gray-600 text-lg">{{ t('projects.empty') }}</p>
      </div>

      <!-- Projects Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div v-for="project in displayProjects" :key="project.id" class="relative">
          <div class="relative">
            <img :src="project.image" :alt="project.title" class="w-full h-[507px] object-cover" />
            <div v-if="project.overlay" class="absolute inset-0 bg-zinc-900/50"></div>

            <!-- Project Info Overlay -->
            <div class="absolute top-8 left-8 text-orange-100">
              <h3 class="text-4xl font-normal font-roboto uppercase leading-loose mb-4">
                {{ project.title }}
              </h3>
              <p :class="['text-xl font-normal font-roboto leading-loose', project.statusColor]">
                {{ project.status }}
              </p>
            </div>

            <div class="absolute bottom-8 left-8 text-orange-100">
              <p class="text-4xl font-normal font-roboto leading-[47.60px]">
                {{ project.address }}
              </p>
            </div>
          </div>

          <!-- CTA Button -->
          <div
            class="h-28 bg-gradient-to-b from-amber-300 via-amber-400 to-yellow-600 flex items-center px-8"
          >
            <router-link
              :to="`/projects/${project.id}`"
              class="text-black text-2xl font-normal font-roboto uppercase leading-tight tracking-[3.36px] hover:opacity-80 transition-opacity"
            >
              {{ t('projects.discover') }} {{ project.title }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- View All Projects Button -->
      <div class="text-center">
        <router-link
          to="/projects"
          class="inline-block bg-black text-white px-8 py-4 text-lg font-roboto uppercase tracking-[3px] hover:bg-gray-800 transition-colors duration-300"
        >
          {{ t('projects.viewAll') }}
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
