<template>
  <section class="py-20 bg-white">
    <!-- Loading State -->
    <div v-if="apartmentStore.isLoading" class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-[#FFCD4B] mb-6"></div>
        <p class="text-lg text-[#FFCD4B] font-light uppercase tracking-wider">{{ t('common.loading') }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="apartmentStore.error" class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
      <div class="text-center max-w-md mx-auto">
        <div class="text-5xl mb-6">⚠️</div>
        <h2 class="text-xl font-light text-zinc-900 mb-3">{{ t('apartments.error_loading') }}</h2>
        <p class="text-base text-zinc-600 mb-8 font-light">{{ apartmentStore.error }}</p>
        <button
          @click="loadData"
          class="px-8 py-3 bg-black text-[#FFCD4B] font-light text-sm uppercase tracking-wider transition-all duration-300 hover:bg-zinc-900"
        >
          {{ t('buttons.retry') }}
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="floorZones.length > 0" class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
      <!-- Interactive Map -->
      <div
        ref="mapElement"
        :class="[
          'bg-white overflow-hidden hover:shadow-2xl transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] border border-zinc-100 hover:border-[#FFCD4B]/30',
          {
            'opacity-100 translate-y-0 scale-100 blur-0': mapVisible,
            'opacity-0 translate-y-12 scale-95 blur-sm': !mapVisible,
          }
        ]"
      >
        <InteractiveMapViewer
          :image="apartmentStore.currentImage"
          :zones="floorZones"
          :selected-zone-id="selectedFloorId"
          :hovered-zone="hoveredFloor"
          @zone-click="handleFloorClick"
          @zone-hover="handleFloorHover"
        />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="max-w-7xl mx-auto px-8 lg:px-16 xl:px-20 2xl:px-32">
      <div class="text-center max-w-md mx-auto">
        <div class="text-5xl mb-6">🏢</div>
        <h2 class="text-xl font-light text-zinc-900 mb-3">{{ t('apartments.no_floors') }}</h2>
        <p class="text-base text-zinc-600 font-light">{{ t('apartments.no_floors_description') }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '@/composables/useTranslations'
import { useApartmentNavigationStore } from '@/stores/public/apartmentNavigation'
import { useScrollAnimation } from '@/composables/useScrollAnimation'
import InteractiveMapViewer from './InteractiveMapViewer.vue'
import type { FloorZone, FloorStats, BuildingZone, ApartmentZone } from '@/types/apartments'

interface Props {
  projectId: number
  buildingId: number
  buildingIdentifier: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'floor-selected': [floor: FloorZone]
}>()

const router = useRouter()
const { t } = useTranslations()
const apartmentStore = useApartmentNavigationStore()

// Scroll animation
const { element: mapElement, isVisible: mapVisible } = useScrollAnimation({ once: true, threshold: 0.1 })

const selectedFloorId = ref<number | null>(null)
const hoveredFloorId = ref<number | null>(null)

const floorZones = computed(() => {
  const zones = apartmentStore.currentZones as FloorZone[]
  return zones.filter((zone) => zone.type === 'floor_strip')
})

const sortedFloorZones = computed(() => {
  return [...floorZones.value].sort((a, b) => b.floor_number - a.floor_number)
})

const hoveredFloor = computed(() => {
  if (!hoveredFloorId.value) return null
  return floorZones.value.find(z => z.id === hoveredFloorId.value) || null
})

async function loadData() {
  try {
    await apartmentStore.loadNavigation(props.projectId, 'building', props.buildingId)
  } catch (error) {
    console.error('Failed to load floor data:', error)
  }
}

function handleBack() {
  router.push(`/projects/${props.projectId}`)
}

function handleFloorClick(zone: FloorZone | ApartmentZone | BuildingZone) {
  // Only handle floor zones
  if ('floor_number' in zone && zone.type === 'floor_strip') {
    selectedFloorId.value = zone.id
    emit('floor-selected', zone as FloorZone)

    // Navigate to apartment grid
    router.push(`/projects/${props.projectId}/${props.buildingIdentifier}/floor-${zone.floor_number}`)
  }
}

function handleFloorHover(zone: FloorZone | ApartmentZone | BuildingZone | null) {
  // Only handle floor zones
  if (zone && 'floor_number' in zone && zone.type === 'floor_strip') {
    hoveredFloorId.value = zone.id
  } else {
    hoveredFloorId.value = null
  }
}

function getFloorCardClass(zone: FloorZone): string {
  const isHovered = hoveredFloorId.value === zone.id
  const isSelected = selectedFloorId.value === zone.id

  if (isSelected) {
    return 'border-[#FFCD4B] bg-[#FFCD4B]/10 shadow-lg shadow-[#FFCD4B]/20'
  }

  if (isHovered) {
    return 'border-[#FFCD4B]/50 bg-white/5'
  }

  return 'border-white/10 hover:border-[#FFCD4B]/30'
}

function getStatusIndicatorClass(stats: FloorStats): string {
  if (stats.available === 0) {
    return 'bg-zinc-500' // All sold/reserved
  } else if (stats.available === stats.total) {
    return 'bg-[#4ade80]' // All available
  } else {
    return 'bg-[#FFCD4B]' // Some available
  }
}

onMounted(() => {
  loadData()
})

onUnmounted(() => {
  apartmentStore.reset()
})
</script>

<style scoped>
/* Styles handled by Tailwind */
</style>
