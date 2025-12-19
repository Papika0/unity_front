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
      <g v-for="zone in zones" :key="zone.id">
        <polygon
          :points="coordsToPoints(zone.coords)"
          :fill="getZoneFill(zone)"
          :stroke="getZoneStroke(zone)"
          :stroke-width="isSelected(zone) ? 3 : 2"
          :class="[
            'zone-polygon',
            { 'zone-interactive': !readonly && isZoneInteractive(zone), 'zone-selected': isSelected(zone) },
          ]"
          :aria-label="getZoneLabel(zone)"
          role="button"
          :tabindex="(readonly || !isZoneInteractive(zone)) ? -1 : 0"
          @click="handleZoneClick(zone)"
          @mouseenter="handleZoneHover(zone)"
          @mouseleave="handleZoneLeave()"
          @touchstart="handleTouchStart(zone)"
          @touchend="handleTouchEnd(zone)"
          @keydown.enter="handleZoneClick(zone)"
          @keydown.space.prevent="handleZoneClick(zone)"
        />
        
        <!-- Center Text / Status Label -->
        <text
          v-if="'apartment_number' in zone && zone.status !== 'available'"
          :x="getZoneCenter(zone).x"
          :y="getZoneCenter(zone).y"
          text-anchor="middle"
          dominant-baseline="middle"
          :transform="`rotate(-30, ${getZoneCenter(zone).x}, ${getZoneCenter(zone).y})`"
          class="pointer-events-none select-none font-bold uppercase tracking-wider drop-shadow-md"
          :style="{
            fontSize: getAdaptiveFontSize(zone),
            fill: 'white',
            opacity: 0.9,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }"
        >
          {{ getStatusLabel(zone.status) }}
        </text>
      </g>
    </svg>

    <!-- Tooltip on hover (positioned outside SVG) -->
    <Teleport to="body">
      <Transition name="tooltip-fade">
        <!-- Building/Floor tooltip (has stats) -->
        <div
          v-if="currentHoveredZone && 'stats' in currentHoveredZone"
          class="tooltip-container fixed pointer-events-none z-[9999] bg-white/95 backdrop-blur-md rounded-xl shadow-xl ring-1 ring-zinc-100 px-5 py-3 transform transition-all duration-200"
          :style="tooltipStyle"
        >
          <div class="text-zinc-900 font-light text-sm mb-1 tracking-wide">
            {{ getZoneLabel(currentHoveredZone) }}
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-zinc-400 text-xs uppercase tracking-wider">{{ t('apartments.available') || 'Available' }}</span>
            <div class="flex items-center gap-1.5">
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span class="font-medium text-zinc-900 text-sm">{{ currentHoveredZone.stats.available }}</span>
            </div>
          </div>
        </div>
        
        <!-- Apartment tooltip -->
        <div
          v-else-if="currentHoveredZone && 'apartment_number' in currentHoveredZone"
          class="tooltip-container fixed pointer-events-none z-[9999] bg-white/95 backdrop-blur-md rounded-xl shadow-xl ring-1 ring-zinc-100 px-6 py-4 min-w-[140px] transform transition-all duration-200"
          :style="tooltipStyle"
        >
          <div class="flex items-center justify-between mb-2 gap-4">
            <span class="text-zinc-400 text-xs uppercase tracking-wider">{{ t('common.apt') || 'Apt.' }}</span>
            <div 
              class="px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider"
              :class="{
                'bg-emerald-100 text-emerald-700': currentHoveredZone.status === 'available',
                'bg-[#FFCD4B]/20 text-yellow-700': currentHoveredZone.status === 'reserved',
                'bg-zinc-100 text-zinc-500': currentHoveredZone.status === 'sold'
              }"
            >
              {{ getStatusLabel(currentHoveredZone.status) }}
            </div>
          </div>
          <div class="text-zinc-900 font-light text-3xl mb-1">
            {{ currentHoveredZone.apartment_number }}
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-zinc-500 text-sm font-light">{{ currentHoveredZone.area_total || 'N/A' }} {{ t('common.sqm') || 'm²' }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { ZoneImage, BuildingZone, FloorZone, ApartmentZone, ApartmentStatus } from '@/types/apartments'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
watch(() => props.zones, (_newZones) => {
  /* console.log('InteractiveMapViewer - Zones updated', _newZones.length) */
}, { immediate: true })

// Helper to determine if a zone should be interactive
function isZoneInteractive(zone: BuildingZone | FloorZone | ApartmentZone): boolean {
  // If it has a status property (ApartmentZone) and is sold, it's not interactive
  if ('status' in zone && zone.status === 'sold') {
    return false
  }
  return true
}

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
 * Get status label text
 */
function getStatusLabel(status: ApartmentStatus): string {
  // Use generic translation key
  // Expected keys: status.available, status.reserved, status.sold
  return t(`status.${status}`)
}

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
 * Calculate adaptive font size based on text length and language
 */
function getAdaptiveFontSize(zone: ApartmentZone): string {
  if (!('bbox' in zone)) return '12px'
  
  const width = zone.bbox.max_x - zone.bbox.min_x
  const text = getStatusLabel(zone.status)
  const length = text.length
  
  // Base divisor factor
  // "SOLD" (4) -> we want font size ~ width/4? No, width/5.
  // "RESERVED" (8) -> width/9.
  let factor = 1.8
  
  // Tweak factor based on language/script content due to different glyph widths
  const isGeorgian = /[\u10A0-\u10FF]/.test(text)
  
  if (isGeorgian) {
    // Georgian glyphs might need slightly more space or just safe margin
    // "გაყიდული" (8 chars)
    factor = 1.9
  }
  
  // Minimum divisor to prevent huge text on tiny polygons
  // Maximum divisor ensures text doesn't get infinitely small (clamped by min font size logic below)
  const divisor = Math.max(8, length * factor)
  
  const size = width / divisor
  
  // Clamp constraints
  // Maximum size 40px (don't scream)
  // Minimum size 8px (legibility)
  return `${Math.min(40, Math.max(8, size))}px`
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
 * @internal - Kept for potential future tooltip arrow styling
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _tooltipArrowClass = computed(() => {
  const base = 'absolute w-3 h-3 bg-white border-zinc-100 transform rotate-45'

  switch (tooltipPosition.value) {
    case 'right':
      return `${base} border-l border-b -left-1.5 top-1/2 -translate-y-1/2`
    case 'left':
      return `${base} border-r border-t -right-1.5 top-1/2 -translate-y-1/2`
    case 'above':
      return `${base} border-r border-b -bottom-1.5 left-1/2 -translate-x-1/2`
    default:
      return `${base} border-l border-b -left-1.5 top-1/2 -translate-y-1/2`
  }
})

/**
 * Convert coordinate array to SVG polygon points string
 */
function coordsToPoints(coords: [number, number][]): string {
  return coords.map((coord) => `${coord[0]},${coord[1]}`).join(' ')
}

/**
 * Get zone center for text label
 */
function getZoneCenter(zone: BuildingZone | FloorZone | ApartmentZone) {
  if (!('bbox' in zone)) return { x: 0, y: 0 }
  
  const bbox = zone.bbox
  const width = bbox.max_x - bbox.min_x
  const height = bbox.max_y - bbox.min_y
  
  return {
    x: bbox.min_x + width / 2,
    y: bbox.min_y + height / 2
  }
}

/**
 * Get the current fill color for a zone
 */
function getZoneFill(zone: BuildingZone | FloorZone | ApartmentZone): string {
  // Check if this is an apartment zone
  if ('apartment_number' in zone) {
    const apartment = zone as ApartmentZone
    const isHovered = (currentHoveredZone.value?.id === zone.id) || (localHoveredZoneId.value === zone.id)
    
    // Base opacity depends on hover
    const opacity = isHovered ? 0.45 : 0.25
    
    switch (apartment.status) {
      case 'available':
        return `rgba(16, 185, 129, ${opacity})` // Emerald
      case 'reserved':
        return `rgba(255, 205, 75, ${opacity})` // Gold
      case 'sold':
        return `rgba(161, 161, 170, ${opacity})` // Zinc-400
      default:
        return 'rgba(255, 255, 255, 0)'
    }
  }
  
  // For buildings and floors
  const isHovered = (currentHoveredZone.value?.id === zone.id) || (localHoveredZoneId.value === zone.id)
  if (isHovered) {
    return 'rgba(255, 205, 75, 0.2)' // Subtle gold
  }
  
  // Fully transparent when not hovered
  return 'rgba(255, 255, 255, 0)'
}

/**
 * Get stroke color
 */
function getZoneStroke(zone: BuildingZone | FloorZone | ApartmentZone): string {
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

.zone-polygon:focus {
  outline: none;
}

.zone-interactive {
  cursor: pointer;
}

.zone-interactive:hover {
  filter: brightness(1.1);
}

.zone-interactive:focus {
  outline: none;
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
