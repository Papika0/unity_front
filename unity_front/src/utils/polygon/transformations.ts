/**
 * Polygon transformation functions
 */

import type { Point, Polygon } from '@/types/polygon'
import { calculateBoundingBox } from './calculations'

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
