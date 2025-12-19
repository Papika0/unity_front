/**
 * Language utility functions
 */

import { API_ENDPOINTS, SUPPORTED_LANGUAGES, LANGUAGE_DISPLAY_NAMES } from './constants'

/**
 * Check if a language is supported
 */
export function isSupportedLanguage(lang: string): boolean {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang)
}

/**
 * Get display name for language code
 */
export function getLanguageDisplayName(lang: string): string {
  return LANGUAGE_DISPLAY_NAMES[lang] || lang
}

/**
 * Detect language of text using Google's detection
 */
export async function detectLanguage(text: string): Promise<string | null> {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: 'auto',
    tl: 'en',
    dt: 't',
    q: text.slice(0, 100), // Use only first 100 chars for detection
  })

  try {
    const response = await fetch(`${API_ENDPOINTS.googleTranslate}?${params}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      // Google returns the detected language in data[2]
      if (data && data[2]) {
        return data[2]
      }
    }
  } catch {
    // Language detection failed
  }

  return null
}
