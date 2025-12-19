<template>
  <div class="inline-apartment-viewer">
    <!-- Enhanced Breadcrumb Navigation -->
    <Transition name="fade-slide">
      <nav 
        v-if="selectedBuilding || selectedFloor"
        class="breadcrumb-nav overflow-x-auto whitespace-nowrap scrollbar-hide -mx-4 px-4 py-2 lg:mx-0 lg:p-0"
      >
        <div class="flex items-center gap-2 text-sm min-w-max">
          <!-- Home Button -->
          <button
            @click="resetToBuildings"
            class="breadcrumb-item group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-zinc-50"
            :class="{'breadcrumb-active': !selectedBuilding}"
          >
            <svg class="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="font-light">{{ t('apartments.all_buildings') }}</span>
          </button>
          
          <!-- Building Level -->
          <template v-if="selectedBuilding">
            <svg class="w-4 h-4 text-zinc-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            
            <button
              v-if="selectedFloor"
              @click="resetToFloors"
              class="breadcrumb-item group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-zinc-50"
            >
              <svg class="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span class="font-light">{{ selectedBuilding.label }}</span>
            </button>
            
            <div
              v-else
              class="breadcrumb-item breadcrumb-active flex items-center gap-2 px-3 py-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span class="font-medium">{{ selectedBuilding.label }}</span>
            </div>
          </template>

          <!-- Floor Level -->
          <template v-if="selectedFloor">
            <svg class="w-4 h-4 text-zinc-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            
            <button
              v-if="selectedApartmentId"
              @click="handleApartmentBack"
              class="breadcrumb-item group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:bg-zinc-50"
            >
              <svg class="w-4 h-4 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span class="font-light">{{ t('apartments.floor') }} {{ selectedFloor.floor_number }}</span>
            </button> <!-- closing button tag was missing in previous revert or I am adding it now -->
            
            <div
              v-else
              class="breadcrumb-item breadcrumb-active flex items-center gap-2 px-3 py-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span class="font-medium">{{ t('apartments.floor') }} {{ selectedFloor.floor_number }}</span>
            </div>
          </template>

          <!-- Apartment Level -->
          <template v-if="selectedApartmentId">
            <svg class="w-4 h-4 text-zinc-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            
            <div class="breadcrumb-item breadcrumb-active flex items-center gap-2 px-3 py-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span class="font-medium">{{ t('apartments.apartment') }}</span>
            </div>
          </template>
        </div>
      </nav>
    </Transition>

    <!-- Floor Selector View -->
    <Transition name="fade-slide" mode="out-in">
      <FloorSelector
        v-if="selectedBuilding && !selectedFloor"
        :key="`floor-${selectedBuilding.id}`"
        :project-id="projectId"
        :building-id="selectedBuilding.entity_id"
        :building-identifier="selectedBuilding.building_identifier"
        :auto-navigate="false"
        @floor-selected="handleFloorSelected"
        @back="resetToBuildings"
      />
    </Transition>

    <!-- Apartment Grid View -->
    <!-- Apartment Grid View -->
    <Transition name="fade-slide" mode="out-in">
      <ApartmentGrid
        v-if="selectedBuilding && selectedFloor && !selectedApartmentId"
        :key="`apartment-${selectedFloor.id}-${selectedFloor.floor_number}`"
        :project-id="projectId"
        :building-id="selectedBuilding.entity_id"
        :building-identifier="selectedBuilding.building_identifier"
        :floor-number="selectedFloor.floor_number"
        @change-floor="handleChangeFloor"
        @select-apartment="handleSelectApartment"
        @back="resetToFloors"
      />
      <!-- Apartment Detail View (Inline) -->
      <ApartmentDetailView
        v-else-if="selectedBuilding && selectedFloor && selectedApartmentId"
        :key="`detail-${selectedApartmentId}`"
        :project-id="projectId"
        :building-identifier="selectedBuilding.building_identifier"
        :floor-number="selectedFloor.floor_number"
        :apartment-id="selectedApartmentId"
        :is-inline="true"
        @back="handleApartmentBack"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTranslations } from '@/composables/useTranslations'
import FloorSelector from './FloorSelector.vue'
import ApartmentGrid from './ApartmentGrid.vue'
import type { BuildingZone, FloorZone } from '@/types/apartments'
import ApartmentDetailView from '@/views/ApartmentDetailView.vue'

interface Props {
  projectId: number
  selectedBuilding: BuildingZone | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'building-deselected': []
  'floor-selected': [floor: FloorZone]
  'floor-deselected': []
}>()

const { t } = useTranslations()
const route = useRoute()
const router = useRouter()

const selectedFloor = ref<FloorZone | null>(null)
const selectedApartmentId = ref<number | null>(null)



// Handle apartment selection
function handleSelectApartment(apartmentId: number) {
  selectedApartmentId.value = apartmentId
  
  // Update URL using query params, staying on same route
  router.replace({
    query: {
      ...route.query,
      apartment: apartmentId.toString()
    }
  })
}

// Handle back from apartment detail
function handleApartmentBack() {
  selectedApartmentId.value = null
  
  // Remove apartment param
  const newQuery = { ...route.query }
  delete newQuery.apartment
  
  router.replace({
    query: newQuery
  })
}

// Handle floor change from grid
function handleChangeFloor(newFloorNumber: number) {
  if (!selectedFloor.value) return
  
  // Create a temporary floor object with updated number
  // The actual data will be loaded by the grid component using this number
  const updatedFloor = {
    ...selectedFloor.value,
    floor_number: newFloorNumber,
    // ID is theoretically unknown here without a map, but grid depends on number
    // We update the ID just to force a re-render if needed via key
    id: selectedFloor.value.id + (newFloorNumber - selectedFloor.value.floor_number) 
  }
  
  handleFloorSelected(updatedFloor)
}

// Handle floor selection
function handleFloorSelected(floor: FloorZone) {
  selectedFloor.value = floor
  selectedApartmentId.value = null // Clear apartment selection when changing floors
  
  // Update URL smoothly with floor parameter
  router.replace({
    query: {
      ...route.query,
      // building should already be there or props.selectedBuilding might not be synced yet if we depend on parent
      // But typically we preserve existing query params + new ones
      floor: floor.floor_number.toString()
    }
  })
  
  emit('floor-selected', floor)
}

// Navigation functions
function resetToBuildings() {
  selectedFloor.value = null
  selectedApartmentId.value = null
  
  // Clear URL params smoothly
  router.replace({
    query: {}
  })
  
  emit('building-deselected')
}

function resetToFloors() {
  selectedFloor.value = null
  selectedApartmentId.value = null
  
  // Remove floor and apartment params from URL smoothly, keep building
  const newQuery = { ...route.query }
  delete newQuery.floor
  delete newQuery.apartment

  router.replace({
    query: newQuery
  })
  
  emit('floor-deselected')
}

// Watch for URL changes (browser back/forward)
watch(() => route.query, (newQuery) => {
  if (!newQuery.floor && selectedFloor.value) {
    selectedFloor.value = null
  }
  
  // Handle apartment navigation via back buttons
  if (newQuery.apartment) {
    const aptId = Number(newQuery.apartment)
    if (selectedApartmentId.value !== aptId) {
      selectedApartmentId.value = aptId
    }
  } else if (selectedApartmentId.value) {
    selectedApartmentId.value = null
  }
}, { deep: true })

// Initialize from URL on mount
onMounted(() => {
  // If there's a floor in the URL, we'll preserve it
  // The actual floor object will be set when FloorSelector emits it
})
</script>

<style scoped>
.inline-apartment-viewer {
  width: 100%;
}

/* Fade slide transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Breadcrumb styling - luxury minimalist design */
.breadcrumb-nav {
  background: linear-gradient(to bottom, rgba(255,205,75,0.03), transparent);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 1rem 0;
  margin-bottom: 1rem;
}

.breadcrumb-item {
  color: #71717a; /* zinc-500 */
  position: relative;
}

.breadcrumb-item:hover {
  color: #FFCD4B;
}

.breadcrumb-item.breadcrumb-active {
  color: #18181b; /* zinc-900 */
  background: rgba(255,205,75,0.08);
  border: 1px solid rgba(255,205,75,0.2);
}

.breadcrumb-item.breadcrumb-active::before {
  content: '';
  position: absolute;
  bottom: -1.25rem;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, #FFCD4B, #EBB738, #C89116);
  opacity: 0.6;
}
</style>
