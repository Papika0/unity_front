import api from '@/plugins/axios/api'

export interface Building {
  id: number
  name: string
  identifier: string
  sort_order: number
}

export interface BuildingResponse {
  success: boolean
  data: Building | Building[]
  message?: string
}

export const buildingsApi = {
  /**
   * Fetch all buildings for a project
   */
  fetchBuildings: async (projectId: number): Promise<Building[]> => {
    try {
      const response = await api.get<BuildingResponse>(
        `/projects/${projectId}/buildings`
      )
      return Array.isArray(response.data.data) ? response.data.data : []
    } catch (error) {
      console.error('Error fetching buildings:', error)
      throw error
    }
  },

  /**
   * Fetch a single building by ID or identifier
   */
  fetchBuilding: async (projectId: number, buildingIdOrIdentifier: string | number): Promise<Building> => {
    try {
      const response = await api.get<BuildingResponse>(
        `/projects/${projectId}/buildings/${buildingIdOrIdentifier}`
      )
      return response.data.data as Building
    } catch (error) {
      console.error('Error fetching building:', error)
      throw error
    }
  },
}
