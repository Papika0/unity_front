<template>
  <div class="inline-apartment-viewer">
    <!-- Enhanced Breadcrumb Navigation -->
    <ApartmentBreadcrumb
      :selected-building="selectedBuilding"
      :selected-floor="selectedFloor"
      :selected-apartment-id="selectedApartmentId"
      @reset-to-buildings="resetToBuildings"
      @reset-to-floors="resetToFloors"
      @apartment-back="handleApartmentBack"
    />

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
import ApartmentBreadcrumb from './ApartmentBreadcrumb.vue'
import FloorSelector from './FloorSelector.vue'
import ApartmentGrid from './ApartmentGrid.vue'
import ApartmentDetailView from '@/views/ApartmentDetailView.vue'
import type { BuildingZone, FloorZone } from '@/types/apartments'

interface Props {
  projectId: number
  selectedBuilding: BuildingZone | null
}

defineProps<Props>()

const emit = defineEmits<{
  'building-deselected': []
  'floor-selected': [floor: FloorZone]
  'floor-deselected': []
}>()

const route = useRoute()
const router = useRouter()

const selectedFloor = ref<FloorZone | null>(null)
const selectedApartmentId = ref<number | null>(null)

// Handle apartment selection
function handleSelectApartment(apartmentId: number) {
  selectedApartmentId.value = apartmentId
  
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
  
  const newQuery = { ...route.query }
  delete newQuery.apartment
  
  router.replace({
    query: newQuery
  })
}

// Handle floor change from grid
function handleChangeFloor(newFloorNumber: number) {
  if (!selectedFloor.value) return
  
  const updatedFloor = {
    ...selectedFloor.value,
    floor_number: newFloorNumber,
    id: selectedFloor.value.id + (newFloorNumber - selectedFloor.value.floor_number) 
  }
  
  handleFloorSelected(updatedFloor)
}

// Handle floor selection
function handleFloorSelected(floor: FloorZone) {
  selectedFloor.value = floor
  selectedApartmentId.value = null
  
  router.replace({
    query: {
      ...route.query,
      floor: floor.floor_number.toString()
    }
  })
  
  emit('floor-selected', floor)
}

// Navigation functions
function resetToBuildings() {
  selectedFloor.value = null
  selectedApartmentId.value = null
  
  router.replace({
    query: {}
  })
  
  emit('building-deselected')
}

function resetToFloors() {
  selectedFloor.value = null
  selectedApartmentId.value = null
  
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
</style>
