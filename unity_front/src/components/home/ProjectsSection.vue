<script setup lang="ts">
import { computed } from 'vue'
import { useTranslations } from '../../composables/useTranslations'
import { useProjectsStore } from '../../stores/projects'

const { t } = useTranslations()
const projectsStore = useProjectsStore()

const statusColorMap = {
  ongoing: 'text-amber-300',
  completed: 'text-green-400',
  planning: 'text-blue-400',
}

const statusTextMap = {
  ongoing: 'მიმდინარე',
  completed: 'დასრულებული',
  planning: 'დაგეგმილი',
}

// Get first 3 active projects for homepage display
const displayProjects = computed(() =>
  projectsStore.activeProjects.slice(0, 3).map((project, index) => ({
    id: project.id,
    title: project.title.ka,
    address: project.location.ka,
    status: statusTextMap[project.status],
    statusColor: statusColorMap[project.status],
    image: project.main_image || 'https://placehold.co/447x507',
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
      <div class="h-7 bg-amber-300 mb-16"></div>

      <!-- Projects Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
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
    </div>
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
