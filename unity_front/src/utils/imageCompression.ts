// Compression settings
const COMPRESSION_QUALITY = 0.8 // 80% quality
const MAX_WIDTH = 1920
const MAX_HEIGHT = 1080

interface CompressionOptions {
  quality?: number
  maxWidth?: number
  maxHeight?: number
}

// File compression utility
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

            // Clean up the object URL
            URL.revokeObjectURL(img.src)
            resolve(compressedFile)
          },
          file.type || 'image/jpeg',
          quality,
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

  // Skip compression for small files (less than 500KB)
  if (file.size < 500 * 1024) {
    console.log('File is small, skipping compression:', file.size)
    return file
  }

  try {
    console.log('Compressing file:', file.name, 'Size:', file.size)
    const compressed = await compressImage(file)
    console.log('Compression successful. New size:', compressed.size)
    return compressed
  } catch (error) {
    console.warn('Compression failed, using original file:', error)
    return file
  }
}

export { type CompressionOptions }
