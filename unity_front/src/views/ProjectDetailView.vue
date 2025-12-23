<script setup lang="ts">
import { watch, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useProjectDetail } from '@/composables/pages/useProjectDetail'

// Components
import ProjectHero from '@/components/project-detail/ProjectHero.vue'
import ProjectApartmentNav from '@/components/project-detail/ProjectApartmentNav.vue'
import ProjectGallery from '@/components/project-detail/ProjectGallery.vue'
import ProjectDetailsCard from '@/components/project-detail/ProjectDetailsCard.vue'
import ProjectDescription from '@/components/project-detail/ProjectDescription.vue'
import ProjectFeatures from '@/components/project-detail/ProjectFeatures.vue'
import ProjectCTA from '@/components/project-detail/ProjectCTA.vue'
import ProjectRelated from '@/components/project-detail/ProjectRelated.vue'
import ProjectGalleryModal from '@/components/project-detail/ProjectGalleryModal.vue'

const route = useRoute()
const router = useRouter()
const { t } = useTranslations()

const {
  project,
  isLoading,
  error,
  selectedImageIndex,
  isFullscreenGallery,
  projectFeatures,
  selectedBuilding,
  relatedProjects,
  hasApartmentNavigation,
  statusText,
  localeStore,
  
  loadProjectData,
  getStatusColor,
  selectImage,
  openFullscreenGallery,
  closeFullscreenGallery,
  nextImage,
  prevImage,
  handleBuildingSelected,
  handleBuildingDeselected,
  handleFloorSelected,
  handleFloorDeselected
} = useProjectDetail()

// Scroll progress
const scrollProgress = ref(0)
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

// Watchers
watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
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

watch(
  () => localeStore.currentLocale,
  async () => {
    const projectId = parseInt(route.params.id as string)
    if (!isNaN(projectId)) {
      await loadProjectData(projectId)
    }
  },
)

// Deep linking logic (could be moved to composable, but fine here for now as it uses route/router heavily)
// Actually I moved the handlers to composable, but the initial deep link check?
// I didn't move handleDeepLinking to composable. I'll add a simple watch here or move it.
// Given it was complex, I should check if I missed it.
// `useProjectDetail` DOES NOT have handleDeepLinking.
// I'll re-implement it briefly here using the handlers I exposed.

// Deep linking is implemented below using handleDeepLinking
// Start of Deep Linking re-implementation
import type { BuildingZone } from '@/types/apartments'
import { useApartmentNavigationStore } from '@/stores/public/apartmentNavigation'
const apartmentStore = useApartmentNavigationStore()

const handleDeepLinking = async () => {
  const buildingIdentifier = route.query.building
  
  if (buildingIdentifier && typeof buildingIdentifier === 'string' && project.value) {
    if (!apartmentStore.navigationData) {
      await apartmentStore.loadNavigation(project.value.id, 'overview')
    }
    const zones = apartmentStore.currentZones
    // We expect BuildingZone[] at overview level which has building_identifier
    const building = (zones as BuildingZone[]).find(z => z.building_identifier === buildingIdentifier)
    if (building) {
      // Use the handler from composable which sets the state
      // But wait, the handler sets URL. Deep linking comes FROM URL.
      // So we just set the state directly.
      // Use a direct setter or just call the handler (it will replace URL with same URL, which is harmless).
      handleBuildingSelected(building)
    }
  }
}

watch(() => route.query.building, handleDeepLinking)
watch(() => project.value, (newProject) => {
  if (newProject) handleDeepLinking()
})

const goBack = () => router.back()
const navigateToProject = (id: number) => router.push(`/projects/${id}`)
</script>

<template>
  <div class="project-detail">
    <!-- Scroll Progress Bar -->
    <div class="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50">
      <div
        class="h-full bg-gradient-to-r from-[#FFCD4B] via-[#EBB738] to-[#C89116] transition-all duration-150 ease-out shadow-[0_0_15px_rgba(255,205,75,0.6)]"
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
      <ProjectHero 
        :project="project" 
        :status-text="statusText" 
        :status-color="getStatusColor(project.status)"
        @back="goBack"
      />

      <ProjectApartmentNav
        v-if="hasApartmentNavigation"
        :project-id="project.id"
        :selected-building="selectedBuilding"
        @building-selected="handleBuildingSelected"
        @building-deselected="handleBuildingDeselected"
        @floor-selected="handleFloorSelected"
        @floor-deselected="handleFloorDeselected"
      />

      <section class="py-20 bg-white">
        <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <!-- Left Column -->
            <div class="lg:col-span-5 space-y-8">
              <ProjectGallery
                :project="project"
                :selected-image-index="selectedImageIndex"
                @select-image="selectImage"
                @open-fullscreen="openFullscreenGallery"
              />
              <ProjectDetailsCard
                :project="project"
                :status-text="statusText"
                :status-color="getStatusColor(project.status)"
              />
            </div>

            <!-- Right Column -->
            <div class="lg:col-span-7">
              <ProjectDescription :description="project.description" />
            </div>
          </div>
        </div>
      </section>

      <ProjectFeatures :features="projectFeatures" />

      <ProjectCTA />

      <ProjectRelated :projects="relatedProjects" @navigate="navigateToProject" />
    </div>

    <!-- Fullscreen Gallery Modal -->
    <ProjectGalleryModal
      v-if="project"
      :show="isFullscreenGallery"
      :project="project"
      :selected-image-index="selectedImageIndex"
      @close="closeFullscreenGallery"
      @prev="prevImage"
      @next="nextImage"
    />
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

/* Custom golden scrollbar - Global for this view */
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
