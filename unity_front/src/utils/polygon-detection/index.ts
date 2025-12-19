/**
 * Automatic polygon detection for floor plan apartments
 * Uses color segmentation and contour detection to identify apartment boundaries
 */

// Re-export types
export type { DetectedPolygon, DetectionOptions, DebugVisualization, ColorCluster } from './types'

// Re-export utilities
export { findApartmentColors, getTwoDominantColors, createColorMask } from './colors'
export { cleanupMask, dilate, erode } from './morphology'
export { findAllConnectedRegions, traceOuterContour } from './contour'
export { calculateArea, calculateBoundingBox, calculateCentroid, perpendicularDistance } from './calculations'
export {
  simplifyPolygon,
  detectCorners,
  alignToArchitecturalAngles,
  removeClosePoints,
  ramerDouglasPeucker,
  mergeCollinearPoints,
} from './simplification'
export {
  createCanvas,
  visualizeColorClusters,
  visualizeMask,
  visualizeContours,
  getDebugVisualization,
} from './debug'
export { PRESET_PARAMETERS, suggestParameters, compareParameters } from './presets'

// Import for internal use
import type { DetectedPolygon, DetectionOptions, DebugVisualization } from './types'
import { findApartmentColors, getTwoDominantColors, createColorMask } from './colors'
import { cleanupMask } from './morphology'
import { findAllConnectedRegions, traceOuterContour } from './contour'
import { calculateArea, calculateBoundingBox, calculateCentroid } from './calculations'
import { simplifyPolygon } from './simplification'
import { createCanvas, visualizeColorClusters, visualizeMask, visualizeContours } from './debug'

/**
 * Load image from file
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Detect apartment polygons from a floor plan image
 */
export async function detectApartmentPolygons(
  imageFile: File,
  options: DetectionOptions = {}
): Promise<DetectedPolygon[]> {
  // Load image first to calculate adaptive defaults
  const img = await loadImage(imageFile)
  const totalPixels = img.width * img.height

  // Calculate adaptive minArea: at least 0.5% of image, but no less than 500
  const adaptiveMinArea = Math.max(500, Math.floor(totalPixels / 200))

  const {
    minArea = adaptiveMinArea,
    maxArea = Infinity,
    colorTolerance = 40,
    simplifyTolerance = 8.0,
    morphRadius = 5,
    cornerAngleThreshold = 15,
    debug = false,
    onProgress,
  } = options

  onProgress?.('Loading image', 0)

  // Create canvas for processing
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)

  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  // Debug visualization setup
  const debugViz: DebugVisualization | null = debug
    ? {
        originalImage: canvas,
        colorClusters: createCanvas(canvas.width, canvas.height),
        masks: [],
        cleanedMasks: [],
        contours: createCanvas(canvas.width, canvas.height),
      }
    : null

  // Step 1: Find unique apartment colors using clustering
  onProgress?.('Finding apartment colors', 10)
  const apartmentColors = findApartmentColors(imageData)

  // Step 1.5: Get the TWO most dominant apartment colors (human-like reasoning)
  const dominantColors = getTwoDominantColors(apartmentColors, 2, colorTolerance)

  // Visualize color clusters
  if (debugViz) {
    visualizeColorClusters(imageData, dominantColors, colorTolerance, debugViz.colorClusters)
  }

  // Step 2: For EACH dominant color, find ALL separate regions (not just largest)
  const polygons: DetectedPolygon[] = []
  let processedColors = 0

  for (let i = 0; i < dominantColors.length; i++) {
    const color = dominantColors[i]
    onProgress?.('Processing apartments', 10 + (i / dominantColors.length) * 80)

    // Create binary mask for this color
    const mask = createColorMask(imageData, color, colorTolerance)

    // Debug: visualize original mask
    if (debugViz) {
      const maskCanvas = createCanvas(canvas.width, canvas.height)
      visualizeMask(mask, canvas.width, canvas.height, maskCanvas)
      debugViz.masks.push({ color: color.color, canvas: maskCanvas })
    }

    // Apply morphological operations to clean up the mask and merge fragments
    const cleanedMask = cleanupMask(mask, imageData.width, imageData.height, morphRadius)

    // Debug: visualize cleaned mask
    if (debugViz) {
      const cleanedCanvas = createCanvas(canvas.width, canvas.height)
      visualizeMask(cleanedMask, canvas.width, canvas.height, cleanedCanvas)
      debugViz.cleanedMasks.push({ color: color.color, canvas: cleanedCanvas })
    }

    // Find ALL connected regions for this color (not just the largest one)
    const regions = findAllConnectedRegions(cleanedMask, imageData.width, imageData.height, minArea)

    // Process each region as a separate apartment
    for (const region of regions) {
      // Create mask for this specific region
      const regionMask = new Uint8Array(imageData.width * imageData.height)
      for (const pixelIdx of region) {
        regionMask[pixelIdx] = 1
      }

      // Find the outer contour of this region
      const contour = traceOuterContour(regionMask, imageData.width, imageData.height)

      if (!contour || contour.length < 4) {
        continue
      }

      // Calculate area
      const area = calculateArea(contour)
      if (area < minArea || area > maxArea) {
        continue
      }

      // Simplify polygon
      const simplified = simplifyPolygon(contour, simplifyTolerance, cornerAngleThreshold)

      if (simplified.length < 3) {
        continue
      }

      // Calculate properties
      const boundingBox = calculateBoundingBox(simplified)
      const centroid = calculateCentroid(simplified)

      polygons.push({
        points: simplified,
        boundingBox,
        area,
        centroid,
        color: color.color,
      })
    }

    processedColors++
  }

  // Visualize final contours
  if (debugViz) {
    visualizeContours(debugViz.originalImage, polygons, debugViz.contours)
  }

  onProgress?.('Sorting results', 95)

  // Sort by position (top to bottom, left to right)
  polygons.sort((a, b) => {
    const yDiff = a.centroid.y - b.centroid.y
    if (Math.abs(yDiff) > 50) return yDiff
    return a.centroid.x - b.centroid.x
  })

  onProgress?.('Complete', 100)

  // Expose debug visualization for external use
  if (debug && debugViz) {
    ;(polygons as unknown as { __debug?: DebugVisualization }).__debug = debugViz
  }

  return polygons
}
