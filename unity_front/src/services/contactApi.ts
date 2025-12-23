import api from '@/plugins/axios/api'

// Locale is now sent via Accept-Language header automatically
export type ContactSettingsParams = {
  groups?: string[]
}

export interface MultilingualText {
  ka: string
  en: string
  ru: string
}

export interface ContactInfo {
  address: {
    value: MultilingualText
    subtitle: MultilingualText
  }
  phone: {
    value: string // Phone number is not multilingual
    subtitle: MultilingualText
  }
  phone2: {
    value: string // Second phone number is not multilingual
    subtitle: MultilingualText
  }
  email: {
    value: string // Email is not multilingual
    subtitle: MultilingualText
  }
  hours: {
    value: MultilingualText
    subtitle: MultilingualText
  }
}

export interface SocialLinks {
  facebook: string
  instagram: string
}

export interface MapSettings {
  latitude: number
  longitude: number
  zoom: number
}

export interface FormSubject {
  value: string
  label: MultilingualText
}

export interface FAQ {
  question: MultilingualText
  answer: MultilingualText
}

export interface ContactSettings {
  contact_info: ContactInfo
  social_links: SocialLinks
  map_settings: MapSettings
  form_subjects: FormSubject[]
  faqs: FAQ[]
  office_days: {
    working: string[]
    weekend: string[]
  }
}

export interface ContactResponse {
  translations: Record<string, string>
  contact_settings: ContactSettings
  meta: {
    locale: string
    cached_at: string
  }
}

export const getContactSettings = async (params: ContactSettingsParams = {}) => {
  return api.get('/contact-info/settings', { params })
}

export const getAdminContactSettings = async () => {
  return api.get('/admin/contact-info/settings')
}

export const updateContactSettings = async (data: Partial<ContactSettings>) => {
  return api.put('/admin/contact-info/settings', data)
}

export const contactApi = {
  getContactSettings,
  getAdminContactSettings,
  updateContactSettings,
}
