import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getHomepageBootstrap } from '@/services/homepage'
import { useProjectsStore } from './projects'
import { useNewsStore } from './news'
import { useLocaleStore } from '@/stores/ui/locale'
import { mergeTranslations } from '@/composables/useTranslations'
import { usePerformance } from '@/composables/usePerformance'

export const useHomepageStore = defineStore('homepage', () => {
  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isFetched = ref(false)

  // Composables
  const { startTimer, endTimer } = usePerformance()

  // Store dependencies
  const projectsStore = useProjectsStore()
  const newsStore = useNewsStore()
  const localeStore = useLocaleStore()

  // Actions
  async function loadHomepageData(force = false) {
    // Skip if already loading or data is already loaded (unless forced)
    if (isLoading.value || (!force && isFetched.value)) {
      return
    }

    isLoading.value = true
    error.value = null
    startTimer('homepage_load')

    try {
      const response = await getHomepageBootstrap({
        locale: localeStore.currentLocale,
      })
      const data = response.data

      console.log('Bootstrap data received:', data)

      // Handle translations - data is already localized for current locale
      if (data?.translations) {
        mergeTranslations(data.translations)
      }

      projectsStore.featuredProjectsData = data?.projects?.is_featured
      projectsStore.homepageProjectsData = data?.projects?.is_onHomepage

      newsStore.recentArticles = data?.news
    } catch (err) {
      console.error('Failed to load homepage data:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load homepage data'

      // Show user-friendly error message
      // You might want to add a toast notification here
      throw err
    } finally {
      isLoading.value = false
      isFetched.value = true
      endTimer('homepage_load')
    }
  }

  async function refresh() {
    await loadHomepageData(true)
  }

  return {
    // State
    isLoading,
    error,
    isFetched,

    // Actions
    loadHomepageData,
    refresh,
  }
})
