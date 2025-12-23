import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { getFooterData, type FooterData } from '@/services/footerApi'
import { useLocaleStore } from '@/stores/ui/locale'

export const useFooterStore = defineStore('footer', () => {
  // ==================== STATE ====================
  const footerData = ref<FooterData | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isFetched = ref(false)
  const isFromHomepage = ref(false)

  // Shared loading promise to prevent duplicate calls
  let loadingPromise: Promise<void> | null = null

  // Store dependencies
  const localeStore = useLocaleStore()

  // ==================== GETTERS ====================
  const projects = computed(() => footerData.value?.projects || [])
  const contact = computed(() => footerData.value?.contact || null)
  const socialLinks = computed(() => footerData.value?.social_links || null)

  // Check if footer data is empty
  const isDataEmpty = computed(() => {
    return (
      !footerData.value ||
      (!footerData.value.contact &&
        !footerData.value.social_links &&
        (!footerData.value.projects || footerData.value.projects.length === 0))
    )
  })

  // ==================== ACTIONS ====================
  function setDataFromHomepage(data: {
    contact: FooterData['contact']
    social_links: FooterData['social_links']
    projects: FooterData['projects']
  }) {
    // Only set data if we actually have some content
    if (data.contact || data.social_links || (data.projects && data.projects.length > 0)) {
      footerData.value = {
        contact: data.contact || null,
        social_links: data.social_links || null,
        projects: data.projects || [],
      }
      isFetched.value = true
      isFromHomepage.value = true
      error.value = null // Clear any previous errors
    }
  }

  async function loadFooterData(force = false) {
    // If already loading, return the existing promise
    if (loadingPromise && !force) {
      return loadingPromise
    }

    // Skip if data already exists and not forcing reload
    if (!force && isFetched.value && !isDataEmpty.value) {
      return
    }

    // Only fetch from API if data is empty or force reload
    if (force || isDataEmpty.value) {
      loadingPromise = (async () => {
        isLoading.value = true
        error.value = null
        isFromHomepage.value = false

        try {
          // Check if homepage might provide the data soon (only if force is false)
          if (!force) {
            // Import homepage store dynamically to avoid circular dependencies
            const { useHomepageStore } = await import('./homepage')
            const homepageStore = useHomepageStore()

            if (homepageStore.isLoading) {
              return // Homepage will provide data
            }

            // If homepage has data but footer doesn't, wait a moment for homepage to set it
            if (homepageStore.isFetched && !isFetched.value) {
              await new Promise((resolve) => setTimeout(resolve, 50))

              // Check again after waiting
              if (isFetched.value && !isDataEmpty.value) {
                return
              }
            }
          }

          const response = await getFooterData(localeStore.currentLocale)

          if (response.success && response.data) {
            footerData.value = response.data
            isFetched.value = true
          } else {
            throw new Error(response.message || 'Failed to load footer data')
          }
        } catch (err) {
          error.value = err instanceof Error ? err.message : 'Failed to load footer data'
          throw err
        } finally {
          isLoading.value = false
          loadingPromise = null
        }
      })()

      return loadingPromise
    }
  }

  async function refresh() {
    await loadFooterData(true)
  }

  // ==================== RESET ====================
  function $reset() {
    footerData.value = null
    isFetched.value = false
    isFromHomepage.value = false
    isLoading.value = false
    error.value = null
  }

  // Alias for backward compatibility
  const clearData = $reset

  // ==================== WATCHERS ====================
  // Watch for locale changes and refresh data
  watch(
    () => localeStore.currentLocale,
    (newLocale, oldLocale) => {
      if (newLocale !== oldLocale && isFetched.value) {
        // Clear current data and reload for new locale
        clearData()
        loadFooterData()
      }
    },
  )

  return {
    // State
    footerData,
    isLoading,
    error,
    isFetched,
    isFromHomepage,
    // Getters
    isDataEmpty,
    projects,
    contact,
    socialLinks,
    // Actions
    setDataFromHomepage,
    loadFooterData,
    refresh,
    clearData,
    $reset,
  }
})
