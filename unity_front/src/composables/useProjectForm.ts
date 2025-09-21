import { ref } from 'vue'
import { Translator } from '@/utils/translator'

export interface ProjectFormData {
  title: Record<string, string>
  description: Record<string, string>
  location: Record<string, string>
  status: string
  year: number
  start_date: string
  completion_date: string
  is_active: boolean
  is_featured: boolean
  is_onHomepage: boolean
  main_image: File | null
  render_image: File | null
  gallery_images: File[]
  existing_gallery_images?: string[] // Only used in edit mode
}

export interface ProjectPreviews {
  main_image: string
  render_image: string
  gallery_images: string[]
}

export function useProjectForm() {
  const submitting = ref(false)
  const translating = ref(false)

  const createInitialForm = (isEdit = false): ProjectFormData => ({
    title: { en: '', ka: '', ru: '' },
    description: { en: '', ka: '', ru: '' },
    location: { en: '', ka: '', ru: '' },
    status: isEdit ? 'ongoing' : 'planning',
    year: new Date().getFullYear(),
    start_date: '',
    completion_date: '',
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

  async function handleTranslate(
    form: ProjectFormData,
    fieldName: string,
    fromLang: string,
    toLang: string,
  ) {
    if (translating.value) return

    const field = form[fieldName as keyof ProjectFormData] as Record<string, string>
    const sourceText = field[fromLang]
    if (!sourceText) return

    try {
      translating.value = true
      const translatedText = await Translator.translate(sourceText, fromLang, toLang)
      field[toLang] = translatedText
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      translating.value = false
    }
  }

  function handleFileChange(
    form: ProjectFormData,
    previews: ProjectPreviews,
    fieldName: 'main_image' | 'render_image',
    files: FileList | null,
  ) {
    if (files && files[0]) {
      const file = files[0]
      form[fieldName] = file

      // Create preview
      const previewUrl = URL.createObjectURL(file)
      previews[fieldName] = previewUrl
    }
  }

  function handleGalleryChange(
    form: ProjectFormData,
    previews: ProjectPreviews,
    files: FileList | null,
    isEdit = false,
  ) {
    if (files) {
      const fileArray = Array.from(files)
      // Append new files to existing gallery images instead of replacing
      form.gallery_images = [...form.gallery_images, ...fileArray]

      if (isEdit && form.existing_gallery_images) {
        // For edit mode: combine existing images with new file previews
        const newFilePreviews = form.gallery_images.map((file) => URL.createObjectURL(file))
        previews.gallery_images = [...form.existing_gallery_images, ...newFilePreviews]
      } else {
        // For add mode: create previews for all files
        previews.gallery_images = form.gallery_images.map((file) => URL.createObjectURL(file))
      }
    }
  }

  function removeGalleryImage(
    form: ProjectFormData,
    previews: ProjectPreviews,
    index: number,
    isEdit = false,
  ) {
    if (isEdit && form.existing_gallery_images) {
      if (index < form.existing_gallery_images.length) {
        // Removing an existing image
        form.existing_gallery_images.splice(index, 1)
      } else {
        // Removing a new image
        const newImageIndex = index - form.existing_gallery_images.length
        form.gallery_images.splice(newImageIndex, 1)
      }
      // Rebuild previews for edit mode
      const newFilePreviews = form.gallery_images.map((file) => URL.createObjectURL(file))
      previews.gallery_images = [...form.existing_gallery_images, ...newFilePreviews]
    } else {
      // Add mode: simple removal
      form.gallery_images.splice(index, 1)
      previews.gallery_images = form.gallery_images.map((file) => URL.createObjectURL(file))
    }
  }

  async function prepareFormData(form: ProjectFormData, isEdit = false): Promise<FormData> {
    const formData = new FormData()

    // Add method override for PUT request in edit mode
    if (isEdit) {
      formData.append('_method', 'PUT')
    }

    // Add translations
    const langs = ['ka', 'en', 'ru']
    for (const lang of langs) {
      formData.append(`title[${lang}]`, form.title[lang])
      formData.append(`description[${lang}]`, form.description[lang])
      formData.append(`location[${lang}]`, form.location[lang])
    }

    // Add other fields
    formData.append('status', form.status)
    formData.append('year', String(form.year))
    formData.append('start_date', form.start_date)
    formData.append('completion_date', form.completion_date)
    formData.append('is_active', form.is_active ? '1' : '0')
    formData.append('is_featured', form.is_featured ? '1' : '0')
    formData.append('is_onHomepage', form.is_onHomepage ? '1' : '0')

    // Append files (compression is handled by FileUpload component)
    if (form.main_image instanceof File) {
      formData.append('main_image', form.main_image)
    }

    if (form.render_image instanceof File) {
      formData.append('render_image', form.render_image)
    }

    // Handle existing gallery images in edit mode
    if (isEdit && form.existing_gallery_images) {
      form.existing_gallery_images.forEach((imagePath, i) => {
        formData.append(`existing_gallery_images[${i}]`, imagePath)
      })
    }

    // Append new gallery files (compression is handled by FileUpload component)
    for (let i = 0; i < form.gallery_images.length; i++) {
      const file = form.gallery_images[i]
      if (file instanceof File) {
        formData.append(`gallery_images[${i}]`, file)
      }
    }

    return formData
  }

  function loadProjectData(
    form: ProjectFormData,
    previews: ProjectPreviews,
    projectData: Record<string, unknown>,
    backendUrl: string,
  ) {
    // Translations - ensure all fields have values
    form.title = {
      ka: String(projectData.title_ka || ''),
      en: String(projectData.title_en || ''),
      ru: String(projectData.title_ru || ''),
    }
    form.description = {
      ka: String(projectData.description_ka || ''),
      en: String(projectData.description_en || ''),
      ru: String(projectData.description_ru || ''),
    }
    form.location = {
      ka: String(projectData.location_ka || ''),
      en: String(projectData.location_en || ''),
      ru: String(projectData.location_ru || ''),
    }

    // Other fields
    form.status = String(projectData.status || 'ongoing')
    form.year = Number(projectData.year)
    form.start_date = String(projectData.start_date || '')
    form.completion_date = String(projectData.completion_date || '')
    form.is_active = Boolean(projectData.is_active)
    form.is_featured = Boolean(projectData.is_featured)
    form.is_onHomepage = Boolean(projectData.is_onHomepage)

    // Set image previews
    if (projectData.main_image) {
      const mainImageStr = String(projectData.main_image)
      if (typeof mainImageStr === 'string' && mainImageStr.startsWith('http')) {
        previews.main_image = mainImageStr
      } else {
        previews.main_image = backendUrl + mainImageStr
      }
    }

    if (projectData.render_image) {
      if (
        typeof projectData.render_image === 'string' &&
        projectData.render_image.startsWith('http')
      ) {
        previews.render_image = String(projectData.render_image)
      } else {
        previews.render_image = backendUrl + String(projectData.render_image)
      }
    }
    if (
      projectData.gallery_images &&
      Array.isArray(projectData.gallery_images) &&
      projectData.gallery_images.length > 0
    ) {
      previews.gallery_images = (projectData.gallery_images as string[]).slice()
      if (form.existing_gallery_images) {
        form.existing_gallery_images = (projectData.gallery_images as string[]).slice()
      }
    }
  }

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
