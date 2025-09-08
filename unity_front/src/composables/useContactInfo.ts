import { computed } from 'vue'
import { useHomepageStore } from '@/stores/public/homepage'

export interface ContactInfo {
  email: string
  phone_numbers: Array<{
    number: string
    display: string
    href: string
  }>
  google_maps_url: string
}

export function useContactInfo() {
  const homepageStore = useHomepageStore()

  const contactInfo = computed((): ContactInfo | null => {
    const contactData = homepageStore.contactInfo
    return contactData || null
  })

  const primaryContactInfo = computed(() => {
    return contactInfo.value
  })

  const email = computed(() => {
    return contactInfo.value?.email || 'info@unitydev.ge'
  })

  const phoneNumbers = computed(() => {
    return (
      contactInfo.value?.phone_numbers || [
        {
          number: '032300333',
          href: 'tel:032300333',
          display: '032 2 300 333',
        },
        {
          number: '995577300333',
          href: 'tel:995577300333',
          display: '995 577 300 333',
        },
      ]
    )
  })

  const googleMapsUrl = computed(() => {
    return contactInfo.value?.google_maps_url || '#'
  })

  return {
    contactInfo,
    primaryContactInfo,
    email,
    phoneNumbers,
    googleMapsUrl,
  }
}
