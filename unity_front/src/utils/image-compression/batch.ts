/**
 * Batch compression and utility functions
 */

import type { CompressionOptions, CompressionResult, ConstructionImageType } from './types'
import { MAX_TOTAL_SIZE } from './constants'
import { compressImage } from './index'

/**
 * Batch compression with optimized settings
 */
export async function compressBatch(
  files: File[],
  options: CompressionOptions = {},
  onBatchProgress?: (completed: number, total: number) => void
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
      quality: Math.max((adjustedOptions.quality || 0.88) - 0.03, 0.75),
      forceDimensions: false,
    }
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

/**
 * Utility function for automatic compression based on use case
 */
export async function autoCompressForUpload(
  file: File,
  targetType?: 'main' | 'gallery' | 'render' | 'blueprint' | 'document'
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

/**
 * Helper to compress all project images
 */
export async function compressProjectImages(
  mainImage: File | null,
  renderImage: File | null,
  galleryImages: File[],
  onProgress?: (message: string, progress: number) => void
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
    const results = await compressBatch(galleryImages, { imageType: 'gallery' }, (completed, total) => {
      const progress = 50 + (completed / total) * 40
      onProgress?.(`Compressing gallery image ${completed}/${total}...`, progress)
    })

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

/**
 * Utility to check if total payload exceeds limits
 */
export function checkTotalPayloadSize(files: (File | null)[]): {
  totalSize: number
  exceedsLimit: boolean
  requiresCompression: boolean
} {
  const validFiles = files.filter((f): f is File => f !== null && f instanceof File)
  const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0)

  return {
    totalSize,
    exceedsLimit: totalSize > MAX_TOTAL_SIZE,
    requiresCompression: totalSize > 5 * 1024 * 1024,
  }
}

/**
 * Utility to get compression statistics
 */
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
    { totalOriginal: 0, totalCompressed: 0, filesConverted: 0 }
  )

  return {
    ...stats,
    totalSaved: stats.totalOriginal - stats.totalCompressed,
    averageRatio: stats.totalCompressed / stats.totalOriginal,
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function compressFileIfNeeded(
  file: File | null,
  imageType?: ConstructionImageType
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

/**
 * Legacy function for backward compatibility
 */
export async function compressImageForType(
  file: File | null,
  type: 'main' | 'gallery' | 'render' = 'gallery'
): Promise<File | null> {
  if (!file || !(file instanceof File)) {
    return file
  }

  const imageType = type as ConstructionImageType
  return compressFileIfNeeded(file, imageType)
}
