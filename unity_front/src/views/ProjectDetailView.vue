<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTranslations } from '../composables/useTranslations'
import { useProjectsStore } from '../stores/projects'
import type { Project } from '../stores/projects'

const { t } = useTranslations()
const route = useRoute()
const router = useRouter()
const projectsStore = useProjectsStore()

const project = ref<Project | null>(null)
const selectedImageIndex = ref(0)

const relatedProjects = computed(() => {
  if (!project.value) return []

  // Get 3 random other active projects as related projects
  return projectsStore.activeProjects.filter((p) => p.id !== project.value?.id).slice(0, 3)
})

const statusText = computed(() => {
  if (!project.value) return ''

  switch (project.value.status) {
    case 'completed':
      return 'დასრულებული'
    case 'ongoing':
      return 'მშენებარე'
    case 'planning':
      return 'დაგეგმილი'
    default:
      return project.value.status
  }
})

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'მითითებული არ არის'

  const date = new Date(dateString)
  return date.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

onMounted(async () => {
  const projectId = parseInt(route.params.id as string)

  if (isNaN(projectId)) {
    router.push('/projects')
    return
  }

  // Try to fetch project from store
  const foundProject = projectsStore.getProjectById(projectId)

  if (foundProject) {
    project.value = foundProject
  } else {
    // In future, this could attempt to fetch from API
    router.push('/projects')
  }
})

const selectImage = (index: number) => {
  selectedImageIndex.value = index
}

const navigateToProject = (projectId: number) => {
  router.push(`/projects/${projectId}`)
}

const getRelatedProjectStatus = (project: Project) => {
  switch (project.status) {
    case 'completed':
      return 'დასრულებული'
    case 'ongoing':
      return 'მშენებარე'
    case 'planning':
      return 'დაგეგმილი'
    default:
      return project.status
  }
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div v-if="project" class="project-detail">
    <!-- Hero Section -->
    <section class="relative h-96 bg-gradient-to-r from-gray-900 to-gray-700">
      <div class="absolute inset-0 bg-black opacity-50"></div>
      <div class="relative z-10 h-full flex items-center">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <button @click="goBack" class="text-white hover:text-yellow-500 mb-4 flex items-center">
            ← უკან დაბრუნება
          </button>
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
            {{ project.title.ka }}
          </h1>
          <div class="flex flex-wrap gap-4 text-white">
            <span class="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm">
              {{ statusText }}
            </span>
            <span>📍 {{ project.location.ka }}</span>
            <span>📅 {{ project.year }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Image Gallery -->
          <div class="space-y-4">
            <!-- Main Image -->
            <div
              class="aspect-video bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl flex items-center justify-center overflow-hidden"
            >
              <img
                v-if="project.gallery_images && project.gallery_images[selectedImageIndex]"
                :src="project.gallery_images[selectedImageIndex]"
                :alt="project.title.ka"
                class="w-full h-full object-cover"
              />
              <img
                v-else-if="project.main_image"
                :src="project.main_image"
                :alt="project.title.ka"
                class="w-full h-full object-cover"
              />
              <svg v-else class="w-24 h-24 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                />
              </svg>
            </div>

            <!-- Thumbnail Gallery -->
            <div
              v-if="project.gallery_images && project.gallery_images.length > 1"
              class="grid grid-cols-4 gap-2"
            >
              <div
                v-for="(image, index) in project.gallery_images"
                :key="index"
                @click="selectImage(index)"
                class="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg cursor-pointer hover:opacity-75 transition-opacity overflow-hidden"
                :class="selectedImageIndex === index ? 'ring-2 ring-yellow-500' : ''"
              >
                <img
                  :src="image"
                  :alt="`${project.title.ka} ${index + 1}`"
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <!-- Project Details -->
          <div class="space-y-6">
            <div>
              <h2 class="text-2xl font-bold mb-4">პროექტის აღწერა</h2>
              <div class="prose max-w-none text-gray-600">
                <p class="mb-4">{{ project.description.ka }}</p>
              </div>
            </div>

            <!-- Project Information -->
            <div>
              <h3 class="text-xl font-bold mb-4">პროექტის ინფორმაცია</h3>
              <div class="grid grid-cols-1 gap-4">
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                  <span class="font-medium text-gray-700">სტატუსი:</span>
                  <span class="text-gray-900">{{ statusText }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                  <span class="font-medium text-gray-700">მისამართი:</span>
                  <span class="text-gray-900">{{ project.location.ka }}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                  <span class="font-medium text-gray-700">წელი:</span>
                  <span class="text-gray-900">{{ project.year }}</span>
                </div>
                <div
                  v-if="project.start_date"
                  class="flex justify-between items-center py-2 border-b border-gray-200"
                >
                  <span class="font-medium text-gray-700">დაწყების თარიღი:</span>
                  <span class="text-gray-900">{{ formatDate(project.start_date) }}</span>
                </div>
                <div
                  v-if="project.completion_date"
                  class="flex justify-between items-center py-2 border-b border-gray-200"
                >
                  <span class="font-medium text-gray-700">დასრულების თარიღი:</span>
                  <span class="text-gray-900">{{ formatDate(project.completion_date) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Specifications -->
    <!-- <section class="py-16 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center mb-12">ტექნიკური მონაცემები</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(value, key) in project.specifications"
            :key="key"
            class="bg-white p-6 rounded-xl shadow-sm"
          >
            <h3 class="text-sm text-gray-500 mb-2">{{ key }}</h3>
            <p class="text-xl font-bold text-gray-900">{{ value }}</p>
          </div>
        </div>
      </div>
    </section> -->

    <!-- Related Projects -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center mb-12">მსგავსი პროექტები</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            v-for="relatedProject in relatedProjects"
            :key="relatedProject.id"
            @click="navigateToProject(relatedProject.id)"
            class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
          >
            <div
              class="h-48 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center overflow-hidden"
            >
              <img
                v-if="relatedProject.main_image"
                :src="relatedProject.main_image"
                :alt="relatedProject.title.ka"
                class="w-full h-full object-cover"
              />
              <svg v-else class="w-12 h-12 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                />
              </svg>
            </div>
            <div class="p-4">
              <h3 class="font-bold text-lg mb-2">{{ relatedProject.title.ka }}</h3>
              <span class="text-sm text-gray-500">{{
                getRelatedProjectStatus(relatedProject)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gray-900 text-white py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold mb-4">დაინტერესდით ამ პროექტით?</h2>
        <p class="text-xl text-gray-300 mb-8">დაგვიკავშირდით დეტალური ინფორმაციისთვის</p>
        <router-link
          to="/contact"
          class="inline-block bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
        >
          {{ t('contact.title') }}
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.prose p {
  white-space: pre-line;
}
</style>
