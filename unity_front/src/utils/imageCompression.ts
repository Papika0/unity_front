// Compression settings - optimized for web performance
const COMPRESSION_QUALITY = 0.75 // 75% quality - good balance
const MAX_WIDTH = 1600 // Reduced from 1920 for better performance
const MAX_HEIGHT = 1200 // Reduced from 1080 for better performance
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB target size

interface CompressionOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
}

// File compression utility with adaptive quality
export function compressImage(
  file: File,
  quality: number = COMPRESSION_QUALITY,
  maxWidth: number = MAX_WIDTH,
  maxHeight: number = MAX_HEIGHT,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }

    img.onload = () => {
      try {
        // Calculate new dimensions
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height)

        // Adaptive quality based on original file size
        let adaptiveQuality = quality
        if (file.size > 5 * 1024 * 1024) {
          // > 5MB
          adaptiveQuality = 0.6 // More aggressive compression
        } else if (file.size > 2 * 1024 * 1024) {
          // > 2MB
          adaptiveQuality = 0.7
        }

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob failed'))
              return
            }

            const compressedFile = new File([blob], file.name, {
              type: file.type || 'image/jpeg',
              lastModified: Date.now(),
            })

            // If still too large, try with even lower quality
            if (compressedFile.size > MAX_FILE_SIZE && adaptiveQuality > 0.5) {
              URL.revokeObjectURL(img.src)
              // Recursively compress with lower quality
              compressImage(file, adaptiveQuality - 0.1, maxWidth, maxHeight)
                .then(resolve)
                .catch(reject)
              return
            }

            // Clean up the object URL
            URL.revokeObjectURL(img.src)
            resolve(compressedFile)
          },
          file.type || 'image/jpeg',
          adaptiveQuality,
        )
      } catch (error) {
        URL.revokeObjectURL(img.src)
        reject(error)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Failed to load image'))
    }

    img.src = URL.createObjectURL(file)
  })
}

export async function compressFileIfNeeded(file: File | null): Promise<File | null> {
  if (!file || !(file instanceof File)) {
    console.warn('Invalid file provided to compressFileIfNeeded:', file)
    return file
  }

  // Only compress images
  if (!file.type.startsWith('image/')) {
    console.log('File is not an image, skipping compression:', file.type)
    return file
  }

  // Skip compression for very small files (less than 200KB)
  if (file.size < 200 * 1024) {
    console.log('File is very small, skipping compression:', file.size)
    return file
  }

  try {
    console.log(
      'Compressing file:',
      file.name,
      'Original size:',
      (file.size / 1024 / 1024).toFixed(2) + 'MB',
    )

    const compressed = await compressImage(file)
    const compressionRatio = (((file.size - compressed.size) / file.size) * 100).toFixed(1)

    console.log(
      'Compression successful. New size:',
      (compressed.size / 1024 / 1024).toFixed(2) + 'MB',
      `(${compressionRatio}% reduction)`,
    )

    return compressed
  } catch (error) {
    console.warn('Compression failed, using original file:', error)
    return file
  }
}

// Specialized compression for different image types
export async function compressImageForType(
  file: File | null,
  type: 'main' | 'gallery' | 'render' = 'gallery',
): Promise<File | null> {
  if (!file || !(file instanceof File)) {
    return file
  }

  // Only compress images
  if (!file.type.startsWith('image/')) {
    return file
  }

  // Skip compression for very small files
  if (file.size < 200 * 1024) {
    return file
  }

  try {
    let quality = COMPRESSION_QUALITY
    let maxWidth = MAX_WIDTH
    let maxHeight = MAX_HEIGHT

    // Different settings based on image type
    switch (type) {
      case 'main':
        // Main images can be larger for better quality
        quality = 0.8
        maxWidth = 1920
        maxHeight = 1440
        break
      case 'render':
        // Render images need good quality
        quality = 0.8
        maxWidth = 1920
        maxHeight = 1440
        break
      case 'gallery':
      default:
        // Gallery images can be more compressed for performance
        quality = 0.7
        maxWidth = 1600
        maxHeight = 1200
        break
    }

    console.log(
      `Compressing ${type} image:`,
      file.name,
      'Original size:',
      (file.size / 1024 / 1024).toFixed(2) + 'MB',
    )

    const compressed = await compressImage(file, quality, maxWidth, maxHeight)
    const compressionRatio = (((file.size - compressed.size) / file.size) * 100).toFixed(1)

    console.log(
      `${type} compression successful. New size:`,
      (compressed.size / 1024 / 1024).toFixed(2) + 'MB',
      `(${compressionRatio}% reduction)`,
    )

    return compressed
  } catch (error) {
    console.warn(`${type} compression failed, using original file:`, error)
    return file
  }
}

export { type CompressionOptions }
