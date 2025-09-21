import api from '@/plugins/axios/api'

export interface Feature {
  id: number
  name: string
  title: Record<string, string>
  description: Record<string, string>
  icon: string
  color: string
  keywords: string[]
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ProjectFeature {
  id: number
  name: string
  title: Record<string, string>
  description: Record<string, string>
  icon: string
  color: string
  keywords: string[]
  is_active: boolean
  sort_order: number
  pivot: {
    project_id: number
    feature_id: number
    is_auto_detected: boolean
    sort_order: number
    created_at: string
    updated_at: string
  }
}

export const featuresApi = {
  // Get all active features
  getAll: async () => {
    const response = await api.get<{ success: boolean; data: Feature[] }>('/features')
    return response.data.data
  },

  // Get features for a specific project
  getProjectFeatures: async (projectId: number) => {
    const response = await api.get<{ success: boolean; data: ProjectFeature[] }>(
      `/features/project/${projectId}`,
    )
    return response.data.data
  },

  // Admin: Get all features (including inactive)
  adminGetAll: async () => {
    const response = await api.get<{ success: boolean; data: Feature[] }>('/admin/features')
    return response.data.data
  },

  // Admin: Get single feature by ID
  adminGetById: async (id: number) => {
    const response = await api.get<{ success: boolean; data: Feature }>(`/admin/features/${id}`)
    return response.data.data
  },

  // Admin: Create feature
  create: async (feature: Omit<Feature, 'id' | 'created_at' | 'updated_at'>) => {
    const response = await api.post<{ success: boolean; data: Feature }>('/admin/features', feature)
    return response.data.data
  },

  // Admin: Update feature
  update: async (
    id: number,
    feature: Partial<Omit<Feature, 'id' | 'created_at' | 'updated_at'>>,
  ) => {
    const response = await api.put<{ success: boolean; data: Feature }>(
      `/admin/features/${id}`,
      feature,
    )
    return response.data.data
  },

  // Admin: Delete feature
  delete: async (id: number) => {
    const response = await api.delete<{ success: boolean; data: null }>(`/admin/features/${id}`)
    return response.data.data
  },

  // Admin: Assign features to project
  assignToProject: async (projectId: number, featureIds: number[], autoDetect: boolean = false) => {
    const response = await api.post<{ success: boolean; data: ProjectFeature[] }>(
      `/admin/features/project/${projectId}/assign`,
      {
        feature_ids: featureIds,
        auto_detect: autoDetect,
      },
    )
    return response.data.data
  },
}
