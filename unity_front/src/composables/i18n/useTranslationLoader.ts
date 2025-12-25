import { useTranslationsStore } from '@/stores/ui/translations'

import { getTranslationsByGroup } from '@/services/translations'

export function useTranslationLoader() {
  const translationsStore = useTranslationsStore()


  /**
   * Load translations for specific groups
   * @param groups - Array of group names to load
   * @returns Promise that resolves when all groups are loaded
   */
  async function loadGroups(groups: string[]): Promise<void> {
    try {
      // Check which groups need to be loaded
      const groupsToLoad = groups.filter(group => !translationsStore.isGroupLoaded(group))
      
      if (groupsToLoad.length === 0) {
        return
      }

      // Get current locale


      // Fetch all groups in parallel
      const promises = groupsToLoad.map(async (group) => {
        try {
          const response = await getTranslationsByGroup(group)
          
          if (response.data && response.data.success && response.data.data) {
            const translations = response.data.data
            return translations
          }
          
          return {}
        } catch {
          return {}
        }
      })

      const results = await Promise.all(promises)
      
      // Merge all translations
      const mergedTranslations = results.reduce((acc, translations) => {
        return { ...acc, ...translations }
      }, {})

      // Update store
      if (Object.keys(mergedTranslations).length > 0) {
        translationsStore.mergeTranslations(mergedTranslations)
      }
    } catch (error) {
      throw error
    }
  }

  /**
   * Load translations for a specific page
   * @param pageName - Name of the page (homepage, about, projects, etc.)
   * @returns Promise that resolves when page translations are loaded
   */
  async function loadPageTranslations(pageName: string): Promise<void> {
    const groups = translationsStore.getPageGroups(pageName)
    
    if (groups.length === 0) {
      return
    }

    await loadGroups(groups)
  }

  /**
   * Preload all translations for the entire app
   * Useful for initial app load to prevent multiple API calls
   */
  async function preloadAll(): Promise<void> {
    const allGroups = new Set<string>()
    
    // Collect all unique groups from all pages
    Object.values(translationsStore.pageGroups).forEach(groups => {
      groups.forEach(group => allGroups.add(group))
    })

    await loadGroups(Array.from(allGroups))
  }

  return {
    loadGroups,
    loadPageTranslations,
    preloadAll,
  }
}
