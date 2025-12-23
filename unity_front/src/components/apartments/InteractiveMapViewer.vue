<template>
  <div class="interactive-map-viewer relative w-full">
    <!-- Loading overlay for image -->
    <div
      v-if="image?.url && !imageLoaded"
      class="absolute inset-0 flex items-center justify-center bg-zinc-50 z-10"
    >
      <div class="w-10 h-10 border-2 border-zinc-200 border-t-zinc-400 rounded-full animate-spin"></div>
    </div>

    <svg
      ref="svgElement"
      :viewBox="image?.viewbox || '0 0 1000 1000'"
      :width="image?.width"
      :height="image?.height"
      class="w-full h-auto"
      :class="{ 'opacity-0': image?.url && !imageLoaded }"
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
        @load="handleImageLoad"
        @error="handleImageError"
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
          :data-zone-id="zone.id"
          role="button"
          :tabindex="(readonly || !isZoneInteractive(zone)) ? -1 : 0"
          @click="handleZoneClick(zone)"
          @mouseenter="handleZoneHover(zone)"
          @mouseleave="handleZoneLeave()"
          @touchstart.passive="handleTouchStart(zone)"
          @touchmove.passive="handleTouchMove"
          @touchend="handleTouchEnd($event, zone)"
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

    <!-- Tooltip -->
    <MapTooltip
      :zone="currentHoveredZone"
      :style="tooltipStyle"
      :label="currentHoveredZone ? getZoneLabel(currentHoveredZone) : ''"
      :status-label="currentHoveredZone && 'status' in currentHoveredZone ? getStatusLabel(currentHoveredZone.status) : ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, toRef, onMounted, onUnmounted, watch } from 'vue'
import type { ZoneImage, BuildingZone, FloorZone, ApartmentZone } from '@/types/apartments'
import { useInteractiveMap } from '@/composables/navigation/useInteractiveMap'
import MapTooltip from './MapTooltip.vue'

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

const emit = defineEmits<{
  'zone-click': [zone: BuildingZone | FloorZone | ApartmentZone]
  'zone-hover': [zone: BuildingZone | FloorZone | ApartmentZone | null]
  'image-load': [loaded: boolean]
}>()

const svgElement = ref<SVGSVGElement | null>(null)
const touchStartZoneId = ref<number | null>(null)
const isTouchDragging = ref(false)
const imageLoaded = ref(false)
const imageError = ref(false)

// Reset image loaded state when image URL changes
watch(() => props.image?.url, (newUrl, oldUrl) => {
  if (newUrl !== oldUrl) {
    imageLoaded.value = false
    imageError.value = false
  }
})

// Use the composable for all zone logic
const {
  localHoveredZoneId,
  currentHoveredZone,
  tooltipStyle,
  isZoneInteractive,
  getStatusLabel,
  coordsToPoints,
  getZoneCenter,
  getZoneLabel,
  getZoneFill,
  getZoneStroke,
  getAdaptiveFontSize,
} = useInteractiveMap(
  svgElement,
  toRef(props, 'zones'),
  toRef(props, 'hoveredZone')
)

// ==================== IMAGE HANDLERS ====================
function handleImageLoad() {
  imageLoaded.value = true
  imageError.value = false
  emit('image-load', true)
}

function handleImageError() {
  imageLoaded.value = false
  imageError.value = true
  emit('image-load', false)
  console.error('Failed to load SVG image:', props.image?.url)
}

// ==================== EVENT HANDLERS ====================
function isSelected(zone: BuildingZone | FloorZone | ApartmentZone): boolean {
  return props.selectedZoneId === zone.id
}

function handleZoneClick(zone: BuildingZone | FloorZone | ApartmentZone) {
  if (props.readonly) return
  emit('zone-click', zone)
}

function handleZoneHover(zone: BuildingZone | FloorZone | ApartmentZone) {
  if (props.readonly) return
  
  // Don't interfere if we are in the middle of a touch interaction
  if (isTouchDragging.value) return
  
  localHoveredZoneId.value = zone.id
  emit('zone-hover', zone)
}

function handleZoneLeave() {
  if (props.readonly) return
  
  // Don't interact if touch dragging
  if (isTouchDragging.value) return

  localHoveredZoneId.value = null
  emit('zone-hover', null)
}

function handleTouchStart(zone: BuildingZone | FloorZone | ApartmentZone) {
  if (props.readonly) return
  touchStartZoneId.value = zone.id
  isTouchDragging.value = false
}

function handleTouchMove(e: TouchEvent) {
  if (props.readonly) return
  isTouchDragging.value = true

  // Find element under finger
  const touch = e.touches[0]
  const element = document.elementFromPoint(touch.clientX, touch.clientY)
  
  if (element) {
    // Check if it's one of our polygons
    const zoneId = element.getAttribute('data-zone-id')
    if (zoneId) {
      const id = parseInt(zoneId)
      // Only update if changed
      if (localHoveredZoneId.value !== id) {
        const zone = props.zones.find(z => z.id === id)
        if (zone) {
          localHoveredZoneId.value = id
          emit('zone-hover', zone)
        }
      }
    } else {
      // Finger moved off any zone
      if (localHoveredZoneId.value !== null) {
        localHoveredZoneId.value = null
        emit('zone-hover', null)
      }
    }
  }
}

function handleTouchEnd(e: TouchEvent, zone: BuildingZone | FloorZone | ApartmentZone) {
  if (props.readonly) return
  
  // Prevent ghost click
  if (e.cancelable) e.preventDefault()
  
  if (isTouchDragging.value) {
    // End of a drag operation
    isTouchDragging.value = false
    touchStartZoneId.value = null
    // We leave the last hovered zone active so user can see what they landed on
    return
  }

  // Tap interaction
  if (touchStartZoneId.value === zone.id) {
    if (localHoveredZoneId.value === zone.id) {
      // Second tap on the SAME zone (it was already hovered) -> CLICK
      handleZoneClick(zone)
    } else {
      // First tap (was not hovered) -> HOVER / PREVIEW
      localHoveredZoneId.value = zone.id
      emit('zone-hover', zone)
    }
  }

  touchStartZoneId.value = null
}

// ==================== CLICK OUTSIDE ====================
function handleGlobalClick(e: Event) {
  if (localHoveredZoneId.value === null) return

  const target = e.target as HTMLElement
  // Check if click is on a zone polygon or the tooltip
  const isZone = target.closest('.zone-polygon')
  const isTooltip = target.closest('.tooltip-container')

  if (!isZone && !isTooltip) {
    localHoveredZoneId.value = null
    emit('zone-hover', null)
  }
}

onMounted(() => {
  document.addEventListener('click', handleGlobalClick)
  document.addEventListener('touchstart', handleGlobalClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
  document.removeEventListener('touchstart', handleGlobalClick)
})
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
</style>
