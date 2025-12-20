/**
 * useAboutSettings - Composable for admin about settings page
 * Handles loading, saving, and managing about info settings
 */

import { ref, onMounted } from 'vue'
import { useToastStore } from '@/stores/ui/toast'
import { type AboutInfoFormData, useAdminSiteSettingsStore } from '@/stores/admin/siteSettings'

export function useAboutSettings() {
  // ============================================
  // STORES
  // ============================================
  const toastStore = useToastStore()
  const siteSettingsStore = useAdminSiteSettingsStore()

  // ============================================
  // STATE
  // ============================================
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const formData = ref<AboutInfoFormData>({
    stats: {
      successful_projects: '',
      years_experience: '',
      satisfied_clients: '',
      client_satisfaction: '',
    },
    philosophy_image_id: null,
  })

  // ============================================
  // DATA LOADING
  // ============================================
  const loadData = async () => {
    try {
      loading.value = true
      error.value = null

      await siteSettingsStore.loadAboutInfo()

      if (siteSettingsStore.aboutInfo) {
        // Extract philosophy_image_id from either direct property or nested object
        const philosophyImageId = 
          siteSettingsStore.aboutInfo.philosophy_image_id || 
          siteSettingsStore.aboutInfo.philosophy_image?.id || 
          null

        formData.value = {
          stats: { ...siteSettingsStore.aboutInfo.stats },
          philosophy_image_id: philosophyImageId,
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'მონაცემების ჩატვირთვა ვერ მოხერხდა'
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // HELPERS
  // ============================================
  const getPhilosophyImageData = () => {
    const aboutInfo = siteSettingsStore.aboutInfo
    if (!aboutInfo) return null

    // First priority: use philosophy_image object if available
    if (aboutInfo.philosophy_image) {
      return {
        id: aboutInfo.philosophy_image.id,
        url: aboutInfo.philosophy_image.url,
        alt_text: typeof aboutInfo.philosophy_image.alt_text === 'string' 
          ? aboutInfo.philosophy_image.alt_text 
          : aboutInfo.philosophy_image.alt_text || undefined,
        title: typeof aboutInfo.philosophy_image.title === 'string'
          ? aboutInfo.philosophy_image.title
          : aboutInfo.philosophy_image.title || 'ფილოსოფიის სექციის სურათი',
      }
    }

    // Fallback: use separate id and url fields
    if (aboutInfo.philosophy_image_id && aboutInfo.philosophy_image_url) {
      return {
        id: aboutInfo.philosophy_image_id,
        url: aboutInfo.philosophy_image_url,
        title: 'ფილოსოფიის სექციის სურათი',
      }
    }

    return null
  }

  // ============================================
  // FORM SUBMISSION
  // ============================================
  const handleSubmit = async () => {
    try {
      saving.value = true

      await siteSettingsStore.updateAboutInfo(formData.value)

      toastStore.success('წარმატება', 'პარამეტრები წარმატებით განახლდა')

      // Reload data to show updated values
      await loadData()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'პარამეტრების განახლება ვერ მოხერხდა'
      toastStore.error('შეცდომა', message)
    } finally {
      saving.value = false
    }
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(() => {
    loadData()
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // State
    loading,
    saving,
    error,
    formData,

    // Actions
    loadData,
    handleSubmit,
    getPhilosophyImageData,
  }
}
