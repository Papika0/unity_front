/**
 * Preset parameter configurations and comparison utilities
 */

import type { DetectionOptions, DetectedPolygon } from './types'
import { findApartmentColors } from './colors'
import { detectApartmentPolygons } from './index'

/**
 * Create preset parameter configurations for common scenarios
 */
export const PRESET_PARAMETERS = {
  /** High precision - detects small apartments, more detailed polygons */
  highPrecision: {
    minArea: 500,
    colorTolerance: 25,
    simplifyTolerance: 5.0,
    morphRadius: 3,
    cornerAngleThreshold: 10,
  } as DetectionOptions,

  /** Balanced - good for most floor plans with clean straight edges */
  balanced: {
    minArea: 1500,
    colorTolerance: 40,
    simplifyTolerance: 8.0,
    morphRadius: 5,
    cornerAngleThreshold: 15,
  } as DetectionOptions,

  /** Robust - filters noise, merges details, very clean polygons with minimal points */
  robust: {
    minArea: 5000,
    colorTolerance: 50,
    simplifyTolerance: 12.0,
    morphRadius: 7,
    cornerAngleThreshold: 20,
  } as DetectionOptions,

  /** Large buildings - for floor plans with large apartments */
  largeBuildingts: {
    minArea: 10000,
    colorTolerance: 45,
    simplifyTolerance: 15.0,
    morphRadius: 8,
    cornerAngleThreshold: 20,
  } as DetectionOptions,

  /** Many apartments - for complex floor plans with 10+ apartments, clean edges */
  manyApartments: {
    minArea: 800,
    colorTolerance: 35,
    simplifyTolerance: 7.0,
    morphRadius: 4,
    cornerAngleThreshold: 12,
  } as DetectionOptions,
}

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
 * Suggest optimal parameters based on image analysis
 */
export async function suggestParameters(imageFile: File): Promise<Partial<DetectionOptions>> {
  const img = await loadImage(imageFile)
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  const totalPixels = imageData.width * imageData.height
  const imageSize = totalPixels

  // Analyze image
  const colors = findApartmentColors(imageData)
  const avgColorCount = colors.length

  // Calculate expected apartment count based on colors
  const estimatedApartments = Math.max(8, Math.min(15, Math.floor(avgColorCount / 1.5)))

  // Calculate minArea based on expected number of apartments
  const minAreaByCount = Math.floor(imageSize / estimatedApartments / 2)

  // Also consider absolute minimum based on image size
  const minAreaBySize = Math.max(500, Math.floor(imageSize / 300))

  // Use the smaller of the two (more permissive)
  const minArea = Math.min(minAreaByCount, minAreaBySize)

  // Suggest parameters
  const suggestions: Partial<DetectionOptions> = {
    minArea: Math.max(500, minArea),
    maxArea: Math.floor(imageSize / 2),
    colorTolerance: avgColorCount > 15 ? 50 : avgColorCount > 10 ? 40 : 30,
    simplifyTolerance: Math.max(6, Math.min(12, Math.floor(Math.min(img.width, img.height) / 150))),
    morphRadius: Math.max(3, Math.min(7, Math.floor(Math.min(img.width, img.height) / 400))),
    cornerAngleThreshold: 15,
  }

  return suggestions
}

/**
 * Test detection with multiple parameter sets and compare results
 */
export async function compareParameters(
  imageFile: File,
  parameterSets: Array<{ name: string; options: DetectionOptions }>
): Promise<
  Array<{
    name: string
    polygonCount: number
    averageArea: number
    polygons: DetectedPolygon[]
  }>
> {
  const results = []

  for (const { name, options } of parameterSets) {
    const polygons = await detectApartmentPolygons(imageFile, options)

    const averageArea =
      polygons.length > 0 ? polygons.reduce((sum, p) => sum + p.area, 0) / polygons.length : 0

    results.push({
      name,
      polygonCount: polygons.length,
      averageArea: Math.round(averageArea),
      polygons,
    })
  }

  return results
}
