<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
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
const scrollProgress = ref(0)

// Scroll progress tracking
const handleScroll = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = (scrollTop / docHeight) * 100
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})

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
      return t('projects.status.completed')
    case 'ongoing':
      return t('projects.status.ongoing')
    case 'planning':
      return t('projects.status.planning')
    default:
      return project.value.status
  }
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
              `<li class="mb-3 text-zinc-700 leading-relaxed">${line.replace(/^\*\s*/, '')}</li>`,
          )
          .join('')

        if (listItems) {
          return `<ul class="custom-list my-6">${listItems}</ul>`
        }
      }

      // Regular paragraph
      return `<p class="mb-6 text-zinc-700 leading-relaxed">${trimmed.replace(/\r\n/g, '<br>')}</p>`
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
      return t('projects.status.completed')
    case 'ongoing':
      return t('projects.status.ongoing')
    case 'planning':
      return t('projects.status.planning')
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
    <!-- Scroll Progress Bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50">
      <div
        class="h-full bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transition-all duration-150 ease-out"
        :style="{ width: scrollProgress + '%' }"
      ></div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="min-h-screen bg-black flex items-center justify-center">
      <div class="text-center">
        <div
          class="inline-block animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-[#FFCD4B] mb-6"
        ></div>
        <p class="text-lg text-[#FFCD4B] font-light uppercase tracking-wider">
          {{ t('projects.loading') }}
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="min-h-screen bg-black flex items-center justify-center">
      <div class="text-center max-w-md mx-auto px-8">
        <div class="text-5xl mb-6">⚠️</div>
        <h2 class="text-xl font-light text-white mb-3">{{ t('projects.error_title') }}</h2>
        <p class="text-base text-zinc-400 mb-8 font-light">{{ error }}</p>
        <button
          @click="() => loadProjectData(parseInt(route.params.id as string))"
          class="px-8 py-3 bg-black text-[#FFCD4B] font-light text-sm uppercase tracking-wider transition-all duration-300 hover:bg-zinc-900"
        >
          {{ t('buttons.retry') }}
        </button>
      </div>
    </div>

    <!-- Project Content -->
    <div v-else-if="project" class="project-content">
      <!-- Hero Section with Parallax Background -->
      <section class="relative h-[65vh] min-h-[500px] overflow-hidden bg-black">
        <!-- Background Image with Overlay -->
        <div class="absolute inset-0">
          <img
            v-if="project.render_image || project.main_image"
            :src="(project.render_image || project.main_image)!"
            :alt="project.title"
            class="w-full h-full object-cover opacity-40"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black"></div>
        </div>

        <!-- Subtle geometric pattern with parallax effect -->
        <div class="absolute inset-0 opacity-5">
          <div
            class="absolute top-0 right-0 w-96 h-96 bg-[#FFCD4B] rounded-full blur-3xl animate-float"
          ></div>
          <div
            class="absolute bottom-0 left-0 w-96 h-96 bg-[#FFCD4B] rounded-full blur-3xl animate-float-delayed"
          ></div>
        </div>

        <!-- Decorative lines -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            class="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFCD4B]/20 to-transparent"
          ></div>
          <div
            class="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#FFCD4B]/20 to-transparent"
          ></div>
        </div>

        <!-- Content -->
        <div class="relative z-10 h-full flex flex-col">
          <!-- Navigation -->
          <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 w-full pt-8">
            <button
              @click="goBack"
              class="text-white/90 hover:text-[#FFCD4B] flex items-center gap-2 group transition-all duration-300 bg-white/5 backdrop-blur-sm px-5 py-2.5 border border-white/10 hover:border-[#FFCD4B]/30 transform hover:scale-105"
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
              <span class="font-light uppercase tracking-wider text-sm">{{
                t('buttons.back')
              }}</span>
            </button>
          </div>

          <!-- Hero Content -->
          <div class="flex-grow flex items-center">
            <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 w-full">
              <div class="max-w-4xl fade-in-up">
                <!-- Status Badge -->
                <div class="mb-6">
                  <span
                    class="px-3 py-1 text-xs font-light uppercase tracking-wider backdrop-blur-sm"
                    :class="getStatusColor(project.status)"
                  >
                    {{ statusText }}
                  </span>
                </div>

                <!-- Title -->
                <h1
                  class="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-8 tracking-wide leading-tight"
                >
                  {{ project.title }}
                </h1>

                <div class="w-20 h-0.5 bg-[#FFCD4B] mb-6 animate-expand"></div>

                <!-- Location and Year -->
                <div class="flex flex-wrap items-center gap-8 text-white/80">
                  <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-[#FFCD4B]" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-base font-light">{{ project.location }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <svg class="w-5 h-5 text-[#FFCD4B]" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fill-rule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <span class="text-base font-light">{{ project.year }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Content Section -->
      <section class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <!-- Left Column - Gallery and Info -->
            <div class="lg:col-span-5 space-y-8">
              <!-- Image Gallery -->
              <div
                class="bg-white overflow-hidden hover:shadow-2xl transition-all duration-500 border border-zinc-100 hover:border-[#FFCD4B]/30 fade-in-up"
              >
                <!-- Main Image -->
                <div
                  class="aspect-[4/3] bg-zinc-100 relative overflow-hidden group cursor-pointer"
                  @click="openFullscreenGallery"
                >
                  <img
                    v-if="project.gallery_images && project.gallery_images[selectedImageIndex]"
                    :src="project.gallery_images[selectedImageIndex]"
                    :alt="project.title"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <img
                    v-else-if="project.main_image"
                    :src="project.main_image"
                    :alt="project.title"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />

                  <!-- Gradient overlay on hover -->
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  ></div>

                  <!-- Golden accent line on hover -->
                  <div
                    class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                  ></div>

                  <!-- Image Counter -->
                  <div
                    v-if="project.gallery_images && project.gallery_images.length > 1"
                    class="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-light"
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
                <div
                  v-if="project.gallery_images && project.gallery_images.length > 1"
                  class="p-4 bg-zinc-50"
                >
                  <div class="grid grid-cols-6 gap-2">
                    <button
                      v-for="(image, index) in project.gallery_images"
                      :key="index"
                      @click="selectImage(index)"
                      class="aspect-square overflow-hidden transition-all duration-300 focus:outline-none hover:shadow-lg"
                      :class="
                        selectedImageIndex === index
                          ? 'ring-2 ring-[#FFCD4B] ring-offset-2 scale-95'
                          : 'hover:ring-2 hover:ring-[#FFCD4B]/50 hover:ring-offset-1 opacity-70 hover:opacity-100'
                      "
                      :style="{ animationDelay: `${index * 50}ms` }"
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
              <div
                class="bg-white p-8 hover:shadow-2xl transition-all duration-500 border border-zinc-100 hover:border-[#FFCD4B]/30 fade-in-up relative overflow-hidden"
                style="animation-delay: 100ms"
              >
                <!-- Subtle background accent -->
                <div
                  class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>

                <h3 class="text-2xl font-light text-zinc-900 mb-6">
                  {{ t('projects.details.title') }}
                </h3>

                <div class="space-y-5">
                  <!-- Status -->
                  <div class="flex items-center justify-between p-4 bg-zinc-50 transition-colors">
                    <span class="font-light text-zinc-700">{{ t('projects.details.status') }}</span>
                    <span
                      class="px-4 py-1.5 text-white text-sm font-light"
                      :class="getStatusColor(project.status)"
                    >
                      {{ statusText }}
                    </span>
                  </div>

                  <!-- Location -->
                  <div
                    class="flex items-start justify-between p-4 hover:bg-zinc-50 transition-colors"
                  >
                    <span class="font-light text-zinc-700">{{
                      t('projects.details.location')
                    }}</span>
                    <span class="text-zinc-900 font-light text-right max-w-[200px]">{{
                      project.location
                    }}</span>
                  </div>

                  <!-- Start Date -->
                  <div
                    v-if="project.start_date"
                    class="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors"
                  >
                    <span class="font-light text-zinc-700">{{
                      t('projects.details.start_date')
                    }}</span>
                    <span class="text-zinc-900 font-light">{{
                      formatDate(project.start_date)
                    }}</span>
                  </div>

                  <!-- Completion Date -->
                  <div
                    v-if="project.completion_date"
                    class="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors"
                  >
                    <span class="font-light text-zinc-700">{{
                      t('projects.details.completion_date')
                    }}</span>
                    <span class="text-zinc-900 font-light">{{
                      formatDate(project.completion_date)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column - Description -->
            <div class="lg:col-span-7">
              <div
                class="bg-white p-10 hover:shadow-2xl transition-all duration-500 border border-zinc-100 hover:border-[#FFCD4B]/30 fade-in-up relative overflow-hidden"
                style="animation-delay: 200ms"
              >
                <!-- Subtle background glow on hover -->
                <div
                  class="absolute top-0 right-0 w-64 h-64 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 hover:opacity-100 transition-opacity duration-500"
                ></div>

                <div class="mb-8 relative z-10">
                  <h2 class="text-4xl font-light text-zinc-900 mb-4">
                    {{ t('projects.about.title') }}
                  </h2>
                  <div class="w-20 h-0.5 bg-[#FFCD4B] animate-expand"></div>
                </div>

                <!-- Enhanced Description with Better Typography -->
                <div class="prose prose-lg max-w-none relative z-10">
                  <div
                    class="space-y-6 text-zinc-700 leading-relaxed"
                    v-html="formatDescription(project.description)"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Grid -->
      <section v-if="projectFeatures.length > 0" class="py-20 bg-zinc-50">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
          <div class="text-center mb-12 fade-in">
            <h2 class="text-4xl font-light text-zinc-900 mb-4">
              {{ t('projects.advantages.title') }}
            </h2>
            <div class="w-20 h-0.5 bg-[#FFCD4B] mx-auto animate-expand"></div>
          </div>

          <!-- Dynamic Feature Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="(feature, index) in projectFeatures"
              :key="feature.id"
              class="group bg-white overflow-hidden hover:shadow-2xl transition-all duration-500 border border-zinc-100 hover:border-[#FFCD4B]/30 p-6 fade-in-up relative"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <!-- Subtle background accent on hover -->
              <div
                class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              ></div>

              <!-- Feature Icon -->
              <div
                class="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10"
              >
                <span class="text-2xl">{{ feature.icon }}</span>
              </div>

              <!-- Feature Content -->
              <div class="relative z-10">
                <h3
                  class="text-xl font-light text-zinc-900 mb-2 group-hover:text-[#C89116] transition-colors"
                >
                  {{ feature.title }}
                </h3>
                <p class="text-zinc-600 leading-relaxed font-light">
                  {{ feature.description }}
                </p>
              </div>

              <!-- Golden accent line on hover -->
              <div
                class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
              ></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Coming Soon Section -->
      <section class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
          <div
            class="bg-zinc-50 overflow-hidden hover:shadow-2xl transition-all duration-500 border border-zinc-100 hover:border-[#FFCD4B]/30 fade-in-up"
          >
            <div class="grid grid-cols-1 lg:grid-cols-2">
              <!-- Left side - Content -->
              <div class="p-12 lg:p-16 flex flex-col justify-center">
                <div
                  class="inline-flex items-center gap-2 bg-[#FFCD4B]/20 text-zinc-900 px-4 py-2 rounded-full text-sm font-light mb-6 w-fit"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
                    />
                  </svg>
                  {{
                    localeStore.currentLocale === 'ka'
                      ? 'მალე გამოჩნდება'
                      : localeStore.currentLocale === 'en'
                        ? 'Coming Soon'
                        : 'Скоро'
                  }}
                </div>

                <h2 class="text-4xl md:text-5xl font-light text-zinc-900 mb-6 leading-tight">
                  {{
                    localeStore.currentLocale === 'ka'
                      ? 'ბინის არჩევა'
                      : localeStore.currentLocale === 'en'
                        ? 'Apartment Selection'
                        : 'Выбор квартиры'
                  }}
                </h2>

                <p class="text-lg text-zinc-600 mb-8 leading-relaxed font-light">
                  {{
                    localeStore.currentLocale === 'ka'
                      ? 'მალე შეძლებთ ინტერაქტიულად აირჩიოთ თქვენთვის სასურველი ბინა პროექტში.'
                      : localeStore.currentLocale === 'en'
                        ? 'Soon you will be able to interactively select your desired apartment in the project.'
                        : 'Скоро вы сможете интерактивно выбрать желаемую квартиру в проекте.'
                  }}
                </p>

                <div class="space-y-4">
                  <div class="flex items-start gap-3">
                    <div
                      class="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-[#FFCD4B] to-[#C89116] rounded-full flex items-center justify-center mt-1"
                    >
                      <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <p class="text-zinc-700 flex-1 font-light">
                      {{
                        localeStore.currentLocale === 'ka'
                          ? 'ინტერაქტიული სართულების გეგმა'
                          : localeStore.currentLocale === 'en'
                            ? 'Interactive floor plans'
                            : 'Интерактивные поэтажные планы'
                      }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Right side - Visual placeholder -->
              <div
                class="relative bg-gradient-to-br from-[#FFCD4B] via-[#EBB738] to-[#C89116] p-12 lg:p-16 flex items-center justify-center overflow-hidden"
              >
                <!-- Background pattern -->
                <div class="absolute inset-0 opacity-10">
                  <svg
                    class="w-full h-full"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" stroke-width="0.5" />
                    </pattern>
                    <rect width="100" height="100" fill="url(#grid)" />
                  </svg>
                </div>

                <!-- Floating elements -->
                <div
                  class="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float"
                ></div>
                <div
                  class="absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float-delayed"
                ></div>

                <!-- Building icon illustration -->
                <div class="relative z-10">
                  <svg
                    class="w-64 h-64 text-white opacity-80"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 bg-zinc-50">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
          <div class="text-center fade-in-up">
            <h2 class="text-3xl md:text-4xl font-light text-zinc-800 mb-4">
              {{ t('projects.cta.title') }}
            </h2>
            <p class="text-lg text-zinc-600 mb-8 max-w-2xl mx-auto font-light">
              {{ t('projects.cta.description') }}
            </p>
            <router-link
              to="/contact"
              class="inline-flex items-center gap-3 px-10 py-4 bg-black text-[#FFCD4B] text-sm uppercase tracking-wider font-light transition-all duration-300 hover:bg-zinc-900 group transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              <span>{{ t('projects.cta.contact_button') }}</span>
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
      </section>

      <!-- Related Projects -->
      <section v-if="relatedProjects.length > 0" class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
          <div class="text-center mb-12 fade-in">
            <h2 class="text-4xl font-light text-zinc-900 mb-4">
              {{ t('projects.related.title') }}
            </h2>
            <div class="w-20 h-0.5 bg-[#FFCD4B] mx-auto animate-expand"></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              v-for="(relatedProject, index) in relatedProjects"
              :key="relatedProject.id"
              @click="navigateToProject(relatedProject.id)"
              class="group bg-white overflow-hidden hover:shadow-2xl transition-all duration-500 border border-zinc-100 hover:border-[#FFCD4B]/30 cursor-pointer fade-in-up"
              :style="{ animationDelay: `${index * 100}ms` }"
            >
              <div class="relative h-64 bg-zinc-100 overflow-hidden">
                <img
                  v-if="relatedProject.main_image"
                  :src="relatedProject.main_image"
                  :alt="relatedProject.title"
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                />

                <!-- Gradient overlay on hover -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>

                <!-- Golden accent line on hover -->
                <div
                  class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                ></div>
              </div>

              <div class="p-6 bg-white relative overflow-hidden">
                <!-- Subtle background accent -->
                <div
                  class="absolute top-0 right-0 w-32 h-32 bg-[#FFCD4B]/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                ></div>

                <h3
                  class="text-xl font-light text-zinc-900 mb-2 group-hover:text-[#C89116] transition-colors relative z-10"
                >
                  {{ relatedProject.title }}
                </h3>
                <span class="text-sm text-zinc-500 font-light relative z-10">
                  {{ getRelatedProjectStatus(relatedProject) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Fullscreen Gallery Modal -->
    <Teleport to="body">
      <div
        v-if="isFullscreenGallery"
        class="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center"
        @click="closeFullscreenGallery"
      >
        <!-- Close Button -->
        <button
          @click="closeFullscreenGallery"
          class="absolute top-6 right-6 z-10 text-white hover:text-[#FFCD4B] transition-colors"
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
          class="absolute left-6 top-1/2 -translate-y-1/2 z-10 text-white hover:text-[#FFCD4B] transition-colors"
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
          class="absolute right-6 top-1/2 -translate-y-1/2 z-10 text-white hover:text-[#FFCD4B] transition-colors"
        >
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
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
          class="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-lg font-light"
        >
          {{ selectedImageIndex + 1 }} / {{ project.gallery_images.length }}
        </div>
      </div>
    </Teleport>
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

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Fade in animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes expand {
  from {
    width: 0;
  }
  to {
    width: 5rem;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(20px, -20px);
  }
}

@keyframes floatDelayed {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-20px, 20px);
  }
}

.fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
  opacity: 0;
}

.fade-in {
  animation: fadeIn 0.6s ease-out forwards;
  opacity: 0;
}

.animate-expand {
  animation: expand 1s ease-out forwards;
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

.animate-float-delayed {
  animation: floatDelayed 10s ease-in-out infinite;
}

/* Enhanced Typography */
h1,
h2,
h3,
h4,
h5,
h6 {
  font-feature-settings: 'kern' 1;
  text-rendering: optimizeLegibility;
}

/* Custom List Styling with Golden Check */
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
  color: #3f3f46;
  font-size: 1.0625rem;
}

.custom-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  top: 0.125rem;
  width: 1.5rem;
  height: 1.5rem;
  background: linear-gradient(135deg, #ffcd4b, #ebb738, #c89116);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.75rem;
}

/* Custom golden scrollbar */
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

/* Golden text selection */
::selection {
  background: #ffcd4b;
  color: #000;
}

::-moz-selection {
  background: #ffcd4b;
  color: #000;
}

/* Smooth transitions for all interactive elements */
* {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
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

/* Backdrop blur luxury */
.backdrop-blur-luxury {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

/* Line clamp utilities */
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
</style>
