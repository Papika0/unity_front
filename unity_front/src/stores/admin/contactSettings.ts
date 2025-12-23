import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ContactSettings } from '@/services/contactApi'
import { contactApi } from '@/services/contactApi'

interface ValidationError {
  field: string
  message: string
}

interface TabConfig {
  id: string
  name: string
  icon: string
}

export const useContactSettingsAdminStore = defineStore('contactSettingsAdmin', () => {
  // ==================== STATE ====================
  const data = ref<ContactSettings | null>(null)
  const originalData = ref<ContactSettings | null>(null)
  const errors = ref<ValidationError[]>([])
  const isDirty = ref(false)
  const currentTab = ref('contact_info')
  const isLoading = ref(false)
  const isSaving = ref(false)
  const lastUpdated = ref<Date | null>(null)

  // ==================== GETTERS ====================
  const hasErrors = computed(() => errors.value.length > 0)

  const canSave = computed(
    () =>
      isDirty.value &&
      errors.value.length === 0 &&
      !isSaving.value &&
      data.value !== null
  )

  const availableTabs = computed((): TabConfig[] => [
    { id: 'contact_info', name: 'Contact Information', icon: 'contact_mail' },
    { id: 'social_links', name: 'Social Links', icon: 'share' },
    { id: 'map_settings', name: 'Map Configuration', icon: 'map' },
    { id: 'form_subjects', name: 'Form Subjects', icon: 'list' },
    { id: 'faqs', name: 'FAQ Management', icon: 'help' },
    { id: 'office_days', name: 'Office Schedule', icon: 'schedule' },
  ])

  const getFieldError = computed(() => (field: string) => {
    return errors.value.find((error) => error.field === field)?.message
  })

  // ==================== ACTIONS ====================
  const setCurrentTab = (tabId: string) => {
    currentTab.value = tabId
  }

  const markDirty = () => {
    isDirty.value = true
    clearFieldErrors()
  }

  const addError = (field: string, message: string) => {
    const existingIndex = errors.value.findIndex((e) => e.field === field)
    if (existingIndex >= 0) {
      errors.value[existingIndex].message = message
    } else {
      errors.value.push({ field, message })
    }
  }

  const clearFieldErrors = (field?: string) => {
    if (field) {
      errors.value = errors.value.filter((e) => e.field !== field)
    } else {
      errors.value = errors.value.filter((e) => e.field === 'general')
    }
  }

  const setValidationErrors = (validationErrors: Record<string, string[]>) => {
    errors.value = []
    Object.entries(validationErrors).forEach(([field, messages]) => {
      messages.forEach((message) => {
        addError(field, message)
      })
    })
  }

  const resetForm = () => {
    if (originalData.value) {
      data.value = JSON.parse(JSON.stringify(originalData.value))
    }
    errors.value = []
    isDirty.value = false
  }

  const loadSettings = async () => {
    isLoading.value = true
    errors.value = []

    try {
      const response = await contactApi.getAdminContactSettings()
      // Admin endpoint returns data directly, not wrapped in contact_settings
      const settings = { ...response.data.data }

      // Ensure complete contact_info structure
      if (!settings.contact_info) {
        settings.contact_info = {}
      }

      // Ensure all contact_info fields exist with proper structure
      const defaultContactInfo = {
        address: {
          value: { ka: '', en: '', ru: '' },
          subtitle: { ka: '', en: '', ru: '' },
        },
        phone: {
          value: '',
          subtitle: { ka: '', en: '', ru: '' },
        },
        phone2: {
          value: '',
          subtitle: { ka: '', en: '', ru: '' },
        },
        email: {
          value: '',
          subtitle: { ka: '', en: '', ru: '' },
        },
        hours: {
          value: { ka: '', en: '', ru: '' },
          subtitle: { ka: '', en: '', ru: '' },
        },
      }

      // Merge default structure with existing data
      for (const [key, defaultValue] of Object.entries(defaultContactInfo)) {
        if (!settings.contact_info[key]) {
          settings.contact_info[key] = defaultValue
        }
      }

      // Ensure social_links exists
      if (!settings.social_links) {
        settings.social_links = {
          facebook: '',
          instagram: '',
        }
      }

      // Ensure map_settings exists
      if (!settings.map_settings) {
        settings.map_settings = {
          latitude: 41.7151,
          longitude: 44.8271,
          zoom: 15,
        }
      }

      // Ensure office_days arrays are initialized
      if (!settings.office_days) {
        settings.office_days = {
          working: [],
          weekend: [],
        }
      }

      // Ensure form_subjects and faqs are arrays
      if (!Array.isArray(settings.form_subjects)) {
        settings.form_subjects = []
      }
      if (!Array.isArray(settings.faqs)) {
        settings.faqs = []
      }

      data.value = settings
      originalData.value = JSON.parse(JSON.stringify(settings))
      isDirty.value = false
      lastUpdated.value = new Date()
    } catch (error) {
      addError('general', 'Failed to load contact settings')
      console.error('Failed to load contact settings:', error)
    } finally {
      isLoading.value = false
    }
  }

  const saveSettings = async (): Promise<boolean> => {
    if (!canSave.value || !data.value) return false

    isSaving.value = true
    errors.value = []

    try {
      await contactApi.updateContactSettings(data.value)

      // Update original data to current data
      originalData.value = JSON.parse(JSON.stringify(data.value))
      isDirty.value = false
      lastUpdated.value = new Date()
      return true
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: { errors?: Record<string, string[]> } }
        }
        if (axiosError.response?.data?.errors) {
          setValidationErrors(axiosError.response.data.errors)
        } else {
          addError('general', 'Failed to save contact settings')
        }
      } else {
        addError('general', 'Failed to save contact settings')
      }
      console.error('Failed to save contact settings:', error)
      return false
    } finally {
      isSaving.value = false
    }
  }

  // ==================== RESET ====================
  const $reset = () => {
    data.value = null
    originalData.value = null
    errors.value = []
    isDirty.value = false
    currentTab.value = 'contact_info'
    isLoading.value = false
    isSaving.value = false
    lastUpdated.value = null
  }

  return {
    // State
    data,
    originalData,
    errors,
    isDirty,
    currentTab,
    isLoading,
    isSaving,
    lastUpdated,
    // Getters
    hasErrors,
    canSave,
    availableTabs,
    getFieldError,
    // Actions
    setCurrentTab,
    markDirty,
    addError,
    clearFieldErrors,
    setValidationErrors,
    resetForm,
    loadSettings,
    saveSettings,
    $reset,
  }
})
