/**
 * Batch compression helper functions and utilities
 */

import type { ConstructionImageType } from './types'
import { compressImage } from './index'
import { compressBatch } from './batch'

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
