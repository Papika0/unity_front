/**
 * useNewsDetail - Composable for news detail page logic
 * Handles article loading, gallery, scroll animations, and related articles
 */

import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTranslations } from '@/composables/useTranslations'
import { useNewsStore } from '@/stores/public/news'
import { useLocaleStore } from '@/stores/ui/locale'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

export function useNewsDetail() {
  // ============================================
  // STORES & ROUTER
  // ============================================
  const route = useRoute()
  const router = useRouter()
  const { t } = useTranslations()
  const newsStore = useNewsStore()
  const localeStore = useLocaleStore()

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================
  const { element: breadcrumbElement, isVisible: breadcrumbVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })
  const { element: headerElement, isVisible: headerVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })
  const { element: mainImageElement, isVisible: mainImageVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })
  const { element: contentElement, isVisible: contentVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })
  const { element: galleryElement, isVisible: galleryVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })
  const { element: relatedElement, isVisible: relatedVisible } = useScrollAnimation({ once: true, threshold: 0.05, rootMargin: '200px' })

  // ============================================
  // STATE
  // ============================================
  const error = ref<string | null>(null)
  const showGalleryModal = ref(false)
  const currentGalleryIndex = ref(0)
  const scrollProgress = ref(0)

  // ============================================
  // COMPUTED
  // ============================================
  const article = computed(() => newsStore.currentArticle)
  const isLoading = computed(() => newsStore.loading)

  const relatedArticles = computed(() => {
    return article.value?.related_articles || []
  })

  const formattedDate = computed(() => {
    if (!article.value) return ''

    const date = new Date(article.value.publish_date)
    const localeMap: Record<string, string> = {
      ka: 'ka-GE',
      en: 'en-US',
      ru: 'ru-RU',
    }
    const locale = localeMap[localeStore.currentLocale] || 'ka-GE'

    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  })

  const categoryLabels = computed(() => ({
    all: t('news.categories.all'),
    company: t('news.categories.company'),
    project: t('news.categories.project'),
    industry: t('news.categories.industry'),
    event: t('news.categories.event'),
  }))

  // ============================================
  // SCROLL HANDLING
  // ============================================
  const handleScroll = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    scrollProgress.value = (scrollTop / docHeight) * 100
  }

  // ============================================
  // GALLERY ACTIONS
  // ============================================
  const openGallery = (index: number) => {
    currentGalleryIndex.value = index
    showGalleryModal.value = true
  }

  const closeGallery = () => {
    showGalleryModal.value = false
  }

  const nextImage = () => {
    if (!article.value?.gallery_images) return
    currentGalleryIndex.value = (currentGalleryIndex.value + 1) % article.value.gallery_images.length
  }

  const prevImage = () => {
    if (!article.value?.gallery_images) return
    currentGalleryIndex.value =
      (currentGalleryIndex.value - 1 + article.value.gallery_images.length) %
      article.value.gallery_images.length
  }

  const handleKeydown = (e: KeyboardEvent) => {
    if (!showGalleryModal.value) return

    switch (e.key) {
      case 'Escape':
        closeGallery()
        break
      case 'ArrowRight':
        nextImage()
        break
      case 'ArrowLeft':
        prevImage()
        break
    }
  }

  // ============================================
  // DATA LOADING
  // ============================================
  const fetchArticle = async () => {
    const articleId = parseInt(route.params.id as string)

    if (isNaN(articleId)) {
      error.value = t('errors.invalidId') || 'Invalid article ID'
      return
    }

    try {
      error.value = null

      const fetchedArticle = await newsStore.loadArticle(articleId)

      if (!fetchedArticle) {
        error.value = t('errors.notFound') || 'Article not found'
        router.push('/news')
        return
      }
      
      // Scroll to top smoothly to trigger animations properly
      window.scrollTo({ top: 0, behavior: 'smooth' })
      
      // Wait for scroll to complete and DOM to update
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch {
      error.value = t('errors.loadFailed') || 'Failed to load article'
    }
  }

  // ============================================
  // DATE FORMATTING
  // ============================================
  const formatRelatedDate = (publishDate: string) => {
    const localeMap: Record<string, string> = {
      ka: 'ka-GE',
      en: 'en-US',
      ru: 'ru-RU',
    }
    return new Date(publishDate).toLocaleDateString(
      localeMap[localeStore.currentLocale] || 'ka-GE',
    )
  }

  // ============================================
  // WATCHERS
  // ============================================
  watch(() => route.params.id, async (newId, oldId) => {
    if (newId !== oldId) {
      await fetchArticle()
    }
  }, { immediate: true })

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(() => {
    window.scrollTo(0, 0)
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('scroll', handleScroll)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('scroll', handleScroll)
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // Translations
    t,

    // Stores
    localeStore,

    // Scroll animations
    scrollProgress,
    breadcrumbElement,
    breadcrumbVisible,
    headerElement,
    headerVisible,
    mainImageElement,
    mainImageVisible,
    contentElement,
    contentVisible,
    galleryElement,
    galleryVisible,
    relatedElement,
    relatedVisible,

    // State
    error,
    showGalleryModal,
    currentGalleryIndex,

    // Computed
    article,
    isLoading,
    relatedArticles,
    formattedDate,
    categoryLabels,

    // Gallery actions
    openGallery,
    closeGallery,
    nextImage,
    prevImage,

    // Formatters
    formatRelatedDate,
  }
}
