/**
 * useBuildingsList - Composable for admin buildings list management
 * Handles loading, CRUD operations, and navigation
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBuildingsAdminStore } from '@/stores/admin/buildings'
import { useAdminProjectsStore } from '@/stores/admin/projects'
import type { Building } from '@/types/apartments'
import type { Project } from '@/types'

export function useBuildingsList() {
  // ============================================
  // STORES & ROUTER
  // ============================================
  const router = useRouter()
  const buildingsStore = useBuildingsAdminStore()
  const projectsStore = useAdminProjectsStore()

  // ============================================
  // STATE
  // ============================================
  const selectedProjectId = ref<number | null>(null)
  const showModal = ref(false)
  const selectedBuilding = ref<Building | null>(null)
  const projects = ref<Project[]>([])

  // ============================================
  // ACTIONS
  // ============================================
  const loadProjects = async () => {
    try {
      await projectsStore.loadProjects()
      projects.value = projectsStore.projects
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const loadBuildings = async () => {
    if (!selectedProjectId.value) return

    try {
      await buildingsStore.fetchBuildings(selectedProjectId.value)
    } catch (error) {
      console.error('Failed to load buildings:', error)
    }
  }

  const openCreateModal = () => {
    if (!selectedProjectId.value) {
      alert('გთხოვთ პირველ აირჩიოთ პროექტი')
      return
    }
    selectedBuilding.value = null
    showModal.value = true
  }

  const editBuilding = (building: Building) => {
    selectedBuilding.value = building
    showModal.value = true
  }

  const closeModal = () => {
    showModal.value = false
    selectedBuilding.value = null
  }

  const handleSaved = () => {
    closeModal()
    loadBuildings()
  }

  const deleteBuilding = async (building: Building) => {
    if (!confirm(`დარწმუნებული ხართ, რომ გსურთ შენობის "${building.name}" წაშლა?`)) {
      return
    }

    if (building.apartments_count && building.apartments_count > 0) {
      alert(`შეუძლებელია შენობის წაშლა, რადგან მას აქვს ${building.apartments_count} ბინა. პირველ წაშალეთ ყველა ბინა.`)
      return
    }

    try {
      await buildingsStore.deleteBuilding(selectedProjectId.value!, building.id)
      alert('შენობა წარმატებით წაიშალა')
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string }
      alert('შეცდომა: ' + (apiError.response?.data?.message || apiError.message))
    }
  }

  const viewApartments = (building: Building) => {
    router.push({
      name: 'admin-apartments',
      params: { projectId: selectedProjectId.value, buildingId: building.id },
    })
  }

  const editFloorZones = (building: Building) => {
    if (!selectedProjectId.value) return
    router.push({
      name: 'admin-zones-floor-strips',
      params: {
        id: selectedProjectId.value.toString(),
        buildingId: building.id.toString(),
      },
    })
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(() => {
    loadProjects()
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // Stores
    buildingsStore,

    // State
    selectedProjectId,
    showModal,
    selectedBuilding,
    projects,

    // Actions
    loadBuildings,
    openCreateModal,
    editBuilding,
    closeModal,
    handleSaved,
    deleteBuilding,
    viewApartments,
    editFloorZones,
  }
}
