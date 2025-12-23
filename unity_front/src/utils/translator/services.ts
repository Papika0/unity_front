/**
 * Individual translation service implementations
 */

import { API_ENDPOINTS, LANG_MAP } from './constants'

/**
 * Google Translate (free tier via public API)
 * This uses the free public endpoint with limitations
 */
export async function translateWithGoogle(
  text: string,
  fromLang: string,
  toLang: string
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
    const response = await fetch(`${API_ENDPOINTS.googleTranslate}?${params}`, {
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
  } catch {
    // Google Translate failed
  }

  return null
}

/**
 * MyMemory Translation API
 * Free tier: 5000 chars/day without key, 50000 chars/day with free key
 */
export async function translateWithMyMemory(
  text: string,
  fromLang: string,
  toLang: string
): Promise<string | null> {
  const sourceLang = LANG_MAP[fromLang] || fromLang
  const targetLang = LANG_MAP[toLang] || toLang

  // Using a valid email can increase the daily limit
  const email = 'api@example.com'
  const params = new URLSearchParams({
    q: text,
    langpair: `${sourceLang}|${targetLang}`,
    de: email,
  })

  try {
    const response = await fetch(`${API_ENDPOINTS.myMemory}?${params}`, {
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
        .sort((a: MyMemoryMatch, b: MyMemoryMatch) => parseInt(b.quality) - parseInt(a.quality))[0]

      if (goodMatch?.translation) {
        const altTranslation = goodMatch.translation.trim()
        if (!altTranslation.includes('MYMEMORY WARNING') && altTranslation !== text) {
          return altTranslation
        }
      }
    }
  } catch {
    // MyMemory failed
  }

  return null
}

/**
 * Lingva Translate API (Google Translate mirror)
 * Note: This service might be unreliable or have downtime
 */
export async function translateWithLingva(
  text: string,
  fromLang: string,
  toLang: string
): Promise<string | null> {
  const sourceLang = fromLang.slice(0, 2).toLowerCase()
  const targetLang = toLang.slice(0, 2).toLowerCase()

  try {
    const url = `${API_ENDPOINTS.lingva}/${sourceLang}/${targetLang}/${encodeURIComponent(text)}`

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
  } catch {
    // Lingva failed
  }

  return null
}
