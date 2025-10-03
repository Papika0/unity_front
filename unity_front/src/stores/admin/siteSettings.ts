import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToastStore } from '@/stores/ui/toast'
import api from '@/plugins/axios/api'
import type { ContactInfo } from '@/composables/useContactInfo'
import type { AboutInfo } from '@/composables/useAboutInfo'

interface ContactInfoFormData {
  email: string
  phone_numbers: Array<{
    number: string
    display: string
  }>
  google_maps_url: string
}

export interface AboutInfoFormData {
  stats: {
    successful_projects: string
    years_experience: string
    satisfied_clients: string
    client_satisfaction: string
  }
  philosophy_image_id?: number | null
}

export const useAdminSiteSettingsStore = defineStore('adminSiteSettings', () => {
  // State
  const contactInfo = ref<ContactInfo | null>(null)
  const aboutInfo = ref<AboutInfo | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  // Form state
  const showContactEditModal = ref(false)

  // Getters
  const hasContactInfo = computed(() => contactInfo.value !== null)
  const hasAboutInfo = computed(() => aboutInfo.value !== null)

  // Actions
  const loadContactInfo = async () => {
    try {
      loading.value = true
      error.value = ''

      const response = await api.get('/admin/contact-info')
      const data = response.data?.data
      contactInfo.value = data || null
    } catch (err) {
      console.error('Error loading contact info:', err)
      error.value =
        err instanceof Error ? err.message : 'კონტაქტის ინფორმაციის ჩატვირთვა ვერ მოხერხდა'
    } finally {
      loading.value = false
    }
  }

  const loadAboutInfo = async () => {
    try {
      loading.value = true
      error.value = ''

      const response = await api.get('/admin/about-info')
      const data = response.data?.data
      aboutInfo.value = data || null
    } catch (err) {
      console.error('Error loading about info:', err)
      error.value =
        err instanceof Error ? err.message : 'სტატისტიკის მონაცემების ჩატვირთვა ვერ მოხერხდა'
    } finally {
      loading.value = false
    }
  }

  const loadAllSettings = async () => {
    await Promise.all([loadContactInfo(), loadAboutInfo()])
  }

  const updateContactInfo = async (formData: ContactInfoFormData) => {
    const toastStore = useToastStore()

    try {
      saving.value = true
      error.value = ''

      const response = await api.put('/admin/contact-info', formData)

      if (!response.data) {
        throw new Error('კონტაქტის ინფორმაციის განახლება ვერ მოხერხდა')
      }

      const result = response.data
      contactInfo.value = result.data

      showContactEditModal.value = false
      toastStore.success('წარმატება', 'კონტაქტის ინფორმაცია წარმატებით განახლდა')

      // Reload data to show updated values
      await loadContactInfo()

      return result.data
    } catch (err) {
      console.error('Error updating contact info:', err)
      error.value =
        err instanceof Error ? err.message : 'კონტაქტის ინფორმაციის განახლება ვერ მოხერხდა'
      toastStore.error('შეცდომა', error.value)
      throw err
    } finally {
      saving.value = false
    }
  }

  const updateAboutInfo = async (formData: AboutInfoFormData) => {
    const toastStore = useToastStore()

    try {
      saving.value = true
      error.value = ''

      const response = await api.put('/admin/about-info', formData)

      if (!response.data) {
        throw new Error('სტატისტიკის მონაცემების განახლება ვერ მოხერხდა')
      }

      const result = response.data
      aboutInfo.value = result.data

      toastStore.success('წარმატება', 'სტატისტიკის მონაცემები წარმატებით განახლდა')

      // Reload data to show updated values
      await loadAboutInfo()

      return result.data
    } catch (err) {
      console.error('Error updating about info:', err)
      error.value =
        err instanceof Error ? err.message : 'სტატისტიკის მონაცემების განახლება ვერ მოხერხდა'
      toastStore.error('შეცდომა', error.value)
      throw err
    } finally {
      saving.value = false
    }
  }

  const openContactEditModal = () => {
    showContactEditModal.value = true
    error.value = ''
  }

  const closeModals = () => {
    showContactEditModal.value = false
    error.value = ''
  }

  return {
    // State
    contactInfo,
    aboutInfo,
    loading,
    saving,
    error,
    showContactEditModal,

    // Getters
    hasContactInfo,
    hasAboutInfo,

    // Actions
    loadContactInfo,
    loadAboutInfo,
    loadAllSettings,
    updateContactInfo,
    updateAboutInfo,
    openContactEditModal,
    closeModals,
  }
})

export type { ContactInfoFormData }
