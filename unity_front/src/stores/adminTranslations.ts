import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getTranslations,
  addTranslation,
  updateTranslation,
  deleteTranslation,
} from '@/services/translations'
import type { Translation, PaginatedResponse } from '@/types'

export const useAdminTranslationsStore = defineStore('adminTranslations', () => {
  // State
  const translations = ref<Translation[]>([])
  const currentTranslation = ref<Translation | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const searchQuery = ref('')

  // Pagination
  const currentPage = ref(1)
  const totalPages = ref(1)
  const perPage = ref(10)
  const totalItems = ref(0)

  // Getters
  const translationsCount = computed(() => totalItems.value)

  const hasTranslations = computed(() => translations.value.length > 0)

  const canLoadMore = computed(() => currentPage.value < totalPages.value)

  // Actions
  const loadTranslations = async (page: number = 1, search: string = '') => {
    try {
      loading.value = true
      error.value = ''

      const response = await getTranslations(page, search)
      const data = response.data.data || response.data

      if (data.data) {
        // Paginated response
        translations.value = data.data
        currentPage.value = data.current_page || page
        totalPages.value = data.last_page || 1
        perPage.value = data.per_page || 10
        totalItems.value = data.total || data.data.length
      } else {
        // Simple array response
        translations.value = data
        totalItems.value = data.length
        currentPage.value = 1
        totalPages.value = 1
      }

      searchQuery.value = search
    } catch (err: any) {
      error.value = err.response?.data?.message || 'თარგმანების ჩატვირთვა ვერ მოხერხდა'
      console.error('Error loading translations:', err)
    } finally {
      loading.value = false
    }
  }

  const addNewTranslation = async (translationData: { key: string; en: string; ka: string }) => {
    try {
      saving.value = true
      error.value = ''

      const response = await addTranslation(translationData)
      const newTranslation = response.data.data || response.data

      translations.value.unshift(newTranslation)
      totalItems.value += 1

      return { success: true, translation: newTranslation }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'თარგმანის დამატება ვერ მოხერხდა'
      console.error('Error creating translation:', err)
      return { success: false, error: error.value }
    } finally {
      saving.value = false
    }
  }

  const editTranslation = async (
    id: number,
    translationData: {
      key: string
      en: string
      ka: string
    },
  ) => {
    try {
      saving.value = true
      error.value = ''

      const response = await updateTranslation(id, translationData)
      const updatedTranslation = response.data.data || response.data

      const index = translations.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        translations.value[index] = updatedTranslation
      }

      if (currentTranslation.value?.id === id) {
        currentTranslation.value = updatedTranslation
      }

      return { success: true, translation: updatedTranslation }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'თარგმანის განახლება ვერ მოხერხდა'
      console.error('Error updating translation:', err)
      return { success: false, error: error.value }
    } finally {
      saving.value = false
    }
  }

  const removeTranslation = async (id: number) => {
    try {
      saving.value = true
      error.value = ''

      await deleteTranslation(id)

      translations.value = translations.value.filter((t) => t.id !== id)
      totalItems.value -= 1

      if (currentTranslation.value?.id === id) {
        currentTranslation.value = null
      }

      return { success: true }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'თარგმანის წაშლა ვერ მოხერხდა'
      console.error('Error deleting translation:', err)
      return { success: false, error: error.value }
    } finally {
      saving.value = false
    }
  }

  const searchTranslations = async (query: string) => {
    searchQuery.value = query
    currentPage.value = 1
    await loadTranslations(1, query)
  }

  const loadNextPage = async () => {
    if (canLoadMore.value) {
      await loadTranslations(currentPage.value + 1, searchQuery.value)
    }
  }

  const loadPreviousPage = async () => {
    if (currentPage.value > 1) {
      await loadTranslations(currentPage.value - 1, searchQuery.value)
    }
  }

  const goToPage = async (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      await loadTranslations(page, searchQuery.value)
    }
  }

  const setCurrentTranslation = (translation: Translation) => {
    currentTranslation.value = translation
  }

  const clearCurrentTranslation = () => {
    currentTranslation.value = null
  }

  const clearError = () => {
    error.value = ''
  }

  const refreshTranslations = async () => {
    await loadTranslations(currentPage.value, searchQuery.value)
  }

  // Initialize
  const initialize = async () => {
    await loadTranslations()
  }

  return {
    // State
    translations,
    currentTranslation,
    loading,
    saving,
    error,
    searchQuery,
    currentPage,
    totalPages,
    perPage,
    totalItems,

    // Getters
    translationsCount,
    hasTranslations,
    canLoadMore,

    // Actions
    loadTranslations,
    addNewTranslation,
    editTranslation,
    removeTranslation,
    searchTranslations,
    loadNextPage,
    loadPreviousPage,
    goToPage,
    setCurrentTranslation,
    clearCurrentTranslation,
    clearError,
    refreshTranslations,
    initialize,
  }
})
