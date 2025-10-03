import api from '@/plugins/axios/api'

export const getTranslations = async (page: number, search: string = '', group?: string) =>
  api.post(`/translations`, { page, search, group })

export const updateTranslation = async (id: number, data: any) =>
  api.post(`/translations/${id}`, { ...data })

export const addTranslation = async (data: any) => api.post(`/translations/create`, { ...data })

export const deleteTranslation = async (id: number) => api.delete(`/translations/${id}`)

export const getTranslation = async (id: number) => api.get(`/translations/${id}`)

// Public/grouped fetch for frontend consumption
export const getTranslationsByGroup = async (group: string, locale: string = 'ka') =>
  api.get(`/public/translations/group/${group}`, { params: { locale } })

// Fetch multiple groups at once
export const getTranslationsByGroups = async (groups: string[], locale: string = 'ka') =>
  api.post(`/public/translations/groups`, { groups, locale })
