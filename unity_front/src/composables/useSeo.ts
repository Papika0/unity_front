import { useHead, useSeoMeta } from '@unhead/vue'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { useLocaleStore, type SupportedLocale } from '@/stores/ui/locale'

// Site constants
const SITE_NAME = 'Unity Development'
const SITE_URL = 'https://unityd.ge'
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`

// Georgian SEO defaults
const DEFAULTS = {
  ka: {
    title: 'Unity Development - უძრავი ქონება საქართველოში',
    description: 'Unity Development - თანამედროვე საცხოვრებელი კომპლექსები და აპარტამენტები თბილისში. მაღალი ხარისხის მშენებლობა, საუკეთესო ლოკაციები.',
    keywords: 'უძრავი ქონება, აპარტამენტები, ბინები, თბილისი, საქართველო, მშენებლობა, საცხოვრებელი კომპლექსი, Unity Development',
  },
  en: {
    title: 'Unity Development - Real Estate in Georgia',
    description: 'Unity Development - Modern residential complexes and apartments in Tbilisi. High quality construction, best locations.',
    keywords: 'real estate, apartments, flats, Tbilisi, Georgia, construction, residential complex, Unity Development',
  },
  ru: {
    title: 'Unity Development - Недвижимость в Грузии',
    description: 'Unity Development - Современные жилые комплексы и квартиры в Тбилиси. Высокое качество строительства, лучшие локации.',
    keywords: 'недвижимость, квартиры, Тбилиси, Грузия, строительство, жилой комплекс, Unity Development',
  },
}

// Locale to Open Graph locale mapping
const OG_LOCALE_MAP: Record<SupportedLocale, string> = {
  ka: 'ka_GE',
  en: 'en_US',
  ru: 'ru_RU',
}

// Language to html lang attribute mapping
const HTML_LANG_MAP: Record<SupportedLocale, string> = {
  ka: 'ka',
  en: 'en',
  ru: 'ru',
}

export interface SeoConfig {
  title?: MaybeRefOrGetter<string | undefined>
  description?: MaybeRefOrGetter<string | undefined>
  keywords?: MaybeRefOrGetter<string | undefined>
  image?: MaybeRefOrGetter<string | undefined>
  url?: MaybeRefOrGetter<string | undefined>
  type?: MaybeRefOrGetter<'website' | 'article' | 'product'>
  publishedTime?: MaybeRefOrGetter<string | undefined>
  modifiedTime?: MaybeRefOrGetter<string | undefined>
  author?: MaybeRefOrGetter<string | undefined>
  noIndex?: MaybeRefOrGetter<boolean>
}

export function useSeo(config: SeoConfig = {}) {
  const localeStore = useLocaleStore()

  const currentLocale = computed(() => localeStore.currentLocale)
  const defaults = computed(() => DEFAULTS[currentLocale.value])

  // Computed values for reactive SEO
  const title = computed(() => {
    const configTitle = toValue(config.title)
    if (configTitle) {
      return `${configTitle} | ${SITE_NAME}`
    }
    return defaults.value.title
  })

  const description = computed(() => {
    return toValue(config.description) || defaults.value.description
  })

  const keywords = computed(() => {
    const configKeywords = toValue(config.keywords)
    if (configKeywords) {
      return `${configKeywords}, ${defaults.value.keywords}`
    }
    return defaults.value.keywords
  })

  const image = computed(() => {
    const configImage = toValue(config.image)
    if (configImage) {
      // If it's a relative URL, prepend the site URL
      if (configImage.startsWith('/')) {
        return `${SITE_URL}${configImage}`
      }
      // If it's already an absolute URL, use it as is
      if (configImage.startsWith('http')) {
        return configImage
      }
      // Otherwise, prepend site URL
      return `${SITE_URL}/${configImage}`
    }
    return DEFAULT_IMAGE
  })

  const url = computed(() => {
    const configUrl = toValue(config.url)
    if (configUrl) {
      if (configUrl.startsWith('http')) {
        return configUrl
      }
      return `${SITE_URL}${configUrl}`
    }
    // Use current path
    if (typeof window !== 'undefined') {
      return `${SITE_URL}${window.location.pathname}`
    }
    return SITE_URL
  })

  const ogLocale = computed(() => OG_LOCALE_MAP[currentLocale.value])
  const htmlLang = computed(() => HTML_LANG_MAP[currentLocale.value])
  const robots = computed(() => toValue(config.noIndex) ? 'noindex, nofollow' : 'index, follow')

  // Use @unhead/vue for head management
  useHead({
    htmlAttrs: {
      lang: htmlLang,
    },
    title,
    link: [
      {
        rel: 'canonical',
        href: url,
      },
    ],
  })

  // Use useSeoMeta for comprehensive SEO meta tags
  useSeoMeta({
    title,
    description,
    keywords,
    author: () => toValue(config.author) || SITE_NAME,
    robots,

    // Open Graph
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogUrl: url,
    ogType: () => toValue(config.type) || 'website',
    ogLocale,
    ogSiteName: SITE_NAME,

    // Twitter
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,

    // Article specific (for news pages)
    articlePublishedTime: () => toValue(config.publishedTime),
    articleModifiedTime: () => toValue(config.modifiedTime),
    articleAuthor: () => toValue(config.author) || SITE_NAME,
  })

  return {
    title,
    description,
    keywords,
    image,
    url,
    currentLocale,
  }
}

// Composable for tracking page views in Google Analytics
export function useAnalytics() {
  const localeStore = useLocaleStore()

  const trackPageView = (pagePath?: string, pageTitle?: string) => {
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
      const gtag = (window as unknown as { gtag: Function }).gtag
      gtag('event', 'page_view', {
        page_path: pagePath || window.location.pathname,
        page_title: pageTitle || document.title,
        language: localeStore.currentLocale,
      })
    }
  }

  const trackEvent = (
    eventName: string,
    eventParams?: Record<string, string | number | boolean>
  ) => {
    if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
      const gtag = (window as unknown as { gtag: Function }).gtag
      gtag('event', eventName, {
        ...eventParams,
        language: localeStore.currentLocale,
      })
    }
  }

  // Track real estate specific events
  const trackProjectView = (projectId: number, projectName: string) => {
    trackEvent('view_item', {
      item_id: projectId.toString(),
      item_name: projectName,
      item_category: 'project',
    })
  }

  const trackApartmentView = (apartmentId: number, projectName: string) => {
    trackEvent('view_item', {
      item_id: apartmentId.toString(),
      item_name: `Apartment ${apartmentId}`,
      item_category: 'apartment',
      item_category2: projectName,
    })
  }

  const trackContactFormSubmit = () => {
    trackEvent('generate_lead', {
      event_category: 'contact',
      event_label: 'contact_form',
    })
  }

  const trackNewsView = (newsId: number, newsTitle: string) => {
    trackEvent('view_item', {
      item_id: newsId.toString(),
      item_name: newsTitle,
      item_category: 'news',
    })
  }

  return {
    trackPageView,
    trackEvent,
    trackProjectView,
    trackApartmentView,
    trackContactFormSubmit,
    trackNewsView,
  }
}

// Composable for structured data (JSON-LD)
export function useStructuredData() {
  const addOrganizationSchema = () => {
    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateAgent',
            'name': 'Unity Development',
            'url': SITE_URL,
            'logo': DEFAULT_IMAGE,
            'description': DEFAULTS.ka.description,
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': 'Tbilisi',
              'addressCountry': 'GE',
            },
            'areaServed': {
              '@type': 'Country',
              'name': 'Georgia',
            },
            'priceRange': '$$',
          }),
        },
      ],
    })
  }

  const addBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
    const breadcrumbItems = items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    }))

    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': breadcrumbItems,
          }),
        },
      ],
    })
  }

  const addProjectSchema = (project: {
    id: number
    title: string
    description: string
    location: string
    main_image?: { url: string } | null
    status: string
  }) => {
    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateListing',
            'name': project.title,
            'description': project.description,
            'url': `${SITE_URL}/projects/${project.id}`,
            'image': project.main_image?.url || DEFAULT_IMAGE,
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': project.location,
              'addressCountry': 'GE',
            },
            'offers': {
              '@type': 'Offer',
              'availability': project.status === 'completed'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/PreOrder',
            },
          }),
        },
      ],
    })
  }

  const addNewsArticleSchema = (article: {
    id: number
    title: string
    excerpt: string
    content: string
    main_image?: { url: string } | null
    publish_date: string
  }) => {
    useHead({
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            'headline': article.title,
            'description': article.excerpt,
            'image': article.main_image?.url || DEFAULT_IMAGE,
            'datePublished': article.publish_date,
            'dateModified': article.publish_date,
            'author': {
              '@type': 'Organization',
              'name': SITE_NAME,
              'url': SITE_URL,
            },
            'publisher': {
              '@type': 'Organization',
              'name': SITE_NAME,
              'logo': {
                '@type': 'ImageObject',
                'url': DEFAULT_IMAGE,
              },
            },
            'mainEntityOfPage': {
              '@type': 'WebPage',
              '@id': `${SITE_URL}/news/${article.id}`,
            },
          }),
        },
      ],
    })
  }

  return {
    addOrganizationSchema,
    addBreadcrumbSchema,
    addProjectSchema,
    addNewsArticleSchema,
  }
}
