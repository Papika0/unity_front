/**
 * useApartmentDetail - Composable for apartment detail view logic
 * Handles apartment data loading, room list parsing, status styling, and navigation
 */

import { onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from '@/composables/i18n/useTranslations'
import { useApartmentNavigationStore } from '@/stores/public/apartmentNavigation'
import type { ApartmentStatus } from '@/types/apartments'
import { 
  BedDouble, 
  Bath, 
  ChefHat, 
  Sofa, 
  DoorOpen, 
  Shirt, 
  Maximize,
  Wind,
  Box
} from 'lucide-vue-next'

interface Props {
  apartmentId: number
  projectId?: number
  buildingIdentifier?: string
  floorNumber?: number
  isInline?: boolean
}

interface RoomItem {
  key: string
  label: string
  area: number
  icon: typeof Maximize
}

export function useApartmentDetail(props: Props, emit: (event: 'back') => void) {
  // ============================================
  // STORES & ROUTER
  // ============================================
  const router = useRouter()
  const { t } = useTranslations()
  const apartmentStore = useApartmentNavigationStore()

  // ============================================
  // COMPUTED
  // ============================================
  const apartment = computed(() => apartmentStore.selectedApartment)
  const isLoading = computed(() => apartmentStore.isLoading)
  const error = computed(() => apartmentStore.error)

  const roomList = computed(() => {
    let details = apartment.value?.room_details
    
    // Handle stringified JSON from backend
    if (typeof details === 'string') {
      try {
        details = JSON.parse(details)
      } catch (e) {
        console.error('Failed to parse room_details', e)
        return []
      }
    }

    if (!details) return []
    const list: RoomItem[] = []
    
    // Helper to process room group
    const processGroup = (group: Record<string, number> | undefined) => {
      if (!group) return
      Object.entries(group).forEach(([key, area]) => {
        let label = ''
        let icon: typeof Maximize = Maximize // Default icon

        // Dynamic Bedroom Parsing
        const bedroomMatch = key.match(/^bedroom_?(\d+)$/)
        if (bedroomMatch) {
           label = `${t('apartments.rooms.bedroom')} ${bedroomMatch[1]}`
           icon = BedDouble
        } 
        // Dynamic Bathroom Parsing
        else if (key.match(/^bathroom_?(\d+)$/)) {
           const match = key.match(/^bathroom_?(\d+)$/)
           label = `${t('apartments.rooms.bathroom')} ${match ? match[1] : ''}`
           icon = Bath
        }
        // Specific Known Rooms
        else if (key.includes('living') || key.includes('studio')) {
            label = t(`apartments.rooms.${key}`)
            icon = Sofa
        }
        else if (key.includes('kitchen')) {
            label = t(`apartments.rooms.${key}`)
            icon = ChefHat
        }
        else if (key.includes('hall') || key.includes('corridor') || key.includes('entrance')) {
            label = t(`apartments.rooms.${key}`)
            icon = DoorOpen
        }
        else if (key.includes('dressing') || key.includes('wardrobe')) {
            label = t(`apartments.rooms.${key}`)
            icon = Shirt
        }
        else if (key.includes('balcony')) {
            label = t(`apartments.rooms.${key}`)
            icon = Wind
        }
        else {
            // Fallback
            label = t(`apartments.rooms.${key}`)
            icon = Box
        }

        list.push({ key, label, area, icon })
      })
    }

    processGroup(details.bedrooms)
    processGroup(details.bathrooms)
    processGroup(details.other_rooms)
    
    return list
  })

  // ============================================
  // ACTIONS
  // ============================================
  async function loadData() {
    await apartmentStore.loadApartmentDetail(props.apartmentId)
  }

  function goBack() {
    if (props.isInline) {
      emit('back')
    } else {
      // Global/Standalone mode - go back to preserve history/filters
      if (window.history.length > 1) {
        router.back()
      } else {
        router.push({ name: 'apartments' })
      }
    }
  }

  // ============================================
  // FORMATTERS
  // ============================================
  function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US').format(price)
  }

  function getStatusClasses(status: ApartmentStatus) {
    if (props.isInline) {
        // Light mode status
         switch (status) {
            case 'available': return 'bg-emerald-50 text-emerald-600 border-emerald-200'
            case 'reserved': return 'bg-orange-50 text-orange-600 border-orange-200'
            case 'sold': return 'bg-red-50 text-red-600 border-red-200'
            default: return 'bg-zinc-50 text-zinc-500 border-zinc-200'
        }
    }
    // Dark mode status (legacy support if page used standalone in dark mode)
    switch (status) {
        case 'available': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        case 'reserved': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
        case 'sold': return 'bg-red-500/20 text-red-400 border-red-500/30'
        default: return 'bg-zinc-800 text-zinc-400 border-zinc-700'
    }
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(() => {
    loadData()
  })

  // Watch for prop changes
  watch(() => props.apartmentId, () => {
    loadData()
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // Translations
    t,

    // Store
    apartmentStore,

    // State
    apartment,
    isLoading,
    error,
    roomList,

    // Actions
    loadData,
    goBack,

    // Formatters
    formatPrice,
    getStatusClasses,
  }
}
