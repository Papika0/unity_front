/**
 * useInteractiveMap Composable
 * Handles zone styling, coordinate conversion, and tooltip positioning logic
 */

import { ref, computed, type Ref } from 'vue'
import type { BuildingZone, FloorZone, ApartmentZone, ApartmentStatus } from '@/types/apartments'
import { useTranslations } from '@/composables/i18n/useTranslations'

export type ZoneType = BuildingZone | FloorZone | ApartmentZone

export function useInteractiveMap(
  svgElement: Ref<SVGSVGElement | null>,
  zones: Ref<ZoneType[]>,
  hoveredZoneFromProps: Ref<ZoneType | null>
) {
  const { t } = useTranslations()
  const localHoveredZoneId = ref<number | null>(null)

  // ==================== GETTERS ====================
  const currentHoveredZone = computed(() => {
    if (hoveredZoneFromProps.value) {
      return hoveredZoneFromProps.value
    }
    return zones.value.find(z => z.id === localHoveredZoneId.value) || null
  })

  // ==================== ZONE HELPERS ====================
  function isZoneInteractive(zone: ZoneType): boolean {
    if ('status' in zone && zone.status === 'sold') {
      return false
    }
    return true
  }

  function getStatusLabel(status: ApartmentStatus): string {
    return t(`status.${status}`)
  }

  function coordsToPoints(coords: [number, number][]): string {
    return coords.map((coord) => `${coord[0]},${coord[1]}`).join(' ')
  }

  function getZoneCenter(zone: ZoneType) {
    if (!('bbox' in zone)) return { x: 0, y: 0 }
    
    const bbox = zone.bbox
    const width = bbox.max_x - bbox.min_x
    const height = bbox.max_y - bbox.min_y
    
    return {
      x: bbox.min_x + width / 2,
      y: bbox.min_y + height / 2
    }
  }

  function getZoneLabel(zone: ZoneType): string {
    if ('label' in zone && zone.label) {
      return zone.label
    }
    if ('building_identifier' in zone) {
      return `Building ${zone.building_identifier}`
    }
    if ('floor_number' in zone) {
      return `Floor ${zone.floor_number}`
    }
    if ('apartment_number' in zone) {
      return `Apartment ${zone.apartment_number}`
    }
    return 'Zone'
  }

  // ==================== STYLING ====================
  function getZoneFill(zone: ZoneType): string {
    if ('apartment_number' in zone) {
      const apartment = zone as ApartmentZone
      const isHovered = (currentHoveredZone.value?.id === zone.id) || (localHoveredZoneId.value === zone.id)
      const opacity = isHovered ? 0.45 : 0.25
      
      switch (apartment.status) {
        case 'available':
          return `rgba(16, 185, 129, ${opacity})`
        case 'reserved':
          return `rgba(255, 205, 75, ${opacity})`
        case 'sold':
          return `rgba(161, 161, 170, ${opacity})`
        default:
          return 'rgba(255, 255, 255, 0)'
      }
    }
    
    const isHovered = (currentHoveredZone.value?.id === zone.id) || (localHoveredZoneId.value === zone.id)
    if (isHovered) {
      return 'rgba(255, 205, 75, 0.2)'
    }
    return 'rgba(255, 255, 255, 0)'
  }

  function getZoneStroke(zone: ZoneType): string {
    const isHovered = (currentHoveredZone.value?.id === zone.id) || (localHoveredZoneId.value === zone.id)
    
    if ('apartment_number' in zone) {
      const apartment = zone as ApartmentZone
      const opacity = isHovered ? 1 : 0.6
      
      switch (apartment.status) {
        case 'available':
          return `rgba(16, 185, 129, ${opacity})`
        case 'reserved':
          return `rgba(255, 205, 75, ${opacity})`
        case 'sold':
          return `rgba(161, 161, 170, ${opacity})`
        default:
          return 'rgba(255, 255, 255, 0.2)'
      }
    }
    
    if (isHovered) {
      return '#FFCD4B'
    }
    return 'rgba(255, 255, 255, 0)'
  }

  // ==================== COORDINATE CONVERSION ====================
  function svgToScreenCoordinates(svgX: number, svgY: number) {
    if (!svgElement.value) {
      return { x: 0, y: 0 }
    }

    const svg = svgElement.value
    const rect = svg.getBoundingClientRect()
    const viewBox = svg.viewBox.baseVal
    
    const scaleX = rect.width / viewBox.width
    const scaleY = rect.height / viewBox.height
    
    return {
      x: rect.left + (svgX - viewBox.x) * scaleX,
      y: rect.top + (svgY - viewBox.y) * scaleY,
    }
  }

  // ==================== TOOLTIP POSITIONING ====================
  const tooltipStyle = computed((): Record<string, string> => {
    if (!currentHoveredZone.value || !('bbox' in currentHoveredZone.value)) {
      return { display: 'none', left: '0', top: '0', transform: 'none' }
    }

    const zone = currentHoveredZone.value
    const bbox = zone.bbox
    const width = bbox.max_x - bbox.min_x
    const height = bbox.max_y - bbox.min_y

    const centerX = bbox.min_x + (width / 2)
    const centerY = bbox.min_y + (height / 2)

    const center = svgToScreenCoordinates(centerX, centerY)
    const topEdge = svgToScreenCoordinates(centerX, bbox.min_y)
    const rightEdge = svgToScreenCoordinates(bbox.max_x, centerY)

    const isFloorStrip = 'floor_number' in zone
    const isBuildingBlock = 'building_identifier' in zone

    if (isFloorStrip) {
      return {
        left: `${center.x}px`,
        top: `${topEdge.y - 20}px`,
        transform: 'translate(-50%, -100%)',
      }
    } else if (isBuildingBlock) {
      const spaceOnRight = window.innerWidth - rightEdge.x
      if (spaceOnRight > 200) {
        return {
          left: `${rightEdge.x + 20}px`,
          top: `${center.y}px`,
          transform: 'translateY(-50%)',
        }
      } else {
        const leftEdge = svgToScreenCoordinates(bbox.min_x, centerY)
        return {
          left: `${leftEdge.x - 20}px`,
          top: `${center.y}px`,
          transform: 'translate(-100%, -50%)',
        }
      }
    } else {
      const isHorizontal = width > height * 2
      if (isHorizontal) {
        return {
          left: `${center.x}px`,
          top: `${topEdge.y - 20}px`,
          transform: 'translate(-50%, -100%)',
        }
      } else {
        return {
          left: `${rightEdge.x + 20}px`,
          top: `${center.y}px`,
          transform: 'translateY(-50%)',
        }
      }
    }
  })

  // ==================== ADAPTIVE FONT SIZE ====================
  function getAdaptiveFontSize(zone: ApartmentZone): string {
    if (!('bbox' in zone)) return '12px'
    
    const width = zone.bbox.max_x - zone.bbox.min_x
    const text = getStatusLabel(zone.status)
    const length = text.length
    
    let factor = 1.8
    const isGeorgian = /[\u10A0-\u10FF]/.test(text)
    
    if (isGeorgian) {
      factor = 1.9
    }
    
    const divisor = Math.max(8, length * factor)
    const size = width / divisor
    
    return `${Math.min(40, Math.max(8, size))}px`
  }

  // ==================== RETURN ====================
  return {
    // State
    localHoveredZoneId,
    currentHoveredZone,
    tooltipStyle,
    // Functions
    isZoneInteractive,
    getStatusLabel,
    coordsToPoints,
    getZoneCenter,
    getZoneLabel,
    getZoneFill,
    getZoneStroke,
    getAdaptiveFontSize,
    svgToScreenCoordinates,
  }
}
