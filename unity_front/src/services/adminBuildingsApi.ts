import api from '@/plugins/axios/api'
import type { Building } from '@/types/apartments'

export interface BuildingWithStats extends Building {
  apartments_count?: number
}

export interface BuildingFormData {
  name: {
    ka: string
    en?: string | null
    ru?: string | null
  }
  identifier?: string
  is_active?: boolean
  sort_order?: number
}

export const adminBuildingsApi = {
  getAll: async (projectId: number) => {
    return api.get(`/admin/projects/${projectId}/buildings`)
  },

  getOne: async (projectId: number, buildingId: number) => {
    return api.get(`/admin/projects/${projectId}/buildings/${buildingId}`)
  },

  create: async (projectId: number, data: BuildingFormData) => {
    return api.post(`/admin/projects/${projectId}/buildings`, data)
  },

  update: async (projectId: number, buildingId: number, data: BuildingFormData) => {
    return api.put(`/admin/projects/${projectId}/buildings/${buildingId}`, data)
  },

  delete: async (projectId: number, buildingId: number) => {
    return api.delete(`/admin/projects/${projectId}/buildings/${buildingId}`)
  },

  getFloors: async (buildingId: number) => {
    return api.get(`/admin/buildings/${buildingId}/floors`)
  },
}
