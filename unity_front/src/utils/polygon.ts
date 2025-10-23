/**
 * Polygon and coordinate utility functions for zone editors
 */

export interface Point {
  x: number
  y: number
}

export interface Polygon {
  id: string
  points: Point[]
  entityId?: number | null
  label: string
  fillColor: string
  strokeColor: string
  hoverColor?: string
  visible: boolean
  selected?: boolean
}

export interface BoundingBox {
  min_x: number
  max_x: number
  min_y: number
  max_y: number
  width: number
  height: number
}

/**
 * Calculate bounding box for a polygon
 */
export function calculateBoundingBox(points: Point[]): BoundingBox {
  if (points.length === 0) {
    return { min_x: 0, max_x: 0, min_y: 0, max_y: 0, width: 0, height: 0 }
  }

  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)

  const min_x = Math.min(...xs)
  const max_x = Math.max(...xs)
  const min_y = Math.min(...ys)
  const max_y = Math.max(...ys)

  return {
    min_x,
    max_x,
    min_y,
    max_y,
    width: max_x - min_x,
    height: max_y - min_y,
  }
}

/**
 * Convert points array to polygon string for SVG
 */
export function pointsToPolygonString(points: Point[]): string {
  return points.map((p) => `${p.x},${p.y}`).join(' ')
}

/**
 * Convert polygon string to points array
 */
export function polygonStringToPoints(polygonString: string): Point[] {
  return polygonString.split(' ').map((pair) => {
    const [x, y] = pair.split(',').map(Number)
    return { x, y }
  })
}

/**
 * Check if a point is inside a polygon (ray casting algorithm)
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y

    const intersect =
      yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }
  return inside
}

/**
 * Check if a point is near a line segment (for edge selection)
 */
export function isPointNearEdge(
  point: Point,
  start: Point,
  end: Point,
  threshold: number = 5
): boolean {
  const distance = distanceToLineSegment(point, start, end)
  return distance <= threshold
}

/**
 * Calculate distance from point to line segment
 */
export function distanceToLineSegment(point: Point, start: Point, end: Point): number {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    return Math.sqrt((point.x - start.x) ** 2 + (point.y - start.y) ** 2)
  }

  let t = ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared
  t = Math.max(0, Math.min(1, t))

  const projectionX = start.x + t * dx
  const projectionY = start.y + t * dy

  return Math.sqrt((point.x - projectionX) ** 2 + (point.y - projectionY) ** 2)
}

/**
 * Snap point to grid
 */
export function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  }
}

/**
 * Translate (move) polygon by offset
 */
export function translatePolygon(points: Point[], offsetX: number, offsetY: number): Point[] {
  return points.map((p) => ({
    x: p.x + offsetX,
    y: p.y + offsetY,
  }))
}

/**
 * Scale polygon from center
 */
export function scalePolygon(points: Point[], scale: number): Point[] {
  const bbox = calculateBoundingBox(points)
  const centerX = (bbox.min_x + bbox.max_x) / 2
  const centerY = (bbox.min_y + bbox.max_y) / 2

  return points.map((p) => ({
    x: centerX + (p.x - centerX) * scale,
    y: centerY + (p.y - centerY) * scale,
  }))
}

/**
 * Mirror polygon horizontally
 */
export function mirrorPolygonHorizontal(points: Point[], centerX?: number): Point[] {
  const bbox = calculateBoundingBox(points)
  const center = centerX ?? (bbox.min_x + bbox.max_x) / 2

  return points.map((p) => ({
    x: 2 * center - p.x,
    y: p.y,
  }))
}

/**
 * Mirror polygon vertically
 */
export function mirrorPolygonVertical(points: Point[], centerY?: number): Point[] {
  const bbox = calculateBoundingBox(points)
  const center = centerY ?? (bbox.min_y + bbox.max_y) / 2

  return points.map((p) => ({
    x: p.x,
    y: 2 * center - p.y,
  }))
}

/**
 * Generate a rectangle polygon
 */
export function generateRectangle(
  x: number,
  y: number,
  width: number,
  height: number
): Point[] {
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ]
}

/**
 * Duplicate polygon with offset
 */
export function duplicatePolygon(polygon: Polygon, offsetX: number, offsetY: number): Polygon {
  return {
    ...polygon,
    id: `${polygon.id}-copy-${Date.now()}`,
    points: translatePolygon(polygon.points, offsetX, offsetY),
    selected: false,
  }
}

/**
 * Convert points to backend format [[x,y], [x,y], ...]
 */
export function pointsToBackendFormat(points: Point[]): number[][] {
  return points.map((p) => [p.x, p.y])
}

/**
 * Convert backend format to points
 */
export function backendFormatToPoints(coords: number[][]): Point[] {
  return coords.map((coord) => ({ x: coord[0], y: coord[1] }))
}

/**
 * Validate polygon (must have at least 3 points)
 */
export function isValidPolygon(points: Point[]): boolean {
  return points.length >= 3
}

/**
 * Calculate polygon area (for validation/sorting)
 */
export function calculatePolygonArea(points: Point[]): number {
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    area += points[i].x * points[j].y
    area -= points[j].x * points[i].y
  }
  return Math.abs(area / 2)
}

/**
 * Get status color for apartment
 */
export function getStatusColor(status: string): { fill: string; stroke: string } {
  switch (status) {
    case 'available':
      return { fill: '#10b98180', stroke: '#10b981' } // Green
    case 'reserved':
      return { fill: '#f59e0b80', stroke: '#f59e0b' } // Amber
    case 'sold':
      return { fill: '#6b728080', stroke: '#6b7280' } // Gray
    default:
      return { fill: '#3b82f680', stroke: '#3b82f6' } // Blue
  }
}

/**
 * Generate floor strip polygons automatically
 */
export function generateFloorStrips(config: {
  startFloor: number
  endFloor: number
  startX: number
  startY: number
  width: number
  height: number
  spacing: number
}): Polygon[] {
  const { startFloor, endFloor, startX, startY, width, height, spacing } = config
  const polygons: Polygon[] = []

  let currentY = startY

  for (let floor = startFloor; floor <= endFloor; floor++) {
    polygons.push({
      id: `floor-${floor}-${Date.now()}`,
      points: generateRectangle(startX, currentY, width, height),
      entityId: floor,
      label: `Floor ${floor}`,
      fillColor: '#3b82f680',
      strokeColor: '#3b82f6',
      visible: true,
      selected: false,
    })

    currentY += height + spacing
  }

  return polygons
}

/**
 * Calculate viewBox from image dimensions
 */
export function calculateViewBox(
  imageWidth: number,
  imageHeight: number,
  padding: number = 0
): string {
  return `${-padding} ${-padding} ${imageWidth + padding * 2} ${imageHeight + padding * 2}`
}

/**
 * Parse viewBox string to dimensions
 */
export function parseViewBox(viewBox: string): { x: number; y: number; width: number; height: number } {
  const [x, y, width, height] = viewBox.split(' ').map(Number)
  return { x, y, width, height }
}
