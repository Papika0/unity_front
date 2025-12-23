<template>
  <section :class="autoNavigate ? 'py-20 bg-white' : 'bg-white'">
    <!-- Header with Back Button (Visible when not auto-navigating) -->
    <div v-if="!autoNavigate" class="max-w-7xl mx-auto px-4 lg:px-16 xl:px-20 2xl:px-32 mb-6 pt-4">
      <button 
        @click="emit('back')"
        class="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 hover:border-[#FFCD4B] hover:text-[#FFCD4B] transition-all"
        :title="t('apartments.back')"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

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
    <div v-else-if="floorZones.length > 0" class="w-full max-w-[1400px] mx-auto px-4">
      <!-- Interactive Map -->
      <div
        ref="mapElement"
        :class="[
          'bg-white overflow-hidden transition-all duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] border border-zinc-100',
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useApartmentNavigationStore } from '@/stores/public/apartmentNavigation'
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'
import InteractiveMapViewer from './InteractiveMapViewer.vue'
import type { FloorZone, BuildingZone, ApartmentZone } from '@/types/apartments'

interface Props {
  projectId: number
  buildingId: number
  buildingIdentifier: string
  autoNavigate?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoNavigate: true
})

const emit = defineEmits<{
  'floor-selected': [floor: FloorZone]
  'back': []
}>()

const router = useRouter()
const route = useRoute()
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

const hoveredFloor = computed(() => {
  if (!hoveredFloorId.value) return null
  return floorZones.value.find(z => z.id === hoveredFloorId.value) || null
})

async function loadData() {
  try {
    // Load floors for this building
    // Level is 'building' and we pass the buildingId as a parameter
    await apartmentStore.loadNavigation(props.projectId, 'building', props.buildingId)
    
    // Check for deep link
    if (!props.autoNavigate && route.query.floor) {
      const floorNumber = parseInt(route.query.floor as string)
      if (!isNaN(floorNumber)) {
        // Find the floor zone
        const zones = apartmentStore.currentZones as FloorZone[]
        const floor = zones.find(z => z.floor_number === floorNumber && z.type === 'floor_strip')
        
        if (floor) {
          emit('floor-selected', floor)
        }
      }
    }
  } catch (error) {
    console.error('Failed to load floor data:', error)
  }
}

function handleFloorClick(zone: FloorZone | ApartmentZone | BuildingZone) {
  // Only handle floor zones
  if ('floor_number' in zone && zone.type === 'floor_strip') {
    selectedFloorId.value = zone.id
    emit('floor-selected', zone as FloorZone)

    // Only navigate if autoNavigate is enabled
    if (props.autoNavigate) {
      router.push(`/projects/${props.projectId}/${props.buildingIdentifier}/floor-${zone.floor_number}`)
    }
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

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Styles handled by Tailwind */
</style>
