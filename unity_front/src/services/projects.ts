import api from '@/plugins/axios/api'

export const getProjects = async () => api.get('projects/')
export const getProject = async (id: number) => api.get(`projects/${id}/`)

export const getAdminProjects = async () => api.get(`admin/projects/`)

export const getAdminProject = async (id: number) => api.get(`admin/projects/${id}/`)

export const createProject = async (data: FormData) =>
  api.post(`admin/projects/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const updateProject = (id: number, data: FormData) =>
  api.post(`admin/projects/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteProject = async (id: number) => api.delete(`admin/projects/${id}`)
