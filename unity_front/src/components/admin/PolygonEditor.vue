<template>
  <div class="polygon-editor flex h-full">
    <!-- Left Sidebar: Polygon List -->
    <PolygonList
      :polygons="polygons"
      :has-selection="!!selectedPolygon"
      @select="selectPolygon"
      @toggle-visibility="togglePolygonVisibility"
      @delete="deletePolygon"
      @duplicate="duplicateSelectedPolygon"
      @clear-all="clearAll"
    />

    <!-- Main Canvas Area -->
    <div class="flex-1 flex flex-col bg-gray-100">
      <!-- Toolbar -->
      <PolygonToolbar
        v-model:mode="currentMode"
        v-model:show-grid="showGrid"
        v-model:snap-to-grid="snapToGridEnabled"
        v-model:grid-size="gridSize"
        :zoom="zoom"
        :can-undo="historyIndex > 0"
        :can-redo="historyIndex < history.length - 1"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @zoom-reset="resetZoom"
        @undo="undo"
        @redo="redo"
      />

      <!-- Canvas -->
      <div ref="canvasContainer" class="flex-1 overflow-hidden relative" @wheel="handleWheel">
        <svg
          ref="svgCanvas"
          class="w-full h-full cursor-crosshair"
          :class="{
            'cursor-move': (currentMode === 'select' && isPanning) || (currentMode === 'pan' && !isPanning),
            'cursor-grabbing': (currentMode === 'pan' && isPanning) || (currentMode === 'edit' && draggingPoint),
            'cursor-pointer': currentMode === 'select' && !isPanning,
            'cursor-grab': currentMode === 'edit' && !draggingPoint,
          }"
          @mousedown="handleCanvasMouseDown"
          @mousemove="handleCanvasMouseMove"
          @mouseup="handleCanvasMouseUp"
          @dblclick="handleCanvasDoubleClick"
        >
          <defs>
            <pattern
              v-if="showGrid"
              id="grid"
              :width="gridSize * zoom"
              :height="gridSize * zoom"
              patternUnits="userSpaceOnUse"
            >
              <path
                :d="`M ${gridSize * zoom} 0 L 0 0 0 ${gridSize * zoom}`"
                fill="none"
                stroke="rgba(0,0,0,0.1)"
                stroke-width="0.5"
              />
            </pattern>
          </defs>

          <g :transform="`translate(${panX}, ${panY}) scale(${zoom})`">
            <!-- Background Image -->
            <image
              v-if="backgroundImage"
              :href="backgroundImage"
              x="0"
              y="0"
              :width="imageWidth"
              :height="imageHeight"
              preserveAspectRatio="none"
            />

            <!-- Grid Overlay -->
            <rect
              v-if="showGrid"
              x="0"
              y="0"
              :width="imageWidth || 2000"
              :height="imageHeight || 2000"
              fill="url(#grid)"
            />

            <!-- Existing Polygons -->
            <g v-for="polygon in polygons" :key="polygon.id">
              <polygon
                v-if="polygon.visible && polygon.points.length > 0"
                :points="pointsToString(polygon.points)"
                :fill="polygon.selected ? polygon.hoverColor || polygon.fillColor : polygon.fillColor"
                :stroke="polygon.strokeColor"
                :stroke-width="polygon.selected ? 3 : 2"
                class="transition-all duration-150"
                @click="handlePolygonClick(polygon.id)"
              />

              <!-- Control Points (in edit mode) -->
              <g v-if="currentMode === 'edit' && polygon.selected">
                <circle
                  v-for="(point, index) in polygon.points"
                  :key="`${polygon.id}-point-${index}`"
                  :cx="point.x"
                  :cy="point.y"
                  r="6"
                  fill="white"
                  stroke="#3b82f6"
                  stroke-width="2"
                  class="cursor-move"
                  @mousedown.stop="startDraggingPoint(polygon.id, index)"
                />
              </g>
            </g>

            <!-- Current Drawing Polygon -->
            <g v-if="currentMode === 'draw' && currentPolygon.length > 0">
              <!-- Preview line from last point to mouse -->
              <line
                v-if="currentPolygon.length > 0 && mousePosition"
                :x1="currentPolygon[currentPolygon.length - 1].x"
                :y1="currentPolygon[currentPolygon.length - 1].y"
                :x2="mousePosition.x"
                :y2="mousePosition.y"
                stroke="#3b82f6"
                stroke-width="2"
                stroke-dasharray="5,5"
                opacity="0.5"
              />

              <!-- Current polygon preview -->
              <polygon
                v-if="currentPolygon.length > 2"
                :points="pointsToString(currentPolygon)"
                fill="#3b82f680"
                stroke="#3b82f6"
                stroke-width="2"
                opacity="0.7"
              />

              <!-- Current points -->
              <circle
                v-for="(point, index) in currentPolygon"
                :key="`current-point-${index}`"
                :cx="point.x"
                :cy="point.y"
                r="5"
                fill="#3b82f6"
                stroke="white"
                stroke-width="2"
              />
            </g>
          </g>
        </svg>

        <!-- Mode Instructions -->
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm">
          <span v-if="currentMode === 'draw'">
            {{ currentPolygon.length === 0 ? 'დააჭირეთ დასაწყებად' : 'დააჭირეთ წერტილების დასამატებლად, ორმაგი დაჭერა დასასრულებლად' }}
          </span>
          <span v-else-if="currentMode === 'edit'">
            წერტილების გადასატანად გადაათრიეთ
          </span>
          <span v-else>
            პოლიგონის ასარჩევად დააჭირეთ
          </span>
        </div>
      </div>
    </div>

    <!-- Right Sidebar: Properties Panel -->
    <transition name="slide-left">
      <PolygonProperties
        v-if="selectedPolygon && isPropertiesPanelOpen"
        :polygon="selectedPolygon"
        :entities="entities"
        :entity-label="entityLabel"
        :bounding-box="selectedPolygonBoundingBox"
        :area="calculatePolygonArea(selectedPolygon.points)"
        @close="isPropertiesPanelOpen = false"
        @update:entity-id="handleEntityUpdate"
        @update:label="handleLabelUpdate"
        @update:points-json="updateCoordinatesFromJSON"
      />
    </transition>

    <!-- Toggle Button (when panel is closed) -->
    <button
      v-if="selectedPolygon && !isPropertiesPanelOpen"
      @click="isPropertiesPanelOpen = true"
      class="fixed right-0 top-1/2 transform -translate-y-1/2 bg-white border border-gray-300 rounded-l-lg shadow-lg p-2 hover:bg-gray-50 transition-all z-10"
      title="თვისებების ფანელის გახსნა"
    >
      <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import type { Polygon } from '@/utils/polygon'
import { calculatePolygonArea } from '@/utils/polygon'
import { usePolygonEditor } from '@/composables/usePolygonEditor'

// Sub-components
import { PolygonList, PolygonToolbar, PolygonProperties } from './polygon-editor'

interface Props {
  backgroundImage?: string
  imageWidth?: number
  imageHeight?: number
  initialPolygons?: Polygon[]
  entities?: Array<{ id: number; name?: string | Record<string, string>; label?: string; apartment_number?: string }>
  entityLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  backgroundImage: '',
  imageWidth: 1200,
  imageHeight: 800,
  initialPolygons: () => [],
  entities: () => [],
  entityLabel: 'დაკავშირებული ელემენტი',
})

const emit = defineEmits<{
  save: [polygons: Polygon[]]
  cancel: []
  change: [polygons: Polygon[]]
  'polygon-click': [polygon: Polygon]
}>()

// Use polygon editor composable
const {
  canvasContainer, svgCanvas, zoom, panX, panY, isPanning, currentMode,
  polygons, currentPolygon, mousePosition, isPropertiesPanelOpen,
  draggingPoint, showGrid, snapToGridEnabled, gridSize, historyIndex, history,
  selectedPolygon, selectedPolygonBoundingBox, pointsToString,
  handleCanvasMouseDown, handleCanvasMouseMove, handleCanvasMouseUp,
  handleCanvasDoubleClick, handlePolygonClick, handleWheel, selectPolygon,
  togglePolygonVisibility, deletePolygon, duplicateSelectedPolygon, clearAll,
  startDraggingPoint, handleEntityUpdate, handleLabelUpdate,
  updateCoordinatesFromJSON, zoomIn, zoomOut, resetZoom, undo, redo,
  getPolygons, setPolygons,
} = usePolygonEditor({
  initialPolygons: toRef(props, 'initialPolygons'),
  entities: toRef(props, 'entities'),
  backgroundImage: toRef(props, 'backgroundImage'),
  imageWidth: toRef(props, 'imageWidth'),
  imageHeight: toRef(props, 'imageHeight'),
  onChange: (updatedPolygons) => emit('change', updatedPolygons),
  onPolygonClick: (polygon) => emit('polygon-click', polygon),
})

// Expose methods for parent components
defineExpose({
  getPolygons,
  setPolygons,
  clearAll,
  undo,
  redo,
})
</script>

<style scoped>
.polygon-editor { min-height: 600px; }
.slide-left-enter-active, .slide-left-leave-active { transition: all 0.3s ease; }
.slide-left-enter-from { transform: translateX(100%); opacity: 0; }
.slide-left-leave-to { transform: translateX(100%); opacity: 0; }

@media (max-width: 1366px) { .polygon-editor .w-64 { width: 14rem; } }
@media (max-width: 1024px) { .polygon-editor .w-64 { width: 12rem; } }
</style>
