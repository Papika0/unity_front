import api from '@/plugins/axios/api'
import type { NavigationResponse, ApartmentDetail, NavigationLevel } from '@/types/apartments'

export const apartmentNavigationApi = {
  /**
   * Fetch apartment navigation data for a specific level
   */
  fetchNavigationData: async (
    projectId: number,
    level: NavigationLevel,
    buildingId?: number,
    floorNumber?: number,
  ): Promise<NavigationResponse> => {
    try {
      const params = new URLSearchParams()
      params.append('level', level)

      if (buildingId !== undefined) {
        params.append('building_id', buildingId.toString())
      }

      if (floorNumber !== undefined) {
        params.append('floor_number', floorNumber.toString())
      }

      const response = await api.get<NavigationResponse>(
        `/projects/${projectId}/apartment-navigation?${params}`,
      )

      return response.data
    } catch (error) {
      console.error('Error fetching apartment navigation data:', error)
      throw error
    }
  },

  /**
   * Fetch detailed information about a specific apartment
   */
  fetchApartmentDetail: async (apartmentId: number): Promise<ApartmentDetail> => {
    try {
      const response = await api.get<ApartmentDetail>(`/apartments/${apartmentId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching apartment detail:', error)
      throw error
    }
  },
}
