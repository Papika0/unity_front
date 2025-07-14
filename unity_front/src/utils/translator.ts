// Enhanced translation utility with multiple fallback services
export class Translator {
  private static readonly API_ENDPOINTS = {
    myMemory: 'https://api.mymemory.translated.net/get',
    libretranslate: 'https://libretranslate.de/translate', // Free backup service
  }

  private static readonly LANG_MAP: Record<string, string> = {
    ka: 'ka-GE',
    ru: 'ru-RU',
    en: 'en-US',
  }

  /**
   * Translate text using MyMemory API with fallback to LibreTranslate
   */
  static async translate(text: string, fromLang: string, toLang: string): Promise<string> {
    if (!text.trim()) {
      return ''
    }

    // Normalize language codes
    const sourceLang = this.LANG_MAP[fromLang] || fromLang
    const targetLang = this.LANG_MAP[toLang] || toLang

    // Try MyMemory first
    try {
      const result = await this.translateWithMyMemory(text, sourceLang, targetLang)
      if (result) {
        return result
      }
    } catch (error) {
      console.warn('MyMemory translation failed:', error)
    }

    // Fallback to LibreTranslate
    try {
      const result = await this.translateWithLibreTranslate(text, fromLang, toLang)
      if (result) {
        return result
      }
    } catch (error) {
      console.warn('LibreTranslate translation failed:', error)
    }

    // If all services fail, return a helpful message
    throw new Error(`Translation failed for "${text}" from ${fromLang} to ${toLang}`)
  }

  /**
   * Translate using MyMemory API
   */
  private static async translateWithMyMemory(
    text: string,
    sourceLang: string,
    targetLang: string,
  ): Promise<string | null> {
    const url = `${this.API_ENDPOINTS.myMemory}?q=${encodeURIComponent(
      text,
    )}&langpair=${sourceLang}|${targetLang}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText.trim()

      // Basic quality check - ensure translation is different from source
      if (translated && translated !== text) {
        return translated
      }
    }

    return null
  }

  /**
   * Translate using LibreTranslate API (fallback)
   */
  private static async translateWithLibreTranslate(
    text: string,
    fromLang: string,
    toLang: string,
  ): Promise<string | null> {
    // LibreTranslate uses 2-letter ISO codes
    const sourceCode = fromLang === 'ka' ? 'ka' : fromLang.slice(0, 2)
    const targetCode = toLang === 'ka' ? 'ka' : toLang.slice(0, 2)

    const response = await fetch(this.API_ENDPOINTS.libretranslate, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: sourceCode,
        target: targetCode,
        format: 'text',
      }),
    })

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.translatedText) {
      const translated = data.translatedText.trim()

      // Basic quality check
      if (translated && translated !== text) {
        return translated
      }
    }

    return null
  }

  /**
   * Translate multiple fields in batch
   */
  static async translateBatch(
    fields: Record<string, string>,
    fromLang: string,
    toLang: string,
  ): Promise<Record<string, string>> {
    const results: Record<string, string> = {}

    for (const [key, text] of Object.entries(fields)) {
      try {
        results[key] = await this.translate(text, fromLang, toLang)
      } catch (error) {
        console.warn(`Failed to translate field "${key}":`, error)
        results[key] = text // Keep original text if translation fails
      }
    }

    return results
  }

  /**
   * Check if a language is supported
   */
  static isSupportedLanguage(lang: string): boolean {
    const supportedLangs = ['ka', 'en', 'ru', 'ka-GE', 'en-US', 'ru-RU']
    return supportedLangs.includes(lang)
  }

  /**
   * Get display name for language code
   */
  static getLanguageDisplayName(lang: string): string {
    const displayNames: Record<string, string> = {
      ka: 'ქართული',
      en: 'English',
      ru: 'Русский',
      'ka-GE': 'ქართული',
      'en-US': 'English',
      'ru-RU': 'Русский',
    }

    return displayNames[lang] || lang
  }
}
