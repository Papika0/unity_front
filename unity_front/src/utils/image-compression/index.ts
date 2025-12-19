/**
 * Enhanced Image Compression for Construction Company
 * Optimized for better compression while maintaining professional quality
 */

// Re-export types
export type { CompressionOptions, CompressionResult, ConstructionImageType } from './types'
export { CompressionError } from './types'

// Re-export constants
export {
  CANVAS_MAX_SIZE,
  CANVAS_MAX_AREA,
  COMPRESSION_QUALITY,
  MAX_WIDTH,
  MAX_HEIGHT,
  MAX_TOTAL_SIZE,
  MIN_QUALITY,
  CONSTRUCTION_PRESETS,
} from './constants'

// Re-export validation utilities
export { validateCanvasDimensions, isWebPSupported, hasTransparency } from './validation'

// Re-export quality utilities
export { calculateSmartQuality, calculateOptimalDimensions } from './quality'

// Re-export batch utilities
export {
  compressBatch,
  autoCompressForUpload,
  compressProjectImages,
  checkTotalPayloadSize,
  getCompressionStats,
  compressFileIfNeeded,
  compressImageForType,
} from './batch'

// Import for internal use
import type { CompressionOptions, CompressionResult } from './types'
import { CompressionError } from './types'
import {
  CONSTRUCTION_PRESETS,
  COMPRESSION_QUALITY,
  MAX_WIDTH,
  MAX_HEIGHT,
  MIN_QUALITY,
} from './constants'
import { validateCanvasDimensions, isWebPSupported, hasTransparency } from './validation'
import { calculateSmartQuality, calculateOptimalDimensions } from './quality'

/**
 * Main compression function with enhanced features
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const startTime = performance.now()

  // Apply preset if specified
  const preset = options.imageType ? CONSTRUCTION_PRESETS[options.imageType] : undefined

  const {
    quality = preset?.quality || COMPRESSION_QUALITY,
    maxWidth = preset?.maxWidth || MAX_WIDTH,
    maxHeight = preset?.maxHeight || MAX_HEIGHT,
    preferWebP = preset?.preferWebP ?? isWebPSupported(),
    onProgress,
    minQuality = preset?.minQuality || MIN_QUALITY,
    smartCompression = true,
    convertPngToJpeg = preset?.convertPngToJpeg ?? true,
    forceDimensions = false,
  } = { ...preset, ...options }

  // Validate input
  if (!file || !(file instanceof File)) {
    throw new CompressionError('Invalid file provided', 'INVALID_FILE')
  }

  if (!file.type.startsWith('image/')) {
    throw new CompressionError('File is not an image', 'INVALID_FILE')
  }

  // Skip tiny files
  if (file.size < 50 * 1024) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1,
      dimensions: { width: 0, height: 0 },
      format: file.type,
      processingTime: performance.now() - startTime,
      finalQuality: 1,
      wasConverted: false,
    }
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    })

    if (!ctx) {
      reject(new CompressionError('Could not get canvas context', 'CANVAS_ERROR'))
      return
    }

    const img = new Image()
    let objectUrl: string | null = null

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrl = null
      }
      canvas.width = canvas.height = 0
    }

    img.onload = async () => {
      try {
        onProgress?.(10)

        const { width, height, scaled } = calculateOptimalDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight,
          file.size,
          forceDimensions
        )

        // Validate canvas dimensions
        validateCanvasDimensions(width, height)

        canvas.width = width
        canvas.height = height

        onProgress?.(30)

        // High quality rendering for construction images
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)

        onProgress?.(50)

        // Determine output format
        let outputType = file.type || 'image/jpeg'
        let wasConverted = false

        // Smart PNG to JPEG conversion
        if (file.type === 'image/png' && convertPngToJpeg) {
          const hasAlpha = await hasTransparency(file)
          if (!hasAlpha && file.size > 500 * 1024) {
            outputType = 'image/jpeg'
            wasConverted = true
          }
        }

        // Use WebP when beneficial
        if (preferWebP) {
          if (file.size > 2.5 * 1024 * 1024 || outputType !== 'image/png') {
            outputType = 'image/webp'
            wasConverted = true
          }
        }

        // Calculate final quality
        let finalQuality = quality
        if (smartCompression) {
          finalQuality = calculateSmartQuality(file, quality, minQuality, { width, height })
        }

        // Adjust quality for format
        if (outputType === 'image/webp') {
          finalQuality = Math.min(finalQuality + 0.05, 0.95)
        } else if (wasConverted && outputType === 'image/jpeg') {
          finalQuality = Math.max(finalQuality - 0.03, minQuality)
        }

        onProgress?.(70)

        // Try multiple quality levels if needed
        let blob: Blob | null = null
        let attempts = 0
        let currentQuality = finalQuality

        while (attempts < 3) {
          blob = await new Promise<Blob | null>((resolveBlob) => {
            canvas.toBlob((b: Blob | null) => resolveBlob(b), outputType, currentQuality)
          })

          if (blob && blob.size < file.size * 0.9) {
            break
          }

          currentQuality = Math.max(currentQuality - 0.05, minQuality)
          attempts++

          if (currentQuality === minQuality) break
        }

        onProgress?.(90)

        if (!blob) {
          cleanup()
          reject(new CompressionError('Failed to create blob', 'CANVAS_ERROR'))
          return
        }

        // Force compression for files larger than 2MB (PHP upload limit)
        const phpUploadLimit = 2 * 1024 * 1024
        const forceCompression = file.size > phpUploadLimit

        // Only use compressed version if it's actually smaller
        if (blob.size >= file.size * 0.85 && !scaled && !wasConverted && !forceCompression) {
          cleanup()
          resolve({
            file,
            originalSize: file.size,
            compressedSize: file.size,
            compressionRatio: 1,
            dimensions: { width: img.width, height: img.height },
            format: file.type,
            processingTime: performance.now() - startTime,
            finalQuality: 1,
            wasConverted: false,
          })
          return
        }

        // If still too large after compression, try more aggressive compression
        if (blob.size > phpUploadLimit) {
          let retryAttempts = 0
          const maxAttempts = 3
          let testQuality = Math.max(currentQuality - 0.1, minQuality)

          while (blob.size > phpUploadLimit && retryAttempts < maxAttempts && testQuality >= minQuality) {
            const testBlob = await new Promise<Blob | null>((resolveBlob) => {
              canvas.toBlob((b: Blob | null) => resolveBlob(b), outputType, testQuality)
            })

            if (testBlob && testBlob.size < blob.size) {
              blob = testBlob
              currentQuality = testQuality
            }

            testQuality = Math.max(testQuality - 0.05, minQuality)
            retryAttempts++
          }

          // If still too large, try with smaller dimensions
          if (blob.size > phpUploadLimit) {
            const smallerWidth = Math.floor(width * 0.8)
            const smallerHeight = Math.floor(height * 0.8)

            canvas.width = smallerWidth
            canvas.height = smallerHeight
            ctx.drawImage(img, 0, 0, smallerWidth, smallerHeight)

            const smallerBlob = await new Promise<Blob | null>((resolveBlob) => {
              canvas.toBlob((b: Blob | null) => resolveBlob(b), outputType, minQuality)
            })

            if (smallerBlob && smallerBlob.size < blob.size) {
              blob = smallerBlob
              currentQuality = minQuality
            }
          }
        }

        // Final check
        if (!blob) {
          cleanup()
          reject(new CompressionError('Failed to create final blob', 'CANVAS_ERROR'))
          return
        }

        // Create final file
        const extension = outputType.split('/')[1]
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        const finalName = `${nameWithoutExt}.${extension}`

        const compressedFile = new File([blob], finalName, {
          type: outputType,
          lastModified: Date.now(),
        })

        onProgress?.(100)
        cleanup()

        const result: CompressionResult = {
          file: compressedFile,
          originalSize: file.size,
          compressedSize: compressedFile.size,
          compressionRatio: compressedFile.size / file.size,
          dimensions: { width, height },
          format: outputType,
          processingTime: performance.now() - startTime,
          finalQuality: currentQuality,
          wasConverted,
        }

        resolve(result)
      } catch (error) {
        cleanup()
        if (error instanceof CompressionError) {
          reject(error)
        } else {
          reject(new CompressionError(String(error), 'UNKNOWN'))
        }
      }
    }

    img.onerror = () => {
      cleanup()
      reject(new CompressionError('Failed to load image', 'INVALID_FILE'))
    }

    objectUrl = URL.createObjectURL(file)
    img.src = objectUrl
    onProgress?.(5)
  })
}
