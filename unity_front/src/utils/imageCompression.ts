// Improved Image Compression Utility for Construction Company - Fixed Quality Issues
// Maintains professional image quality while achieving reasonable file sizes

// Browser limits for canvas dimensions
const CANVAS_MAX_SIZE = 16384 // Most browsers support up to 16384x16384
const CANVAS_MAX_AREA = 268435456 // Maximum pixel area (16384 * 16384)

// Compression settings - optimized for professional quality
const COMPRESSION_QUALITY = 0.85 // 85% quality - maintain professional appearance
const MAX_WIDTH = 1920 // Full HD width for excellent quality
const MAX_HEIGHT = 1440 // High resolution for excellent quality
const MIN_COMPRESSION_RATIO = 0.95 // Don't compress if minimal gains
const MAX_TOTAL_SIZE = 25 * 1024 * 1024 // 25MB total - reasonable for modern web
const MIN_QUALITY = 0.65 // Never go below 65% quality for professional use

// Construction-specific presets - balanced for quality and performance
const CONSTRUCTION_PRESETS = {
  blueprint: {
    quality: 0.9, // Very high quality for technical details
    maxWidth: 2400,
    maxHeight: 1800,
    preferWebP: true,
    minQuality: 0.75, // Never go below 75% for blueprints
  },
  sitePhoto: {
    quality: 0.85, // High quality for professional presentation
    maxWidth: 1920,
    maxHeight: 1440,
    preferWebP: true,
    minQuality: 0.7, // Never go below 70% for site photos
  },
  thumbnail: {
    quality: 0.75, // Good quality for previews
    maxWidth: 600,
    maxHeight: 450,
    preferWebP: true,
    minQuality: 0.65, // Thumbnails can be slightly lower
  },
  document: {
    quality: 0.88, // High quality for text readability
    maxWidth: 2000,
    maxHeight: 2000,
    preferWebP: true,
    minQuality: 0.75, // Keep documents readable
  },
  gallery: {
    quality: 0.78, // Good balance for gallery images with better compression
    maxWidth: 1600,
    maxHeight: 1200,
    preferWebP: true,
    minQuality: 0.65, // Gallery images need decent quality
  },
  main: {
    quality: 0.82, // Good quality for hero/main images with better compression
    maxWidth: 1920,
    maxHeight: 1440,
    preferWebP: true,
    minQuality: 0.7, // Main images should look great
  },
  render: {
    quality: 0.85, // High quality for architectural renders
    maxWidth: 1920,
    maxHeight: 1440,
    preferWebP: true,
    minQuality: 0.72, // Renders need good quality
  },
} as const

type ConstructionImageType = keyof typeof CONSTRUCTION_PRESETS

interface CompressionOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  preferWebP?: boolean
  onProgress?: (progress: number) => void
  preserveExif?: boolean
  imageType?: ConstructionImageType
  minQuality?: number // Minimum quality threshold
  smartCompression?: boolean // Enable smart compression algorithm
}

interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  dimensions: { width: number; height: number }
  format: string
  processingTime: number
  finalQuality: number // Track the actual quality used
}

// Custom error types for better error handling
class CompressionError extends Error {
  constructor(
    message: string,
    public code: 'TIMEOUT' | 'INVALID_FILE' | 'CANVAS_ERROR' | 'SIZE_LIMIT' | 'UNKNOWN',
  ) {
    super(message)
    this.name = 'CompressionError'
  }
}

// Check if WebP is supported
function isWebPSupported(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 0
}

// Smart quality calculation based on image characteristics
function calculateSmartQuality(file: File, baseQuality: number, minQuality: number): number {
  const fileSizeMB = file.size / (1024 * 1024)

  // For small files, use slightly reduced quality for better compression
  if (fileSizeMB < 1) {
    return Math.max(baseQuality - 0.05, 0.8)
  }

  // For medium files (1-3MB), use reduced quality for better compression
  if (fileSizeMB <= 3) {
    return Math.max(baseQuality - 0.1, minQuality)
  }

  // For large files, gradually reduce quality but respect minimum
  if (fileSizeMB <= 5) {
    return Math.max(baseQuality - 0.05, minQuality)
  }

  if (fileSizeMB <= 10) {
    return Math.max(baseQuality - 0.1, minQuality)
  }

  // For very large files, reduce more but never go below minimum
  return Math.max(baseQuality - 0.15, minQuality)
}

// Calculate optimal dimensions while maintaining aspect ratio
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  fileSize: number,
): { width: number; height: number } {
  let width = originalWidth
  let height = originalHeight

  // Calculate scale factor based on dimensions
  const scaleFactorWidth = maxWidth / originalWidth
  const scaleFactorHeight = maxHeight / originalHeight
  const scaleFactor = Math.min(scaleFactorWidth, scaleFactorHeight, 1)

  // Apply scale factor
  width = Math.floor(originalWidth * scaleFactor)
  height = Math.floor(originalHeight * scaleFactor)

  // For very large files, consider additional reduction (but not too aggressive)
  const fileSizeMB = fileSize / (1024 * 1024)
  if (fileSizeMB > 10 && scaleFactor === 1) {
    // Reduce by additional 10% for very large files
    width = Math.floor(width * 0.9)
    height = Math.floor(height * 0.9)
  }

  return { width, height }
}

// Get EXIF orientation from image file
async function getExifOrientation(file: File): Promise<number> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const view = new DataView(e.target?.result as ArrayBuffer)
      if (view.getUint16(0, false) !== 0xffd8) {
        resolve(1) // Not JPEG, no orientation
        return
      }

      const length = view.byteLength
      let offset = 2

      while (offset < length) {
        const marker = view.getUint16(offset, false)
        offset += 2

        if (marker === 0xffe1) {
          // APP1 marker (EXIF)
          if (view.getUint32(offset + 2, false) !== 0x45786966) {
            resolve(1)
            return
          }

          const little = view.getUint16(offset + 8, false) === 0x4949
          offset += 10

          const tags = view.getUint16(offset, little)
          offset += 2

          for (let i = 0; i < tags; i++) {
            const tag = view.getUint16(offset + i * 12, little)
            if (tag === 0x0112) {
              // Orientation tag
              resolve(view.getUint16(offset + i * 12 + 8, little))
              return
            }
          }
        } else if ((marker & 0xff00) !== 0xff00) {
          break
        } else {
          offset += view.getUint16(offset, false)
        }
      }
      resolve(1) // Default orientation
    }
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024)) // Read first 64KB only
  })
}

// Apply EXIF orientation to canvas
function applyOrientation(
  ctx: CanvasRenderingContext2D,
  orientation: number,
  width: number,
  height: number,
) {
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, width, 0)
      break
    case 3:
      ctx.transform(-1, 0, 0, -1, width, height)
      break
    case 4:
      ctx.transform(1, 0, 0, -1, 0, height)
      break
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0)
      break
    case 6:
      ctx.transform(0, 1, -1, 0, height, 0)
      break
    case 7:
      ctx.transform(0, -1, -1, 0, height, width)
      break
    case 8:
      ctx.transform(0, -1, 1, 0, 0, width)
      break
  }
}

// Check if dimensions are within browser limits
function validateCanvasDimensions(width: number, height: number): void {
  if (width > CANVAS_MAX_SIZE || height > CANVAS_MAX_SIZE) {
    throw new CompressionError(
      `Image dimensions exceed browser limits (${CANVAS_MAX_SIZE}x${CANVAS_MAX_SIZE})`,
      'SIZE_LIMIT',
    )
  }
  if (width * height > CANVAS_MAX_AREA) {
    throw new CompressionError(
      `Image area exceeds browser limits (${CANVAS_MAX_AREA} pixels)`,
      'SIZE_LIMIT',
    )
  }
}

// Main compression function with smart quality management
export async function compressImage(
  file: File,
  options: CompressionOptions = {},
): Promise<CompressionResult> {
  const startTime = performance.now()

  // Apply construction preset if specified
  const preset = options.imageType ? CONSTRUCTION_PRESETS[options.imageType] : undefined

  const {
    quality = preset?.quality || COMPRESSION_QUALITY,
    maxWidth = preset?.maxWidth || MAX_WIDTH,
    maxHeight = preset?.maxHeight || MAX_HEIGHT,
    preferWebP = preset?.preferWebP ?? isWebPSupported(),
    onProgress,
    preserveExif = false,
    minQuality = preset?.minQuality || MIN_QUALITY,
    smartCompression = true,
  } = { ...preset, ...options }

  // Validate input
  if (!file || !(file instanceof File)) {
    throw new CompressionError('Invalid file provided', 'INVALID_FILE')
  }

  if (!file.type.startsWith('image/')) {
    throw new CompressionError('File is not an image', 'INVALID_FILE')
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true, // Better performance for large images
    })

    if (!ctx) {
      reject(new CompressionError('Could not get canvas context', 'CANVAS_ERROR'))
      return
    }

    const img = new Image()
    let objectUrl: string | null = null
    let timeoutId: number | null = null

    // Cleanup function
    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrl = null
      }
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
      // Clear canvas memory
      canvas.width = canvas.height = 0
    }

    // Set timeout based on file size
    const timeoutMs = Math.min(30000, 10000 + file.size / 1000) // 10s + 1s per MB, max 30s
    timeoutId = setTimeout(() => {
      cleanup()
      reject(new CompressionError('Image compression timeout', 'TIMEOUT'))
    }, timeoutMs)

    img.onload = async () => {
      try {
        onProgress?.(10)

        // Get original dimensions
        let { width: originalWidth, height: originalHeight } = img

        // Check for EXIF orientation
        let orientation = 1
        if (preserveExif && file.type === 'image/jpeg') {
          orientation = await getExifOrientation(file)
          onProgress?.(20)
        }

        // Swap dimensions for 90/270 degree rotations
        if (orientation >= 5 && orientation <= 8) {
          ;[originalWidth, originalHeight] = [originalHeight, originalWidth]
        }

        // Calculate optimal dimensions
        const { width, height } = calculateOptimalDimensions(
          originalWidth,
          originalHeight,
          maxWidth,
          maxHeight,
          file.size,
        )

        // Validate canvas dimensions
        validateCanvasDimensions(width, height)

        // Set canvas size
        canvas.width = width
        canvas.height = height

        onProgress?.(30)

        // Apply EXIF orientation and draw image
        ctx.save()
        if (orientation > 1) {
          applyOrientation(ctx, orientation, width, height)
        }

        // Use better image smoothing for construction drawings
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Draw the image
        ctx.drawImage(img, 0, 0, originalWidth, originalHeight, 0, 0, width, height)
        ctx.restore()

        onProgress?.(50)

        // Determine output format
        let outputType = file.type || 'image/jpeg'

        // Calculate smart quality if enabled
        let finalQuality = quality
        if (smartCompression) {
          finalQuality = calculateSmartQuality(file, quality, minQuality)
        }

        // Use WebP if supported and preferred
        if (preferWebP && outputType !== 'image/png') {
          outputType = 'image/webp'
          // WebP can use slightly higher quality for same file size
          finalQuality = Math.min(finalQuality + 0.03, 0.95)
        }

        console.log(`Compressing with quality: ${finalQuality.toFixed(2)} (min: ${minQuality})`)

        onProgress?.(70)

        // Convert to blob with error handling
        canvas.toBlob(
          (blob) => {
            onProgress?.(90)

            if (!blob) {
              cleanup()
              reject(new CompressionError('Failed to create blob', 'CANVAS_ERROR'))
              return
            }

            // Determine final filename
            const extension = outputType.split('/')[1]
            const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
            const finalName = `${nameWithoutExt}.${extension}`

            const compressedFile = new File([blob], finalName, {
              type: outputType,
              lastModified: Date.now(),
            })

            const compressionRatio = compressedFile.size / file.size

            // If compression didn't help much and file is already very small, use original
            // Only skip compression for files under 500KB that don't benefit from compression
            if (compressionRatio >= MIN_COMPRESSION_RATIO && file.size < 500 * 1024) {
              cleanup()
              resolve({
                file: file,
                originalSize: file.size,
                compressedSize: file.size,
                compressionRatio: 1,
                dimensions: { width: originalWidth, height: originalHeight },
                format: file.type,
                processingTime: performance.now() - startTime,
                finalQuality: 1, // Original quality
              })
              return
            }

            onProgress?.(100)
            cleanup()

            resolve({
              file: compressedFile,
              originalSize: file.size,
              compressedSize: compressedFile.size,
              compressionRatio,
              dimensions: { width, height },
              format: outputType,
              processingTime: performance.now() - startTime,
              finalQuality,
            })
          },
          outputType,
          finalQuality,
        )
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

    // Create object URL and load image
    objectUrl = URL.createObjectURL(file)
    img.src = objectUrl
    onProgress?.(5)
  })
}

// Batch compression for multiple images
export async function compressBatch(
  files: File[],
  options: CompressionOptions = {},
  onBatchProgress?: (completed: number, total: number) => void,
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = []
  const total = files.length

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await compressImage(files[i], {
        ...options,
        onProgress: (progress) => {
          const overallProgress = (i / total) * 100 + progress / total
          options.onProgress?.(overallProgress)
        },
      })
      results.push(result)
      onBatchProgress?.(i + 1, total)
    } catch (error) {
      console.error(`Failed to compress ${files[i].name}:`, error)
      // Add original file as fallback
      results.push({
        file: files[i],
        originalSize: files[i].size,
        compressedSize: files[i].size,
        compressionRatio: 1,
        dimensions: { width: 0, height: 0 },
        format: files[i].type,
        processingTime: 0,
        finalQuality: 1,
      })
    }
  }

  return results
}

// Check if total payload size exceeds limits
export function checkTotalPayloadSize(files: File[]): {
  totalSize: number
  exceedsLimit: boolean
  compressionStrategy: 'none' | 'standard' | 'moderate' | 'aggressive'
} {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const totalSizeMB = totalSize / (1024 * 1024)

  let compressionStrategy: 'none' | 'standard' | 'moderate' | 'aggressive' = 'none'

  if (totalSizeMB <= 5) {
    compressionStrategy = 'none'
  } else if (totalSizeMB <= 10) {
    compressionStrategy = 'standard'
  } else if (totalSizeMB <= 20) {
    compressionStrategy = 'moderate'
  } else {
    compressionStrategy = 'aggressive'
  }

  return {
    totalSize,
    exceedsLimit: totalSize > MAX_TOTAL_SIZE,
    compressionStrategy,
  }
}

// Get compression options based on payload size
export function getAdaptiveCompressionOptions(
  totalSizeMB: number,
  baseOptions: CompressionOptions = {},
): CompressionOptions {
  // For small payloads, maintain high quality
  if (totalSizeMB <= 5) {
    return {
      ...baseOptions,
      quality: 0.85,
      maxWidth: 1920,
      maxHeight: 1440,
      minQuality: 0.75,
      smartCompression: true,
    }
  }

  // For medium payloads, use standard compression
  if (totalSizeMB <= 10) {
    return {
      ...baseOptions,
      quality: 0.8,
      maxWidth: 1600,
      maxHeight: 1200,
      minQuality: 0.7,
      smartCompression: true,
    }
  }

  // For large payloads, use moderate compression
  if (totalSizeMB <= 20) {
    return {
      ...baseOptions,
      quality: 0.75,
      maxWidth: 1400,
      maxHeight: 1050,
      minQuality: 0.65,
      smartCompression: true,
    }
  }

  // For very large payloads, use aggressive but not extreme compression
  return {
    ...baseOptions,
    quality: 0.7, // Never go below 70% base quality
    maxWidth: 1200,
    maxHeight: 900,
    minQuality: 0.65, // Never go below 65% minimum
    smartCompression: true,
    preferWebP: true, // Force WebP for better compression
  }
}

// DEPRECATED - Use getAdaptiveCompressionOptions instead
export function getAggressiveCompressionOptions(
  baseOptions: CompressionOptions = {},
): CompressionOptions {
  console.warn(
    'getAggressiveCompressionOptions is deprecated. Use getAdaptiveCompressionOptions instead.',
  )
  return getAdaptiveCompressionOptions(25, baseOptions)
}

// DEPRECATED - Use getAdaptiveCompressionOptions instead
export function getUltraAggressiveCompressionOptions(
  baseOptions: CompressionOptions = {},
): CompressionOptions {
  console.warn(
    'getUltraAggressiveCompressionOptions is deprecated. Use getAdaptiveCompressionOptions instead.',
  )
  return getAdaptiveCompressionOptions(30, baseOptions)
}

// Simplified helper function for common use cases
export async function compressFileIfNeeded(
  file: File | null,
  imageType?: ConstructionImageType,
): Promise<File | null> {
  if (!file || !(file instanceof File)) {
    console.warn('Invalid file provided:', file)
    return file
  }

  // Only compress images
  if (!file.type.startsWith('image/')) {
    console.log('File is not an image, skipping compression:', file.type)
    return file
  }

  // Skip compression for very small files (less than 200KB)
  if (file.size < 200 * 1024) {
    console.log('File is already small, skipping compression:', file.size)
    return file
  }

  try {
    console.log(
      `Compressing ${imageType || 'image'}:`,
      file.name,
      'Size:',
      (file.size / 1024 / 1024).toFixed(2) + 'MB',
    )

    const result = await compressImage(file, { imageType })

    console.log(
      'Compression complete:',
      `${(result.compressionRatio * 100).toFixed(1)}% of original`,
      `Quality: ${result.finalQuality.toFixed(2)}`,
      `Time: ${result.processingTime.toFixed(0)}ms`,
    )

    return result.file
  } catch (error) {
    console.error('Compression failed, using original:', error)
    return file
  }
}

// Construction-specific compression helpers
export async function compressBlueprintImage(file: File): Promise<File | null> {
  return compressFileIfNeeded(file, 'blueprint')
}

export async function compressSitePhoto(file: File): Promise<File | null> {
  return compressFileIfNeeded(file, 'sitePhoto')
}

export async function compressDocumentScan(file: File): Promise<File | null> {
  return compressFileIfNeeded(file, 'document')
}

export async function createThumbnail(file: File): Promise<File | null> {
  return compressFileIfNeeded(file, 'thumbnail')
}

// Legacy function for backward compatibility
export async function compressImageForType(
  file: File | null,
  type: 'main' | 'gallery' | 'render' = 'gallery',
): Promise<File | null> {
  if (!file || !(file instanceof File)) {
    return file
  }

  // Map legacy types to construction presets
  const imageType = type as ConstructionImageType
  return compressFileIfNeeded(file, imageType)
}

// Utility to estimate compression results
export function estimateCompressionSize(
  fileSize: number,
  fileType: string,
  imageType?: ConstructionImageType,
): number {
  const preset = imageType ? CONSTRUCTION_PRESETS[imageType] : undefined
  const quality = preset?.quality || COMPRESSION_QUALITY

  // More realistic estimates based on typical compression ratios
  const estimatedRatios: Record<string, number> = {
    'image/jpeg': 0.85 * quality,
    'image/png': 0.9 * quality,
    'image/webp': 0.75 * quality,
    'image/bmp': 0.4 * quality,
    'image/tiff': 0.5 * quality,
  }

  const ratio = estimatedRatios[fileType] || 0.8
  return Math.floor(fileSize * ratio)
}

// Export types and constants for external use
export {
  type CompressionOptions,
  type CompressionResult,
  type ConstructionImageType,
  CompressionError,
  CONSTRUCTION_PRESETS,
  isWebPSupported,
  MIN_QUALITY,
  MAX_TOTAL_SIZE,
}
