<template>
  <div class="apartment-selection-view bg-white min-h-screen">
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
            <p class="text-sm text-zinc-500 font-light">{{ t('apartments.floor') }} {{ floorNumber }}</p>
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
    <section v-else-if="!buildingId" class="py-20">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-[#FFCD4B] mb-6"></div>
          <p class="text-lg text-[#FFCD4B] font-light uppercase tracking-wider">{{ t('common.loading') }}</p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section v-else class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
        <ApartmentGrid
          :project-id="projectId"
          :building-id="buildingId"
          :building-identifier="buildingIdentifier"
          :floor-number="floorNumber"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useApartmentNavigationStore } from '@/stores/public/apartmentNavigation'
import ApartmentGrid from '@/components/apartments/ApartmentGrid.vue'
import type { BuildingZone } from '@/types/apartments'

interface Props {
  projectId: number
  buildingIdentifier: string
  floorNumber: number
}

const props = defineProps<Props>()

const { t } = useTranslations()
const apartmentStore = useApartmentNavigationStore()
const router = useRouter()

const buildingId = ref<number | null>(null)
const loadingError = ref<string | null>(null)

function goBack() {
  router.push(`/projects/${props.projectId}/${props.buildingIdentifier}`)
}

// Update page title when building name is loaded
watch(
  () => apartmentStore.buildingName,
  (buildingName) => {
    if (buildingName) {
      const project = apartmentStore.projectTitle || ''
      document.title = `${buildingName} - Floor ${props.floorNumber} - ${project} | Unity`
    }
  },
  { immediate: true }
)

// Load building data to get building ID
onMounted(async () => {
  try {
    // Load overview to get building data
    await apartmentStore.loadNavigation(props.projectId, 'overview')

    // Find the building by identifier
    const zones = apartmentStore.currentZones as BuildingZone[]
    const buildingZone = zones.find(
      (zone) => zone.building_identifier === props.buildingIdentifier,
    )

    if (buildingZone) {
      buildingId.value = buildingZone.entity_id
    } else {
      loadingError.value = 'Building not found'
    }
  } catch (error) {
    console.error('Failed to load building data:', error)
    loadingError.value = 'Failed to load building data'
  }
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
