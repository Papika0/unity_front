import api from '@/plugins/axios/api'
import type { ProjectApiResponse } from './projectsApi'

export type ProjectsPageParams = {
  locale?: string
  groups?: string[]
  page?: number
  per_page?: number
}

export interface PaginationInfo {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number | null
  to: number | null
  has_more_pages: boolean
}

export interface ProjectsPageResponse {
  translations: Record<string, string>
  projects: ProjectApiResponse[]
  pagination: PaginationInfo
  meta: {
    locale: string
    cached_at: string
  }
}

export const getProjectsPage = async (params: ProjectsPageParams = {}) => {
  return api.get('/projects-page', { params })
}
