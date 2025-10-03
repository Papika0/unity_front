import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useLocaleStore } from './locale'

export type TranslationsRecord = Record<string, string> // Single locale: key -> text
export type TranslationGroup = Record<string, string> // Group name -> translations
export type PageGroups = Record<string, string[]> // Page name -> array of group names

export const useTranslationsStore = defineStore('translations', () => {
  // State
  const loadedGroups = ref<Set<string>>(new Set())
  const translations = ref<TranslationsRecord>({})
  const translationGroups = ref<Record<string, TranslationGroup>>({}) // Store groups of translations
  const pageGroups: PageGroups = {
    homepage: [
      'messages',
      'header',
      'footer',
      'buttons',
      'contact',
      'errors',
      'home',
      'projects',
      'news',
    ],
    about: ['messages', 'header', 'footer', 'contact', 'errors', 'about', 'buttons'],
    projects: ['messages', 'header', 'footer', 'contact', 'errors', 'projects', 'buttons'],
    news: ['messages', 'header', 'footer', 'contact', 'errors', 'news', 'buttons'],
    gallery: ['messages', 'header', 'footer', 'contact', 'errors', 'gallery', 'buttons'],
    contact: ['messages', 'header', 'footer', 'contact', 'buttons', 'errors'],
  }
  const isLoading = ref(false)
  const loadError = ref('')
  const isInitialized = ref(false)
  const isFirstLoad = ref(true) // Track if this is the very first load

  // Getters
  const currentLocale = computed(() => {
    const localeStore = useLocaleStore()
    return localeStore.currentLocale
  })

  // Function to extract groups from translation keys
  function extractGroupsFromTranslations(translations: TranslationsRecord): Set<string> {
    const groups = new Set<string>()

    for (const key of Object.keys(translations)) {
      // Extract group from key (assuming format: group.key or group.subgroup.key)
      const parts = key.split('.')
      if (parts.length > 1) {
        groups.add(parts[0]) // First part is the group name
      }
    }

    return groups
  }

  // Watcher to update loadedGroups when translations change
  watch(
    () => translations.value,
    (newTranslations) => {
      // Extract groups from translation keys
      const detectedGroups = extractGroupsFromTranslations(newTranslations)

      // Update loadedGroups based on detected groups
      loadedGroups.value = detectedGroups

      // Also update translationGroups for backward compatibility
      for (const group of detectedGroups) {
        if (!translationGroups.value[group]) {
          translationGroups.value[group] = {}
        }
      }
    },
    { deep: true, immediate: true },
  )

  // Actions

  // Check if all groups for a page are loaded
  function arePageGroupsLoaded(pageName: string): boolean {
    const groups = pageGroups[pageName]
    if (!groups) return false

    return groups.every((group) => loadedGroups.value.has(group))
  }

  // Get translations for a specific group
  function getGroupTranslations(groupName: string): TranslationGroup {
    return translationGroups.value[groupName] || {}
  }

  // Get all loaded groups
  function getLoadedGroups(): string[] {
    return Array.from(loadedGroups.value)
  }

  // Check if a specific group is loaded
  function isGroupLoaded(groupName: string): boolean {
    return loadedGroups.value.has(groupName)
  }

  // Add or update page groups mapping
  function setPageGroups(pageName: string, groups: string[]) {
    pageGroups[pageName] = groups
  }

  // Get groups for a specific page
  function getPageGroups(pageName: string): string[] {
    return pageGroups[pageName] || []
  }

  // Get missing groups for a specific page
  function getMissingGroups(pageName: string): string[] {
    const requiredGroups = getPageGroups(pageName)
    const loadedGroups = getLoadedGroups()

    // If we have no translations or are switching languages, request all groups
    if (!isInitialized.value || Object.keys(translations.value).length === 0) {
      return requiredGroups
    }

    const missing = requiredGroups.filter((group) => !loadedGroups.includes(group))
    return missing
  } // Translation function
  function t(key: string): string {
    const localeStore = useLocaleStore()

    // If we're switching languages, return empty to prevent key flashing
    if (localeStore.isSwitching) {
      return ''
    }

    // If translations aren't loaded yet, return empty to prevent key flashing
    if (!isInitialized.value || Object.keys(translations.value).length === 0) {
      return key
    }

    const result = translations.value[key] || key
    return result
  }

  // Merge translations (for backward compatibility)
  function mergeTranslations(payload: Record<string, string>) {
    for (const [key, value] of Object.entries(payload)) {
      translations.value[key] = value
    }

    // Extract and track groups from the merged translations
    const detectedGroups = extractGroupsFromTranslations(payload)

    for (const group of detectedGroups) {
      loadedGroups.value.add(group)
    }

    // Mark as initialized and no longer first load
    isInitialized.value = true
    isFirstLoad.value = false
  }

  // Clear translations when locale changes to force refetch
  function clearTranslations() {
    translations.value = {}
    translationGroups.value = {}
    loadedGroups.value.clear()
    isInitialized.value = false
    isFirstLoad.value = true // Reset to first load state
  }

  // Check if translations are loaded for current locale
  function hasTranslations(): boolean {
    return Object.keys(translations.value).length > 0
  }

  // Get translation with fallback to prevent key flashing
  function tSafe(key: string): string {
    const text = translations.value[key]
    if (!text) return '' // Return empty instead of key to prevent flashing
    return text
  }

  return {
    // State
    loadedGroups,
    translations,
    translationGroups,
    pageGroups,
    isLoading,
    loadError,
    isInitialized,
    isFirstLoad,
    currentLocale,

    // Actions
    arePageGroupsLoaded,
    getGroupTranslations,
    getLoadedGroups,
    isGroupLoaded,
    setPageGroups,
    getPageGroups,
    getMissingGroups,
    t,
    mergeTranslations,
    clearTranslations,
    hasTranslations,
    tSafe,
  }
})
