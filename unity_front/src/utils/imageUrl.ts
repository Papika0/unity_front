import type { ImageData } from '@/types'

/**
 * Utility function to get the full image URL
 * Handles both external URLs (like picsum.photos) and internal storage paths
 * Also supports ImageData objects from the new API structure
 */
export function getImageUrl(
  imageInput: string | ImageData | null | undefined,
): string {
  if (!imageInput) return ''

  // Handle ImageData object (new structure)
  if (typeof imageInput === 'object' && 'url' in imageInput) {
    const imagePath = imageInput.url
    if (!imagePath) return ''

    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath
    }

    // Get backend URL from environment
    const backendUrl = import.meta.env.VITE_BACKEND_URL

    if (!backendUrl) {
      if (import.meta.env.DEV) {
        console.warn('VITE_BACKEND_URL not defined in environment variables')
      }
      return `https://via.placeholder.com/1920x1080/1a1a1a/666666?text=${encodeURIComponent('Configure VITE_BACKEND_URL')}`
    }

    // For relative paths from storage, prepend backend URL
    const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`

    return `${baseUrl}${path}`
  }

  // Handle string path (legacy structure)
  const imagePath = imageInput as string

  // If it's already a full URL (from external sources), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // Get backend URL from environment
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  // If backendUrl is not defined, use a placeholder for development
  if (!backendUrl) {
    if (import.meta.env.DEV) {
      console.warn('VITE_BACKEND_URL not defined in environment variables')
    }
    return `https://via.placeholder.com/1920x1080/1a1a1a/666666?text=${encodeURIComponent('Configure VITE_BACKEND_URL')}`
  }

  // For relative paths from storage, prepend backend URL
  // Ensure no double slashes
  const baseUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`

  return `${baseUrl}${path}`
}

/**
 * Preload an image to improve UX
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
}

/**
 * Preload multiple images
 */
export async function preloadImages(urls: string[]): Promise<void> {
  await Promise.all(urls.map((url) => preloadImage(url)))
}
