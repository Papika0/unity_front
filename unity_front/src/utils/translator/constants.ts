/**
 * Constants for translation services
 */

export const API_ENDPOINTS = {
  myMemory: 'https://api.mymemory.translated.net/get',
  googleTranslate: 'https://translate.googleapis.com/translate_a/single',
  lingva: 'https://lingva.ml/api/v1',
} as const

export const LANG_MAP: Record<string, string> = {
  ka: 'ka-GE',
  ru: 'ru-RU',
  en: 'en-US',
}

export const SUPPORTED_LANGUAGES = ['ka', 'en', 'ru', 'ka-GE', 'en-US', 'ru-RU'] as const

export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  ka: 'ქართული',
  en: 'English',
  ru: 'Русский',
  'ka-GE': 'ქართული',
  'en-US': 'English',
  'ru-RU': 'Русский',
}
