import { ref, computed } from 'vue'
import { getContactSettings, type ContactSettings } from '@/services/contactApi'
import { useTranslationsStore } from '@/stores/ui/translations'
import { contactIcons, socialIcons, dayTranslations } from '@/utils/contactIcons'

export function useContactPage() {
  const contactSettings = ref<ContactSettings | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const translationStore = useTranslationsStore()

  // ==================== LOADING ====================
  const loadContactPage = async () => {
    if (contactSettings.value && translationStore.arePageGroupsLoaded('contact')) {
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const missingGroups = translationStore.getMissingGroups('contact')

      const contactResponse = await getContactSettings({ groups: missingGroups })

      if (contactResponse.data) {
        contactSettings.value = contactResponse.data.contact_settings
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

  // ==================== COMPUTED PROPERTIES ====================
  const contactInfo = computed(() => {
    if (!contactSettings.value) return null
    const locale = translationStore.currentLocale
    const settings = contactSettings.value

    return [
      {
        icon: contactIcons.location,
        title: translationStore.t('contact.address') || 'Address',
        value: settings.contact_info.address.value[locale] || settings.contact_info.address.value.ka || '',
        subtitle: settings.contact_info.address.subtitle[locale] || settings.contact_info.address.subtitle.ka || '',
      },
      {
        icon: contactIcons.phone,
        title: translationStore.t('contact.phone') || 'Phone',
        value: settings.contact_info.phone.value,
        phones: [
          { number: settings.contact_info.phone.value, href: `tel:${settings.contact_info.phone.value}` },
          ...(settings.contact_info.phone2.value 
            ? [{ number: settings.contact_info.phone2.value, href: `tel:${settings.contact_info.phone2.value}` }] 
            : []),
        ],
        subtitle: settings.contact_info.phone.subtitle[locale] || settings.contact_info.phone.subtitle.ka || '',
      },
      {
        icon: contactIcons.email,
        title: translationStore.t('contact.email') || 'Email',
        value: settings.contact_info.email.value,
        subtitle: settings.contact_info.email.subtitle[locale] || settings.contact_info.email.subtitle.ka || '',
      },
      {
        icon: contactIcons.clock,
        title: translationStore.t('contact.hours') || 'Hours',
        value: settings.contact_info.hours.value[locale] || settings.contact_info.hours.value.ka || '',
        subtitle: settings.contact_info.hours.subtitle[locale] || settings.contact_info.hours.subtitle.ka || '',
      },
    ]
  })

  const socialLinks = computed(() => {
    if (!contactSettings.value) return []
    return [
      { name: 'Facebook', icon: socialIcons.facebook, url: contactSettings.value.social_links.facebook, color: 'hover:bg-blue-600' },
      { name: 'Instagram', icon: socialIcons.instagram, url: contactSettings.value.social_links.instagram, color: 'hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600' },
    ].filter((social) => social.url)
  })

  const mapCoordinates = computed(() => contactSettings.value?.map_settings || null)

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
    const translations = dayTranslations[locale] || dayTranslations.en
    return {
      working: contactSettings.value.office_days.working.map((day) => translations[day] || day),
      weekend: contactSettings.value.office_days.weekend.map((day) => translations[day] || day),
    }
  })

  // ==================== RETURN ====================
  return {
    contactSettings,
    isLoading,
    error,
    loadContactPage,
    contactInfo,
    socialLinks,
    mapCoordinates,
    formSubjects,
    faqs,
    officeDays,
  }
}
