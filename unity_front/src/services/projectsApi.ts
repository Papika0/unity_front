import api from '@/plugins/axios/api'
import { useLocaleStore } from '@/stores/ui/locale'
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
    const localeStore = useLocaleStore()
    const translationsStore = useTranslationsStore()

    const queryString = new URLSearchParams()
    queryString.append('locale', locale || localeStore.currentLocale)

    // Request missing translation groups for projects page
    const missingGroups = translationsStore.getMissingGroups('projects')
    if (missingGroups.length > 0) {
      missingGroups.forEach((group) => queryString.append('groups[]', group))
    }

    const response = await api.get<{
      success: boolean;
      data: {
        data: ProjectApiResponse;
        translations?: Record<string, any>;
        meta?: {
          locale: string;
          cached_at: string;
        }
      }
    }>(
      `/projects/${id}?${queryString}`,
    )

    // Return the full response data (includes data, translations, and meta)
    return response.data.data
  },
}
