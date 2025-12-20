/**
 * useNewsList - Composable for news list page logic
 * Handles pagination, search, categories, and scroll animations
 */

import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useTranslations } from '@/composables/useTranslations'
import { useTranslationsStore } from '@/stores/ui/translations'
import { useNewsStore } from '@/stores/public/news'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

export function useNewsList() {
  // ============================================
  // STORES
  // ============================================
  const { t } = useTranslations()
  const newsStore = useNewsStore()
  const translationsStore = useTranslationsStore()

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================
  const scrollProgress = ref(0)
  const { element: heroElement, isVisible: heroVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
  const { element: searchFilterElement, isVisible: searchFilterVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
  const { element: featuredElement, isVisible: featuredVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
  const { element: articlesHeaderElement, isVisible: articlesHeaderVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })
  const { element: articlesGridElement, isVisible: articlesGridVisible } = useScrollAnimation({ once: false, threshold: 0.05, rootMargin: '200px' })

  const handleScroll = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    scrollProgress.value = (scrollTop / docHeight) * 100
  }

  // ============================================
  // STATE
  // ============================================
  const selectedCategory = ref<string>('all')
  const searchQuery = ref('')
  const isLoading = ref(true)
  const isLoadingCategories = ref(false)
  const isTransitioning = ref(false)
  const currentPage = ref(1)

  // ============================================
  // COMPUTED
  // ============================================
  const hasTranslations = computed(() => {
    return Object.keys(translationsStore.translations).length > 0
  })

  const categoryLabels = computed(() => ({
    all: t('news.categories.all'),
    company: t('news.categories.company'),
    project: t('news.categories.project'),
    industry: t('news.categories.industry'),
    event: t('news.categories.event'),
  }))

  const featuredArticle = computed(() => {
    return newsStore.featuredArticles.find((article) => article.is_featured) || null
  })

  // ============================================
  // FORMATTERS
  // ============================================
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // ============================================
  // ACTIONS
  // ============================================
  const loadArticles = async (page = 1, resetPagination = false, isCategoryChange = false) => {
    try {
      if (!isCategoryChange && page === 1 && !resetPagination) {
        isLoading.value = true
      } else if (isCategoryChange) {
        isLoadingCategories.value = true
      }

      const params = {
        page,
        per_page: 9,
        ...(selectedCategory.value !== 'all' && { category: selectedCategory.value }),
        ...(searchQuery.value.trim() && { search: searchQuery.value.trim() }),
      }

      await newsStore.loadArticles(params)

      if (resetPagination) {
        currentPage.value = 1
      } else {
        currentPage.value = page
      }
    } catch {
      // Error handling
    } finally {
      isLoading.value = false
      isLoadingCategories.value = false
    }
  }

  const loadFeaturedArticle = async () => {
    try {
      await newsStore.loadFeaturedArticles()
    } catch {
      // Error handling
    }
  }

  const handleCategoryChange = async (category: string) => {
    if (category === selectedCategory.value || isTransitioning.value) return

    isTransitioning.value = true
    await new Promise((resolve) => setTimeout(resolve, 300))
    selectedCategory.value = category
    await loadArticles(1, true, true)
    await new Promise((resolve) => setTimeout(resolve, 50))
    isTransitioning.value = false
  }

  const handleSearch = () => {
    loadArticles(1, true, true)
  }

  const handlePageChange = (page: number) => {
    loadArticles(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const generatePageNumbers = () => {
    const current = newsStore.pagination.current_page
    const last = newsStore.pagination.last_page
    const delta = 2

    const range = []
    const rangeWithDots: (number | string)[] = []

    for (let i = Math.max(2, current - delta); i <= Math.min(last - 1, current + delta); i++) {
      range.push(i)
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (current + delta < last - 1) {
      rangeWithDots.push('...', last)
    } else if (last > 1) {
      rangeWithDots.push(last)
    }

    return rangeWithDots
  }

  // ============================================
  // WATCHERS
  // ============================================
  let searchTimeout: number
  watch(searchQuery, () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      handleSearch()
    }, 500)
  })

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(async () => {
    await loadArticles(1)
    await loadFeaturedArticle()
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

    // Stores
    newsStore,

    // Scroll animations
    scrollProgress,
    heroElement,
    heroVisible,
    searchFilterElement,
    searchFilterVisible,
    featuredElement,
    featuredVisible,
    articlesHeaderElement,
    articlesHeaderVisible,
    articlesGridElement,
    articlesGridVisible,

    // State
    selectedCategory,
    searchQuery,
    isLoading,
    isLoadingCategories,
    isTransitioning,
    currentPage,

    // Computed
    hasTranslations,
    categoryLabels,
    featuredArticle,

    // Formatters
    formatDate,

    // Actions
    handleCategoryChange,
    handlePageChange,
    generatePageNumbers,
  }
}
