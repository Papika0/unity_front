<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '../composables/useTranslations'
import { useProjectsStore } from '../stores/projects'

const { t } = useTranslations()
const router = useRouter()
const projectsStore = useProjectsStore()

const selectedCategory = ref('all')
const categories = ref([
  { value: 'all', label: 'ყველა' },
  { value: 'ongoing', label: 'მშენებარე' },
  { value: 'completed', label: 'დასრულებული' },
  { value: 'planning', label: 'დაგეგმილი' },
])

const filteredProjects = computed(() => {
  if (selectedCategory.value === 'all') {
    return projectsStore.activeProjects
  }
  return projectsStore.getProjectsByStatus(selectedCategory.value as any)
})

const viewProjectDetails = (projectId: number) => {
  router.push(`/projects/${projectId}`)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'ongoing':
      return 'bg-blue-100 text-blue-800'
    case 'planning':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'დასრულებული'
    case 'ongoing':
      return 'მშენებარე'
    case 'planning':
      return 'დაგეგმილი'
    default:
      return status
  }
}
</script>

<template>
  <div class="projects-page">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-gray-900 to-gray-700 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            {{ t('projects.title') }}
          </h1>
          <p class="text-xl text-gray-300 max-w-3xl mx-auto">
            ჩვენი რეალიზებული და მშენებარე პროექტების კოლექცია
          </p>
        </div>
      </div>
    </section>

    <!-- Filter Section -->
    <section class="py-8 bg-white border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap gap-4 justify-center">
          <button
            v-for="category in categories"
            :key="category.value"
            @click="selectedCategory = category.value"
            class="px-6 py-2 rounded-full font-medium transition-colors duration-200"
            :class="
              selectedCategory === category.value
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            "
          >
            {{ category.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- Projects Grid -->
    <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            @click="viewProjectDetails(project.id)"
          >
            <!-- Project Image -->
            <div
              class="h-64 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center relative overflow-hidden"
            >
              <img
                v-if="project.main_image"
                :src="project.main_image"
                :alt="project.title.ka"
                class="w-full h-full object-cover"
              />
              <svg v-else class="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                />
              </svg>
            </div>

            <!-- Project Content -->
            <div class="p-6">
              <div class="flex items-center justify-between mb-3">
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="getStatusColor(project.status)"
                >
                  {{ getStatusText(project.status) }}
                </span>
                <span class="text-sm text-gray-500">{{ project.year }}</span>
              </div>

              <h3 class="text-xl font-bold text-gray-900 mb-2">
                {{ project.title.ka }}
              </h3>

              <p class="text-gray-600 mb-4 line-clamp-3">
                {{ project.description.ka }}
              </p>

              <div class="flex items-center justify-between">
                <div class="text-sm text-gray-500">
                  <span class="font-medium">მისამართი:</span> {{ project.location.ka }}
                </div>
                <button class="text-yellow-500 hover:text-yellow-600 font-medium">
                  {{ t('projects.details') }} →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Load More Button -->
        <div class="text-center mt-12">
          <button
            class="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            მეტი პროექტის ნახვა
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
</style>
