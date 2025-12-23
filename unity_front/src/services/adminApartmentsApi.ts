import api from '@/plugins/axios/api'
import type { ApartmentStatus } from '@/types/apartments'

export interface ApartmentFormData {
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

export interface ApartmentFilters {
  floor_number?: number
  status?: ApartmentStatus
  min_price?: number
  max_price?: number
  page?: number
}

export interface BulkImportResponse {
  success: boolean
  message: string
  imported_count?: number
  failed_count?: number
  errors?: Array<{
    row: number
    errors: string[]
  }>
}

export const adminApartmentsApi = {
  getAll: async (projectId: number, buildingId: number, filters?: ApartmentFilters) => {
    return api.get(`/admin/projects/${projectId}/buildings/${buildingId}/apartments`, {
      params: filters,
    })
  },

  create: async (projectId: number, buildingId: number, data: ApartmentFormData) => {
    return api.post(`/admin/projects/${projectId}/buildings/${buildingId}/apartments`, data)
  },

  update: async (apartmentId: number, data: Partial<ApartmentFormData>) => {
    return api.put(`/admin/apartments/${apartmentId}`, data)
  },

  updateStatus: async (apartmentId: number, status: ApartmentStatus) => {
    return api.patch(`/admin/apartments/${apartmentId}/status`, { status })
  },

  delete: async (apartmentId: number) => {
    return api.delete(`/admin/apartments/${apartmentId}`)
  },

  bulkImport: async (projectId: number, buildingId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    return api.post(
      `/admin/projects/${projectId}/buildings/${buildingId}/apartments/bulk-import`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    )
  },

  downloadTemplate: async () => {
    return api.get('/admin/projects/0/buildings/0/apartments/template', {
      responseType: 'blob',
    })
  },

  /**
   * Upload 2D/3D images for an apartment
   */
  uploadImages: async (apartmentId: number, image2d?: File | null, image3d?: File | null) => {
    const formData = new FormData()
    if (image2d) formData.append('image_2d', image2d)
    if (image3d) formData.append('image_3d', image3d)

    return api.post(`/admin/apartments/${apartmentId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  /**
   * Delete an image from an apartment
   */
  deleteImage: async (apartmentId: number, imageId: number) => {
    return api.delete(`/admin/apartments/${apartmentId}/images/${imageId}`)
  },

  /**
   * Batch upload images from folder structure
   */
  batchUploadImages: async (projectId: number, buildingId: number, files: FileList) => {
    const formData = new FormData()
    
    Array.from(files).forEach((file, index) => {
      // Use webkitRelativePath if available (folder upload), otherwise use name
      const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name
      formData.append(`files[${index}]`, file, path)
    })

    return api.post(
      `/admin/projects/${projectId}/buildings/${buildingId}/apartments/batch-images`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    )
  },
}
