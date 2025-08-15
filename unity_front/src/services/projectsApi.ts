import { api } from './api'
import type { ApiResponse } from './api'

// Project interfaces to match the API response
export interface ProjectApiResponse {
  id: number
  title: string
  title_en: string
  title_ru: string
  title_ka: string
  description: string
  description_en: string
  description_ru: string
  description_ka: string
  location: string
  location_en: string
  location_ru: string
  location_ka: string
  status: 'planning' | 'ongoing' | 'completed'
  status_name: string
  start_date: string
  completion_date: string
  main_image: string
  render_image: string
  gallery_images: string[]
  year: number
  is_active: boolean
  is_featured: boolean
  latitude: number | null
  longitude: number | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

// Convert API response to store format
export const transformProject = (apiProject: ProjectApiResponse) => ({
  id: apiProject.id,
  is_active: apiProject.is_active,
  is_featured: apiProject.is_featured,
  title: {
    ka: apiProject.title_ka,
    en: apiProject.title_en,
    ru: apiProject.title_ru,
  },
  description: {
    ka: apiProject.description_ka,
    en: apiProject.description_en,
    ru: apiProject.description_ru,
  },
  location: {
    ka: apiProject.location_ka,
    en: apiProject.location_en,
    ru: apiProject.location_ru,
  },
  status: apiProject.status,
  start_date: apiProject.start_date,
  completion_date: apiProject.completion_date,
  main_image: apiProject.main_image,
  render_image: apiProject.render_image,
  gallery_images: apiProject.gallery_images,
  year: apiProject.year,
  latitude: apiProject.latitude,
  longitude: apiProject.longitude,
  meta_title: apiProject.meta_title,
  meta_description: apiProject.meta_description,
  created_at: apiProject.created_at,
  updated_at: apiProject.updated_at,
})

export const projectsApi = {
  // Get all active projects
  getAll: async () => {
    const response = await api.get<ProjectApiResponse[]>('/projects')
    return response.data
  },

  // Get featured projects
  getFeatured: async () => {
    const response = await api.get<ProjectApiResponse[]>('/projects/featured')
    return response.data
  },

  // Get single project by ID
  getById: async (id: number) => {
    const response = await api.get<ProjectApiResponse>(`/projects/${id}`)
    return response.data
  },
}
