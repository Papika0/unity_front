<script setup lang="ts">
import { computed } from 'vue'
import { useTranslations } from '../../composables/useTranslations'
import { useProjectsStore } from '@/stores/public/projects'

const { t } = useTranslations()
const backendUrl = import.meta.env.VITE_BACKEND_URL
const projectsStore = useProjectsStore()

const statusColorMap = {
  ongoing:
    'text-white bg-amber-600 px-3 py-1.5 rounded-full shadow-xl border-2 border-amber-300 font-semibold',
  completed:
    'text-white bg-green-600 px-3 py-1.5 rounded-full shadow-xl border-2 border-green-300 font-semibold',
  planning:
    'text-white bg-gray-600 px-3 py-1.5 rounded-full shadow-xl border-2 border-gray-300 font-semibold',
}

// Computed to ensure translations are loaded when accessed
const statusTextMap = computed(() => ({
  ongoing: t('projects.ongoing'),
  completed: t('projects.completed'),
  planning: t('projects.planning'),
}))

// Get first 3 active projects for homepage display
const displayProjects = computed(() =>
  projectsStore.homepageProjects.slice(0, 3).map((project) => ({
    id: project.id,
    title: project.title,
    address: project.location,
    status: statusTextMap.value[project.status as keyof typeof statusTextMap.value],
    statusColor: statusColorMap[project.status],
    image: backendUrl ? new URL(project.main_image, backendUrl).href : project.main_image,
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
        {{ t('home.projects') }}
      </h2>
      <img src="../../assets/Vector_10.png" alt="" class="mb-16" />

      <!-- Projects Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div v-for="project in displayProjects" :key="project.id" class="relative">
          <div class="relative">
            <img :src="project.image" :alt="project.title" class="w-full h-[507px] object-cover" />
            <!-- Apply overlay to all projects for consistent text visibility -->
            <div class="absolute inset-0 bg-zinc-900/50"></div>

            <!-- Project Info Overlay -->
            <div class="absolute top-6 left-6 text-white">
              <h3
                class="text-2xl font-normal font-roboto uppercase leading-tight mb-3 drop-shadow-lg"
              >
                {{ project.title }}
              </h3>
              <span
                :class="[
                  'text-sm font-normal font-roboto leading-tight inline-flex items-center gap-1.5',
                  project.statusColor,
                ]"
              >
                <svg
                  v-if="project.status === 'დასრულებული'"
                  class="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="project.status === 'მშენებარე'"
                  class="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="project.status === 'დაგეგმილი'"
                  class="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ project.status }}
              </span>
            </div>

            <div class="absolute bottom-6 left-6 text-white">
              <p
                class="text-xl font-normal font-roboto leading-relaxed drop-shadow-lg flex items-center gap-2"
              >
                <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clip-rule="evenodd"
                  />
                </svg>
                {{ project.address }}
              </p>
            </div>
          </div>

          <!-- CTA Button -->
          <div
            class="h-20 bg-gradient-to-b from-amber-300 via-amber-400 to-yellow-600 flex items-center px-6"
          >
            <router-link
              :to="`/projects/${project.id}`"
              class="text-black text-lg font-normal font-roboto uppercase leading-tight tracking-[2px] hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {{ t('buttons.discover') }} {{ project.title }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- View All Projects Button -->
      <div class="text-center">
        <router-link
          to="/projects"
          class="inline-flex items-center gap-3 bg-black text-white px-8 py-4 text-base font-roboto uppercase tracking-[2px] hover:bg-gray-800 transition-colors duration-300"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          {{ t('buttons.view_all') }}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  </section>
</template>

<style scoped>
/* Additional styles if needed */
</style>
