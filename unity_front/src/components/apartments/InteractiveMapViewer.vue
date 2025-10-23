<template>
  <div class="interactive-map-viewer relative w-full">
    <svg
      ref="svgElement"
      :viewBox="image?.viewbox || '0 0 1000 1000'"
      :width="image?.width"
      :height="image?.height"
      class="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Background image -->
      <image
        v-if="image?.url"
        :href="image.url"
        :width="image.width"
        :height="image.height"
        x="0"
        y="0"
        preserveAspectRatio="xMidYMid meet"
      />

      <!-- Interactive zones -->
      <polygon
        v-for="zone in zones"
        :key="zone.id"
        :points="coordsToPoints(zone.coords)"
        :fill="getZoneFill(zone)"
        :stroke="getZoneStroke(zone)"
        :stroke-width="isSelected(zone) ? 3 : 2"
        :class="[
          'zone-polygon',
          { 'zone-interactive': !readonly, 'zone-selected': isSelected(zone) },
        ]"
        :aria-label="getZoneLabel(zone)"
        role="button"
        :tabindex="readonly ? -1 : 0"
        @click="handleZoneClick(zone)"
        @mouseenter="handleZoneHover(zone)"
        @mouseleave="handleZoneLeave()"
        @touchstart="handleTouchStart(zone)"
        @touchend="handleTouchEnd(zone)"
        @keydown.enter="handleZoneClick(zone)"
        @keydown.space.prevent="handleZoneClick(zone)"
      />
    </svg>

    <!-- Tooltip on hover (positioned outside SVG) -->
    <Transition name="tooltip-fade">
      <!-- Building/Floor tooltip (has stats) -->
      <div
        v-if="currentHoveredZone && 'stats' in currentHoveredZone"
        class="tooltip-container fixed pointer-events-none z-50 bg-zinc-900/95 backdrop-blur-sm rounded-lg shadow-2xl border-2 border-[#FFCD4B] px-4 py-3"
        :style="tooltipStyle"
      >
        <div class="text-white font-semibold text-sm mb-1">
          {{ getZoneLabel(currentHoveredZone) }}
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-zinc-300 text-xs">Available:</span>
          <span class="font-bold text-[#4ade80] text-base">{{ currentHoveredZone.stats.available }}</span>
        </div>
        <!-- Tooltip arrow - dynamically positioned -->
        <div :class="tooltipArrowClass"></div>
      </div>
      
      <!-- Apartment tooltip (has apartment_number) -->
      <div
        v-else-if="currentHoveredZone && 'apartment_number' in currentHoveredZone"
        class="tooltip-container fixed pointer-events-none z-50 bg-zinc-900/95 backdrop-blur-sm rounded-lg shadow-2xl border-2 border-[#FFCD4B] px-5 py-4"
        :style="tooltipStyle"
      >
        <div class="text-[#FFCD4B] font-bold text-lg mb-2">
          {{ currentHoveredZone.apartment_number }}
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-zinc-300 text-sm">Area:</span>
          <span class="font-semibold text-white text-base">{{ currentHoveredZone.area_total || 'N/A' }} m²</span>
        </div>
        <!-- Tooltip arrow - dynamically positioned -->
        <div :class="tooltipArrowClass"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ZoneImage, BuildingZone, FloorZone, ApartmentZone } from '@/types/apartments'

interface Props {
  image: ZoneImage | null
  zones: (BuildingZone | FloorZone | ApartmentZone)[]
  selectedZoneId?: number | null
  hoveredZone?: BuildingZone | FloorZone | ApartmentZone | null
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectedZoneId: null,
  hoveredZone: null,
  readonly: false,
})

// Debug logging
watch(() => props.zones, (newZones) => {
  console.log('🎨 InteractiveMapViewer - Zones updated:', {
    count: newZones.length,
    zones: newZones,
    image: props.image
  })
}, { immediate: true })

watch(() => props.image, (newImage) => {
  console.log('🖼️ InteractiveMapViewer - Image updated:', newImage)
}, { immediate: true })

const emit = defineEmits<{
  'zone-click': [zone: BuildingZone | FloorZone | ApartmentZone]
  'zone-hover': [zone: BuildingZone | FloorZone | ApartmentZone | null]
}>()

const svgElement = ref<SVGSVGElement | null>(null)
const localHoveredZoneId = ref<number | null>(null)
const touchStartZoneId = ref<number | null>(null)

/**
 * Get the current hovered zone (from props or local state)
 */
const currentHoveredZone = computed(() => {
  if (props.hoveredZone) {
    return props.hoveredZone
  }
  return props.zones.find(z => z.id === localHoveredZoneId.value) || null
})

/**
 * Convert SVG coordinates to screen coordinates
 */
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

/**
 * Calculate tooltip position for arrow direction
 */
const tooltipPosition = computed(() => {
  if (!currentHoveredZone.value || !('bbox' in currentHoveredZone.value)) {
    return 'right'
  }

  const zone = currentHoveredZone.value
  const bbox = zone.bbox
  const width = bbox.max_x - bbox.min_x
  const height = bbox.max_y - bbox.min_y

  // Check zone type directly for more reliable detection
  const isFloorStrip = 'floor_number' in zone
  const isBuildingBlock = 'building_identifier' in zone

  if (isFloorStrip) {
    return 'above'
  } else if (isBuildingBlock) {
    const centerY = bbox.min_y + (height / 2)
    const rightEdge = svgToScreenCoordinates(bbox.max_x, centerY)
    const spaceOnRight = window.innerWidth - rightEdge.x

    return spaceOnRight > 200 ? 'right' : 'left'
  } else {
    const isHorizontal = width > height * 2
    return isHorizontal ? 'above' : 'right'
  }
})

/**
 * Tooltip positioning style - positions tooltip smartly based on zone type and screen position
 */
const tooltipStyle = computed(() => {
  if (!currentHoveredZone.value || !('bbox' in currentHoveredZone.value)) {
    return { display: 'none' }
  }

  const zone = currentHoveredZone.value
  const bbox = zone.bbox
  const width = bbox.max_x - bbox.min_x
  const height = bbox.max_y - bbox.min_y

  // Calculate zone center
  const centerX = bbox.min_x + (width / 2)
  const centerY = bbox.min_y + (height / 2)

  // Convert SVG coordinates to screen coordinates
  const center = svgToScreenCoordinates(centerX, centerY)
  const topEdge = svgToScreenCoordinates(centerX, bbox.min_y)
  const rightEdge = svgToScreenCoordinates(bbox.max_x, centerY)

  // Check zone type directly for more reliable detection
  const isFloorStrip = 'floor_number' in zone
  const isBuildingBlock = 'building_identifier' in zone

  if (isFloorStrip) {
    // For floor strips, always position centered above
    return {
      left: `${center.x}px`,
      top: `${topEdge.y - 20}px`,
      transform: 'translate(-50%, -100%)',
    }
  } else if (isBuildingBlock) {
    // For building blocks, position to the right or left
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
    // Fallback: use dimension check
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

/**
 * Tooltip arrow classes based on position
 */
const tooltipArrowClass = computed(() => {
  const base = 'absolute w-3 h-3 bg-zinc-900 border-[#FFCD4B] transform rotate-45'

  switch (tooltipPosition.value) {
    case 'right':
      return `${base} border-l-2 border-b-2 -left-1.5 top-1/2 -translate-y-1/2`
    case 'left':
      return `${base} border-r-2 border-t-2 -right-1.5 top-1/2 -translate-y-1/2`
    case 'above':
      return `${base} border-r-2 border-b-2 -bottom-1.5 left-1/2 -translate-x-1/2`
    default:
      return `${base} border-l-2 border-b-2 -left-1.5 top-1/2 -translate-y-1/2`
  }
})

/**
 * Convert coordinate array to SVG polygon points string
 */
function coordsToPoints(coords: [number, number][]): string {
  return coords.map((coord) => `${coord[0]},${coord[1]}`).join(' ')
}

/**
 * Get the current fill color for a zone (transparent with golden hover, status-based for apartments)
 */
function getZoneFill(zone: BuildingZone | FloorZone | ApartmentZone): string {
  const isHovered = (currentHoveredZone.value?.id === zone.id) || (localHoveredZoneId.value === zone.id)
  
  // Check if this is an apartment zone
  if ('apartment_number' in zone) {
    const apartment = zone as ApartmentZone
    
    if (isHovered) {
      // Golden transparent on hover
      return 'rgba(255, 205, 75, 0.7)'
    }
    
    // Different colors based on status
    switch (apartment.status) {
      case 'available':
        // Green for available apartments
        return 'rgba(34, 197, 94, 0.25)'
      case 'reserved':
        // Amber/Orange for reserved
        return 'rgba(255, 165, 0, 0.4)'
      case 'sold':
        // Red for sold
        return 'rgba(239, 68, 68, 0.4)'
      default:
        return 'rgba(255, 255, 255, 0)'
    }
  }
  
  // For buildings and floors
  if (isHovered) {
    // Golden transparent on hover
    return 'rgba(255, 205, 75, 0.35)'
  }
  
  // Fully transparent when not hovered
  return 'rgba(255, 255, 255, 0)'
}

/**
 * Get stroke color (golden for hover, status-based for apartments, subtle for buildings/floors)
 */
function getZoneStroke(zone: BuildingZone | FloorZone | ApartmentZone): string {
  const isHovered = (currentHoveredZone.value?.id === zone.id) || (localHoveredZoneId.value === zone.id)
  
  if (isHovered) {
    // Golden stroke on hover
    return '#FFCD4B'
  }
  
  // Check if this is an apartment zone
  if ('apartment_number' in zone) {
    const apartment = zone as ApartmentZone
    
    // More visible strokes for apartments based on status
    switch (apartment.status) {
      case 'available':
        // Green stroke for available
        return 'rgba(34, 197, 94, 0.8)'
      case 'reserved':
        // Orange stroke for reserved
        return 'rgba(255, 165, 0, 0.9)'
      case 'sold':
        // Red stroke for sold
        return 'rgba(239, 68, 68, 0.8)'
      default:
        return 'rgba(255, 255, 255, 0.1)'
    }
  }
  
  // Very subtle stroke for buildings/floors normally
  return 'rgba(255, 255, 255, 0.1)'
}

/**
 * Check if a zone is currently selected
 */
function isSelected(zone: BuildingZone | FloorZone | ApartmentZone): boolean {
  return props.selectedZoneId === zone.id
}

/**
 * Get accessible label for a zone
 */
function getZoneLabel(zone: BuildingZone | FloorZone | ApartmentZone): string {
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

/**
 * Handle zone click
 */
function handleZoneClick(zone: BuildingZone | FloorZone | ApartmentZone) {
  if (props.readonly) return
  emit('zone-click', zone)
}

/**
 * Handle zone hover
 */
function handleZoneHover(zone: BuildingZone | FloorZone | ApartmentZone) {
  if (props.readonly) return
  
  localHoveredZoneId.value = zone.id
  emit('zone-hover', zone)
}

/**
 * Handle zone leave
 */
function handleZoneLeave() {
  if (props.readonly) return
  localHoveredZoneId.value = null
  emit('zone-hover', null)
}

/**
 * Handle touch start for mobile
 */
function handleTouchStart(zone: BuildingZone | FloorZone | ApartmentZone) {
  if (props.readonly) return
  touchStartZoneId.value = zone.id
  localHoveredZoneId.value = zone.id
  emit('zone-hover', zone)
}

/**
 * Handle touch end for mobile
 */
function handleTouchEnd(zone: BuildingZone | FloorZone | ApartmentZone) {
  if (props.readonly) return
  if (touchStartZoneId.value === zone.id) {
    handleZoneClick(zone)
  }
  handleZoneLeave()
  touchStartZoneId.value = null
}
</script>

<style scoped>
.interactive-map-viewer {
  width: 100%;
  max-width: 100%;
  height: auto;
  overflow: hidden;
}

.zone-polygon {
  transition: fill 0.2s ease, stroke-width 0.2s ease;
}

.zone-interactive {
  cursor: pointer;
}

.zone-interactive:hover {
  filter: brightness(1.1);
}

.zone-interactive:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.zone-selected {
  filter: brightness(1.2);
}

svg {
  display: block;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.15s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
}
</style>
