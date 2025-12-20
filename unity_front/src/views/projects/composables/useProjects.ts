/**
 * useProjects - Composable for projects page logic
 * Handles filtering, pagination, and scroll animations
 */

import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useTranslations } from '@/composables/useTranslations'
import { useProjectsPage } from '@/composables/useProjectsPage'
import { useProjectsStore } from '@/stores/public/projects'
import { useScrollAnimation } from '@/composables/useScrollAnimation'

export function useProjects() {
  // ============================================
  // COMPOSABLES
  // ============================================
  const { t } = useTranslations()
  const {
    allProjects,
    totalProjects,
    hasMorePages,
    currentPage,
    isLoading,
    error,
    loadProjectsPage,
  } = useProjectsPage()

  const projectsStore = useProjectsStore()

  // ============================================
  // STATE
  // ============================================
  const selectedCategory = ref('all')
  const scrollProgress = ref(0)
  const isTransitioning = ref(false)
  const heroVisible = ref(false)

  // ============================================
  // SCROLL ANIMATIONS
  // ============================================
  const {
    element: filterSectionRef,
    isVisible: filterSectionVisible,
  } = useScrollAnimation({ threshold: 0.05, rootMargin: '200px', once: false })

  const {
    element: projectsGridRef,
    isVisible: projectsGridVisible,
  } = useScrollAnimation({ threshold: 0.05, rootMargin: '200px', once: false })

  // ============================================
  // COMPUTED
  // ============================================
  const categories = computed(() => [
    { value: 'all', label: t('projects.categories.all') },
    { value: 'ongoing', label: t('projects.categories.ongoing') },
    { value: 'completed', label: t('projects.categories.completed') },
    { value: 'planning', label: t('projects.categories.planning') },
  ])

  const filteredProjects = computed(() => allProjects.value)

  // ============================================
  // HANDLERS
  // ============================================
  const handleScroll = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    scrollProgress.value = (scrollTop / docHeight) * 100
  }

  const loadProjectsAndUpdateStore = async (page: number = 1, loadMore: boolean = false) => {
    const statusFilter = selectedCategory.value === 'all' ? undefined : selectedCategory.value
    await loadProjectsPage(page, loadMore, statusFilter)

    if (allProjects.value.length > 0) {
      const transformedProjects = allProjects.value.map((project) => ({
        ...project,
        status: project.status as 'planning' | 'ongoing' | 'completed',
        year: parseInt(project.year as string),
        main_image: project.main_image || null,
        render_image: project.render_image || null,
        gallery_images: project.gallery_images || [],
        latitude: project.latitude ? parseFloat(project.latitude) : null,
        longitude: project.longitude ? parseFloat(project.longitude) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      projectsStore.$patch({
        projects: transformedProjects,
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600 text-white border border-green-300 shadow-lg'
      case 'ongoing':
        return 'bg-amber-600 text-white border border-amber-300 shadow-lg'
      case 'planning':
        return 'bg-gray-600 text-white border border-gray-300 shadow-lg'
      default:
        return 'bg-zinc-600 text-white border border-zinc-300 shadow-lg'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return t('projects.status.completed')
      case 'ongoing':
        return t('projects.status.ongoing')
      case 'planning':
        return t('projects.status.planning')
      default:
        return status
    }
  }

  // ============================================
  // WATCHERS
  // ============================================
  watch(selectedCategory, async () => {
    isTransitioning.value = true
    await new Promise(resolve => setTimeout(resolve, 300))
    await loadProjectsAndUpdateStore(1, false)
    await new Promise(resolve => setTimeout(resolve, 50))
    isTransitioning.value = false
  })

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(async () => {
    window.addEventListener('scroll', handleScroll)
    window.scrollTo(0, 0)
    setTimeout(() => {
      heroVisible.value = true
    }, 100)
    await loadProjectsAndUpdateStore()
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

    // Data
    allProjects,
    filteredProjects,
    totalProjects,
    hasMorePages,
    currentPage,
    isLoading,
    error,
    categories,

    // State
    selectedCategory,
    scrollProgress,
    isTransitioning,
    heroVisible,

    // Scroll animations
    filterSectionRef,
    filterSectionVisible,
    projectsGridRef,
    projectsGridVisible,

    // Handlers
    loadProjectsAndUpdateStore,
    getStatusColor,
    getStatusText,
  }
}
