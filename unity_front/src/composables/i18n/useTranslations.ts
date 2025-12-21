import { useTranslationsStore } from '@/stores/ui/translations'

// Re-export types for backward compatibility
export type { TranslationsRecord, TranslationGroup, PageGroups } from '@/stores/ui/translations'

export function useTranslations() {
  const store = useTranslationsStore()

  return {
    t: store.t,
    arePageGroupsLoaded: store.arePageGroupsLoaded,
    getGroupTranslations: store.getGroupTranslations,
    getLoadedGroups: store.getLoadedGroups,
    isGroupLoaded: store.isGroupLoaded,
    setPageGroups: store.setPageGroups,
    getPageGroups: store.getPageGroups,
    getMissingGroups: store.getMissingGroups,
    isLoading: store.isLoading,
    loadError: store.loadError,
    currentLocale: store.currentLocale,
    isInitialized: store.isInitialized,
  }
}

export function mergeTranslations(payload: Record<string, string>) {
  const store = useTranslationsStore()
  return store.mergeTranslations(payload)
}

// Clear translations when locale changes to force refetch
export function clearTranslations() {
  const store = useTranslationsStore()
  return store.clearTranslations()
}

// Check if translations are loaded for current locale
export function hasTranslations(): boolean {
  const store = useTranslationsStore()
  return store.hasTranslations()
}

// Get translation with fallback to prevent key flashing
export function tSafe(key: string): string {
  const store = useTranslationsStore()
  return store.tSafe(key)
}
