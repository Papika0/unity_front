/**
 * Mathematical calculation functions for polygon processing
 */

/**
 * Calculate area of polygon using shoelace formula
 */
export function calculateArea(points: number[][]): number {
  let area = 0

  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[(i + 1) % points.length]
    area += x1 * y2 - x2 * y1
  }

  return Math.abs(area) / 2
}

/**
 * Calculate bounding box
 */
export function calculateBoundingBox(points: number[][]): {
  x: number
  y: number
  width: number
  height: number
} {
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])

  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

/**
 * Calculate centroid (center point)
 */
export function calculateCentroid(points: number[][]): { x: number; y: number } {
  let x = 0
  let y = 0

  for (const [px, py] of points) {
    x += px
    y += py
  }

  return {
    x: x / points.length,
    y: y / points.length,
  }
}

/**
 * Calculate perpendicular distance from point to line segment
 */
export function perpendicularDistance(
  point: number[],
  lineStart: number[],
  lineEnd: number[]
): number {
  const [px, py] = point
  const [x1, y1] = lineStart
  const [x2, y2] = lineEnd

  const dx = x2 - x1
  const dy = y2 - y1

  if (dx === 0 && dy === 0) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2)
  }

  const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)

  let nearestX: number, nearestY: number

  if (t < 0) {
    nearestX = x1
    nearestY = y1
  } else if (t > 1) {
    nearestX = x2
    nearestY = y2
  } else {
    nearestX = x1 + t * dx
    nearestY = y1 + t * dy
  }

  return Math.sqrt((px - nearestX) ** 2 + (py - nearestY) ** 2)
}
