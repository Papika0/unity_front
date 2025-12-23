/**
 * Polygon format conversion functions
 */

import type { Point } from '@/types/polygon'

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
