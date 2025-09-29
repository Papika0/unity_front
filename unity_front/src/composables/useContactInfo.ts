import { computed, onMounted } from 'vue'
import { useFooterStore } from '@/stores/public/footer'

export interface ContactInfo {
  email: string
  phone_numbers: Array<{
    number: string
    display: string
    href: string
  }>
  google_maps_url: string
  address: string
}

export function useContactInfo() {
  const footerStore = useFooterStore()

  // Ensure footer data is loaded when contact info is accessed
  const ensureFooterDataLoaded = async () => {
    // Always try to load if we don't have data
    if (!footerStore.isFetched || footerStore.isDataEmpty) {
      try {
        await footerStore.loadFooterData()
      } catch (error) {
        console.error('Failed to load footer data for contact info:', error)
      }
    }
  }

  // Load footer data when composable is initialized
  onMounted(() => {
    ensureFooterDataLoaded()
  })

  const contactInfo = computed((): ContactInfo | null => {
    const contactData = footerStore.contact
    return contactData
      ? {
          email: contactData.email,
          phone_numbers: contactData.phone_numbers,
          google_maps_url: contactData.google_maps_url,
          address: contactData.address,
        }
      : null
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

  const address = computed(() => {
    return contactInfo.value?.address || 'იუნკერთა ქუჩა 1'
  })

  return {
    contactInfo,
    primaryContactInfo,
    email,
    phoneNumbers,
    googleMapsUrl,
    address,
  }
}
