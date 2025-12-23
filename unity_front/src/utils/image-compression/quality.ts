/**
 * Quality calculation and dimension optimization functions
 */

/**
 * Enhanced smart quality calculation
 */
export function calculateSmartQuality(
  file: File,
  baseQuality: number,
  minQuality: number,
  dimensions: { width: number; height: number }
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

/**
 * Enhanced dimension calculation with better scaling
 */
export function calculateOptimalDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number,
  fileSize: number,
  forceDimensions: boolean = false
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
