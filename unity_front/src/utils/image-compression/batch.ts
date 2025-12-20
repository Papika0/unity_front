/**
 * Core batch compression functions
 */

import type { CompressionOptions, CompressionResult } from './types'
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
