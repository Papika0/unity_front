/**
 * Validation and utility functions for image compression
 */

import { CANVAS_MAX_SIZE, CANVAS_MAX_AREA } from './constants'
import { CompressionError } from './types'

/**
 * Validate canvas dimensions against browser limits
 */
export function validateCanvasDimensions(width: number, height: number): void {
  if (width > CANVAS_MAX_SIZE || height > CANVAS_MAX_SIZE) {
    throw new CompressionError(
      `Image dimensions (${width}x${height}) exceed browser limits (${CANVAS_MAX_SIZE}x${CANVAS_MAX_SIZE})`,
      'SIZE_LIMIT'
    )
  }
  if (width * height > CANVAS_MAX_AREA) {
    throw new CompressionError(
      `Image area (${width * height} pixels) exceeds browser limits (${CANVAS_MAX_AREA} pixels)`,
      'SIZE_LIMIT'
    )
  }
}

/**
 * Check WebP support in browser
 */
export function isWebPSupported(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 0
}

/**
 * Check if PNG image has transparency
 */
export async function hasTransparency(file: File): Promise<boolean> {
  if (file.type !== 'image/png') return false

  return new Promise((resolve) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      if (!ctx) {
        resolve(false)
        return
      }

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Check for any transparent pixels
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 255) {
          URL.revokeObjectURL(img.src)
          resolve(true)
          return
        }
      }

      URL.revokeObjectURL(img.src)
      resolve(false)
    }

    img.onerror = () => {
      resolve(false)
    }

    img.src = URL.createObjectURL(file)
  })
}
