/**
 * Polygon and coordinate utility functions for zone editors
 */

// Re-export types from types directory
export type { Point, Polygon, BoundingBox } from '@/types/polygon'

// Re-export calculations
export { calculateBoundingBox, calculatePolygonArea, distanceToLineSegment } from './calculations'

// Re-export transformations
export {
  translatePolygon,
  scalePolygon,
  mirrorPolygonHorizontal,
  mirrorPolygonVertical,
  duplicatePolygon,
} from './transformations'

// Re-export conversions
export {
  pointsToPolygonString,
  polygonStringToPoints,
  pointsToBackendFormat,
  backendFormatToPoints,
} from './conversions'

// Re-export geometry
export { isPointInPolygon, isPointNearEdge, snapToGrid, isValidPolygon } from './geometry'

// Re-export generators
export {
  generateRectangle,
  generateFloorStrips,
  calculateViewBox,
  parseViewBox,
  getStatusColor,
} from './generators'
