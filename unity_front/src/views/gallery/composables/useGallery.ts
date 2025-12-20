/**
 * useGallery - Composable for gallery page logic
 * Handles category filtering, lightbox, and scroll animations
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useTranslations } from '@/composables/useTranslations'
import { useGalleryPage } from '@/composables/useGalleryPage'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

export function useGallery() {
  // ============================================
  // COMPOSABLES
  // ============================================
  const { t } = useTranslations()
  const {
    galleryImages,
    categories,
    isLoading,
    isLoadingMore,
    hasMorePages,
    error,
    loadGalleryPage,
    loadMore,
    getCategoryLabel,
  } = useGalleryPage()

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================
  const { element: heroElement, isVisible: heroVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
  const { element: filtersElement, isVisible: filtersVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
  const { element: galleryGridElement, isVisible: galleryGridVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })

  // ============================================
  // STATE
  // ============================================
  const selectedCategory = ref('all')
  const selectedImage = ref<number | null>(null)
  const scrollProgress = ref(0)
  const isTransitioning = ref(false)

  // ============================================
  // COMPUTED
  // ============================================
  const filteredGallery = computed(() => galleryImages.value)

  const getSelectedImageData = computed(() => {
    if (selectedImage.value === null) return null
    return galleryImages.value.find((item) => item.id === selectedImage.value)
  })

  // ============================================
  // HANDLERS
  // ============================================
  const handleScroll = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    scrollProgress.value = (scrollTop / docHeight) * 100
  }

  const selectCategory = async (categoryValue: string) => {
    selectedCategory.value = categoryValue
    
    // Start transition
    isTransitioning.value = true
    
    // Wait for fade-out animation
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Fetch images for the selected category from API
    await loadGalleryPage(categoryValue)
    
    // Wait a bit then fade back in
    await new Promise(resolve => setTimeout(resolve, 50))
    isTransitioning.value = false
  }

  const openLightbox = (id: number) => {
    selectedImage.value = id
  }

  const closeLightbox = () => {
    selectedImage.value = null
  }

  const nextImage = () => {
    if (selectedImage.value === null) return
    const currentIndex = filteredGallery.value.findIndex((item) => item.id === selectedImage.value)
    const nextIndex = (currentIndex + 1) % filteredGallery.value.length
    selectedImage.value = filteredGallery.value[nextIndex].id
  }

  const prevImage = () => {
    if (selectedImage.value === null) return
    const currentIndex = filteredGallery.value.findIndex((item) => item.id === selectedImage.value)
    const prevIndex = currentIndex === 0 ? filteredGallery.value.length - 1 : currentIndex - 1
    selectedImage.value = filteredGallery.value[prevIndex].id
  }

  const handleLoadMore = () => {
    loadMore(selectedCategory.value === 'all' ? undefined : selectedCategory.value)
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(async () => {
    await loadGalleryPage()
    window.addEventListener('scroll', handleScroll)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // Translations
    t,

    // Gallery data
    galleryImages,
    categories,
    isLoading,
    isLoadingMore,
    hasMorePages,
    error,
    loadGalleryPage,
    getCategoryLabel,

    // Scroll animations
    heroElement,
    heroVisible,
    filtersElement,
    filtersVisible,
    galleryGridElement,
    galleryGridVisible,

    // State
    selectedCategory,
    selectedImage,
    scrollProgress,
    isTransitioning,
    filteredGallery,
    getSelectedImageData,

    // Handlers
    selectCategory,
    openLightbox,
    closeLightbox,
    nextImage,
    prevImage,
    handleLoadMore,
  }
}
