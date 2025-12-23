import { useLocaleStore } from '@/stores/ui/locale'

export const formatDate = (dateString: string | null) => {
  if (!dateString) return ''
  
  const localeStore = useLocaleStore()
  const date = new Date(dateString)

  if (localeStore.currentLocale === 'ka') {
    const georgianMonths = [
      'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
      'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
    ]
    return `${georgianMonths[date.getMonth()]} ${date.getFullYear()}`
  }

  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'ru': 'ru-RU'
  }
  const locale = localeMap[localeStore.currentLocale] || 'en-US'

  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
  })
}

export const formatDescription = (description: string) => {
  if (!description) return ''

  // Split by double line breaks to create paragraphs
  const paragraphs = description.split(/\r\n\s*\r\n/).filter((p) => p.trim())

  return paragraphs
    .map((paragraph) => {
      const trimmed = paragraph.trim()

      // Check if it's a bullet point list
      if (trimmed.includes('*')) {
        const lines = trimmed.split(/\r\n/).filter((line) => line.trim())
        const listItems = lines
          .filter((line) => line.trim().startsWith('*'))
          .map(
            (line) =>
              `<li class="mb-3 text-zinc-700 leading-relaxed">${line.replace(/^\*\s*/, '')}</li>`,
          )
          .join('')

        if (listItems) {
          return `<ul class="custom-list my-6">${listItems}</ul>`
        }
      }

      // Regular paragraph
      return `<p class="mb-6 text-zinc-700 leading-relaxed">${trimmed.replace(/\r\n/g, '<br>')}</p>`
    })
    .join('')
}
