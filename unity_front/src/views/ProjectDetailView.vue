<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTranslations } from '../composables/useTranslations'
import { useProjectsPage } from '../composables/useProjectsPage'
import { useLocaleStore } from '@/stores/ui/locale'
import { projectsApi } from '@/services/projectsApi'
import type { ProjectApiResponse } from '@/services/projectsApi'
import type { ProjectFeature } from '@/services/featuresApi'

const { t } = useTranslations()
const route = useRoute()
const router = useRouter()

// Initialize locale store
const localeStore = useLocaleStore()

// Initialize projects page composable to load translations and projects
const { loadProjectsPage, allProjects } = useProjectsPage()

const project = ref<ProjectApiResponse | null>(null)
const isLoading = ref(true) // Start with loading true
const error = ref<string | null>(null)
const selectedImageIndex = ref(0)
const isFullscreenGallery = ref(false)
const projectFeatures = ref<ProjectFeature[]>([])

const relatedProjects = computed((): ProjectApiResponse[] => {
  if (!project.value || !allProjects.value) return []

  // Get projects with the same status, excluding current project
  const sameStatusProjects = allProjects.value.filter(
    (p) => p.id !== project.value!.id && p.status === project.value!.status,
  )

  // If we have same status projects, return up to 3
  if (sameStatusProjects.length > 0) {
    return sameStatusProjects.slice(0, 3)
  }

  // Otherwise, return other projects excluding current one
  return allProjects.value.filter((p) => p.id !== project.value!.id).slice(0, 3)
})

const statusText = computed(() => {
  if (!project.value) return ''

  switch (project.value.status) {
    case 'completed':
      return t('projects.completed')
    case 'ongoing':
      return t('projects.ongoing')
    case 'planning':
      return t('projects.planning')
    default:
      return project.value.status
  }
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'from-green-500 to-emerald-600'
    case 'ongoing':
      return 'from-amber-500 to-orange-600'
    case 'planning':
      return 'from-slate-500 to-gray-600'
    default:
      return 'from-amber-500 to-orange-600'
  }
}

const getStatusBgColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'from-green-50 to-emerald-50'
    case 'ongoing':
      return 'from-amber-50 to-orange-50'
    case 'planning':
      return 'from-slate-50 to-gray-50'
    default:
      return 'from-amber-50 to-orange-50'
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return t('projects.not_specified')

  const date = new Date(dateString)
  return date.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
  })
}

const formatDescription = (description: string) => {
  if (!description) return ''

  // Split by double line breaks to create paragraphs
  const paragraphs = description.split(/\r\n\s*\r\n/).filter((p) => p.trim())

  return paragraphs
    .map((paragraph) => {
      const trimmed = paragraph.trim()

      // Check if it's a bullet point list
      if (trimmed.includes('*')) {
        const lines = trimmed.split(/\r\n/).filter((line) => line.trim())
        const listItems = lines
          .filter((line) => line.trim().startsWith('*'))
          .map(
            (line) =>
              `<li class="mb-3 text-slate-700 leading-relaxed">${line.replace(/^\*\s*/, '')}</li>`,
          )
          .join('')

        if (listItems) {
          return `<ul class="custom-list my-6">${listItems}</ul>`
        }
      }

      // Regular paragraph
      return `<p class="mb-6 text-slate-700 leading-relaxed">${trimmed.replace(/\r\n/g, '<br>')}</p>`
    })
    .join('')
}

// Function to load project data
const loadProjectData = async (projectId: number) => {
  isLoading.value = true
  error.value = null

  try {
    // Check if we need to load translations and projects
    const { arePageGroupsLoaded } = useTranslations()
    const needsTranslations = !arePageGroupsLoaded('projects')
    const needsProjects = allProjects.value.length === 0

    // Only load projects page data if we don't have translations or projects
    if (needsTranslations || needsProjects) {
      try {
        await loadProjectsPage()
      } catch (projectsPageError) {
        console.warn(
          'Failed to load projects page, trying to load projects directly:',
          projectsPageError,
        )
        // Fallback: try to load projects directly
        try {
          const projectsResponse = await projectsApi.getAll(localeStore.currentLocale)
          allProjects.value = projectsResponse
        } catch (projectsError) {
          console.error('Failed to load projects directly:', projectsError)
        }
      }

      // Note: Store update removed due to type compatibility issues
      // The allProjects from useProjectsPage is sufficient for related projects
    }

    // Then load the specific project (now includes features)
    const projectData = await projectsApi.getById(projectId, localeStore.currentLocale)
    project.value = projectData

    // Set features from project data
    projectFeatures.value = projectData.features || []
  } catch (err) {
    console.error('Failed to load project:', err)
    error.value = 'Failed to load project'
    router.push('/projects')
  } finally {
    isLoading.value = false
  }
}

// Watch for route changes to handle direct URL access
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      const projectId = parseInt(newId as string)
      if (!isNaN(projectId)) {
        await loadProjectData(projectId)
      } else {
        router.push('/projects')
      }
    }
  },
  { immediate: true },
)

const selectImage = (index: number) => {
  selectedImageIndex.value = index
}

const openFullscreenGallery = () => {
  isFullscreenGallery.value = true
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', handleKeydown)
}

const closeFullscreenGallery = () => {
  isFullscreenGallery.value = false
  document.body.style.overflow = 'auto'
  document.removeEventListener('keydown', handleKeydown)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeFullscreenGallery()
  } else if (event.key === 'ArrowLeft') {
    prevImage()
  } else if (event.key === 'ArrowRight') {
    nextImage()
  }
}

const nextImage = () => {
  if (project.value?.gallery_images) {
    selectedImageIndex.value = (selectedImageIndex.value + 1) % project.value.gallery_images.length
  }
}

const prevImage = () => {
  if (project.value?.gallery_images) {
    selectedImageIndex.value =
      selectedImageIndex.value === 0
        ? project.value.gallery_images.length - 1
        : selectedImageIndex.value - 1
  }
}

const navigateToProject = (projectId: number) => {
  router.push(`/projects/${projectId}`)
}

const getRelatedProjectStatus = (project: ProjectApiResponse) => {
  switch (project.status) {
    case 'completed':
      return t('projects.completed')
    case 'ongoing':
      return t('projects.ongoing')
    case 'planning':
      return t('projects.planning')
    default:
      return project.status
  }
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="project-detail">
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 flex items-center justify-center"
    >
      <div class="text-center">
        <div class="relative">
          <div class="w-20 h-20 border-4 border-amber-200 rounded-full"></div>
          <div
            class="w-20 h-20 border-4 border-amber-500 rounded-full animate-spin absolute top-0 left-0 border-t-transparent"
          ></div>
        </div>
        <p class="mt-8 text-xl text-slate-600 font-medium">{{ t('projects.loading') }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 flex items-center justify-center"
    >
      <div class="text-center max-w-md mx-auto px-8">
        <div
          class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 class="text-3xl font-semibold text-slate-800 mb-4">{{ t('projects.error_title') }}</h2>
        <p class="text-lg text-slate-600 mb-8">{{ error }}</p>
        <button
          @click="() => loadProjectData(parseInt(route.params.id as string))"
          class="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-medium text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 transform"
        >
          {{ t('buttons.retry') }}
        </button>
      </div>
    </div>

    <!-- No Project Found -->
    <div
      v-else-if="!project && !isLoading && !error"
      class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30 flex items-center justify-center"
    >
      <div class="text-center max-w-md mx-auto px-8">
        <div
          class="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg
            class="w-12 h-12 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <h2 class="text-3xl font-semibold text-slate-800 mb-4">
          {{ t('projects.not_found.title') }}
        </h2>
        <p class="text-lg text-slate-600 mb-8">{{ t('projects.not_found.description') }}</p>
        <button
          @click="goBack"
          class="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-medium text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 transform"
        >
          {{ t('buttons.back') }}
        </button>
      </div>
    </div>

    <!-- Project Content -->
    <div v-else-if="project" class="project-content">
      <!-- Hero Section with Parallax Background -->
      <section class="relative h-[70vh] min-h-[500px] overflow-hidden">
        <!-- Background Image with Overlay -->
        <div class="absolute inset-0">
          <img
            v-if="project.render_image || project.main_image"
            :src="(project.render_image || project.main_image)!"
            :alt="project.title"
            class="w-full h-full object-cover"
          />
          <div
            class="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/90"
          ></div>
        </div>

        <!-- Content -->
        <div class="relative z-10 h-full flex flex-col">
          <!-- Navigation -->
          <div class="max-w-[1400px] mx-auto px-6 lg:px-12 w-full pt-8">
            <button
              @click="goBack"
              class="text-white/90 hover:text-white flex items-center gap-2 group transition-all duration-300 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <svg
                class="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span class="font-medium">{{ t('buttons.back') }}</span>
            </button>
          </div>

          <!-- Hero Content -->
          <div class="flex-grow flex items-center">
            <div class="max-w-[1400px] mx-auto px-6 lg:px-12 w-full">
              <div class="max-w-4xl">
                <!-- Status Badge -->
                <div class="mb-6">
                  <span
                    :class="`inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r ${getStatusColor(project.status)} text-white rounded-full text-sm font-medium shadow-lg`"
                  >
                    <span class="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    {{ statusText }}
                  </span>
                </div>

                <!-- Title -->
                <h1
                  class="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight"
                >
                  {{ project.title }}
                </h1>

                <!-- Location and Year -->
                <div class="flex flex-wrap items-center gap-6 text-white/90">
                  <div class="flex items-center gap-2">
                    <svg class="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-lg">{{ project.location }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-lg">{{ project.year }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content Section -->
      <section class="py-20 bg-gradient-to-b from-white to-slate-50">
        <div class="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <!-- Left Column - Gallery and Info -->
            <div class="lg:col-span-5 space-y-8">
              <!-- Image Gallery -->
              <div class="bg-white rounded-3xl shadow-xl overflow-hidden">
                <!-- Main Image -->
                <div
                  class="aspect-[4/3] bg-slate-100 relative overflow-hidden group cursor-pointer"
                  @click="openFullscreenGallery"
                >
                  <img
                    v-if="project.gallery_images && project.gallery_images[selectedImageIndex]"
                    :src="project.gallery_images[selectedImageIndex]"
                    :alt="project.title"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <img
                    v-else-if="project.main_image"
                    :src="project.main_image"
                    :alt="project.title"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  <!-- Image Counter -->
                  <div
                    v-if="project.gallery_images && project.gallery_images.length > 1"
                    class="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {{ selectedImageIndex + 1 }} / {{ project.gallery_images.length }}
                  </div>

                  <!-- Fullscreen Icon -->
                  <div
                    class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center"
                  >
                    <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg
                        class="w-12 h-12 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <!-- Thumbnail Gallery -->
                <div v-if="project.gallery_images && project.gallery_images.length > 1" class="p-4">
                  <div class="grid grid-cols-6 gap-2">
                    <button
                      v-for="(image, index) in project.gallery_images"
                      :key="index"
                      @click="selectImage(index)"
                      class="aspect-square rounded-lg overflow-hidden transition-all duration-300 focus:outline-none"
                      :class="
                        selectedImageIndex === index
                          ? 'ring-2 ring-amber-500 ring-offset-2 scale-95'
                          : 'hover:ring-2 hover:ring-amber-300 hover:ring-offset-1 opacity-70 hover:opacity-100'
                      "
                    >
                      <img
                        :src="image"
                        :alt="`${project.title} ${index + 1}`"
                        class="w-full h-full object-cover"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Project Details Card -->
              <div class="bg-white rounded-3xl shadow-xl p-8">
                <h3 class="text-2xl font-bold text-slate-900 mb-6">
                  {{ t('projects.details.title') }}
                </h3>

                <div class="space-y-5">
                  <!-- Status -->
                  <div
                    :class="`flex items-center justify-between p-4 bg-gradient-to-r ${getStatusBgColor(project.status)} rounded-2xl`"
                  >
                    <span class="font-medium text-slate-700">{{
                      t('projects.details.status')
                    }}</span>
                    <span
                      :class="`px-4 py-1.5 bg-gradient-to-r ${getStatusColor(project.status)} text-white rounded-full text-sm font-medium shadow-md`"
                    >
                      {{ statusText }}
                    </span>
                  </div>

                  <!-- Location -->
                  <div
                    class="flex items-start justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors"
                  >
                    <span class="font-medium text-slate-700">{{
                      t('projects.details.location')
                    }}</span>
                    <span class="text-slate-900 font-medium text-right max-w-[200px]">{{
                      project.location
                    }}</span>
                  </div>

                  <!-- Start Date -->
                  <div
                    v-if="project.start_date"
                    class="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors"
                  >
                    <span class="font-medium text-slate-700">{{ t('projects.details.start_date') }}</span>
                    <span class="text-slate-900 font-medium">{{
                      formatDate(project.start_date)
                    }}</span>
                  </div>

                  <!-- Completion Date -->
                  <div
                    v-if="project.completion_date"
                    class="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors"
                  >
                    <span class="font-medium text-slate-700">{{ t('projects.details.completion_date') }}</span>
                    <span class="text-slate-900 font-medium">{{
                      formatDate(project.completion_date)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column - Description -->
            <div class="lg:col-span-7">
              <div class="bg-white rounded-3xl shadow-xl p-10">
                <div class="mb-8">
                  <h2 class="text-4xl font-bold text-slate-900 mb-4">
                    {{ t('projects.about.title') }}
                  </h2>
                  <div
                    class="w-20 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  ></div>
                </div>

                <!-- Enhanced Description with Better Typography -->
                <div class="prose prose-lg max-w-none">
                  <div
                    class="space-y-6 text-slate-700 leading-relaxed"
                    v-html="formatDescription(project.description)"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Grid (if bullet points exist in description) -->
      <section v-if="project.description" class="py-20 bg-white">
        <div class="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div class="text-center mb-12">
            <h2 class="text-4xl font-bold text-slate-900 mb-4">
              {{ t('projects.advantages.title') }}
            </h2>
            <div
              class="w-20 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto"
            ></div>
          </div>

          <!-- Dynamic Feature Cards -->
          <div
            v-if="projectFeatures.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div
              v-for="feature in projectFeatures"
              :key="feature.id"
              class="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-100 hover:border-slate-200"
            >
              <!-- Feature Icon -->
              <div
                class="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r mb-4 group-hover:scale-110 transition-transform duration-300"
                :class="feature.color"
              >
                <span class="text-2xl">{{ feature.icon }}</span>
              </div>

              <!-- Feature Content -->
              <div>
                <h3
                  class="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors"
                >
                  {{ feature.title }}
                </h3>
                <p class="text-slate-600 leading-relaxed">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Fallback message if no features detected -->
          <div v-else class="text-center py-12">
            <div
              class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg
                class="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p class="text-slate-500 text-lg">{{ t('projects.features.no_features') }}</p>
          </div>
        </div>
      </section>

      <!-- Apartment Selection - Coming Soon -->
      <section class="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
        <div class="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div class="grid grid-cols-1 lg:grid-cols-2">
              <!-- Left side - Content -->
              <div class="p-12 lg:p-16 flex flex-col justify-center">
                <div class="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 w-fit">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                  </svg>
                  {{
                    localeStore.currentLocale === 'ka'
                      ? 'მალე გამოჩნდება'
                      : localeStore.currentLocale === 'en'
                        ? 'Coming Soon'
                        : 'Скоро'
                  }}
                </div>

                <h2 class="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                  {{
                    localeStore.currentLocale === 'ka'
                      ? 'ბინის არჩევა'
                      : localeStore.currentLocale === 'en'
                        ? 'Apartment Selection'
                        : 'Выбор квартиры'
                  }}
                </h2>

                <p class="text-lg text-slate-600 mb-8 leading-relaxed">
                  {{
                    localeStore.currentLocale === 'ka'
                      ? 'მალე შეძლებთ ინტერაქტიულად აირჩიოთ თქვენთვის სასურველი ბინა პროექტში. დაათვალიერეთ ხელმისაწვდომი ბინები, შეადარეთ განლაგება და მიიღეთ დეტალური ინფორმაცია.'
                      : localeStore.currentLocale === 'en'
                        ? 'Soon you will be able to interactively select your desired apartment in the project. Browse available apartments, compare layouts, and get detailed information.'
                        : 'Скоро вы сможете интерактивно выбрать желаемую квартиру в проекте. Просмотрите доступные квартиры, сравните планировки и получите подробную информацию.'
                  }}
                </p>

                <div class="space-y-4">
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mt-1">
                      <svg class="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <p class="text-slate-700 flex-1">
                      {{
                        localeStore.currentLocale === 'ka'
                          ? 'ინტერაქტიული სართულების გეგმა'
                          : localeStore.currentLocale === 'en'
                            ? 'Interactive floor plans'
                            : 'Интерактивные поэтажные планы'
                      }}
                    </p>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mt-1">
                      <svg class="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <p class="text-slate-700 flex-1">
                      {{
                        localeStore.currentLocale === 'ka'
                          ? 'რეალურ დროში ხელმისაწვდომობის ინფორმაცია'
                          : localeStore.currentLocale === 'en'
                            ? 'Real-time availability information'
                            : 'Информация о доступности в реальном времени'
                      }}
                    </p>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mt-1">
                      <svg class="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                      </svg>
                    </div>
                    <p class="text-slate-700 flex-1">
                      {{
                        localeStore.currentLocale === 'ka'
                          ? 'დეტალური ფასები და მახასიათებლები'
                          : localeStore.currentLocale === 'en'
                            ? 'Detailed prices and specifications'
                            : 'Подробные цены и характеристики'
                      }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Right side - Visual placeholder -->
              <div class="relative bg-gradient-to-br from-amber-400 to-orange-500 p-12 lg:p-16 flex items-center justify-center overflow-hidden">
                <!-- Background pattern -->
                <div class="absolute inset-0 opacity-10">
                  <svg class="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5"/>
                    </pattern>
                    <rect width="100" height="100" fill="url(#grid)" />
                  </svg>
                </div>

                <!-- Building icon illustration -->
                <div class="relative z-10">
                  <svg class="w-64 h-64 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <div class="absolute -top-4 -right-4 w-20 h-20 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                    <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div class="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div class="text-center">
            <h2 class="text-3xl md:text-4xl font-light text-slate-800 mb-4">
              {{ t('projects.cta.title') }}
            </h2>
            <p class="text-lg text-slate-600 mb-8 max-w-2xl mx-auto font-light">
              {{ t('projects.cta.description') }}
            </p>
            <router-link
              to="/contact"
              class="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-3 rounded-full font-medium text-base transition-all duration-300 hover:bg-slate-800 hover:shadow-lg"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {{ t('projects.cta.contact_button') }}
            </router-link>
          </div>
        </div>
      </section>

      <!-- Related Projects -->
      <section
        v-if="relatedProjects.length > 0"
        class="py-20 bg-gradient-to-b from-slate-50 to-white"
      >
        <div class="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div class="text-center mb-12">
            <h2 class="text-4xl font-bold text-slate-900 mb-4">
              {{ t('projects.related.title') }}
            </h2>
            <div
              class="w-20 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mx-auto"
            ></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              v-for="relatedProject in relatedProjects"
              :key="relatedProject.id"
              @click="navigateToProject(relatedProject.id)"
              class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer"
            >
              <div class="aspect-[4/3] bg-slate-100 overflow-hidden">
                <img
                  v-if="relatedProject.main_image"
                  :src="relatedProject.main_image"
                  :alt="relatedProject.title"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              <div class="p-6">
                <h3
                  class="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors"
                >
                  {{ relatedProject.title }}
                </h3>
                <span class="text-sm text-slate-500 font-medium">
                  {{ getRelatedProjectStatus(relatedProject) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Fullscreen Gallery Modal -->
    <div
      v-if="isFullscreenGallery"
      class="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
      @click="closeFullscreenGallery"
    >
      <!-- Close Button -->
      <button
        @click="closeFullscreenGallery"
        class="absolute top-6 right-6 z-10 text-white hover:text-gray-300 transition-colors"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Navigation Arrows -->
      <button
        v-if="project?.gallery_images && project.gallery_images.length > 1"
        @click.stop="prevImage"
        class="absolute left-6 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        v-if="project?.gallery_images && project.gallery_images.length > 1"
        @click.stop="nextImage"
        class="absolute right-6 top-1/2 -translate-y-1/2 z-10 text-white hover:text-gray-300 transition-colors"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Main Image -->
      <div class="max-w-7xl max-h-[90vh] mx-auto px-16" @click.stop>
        <img
          v-if="project?.gallery_images && project.gallery_images[selectedImageIndex]"
          :src="project.gallery_images[selectedImageIndex]"
          :alt="project.title"
          class="max-w-full max-h-full object-contain"
        />
        <img
          v-else-if="project?.main_image"
          :src="project.main_image"
          :alt="project.title"
          class="max-w-full max-h-full object-contain"
        />
      </div>

      <!-- Image Counter -->
      <div
        v-if="project?.gallery_images && project.gallery_images.length > 1"
        class="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-lg font-medium"
      >
        {{ selectedImageIndex + 1 }} / {{ project.gallery_images.length }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Georgian Font Optimization */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@300;400;500;600;700;800&display=swap');

.project-detail {
  font-family:
    'Noto Sans Georgian',
    system-ui,
    -apple-system,
    sans-serif;
}

/* Smooth Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out forwards;
}

/* Enhanced Typography for Georgian Text */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-feature-settings: 'kern' 1;
  text-rendering: optimizeLegibility;
}

/* Improved Description Formatting */
.prose p {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: #475569;
  margin-bottom: 1.5rem;
}

.prose p:first-of-type {
  font-size: 1.125rem;
  font-weight: 500;
  color: #334155;
}

/* Custom List Styling */
.custom-list {
  list-style: none;
  padding: 0;
  margin: 2rem 0;
}

.custom-list li {
  position: relative;
  padding-left: 2rem;
  margin-bottom: 1rem;
  line-height: 1.8;
  color: #475569;
  font-size: 1.0625rem;
}

.custom-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  top: 0.125rem;
  width: 1.5rem;
  height: 1.5rem;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.75rem;
}

/* Glass Morphism Effects */
.glass-morphism {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Premium Shadow Effects */
.shadow-luxury {
  box-shadow:
    0 0 40px rgba(0, 0, 0, 0.08),
    0 0 80px rgba(245, 158, 11, 0.05);
}

/* Image Gallery Enhancements */
.image-gallery-enter-active,
.image-gallery-leave-active {
  transition: all 0.5s ease;
}

.image-gallery-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.image-gallery-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #f59e0b, #f97316);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #f97316, #ea580c);
}

/* Responsive Typography */
@media (max-width: 768px) {
  .prose p {
    font-size: 1rem;
    line-height: 1.75;
  }

  .custom-list li {
    font-size: 1rem;
    padding-left: 1.75rem;
  }
}

/* Loading Animation */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Hover Effects */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

/* Feature Card Styling (for parsed features) */
.feature-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
  padding: 1.5rem;
  border-radius: 1rem;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.2);
}

/* Status Badge Animation */
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.animate-blink {
  animation: blink 2s infinite;
}
</style>
