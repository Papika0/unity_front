/**
 * Enhanced translation utility with browser-compatible free services
 */

// Re-export constants
export {
  API_ENDPOINTS,
  LANG_MAP,
  SUPPORTED_LANGUAGES,
  LANGUAGE_DISPLAY_NAMES,
} from './constants'

// Re-export services
export { translateWithGoogle, translateWithMyMemory, translateWithLingva } from './services'

// Re-export utilities
export { isSupportedLanguage, getLanguageDisplayName, detectLanguage } from './utils'

// Import for internal use
import { translateWithGoogle, translateWithMyMemory, translateWithLingva } from './services'
import { isSupportedLanguage, getLanguageDisplayName, detectLanguage } from './utils'

/**
 * Main Translator class with multiple service fallback
 */
export class Translator {
  /**
   * Main translation method with multiple service fallback
   */
  static async translate(text: string, fromLang: string, toLang: string): Promise<string> {
    if (!text.trim()) {
      return ''
    }

    // Try services in order of reliability
    const translators = [
      () => translateWithGoogle(text, fromLang, toLang),
      () => translateWithMyMemory(text, fromLang, toLang),
      () => translateWithLingva(text, fromLang, toLang),
    ]

    for (const translator of translators) {
      try {
        const result = await translator()
        if (result && result !== text) {
          return result
        }
      } catch {
        continue
      }
    }

    // If all services fail, return original text
    return text
  }

  /**
   * Translate multiple fields in batch
   */
  static async translateBatch(
    fields: Record<string, string>,
    fromLang: string,
    toLang: string
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {}

    // Process translations in parallel for better performance
    const promises = Object.entries(fields).map(async ([key, text]) => {
      try {
        const translated = await this.translate(text, fromLang, toLang)
        return { key, translated }
      } catch {
        return { key, translated: text }
      }
    })

    const translations = await Promise.all(promises)

    for (const { key, translated } of translations) {
      results[key] = translated
    }

    return results
  }

  /**
   * Check if a language is supported
   */
  static isSupportedLanguage = isSupportedLanguage

  /**
   * Get display name for language code
   */
  static getLanguageDisplayName = getLanguageDisplayName

  /**
   * Detect language of text using Google's detection
   */
  static detectLanguage = detectLanguage
}
