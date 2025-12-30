import api from '@/plugins/axios/api'
import { useTranslationsStore } from '@/stores/ui/translations'
import type { ProjectFeature } from './featuresApi'
import type { ImageData } from '@/types'

// Related project minimal data
export interface RelatedProject {
  id: number
  title: string
  main_image: ImageData | null
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
  main_image: ImageData | null
  render_image: ImageData | null
  gallery_images: ImageData[]
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
  hasApartmentNavigation: boolean // True if project has active building block zones
}

export const projectsApi = {
  // Get all active projects
  // Locale is now sent via Accept-Language header automatically
  getAll: async () => {
    const response = await api.get<{ success: boolean; data: ProjectApiResponse[] }>(
      `/projects`,
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
  // Locale is now sent via Accept-Language header automatically
  getById: async (id: number) => {
    const translationsStore = useTranslationsStore()

    const queryString = new URLSearchParams()

    // Always request translation groups for projects page to ensure server translations are fetched
    // This prevents issues when local JSON preloads groups marking them as "loaded"
    const requiredGroups = translationsStore.getPageGroups('projects')
    requiredGroups.forEach((group) => queryString.append('groups[]', group))

    const queryPart = queryString.toString() ? `?${queryString}` : ''

    const response = await api.get<{
      success: boolean;
      data: {
        data: ProjectApiResponse;
        translations?: Record<string, string>;
        meta?: {
          locale: string;
          cached_at: string;
        }
      }
    }>(
      `/projects/${id}${queryPart}`,
    )

    // Return the full response data object (includes data, translations, and meta)
    // Caller can access response.data for project and response.translations for translations
    return response.data
  },
}
