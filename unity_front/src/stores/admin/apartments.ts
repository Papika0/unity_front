import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Apartment, ApartmentStatus } from '@/types/apartments'
import api from '@/plugins/axios/api'

interface ApartmentFormData {
  floor_number: number
  apartment_number: string
  status: ApartmentStatus
  price?: number | null
  area_total?: number | null
  area_living?: number | null
  bedrooms?: number | null
  bathrooms?: number | null
  has_balcony: boolean
  has_parking: boolean
}

interface BulkImportResult {
  success: boolean
  message: string
  imported_count?: number
  failed_count?: number
  errors?: Array<{
    row: number
    errors: string[]
  }>
}

interface ApartmentFilters {
  floor_number?: number
  status?: ApartmentStatus
  min_price?: number
  max_price?: number
  page?: number
}

export const useApartmentsAdminStore = defineStore('admin-apartments', () => {
  const apartments = ref<Apartment[]>([])
  const currentApartment = ref<Apartment | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const pagination = ref({
    total: 0,
    per_page: 50,
    current_page: 1,
    last_page: 1
  })

  /**
   * Fetch all apartments for a building with optional filters
   */
  async function fetchApartments(
    projectId: number,
    buildingId: number,
    filters?: ApartmentFilters
  ) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get(
        `/admin/projects/${projectId}/buildings/${buildingId}/apartments`,
        { params: filters }
      )

      if ('data' in response && response.data) {
        apartments.value = response.data.data || []

        // Capture pagination metadata
        if (response.data.meta) {
          pagination.value = {
            total: response.data.meta.total || 0,
            per_page: response.data.meta.per_page || 50,
            current_page: response.data.meta.current_page || 1,
            last_page: response.data.meta.last_page || 1
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
    data: ApartmentFormData
  ) {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post(
        `/admin/projects/${projectId}/buildings/${buildingId}/apartments`,
        data
      )

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
      const response = await api.put(`/admin/apartments/${apartmentId}`, data)

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
      const response = await api.patch(`/admin/apartments/${apartmentId}/status`, { status })

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
   * Delete an apartment
   */
  async function deleteApartment(apartmentId: number) {
    isLoading.value = true
    error.value = null

    try {
      await api.delete(`/admin/apartments/${apartmentId}`)

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
    file: File
  ): Promise<BulkImportResult> {
    isLoading.value = true
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post(
        `/admin/projects/${projectId}/buildings/${buildingId}/apartments/bulk-import`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      )

      if ('data' in response && response.data) {
        const result: BulkImportResult = {
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
      const response = await api.get(
        '/admin/projects/0/buildings/0/apartments/template',
        { responseType: 'blob' }
      )

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

  /**
   * Reset store state
   */
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
    deleteApartment,
    bulkImport,
    downloadTemplate,
    $reset,
  }
})
