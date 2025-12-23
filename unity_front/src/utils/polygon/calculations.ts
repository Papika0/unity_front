/**
 * Math calculation functions for polygons
 */

import type { Point, BoundingBox } from '@/types/polygon'

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
