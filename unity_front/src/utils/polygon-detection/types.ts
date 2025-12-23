/**
 * Type definitions for polygon detection module
 */

export interface DetectedPolygon {
  points: number[][]
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
  area: number
  centroid: { x: number; y: number }
  color?: string
}

export interface DetectionOptions {
  /** Minimum area for valid apartment (default: adaptive based on image size) */
  minArea?: number
  /** Maximum area for valid apartment (default: image size / 2) */
  maxArea?: number
  /** Color matching tolerance (0-255, default: 40) */
  colorTolerance?: number
  /** Polygon simplification (default: 8.0 for very clean edges) */
  simplifyTolerance?: number
  /** Edge detection threshold (default: 50) */
  edgeThreshold?: number
  /** Morphological operation radius (default: 5 for filling details) */
  morphRadius?: number
  /** Min angle for corner detection in degrees (default: 15) */
  cornerAngleThreshold?: number
  /** Enable debug visualization (default: false) */
  debug?: boolean
  /** Progress callback */
  onProgress?: (stage: string, progress: number) => void
}

export interface DebugVisualization {
  originalImage: HTMLCanvasElement
  colorClusters: HTMLCanvasElement
  masks: Array<{ color: string; canvas: HTMLCanvasElement }>
  cleanedMasks: Array<{ color: string; canvas: HTMLCanvasElement }>
  contours: HTMLCanvasElement
}

export interface ColorCluster {
  r: number
  g: number
  b: number
  color: string
}
