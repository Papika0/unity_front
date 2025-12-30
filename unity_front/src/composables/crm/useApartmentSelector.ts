/**
 * Apartment Selector Composable
 *
 * Reusable logic for selecting apartments via cascade dropdowns:
 * Project → Building → Floor → Apartment
 *
 * Extracted from DealDetails.vue for reuse across components.
 */

import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import { useBuildingsAdminStore } from '@/stores/admin/buildings'
import { projectsApi, type ProjectApiResponse } from '@/services/projectsApi'
import { apartmentService, type ApartmentSearchResult } from '@/services/apartmentService'
import { adminBuildingsApi } from '@/services/adminBuildingsApi'

export interface ApartmentSelectorOptions {
  onError?: (message: string) => void
}

export interface ApartmentSelector {
  // Selections
  selectedProjectId: Ref<number | null>
  selectedBuildingId: Ref<number | null>
  selectedFloor: Ref<number | null>
  selectedApartmentId: Ref<number | null>

  // Data lists
  projects: Ref<ProjectApiResponse[]>
  buildings: ComputedRef<any[]>
  availableFloors: Ref<number[]>
  availableApartments: Ref<ApartmentSearchResult[]>

  // Loading states
  loadingProjects: Ref<boolean>
  loadingBuildings: ComputedRef<boolean>
  loadingFloors: Ref<boolean>
  loadingApartments: Ref<boolean>

  // Computed
  selectedApartment: ComputedRef<ApartmentSearchResult | null>
  selectedBuilding: ComputedRef<any | null>
  selectedProject: ComputedRef<ProjectApiResponse | null>

  // Methods
  reset: () => void
  loadProjects: () => Promise<void>
}

export function useApartmentSelector(options: ApartmentSelectorOptions = {}): ApartmentSelector {
  const { onError } = options

  // Store
  const buildingsStore = useBuildingsAdminStore()

  // Selection state
  const selectedProjectId = ref<number | null>(null)
  const selectedBuildingId = ref<number | null>(null)
  const selectedFloor = ref<number | null>(null)
  const selectedApartmentId = ref<number | null>(null)

  // Data lists
  const projects = ref<ProjectApiResponse[]>([])
  const availableFloors = ref<number[]>([])
  const availableApartments = ref<ApartmentSearchResult[]>([])

  // Loading states
  const loadingProjects = ref(false)
  const loadingFloors = ref(false)
  const loadingApartments = ref(false)

  // Computed
  const buildings = computed(() => buildingsStore.buildings)
  const loadingBuildings = computed(() => buildingsStore.isLoading)

  const selectedProject = computed(() => {
    if (!selectedProjectId.value) return null
    return projects.value.find(p => p.id === selectedProjectId.value) || null
  })

  const selectedBuilding = computed(() => {
    if (!selectedBuildingId.value) return null
    return buildings.value.find(b => b.id === selectedBuildingId.value) || null
  })

  const selectedApartment = computed(() => {
    if (!selectedApartmentId.value) return null
    return availableApartments.value.find(a => a.id === selectedApartmentId.value) || null
  })

  // Methods
  async function loadProjects() {
    if (projects.value.length > 0) return

    loadingProjects.value = true
    try {
      projects.value = await projectsApi.getAll()
    } catch (error) {
      onError?.('Failed to load projects')
    } finally {
      loadingProjects.value = false
    }
  }

  function reset() {
    selectedProjectId.value = null
    selectedBuildingId.value = null
    selectedFloor.value = null
    selectedApartmentId.value = null
    availableFloors.value = []
    availableApartments.value = []
  }

  // Watchers for cascade effect
  watch(selectedProjectId, async (newId) => {
    selectedBuildingId.value = null
    selectedFloor.value = null
    selectedApartmentId.value = null
    availableFloors.value = []
    availableApartments.value = []

    if (newId) {
      try {
        await buildingsStore.fetchBuildings(newId)
      } catch (error) {
        onError?.('Failed to load buildings')
      }
    } else {
      buildingsStore.$reset()
    }
  })

  watch(selectedBuildingId, async (newId) => {
    selectedFloor.value = null
    selectedApartmentId.value = null
    availableFloors.value = []
    availableApartments.value = []

    if (newId) {
      loadingFloors.value = true
      try {
        const { data } = await adminBuildingsApi.getFloors(newId)
        if (data && data.success) {
          availableFloors.value = data.data
        }
      } catch (error) {
        onError?.('Failed to load floors')
      } finally {
        loadingFloors.value = false
      }
    }
  })

  watch(selectedFloor, async (newFloor) => {
    selectedApartmentId.value = null
    availableApartments.value = []

    if (newFloor !== null && selectedBuildingId.value) {
      loadingApartments.value = true
      try {
        const result = await apartmentService.search({
          building_id: selectedBuildingId.value,
          floor_number: newFloor,
          per_page: 100,
        })
        availableApartments.value = result.data
      } catch (error) {
        onError?.('Failed to load apartments')
      } finally {
        loadingApartments.value = false
      }
    }
  })

  return {
    // Selections
    selectedProjectId,
    selectedBuildingId,
    selectedFloor,
    selectedApartmentId,

    // Data lists
    projects,
    buildings,
    availableFloors,
    availableApartments,

    // Loading states
    loadingProjects,
    loadingBuildings,
    loadingFloors,
    loadingApartments,

    // Computed
    selectedProject,
    selectedBuilding,
    selectedApartment,

    // Methods
    reset,
    loadProjects,
  }
}
