// Comprehensive Contact Settings Types for Admin Panel

export interface ContactInfoData {
  address: {
    value: Record<string, string> // { ka: 'ვაშლიჯვარი ქუჩა 47', en: 'Vashlijvari Street 47' }
    subtitle: Record<string, string>
  }
  phone: {
    value: string // '+995 577 300 333' - non-translatable
    subtitle: Record<string, string>
  }
  phone2: {
    value: string // '+995 577 300 334' - non-translatable, secondary phone
    subtitle: Record<string, string>
  }
  email: {
    value: string // 'info@unitydev.ge' - non-translatable
    subtitle: Record<string, string>
  }
  hours: {
    value: Record<string, string>
    subtitle: Record<string, string>
  }
}

export interface SocialLinksData {
  facebook: string
  instagram: string
}

export interface MapSettingsData {
  latitude: number
  longitude: number
  zoom: number
}

export interface FormSubject {
  value: string
  label: string
}

export interface FAQ {
  question: string
  answer: string
}

export interface OfficeDaysData {
  working: string[]
  weekend: string[]
}

export interface ContactSettingsData {
  contact_info: ContactInfoData
  social_links: SocialLinksData
  map_settings: MapSettingsData
  form_subjects: Record<string, FormSubject[]> // { ka: [...], en: [...] }
  faqs: Record<string, FAQ[]>
  office_days: Record<string, OfficeDaysData>
}

export interface ContactSettingsResponse {
  contact_settings: ContactSettingsData
  translations: Record<string, string>
  meta: {
    locale: string
    cached_at: string
  }
}

// Form data types for admin panel
export interface ContactSettingsFormData {
  contact_info?: Partial<ContactInfoData>
  social_links?: Partial<SocialLinksData>
  map_settings?: Partial<MapSettingsData>
  form_subjects?: Record<string, FormSubject[]>
  faqs?: Record<string, FAQ[]>
  office_days?: Record<string, OfficeDaysData>
}

// UI-specific types
export interface ContactSettingsTab {
  id: string
  name: string
  icon: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface ContactSettingsFormState {
  data: ContactSettingsFormData
  errors: ValidationError[]
  isDirty: boolean
  currentTab: string
  currentLocale: 'ka' | 'en'
}
