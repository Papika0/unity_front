/**
 * Type definitions for polygon utilities
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
