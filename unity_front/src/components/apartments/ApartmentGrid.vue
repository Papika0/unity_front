<template>
  <div class="apartment-grid">
    <!-- Floor Information Card -->
    <!-- Floor Information Card -->
    <div class="mb-6 lg:mb-8 bg-white border border-zinc-100 p-4 lg:p-8 shadow-sm">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="flex flex-wrap items-center gap-4 lg:gap-6">
          <button 
            @click="emit('back')"
            class="w-10 h-10 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:bg-zinc-50 hover:border-[#FFCD4B] hover:text-[#FFCD4B] transition-all flex-shrink-0"
            :title="getLabel('back')"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="h-12 w-12 lg:h-16 lg:w-16 bg-[#FFCD4B]/10 flex items-center justify-center rounded-full flex-shrink-0">
            <span class="text-xl lg:text-2xl font-light text-[#FFCD4B]">{{ floorNumber }}</span>
          </div>
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h2 class="text-xl lg:text-2xl font-light text-zinc-900">
                {{ getLabel('floor') }} {{ floorNumber }}
              </h2>
              <div class="flex flex-col gap-0.5 ml-2">
                <button 
                  @click="emit('change-floor', floorNumber + 1)"
                  :disabled="apartmentStore.maxFloor !== null && floorNumber >= apartmentStore.maxFloor"
                  class="w-6 h-6 rounded-full bg-zinc-50 flex items-center justify-center transition-colors group disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-zinc-50 disabled:hover:text-zinc-400"
                  :class="{ 'hover:bg-[#FFCD4B] hover:text-white': apartmentStore.maxFloor === null || floorNumber < apartmentStore.maxFloor }"
                  :title="getLabel('next_floor') || 'Next Floor'"
                >
                  <svg class="w-3 h-3 text-zinc-400 group-hover:text-white disabled:group-hover:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" /></svg>
                </button>
                <button 
                  @click="emit('change-floor', floorNumber - 1)"
                  :disabled="floorNumber <= (apartmentStore.minFloor ?? 1)"
                  class="w-6 h-6 rounded-full bg-zinc-50 flex items-center justify-center transition-colors group disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-zinc-50 disabled:hover:text-zinc-400"
                  :class="{ 'hover:bg-[#FFCD4B] hover:text-white': floorNumber > (apartmentStore.minFloor ?? 1) }"
                  :title="getLabel('prev_floor') || 'Previous Floor'"
                >
                  <svg class="w-3 h-3 text-zinc-400 group-hover:text-white disabled:group-hover:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            </div>
            <div class="flex items-center gap-2 text-sm text-zinc-500 font-light">
              <span>{{ getLabel('total_apartments') }}:</span>
              <span class="text-zinc-900 font-medium">{{ apartments.length }}</span>
            </div>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="filters">
          <button
            @click="showAvailableOnly = !showAvailableOnly"
            :class="[
              'px-6 py-2.5 transition-all text-sm tracking-wide rounded-full border',
              showAvailableOnly
                ? 'bg-[#FFCD4B] border-[#FFCD4B] text-black font-medium'
                : 'bg-white border-zinc-200 text-zinc-600 hover:border-[#FFCD4B] hover:text-[#FFCD4B]',
            ]"
          >
            <div class="flex items-center gap-2">
              <div 
                class="w-2 h-2 rounded-full transition-colors"
                :class="showAvailableOnly ? 'bg-black' : 'bg-[#10b981]'"
              ></div>
              {{ getLabel('available_only') }}
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="apartmentStore.isLoading" class="loading-skeleton">
      <div class="text-center py-24">
        <div class="inline-block animate-spin rounded-full h-10 w-10 border-2 border-zinc-100 border-t-[#FFCD4B] mb-6"></div>
        <p class="text-sm text-zinc-400 font-light tracking-widest uppercase">{{ getLabel('loading') }}</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="apartmentStore.error" class="error-display">
      <div class="text-center max-w-md mx-auto py-20">
        <div class="w-16 h-16 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
          !
        </div>
        <h2 class="text-xl font-light text-zinc-900 mb-3">{{ getLabel('error') }}</h2>
        <p class="text-sm text-zinc-500 mb-8 font-light leading-relaxed">{{ apartmentStore.error }}</p>
        <button
          @click="loadData"
          class="px-8 py-3 bg-zinc-900 text-white hover:bg-[#FFCD4B] hover:text-black transition-colors rounded-full text-sm font-medium tracking-wide"
        >
          {{ getLabel('retry') }}
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
        <h2 class="text-xl font-light text-zinc-900 mb-3">{{ getLabel('no_apartments') }}</h2>
        <p class="text-base text-zinc-600 font-light">{{ getLabel('no_apartments_desc') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '@/composables/useTranslations'
import { useTranslationsStore } from '@/stores/ui/translations'
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

const emit = defineEmits<{
  'change-floor': [floorNumber: number]
  'select-apartment': [apartmentId: number]
  'back': []
}>()

const router = useRouter()
const { t } = useTranslations()
const translationsStore = useTranslationsStore()
const apartmentStore = useApartmentNavigationStore()

const showAvailableOnly = ref(false)
const selectedApartmentId = ref<number | null>(null)

/**
 * Robust label translation helper
 */
function getLabel(key: string): string {
  switch (key) {
    case 'floor': return t('apartments.floor')
    case 'total_apartments': return t('apartments.total_apartments')
    case 'available_only': return t('apartments.available_only')
    case 'loading': return t('common.loading')
    case 'error': return t('apartments.error_loading')
    case 'retry': return t('buttons.retry')
    case 'no_apartments': return t('apartments.no_apartments')
    case 'no_apartments_desc': return t('apartments.no_apartments_description')
    case 'next_floor': return t('apartments.next_floor') // Assumed key, falls back to key if missing
    case 'prev_floor': return t('apartments.prev_floor') // Assumed key
    default: return t(key)
  }
}

const selectedApartment = ref<ApartmentZone | null>(null)
const hoveredApartmentId = ref<number | null>(null)

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
    
    // Block navigation for sold apartments
    if (apartment.status === 'sold') return

    selectedApartmentId.value = apartment.id
    selectedApartment.value = apartment
    
    // Emit selection event for parent to handle (inline view)
    emit('select-apartment', apartment.id)
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
