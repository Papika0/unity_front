import { ref, computed } from 'vue'
import { useTranslationsStore } from '@/stores/ui/translations'
import { getGalleryPage, type GalleryPageResponse } from '@/services/galleryPage'
import type { GalleryImage } from '@/services/galleryApi'

export function useGalleryPage() {
  const galleryImages = ref<GalleryImage[]>([])
  const rawCategories = ref<string[]>([])
  const translations = ref<Record<string, string>>({})
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const hasMorePages = ref(true)
  const translationStore = useTranslationsStore()

  // Computed categories that react to translation changes
  const categories = computed(() => {
    return [
      { value: 'all', label: translationStore.t('gallery.categories.all') || 'ყველა' },
      ...rawCategories.value
        .filter((cat) => cat !== 'news' && cat !== 'about')
        .map((cat) => ({
          value: cat,
          label: getCategoryLabel(cat),
        })),
    ]
  })

  const loadGalleryPage = async (category?: string, page: number = 1, append: boolean = false) => {
    if (append) {
      isLoadingMore.value = true
    } else {
      isLoading.value = true
      currentPage.value = 1
      hasMorePages.value = true
    }
    error.value = null

    try {
      // Get missing groups for gallery page
      const missingGroups = translationStore.getMissingGroups('gallery')

      // Get locale from translation store


      // Load gallery page data with translations
      const response = await getGalleryPage({
        groups: missingGroups,
        category: category && category !== 'all' ? category : undefined,
        page: page,
        limit: 12, // 12 photos per page
      })

      const data: GalleryPageResponse = response.data

      // Set gallery images
      if (append) {
        galleryImages.value = [...galleryImages.value, ...data.gallery_images]
      } else {
        galleryImages.value = data.gallery_images
      }

      // Update pagination info
      currentPage.value = page
      // Use server-provided pagination info
      hasMorePages.value = data.meta.has_more_pages

      // Set raw categories (only on first load)
      if (!append) {
        rawCategories.value = data.categories
      }

      // Merge translations into the store
      if (data.translations) {
        translationStore.mergeTranslations(data.translations)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load gallery page'
      console.error('Failed to load gallery page:', err)
    } finally {
      // Add minimum loading time for better UX (as it was previously)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      isLoading.value = false
      isLoadingMore.value = false
    }
  }

  const getCategoryLabel = (category: string): string => {
    // Use translations if available, otherwise fallback to hardcoded labels
    const translationKey = `gallery.categories.${category}`
    const translation = translationStore.t(translationKey)

    if (translation !== translationKey) {
      return translation
    }

    // Fallback labels
    const labels: Record<string, string> = {
      exterior: 'ფასადები',
      interior: 'ინტერიერი',
      landscape: 'ლანდშაფტი',
      commercial: 'კომერციული',
      residential: 'საცხოვრებელი',
      about: 'ჩვენ შესახებ',
      projects: 'პროექტები',
      news: 'სიახლეები',
    }
    return labels[category] || category
  }

  const loadMore = async (category?: string) => {
    const nextPage = currentPage.value + 1
    await loadGalleryPage(category, nextPage, true)
  }

  return {
    galleryImages,
    categories,
    translations,
    isLoading,
    isLoadingMore,
    hasMorePages,
    currentPage,
    error,
    loadGalleryPage,
    loadMore,
    getCategoryLabel,
  }
}
