// Enhanced translation utility with browser-compatible free services
export class Translator {
  private static readonly API_ENDPOINTS = {
    myMemory: 'https://api.mymemory.translated.net/get',
    googleTranslate: 'https://translate.googleapis.com/translate_a/single',
    lingva: 'https://lingva.ml/api/v1',
  }

  private static readonly LANG_MAP: Record<string, string> = {
    ka: 'ka-GE',
    ru: 'ru-RU',
    en: 'en-US',
  }

  /**
   * Main translation method with multiple service fallback
   */
  static async translate(text: string, fromLang: string, toLang: string): Promise<string> {
    if (!text.trim()) {
      return ''
    }

    // Try services in order of reliability
    const translators = [
      () => this.translateWithGoogle(text, fromLang, toLang),
      () => this.translateWithMyMemory(text, fromLang, toLang),
      () => this.translateWithLingva(text, fromLang, toLang),
    ]

    for (const translator of translators) {
      try {
        const result = await translator()
        if (result && result !== text) {
          return result
        }
      } catch (error) {
        continue
      }
    }

    // If all services fail, return original text
    return text
  }

  /**
   * Google Translate (free tier via public API)
   * This uses the free public endpoint with limitations
   */
  private static async translateWithGoogle(
    text: string,
    fromLang: string,
    toLang: string,
  ): Promise<string | null> {
    const sourceLang = fromLang.slice(0, 2).toLowerCase()
    const targetLang = toLang.slice(0, 2).toLowerCase()

    const params = new URLSearchParams({
      client: 'gtx',
      sl: sourceLang,
      tl: targetLang,
      dt: 't',
      q: text,
    })

    try {
      const response = await fetch(`${this.API_ENDPOINTS.googleTranslate}?${params}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Google Translate error: ${response.status}`)
      }

      const data = await response.json()

      // Google returns nested array structure
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0].trim()
      }
    } catch (error) {
      // Google Translate failed
    }

    return null
  }

  /**
   * MyMemory Translation API
   * Free tier: 5000 chars/day without key, 50000 chars/day with free key
   */
  private static async translateWithMyMemory(
    text: string,
    fromLang: string,
    toLang: string,
  ): Promise<string | null> {
    const sourceLang = this.LANG_MAP[fromLang] || fromLang
    const targetLang = this.LANG_MAP[toLang] || toLang

    // Using a valid email can increase the daily limit
    const email = 'api@example.com'
    const params = new URLSearchParams({
      q: text,
      langpair: `${sourceLang}|${targetLang}`,
      de: email,
    })

    try {
      const response = await fetch(`${this.API_ENDPOINTS.myMemory}?${params}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`MyMemory API error: ${response.status}`)
      }

      const data = await response.json()

      // Check for successful response
      if (data.responseStatus === 200 && data.responseData?.translatedText) {
        const translated = data.responseData.translatedText.trim()

        // MyMemory sometimes returns "MYMEMORY WARNING:" messages
        if (!translated.includes('MYMEMORY WARNING') && translated !== text) {
          return translated
        }
      }

      // Try to use alternative matches with good quality
      interface MyMemoryMatch {
        quality: string
        translation: string
      }

      if (data.matches && Array.isArray(data.matches)) {
        const goodMatch = (data.matches as MyMemoryMatch[])
          .filter((m: MyMemoryMatch) => m.quality && parseInt(m.quality) >= 70)
          .sort(
            (a: MyMemoryMatch, b: MyMemoryMatch) => parseInt(b.quality) - parseInt(a.quality),
          )[0]

        if (goodMatch?.translation) {
          const altTranslation = goodMatch.translation.trim()
          if (!altTranslation.includes('MYMEMORY WARNING') && altTranslation !== text) {
            return altTranslation
          }
        }
      }
    } catch (error) {
      // MyMemory failed
    }

    return null
  }

  /**
   * Lingva Translate API (Google Translate mirror)
   * Note: This service might be unreliable or have downtime
   */
  private static async translateWithLingva(
    text: string,
    fromLang: string,
    toLang: string,
  ): Promise<string | null> {
    const sourceLang = fromLang.slice(0, 2).toLowerCase()
    const targetLang = toLang.slice(0, 2).toLowerCase()

    try {
      const url = `${this.API_ENDPOINTS.lingva}/${sourceLang}/${targetLang}/${encodeURIComponent(text)}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Lingva API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.translation) {
        return data.translation.trim()
      }
    } catch (error) {
      // Lingva failed
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

    // Process translations in parallel for better performance
    const promises = Object.entries(fields).map(async ([key, text]) => {
      try {
        const translated = await this.translate(text, fromLang, toLang)
        return { key, translated }
      } catch (error) {
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

  /**
   * Detect language of text using Google's detection
   */
  static async detectLanguage(text: string): Promise<string | null> {
    const params = new URLSearchParams({
      client: 'gtx',
      sl: 'auto',
      tl: 'en',
      dt: 't',
      q: text.slice(0, 100), // Use only first 100 chars for detection
    })

    try {
      const response = await fetch(`${this.API_ENDPOINTS.googleTranslate}?${params}`, {
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
    } catch (error) {
      // Language detection failed
    }

    return null
  }
}
