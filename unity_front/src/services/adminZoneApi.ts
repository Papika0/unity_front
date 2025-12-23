import api from '@/plugins/axios/api'

export interface ZoneResponse {
  id: number
  svg_coordinates: number[][]
  entity_id: number | null
  entity_type: string
  display_config: {
    label?: string
    fill?: string
    stroke?: string
    hover?: string
  }
}

export interface InteractiveZoneQuery {
  zone_type: 'building_block' | 'floor_strip' | 'apartment_unit'
  building_id?: number | string | null
  floor_number?: number | string | null
}

export interface ZoneFormData {
  zone_type: 'building_block' | 'floor_strip' | 'apartment_unit'
  level_type: 'overview' | 'building' | 'floor'
  entity_id: number | null
  entity_type: 'building' | 'floor' | 'apartment'
  building_id: number | string | null
  floor_number: number | string | null
  svg_coordinates: number[] | { x: number; y: number }[] | number[][]
  display_config: {
    label?: string
    fill?: string
    stroke?: string
    hover?: string
  }
}

export interface ZoneImageParams {
  project_id: number | string
  building_id?: number | string
  level_type: 'overview' | 'building' | 'floor'
  floor_number?: number | string | null
  image_type?: 'background'
}

export interface ZoneImageResponse {
  id: number
  images: Array<{
    url: string
    full_url: string
  }>
  viewbox?: string
}

export const adminZoneApi = {
  // Get zones
  getZones: async (projectId: number | string, params: InteractiveZoneQuery) => {
    return api.get(`/admin/projects/${projectId}/interactive-zones`, { params })
  },

  // Save specific zone
  createZone: async (projectId: number | string, data: ZoneFormData) => {
    return api.post(`/admin/projects/${projectId}/interactive-zones`, data)
  },

  // Delete all zones matching query
  deleteZones: async (projectId: number | string, params: InteractiveZoneQuery) => {
    return api.delete(`/admin/projects/${projectId}/interactive-zones`, { params })
  },

  // Get zone images (backgrounds)
  getZoneImages: async (params: ZoneImageParams) => {
    return api.get('/admin/zone-images', { params })
  },

  // Upload zone image
  uploadZoneImage: async (formData: FormData) => {
    return api.post('/admin/zone-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // PDF Detection
  detectApartments: async (formData: FormData) => {
    return api.post('/admin/detect-apartments', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    })
  },
}
