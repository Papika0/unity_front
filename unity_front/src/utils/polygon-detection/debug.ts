/**
 * Debug visualization functions for polygon detection
 */

import type { DetectedPolygon, DebugVisualization, ColorCluster } from './types'

/**
 * Create a new canvas element
 */
export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/**
 * Visualize color clusters on canvas
 */
export function visualizeColorClusters(
  imageData: ImageData,
  colors: ColorCluster[],
  tolerance: number,
  targetCanvas: HTMLCanvasElement
): void {
  const ctx = targetCanvas.getContext('2d')!
  const { data, width, height } = imageData
  const outputData = ctx.createImageData(width, height)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]

    if (a < 128) {
      outputData.data[i + 3] = 0
      continue
    }

    // Find closest color cluster
    let minDist = Infinity
    let closestColor: ColorCluster | null = null

    for (const color of colors) {
      const dist = Math.sqrt((r - color.r) ** 2 + (g - color.g) ** 2 + (b - color.b) ** 2)
      if (dist < minDist && dist <= tolerance) {
        minDist = dist
        closestColor = color
      }
    }

    if (closestColor) {
      // Color pixels that match clusters
      outputData.data[i] = closestColor.r
      outputData.data[i + 1] = closestColor.g
      outputData.data[i + 2] = closestColor.b
      outputData.data[i + 3] = 255
    } else {
      // Gray out pixels that don't match any cluster
      const gray = (r + g + b) / 3
      outputData.data[i] = gray
      outputData.data[i + 1] = gray
      outputData.data[i + 2] = gray
      outputData.data[i + 3] = 100
    }
  }

  ctx.putImageData(outputData, 0, 0)
}

/**
 * Visualize a binary mask as white pixels on black background
 */
export function visualizeMask(
  mask: Uint8Array,
  width: number,
  height: number,
  targetCanvas: HTMLCanvasElement
): void {
  const ctx = targetCanvas.getContext('2d')!
  const imageData = ctx.createImageData(width, height)

  for (let i = 0; i < mask.length; i++) {
    const pixelIdx = i * 4
    if (mask[i]) {
      imageData.data[pixelIdx] = 255 // R
      imageData.data[pixelIdx + 1] = 255 // G
      imageData.data[pixelIdx + 2] = 255 // B
      imageData.data[pixelIdx + 3] = 255 // A
    } else {
      imageData.data[pixelIdx] = 0
      imageData.data[pixelIdx + 1] = 0
      imageData.data[pixelIdx + 2] = 0
      imageData.data[pixelIdx + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * Visualize detected contours overlaid on original image
 */
export function visualizeContours(
  sourceCanvas: HTMLCanvasElement,
  polygons: DetectedPolygon[],
  targetCanvas: HTMLCanvasElement
): void {
  const ctx = targetCanvas.getContext('2d')!

  // Draw original image
  ctx.drawImage(sourceCanvas, 0, 0)

  // Draw each polygon
  polygons.forEach((polygon, index) => {
    ctx.beginPath()
    ctx.strokeStyle = `hsl(${(index * 360) / polygons.length}, 100%, 50%)`
    ctx.lineWidth = 3
    ctx.fillStyle = `hsla(${(index * 360) / polygons.length}, 100%, 50%, 0.2)`

    // Draw polygon path
    const [firstX, firstY] = polygon.points[0]
    ctx.moveTo(firstX, firstY)

    for (let i = 1; i < polygon.points.length; i++) {
      const [x, y] = polygon.points[i]
      ctx.lineTo(x, y)
    }

    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Draw centroid
    ctx.beginPath()
    ctx.arc(polygon.centroid.x, polygon.centroid.y, 5, 0, Math.PI * 2)
    ctx.fillStyle = 'red'
    ctx.fill()

    // Draw label
    ctx.fillStyle = 'black'
    ctx.font = 'bold 16px Arial'
    ctx.fillText(`#${index + 1}`, polygon.centroid.x + 10, polygon.centroid.y - 10)
  })
}

/**
 * Get debug visualization from detection results
 */
export function getDebugVisualization(polygons: DetectedPolygon[]): DebugVisualization | null {
  return (polygons as unknown as { __debug?: DebugVisualization }).__debug || null
}
