import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminNewsStore } from '@/stores/admin/news'
import { useToastStore } from '@/stores/ui/toast'
import type { AdminNewsArticle } from '@/types/index'

export function useNewsList() {
  const router = useRouter()
  const adminNewsStore = useAdminNewsStore()
  const toastStore = useToastStore()

  // Local state
  const showDeleteModal = ref(false)
  const articleToDelete = ref<AdminNewsArticle | null>(null)
  const searchTimeout = ref<number | null>(null)

  // Custom dropdown state
  const showCategoryDropdown = ref(false)
  const dropdownOptions = ref<HTMLElement | null>(null)
  const dropdownPosition = ref({})

  // Category dropdown options
  const categoryOptions = [
    { value: '', label: 'ყველა კატეგორია' },
    { value: 'company', label: 'კომპანია' },
    { value: 'project', label: 'პროექტი' },
    { value: 'industry', label: 'ინდუსტრია' },
    { value: 'event', label: 'ღონისძიება' },
  ]

  // Featured news modal state
  const showFeaturedModal = ref(false)
  const selectedNewsIds = ref<number[]>([])
  const savingFeatured = ref(false)

  // Computed
  const articles = computed(() => adminNewsStore.articles)
  const allArticles = computed(() => adminNewsStore.modalArticles)
  const articlesCount = computed(() => adminNewsStore.articlesCount)
  const featuredArticles = computed(() => adminNewsStore.featuredArticles)
  const loading = computed(() => adminNewsStore.loading)
  const saving = computed(() => adminNewsStore.saving)
  const error = computed(() => adminNewsStore.error)
  const paginationInfo = computed(() => adminNewsStore.paginationInfo)

  // Featured news computed properties
  const canSelectMore = computed(() => selectedNewsIds.value.length < 2)

  // Methods
  const goToAddNews = () => {
    adminNewsStore.clearValidationErrors()
    adminNewsStore.clearError()
    router.push('/admin/news/add')
  }

  const handleSearch = () => {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
    searchTimeout.value = setTimeout(() => {
      adminNewsStore.searchArticles(adminNewsStore.searchQuery)
    }, 500)
  }

  const clearCategoryFilter = () => {
    adminNewsStore.selectedCategory = ''
    adminNewsStore.filterByCategory('')
  }

  const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement
    if (dropdownOptions.value && !dropdownOptions.value.contains(target)) {
      showCategoryDropdown.value = false
      document.removeEventListener('click', handleClickOutside)
    }
  }

  // Custom dropdown methods
  const toggleCategoryDropdown = (event: Event) => {
    event.preventDefault()
    showCategoryDropdown.value = !showCategoryDropdown.value

    if (showCategoryDropdown.value) {
      const target = event.target as HTMLElement
      const rect = target.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const dropdownHeight = 200

      const spaceBelow = viewportHeight - rect.bottom
      const shouldShowAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight

      dropdownPosition.value = {
        left: `${rect.left}px`,
        top: shouldShowAbove ? `${rect.top - dropdownHeight}px` : `${rect.bottom + 4}px`,
        width: `${rect.width}px`,
        maxHeight: shouldShowAbove ? `${rect.top - 10}px` : `${spaceBelow - 10}px`,
      }

      setTimeout(() => {
        document.addEventListener('click', handleClickOutside)
      }, 0)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
  }

  const selectCategory = (value: string) => {
    adminNewsStore.selectedCategory = value
    adminNewsStore.filterByCategory(value)
    showCategoryDropdown.value = false
    document.removeEventListener('click', handleClickOutside)
  }

  const handleDropdownBlur = () => {
    setTimeout(() => {
      if (dropdownOptions.value && !dropdownOptions.value.contains(document.activeElement)) {
        showCategoryDropdown.value = false
        document.removeEventListener('click', handleClickOutside)
      }
    }, 100)
  }

  const getCategoryDisplayText = (value: string) => {
    const option = categoryOptions.find((opt) => opt.value === value)
    return option ? option.label : 'ყველა კატეგორია'
  }

  const goToView = (id: number) => {
    if (!id || id < 1) {
      console.error('Invalid article ID:', id)
      return
    }

    const articleExists = adminNewsStore.articles.some((article) => article.id === id)
    if (!articleExists) {
      console.warn(`Article with ID ${id} not found in current articles list`)
    }

    router.push(`/admin/news/${id}`)
  }

  const goToEdit = (id: number) => {
    adminNewsStore.clearValidationErrors()
    adminNewsStore.clearError()
    router.push(`/admin/news/${id}/edit`)
  }

  const confirmDelete = (article: AdminNewsArticle) => {
    articleToDelete.value = article
    showDeleteModal.value = true
  }

  const cancelDelete = () => {
    articleToDelete.value = null
    showDeleteModal.value = false
  }

  const deleteNews = async () => {
    if (!articleToDelete.value) return

    try {
      const result = await adminNewsStore.removeArticle(articleToDelete.value.id)
      if (result.success) {
        toastStore.success(
          'სიახლე წაშლილია',
          `"${articleToDelete.value.title.ka}" წარმატებით წაიშალა`,
        )
        showDeleteModal.value = false
        articleToDelete.value = null
      } else {
        toastStore.error('შეცდომა', result.error || 'სიახლის წაშლა ვერ მოხერხდა')
      }
    } catch (err) {
      console.error('Error deleting news article:', err)
      toastStore.error('შეცდომა', 'სიახლის წაშლა ვერ მოხერხდა')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ka-GE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      company: 'კომპანია',
      project: 'პროექტი',
      industry: 'ინდუსტრია',
      event: 'ღონისძიება',
    }
    return labels[category] || category
  }

  const getPageRange = () => {
    const current = paginationInfo.value.currentPage
    const total = paginationInfo.value.totalPages
    const range = []

    const start = Math.max(1, current - 2)
    const end = Math.min(total, current + 2)

    for (let i = start; i <= end; i++) {
      range.push(i)
    }

    return range
  }

  // Featured news methods
  const openFeaturedModal = async () => {
    showFeaturedModal.value = true
    if (allArticles.value.length === 0) {
      await adminNewsStore.loadArticlesForFeaturedModal()
    }
    const modalFeatured = allArticles.value.filter((article) => article.is_featured)
    selectedNewsIds.value = modalFeatured.map((article) => article.id)
  }

  const cancelFeaturedSelection = () => {
    selectedNewsIds.value = []
    showFeaturedModal.value = false
  }

  const toggleNewsSelection = (articleId: number) => {
    const index = selectedNewsIds.value.indexOf(articleId)
    if (index > -1) {
      selectedNewsIds.value.splice(index, 1)
    } else {
      if (canSelectMore.value) {
        selectedNewsIds.value.push(articleId)
      }
    }
  }

  const saveFeaturedNews = async () => {
    if (selectedNewsIds.value.length === 0) return
    savingFeatured.value = true
    try {
      const result = await adminNewsStore.setFeaturedNews(selectedNewsIds.value)
      if (result.success) {
        toastStore.success(
          'რჩეული სიახლეები განახლდა',
          `წარმატებით განახლდა ${selectedNewsIds.value.length} რჩეული სიახლე`,
        )
        showFeaturedModal.value = false
        selectedNewsIds.value = []
        await adminNewsStore.loadArticles()
      } else {
        toastStore.error('შეცდომა', result.error || 'რჩეული სიახლეების განახლება ვერ მოხერხდა')
      }
    } catch (err) {
      console.error('Error setting featured news:', err)
      toastStore.error('შეცდომა', 'რჩეული სიახლეების განახლება ვერ მოხერხდა')
    } finally {
      savingFeatured.value = false
    }
  }

  // Lifecycle
  onMounted(() => {
    adminNewsStore.clearValidationErrors()
    adminNewsStore.clearError()
    adminNewsStore.loadArticles()
  })

  // Search logic needs to be in a watcher or manually called. 
  // The original component used @input="handleSearch", so we expose handleSearch.

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value)
    }
  })

  return {
    // State
    adminNewsStore, // Expose store for direct mutations (v-model)
    showDeleteModal,
    articleToDelete,
    showCategoryDropdown,
    dropdownOptions,
    dropdownPosition,
    categoryOptions,
    showFeaturedModal,
    selectedNewsIds,
    savingFeatured,

    // Computed
    articles,
    allArticles,
    articlesCount,
    featuredArticles,
    loading,
    saving,
    error,
    paginationInfo,
    canSelectMore,

    // Methods
    goToAddNews,
    handleSearch,
    clearCategoryFilter,
    toggleCategoryDropdown,
    selectCategory,
    handleDropdownBlur,
    getCategoryDisplayText,
    goToView,
    goToEdit,
    confirmDelete,
    cancelDelete,
    deleteNews,
    formatDate,
    getCategoryLabel,
    getPageRange,
    openFeaturedModal,
    cancelFeaturedSelection,
    toggleNewsSelection,
    saveFeaturedNews
  }
}
