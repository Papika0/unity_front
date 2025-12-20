/**
 * Project Form Composable
 * Handles project form state, translations, and data preparation
 */

import { ref } from 'vue'
import { Translator } from '@/utils/translator'
import { handleFileChange, handleGalleryChange, removeGalleryImage } from '@/utils/formImageHandlers'
import type { ImageData } from '@/types'

export interface ProjectFormData {
  title: Record<string, string>
  description: Record<string, string>
  location: Record<string, string>
  status: string
  year: number
  start_date: string
  completion_date: string
  base_price_per_sqm?: number
  is_active: boolean
  is_featured: boolean
  is_onHomepage: boolean
  main_image: File | null
  render_image: File | null
  gallery_images: File[]
  existing_gallery_images?: string[]
}

export interface ProjectPreviews {
  main_image: string
  render_image: string
  gallery_images: string[]
}

export function useProjectForm() {
  const submitting = ref(false)
  const translating = ref(false)

  // ==================== INITIALIZERS ====================
  const createInitialForm = (isEdit = false): ProjectFormData => ({
    title: { en: '', ka: '', ru: '' },
    description: { en: '', ka: '', ru: '' },
    location: { en: '', ka: '', ru: '' },
    status: isEdit ? 'ongoing' : 'planning',
    year: new Date().getFullYear(),
    start_date: '',
    completion_date: '',
    base_price_per_sqm: undefined,
    is_active: true,
    is_featured: false,
    is_onHomepage: false,
    main_image: null,
    render_image: null,
    gallery_images: [],
    ...(isEdit && { existing_gallery_images: [] }),
  })

  const createInitialPreviews = (): ProjectPreviews => ({
    main_image: '',
    render_image: '',
    gallery_images: [],
  })

  // ==================== TRANSLATION ====================
  async function handleTranslate(form: ProjectFormData, fieldName: string, fromLang: string, toLang: string) {
    if (translating.value) return
    const field = form[fieldName as keyof ProjectFormData] as Record<string, string>
    const sourceText = field[fromLang]
    if (!sourceText) return
    try {
      translating.value = true
      field[toLang] = await Translator.translate(sourceText, fromLang, toLang)
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      translating.value = false
    }
  }

  // ==================== FORM DATA PREPARATION ====================
  async function prepareFormData(form: ProjectFormData, isEdit = false): Promise<FormData> {
    const formData = new FormData()
    if (isEdit) formData.append('_method', 'PUT')

    const langs = ['ka', 'en', 'ru']
    for (const lang of langs) {
      formData.append(`title[${lang}]`, form.title[lang])
      formData.append(`description[${lang}]`, form.description[lang])
      formData.append(`location[${lang}]`, form.location[lang])
    }

    formData.append('status', form.status)
    formData.append('year', String(form.year))
    formData.append('start_date', form.start_date)
    formData.append('completion_date', form.completion_date)
    if (form.base_price_per_sqm !== undefined && form.base_price_per_sqm !== null) {
      formData.append('base_price_per_sqm', String(form.base_price_per_sqm))
    }
    formData.append('is_active', form.is_active ? '1' : '0')
    formData.append('is_featured', form.is_featured ? '1' : '0')
    formData.append('is_onHomepage', form.is_onHomepage ? '1' : '0')

    if (form.main_image instanceof File) formData.append('main_image', form.main_image)
    if (form.render_image instanceof File) formData.append('render_image', form.render_image)

    if (isEdit && form.existing_gallery_images) {
      form.existing_gallery_images.forEach((imagePath, i) => {
        formData.append(`existing_gallery_images[${i}]`, imagePath)
      })
    }

    for (let i = 0; i < form.gallery_images.length; i++) {
      const file = form.gallery_images[i]
      if (file instanceof File) formData.append(`gallery_images[${i}]`, file)
    }

    return formData
  }

  // ==================== DATA LOADING ====================
  function loadProjectData(form: ProjectFormData, previews: ProjectPreviews, projectData: Record<string, unknown>, backendUrl: string) {
    form.title = { ka: String(projectData.title_ka || ''), en: String(projectData.title_en || ''), ru: String(projectData.title_ru || '') }
    form.description = { ka: String(projectData.description_ka || ''), en: String(projectData.description_en || ''), ru: String(projectData.description_ru || '') }
    form.location = { ka: String(projectData.location_ka || ''), en: String(projectData.location_en || ''), ru: String(projectData.location_ru || '') }
    form.status = String(projectData.status || 'ongoing')
    form.year = Number(projectData.year)

    if (projectData.start_date) {
      const startDate = new Date(String(projectData.start_date))
      form.start_date = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`
    } else { form.start_date = '' }

    if (projectData.completion_date) {
      const completionDate = new Date(String(projectData.completion_date))
      form.completion_date = `${completionDate.getFullYear()}-${String(completionDate.getMonth() + 1).padStart(2, '0')}`
    } else { form.completion_date = '' }

    form.is_active = Boolean(projectData.is_active)
    form.is_featured = Boolean(projectData.is_featured)
    form.is_onHomepage = Boolean(projectData.is_onHomepage)
    form.base_price_per_sqm = projectData.base_price_per_sqm ? Number(projectData.base_price_per_sqm) : undefined

    // Image previews
    if (projectData.main_image) {
      if (typeof projectData.main_image === 'object' && projectData.main_image !== null) {
        previews.main_image = (projectData.main_image as ImageData).url
      } else {
        const mainImageStr = String(projectData.main_image)
        previews.main_image = mainImageStr.startsWith('http') ? mainImageStr : backendUrl + mainImageStr
      }
    }

    if (projectData.render_image) {
      if (typeof projectData.render_image === 'object' && projectData.render_image !== null) {
        previews.render_image = (projectData.render_image as ImageData).url
      } else {
        const renderImageStr = String(projectData.render_image)
        previews.render_image = renderImageStr.startsWith('http') ? renderImageStr : backendUrl + renderImageStr
      }
    }
    
    if (projectData.gallery_images && Array.isArray(projectData.gallery_images) && projectData.gallery_images.length > 0) {
      previews.gallery_images = projectData.gallery_images.map((img: unknown) => {
        if (typeof img === 'object' && img !== null && 'url' in img) return (img as ImageData).url
        const imgStr = String(img)
        return imgStr.startsWith('http') ? imgStr : backendUrl + imgStr
      })
      
      if (form.existing_gallery_images) {
        form.existing_gallery_images = projectData.gallery_images.map((img: unknown) => {
          if (typeof img === 'object' && img !== null && 'id' in img) return String((img as ImageData).id)
          return String(img)
        })
      }
    }
  }

  // ==================== RETURN ====================
  return {
    submitting,
    translating,
    createInitialForm,
    createInitialPreviews,
    handleTranslate,
    handleFileChange,
    handleGalleryChange,
    removeGalleryImage,
    prepareFormData,
    loadProjectData,
  }
}
