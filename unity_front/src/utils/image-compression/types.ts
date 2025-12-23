/**
 * Type definitions for image compression module
 */

import type { CONSTRUCTION_PRESETS } from './constants'

export type ConstructionImageType = keyof typeof CONSTRUCTION_PRESETS

export interface CompressionOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
  preferWebP?: boolean
  onProgress?: (progress: number) => void
  imageType?: ConstructionImageType
  minQuality?: number
  smartCompression?: boolean
  /** New option for PNG conversion */
  convertPngToJpeg?: boolean
  /** Force dimension reduction even for small files */
  forceDimensions?: boolean
}

export interface CompressionResult {
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
  dimensions: { width: number; height: number }
  format: string
  processingTime: number
  finalQuality: number
  /** Track if format was changed */
  wasConverted: boolean
}

/**
 * Custom error class for compression errors
 */
export class CompressionError extends Error {
  constructor(
    message: string,
    public code: 'TIMEOUT' | 'INVALID_FILE' | 'CANVAS_ERROR' | 'SIZE_LIMIT' | 'UNKNOWN'
  ) {
    super(message)
    this.name = 'CompressionError'
  }
}
