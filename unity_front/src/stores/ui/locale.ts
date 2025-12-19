import { defineStore } from 'pinia'
import { ref } from 'vue'

export type SupportedLocale = 'ka' | 'en' | 'ru'

export const useLocaleStore = defineStore('locale', () => {
  // ==================== STATE ====================
  const currentLocale = ref<SupportedLocale>('ka')
  const isSwitching = ref(false)

  // ==================== ACTIONS ====================
  function setLocale(locale: SupportedLocale) {
    if (locale === currentLocale.value) return

    isSwitching.value = true
    currentLocale.value = locale

    try {
      localStorage.setItem('app_locale', locale)
      // Set a flag to indicate language switch in progress
      localStorage.setItem('app_language_switching', 'true')
    } catch {}

    // Keep loading state for minimum duration for smooth UX
    setTimeout(() => {
      // Don't set isSwitching to false - keep it true until after page reload
      // This prevents the double overlay issue
      console.log('🔄 Refreshing page to load new language translations...')
      window.location.reload()
    }, 1200) // Slightly longer to ensure smooth overlay experience
  }

  // ==================== INITIALIZATION ====================
  try {
    const saved = localStorage.getItem('app_locale') as SupportedLocale | null
    if (saved === 'ka' || saved === 'en' || saved === 'ru') {
      currentLocale.value = saved
    }

    // Check if we just switched languages
    const wasLanguageSwitching = localStorage.getItem('app_language_switching')
    if (wasLanguageSwitching === 'true') {
      // Clear the flag
      localStorage.removeItem('app_language_switching')
      // Don't show any loading overlays for a brief moment after language switch
      setTimeout(() => {
        // This timeout allows the page to load content without showing overlay
      }, 100)
    }
  } catch {}

  // ==================== RESET ====================
  const $reset = () => {
    currentLocale.value = 'ka'
    isSwitching.value = false
  }

  return {
    // State
    currentLocale,
    isSwitching,
    // Actions
    setLocale,
    $reset,
  }
})
