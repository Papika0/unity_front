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
import { ref, toRef } from 'vue'
import type { ZoneImage, BuildingZone, FloorZone, ApartmentZone } from '@/types/apartments'
import { useInteractiveMap } from '@/composables/useInteractiveMap'
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
}>()

const svgElement = ref<SVGSVGElement | null>(null)
const touchStartZoneId = ref<number | null>(null)

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
  localHoveredZoneId.value = zone.id
  emit('zone-hover', zone)
}

function handleZoneLeave() {
  if (props.readonly) return
  localHoveredZoneId.value = null
  emit('zone-hover', null)
}

function handleTouchStart(zone: BuildingZone | FloorZone | ApartmentZone) {
  if (props.readonly) return
  touchStartZoneId.value = zone.id
  localHoveredZoneId.value = zone.id
  emit('zone-hover', zone)
}

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
</style>
