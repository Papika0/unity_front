/**
 * Polygon generation and viewBox functions
 */

import type { Point, Polygon } from '@/types/polygon'

/**
 * Generate a rectangle polygon
 */
export function generateRectangle(x: number, y: number, width: number, height: number): Point[] {
  return [
    { x, y },
    { x: x + width, y },
    { x: x + width, y: y + height },
    { x, y: y + height },
  ]
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
export function parseViewBox(
  viewBox: string
): { x: number; y: number; width: number; height: number } {
  const [x, y, width, height] = viewBox.split(' ').map(Number)
  return { x, y, width, height }
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
