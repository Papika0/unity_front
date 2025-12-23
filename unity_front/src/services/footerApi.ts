import api from '@/plugins/axios/api'
import type { ImageData } from '@/types'

export interface FooterData {
  projects: Array<{
    id: number
    title: string
    main_image: ImageData | null
  }>
  contact: {
    phone: string
    phone2: string
    email: string
    address: string
    google_maps_url: string
    phone_numbers: Array<{
      number: string
      display: string
      href: string
    }>
  }
  social_links: {
    facebook: string
    instagram: string
    twitter: string
    linkedin: string
    youtube: string
  }
}

export interface FooterApiResponse {
  success: boolean
  data: FooterData
  message?: string
}

/**
 * Get footer data including projects and contact information
 * Locale is now sent via Accept-Language header automatically
 */
export async function getFooterData(): Promise<FooterApiResponse> {
  const response = await api.get<FooterApiResponse>(`footer`)
  return response.data
}

/**
 * Get only footer projects
 * Locale is now sent via Accept-Language header automatically
 */
export async function getFooterProjects(limit: number = 6): Promise<FooterApiResponse> {
  const response = await api.get<FooterApiResponse>(
    `footer/projects?limit=${limit}`,
  )
  return response.data
}

/**
 * Get only footer contact information
 * Locale is now sent via Accept-Language header automatically
 */
export async function getFooterContact(): Promise<FooterApiResponse> {
  return api.get(`footer/contact`)
}
