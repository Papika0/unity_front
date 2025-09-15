import { ref, computed } from 'vue'
import { getAboutInfo, type AboutResponse } from '@/services/about'

export interface AboutInfo {
  stats: {
    successful_projects: string
    years_experience: string
    satisfied_clients: string
    client_satisfaction: string
  }
}

export function useAboutInfo() {
  const aboutInfo = ref<AboutInfo | null>(null)
  const translations = ref<Record<string, string>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

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

  const loadAboutInfo = async (groups?: string[], locale?: string) => {
    if (aboutInfo.value && !groups) return // Already loaded unless requesting specific groups

    isLoading.value = true
    error.value = null

    try {
      const response = await getAboutInfo({
        groups: groups || ['messages', 'header', 'footer', 'buttons', 'contact', 'errors', 'about'],
        locale: locale || 'ka',
      })

      const data: AboutResponse = response.data
      aboutInfo.value = data.about_info
      translations.value = data.translations
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
