import api from '@/plugins/axios/api'

export const getProjects = async () => api.get(`/projects/`)

export const getProject = async (id: number) => api.get(`/projects/${id}/`)

export const createProject = async (data: FormData) =>
  api.post(`/projects/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const updateProject = (id: number, data: FormData) =>
  api.post(`/projects/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteProject = async (id: number) => api.delete(`/projects/${id}`)
