export type ApartmentStatus = 'available' | 'reserved' | 'sold'
export type ZoneType = 'building_block' | 'floor_strip' | 'apartment_unit'
export type NavigationLevel = 'overview' | 'building' | 'floor'

export interface RoomDetails {
  bedrooms?: Record<string, number>
  bathrooms?: Record<string, number>
  other_rooms?: Record<string, number>
}

export interface Coordinates {
  coords: [number, number][]
  bbox: {
    min_x: number
    min_y: number
    max_x: number
    max_y: number
  }
}

export interface DisplayConfig {
  fill: string
  stroke: string
  hover: string
  label?: string
}

export interface ZoneImage {
  url: string
  viewbox: string
  width: number
  height: number
}

export interface ApartmentImage {
  id: number
  url: string
  title?: string
}

export interface Building {
  id: number
  project_id: number
  name: string
  name_ka?: string
  name_en?: string
  name_ru?: string
  identifier?: string
  description?: string | null
  display_order?: number
  sort_order?: number
  apartments_count?: number
  created_at?: string
  updated_at?: string
}

export interface Apartment {
  id: number
  project_id: number
  building_id: number
  floor_number: number
  apartment_number: string
  cadastral_code?: string | null
  status: ApartmentStatus
  price: number | null
  area_total: number | null
  area_living: number | null
  summer_area?: number | null
  bedrooms: number | null
  bathrooms: number | null
  room_details?: RoomDetails | null
  has_balcony: boolean
  is_parking: boolean
  image_2d?: ApartmentImage | null
  image_3d?: ApartmentImage | null
  created_at?: string
  updated_at?: string
}

export interface BuildingStats {
  total_units: number
  available: number
  reserved: number
  sold: number
  floor_range: string
}

export interface FloorStats {
  available: number
  reserved: number
  sold: number
  total: number
}

export interface BuildingZone extends Coordinates {
  id: number
  type: 'building_block'
  entity_id: number
  building_identifier: string
  label: string
  display: DisplayConfig
  stats: BuildingStats
}

export interface FloorZone extends Coordinates {
  id: number
  type: 'floor_strip'
  floor_number: number
  display: DisplayConfig
  stats: FloorStats
}

export interface ApartmentZone extends Coordinates {
  id: number
  apartment_number: string
  status: ApartmentStatus
  price: number | null
  area_total: number | null
  area_living: number | null
  bedrooms: number | null
  bathrooms: number | null
  has_balcony: boolean
  has_parking: boolean
  display: DisplayConfig
}

export interface NavigationResponse {
  level: NavigationLevel
  project: {
    id: number
    title: string
    location?: string
  }
  building?: {
    id: number
    name: string
    identifier: string
  }
  floor_number?: number
  has_multiple_buildings?: boolean
  image: ZoneImage | null
  zones?: BuildingZone[] | FloorZone[]
  apartments?: ApartmentZone[]
  prefetch_floors?: number[]
}

export interface ApartmentDetail {
  id: number
  project: { id: number; title: string; location: string }
  building: { id: number; name: string; identifier: string }
  floor_number: number
  apartment_number: string
  status: ApartmentStatus
  price: number | null
  area_total: number | null
  area_living: number | null
  bedrooms: number | null
  bathrooms: number | null
  has_balcony: boolean
  has_parking: boolean
  floor_plan_image?: string
  image_2d?: ApartmentImage | null
  image_3d?: ApartmentImage | null
  room_details?: {
    bedrooms?: Record<string, number>
    bathrooms?: Record<string, number>
    other_rooms?: Record<string, number>
  } | null
  similar_apartments?: ApartmentDetail[]
}
