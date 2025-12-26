import api from '@/plugins/axios/api'

export interface ApartmentFilters {
  project_id?: number | null
  building_id?: number | null
  floor_number?: number | null
  bedrooms?: number | number[] | null
  min_area?: number | null
  max_area?: number | null
  min_price?: number | null
  max_price?: number | null
  page?: number
  per_page?: number
}

// Re-using the structure from the controller response, adapted to TS
export interface ApartmentSearchResult {
  id: number
  project_id: number
  building_id: number
  building_identifier: string
  project_title: string
  building_name: string
  apartment_number: string
  floor_number: number
  rooms?: number
  bedrooms: number
  bathrooms: number
  area_total: number
  area_living: number
  has_balcony: boolean
  price: number
  status: 'available' | 'sold' | 'reserved'
  image: string | null
  image_2d: string | null
  image_3d: string | null
}

export interface PaginatedApartments {
  data: ApartmentSearchResult[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export const apartmentService = {
  /**
   * Search for apartments with filters
   */
  async search(filters: ApartmentFilters): Promise<PaginatedApartments> {
    // Filter out null/undefined values
    const params = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value
      }
      return acc
    }, {} as Record<string, string | number | boolean>)

    const response = await api.get<PaginatedApartments>('/apartments', { params })
    return response.data
  },

  /**
   * Get filter options
   */
  async getFilters(): Promise<FilterResponse> {
    const { data } = await api.get('/apartments/filters')
    return data
  }
}

export interface FilterResponse {
  max_bedrooms: number
  area: {
    min: number
    max: number
  }
  price: {
    min: number
    max: number
  }
}
