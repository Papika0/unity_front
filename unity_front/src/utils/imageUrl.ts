/**
 * Utility function to get the full image URL
 * Handles both external URLs (like picsum.photos) and internal storage paths
 */
export function getImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return ''

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
