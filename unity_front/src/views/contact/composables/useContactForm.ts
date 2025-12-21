/**
 * useContactForm - Composable for contact form and page logic
 * Handles form state, phone validation, FAQ toggle, and scroll animations
 */

import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useContactPage } from '@/composables/pages/useContactPage'
import { useScrollAnimation } from '@/composables/animations/useScrollAnimation'
import { useToastStore } from '@/stores/ui/toast'
import { customerApi, type CustomerData } from '@/services/customerApi'

interface PhoneInputObject {
  valid: boolean
  number: string
  formatInternational: string
  country?: {
    iso2: string
    name: string
  }
}

export function useContactForm() {
  // ============================================
  // COMPOSABLES
  // ============================================
  const { t } = useTranslations()
  const toastStore = useToastStore()
  const {
    contactInfo,
    socialLinks,
    mapCoordinates,
    formSubjects,
    faqs,
    officeDays,
    loadContactPage,
  } = useContactPage()

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================
  const { element: heroElement, isVisible: heroVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
  const { element: formElement, isVisible: formVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
  const { element: contactInfoElement, isVisible: contactInfoVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
  const { element: mapElement, isVisible: mapVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
  const { element: faqElement, isVisible: faqVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
  const { element: ctaElement, isVisible: ctaVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })

  // ============================================
  // FORM STATE
  // ============================================
  const form = reactive({
    name: '',
    email: '',
    phone: '',
    message: '',
    subject: 'general',
  })

  const scrollProgress = ref(0)
  const isSubmitting = ref(false)
  const isSubmitted = ref(false)
  const openFaq = ref<number | null>(null)
  const mapLoaded = ref(false)
  const isDropdownOpen = ref(false)
  const isValidPhone = ref(false)

  // ============================================
  // COMPUTED
  // ============================================
  const selectedSubject = computed(() => {
    return formSubjects.value.find((subject) => subject.value === form.subject)
  })

  const validateForm = computed(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !!(form.name.trim() && emailRegex.test(form.email) && form.message.trim())
  })

  // ============================================
  // VUE TEL INPUT
  // ============================================
  const vueTelInputProps = {
    mode: 'international',
    defaultCountry: 'GE',
    validCharactersOnly: true,
    autoFormat: true,
    preferredCountries: ['GE', 'IL', 'RU', 'AZ', 'TR'],
    dropdownOptions: {
      showDialCodeInSelection: true,
      showFlags: true,
      showSearchBox: true,
    },
    inputOptions: {
      placeholder: '555 123 456',
      maxlength: 25,
      showDialCode: false,
    },
  }

  // ============================================
  // HANDLERS
  // ============================================
  const handleScroll = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    scrollProgress.value = (scrollTop / docHeight) * 100
  }

  const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value
  }

  const selectSubject = (value: string) => {
    form.subject = value
    isDropdownOpen.value = false
  }

  const closeDropdown = () => {
    setTimeout(() => {
      isDropdownOpen.value = false
    }, 150)
  }

  const handlePhoneInput = (number: string, phoneObject?: PhoneInputObject) => {
    form.phone = number
    if (phoneObject) {
      isValidPhone.value = phoneObject.valid || false
    } else {
      isValidPhone.value = false
    }
  }

  const toggleFaq = (index: number) => {
    openFaq.value = openFaq.value === index ? null : index
  }

  const submitForm = async () => {
    if (!validateForm.value) return

    isSubmitting.value = true

    try {
      const customerData: CustomerData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message,
        source: 'contact_form',
      }

      const response = await customerApi.submit(customerData)

      if (response.success) {
        Object.keys(form).forEach((key) => {
          form[key as keyof typeof form] = key === 'subject' ? 'general' : ''
        })

        isSubmitted.value = true
        toastStore.success(
          t('contact.form.success.title') || 'წარმატებული',
          response.message || t('contact.form.success.message') || 'თქვენი შეტყობინება გაიგზავნა',
        )

        setTimeout(() => {
          isSubmitted.value = false
        }, 5000)
      } else {
        throw new Error(response.message || 'დაფიქსირდა შეცდომა')
      }
    } catch (err: unknown) {
      const error = err as { message?: string }
      toastStore.error(
        t('messages.error_title') || 'შეცდომა',
        error.message || t('messages.error_message') || 'გთხოვთ სცადოთ მოგვიანებით',
      )
    } finally {
      isSubmitting.value = false
    }
  }

  const scrollToForm = () => {
    const formSection = document.getElementById('contact-form')
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(async () => {
    await loadContactPage()
    setTimeout(() => {
      mapLoaded.value = true
    }, 500)
    window.addEventListener('scroll', handleScroll)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // Translations
    t,

    // Contact data
    contactInfo,
    socialLinks,
    mapCoordinates,
    formSubjects,
    faqs,
    officeDays,

    // Scroll animations
    heroElement,
    heroVisible,
    formElement,
    formVisible,
    contactInfoElement,
    contactInfoVisible,
    mapElement,
    mapVisible,
    faqElement,
    faqVisible,
    ctaElement,
    ctaVisible,

    // Form state
    form,
    scrollProgress,
    isSubmitting,
    isSubmitted,
    openFaq,
    mapLoaded,
    isDropdownOpen,
    isValidPhone,
    selectedSubject,
    validateForm,
    vueTelInputProps,

    // Handlers
    toggleDropdown,
    selectSubject,
    closeDropdown,
    handlePhoneInput,
    toggleFaq,
    submitForm,
    scrollToForm,
  }
}
