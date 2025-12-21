import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToastStore } from '@/stores/ui/toast'
import { adminContactInfoApi, type ContactInfoFormData } from '@/services/adminContactInfoApi'
import type { ContactInfo } from '@/composables/pages/useContactInfo'

export const useAdminContactInfoStore = defineStore('adminContactInfo', () => {
  // ==================== STATE ====================
  const contactInfo = ref<ContactInfo | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const showEditModal = ref(false)

  // ==================== GETTERS ====================
  const hasContactInfo = computed(() => contactInfo.value !== null)

  // ==================== ACTIONS ====================
  const loadContactInfo = async () => {
    try {
      loading.value = true
      error.value = ''
      contactInfo.value = await adminContactInfoApi.get()
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

      contactInfo.value = await adminContactInfoApi.update(formData)
      showEditModal.value = false
      toastStore.success('Success', 'Contact information updated successfully')

      return contactInfo.value
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

  // ==================== RESET ====================
  const $reset = () => {
    contactInfo.value = null
    loading.value = false
    saving.value = false
    error.value = ''
    showEditModal.value = false
  }

  // ==================== RETURN ====================
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
    $reset,
  }
})

export type { ContactInfoFormData }
