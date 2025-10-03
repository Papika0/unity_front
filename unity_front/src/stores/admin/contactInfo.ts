import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToastStore } from '@/stores/ui/toast'
import api from '@/plugins/axios/api'
import type { ContactInfo } from '@/composables/useContactInfo'

interface ContactInfoFormData {
  email: string
  phone_numbers: Array<{
    number: string
    display: string
  }>
  google_maps_url: string
}

export const useAdminContactInfoStore = defineStore('adminContactInfo', () => {
  // State
  const contactInfo = ref<ContactInfo | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  // Form state
  const showEditModal = ref(false)

  // Getters
  const hasContactInfo = computed(() => contactInfo.value !== null)

  // Actions
  const loadContactInfo = async () => {
    try {
      loading.value = true
      error.value = ''

      const response = await api.get('/admin/contact-info')

      // The response.data.data contains the single contact info object directly
      const data = response.data?.data
      contactInfo.value = data || null
    } catch (err) {
      console.error('Error loading contact info:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load contact information'
    } finally {
      loading.value = false
    }
  }

  const updateContactInfo = async (formData: ContactInfoFormData) => {
    const toastStore = useToastStore()

    try {
      saving.value = true
      error.value = ''

      const response = await api.put('/admin/contact-info', formData)

      if (!response.data) {
        throw new Error('Failed to update contact information')
      }

      const result = response.data

      // Update local state
      contactInfo.value = result.data

      showEditModal.value = false
      toastStore.success('Success', 'Contact information updated successfully')

      return result.data
    } catch (err) {
      console.error('Error updating contact info:', err)
      error.value = err instanceof Error ? err.message : 'Failed to update contact information'
      toastStore.error('Error', error.value)
      throw err
    } finally {
      saving.value = false
    }
  }

  const openEditModal = () => {
    showEditModal.value = true
    error.value = ''
  }

  const closeModal = () => {
    showEditModal.value = false
    error.value = ''
  }

  return {
    // State
    contactInfo,
    loading,
    saving,
    error,
    showEditModal,

    // Getters
    hasContactInfo,

    // Actions
    loadContactInfo,
    updateContactInfo,
    openEditModal,
    closeModal,
  }
})

export type { ContactInfoFormData }
