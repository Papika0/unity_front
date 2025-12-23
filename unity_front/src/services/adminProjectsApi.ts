import api from '@/plugins/axios/api'
import type { Project } from '@/types'

export const adminProjectsApi = {
  // Get all projects for admin
  getProjects: async () => {
    return api.get<{ success: boolean; data: Project[] }>('/admin/projects')
  },
}
