import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Apartment, ApartmentStatus } from '@/types/apartments'
import {
  adminApartmentsApi,
  type ApartmentFormData,
  type ApartmentFilters,
  type BulkImportResponse,
} from '@/services/adminApartmentsApi'

export const useApartmentsAdminStore = defineStore('admin-apartments', () => {
  // ==================== STATE ====================
  const apartments = ref<Apartment[]>([])
  const currentApartment = ref<Apartment | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const pagination = ref({
    total: 0,
    per_page: 50,
    current_page: 1,
    last_page: 1,
  })

  // ==================== ACTIONS ====================
  async function fetchApartments(
    projectId: number,
    buildingId: number,
    filters?: ApartmentFilters,
  ) {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApartmentsApi.getAll(projectId, buildingId, filters)

      if ('data' in response && response.data) {
        apartments.value = response.data.data || []

        // Capture pagination metadata
        if (response.data.meta) {
          pagination.value = {
            total: response.data.meta.total || 0,
            per_page: response.data.meta.per_page || 50,
            current_page: response.data.meta.current_page || 1,
            last_page: response.data.meta.last_page || 1,
          }
        }
      } else {
        apartments.value = []
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load apartments'
      error.value = message
      apartments.value = []
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Create a new apartment
   */
  async function createApartment(
    projectId: number,
    buildingId: number,
    data: ApartmentFormData,
  ) {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApartmentsApi.create(projectId, buildingId, data)

      if ('data' in response && response.data?.data) {
        const newApartment = response.data.data
        apartments.value.push(newApartment)
        return newApartment
      }

      throw new Error('Invalid response from server')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create apartment'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing apartment
   */
  async function updateApartment(apartmentId: number, data: Partial<ApartmentFormData>) {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApartmentsApi.update(apartmentId, data)

      if ('data' in response && response.data?.data) {
        const updatedApartment = response.data.data

        // Update in list
        const index = apartments.value.findIndex((a: Apartment) => a.id === apartmentId)
        if (index !== -1) {
          apartments.value[index] = updatedApartment
        }

        // Update current apartment if it's the same
        if (currentApartment.value?.id === apartmentId) {
          currentApartment.value = updatedApartment
        }

        return updatedApartment
      }

      throw new Error('Invalid response from server')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update apartment'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Quick status update
   */
  async function updateStatus(apartmentId: number, status: ApartmentStatus) {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApartmentsApi.updateStatus(apartmentId, status)

      if ('data' in response && response.data?.data) {
        const updatedApartment = response.data.data

        // Update in list
        const index = apartments.value.findIndex((a: Apartment) => a.id === apartmentId)
        if (index !== -1) {
          apartments.value[index] = updatedApartment
        }

        // Update current apartment if it's the same
        if (currentApartment.value?.id === apartmentId) {
          currentApartment.value = updatedApartment
        }

        return updatedApartment
      }

      throw new Error('Invalid response from server')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update status'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Batch update status for multiple apartments
   */
  async function batchUpdateStatus(apartmentIds: number[], status: ApartmentStatus) {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApartmentsApi.batchUpdateStatus(apartmentIds, status)

      if ('data' in response && response.data) {
        // Update local state for successfully updated apartments
        apartmentIds.forEach(id => {
          const apartment = apartments.value.find(a => a.id === id)
          if (apartment) {
            apartment.status = status
          }
        })

        return response.data
      }

      throw new Error('Invalid response from server')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to batch update status'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete an apartment
   */
  async function deleteApartment(apartmentId: number) {
    isLoading.value = true
    error.value = null

    try {
      await adminApartmentsApi.delete(apartmentId)

      // Remove from list
      apartments.value = apartments.value.filter((a: Apartment) => a.id !== apartmentId)

      // Clear current apartment if it's the same
      if (currentApartment.value?.id === apartmentId) {
        currentApartment.value = null
      }

      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete apartment'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Bulk import apartments from CSV/Excel
   */
  async function bulkImport(
    projectId: number,
    buildingId: number,
    file: File,
  ): Promise<BulkImportResponse> {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApartmentsApi.bulkImport(projectId, buildingId, file)

      if ('data' in response && response.data) {
        const result: BulkImportResponse = {
          success: response.data.success || false,
          message: response.data.message || 'Import completed',
          imported_count: response.data.imported_count,
          failed_count: response.data.failed_count,
          errors: response.data.errors,
        }

        // Refresh apartments list after successful import
        if (result.success && result.imported_count && result.imported_count > 0) {
          await fetchApartments(projectId, buildingId)
        }

        return result
      }

      throw new Error('Invalid response from server')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to import apartments'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Download CSV template for bulk import
   */
  async function downloadTemplate() {
    isLoading.value = true
    error.value = null

    try {
      const response = await adminApartmentsApi.downloadTemplate()

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'apartment_import_template.csv')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to download template'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ==================== RESET ====================
  function $reset() {
    apartments.value = []
    currentApartment.value = null
    isLoading.value = false
    error.value = null
  }

  return {
    apartments,
    currentApartment,
    isLoading,
    error,
    pagination,
    fetchApartments,
    createApartment,
    updateApartment,
    updateStatus,
    batchUpdateStatus,
    deleteApartment,
    bulkImport,
    downloadTemplate,
    $reset,
  }
})
