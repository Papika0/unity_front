<template>
  <div class="floor-selection-view bg-white min-h-screen">
    <!-- Compact Header with Back Button -->
    <div class="bg-white border-b border-zinc-100">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32 py-6">
        <div class="flex items-center justify-between">
          <button
            @click="goBack"
            class="text-zinc-600 hover:text-[#FFCD4B] flex items-center gap-2 group transition-all duration-300"
          >
            <svg class="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="font-light uppercase tracking-wider text-sm">{{ t('buttons.back') }}</span>
          </button>

          <div class="text-right">
            <h1 class="text-2xl font-light text-zinc-900">
              {{ apartmentStore.buildingName || buildingIdentifier }}
            </h1>
            <p class="text-sm text-zinc-500 font-light">{{ t('apartments.select_floor_description') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <section v-if="loadingError" class="py-20">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <div class="text-center max-w-md mx-auto">
          <div class="text-5xl mb-6">⚠️</div>
          <h2 class="text-xl font-light text-zinc-900 mb-3">{{ t('apartments.error_loading') }}</h2>
          <p class="text-base text-zinc-600 mb-8 font-light">{{ loadingError }}</p>
          <button
            @click="goBack"
            class="px-8 py-3 bg-black text-[#FFCD4B] font-light text-sm uppercase tracking-wider transition-all duration-300 hover:bg-zinc-900"
          >
            {{ t('buttons.back') }}
          </button>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <section v-else-if="isLoadingBuilding" class="py-20">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-[#FFCD4B] mb-6"></div>
          <p class="text-lg text-[#FFCD4B] font-light uppercase tracking-wider">{{ t('common.loading') }}</p>
        </div>
      </div>
    </section>

    <!-- Floor Selector -->
    <FloorSelector
      v-else-if="buildingId"
      :project-id="projectId"
      :building-id="buildingId"
      :building-identifier="buildingIdentifier"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useApartmentNavigationStore } from '@/stores/public/apartmentNavigation'
import { buildingsApi } from '@/services/buildingsApi'
import FloorSelector from '@/components/apartments/FloorSelector.vue'

interface Props {
  projectId: number
  buildingIdentifier: string
}

const props = defineProps<Props>()

const { t } = useTranslations()
const apartmentStore = useApartmentNavigationStore()
const router = useRouter()

const buildingId = ref<number | null>(null)
const isLoadingBuilding = ref(false)
const loadingError = ref<string | null>(null)

function goBack() {
  router.push(`/projects/${props.projectId}`)
}

// Update page title when building name is loaded
watch(
  () => apartmentStore.buildingName,
  (buildingName) => {
    if (buildingName) {
      const project = apartmentStore.projectTitle || ''
      document.title = `${buildingName} - ${project} | Unity`
    }
  },
  { immediate: true }
)

// Load building data to get building ID
onMounted(async () => {
  isLoadingBuilding.value = true
  loadingError.value = null
  
  try {
    
    // Fetch building by identifier to get the building ID
    const building = await buildingsApi.fetchBuilding(props.projectId, props.buildingIdentifier)
    
    
    if (building) {
      buildingId.value = building.id
    } else {
      loadingError.value = 'Building not found'
    }
  } catch (error) {
    console.error('❌ FloorSelectionView - Failed to load building:', error)
    loadingError.value = 'Failed to load building data'
  } finally {
    isLoadingBuilding.value = false
  }
})
</script>

<style scoped>
/* Styles handled by Tailwind */
</style>
