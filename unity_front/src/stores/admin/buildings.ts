import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  adminBuildingsApi,
  type BuildingFormData,
  type BuildingWithStats,
} from '@/services/adminBuildingsApi'

export const useBuildingsAdminStore = defineStore('admin-buildings', () => {
  // ==================== STATE ====================
  const buildings = ref<BuildingWithStats[]>([])
  const currentBuilding = ref<BuildingWithStats | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ==================== ACTIONS ====================
  async function fetchBuildings(projectId: number) {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminBuildingsApi.getAll(projectId)

      if ('data' in response && response.data) {
        buildings.value = response.data.data || []
      } else {
        buildings.value = []
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load buildings'
      error.value = message
      buildings.value = []
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single building
   */
  async function fetchBuilding(projectId: number, buildingId: number) {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminBuildingsApi.getOne(projectId, buildingId)

      if ('data' in response && response.data) {
        currentBuilding.value = response.data.data || null
        return currentBuilding.value
      }

      return null
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load building'
      error.value = message
      currentBuilding.value = null
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new building
   */
  async function createBuilding(projectId: number, data: BuildingFormData) {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminBuildingsApi.create(projectId, data)

      if ('data' in response && response.data?.data) {
        const newBuilding = response.data.data
        buildings.value.push(newBuilding)
        return newBuilding
      }

      throw new Error('Invalid response from server')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create building'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing building
   */
  async function updateBuilding(projectId: number, buildingId: number, data: BuildingFormData) {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminBuildingsApi.update(projectId, buildingId, data)

      if ('data' in response && response.data?.data) {
        const updatedBuilding = response.data.data

        // Update in list
        const index = buildings.value.findIndex((b: BuildingWithStats) => b.id === buildingId)
        if (index !== -1) {
          buildings.value[index] = updatedBuilding
        }

        // Update current building if it's the same
        if (currentBuilding.value?.id === buildingId) {
          currentBuilding.value = updatedBuilding
        }

        return updatedBuilding
      }

      throw new Error('Invalid response from server')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update building'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a building (soft delete with validation)
   */
  async function deleteBuilding(projectId: number, buildingId: number) {
    isLoading.value = true
    error.value = null

    try {
      await adminBuildingsApi.delete(projectId, buildingId)

      
      // Remove from list
      buildings.value = buildings.value.filter((b: BuildingWithStats) => b.id !== buildingId)
      
      // Clear current building if it's the same
      if (currentBuilding.value?.id === buildingId) {
        currentBuilding.value = null
      }
      
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete building'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ==================== RESET ====================
  function $reset() {
    buildings.value = []
    currentBuilding.value = null
    isLoading.value = false
    error.value = null
  }

  return {
    buildings,
    currentBuilding,
    isLoading,
    error,
    fetchBuildings,
    fetchBuilding,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    $reset,
  }
})
