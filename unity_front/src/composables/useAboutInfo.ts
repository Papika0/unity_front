import { ref, computed } from 'vue'
import { getAboutInfo, type AboutResponse } from '@/services/about'
import { useTranslationsStore } from '@/stores/ui/translations'
import type { ImageData } from '@/types'

export interface AboutInfo {
  stats: {
    successful_projects: string
    years_experience: string
    satisfied_clients: string
    client_satisfaction: string
  }
  philosophy_image_id?: number
  philosophy_image_url?: string
  philosophy_image?: ImageData
}

export function useAboutInfo() {
  const aboutInfo = ref<AboutInfo | null>(null)
  const translations = ref<Record<string, string>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const translationStore = useTranslationsStore()

  const stats = computed(() => {
    return (
      aboutInfo.value?.stats || {
        successful_projects: '150+',
        years_experience: '15+',
        satisfied_clients: '50+',
        client_satisfaction: '98%',
      }
    )
  })

  const loadAboutInfo = async () => {
    if (aboutInfo.value) return // Already loaded

    isLoading.value = true
    error.value = null

    try {
      // Get missing groups for about page
      const missingGroups = translationStore.getMissingGroups('about')

      // If no groups are missing and we have about info, return early
      if (missingGroups.length === 0 && aboutInfo.value) {
        isLoading.value = false
        return
      }

      // Get locale from translation store
      const locale = translationStore.currentLocale

      const response = await getAboutInfo({
        groups: missingGroups,
        locale: locale,
      })

      const data: AboutResponse = response.data
      aboutInfo.value = data.about_info

      // Merge translations into the store instead of local state
      if (data.translations) {
        translationStore.mergeTranslations(data.translations)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load about info'
      console.error('Failed to load about info:', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    aboutInfo,
    translations,
    stats,
    isLoading,
    error,
    loadAboutInfo,
  }
}
