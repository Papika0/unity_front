/**
 * useTranslationsList - Composable for translations list management
 * Handles CRUD operations, search, filtering, and pagination
 */

import { ref, reactive, onMounted, computed } from 'vue'
import {
  getTranslations,
  addTranslation,
  updateTranslation,
  deleteTranslation,
} from '@/services/translations'
import type { Translation } from '@/types'
import { Translator } from '@/utils/translator'
import { useTranslations } from '@/composables/useTranslations'

export function useTranslationsList() {
  const { t } = useTranslations()

  // ============================================
  // STATE
  // ============================================
  const translations = ref<Translation[]>([])
  const showCreateModal = ref(false)
  const showEditModal = ref(false)
  const saving = ref(false)
  const translating = ref(false)
  const loading = ref(false)
  const searchQuery = ref('')
  const selectedGroup = ref('')
  const currentPage = ref(1)
  const totalPages = ref(1)
  const editingTranslation = ref<Translation | null>(null)

  // ============================================
  // CONSTANTS
  // ============================================
  const groupOptions = computed(() => [
    { value: '', label: t('admin.translations.all_groups'), icon: '📁' },
    { value: 'header', label: t('admin.translations.groups.header'), icon: '🧭' },
    { value: 'footer', label: t('admin.translations.groups.footer'), icon: '🔻' },
    { value: 'home', label: t('admin.translations.groups.home'), icon: '🏠' },
    { value: 'about', label: t('admin.translations.groups.about'), icon: 'ℹ️' },
    { value: 'projects', label: t('admin.translations.groups.projects'), icon: '🏗️' },
    { value: 'gallery', label: t('admin.translations.groups.gallery'), icon: '🖼️' },
    { value: 'faq', label: t('admin.translations.groups.faq'), icon: '❓' },
    { value: 'contact', label: t('admin.translations.groups.contact'), icon: '📞' },
    { value: 'buttons', label: t('admin.translations.groups.buttons'), icon: '🔘' },
    { value: 'messages', label: t('admin.translations.groups.messages'), icon: '💬' },
    { value: 'errors', label: t('admin.translations.groups.errors'), icon: '⚠️' },
    { value: 'admin', label: t('admin.translations.groups.admin'), icon: '👨‍💼' },
    { value: 'auth', label: t('admin.translations.groups.auth'), icon: '🔐' },
    { value: 'testimonials', label: t('admin.translations.groups.testimonials'), icon: '💭' },
  ])

  // ============================================
  // FORM STATE
  // ============================================
  const translationForm = reactive({
    key: '',
    text_en: '',
    text_ka: '',
    text_ru: '',
    group: '',
    active: true,
  })

  // ============================================
  // DATA LOADING
  // ============================================
  const loadTranslations = async () => {
    try {
      loading.value = true
      const response = await getTranslations(
        currentPage.value,
        searchQuery.value,
        selectedGroup.value,
      )

      // Handle different API response structures
      if (response.data.data && Array.isArray(response.data.data)) {
        // Laravel paginated response structure
        translations.value = response.data.data
        if (response.data.meta) {
          totalPages.value = response.data.meta.last_page || 1
          currentPage.value = response.data.meta.current_page || 1
        } else {
          totalPages.value = Math.ceil((response.data.total || translations.value.length) / 15)
        }
      } else if (Array.isArray(response.data)) {
        // Simple array response
        translations.value = response.data
        totalPages.value = 1
      } else {
        // Fallback
        translations.value = []
        totalPages.value = 1
      }
    } catch (error) {
      console.error('Error loading translations:', error)
      translations.value = []
      totalPages.value = 1
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // SEARCH & FILTER
  // ============================================
  let searchTimeout: ReturnType<typeof setTimeout> | undefined

  const debounceSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      currentPage.value = 1
      loadTranslations()
    }, 300)
  }

  const handleGroupFilter = () => {
    currentPage.value = 1
    loadTranslations()
  }

  const clearGroupFilter = () => {
    selectedGroup.value = ''
    currentPage.value = 1
    loadTranslations()
  }

  // ============================================
  // TRANSLATION ACTIONS
  // ============================================
  const translateText = async (fromLang: string, toLang: string) => {
    if (translating.value) return

    const sourceText = translationForm[`text_${fromLang}` as keyof typeof translationForm]
    if (!sourceText || typeof sourceText !== 'string') return

    try {
      translating.value = true
      const translatedText = await Translator.translate(sourceText, fromLang, toLang)

      if (toLang === 'en') {
        translationForm.text_en = translatedText
      } else if (toLang === 'ru') {
        translationForm.text_ru = translatedText
      }
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      translating.value = false
    }
  }

  const translateBoth = async () => {
    if (translating.value || !translationForm.text_ka) return

    try {
      translating.value = true

      const [englishTranslation, russianTranslation] = await Promise.all([
        Translator.translate(translationForm.text_ka, 'ka', 'en'),
        Translator.translate(translationForm.text_ka, 'ka', 'ru'),
      ])

      translationForm.text_en = englishTranslation
      translationForm.text_ru = russianTranslation
    } catch (error) {
      console.error('Translation failed:', error)
    } finally {
      translating.value = false
    }
  }

  // ============================================
  // CRUD OPERATIONS
  // ============================================
  const saveTranslation = async () => {
    try {
      saving.value = true

      const formData = {
        key: translationForm.key,
        text: {
          en: translationForm.text_en,
          ka: translationForm.text_ka,
          ru: translationForm.text_ru,
        },
        group: translationForm.group,
        active: translationForm.active,
      }

      if (showEditModal.value && editingTranslation.value) {
        await updateTranslation(editingTranslation.value.id, formData)
      } else {
        await addTranslation(formData)
      }

      await loadTranslations()
      closeModal()
    } catch (error) {
      console.error('Error saving translation:', error)
    } finally {
      saving.value = false
    }
  }

  const editTranslation = (translation: Translation) => {
    editingTranslation.value = translation
    translationForm.key = translation.key
    translationForm.text_en = translation.text_en
    translationForm.text_ka = translation.text_ka
    translationForm.text_ru = translation.text_ru || ''
    translationForm.group = translation.group || ''
    translationForm.active = translation.active === 1
    showEditModal.value = true
  }

  const deleteTranslationConfirm = async (translation: Translation) => {
    if (confirm(t('admin.common.confirm_delete_named', { name: translation.key }))) {
      try {
        await deleteTranslation(translation.id)
        await loadTranslations()
      } catch (error) {
        console.error('Error deleting translation:', error)
      }
    }
  }

  // ============================================
  // MODAL MANAGEMENT
  // ============================================
  const closeModal = () => {
    showCreateModal.value = false
    showEditModal.value = false
    editingTranslation.value = null
    translationForm.key = ''
    translationForm.text_en = ''
    translationForm.text_ka = ''
    translationForm.text_ru = ''
    translationForm.group = ''
    translationForm.active = true
  }

  const updateForm = (newForm: typeof translationForm) => {
    Object.assign(translationForm, newForm)
  }

  // ============================================
  // PAGINATION
  // ============================================
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
      loadTranslations()
    }
  }

  const previousPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
      loadTranslations()
    }
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      loadTranslations()
    }
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(() => {
    loadTranslations()
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // State
    translations,
    showCreateModal,
    showEditModal,
    saving,
    translating,
    loading,
    searchQuery,
    selectedGroup,
    currentPage,
    totalPages,
    groupOptions,
    translationForm,

    // Actions
    loadTranslations,
    debounceSearch,
    handleGroupFilter,
    clearGroupFilter,
    translateText,
    translateBoth,
    saveTranslation,
    editTranslation,
    deleteTranslationConfirm,
    closeModal,
    updateForm,
    nextPage,
    previousPage,
    goToPage,
  }
}
