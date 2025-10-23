<template>
  <div class="apartment-grid">
    <!-- Floor Information Card -->
    <div class="mb-8 bg-zinc-50 border-2 border-zinc-900 p-8">
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div class="flex-1">
          <h2 class="text-4xl font-bold text-zinc-900 mb-3">
            {{ t('apartments.floor') }} {{ floorNumber }}
          </h2>
          <p class="text-xl text-zinc-900 font-medium">
            {{ t('apartments.total_apartments') }}: <span class="font-bold text-black">{{ apartments.length }}</span>
          </p>
        </div>

        <!-- Filter Controls -->
        <div class="filters">
          <button
            @click="showAvailableOnly = !showAvailableOnly"
            :class="[
              'px-6 py-3 transition-all font-bold text-sm uppercase tracking-wider',
              showAvailableOnly
                ? 'bg-black text-[#FFCD4B] shadow-lg'
                : 'bg-white text-zinc-900 border-2 border-zinc-900 hover:bg-zinc-900 hover:text-white',
            ]"
          >
            {{ t('apartments.available_only') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="apartmentStore.isLoading" class="loading-skeleton">
      <div class="text-center py-20">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-2 border-transparent border-t-[#FFCD4B] mb-6"></div>
        <p class="text-lg text-[#FFCD4B] font-light uppercase tracking-wider">{{ t('common.loading') }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="apartmentStore.error" class="error-display">
      <div class="text-center max-w-md mx-auto py-20">
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

    <!-- Main Content - Full Width Map -->
    <div v-else-if="apartments.length > 0" class="bg-white border border-zinc-100 hover:border-[#FFCD4B]/30 transition-all duration-500 overflow-hidden">
      <InteractiveMapViewer
        :image="apartmentStore.currentImage"
        :zones="filteredApartments"
        :selected-zone-id="selectedApartmentId"
        @zone-click="handleApartmentClick"
        @zone-hover="handleApartmentHover"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="text-center max-w-md mx-auto py-20">
        <div class="text-5xl mb-6">🏢</div>
        <h2 class="text-xl font-light text-zinc-900 mb-3">{{ t('apartments.no_apartments') }}</h2>
        <p class="text-base text-zinc-600 font-light">{{ t('apartments.no_apartments_description') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '@/composables/useTranslations'
import { useApartmentNavigationStore } from '@/stores/public/apartmentNavigation'
import InteractiveMapViewer from './InteractiveMapViewer.vue'
import type { ApartmentZone, BuildingZone, FloorZone } from '@/types/apartments'

interface Props {
  projectId: number
  buildingId: number
  buildingIdentifier: string
  floorNumber: number
}

const props = defineProps<Props>()

const router = useRouter()
const { t } = useTranslations()
const apartmentStore = useApartmentNavigationStore()

const selectedApartmentId = ref<number | null>(null)
const selectedApartment = ref<ApartmentZone | null>(null)
const hoveredApartmentId = ref<number | null>(null)
const showAvailableOnly = ref(false)

const apartments = computed(() => {
  return (apartmentStore.currentZones as ApartmentZone[]) || []
})

const filteredApartments = computed(() => {
  if (showAvailableOnly.value) {
    return apartments.value.filter((apt) => apt.status === 'available')
  }
  return apartments.value
})

async function loadData() {
  try {
    await apartmentStore.loadNavigation(
      props.projectId,
      'floor',
      props.buildingId,
      props.floorNumber,
    )
  } catch (error) {
    console.error('Failed to load apartment data:', error)
  }
}

function handleApartmentClick(zone: ApartmentZone | BuildingZone | FloorZone) {
  // Only handle apartment zones (which have apartment_number property)
  if ('apartment_number' in zone) {
    const apartment = zone as ApartmentZone
    selectedApartmentId.value = apartment.id
    selectedApartment.value = apartment
    
    // Navigate to apartment detail page
    router.push({
      name: 'apartment-detail',
      params: {
        id: props.projectId,
        buildingIdentifier: props.buildingIdentifier,
        floorNumber: props.floorNumber,
        apartmentId: apartment.id,
      },
    })
  }
}

function handleApartmentHover(zone: ApartmentZone | BuildingZone | FloorZone | null) {
  // Only handle apartment zones (which have apartment_number property)
  if (zone && 'apartment_number' in zone) {
    hoveredApartmentId.value = zone.id
  } else {
    hoveredApartmentId.value = null
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
.apartment-grid {
  width: 100%;
}

@media (max-width: 1024px) {
  .legend {
    flex-wrap: wrap;
  }
}
</style>
