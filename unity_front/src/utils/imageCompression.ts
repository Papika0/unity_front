// Enhanced Image Compression for Construction Company
// Optimized for better compression while maintaining professional quality

// Browser limits (used in dimension validation)
const CANVAS_MAX_SIZE = 16384
const CANVAS_MAX_AREA = 268435456

// Balanced compression settings for professional quality
const COMPRESSION_QUALITY = 0.92 // High base quality for professional appearance
const MAX_WIDTH = 2400 // Higher resolution for quality
const MAX_HEIGHT = 1800 // Higher resolution for quality
// const MIN_COMPRESSION_RATIO = 0.95 // Less aggressive, prioritize quality (now using dynamic ratio)
const MAX_TOTAL_SIZE = 25 * 1024 * 1024 // 25MB total payload limit
const MIN_QUALITY = 0.75 // Never go below 75% for professional use

// Professional presets for construction use cases
const CONSTRUCTION_PRESETS = {
  blueprint: {
    quality: 0.95, // Very high for technical details
    maxWidth: 3000, // High res for blueprints
    maxHeight: 2400,
    preferWebP: false, // Keep original format for technical drawings
    minQuality: 0.85,
    convertPngToJpeg: false, // Keep PNG for technical drawings
  },
  sitePhoto: {
    quality: 0.9, // High quality for portfolio
    maxWidth: 2400,
    maxHeight: 1800,
    preferWebP: true,
    minQuality: 0.8,
    convertPngToJpeg: true, // Photos don't need transparency
  },
  thumbnail: {
    quality: 0.85, // Good quality even for thumbnails
    maxWidth: 800, // Larger thumbnails
    maxHeight: 600,
    preferWebP: true,
    minQuality: 0.75,
    convertPngToJpeg: true,
  },
  document: {
    quality: 0.92, // High quality for readability
    maxWidth: 2000,
    maxHeight: 2000,
    preferWebP: false, // Keep original format
    minQuality: 0.85,
    convertPngToJpeg: false,
  },
  gallery: {
    quality: 0.88, // High quality for gallery showcase
    maxWidth: 2000,
    maxHeight: 1500,
    preferWebP: true,
    minQuality: 0.78,
    convertPngToJpeg: true,
  },
  main: {
    quality: 0.9, // Hero images need excellent quality
    maxWidth: 2400,
    maxHeight: 1800,
    preferWebP: true,
    minQuality: 0.8,
    convertPngToJpeg: true,
  },
  render: {
    quality: 0.95, // Even higher quality for architectural renders
    maxWidth: 2400,
    maxHeight: 1800,
    preferWebP: true, // Use WebP only when necessary
    minQuality: 0.85, // Higher minimum quality for renders
    convertPngToJpeg: false, // Keep original format for renders
  },
} as const

type ConstructionImageType = keyof typeof CONSTRUCTION_PRESETS

interface CompressionOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  preferWebP?: boolean
  onProgress?: (progress: number) => void
  imageType?: ConstructionImageType
  minQuality?: number
  smartCompression?: boolean
  convertPngToJpeg?: boolean // New option for PNG conversion
  forceDimensions?: boolean // Force dimension reduction even for small files
}

interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  dimensions: { width: number; height: number }
  format: string
  processingTime: number
  finalQuality: number
  wasConverted: boolean // Track if format was changed
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

// Validate canvas dimensions against browser limits
function validateCanvasDimensions(width: number, height: number): void {
  if (width > CANVAS_MAX_SIZE || height > CANVAS_MAX_SIZE) {
    throw new CompressionError(
      `Image dimensions (${width}x${height}) exceed browser limits (${CANVAS_MAX_SIZE}x${CANVAS_MAX_SIZE})`,
      'SIZE_LIMIT',
    )
  }
  if (width * height > CANVAS_MAX_AREA) {
    throw new CompressionError(
      `Image area (${width * height} pixels) exceeds browser limits (${CANVAS_MAX_AREA} pixels)`,
      'SIZE_LIMIT',
    )
  }
}

// Check WebP support
function isWebPSupported(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  return canvas.toDataURL('image/webp').indexOf('image/webp') === 0
}

// Check if PNG has transparency
async function hasTransparency(file: File): Promise<boolean> {
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

// Enhanced smart quality calculation
function calculateSmartQuality(
  file: File,
  baseQuality: number,
  minQuality: number,
  dimensions: { width: number; height: number },
): number {
  const fileSizeMB = file.size / (1024 * 1024)
  const pixelCount = dimensions.width * dimensions.height
  const megapixels = pixelCount / 1000000

  let quality = baseQuality

  // Even gentler quality reduction based on file size
  if (fileSizeMB > 15) {
    quality -= 0.02 // Only 2% reduction for very large files
  }
  if (fileSizeMB > 25) {
    quality -= 0.02 // Additional 2% for extremely large files
  }

  // Minimal adjustment based on resolution
  if (megapixels > 5) {
    quality -= 0.02 // Only reduce for very high resolution
  }
  if (megapixels > 8) {
    quality -= 0.01
  }

  // PNG to JPEG conversion gets minimal quality reduction
  if (file.type === 'image/png' && fileSizeMB > 3) {
    quality -= 0.02 // Only 2% reduction for PNG conversion
  }

  return Math.max(quality, minQuality)
}

// Enhanced dimension calculation with better scaling
function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  fileSize: number,
  forceDimensions: boolean = false,
): { width: number; height: number; scaled: boolean } {
  let width = originalWidth
  let height = originalHeight
  let scaled = false

  // Calculate scale factor
  const scaleFactorWidth = maxWidth / originalWidth
  const scaleFactorHeight = maxHeight / originalHeight
  let scaleFactor = Math.min(scaleFactorWidth, scaleFactorHeight, 1)

  // Only scale down if really necessary
  const fileSizeMB = fileSize / (1024 * 1024)

  // Much less aggressive scaling - preserve image quality
  if (fileSizeMB > 15 || forceDimensions) {
    // For very large files, use the natural scale factor if image exceeds max dimensions
    // Otherwise don't force scaling
    if (originalWidth > maxWidth || originalHeight > maxHeight) {
      // Image exceeds max dimensions, scale to fit
      scaleFactor = Math.min(scaleFactorWidth, scaleFactorHeight)
      // But never scale below 60% to preserve quality
      scaleFactor = Math.max(scaleFactor, 0.6)
    } else {
      // Image is within max dimensions, minimal scaling only
      scaleFactor = Math.min(scaleFactor, 0.95)
    }
    scaled = scaleFactor < 1
  } else if (fileSizeMB > 10) {
    // For moderately large files, no forced scaling
    scaled = scaleFactor < 1
  }

  // For extremely large files, apply very gentle reduction
  if (fileSizeMB > 30 && scaleFactor > 0.8) {
    scaleFactor *= 0.95 // Only 5% additional reduction for huge files
    scaled = true
  }

  width = Math.floor(originalWidth * scaleFactor)
  height = Math.floor(originalHeight * scaleFactor)

  return { width, height, scaled }
}

// Main compression function with enhanced features
export async function compressImage(
  file: File,
  options: CompressionOptions = {},
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
    // Less than 50KB
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
          forceDimensions,
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

        // Use WebP when beneficial - but be more selective for quality
        if (preferWebP) {
          // Only force WebP for files that really need it (over PHP limit) or already non-PNG
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
          finalQuality = Math.min(finalQuality + 0.05, 0.95) // WebP handles quality better
        } else if (wasConverted && outputType === 'image/jpeg') {
          finalQuality = Math.max(finalQuality - 0.03, minQuality) // Slightly lower for PNG->JPEG
        }


        onProgress?.(70)

        // Try multiple quality levels if needed
        let blob: Blob | null = null
        let attempts = 0
        let currentQuality = finalQuality

        while (attempts < 3) {
          blob = await new Promise<Blob | null>((resolveBlob) => {
            canvas.toBlob(
              (b: Blob | null) => {
                resolveBlob(b)
              },
              outputType,
              currentQuality,
            )
          })

          if (blob && blob.size < file.size * 0.9) {
            break // Good compression achieved
          }

          // Try lower quality
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
        const phpUploadLimit = 2 * 1024 * 1024 // 2MB
        const forceCompression = file.size > phpUploadLimit

        // Only use compressed version if it's actually smaller OR if we need to meet upload limits
        // But be more lenient with the compression ratio for better quality
        if (
          blob.size >= file.size * 0.85 && // More lenient than MIN_COMPRESSION_RATIO
          !scaled &&
          !wasConverted &&
          !forceCompression
        ) {
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
          // Try multiple approaches to get under the limit
          let attempts = 0
          const maxAttempts = 3
          let testQuality = Math.max(currentQuality - 0.1, minQuality)

          while (
            blob.size > phpUploadLimit &&
            attempts < maxAttempts &&
            testQuality >= minQuality
          ) {
            const testBlob = await new Promise<Blob | null>((resolveBlob) => {
              canvas.toBlob(
                (b: Blob | null) => {
                  resolveBlob(b)
                },
                outputType,
                testQuality,
              )
            })

            if (testBlob && testBlob.size < blob.size) {
              blob = testBlob
              currentQuality = testQuality
            }

            testQuality = Math.max(testQuality - 0.05, minQuality)
            attempts++
          }

          // If still too large, try with even smaller dimensions
          if (blob.size > phpUploadLimit) {
            console.log(`Still too large, trying smaller dimensions`)

            const smallerWidth = Math.floor(width * 0.8)
            const smallerHeight = Math.floor(height * 0.8)

            canvas.width = smallerWidth
            canvas.height = smallerHeight
            ctx.drawImage(img, 0, 0, smallerWidth, smallerHeight)

            const smallerBlob = await new Promise<Blob | null>((resolveBlob) => {
              canvas.toBlob(
                (b: Blob | null) => {
                  resolveBlob(b)
                },
                outputType,
                minQuality,
              )
            })

            if (smallerBlob && smallerBlob.size < blob.size) {
              blob = smallerBlob
              currentQuality = minQuality
              console.log(`Smaller dimensions helped: ${(blob.size / 1024 / 1024).toFixed(1)}MB`)
            }
          }
        }

        // Final check - ensure we have a valid blob
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

        console.log(
          `Result: ${(result.compressedSize / 1024 / 1024).toFixed(1)}MB`,
          `(${(result.compressionRatio * 100).toFixed(0)}% of original)`,
        )

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

// Batch compression with optimized settings
export async function compressBatch(
  files: File[],
  options: CompressionOptions = {},
  onBatchProgress?: (completed: number, total: number) => void,
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = []
  const total = files.length

  // Check total payload and adjust compression accordingly
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const totalSizeMB = totalSize / (1024 * 1024)

  // Much gentler auto-adjustment for large payloads
  let adjustedOptions = { ...options }
  if (totalSizeMB > 20) {
    adjustedOptions = {
      ...adjustedOptions,
      quality: Math.max((adjustedOptions.quality || 0.88) - 0.03, 0.75), // Very gentle reduction
      forceDimensions: false, // Don't force dimension reduction
    }
    console.log(
      `Large payload detected (${totalSizeMB.toFixed(1)}MB), using slightly adjusted compression`,
    )
  }

  for (let i = 0; i < files.length; i++) {
    try {
      const result = await compressImage(files[i], {
        ...adjustedOptions,
        onProgress: (progress) => {
          const overallProgress = (i / total) * 100 + progress / total
          options.onProgress?.(overallProgress)
        },
      })
      results.push(result)
      onBatchProgress?.(i + 1, total)
    } catch (error) {
      console.error(`Failed to compress ${files[i].name}:`, error)
      // Add original as fallback
      results.push({
        file: files[i],
        originalSize: files[i].size,
        compressedSize: files[i].size,
        compressionRatio: 1,
        dimensions: { width: 0, height: 0 },
        format: files[i].type,
        processingTime: 0,
        finalQuality: 1,
        wasConverted: false,
      })
    }
  }

  return results
}

// Utility function for automatic compression based on use case
export async function autoCompressForUpload(
  file: File,
  targetType?: 'main' | 'gallery' | 'render' | 'blueprint' | 'document',
): Promise<File> {
  // Skip non-images
  if (!file.type.startsWith('image/')) {
    return file
  }

  // Determine image type based on filename and target
  let imageType: ConstructionImageType = 'gallery'

  if (targetType === 'main') {
    imageType = 'main'
  } else if (targetType === 'render' || file.name.toLowerCase().includes('render')) {
    imageType = 'render'
  } else if (
    targetType === 'blueprint' ||
    file.name.toLowerCase().includes('blueprint') ||
    file.name.toLowerCase().includes('plan')
  ) {
    imageType = 'blueprint'
  } else if (
    targetType === 'document' ||
    file.name.toLowerCase().includes('document') ||
    file.name.toLowerCase().includes('pdf')
  ) {
    imageType = 'document'
  } else if (
    file.name.toLowerCase().includes('site') ||
    file.name.toLowerCase().includes('photo')
  ) {
    imageType = 'sitePhoto'
  }

  try {
    const result = await compressImage(file, { imageType })
    return result.file
  } catch (error) {
    console.error('Auto-compression failed, using original:', error)
    return file
  }
}

// Helper to compress all project images
export async function compressProjectImages(
  mainImage: File | null,
  renderImage: File | null,
  galleryImages: File[],
  onProgress?: (message: string, progress: number) => void,
): Promise<{
  mainImage: File | null
  renderImage: File | null
  galleryImages: File[]
  totalSaved: number
}> {
  let totalOriginal = 0
  let totalCompressed = 0

  // Compress main image
  if (mainImage) {
    onProgress?.('Compressing main image...', 10)
    const result = await compressImage(mainImage, { imageType: 'main' })
    totalOriginal += result.originalSize
    totalCompressed += result.compressedSize
    mainImage = result.file
  }

  // Compress render image
  if (renderImage) {
    onProgress?.('Compressing render image...', 30)
    const result = await compressImage(renderImage, { imageType: 'render' })
    totalOriginal += result.originalSize
    totalCompressed += result.compressedSize
    renderImage = result.file
  }

  // Compress gallery images
  if (galleryImages.length > 0) {
    onProgress?.('Compressing gallery images...', 50)
    const results = await compressBatch(
      galleryImages,
      { imageType: 'gallery' },
      (completed, total) => {
        const progress = 50 + (completed / total) * 40
        onProgress?.(`Compressing gallery image ${completed}/${total}...`, progress)
      },
    )

    galleryImages = results.map((r) => {
      totalOriginal += r.originalSize
      totalCompressed += r.compressedSize
      return r.file
    })
  }

  onProgress?.('Compression complete!', 100)

  return {
    mainImage,
    renderImage,
    galleryImages,
    totalSaved: totalOriginal - totalCompressed,
  }
}

// Utility to check if total payload exceeds limits
export function checkTotalPayloadSize(files: (File | null)[]): {
  totalSize: number
  exceedsLimit: boolean
  requiresCompression: boolean
} {
  // Filter out null values and ensure we have File objects
  const validFiles = files.filter((f): f is File => f !== null && f instanceof File)
  const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0)

  return {
    totalSize,
    exceedsLimit: totalSize > MAX_TOTAL_SIZE,
    requiresCompression: totalSize > 5 * 1024 * 1024, // Compress if > 5MB
  }
}

// Utility to get compression statistics
export function getCompressionStats(results: CompressionResult[]): {
  totalOriginal: number
  totalCompressed: number
  totalSaved: number
  averageRatio: number
  filesConverted: number
} {
  const stats = results.reduce(
    (acc, result) => ({
      totalOriginal: acc.totalOriginal + result.originalSize,
      totalCompressed: acc.totalCompressed + result.compressedSize,
      filesConverted: acc.filesConverted + (result.wasConverted ? 1 : 0),
    }),
    { totalOriginal: 0, totalCompressed: 0, filesConverted: 0 },
  )

  return {
    ...stats,
    totalSaved: stats.totalOriginal - stats.totalCompressed,
    averageRatio: stats.totalCompressed / stats.totalOriginal,
  }
}

// Legacy function for backward compatibility
export async function compressFileIfNeeded(
  file: File | null,
  imageType?: ConstructionImageType,
): Promise<File | null> {
  if (!file || !(file instanceof File)) {
    return file
  }

  // Skip non-images
  if (!file.type.startsWith('image/')) {
    return file
  }

  try {
    const result = await compressImage(file, { imageType })
    return result.file
  } catch (error) {
    console.error('Compression failed, using original:', error)
    return file
  }
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

export {
  type CompressionOptions,
  type CompressionResult,
  type ConstructionImageType,
  CompressionError,
  CONSTRUCTION_PRESETS,
  isWebPSupported,
  MAX_TOTAL_SIZE,
}
