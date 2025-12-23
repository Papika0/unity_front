/**
 * Constants and presets for image compression
 */

// Browser limits (used in dimension validation)
export const CANVAS_MAX_SIZE = 16384
export const CANVAS_MAX_AREA = 268435456

// Balanced compression settings for professional quality
export const COMPRESSION_QUALITY = 0.92
export const MAX_WIDTH = 2400
export const MAX_HEIGHT = 1800
export const MAX_TOTAL_SIZE = 25 * 1024 * 1024 // 25MB total payload limit
export const MIN_QUALITY = 0.75 // Never go below 75% for professional use

/**
 * Professional presets for construction use cases
 */
export const CONSTRUCTION_PRESETS = {
  /** Very high quality for technical details */
  blueprint: {
    quality: 0.95,
    maxWidth: 3000,
    maxHeight: 2400,
    preferWebP: false,
    minQuality: 0.85,
    convertPngToJpeg: false,
  },
  /** High quality for portfolio */
  sitePhoto: {
    quality: 0.9,
    maxWidth: 2400,
    maxHeight: 1800,
    preferWebP: true,
    minQuality: 0.8,
    convertPngToJpeg: true,
  },
  /** Good quality even for thumbnails */
  thumbnail: {
    quality: 0.85,
    maxWidth: 800,
    maxHeight: 600,
    preferWebP: true,
    minQuality: 0.75,
    convertPngToJpeg: true,
  },
  /** High quality for readability */
  document: {
    quality: 0.92,
    maxWidth: 2000,
    maxHeight: 2000,
    preferWebP: false,
    minQuality: 0.85,
    convertPngToJpeg: false,
  },
  /** High quality for gallery showcase */
  gallery: {
    quality: 0.88,
    maxWidth: 2000,
    maxHeight: 1500,
    preferWebP: true,
    minQuality: 0.78,
    convertPngToJpeg: true,
  },
  /** Hero images need excellent quality */
  main: {
    quality: 0.9,
    maxWidth: 2400,
    maxHeight: 1800,
    preferWebP: true,
    minQuality: 0.8,
    convertPngToJpeg: true,
  },
  /** Even higher quality for architectural renders */
  render: {
    quality: 0.95,
    maxWidth: 2400,
    maxHeight: 1800,
    preferWebP: true,
    minQuality: 0.85,
    convertPngToJpeg: false,
  },
} as const
