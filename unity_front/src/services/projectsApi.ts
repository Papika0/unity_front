import api from '@/plugins/axios/api'

// Project interfaces to match the API response
export interface ProjectApiResponse {
  id: number
  title: string
  description: string
  location: string
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
  is_onHomepage: boolean
  latitude: number | null
  longitude: number | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export const projectsApi = {
  // Get all active projects
  getAll: async () => {
    const response = await api.get<{ success: boolean; data: ProjectApiResponse[] }>('/projects')
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
  getById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: ProjectApiResponse }>(
      `/projects/${id}`,
    )
    return response.data.data
  },
}
