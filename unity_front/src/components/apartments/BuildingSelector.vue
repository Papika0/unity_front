<template>
  <div class="building-selector">
    <!-- Loading State -->
    <div v-if="apartmentStore.isLoading" class="loading-skeleton">
      <div class="animate-pulse">
        <div class="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
        <div class="space-y-3">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="apartmentStore.error" class="error-display p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
      <p class="text-red-600 dark:text-red-400">{{ apartmentStore.error }}</p>
      <button
        @click="loadData"
        class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Retry
      </button>
    </div>

    <!-- Main Content -->
    <div v-else-if="buildingZones.length > 0">
      <!-- Full Width Interactive Map -->
      <InteractiveMapViewer
        :image="apartmentStore.currentImage"
        :zones="buildingZones"
        :selected-zone-id="selectedBuildingId"
        :hovered-zone="hoveredZone"
        @zone-click="handleBuildingClick"
        @zone-hover="handleBuildingHover"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state text-center py-12">
      <p class="text-gray-600 dark:text-gray-400">{{ t('apartments.no_buildings') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useApartmentNavigationStore } from '@/stores/public/apartmentNavigation'
import InteractiveMapViewer from './InteractiveMapViewer.vue'
import type { BuildingZone, ApartmentZone, FloorZone } from '@/types/apartments'

interface Props {
  projectId: number
  autoNavigate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoNavigate: false,
})

const emit = defineEmits<{
  'building-selected': [building: BuildingZone]
}>()

const router = useRouter()
const { t } = useTranslations()
const apartmentStore = useApartmentNavigationStore()

const selectedBuildingId = ref<number | null>(null)
const hoveredZone = ref<BuildingZone | null>(null)

const buildingZones = computed(() => {
  const zones = apartmentStore.currentZones as BuildingZone[]
  return zones.filter((zone) => zone.type === 'building_block')
})

async function loadData() {
  try {
    await apartmentStore.loadNavigation(props.projectId, 'overview')

    console.log('🔍 Building Selector - Loaded Data:', {
      hasData: !!apartmentStore.navigationData,
      zones: apartmentStore.currentZones,
      image: apartmentStore.currentImage,
      buildingZonesCount: buildingZones.value.length
    })

    // Auto-navigate if only one building
    if (
      props.autoNavigate &&
      !apartmentStore.hasMultipleBuildings &&
      buildingZones.value.length === 1
    ) {
      const singleBuilding = buildingZones.value[0]
      handleBuildingClick(singleBuilding)
    }
  } catch (error) {
    console.error('Failed to load building data:', error)
  }
}

function handleBuildingClick(zone: BuildingZone | ApartmentZone | FloorZone) {
  // Only handle building zones
  if ('building_identifier' in zone && zone.type === 'building_block') {
    selectedBuildingId.value = zone.id
    emit('building-selected', zone as BuildingZone)

    // Only navigate if autoNavigate is enabled
    if (props.autoNavigate) {
      router.push(`/projects/${props.projectId}/${zone.building_identifier}`)
    }
  }
}

function handleBuildingHover(zone: BuildingZone | ApartmentZone | FloorZone | null) {
  // Only handle building zones
  if (zone && 'building_identifier' in zone && zone.type === 'building_block') {
    hoveredZone.value = zone as BuildingZone
  } else {
    hoveredZone.value = null
  }
}

onMounted(() => {
  loadData()
})

// Cleanup on unmount
onUnmounted(() => {
  // Don't reset store here as it might be needed by InlineApartmentViewer
  // apartmentStore.reset()
})
</script>

<style scoped>
.building-selector {
  width: 100%;
}

.building-card {
  transition: all 0.2s ease;
}

.building-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
