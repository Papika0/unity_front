import api from '@/plugins/axios/api'

// Two formats are used: flat (stores) and nested (ListView)
type TranslationDataFlat = {
  key: string
  en: string
  ka: string
  ru?: string
}

type TranslationDataNested = {
  key: string
  text: { en: string; ka: string; ru: string }
  group: string
  active: boolean
}

type TranslationUpdateData = TranslationDataFlat | TranslationDataNested

export const getTranslations = async (page: number, search: string = '', group?: string) =>
  api.post(`/translations`, { page, search, group })

export const updateTranslation = async (id: number, data: TranslationUpdateData) =>
  api.post(`/translations/${id}`, { ...data })

export const addTranslation = async (data: TranslationUpdateData) => api.post(`/translations/create`, { ...data })

export const deleteTranslation = async (id: number) => api.delete(`/translations/${id}`)

export const getTranslation = async (id: number) => api.get(`/translations/${id}`)

// Public/grouped fetch for frontend consumption
// Locale is now sent via Accept-Language header automatically
export const getTranslationsByGroup = async (group: string) =>
  api.get(`/public/translations/group/${group}`)

// Fetch multiple groups at once
// Locale is now sent via Accept-Language header automatically
export const getTranslationsByGroups = async (groups: string[]) =>
  api.post(`/public/translations/groups`, { groups })
