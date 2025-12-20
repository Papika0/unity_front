import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToastStore } from '@/stores/ui/toast'
import { adminContactInfoApi, type ContactInfoFormData } from '@/services/adminContactInfoApi'
import { adminAboutInfoApi, type AboutInfoFormData } from '@/services/adminAboutInfoApi'
import type { ContactInfo } from '@/composables/useContactInfo'
import type { AboutInfo } from '@/composables/useAboutInfo'

export const useAdminSiteSettingsStore = defineStore('adminSiteSettings', () => {
  // ==================== STATE ====================
  const contactInfo = ref<ContactInfo | null>(null)
  const aboutInfo = ref<AboutInfo | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const showContactEditModal = ref(false)

  // ==================== GETTERS ====================
  const hasContactInfo = computed(() => contactInfo.value !== null)
  const hasAboutInfo = computed(() => aboutInfo.value !== null)

  // ==================== ACTIONS ====================
  const loadContactInfo = async () => {
    try {
      loading.value = true
      error.value = ''
      contactInfo.value = await adminContactInfoApi.get()
    } catch (err) {
      console.error('Error loading contact info:', err)
      error.value = err instanceof Error ? err.message : 'კონტაქტის ინფორმაციის ჩატვირთვა ვერ მოხერხდა'
    } finally {
      loading.value = false
    }
  }

  const loadAboutInfo = async () => {
    try {
      loading.value = true
      error.value = ''
      aboutInfo.value = await adminAboutInfoApi.get()
    } catch (err) {
      console.error('Error loading about info:', err)
      error.value = err instanceof Error ? err.message : 'სტატისტიკის მონაცემების ჩატვირთვა ვერ მოხერხდა'
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

      contactInfo.value = await adminContactInfoApi.update(formData)
      showContactEditModal.value = false
      toastStore.success('წარმატება', 'კონტაქტის ინფორმაცია წარმატებით განახლდა')

      return contactInfo.value
    } catch (err) {
      console.error('Error updating contact info:', err)
      error.value = err instanceof Error ? err.message : 'კონტაქტის ინფორმაციის განახლება ვერ მოხერხდა'
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

      aboutInfo.value = await adminAboutInfoApi.update(formData)
      toastStore.success('წარმატება', 'სტატისტიკის მონაცემები წარმატებით განახლდა')

      return aboutInfo.value
    } catch (err) {
      console.error('Error updating about info:', err)
      error.value = err instanceof Error ? err.message : 'სტატისტიკის მონაცემების განახლება ვერ მოხერხდა'
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

  // ==================== RESET ====================
  const $reset = () => {
    contactInfo.value = null
    aboutInfo.value = null
    loading.value = false
    saving.value = false
    error.value = ''
    showContactEditModal.value = false
  }

  // ==================== RETURN ====================
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
    $reset,
  }
})

export type { ContactInfoFormData, AboutInfoFormData }
