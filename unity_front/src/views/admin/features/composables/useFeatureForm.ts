/**
 * useFeatureForm - Shared composable for feature create/edit operations
 * Handles form state, validation, translation, and submission
 */

import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { featuresApi } from '@/services/featuresApi'
import { Translator } from '@/utils/translator'

export interface FeatureFormData {
  name: string
  title: {
    ka: string
    en: string
    ru: string
  }
  description: {
    ka: string
    en: string
    ru: string
  }
  icon: string
  color: string
  keywords: string[]
  is_active: boolean
  sort_order: number
}

export function useFeatureForm(mode: 'create' | 'edit' = 'create') {
  // ============================================
  // STORES & ROUTER
  // ============================================
  const router = useRouter()
  const route = useRoute()

  // ============================================
  // STATE
  // ============================================
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const isTranslating = ref(false)
  const error = ref<string | null>(null)

  const form = reactive<FeatureFormData>({
    name: '',
    title: {
      ka: '',
      en: '',
      ru: '',
    },
    description: {
      ka: '',
      en: '',
      ru: '',
    },
    icon: '',
    color: 'from-blue-500 to-cyan-500',
    keywords: [''],
    is_active: true,
    sort_order: 0,
  })

  const colorOptions = [
    { value: 'from-blue-500 to-cyan-500', label: 'Blue to Cyan' },
    { value: 'from-green-500 to-emerald-500', label: 'Green to Emerald' },
    { value: 'from-amber-500 to-orange-500', label: 'Amber to Orange' },
    { value: 'from-purple-500 to-pink-500', label: 'Purple to Pink' },
    { value: 'from-red-500 to-rose-500', label: 'Red to Rose' },
    { value: 'from-indigo-500 to-blue-500', label: 'Indigo to Blue' },
    { value: 'from-gray-500 to-slate-500', label: 'Gray to Slate' },
    { value: 'from-slate-600 to-gray-700', label: 'Dark Slate (Metro)' },
    { value: 'from-teal-500 to-cyan-500', label: 'Teal to Cyan' },
  ]

  // ============================================
  // ACTIONS
  // ============================================
  const loadFeature = async () => {
    if (mode !== 'edit') return

    isLoading.value = true
    error.value = null

    try {
      const featureId = parseInt(route.params.id as string)

      if (isNaN(featureId)) {
        throw new Error('არასწორი ფუნქციის ID')
      }

      const feature = await featuresApi.adminGetById(featureId)

      // Populate form
      form.name = feature.name
      form.title = {
        ka: feature.title.ka || '',
        en: feature.title.en || '',
        ru: feature.title.ru || '',
      }
      form.description = {
        ka: feature.description.ka || '',
        en: feature.description.en || '',
        ru: feature.description.ru || '',
      }
      form.icon = feature.icon
      form.color = feature.color
      form.keywords = [...feature.keywords]
      form.is_active = feature.is_active
      form.sort_order = feature.sort_order
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load feature'
      console.error('Failed to load feature:', err)
    } finally {
      isLoading.value = false
    }
  }

  const addKeyword = () => {
    form.keywords.push('')
  }

  const removeKeyword = (index: number) => {
    if (form.keywords.length > 1) {
      form.keywords.splice(index, 1)
    }
  }

  const onIconSelected = (icon: { color?: string }) => {
    if (icon && icon.color) {
      form.color = icon.color
    }
  }

  const translateField = async (field: 'title' | 'description', fromLang: string, toLang: string) => {
    const sourceText = form[field][fromLang as keyof typeof form.title]
    if (sourceText) {
      isTranslating.value = true
      try {
        const translatedText = await Translator.translate(sourceText, fromLang, toLang)
        form[field][toLang as keyof typeof form.title] = translatedText
      } catch (err) {
        console.error('Translation failed:', err)
        form[field][toLang as keyof typeof form.title] = sourceText
      } finally {
        isTranslating.value = false
      }
    }
  }

  const submitForm = async () => {
    isSubmitting.value = true

    try {
      const filteredKeywords = form.keywords.filter((keyword) => keyword.trim() !== '')

      if (filteredKeywords.length === 0) {
        alert('გთხოვთ, დაამატეთ მინიმუმ ერთი საკვანძო სიტყვა')
        return
      }

      const featureData = {
        ...form,
        keywords: filteredKeywords,
      }

      if (mode === 'edit') {
        const featureId = parseInt(route.params.id as string)
        await featuresApi.update(featureId, featureData)
      } else {
        await featuresApi.create(featureData)
      }

      router.push('/admin/features')
    } catch (err: unknown) {
      console.error('Failed to save feature:', err)
      
      const error = err as { response?: { status?: number; data?: { errors?: Record<string, string[]>; message?: string } }; message?: string }

      if (error.response?.status === 401 || error.message?.includes('Unauthenticated')) {
        alert('თქვენ არ ხართ ავტორიზებული. გთხოვთ, კვლავ შეხვიდეთ სისტემაში.')
        router.push('/admin/login')
        return
      }

      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors
        let errorMessage = 'შეცდომა ვალიდაციაში:\n'

        Object.keys(errors).forEach((field) => {
          errorMessage += `• ${errors[field].join(', ')}\n`
        })

        alert(errorMessage)
        return
      }

      alert('ფუნქციის შენახვა ვერ მოხერხდა. გთხოვთ, კვლავ სცადეთ.')
    } finally {
      isSubmitting.value = false
    }
  }

  // ============================================
  // RETURN
  // ============================================
  return {
    // State
    form,
    isLoading,
    isSubmitting,
    isTranslating,
    error,
    colorOptions,

    // Actions
    loadFeature,
    addKeyword,
    removeKeyword,
    onIconSelected,
    translateField,
    submitForm,
  }
}
