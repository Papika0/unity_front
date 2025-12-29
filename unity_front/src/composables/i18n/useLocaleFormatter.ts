import { computed } from 'vue'
import { useTranslationsStore } from '@/stores/ui/translations'

// Currency symbol mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  GEL: '₾',
  EUR: '€'
}

// Locale mapping from app locale to Intl locale
const LOCALE_MAP: Record<string, string> = {
  ka: 'ka-GE',
  en: 'en-US',
  ru: 'ru-RU'
}

/**
 * Centralized locale formatter for the entire CRM system
 *
 * Provides dynamic locale-aware formatting for dates, numbers, and currencies
 * based on the current app locale (ka, en, ru)
 *
 * Usage:
 * ```typescript
 * const { formatDate, formatNumber, formatCurrency, getCurrencySymbol } = useLocaleFormatter()
 *
 * // Format a date
 * const formattedDate = formatDate(new Date(), { year: 'numeric', month: 'short', day: 'numeric' })
 *
 * // Format a number
 * const formattedNumber = formatNumber(1234567.89, { maximumFractionDigits: 2 })
 *
 * // Format currency
 * const formattedCurrency = formatCurrency(1000, 'USD') // $1,000
 *
 * // Get currency symbol
 * const symbol = getCurrencySymbol('GEL') // ₾
 * ```
 */
export function useLocaleFormatter() {
  const translationsStore = useTranslationsStore()

  // Get the Intl-compatible locale (ka → ka-GE, en → en-US, ru → ru-RU)
  const intlLocale = computed(() => LOCALE_MAP[translationsStore.currentLocale] || 'en-US')

  /**
   * Format currency amount with proper symbol and locale
   *
   * @param amount - The amount to format
   * @param currency - Currency code (USD, GEL, EUR)
   * @returns Formatted currency string
   */
  function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat(intlLocale.value, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount)
  }

  /**
   * Format date with proper locale
   *
   * @param date - Date to format (Date object or ISO string)
   * @param options - Intl.DateTimeFormatOptions
   * @returns Formatted date string
   */
  function formatDate(
    date: Date | string,
    options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
  ): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat(intlLocale.value, options).format(dateObj)
  }

  /**
   * Format number with proper locale
   *
   * @param num - Number to format
   * @param options - Intl.NumberFormatOptions
   * @returns Formatted number string
   */
  function formatNumber(num: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(intlLocale.value, options).format(num)
  }

  /**
   * Get currency symbol for a given currency code
   *
   * @param currency - Currency code (USD, GEL, EUR)
   * @returns Currency symbol ($, ₾, €)
   */
  function getCurrencySymbol(currency: string = 'USD'): string {
    return CURRENCY_SYMBOLS[currency] || '$'
  }

  return {
    intlLocale,
    formatCurrency,
    formatDate,
    formatNumber,
    getCurrencySymbol
  }
}
