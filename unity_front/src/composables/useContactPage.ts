import { ref, computed } from 'vue'
import { getContactSettings, type ContactSettings } from '@/services/contactApi'
import { useTranslationsStore } from '@/stores/ui/translations'

export function useContactPage() {
  const contactSettings = ref<ContactSettings | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const translationStore = useTranslationsStore()

  const loadContactPage = async () => {
    if (contactSettings.value && translationStore.arePageGroupsLoaded('contact')) {
      return // Already loaded
    }

    isLoading.value = true
    error.value = null

    try {
      // Get missing groups for contact page
      const missingGroups = translationStore.getMissingGroups('contact')

      // Get locale from translation store
      const locale = translationStore.currentLocale

      // Make single API call to contact endpoint with translation groups
      const contactResponse = await getContactSettings({
        locale: locale,
        groups: missingGroups,
      })

      if (contactResponse.data) {
        // Set contact settings
        contactSettings.value = contactResponse.data.contact_settings

        // Merge translations into the store if they exist
        if (contactResponse.data.translations) {
          translationStore.mergeTranslations(contactResponse.data.translations)
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load contact page'
      console.error('Failed to load contact page:', err)
    } finally {
      isLoading.value = false
    }
  }

  // Computed properties for easy access to specific data
  const contactInfo = computed(() => {
    if (!contactSettings.value) return null

    const locale = translationStore.currentLocale

    const contactInfoItems = [
      {
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>`,
        title: translationStore.t('contact.address') || 'Address',
        value:
          contactSettings.value.contact_info.address.value[locale] ||
          contactSettings.value.contact_info.address.value.ka ||
          '',
        subtitle:
          contactSettings.value.contact_info.address.subtitle[locale] ||
          contactSettings.value.contact_info.address.subtitle.ka ||
          '',
      },
      {
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
        </svg>`,
        title: translationStore.t('contact.phone') || 'Phone',
        value: contactSettings.value.contact_info.phone.value, // Keep original for template compatibility
        phones: [
          {
            number: contactSettings.value.contact_info.phone.value,
            href: `tel:${contactSettings.value.contact_info.phone.value}`,
          },
          ...(contactSettings.value.contact_info.phone2.value
            ? [
                {
                  number: contactSettings.value.contact_info.phone2.value,
                  href: `tel:${contactSettings.value.contact_info.phone2.value}`,
                },
              ]
            : []),
        ],
        subtitle:
          contactSettings.value.contact_info.phone.subtitle[locale] ||
          contactSettings.value.contact_info.phone.subtitle.ka ||
          '',
      },
    ]

    // Add remaining contact info items
    contactInfoItems.push(
      {
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>`,
        title: translationStore.t('contact.email') || 'Email',
        value: contactSettings.value.contact_info.email.value, // Email is not multilingual
        subtitle:
          contactSettings.value.contact_info.email.subtitle[locale] ||
          contactSettings.value.contact_info.email.subtitle.ka ||
          '',
      },
      {
        icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>`,
        title: translationStore.t('contact.hours') || 'Hours',
        value:
          contactSettings.value.contact_info.hours.value[locale] ||
          contactSettings.value.contact_info.hours.value.ka ||
          '',
        subtitle:
          contactSettings.value.contact_info.hours.subtitle[locale] ||
          contactSettings.value.contact_info.hours.subtitle.ka ||
          '',
      },
    )

    return contactInfoItems
  })

  const socialLinks = computed(() => {
    if (!contactSettings.value) return []

    return [
      {
        name: 'Facebook',
        icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>`,
        url: contactSettings.value.social_links.facebook,
        color: 'hover:bg-blue-600',
      },
      {
        name: 'Instagram',
        icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
        </svg>`,
        url: contactSettings.value.social_links.instagram,
        color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600',
      },
    ].filter((social) => social.url)
  })

  const mapCoordinates = computed(() => {
    if (!contactSettings.value) return null
    return contactSettings.value.map_settings
  })

  const formSubjects = computed(() => {
    if (!contactSettings.value) return []

    const locale = translationStore.currentLocale

    return contactSettings.value.form_subjects.map((subject) => ({
      value: subject.value,
      label: subject.label[locale] || subject.label.ka || subject.label.en || '',
    }))
  })

  const faqs = computed(() => {
    if (!contactSettings.value) return []

    const locale = translationStore.currentLocale

    return contactSettings.value.faqs.map((faq) => ({
      question: faq.question[locale] || faq.question.ka || faq.question.en || '',
      answer: faq.answer[locale] || faq.answer.ka || faq.answer.en || '',
    }))
  })

  const officeDays = computed(() => {
    if (!contactSettings.value) return { working: [], weekend: [] }

    const locale = translationStore.currentLocale

    // Day name translation mapping for different locales (shortened versions)
    const dayTranslations: Record<string, Record<string, string>> = {
      ka: {
        Mon: 'ორშ',
        Tue: 'სამ',
        Wed: 'ოთხ',
        Thu: 'ხუთ',
        Fri: 'პარ',
        Sat: 'შაბ',
        Sun: 'კვი',
      },
      en: {
        Mon: 'Mon',
        Tue: 'Tue',
        Wed: 'Wed',
        Thu: 'Thu',
        Fri: 'Fri',
        Sat: 'Sat',
        Sun: 'Sun',
      },
      ru: {
        Mon: 'Пн',
        Tue: 'Вт',
        Wed: 'Ср',
        Thu: 'Чт',
        Fri: 'Пт',
        Sat: 'Сб',
        Sun: 'Вс',
      },
    }

    const translations = dayTranslations[locale] || dayTranslations.en

    return {
      working: contactSettings.value.office_days.working.map((day) => translations[day] || day),
      weekend: contactSettings.value.office_days.weekend.map((day) => translations[day] || day),
    }
  })

  return {
    // State
    contactSettings,
    isLoading,
    error,

    // Actions
    loadContactPage,

    // Computed data
    contactInfo,
    socialLinks,
    mapCoordinates,
    formSubjects,
    faqs,
    officeDays,
  }
}
