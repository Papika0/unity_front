import { ref, computed, onMounted, onUnmounted, watch, type Ref } from 'vue'
import type { Polygon, Point } from '@/utils/polygon'
import {
  calculateBoundingBox,
  snapToGrid as snapPointToGrid,
  duplicatePolygon,
} from '@/utils/polygon'

interface UsePolygonEditorOptions {
  initialPolygons: Ref<Polygon[]>
  entities: Ref<Array<{ id: number; name?: string | Record<string, string>; label?: string; apartment_number?: string }>>
  backgroundImage?: Ref<string>
  imageWidth: Ref<number>
  imageHeight: Ref<number>
  onSave?: (polygons: Polygon[]) => void
  onChange?: (polygons: Polygon[]) => void
  onPolygonClick?: (polygon: Polygon) => void
}

export function usePolygonEditor(options: UsePolygonEditorOptions) {
  const {
    initialPolygons,
    entities,
    onChange,
    onPolygonClick,
  } = options

  // ==================== REFS ====================
  const canvasContainer = ref<HTMLDivElement>()
  const svgCanvas = ref<SVGSVGElement>()

  // ==================== STATE ====================
  // Canvas state
  const zoom = ref(0.5)
  const panX = ref(0)
  const panY = ref(0)
  const isPanning = ref(false)
  const lastMousePosition = ref<Point | null>(null)

  // Drawing state
  const currentMode = ref<'draw' | 'edit' | 'select' | 'pan'>('draw')
  const polygons = ref<Polygon[]>([...initialPolygons.value])
  const currentPolygon = ref<Point[]>([])
  const mousePosition = ref<Point | null>(null)

  // Selection state
  const selectedPolygonId = ref<string | null>(null)
  const isPropertiesPanelOpen = ref(true)

  // Edit state
  const draggingPoint = ref<{ polygonId: string; pointIndex: number } | null>(null)

  // Grid state
  const showGrid = ref(true)
  const snapToGridEnabled = ref(true)
  const gridSize = ref(20)

  // History state
  const history = ref<Polygon[][]>([JSON.parse(JSON.stringify(initialPolygons.value))])
  const historyIndex = ref(0)

  // ==================== WATCHERS ====================
  // Watch for initial polygons changes
  watch(initialPolygons, (newPolygons) => {
    if (JSON.stringify(newPolygons) === JSON.stringify(polygons.value)) {
      return
    }
    polygons.value = [...newPolygons]
    if (selectedPolygonId.value && !newPolygons.find(p => p.id === selectedPolygonId.value)) {
      selectedPolygonId.value = null
    }
    history.value = [JSON.parse(JSON.stringify(newPolygons))]
    historyIndex.value = 0
  }, { deep: true })

  // ==================== COMPUTED ====================
  const selectedPolygon = computed(() => {
    return polygons.value.find((p) => p.id === selectedPolygonId.value) || null
  })

  const selectedPolygonBoundingBox = computed(() => {
    if (!selectedPolygon.value || selectedPolygon.value.points.length === 0) return null
    return calculateBoundingBox(selectedPolygon.value.points)
  })

  // ==================== METHODS ====================
  // Point conversion
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

  // Mouse handlers
  function handleCanvasMouseDown(event: MouseEvent) {
    if (event.button !== 0) return
    const pos = getMousePosition(event)
    if ((currentMode.value === 'select' && event.shiftKey) || currentMode.value === 'pan') {
      isPanning.value = true
      lastMousePosition.value = { x: event.clientX, y: event.clientY }
    } else if (currentMode.value === 'draw') {
      currentPolygon.value.push(pos)
    }
  }

  function handleCanvasMouseMove(event: MouseEvent) {
    const pos = getMousePosition(event)
    mousePosition.value = pos
    if (isPanning.value && lastMousePosition.value) {
      panX.value += event.clientX - lastMousePosition.value.x
      panY.value += event.clientY - lastMousePosition.value.y
      lastMousePosition.value = { x: event.clientX, y: event.clientY }
    } else if (draggingPoint.value) {
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
      onChange?.(polygons.value)
    }
  }

  function handlePolygonClick(polygonId: string) {
    if (currentMode.value === 'select' || currentMode.value === 'edit') {
      selectPolygon(polygonId)
      const clickedPolygon = polygons.value.find(p => p.id === polygonId)
      if (clickedPolygon) {
        onPolygonClick?.(clickedPolygon)
      }
    }
  }

  function handleWheel(event: WheelEvent) {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault()
      const delta = event.deltaY > 0 ? 0.9 : 1.1
      zoom.value = Math.max(0.1, Math.min(5, zoom.value * delta))
    }
  }

  // Polygon operations
  function selectPolygon(polygonId: string) {
    polygons.value.forEach((p) => {
      p.selected = p.id === polygonId
    })
    selectedPolygonId.value = polygonId
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
    onChange?.(polygons.value)
  }

  function duplicateSelectedPolygon() {
    if (!selectedPolygon.value) return
    const duplicate = duplicatePolygon(selectedPolygon.value, 20, 20)
    polygons.value.push(duplicate)
    selectPolygon(duplicate.id)
    saveToHistory()
    onChange?.(polygons.value)
  }

  function clearAll() {
    if (confirm('ნამდვილად გსურთ ყველა პოლიგონის წაშლა?')) {
      polygons.value = []
      selectedPolygonId.value = null
      currentPolygon.value = []
      saveToHistory()
      onChange?.(polygons.value)
    }
  }

  // Editing
  function startDraggingPoint(polygonId: string, pointIndex: number) {
    draggingPoint.value = { polygonId, pointIndex }
  }

  function updatePolygon() {
    onChange?.(polygons.value)
  }

  function getEntityDisplayName(entity: { id: number; apartment_number?: string; name?: string | Record<string, string>; label?: string }): string {
    if (entity.apartment_number) return `ბინა ${entity.apartment_number}`
    if (entity.name) {
      if (typeof entity.name === 'object') {
        return entity.name.ka || entity.name.en || Object.values(entity.name)[0] || `#${entity.id}`
      }
      return entity.name
    }
    return entity.label || `#${entity.id}`
  }

  function handleEntityUpdate(entityId: number | null) {
    if (selectedPolygon.value) {
      selectedPolygon.value.entityId = entityId
      if (entityId) {
        const entity = entities.value.find(e => e.id === entityId)
        if (entity) selectedPolygon.value.label = getEntityDisplayName(entity)
      }
    }
    updatePolygon()
  }

  function handleLabelUpdate(label: string) {
    if (selectedPolygon.value) selectedPolygon.value.label = label
    updatePolygon()
  }

  function updateCoordinatesFromJSON(json: string) {
    try {
      const points = JSON.parse(json)
      if (selectedPolygon.value && Array.isArray(points)) {
        selectedPolygon.value.points = points
        updatePolygon()
      }
    } catch (e) {
      console.error('Invalid JSON:', e)
    }
  }

  // Zoom/Pan
  function zoomIn() { zoom.value = Math.min(zoom.value * 1.2, 5) }
  function zoomOut() { zoom.value = Math.max(zoom.value / 1.2, 0.1) }
  function resetZoom() {
    zoom.value = 0.5
    panX.value = 0
    panY.value = 0
  }

  // History
  function saveToHistory() {
    history.value = history.value.slice(0, historyIndex.value + 1)
    history.value.push(JSON.parse(JSON.stringify(polygons.value)))
    historyIndex.value = history.value.length - 1
    if (history.value.length > 50) {
      history.value.shift()
      historyIndex.value--
    }
  }

  function undo() {
    if (historyIndex.value > 0) {
      historyIndex.value--
      polygons.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
      onChange?.(polygons.value)
    }
  }

  function redo() {
    if (historyIndex.value < history.value.length - 1) {
      historyIndex.value++
      polygons.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
      onChange?.(polygons.value)
    }
  }

  // Keyboard handling
  function handleKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      event.preventDefault(); undo()
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
      event.preventDefault(); redo()
    } else if ((event.ctrlKey || event.metaKey) && event.key === '=') {
      event.preventDefault(); zoomIn()
    } else if ((event.ctrlKey || event.metaKey) && event.key === '-') {
      event.preventDefault(); zoomOut()
    } else if ((event.ctrlKey || event.metaKey) && event.key === '0') {
      event.preventDefault(); resetZoom()
    } else if (event.key === 'Escape') {
      if (currentPolygon.value.length > 0) currentPolygon.value = []
      else { selectedPolygonId.value = null; polygons.value.forEach((p) => (p.selected = false)) }
    } else if (event.key === 'Delete' && selectedPolygonId.value) {
      deletePolygon(selectedPolygonId.value)
    }
  }

  // ==================== LIFECYCLE ====================
  onMounted(() => { window.addEventListener('keydown', handleKeyDown) })
  onUnmounted(() => { window.removeEventListener('keydown', handleKeyDown) })

  // ==================== PUBLIC API ====================
  function getPolygons() {
    return polygons.value
  }

  function setPolygons(newPolygons: Polygon[]) {
    polygons.value = newPolygons
    saveToHistory()
  }

  // ==================== RETURN ====================
  return {
    // Refs
    canvasContainer,
    svgCanvas,
    // State
    zoom,
    panX,
    panY,
    isPanning,
    currentMode,
    polygons,
    currentPolygon,
    mousePosition,
    selectedPolygonId,
    isPropertiesPanelOpen,
    draggingPoint,
    showGrid,
    snapToGridEnabled,
    gridSize,
    history,
    historyIndex,
    // Computed
    selectedPolygon,
    selectedPolygonBoundingBox,
    // Methods
    pointsToString,
    getMousePosition,
    handleCanvasMouseDown,
    handleCanvasMouseMove,
    handleCanvasMouseUp,
    handleCanvasDoubleClick,
    handlePolygonClick,
    handleWheel,
    selectPolygon,
    togglePolygonVisibility,
    deletePolygon,
    duplicateSelectedPolygon,
    clearAll,
    startDraggingPoint,
    updatePolygon,
    getEntityDisplayName,
    handleEntityUpdate,
    handleLabelUpdate,
    updateCoordinatesFromJSON,
    zoomIn,
    zoomOut,
    resetZoom,
    undo,
    redo,
    getPolygons,
    setPolygons,
  }
}
