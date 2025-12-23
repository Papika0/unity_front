/**
 * Color detection and clustering functions
 */

import type { ColorCluster } from './types'

/**
 * Find distinct apartment colors using clustering algorithm
 */
export function findApartmentColors(imageData: ImageData): ColorCluster[] {
  const { data } = imageData

  // Collect color samples (skip white, black, and gray pixels)
  const colorSamples: Array<{ r: number; g: number; b: number }> = []
  const samplingRate = 10 // Sample every 10th pixel for speed

  for (let i = 0; i < data.length; i += 4 * samplingRate) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    // Skip transparent pixels
    if (a < 128) continue

    // Skip white/black/gray pixels (walls, lines, etc.)
    const isGray = Math.abs(r - g) < 15 && Math.abs(g - b) < 15 && Math.abs(r - b) < 15
    if (isGray && (r > 200 || r < 50)) continue

    colorSamples.push({ r, g, b })
  }

  // Use simple clustering to find dominant colors
  const colorClusters: Array<{
    color: { r: number; g: number; b: number }
    count: number
  }> = []

  for (const sample of colorSamples) {
    let foundCluster = false

    for (const cluster of colorClusters) {
      const dist = Math.sqrt(
        (sample.r - cluster.color.r) ** 2 +
          (sample.g - cluster.color.g) ** 2 +
          (sample.b - cluster.color.b) ** 2
      )

      // Adaptive clustering distance based on total colors found
      const clusterDistance = colorClusters.length > 20 ? 25 : 30

      if (dist < clusterDistance) {
        cluster.count++
        // Update cluster center (running average)
        cluster.color.r = Math.round(
          (cluster.color.r * (cluster.count - 1) + sample.r) / cluster.count
        )
        cluster.color.g = Math.round(
          (cluster.color.g * (cluster.count - 1) + sample.g) / cluster.count
        )
        cluster.color.b = Math.round(
          (cluster.color.b * (cluster.count - 1) + sample.b) / cluster.count
        )
        foundCluster = true
        break
      }
    }

    if (!foundCluster) {
      colorClusters.push({
        color: { ...sample },
        count: 1,
      })
    }
  }

  // Filter clusters by significance
  const minClusterSize = Math.max(colorSamples.length * 0.003, 10)
  const significantClusters = colorClusters
    .filter((c) => c.count > minClusterSize)
    .sort((a, b) => b.count - a.count)
    .slice(0, 30)

  return significantClusters.map((c) => ({
    r: c.color.r,
    g: c.color.g,
    b: c.color.b,
    color: `rgb(${c.color.r},${c.color.g},${c.color.b})`,
  }))
}

/**
 * Get the N most dominant colors (human-like visual reasoning)
 * Filters out colors that are too similar to already selected ones
 */
export function getTwoDominantColors(
  colors: ColorCluster[],
  count: number,
  tolerance: number
): ColorCluster[] {
  const result: ColorCluster[] = []

  for (const color of colors) {
    // Check if this color is too similar to any already selected color
    const tooSimilar = result.some((selectedColor) => {
      const dist = Math.sqrt(
        (color.r - selectedColor.r) ** 2 +
          (color.g - selectedColor.g) ** 2 +
          (color.b - selectedColor.b) ** 2
      )
      return dist < tolerance
    })

    if (!tooSimilar) {
      result.push(color)
      if (result.length >= count) break
    }
  }

  return result
}

/**
 * Create a binary mask for pixels matching the target color
 */
export function createColorMask(
  imageData: ImageData,
  targetColor: { r: number; g: number; b: number },
  tolerance: number
): Uint8Array {
  const { data, width, height } = imageData
  const mask = new Uint8Array(width * height)

  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    if (a < 128) continue

    // Calculate color distance
    const dist = Math.sqrt(
      (r - targetColor.r) ** 2 + (g - targetColor.g) ** 2 + (b - targetColor.b) ** 2
    )

    if (dist <= tolerance) {
      mask[j] = 1
    }
  }

  return mask
}
