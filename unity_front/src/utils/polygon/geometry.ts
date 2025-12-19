/**
 * Geometric utility functions for polygons
 */

import type { Point } from '@/types/polygon'
import { distanceToLineSegment } from './calculations'

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
 * Snap point to grid
 */
export function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  }
}

/**
 * Validate polygon (must have at least 3 points)
 */
export function isValidPolygon(points: Point[]): boolean {
  return points.length >= 3
}
