import { ref, computed } from 'vue'
import { getTranslationsByGroup } from '@/services/translations'
import { useLocaleStore } from '@/stores/ui/locale'

export type TranslationsRecord = Record<string, string> // Single locale: key -> text

const loadedGroups = ref<Set<string>>(new Set())
const translations = ref<TranslationsRecord>({})
const isLoading = ref(false)
const loadError = ref('')
const isInitialized = ref(false)

async function loadGroup(group: string) {
  if (loadedGroups.value.has(group)) return
  try {
    isLoading.value = true
    loadError.value = ''
    const response = await getTranslationsByGroup(group, 1000)
    const data = response.data.data || response.data
    const list = data.data ? data.data : data

    for (const item of list) {
      // item.text is JSON with locales
      const valueObj = typeof item.text === 'string' ? JSON.parse(item.text) : item.value
      translations.value[item.key] = valueObj || {}
    }

    loadedGroups.value.add(group)
    isInitialized.value = true
  } catch (err) {
    const e = err as { response?: { data?: { message?: string } } }
    loadError.value = e.response?.data?.message || 'Failed to load translations'
  } finally {
    isLoading.value = false
  }
}

function useTranslator() {
  const localeStore = useLocaleStore()
  const currentLocale = computed(() => localeStore.currentLocale)

  function t(key: string): string {
    // If we're switching languages, return empty to prevent key flashing
    if (localeStore.isSwitching) {
      return ''
    }

    // If translations aren't loaded yet, return empty to prevent key flashing
    if (!isInitialized.value || Object.keys(translations.value).length === 0) {
      return ''
    }

    return translations.value[key] || key
  }

  return { t, currentLocale }
}

export function useTranslations() {
  const { t, currentLocale } = useTranslator()
  return { t, loadGroup, isLoading, loadError, currentLocale, isInitialized }
}

export function mergeTranslations(payload: Record<string, string>) {
  console.log('Merging translations:', payload)
  for (const [key, value] of Object.entries(payload)) {
    translations.value[key] = value
  }
  console.log('Current translations after merge:', translations.value)
  isInitialized.value = true
}

// Clear translations when locale changes to force refetch
export function clearTranslations() {
  translations.value = {}
  loadedGroups.value.clear()
  isInitialized.value = false
}

// Check if translations are loaded for current locale
export function hasTranslations(): boolean {
  return Object.keys(translations.value).length > 0
}

// Get translation with fallback to prevent key flashing
export function tSafe(key: string): string {
  const text = translations.value[key]
  if (!text) return '' // Return empty instead of key to prevent flashing
  return text
}
