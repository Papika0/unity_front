import api from '@/plugins/axios/api'
import type { ProjectFeature } from './featuresApi'

// Related project minimal data
export interface RelatedProject {
  id: number
  title: string
  main_image: string | null
  status: string
}

// Project interfaces to match the API response
export interface ProjectApiResponse {
  id: number
  title: string
  description: string
  location: string
  status_name: string
  status: string
  start_date: string | null
  completion_date: string | null
  main_image: string | null
  render_image: string | null
  gallery_images: string[]
  year: string
  is_active: boolean
  is_featured: boolean
  is_onHomepage: boolean
  latitude: string | null
  longitude: string | null
  meta_title: string | null
  meta_description: string | null
  features?: ProjectFeature[]
  related_projects?: RelatedProject[] // Added related projects
}

export const projectsApi = {
  // Get all active projects
  getAll: async (locale: string = 'ka') => {
    const response = await api.get<{ success: boolean; data: ProjectApiResponse[] }>(
      `/projects?locale=${locale}`,
    )
    return response.data.data
  },

  // Get featured projects
  getFeatured: async () => {
    const response = await api.get<{ success: boolean; data: ProjectApiResponse[] }>(
      '/projects/featured',
    )
    return response.data.data
  },

  // Get homepage projects
  getHomepage: async () => {
    const response = await api.get<{ success: boolean; data: ProjectApiResponse[] }>(
      '/projects/homepage',
    )
    return response.data.data
  },

  // Get single project by ID
  getById: async (id: number, locale: string = 'ka') => {
    const response = await api.get<{ success: boolean; data: ProjectApiResponse }>(
      `/projects/${id}?locale=${locale}`,
    )
    return response.data.data
  },
}
