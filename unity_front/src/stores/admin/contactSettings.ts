import { defineStore } from 'pinia'
import type { ContactSettings } from '@/services/contactApi'
import { contactApi } from '@/services/contactApi'

interface ValidationError {
  field: string
  message: string
}

interface StoreState {
  data: ContactSettings | null
  originalData: ContactSettings | null
  errors: ValidationError[]
  isDirty: boolean
  currentTab: string
  isLoading: boolean
  isSaving: boolean
  lastUpdated: Date | null
}

export const useContactSettingsAdminStore = defineStore('contactSettingsAdmin', {
  state: (): StoreState => ({
    data: null,
    originalData: null,
    errors: [],
    isDirty: false,
    currentTab: 'contact_info',
    isLoading: false,
    isSaving: false,
    lastUpdated: null,
  }),

  getters: {
    hasErrors: (state) => state.errors.length > 0,
    canSave: (state) =>
      state.isDirty && state.errors.length === 0 && !state.isSaving && state.data !== null,

    availableTabs(): Array<{ id: string; name: string; icon: string }> {
      return [
        { id: 'contact_info', name: 'Contact Information', icon: 'contact_mail' },
        { id: 'social_links', name: 'Social Links', icon: 'share' },
        { id: 'map_settings', name: 'Map Configuration', icon: 'map' },
        { id: 'form_subjects', name: 'Form Subjects', icon: 'list' },
        { id: 'faqs', name: 'FAQ Management', icon: 'help' },
        { id: 'office_days', name: 'Office Schedule', icon: 'schedule' },
      ]
    },

    getFieldError: (state) => (field: string) => {
      return state.errors.find((error) => error.field === field)?.message
    },
  },

  actions: {
    setCurrentTab(tabId: string) {
      this.currentTab = tabId
    },

    markDirty() {
      this.isDirty = true
      this.clearFieldErrors()
    },

    addError(field: string, message: string) {
      const existingIndex = this.errors.findIndex((e) => e.field === field)
      if (existingIndex >= 0) {
        this.errors[existingIndex].message = message
      } else {
        this.errors.push({ field, message })
      }
    },

    clearFieldErrors(field?: string) {
      if (field) {
        this.errors = this.errors.filter((e) => e.field !== field)
      } else {
        this.errors = this.errors.filter((e) => e.field === 'general')
      }
    },

    setValidationErrors(errors: Record<string, string[]>) {
      this.errors = []
      Object.entries(errors).forEach(([field, messages]) => {
        messages.forEach((message) => {
          this.addError(field, message)
        })
      })
    },

    resetForm() {
      if (this.originalData) {
        this.data = JSON.parse(JSON.stringify(this.originalData))
      }
      this.errors = []
      this.isDirty = false
    },

    async loadSettings() {
      this.isLoading = true
      this.errors = []

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

        this.data = settings
        this.originalData = JSON.parse(JSON.stringify(settings))
        this.isDirty = false
        this.lastUpdated = new Date()
      } catch (error) {
        this.addError('general', 'Failed to load contact settings')
        console.error('Failed to load contact settings:', error)
      } finally {
        this.isLoading = false
      }
    },

    async saveSettings(): Promise<boolean> {
      if (!this.canSave || !this.data) return false

      this.isSaving = true
      this.errors = []

      try {
        await contactApi.updateContactSettings(this.data)

        // Update original data to current data
        this.originalData = JSON.parse(JSON.stringify(this.data))
        this.isDirty = false
        this.lastUpdated = new Date()
        return true
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as {
            response?: { data?: { errors?: Record<string, string[]> } }
          }
          if (axiosError.response?.data?.errors) {
            this.setValidationErrors(axiosError.response.data.errors)
          } else {
            this.addError('general', 'Failed to save contact settings')
          }
        } else {
          this.addError('general', 'Failed to save contact settings')
        }
        console.error('Failed to save contact settings:', error)
        return false
      } finally {
        this.isSaving = false
      }
    },
  },
})
