<template>
  <div class="polygon-editor flex h-full">
    <!-- Left Sidebar: Polygon List -->
    <div class="w-64 lg:w-56 xl:w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-sm font-semibold text-gray-700">პოლიგონები</h3>
        <p class="text-sm text-gray-500 mt-1">{{ polygons.length }} ელემენტი</p>
      </div>

      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <div
          v-for="(polygon, index) in polygons"
          :key="polygon.id"
          class="p-2 rounded border cursor-pointer transition-colors"
          :class="{
            'bg-blue-50 border-blue-300': polygon.selected,
            'bg-white border-gray-200 hover:bg-gray-50': !polygon.selected,
          }"
          @click="selectPolygon(polygon.id)"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2 flex-1 min-w-0">
              <div
                class="w-4 h-4 rounded border-2 flex-shrink-0"
                :style="{ backgroundColor: polygon.fillColor, borderColor: polygon.strokeColor }"
              />
              <span class="text-sm font-medium text-gray-700 truncate">
                {{ polygon.label || `პოლიგონი ${index + 1}` }}
              </span>
            </div>
            <div class="flex items-center space-x-1 flex-shrink-0">
              <button
                @click.stop="togglePolygonVisibility(polygon.id)"
                class="p-1 hover:bg-gray-200 rounded"
                :title="polygon.visible ? 'დამალვა' : 'ჩვენება'"
              >
                <svg
                  v-if="polygon.visible"
                  class="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg
                  v-else
                  class="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              </button>
              <button
                @click.stop="deletePolygon(polygon.id)"
                class="p-1 hover:bg-red-100 rounded text-red-600"
                title="წაშლა"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="p-2 border-t border-gray-200 space-y-1">
        <button
          @click="duplicateSelectedPolygon"
          :disabled="!selectedPolygon"
          class="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          დუბლირება
        </button>
        <button
          @click="clearAll"
          class="w-full px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded hover:bg-red-50"
        >
          ყველას წაშლა
        </button>
      </div>
    </div>

    <!-- Main Canvas Area -->
    <div class="flex-1 flex flex-col bg-gray-100">
      <!-- Toolbar -->
      <div class="bg-white border-b border-gray-200 p-3 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <!-- Mode Buttons -->
          <div class="flex bg-gray-100 rounded-lg p-1">
            <button
              @click="currentMode = 'draw'"
              class="px-3 py-1.5 text-sm font-medium rounded transition-colors"
              :class="{
                'bg-white text-blue-600 shadow-sm': currentMode === 'draw',
                'text-gray-600 hover:text-gray-900': currentMode !== 'draw',
              }"
              title="დახატვის რეჟიმი"
            >
              ✏️ დახატვა
            </button>
            <button
              @click="currentMode = 'edit'"
              class="px-3 py-1.5 text-sm font-medium rounded transition-colors"
              :class="{
                'bg-white text-blue-600 shadow-sm': currentMode === 'edit',
                'text-gray-600 hover:text-gray-900': currentMode !== 'edit',
              }"
              title="რედაქტირების რეჟიმი"
            >
              📝 რედაქტირება
            </button>
            <button
              @click="currentMode = 'select'"
              class="px-3 py-1.5 text-sm font-medium rounded transition-colors"
              :class="{
                'bg-white text-blue-600 shadow-sm': currentMode === 'select',
                'text-gray-600 hover:text-gray-900': currentMode !== 'select',
              }"
              title="არჩევის რეჟიმი (Shift+გადატანა = პანორამა)"
            >
              👆 არჩევა
            </button>
            <button
              @click="currentMode = 'pan'"
              class="px-3 py-1.5 text-sm font-medium rounded transition-colors"
              :class="{
                'bg-white text-blue-600 shadow-sm': currentMode === 'pan',
                'text-gray-600 hover:text-gray-900': currentMode !== 'pan',
              }"
              title="პანორამის რეჟიმი - სურათის გადატანა"
            >
              ✋ პანორამა
            </button>
          </div>

          <!-- Tool Buttons -->
          <div class="flex items-center space-x-1 ml-4">
            <button
              @click="zoomIn"
              class="p-2 hover:bg-gray-100 rounded"
              title="Zoom In (Ctrl + +)"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                />
              </svg>
            </button>
            <button
              @click="zoomOut"
              class="p-2 hover:bg-gray-100 rounded"
              title="Zoom Out (Ctrl + -)"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                />
              </svg>
            </button>
            <button
              @click="resetZoom"
              class="p-2 hover:bg-gray-100 rounded"
              title="Reset Zoom (Ctrl + 0)"
            >
              <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          <div class="border-l border-gray-300 h-6 mx-2" />

          <!-- Grid Controls -->
          <label class="flex items-center space-x-2 text-sm">
            <input v-model="showGrid" type="checkbox" class="rounded" />
            <span class="text-gray-700">ბადე</span>
          </label>
          <label class="flex items-center space-x-2 text-sm">
            <input v-model="snapToGridEnabled" type="checkbox" class="rounded" />
            <span class="text-gray-700">მიმაგრება ბადეზე</span>
          </label>
          <select v-model.number="gridSize" class="text-sm border-gray-300 text-black rounded">
            <option :value="10">10px</option>
            <option :value="20">20px</option>
            <option :value="50">50px</option>
          </select>
        </div>

        <div class="flex items-center space-x-2">
          <!-- Undo/Redo -->
          <button
            @click="undo"
            :disabled="historyIndex <= 0"
            class="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo (Ctrl + Z)"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
              />
            </svg>
          </button>
          <button
            @click="redo"
            :disabled="historyIndex >= history.length - 1"
            class="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo (Ctrl + Y)"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
              />
            </svg>
          </button>

          <span class="text-sm text-gray-500">{{ Math.round(zoom * 100) }}%</span>
          
          <!-- Pan hint -->
          <div class="ml-4 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
            <span class="text-xs text-blue-700">
              💡 გადასატანად: ✋ პანორამა ღილაკი ან Shift + გადატანა
            </span>
          </div>
        </div>
      </div>

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
      <div
        v-if="selectedPolygon && isPropertiesPanelOpen"
        class="w-80 lg:w-72 xl:w-80 bg-gray-50 border-l border-gray-200 flex flex-col overflow-y-auto"
      >
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-700">თვისებები</h3>
          <button
            @click="isPropertiesPanelOpen = false"
            class="p-1 hover:bg-gray-200 rounded transition-colors"
            title="დახურვა"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      <div class="p-4 space-y-4">
        <!-- Entity Selector -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ entityLabel || 'დაკავშირებული ელემენტი' }}
          </label>
          <select
            v-model="selectedPolygon.entityId"
            class="w-full border-gray-300 rounded text-gray-900"
            @change="handleEntityChange"
          >
            <option :value="null">არ არის არჩეული</option>
            <option v-for="entity in entities" :key="entity.id" :value="entity.id">
              {{ getEntityDisplayName(entity) }}
            </option>
          </select>
        </div>

        <!-- Label -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ლეიბლი</label>
          <input
            v-model="selectedPolygon.label"
            type="text"
            class="w-full border-gray-300 rounded text-gray-900"
            @input="updatePolygon"
          />
        </div>

        <!-- Coordinates -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">კოორდინატები</label>
          <textarea
            :value="JSON.stringify(selectedPolygon.points, null, 2)"
            @input="updateCoordinatesFromJSON($event)"
            class="w-full h-32 text-xs font-mono border-gray-300 rounded text-gray-900"
          />
        </div>

        <!-- Bounding Box -->
        <div v-if="selectedPolygonBoundingBox" class="text-xs text-gray-600 space-y-1">
          <div class="font-medium mb-2">შემომსაზღვრელი ყუთი:</div>
          <div>X: {{ selectedPolygonBoundingBox.min_x }} - {{ selectedPolygonBoundingBox.max_x }}</div>
          <div>Y: {{ selectedPolygonBoundingBox.min_y }} - {{ selectedPolygonBoundingBox.max_y }}</div>
          <div>სიგანე: {{ selectedPolygonBoundingBox.width }}</div>
          <div>სიმაღლე: {{ selectedPolygonBoundingBox.height }}</div>
          <div>ფართობი: {{ Math.round(calculatePolygonArea(selectedPolygon.points)) }} px²</div>
        </div>
      </div>
    </div>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Polygon, Point } from '@/utils/polygon'
import {
  calculateBoundingBox,
  snapToGrid as snapPointToGrid,
  duplicatePolygon,
  calculatePolygonArea,
} from '@/utils/polygon'

interface Props {
  backgroundImage?: string
  imageWidth?: number
  imageHeight?: number
  initialPolygons?: Polygon[]
  entities?: Array<{ id: number; name?: string; label?: string }>
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

// Canvas state
const canvasContainer = ref<HTMLDivElement>()
const svgCanvas = ref<SVGSVGElement>()
const zoom = ref(0.5) // Start at 50% zoom
const panX = ref(0)
const panY = ref(0)
const isPanning = ref(false)
const lastMousePosition = ref<Point | null>(null)

// Drawing state
const currentMode = ref<'draw' | 'edit' | 'select' | 'pan'>('draw')
const polygons = ref<Polygon[]>([...props.initialPolygons])
const currentPolygon = ref<Point[]>([])
const mousePosition = ref<Point | null>(null)

// Watch for initial polygons changes
watch(() => props.initialPolygons, (newPolygons) => {
  // Check if content is actually different to avoid resetting state on self-triggered updates
  if (JSON.stringify(newPolygons) === JSON.stringify(polygons.value)) {
    return
  }

  console.log('🔄 PolygonEditor - initialPolygons changed:', {
    count: newPolygons.length,
    polygons: newPolygons
  })
  polygons.value = [...newPolygons]
  
  // Only reset selection if the selected polygon no longer exists
  if (selectedPolygonId.value && !newPolygons.find(p => p.id === selectedPolygonId.value)) {
    selectedPolygonId.value = null
  }
  
  // Update history
  history.value = [JSON.parse(JSON.stringify(newPolygons))]
  historyIndex.value = 0
}, { deep: true })

// Selection state
const selectedPolygonId = ref<string | null>(null)

// Panel state
const isPropertiesPanelOpen = ref(true)

// Edit state
const draggingPoint = ref<{ polygonId: string; pointIndex: number } | null>(null)

// Grid state
const showGrid = ref(true)
const snapToGridEnabled = ref(true)
const gridSize = ref(20)

// History state
const history = ref<Polygon[][]>([JSON.parse(JSON.stringify(props.initialPolygons))])
const historyIndex = ref(0)

// Computed
const selectedPolygon = computed(() => {
  return polygons.value.find((p) => p.id === selectedPolygonId.value) || null
})

const selectedPolygonBoundingBox = computed(() => {
  if (!selectedPolygon.value || selectedPolygon.value.points.length === 0) return null
  return calculateBoundingBox(selectedPolygon.value.points)
})

// Methods
function pointsToString(points: Point[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(' ')
}

function getMousePosition(event: MouseEvent): Point {
  if (!svgCanvas.value) return { x: 0, y: 0 }

  const rect = svgCanvas.value.getBoundingClientRect()
  let x = (event.clientX - rect.left - panX.value) / zoom.value
  let y = (event.clientY - rect.top - panY.value) / zoom.value

  if (snapToGridEnabled.value && currentMode.value === 'draw') {
    const snapped = snapPointToGrid({ x, y }, gridSize.value)
    x = snapped.x
    y = snapped.y
  }

  return { x, y }
}

function handleCanvasMouseDown(event: MouseEvent) {
  if (event.button !== 0) return // Left click only

  const pos = getMousePosition(event)

  if ((currentMode.value === 'select' && event.shiftKey) || currentMode.value === 'pan') {
    // Start panning - either in select mode with Shift key, or in pan mode
    isPanning.value = true
    lastMousePosition.value = { x: event.clientX, y: event.clientY }
  } else if (currentMode.value === 'draw') {
    // Add point to current polygon
    currentPolygon.value.push(pos)
  }
}

function handleCanvasMouseMove(event: MouseEvent) {
  const pos = getMousePosition(event)
  mousePosition.value = pos

  if (isPanning.value && lastMousePosition.value) {
    // Pan the canvas
    panX.value += event.clientX - lastMousePosition.value.x
    panY.value += event.clientY - lastMousePosition.value.y
    lastMousePosition.value = { x: event.clientX, y: event.clientY }
  } else if (draggingPoint.value) {
    // Drag control point
    const polygon = polygons.value.find((p) => p.id === draggingPoint.value!.polygonId)
    if (polygon) {
      polygon.points[draggingPoint.value.pointIndex] = pos
      updatePolygon()
    }
  }
}

function handleCanvasMouseUp() {
  isPanning.value = false
  lastMousePosition.value = null

  if (draggingPoint.value) {
    saveToHistory()
    draggingPoint.value = null
  }
}

function handleCanvasDoubleClick() {
  if (currentMode.value === 'draw' && currentPolygon.value.length >= 3) {
    // Finish current polygon
    const newPolygon: Polygon = {
      id: `polygon-${Date.now()}`,
      points: [...currentPolygon.value],
      entityId: null,
      label: `პოლიგონი ${polygons.value.length + 1}`,
      fillColor: '#3b82f680',
      strokeColor: '#3b82f6',
      visible: true,
      selected: false,
    }

    polygons.value.push(newPolygon)
    currentPolygon.value = []
    saveToHistory()
    emit('change', polygons.value)
  }
}

function handlePolygonClick(polygonId: string) {
  console.log('🎯 Polygon clicked:', polygonId)
  console.log('🎯 Current mode:', currentMode.value)
  console.log('🎯 All polygons:', polygons.value)
  
  if (currentMode.value === 'select' || currentMode.value === 'edit') {
    selectPolygon(polygonId)
    // Emit polygon-click event for navigation purposes
    const clickedPolygon = polygons.value.find(p => p.id === polygonId)
    if (clickedPolygon) {
      emit('polygon-click', clickedPolygon)
    }
  }
}

function selectPolygon(polygonId: string) {
  console.log('🎯 Selecting polygon:', polygonId)
  
  polygons.value.forEach((p) => {
    p.selected = p.id === polygonId
  })
  selectedPolygonId.value = polygonId
  
  const selected = polygons.value.find(p => p.id === polygonId)
  console.log('🎯 Selected polygon:', selected)
}

function startDraggingPoint(polygonId: string, pointIndex: number) {
  draggingPoint.value = { polygonId, pointIndex }
}

function togglePolygonVisibility(polygonId: string) {
  const polygon = polygons.value.find((p) => p.id === polygonId)
  if (polygon) {
    polygon.visible = !polygon.visible
    updatePolygon()
  }
}

function deletePolygon(polygonId: string) {
  polygons.value = polygons.value.filter((p) => p.id !== polygonId)
  if (selectedPolygonId.value === polygonId) {
    selectedPolygonId.value = null
  }
  saveToHistory()
  emit('change', polygons.value)
}

function duplicateSelectedPolygon() {
  if (!selectedPolygon.value) return

  const duplicate = duplicatePolygon(selectedPolygon.value, 20, 20)
  polygons.value.push(duplicate)
  selectPolygon(duplicate.id)
  saveToHistory()
  emit('change', polygons.value)
}

function clearAll() {
  if (confirm('ნამდვილად გსურთ ყველა პოლიგონის წაშლა?')) {
    polygons.value = []
    selectedPolygonId.value = null
    currentPolygon.value = []
    saveToHistory()
    emit('change', polygons.value)
  }
}

function updatePolygon() {
  emit('change', polygons.value)
}

function getEntityDisplayName(entity: { id: number; apartment_number?: string; name?: string | Record<string, string>; label?: string }): string {
  // Try different property names based on entity type
  if (entity.apartment_number) {
    return `ბინა ${entity.apartment_number}`
  }
  if (entity.name) {
    if (typeof entity.name === 'object') {
      return entity.name.ka || entity.name.en || Object.values(entity.name)[0] || `#${entity.id}`
    }
    return entity.name
  }
  if (entity.label) {
    return entity.label
  }
  return `#${entity.id}`
}

function handleEntityChange() {
  if (selectedPolygon.value && selectedPolygon.value.entityId) {
    // Find the selected entity
    const entity = props.entities.find(e => e.id === selectedPolygon.value!.entityId)
    if (entity) {
      // Auto-update the label with the entity's display name
      selectedPolygon.value.label = getEntityDisplayName(entity)
    }
  }
  updatePolygon()
}

function updateCoordinatesFromJSON(event: Event) {
  try {
    const target = event.target as HTMLTextAreaElement
    const points = JSON.parse(target.value)
    if (selectedPolygon.value && Array.isArray(points)) {
      selectedPolygon.value.points = points
      updatePolygon()
    }
  } catch (e) {
    console.error('Invalid JSON:', e)
  }
}

function zoomIn() {
  zoom.value = Math.min(zoom.value * 1.2, 5)
}

function zoomOut() {
  zoom.value = Math.max(zoom.value / 1.2, 0.1)
}

function resetZoom() {
  zoom.value = 0.5 // Reset to 50%
  panX.value = 0
  panY.value = 0
}

function handleWheel(event: WheelEvent) {
  if (event.ctrlKey || event.metaKey) {
    event.preventDefault()
    const delta = event.deltaY > 0 ? 0.9 : 1.1
    zoom.value = Math.max(0.1, Math.min(5, zoom.value * delta))
  }
}

function saveToHistory() {
  // Remove any history after current index
  history.value = history.value.slice(0, historyIndex.value + 1)

  // Add current state
  history.value.push(JSON.parse(JSON.stringify(polygons.value)))
  historyIndex.value = history.value.length - 1

  // Limit history to 50 states
  if (history.value.length > 50) {
    history.value.shift()
    historyIndex.value--
  }
}

function undo() {
  if (historyIndex.value > 0) {
    historyIndex.value--
    polygons.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    emit('change', polygons.value)
  }
}

function redo() {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    polygons.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
    emit('change', polygons.value)
  }
}

// Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault()
    undo()
  } else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
    event.preventDefault()
    redo()
  } else if ((event.ctrlKey || event.metaKey) && event.key === '=') {
    event.preventDefault()
    zoomIn()
  } else if ((event.ctrlKey || event.metaKey) && event.key === '-') {
    event.preventDefault()
    zoomOut()
  } else if ((event.ctrlKey || event.metaKey) && event.key === '0') {
    event.preventDefault()
    resetZoom()
  } else if (event.key === 'Escape') {
    if (currentPolygon.value.length > 0) {
      currentPolygon.value = []
    } else {
      selectedPolygonId.value = null
      polygons.value.forEach((p) => (p.selected = false))
    }
  } else if (event.key === 'Delete' && selectedPolygonId.value) {
    deletePolygon(selectedPolygonId.value)
  }
}

// Lifecycle
onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

// Expose methods for parent component
defineExpose({
  getPolygons: () => polygons.value,
  setPolygons: (newPolygons: Polygon[]) => {
    polygons.value = newPolygons
    saveToHistory()
  },
  clearAll,
  undo,
  redo,
})
</script>

<style scoped>
.polygon-editor {
  min-height: 600px;
}

/* Slide transition for properties panel */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 1366px) {
  .polygon-editor .w-64 {
    width: 14rem; /* 224px - slightly narrower left sidebar */
  }
}

@media (max-width: 1024px) {
  .polygon-editor .w-64 {
    width: 12rem; /* 192px - even narrower on small laptops */
  }
}
</style>
