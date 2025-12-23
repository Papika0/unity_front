import api from '@/plugins/axios/api'

// Locale is now sent via Accept-Language header automatically
export type AboutInfoParams = {
  groups?: string[]
}

export interface AboutInfo {
  stats: {
    successful_projects: string
    years_experience: string
    satisfied_clients: string
    client_satisfaction: string
  }
}

export interface AboutResponse {
  translations: Record<string, string>
  about_info: AboutInfo
  meta: {
    locale: string
    cached_at: string
  }
}

export const getAboutInfo = async (params: AboutInfoParams = {}) => {
  return api.get('/about', { params })
}
