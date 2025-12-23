/**
 * Polygon Geometry Utilities
 * Helper functions for polygon calculations and collision detection
 */

export interface Point {
  x: number
  y: number
}

export interface BoundingBox {
  min_x: number
  max_x: number
  min_y: number
  max_y: number
}

/**
 * Calculate polygon area using Shoelace formula
 */
export function calculatePolygonArea(points: Point[]): number {
  if (points.length < 3) return 0

  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    area += points[i].x * points[j].y
    area -= points[j].x * points[i].y
  }
  return Math.abs(area / 2)
}

/**
 * Calculate bounding box for a set of points
 */
export function calculateBoundingBox(points: Point[]): BoundingBox {
  if (points.length === 0) {
    return { min_x: 0, max_x: 0, min_y: 0, max_y: 0 }
  }

  const box: BoundingBox = {
    min_x: points[0].x,
    max_x: points[0].x,
    min_y: points[0].y,
    max_y: points[0].y
  }

  for (const point of points) {
    box.min_x = Math.min(box.min_x, point.x)
    box.max_x = Math.max(box.max_x, point.x)
    box.min_y = Math.min(box.min_y, point.y)
    box.max_y = Math.max(box.max_y, point.y)
  }

  return box
}

/**
 * Check if two bounding boxes overlap
 */
export function boundingBoxesOverlap(box1: BoundingBox, box2: BoundingBox): boolean {
  return !(
    box1.max_x < box2.min_x ||
    box1.min_x > box2.max_x ||
    box1.max_y < box2.min_y ||
    box1.min_y > box2.max_y
  )
}

/**
 * Check if a point is inside a polygon using ray casting
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    if (
      polygon[i].y > point.y !== polygon[j].y > point.y &&
      point.x < ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) / 
                (polygon[j].y - polygon[i].y) + polygon[i].x
    ) {
      inside = !inside
    }
  }
  return inside
}
