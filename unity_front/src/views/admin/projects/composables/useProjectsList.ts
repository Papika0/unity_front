/**
 * useProjectsList - Composable for admin projects list management
 * Handles project loading, featured/homepage modals, and navigation
 */

import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminProjectsStore } from '@/stores/admin/projects'
import { useZoneEditorStore } from '@/stores/admin/zoneEditor'

export function useProjectsList() {
  // ============================================
  // STORES & ROUTER
  // ============================================
  const router = useRouter()
  const adminProjectsStore = useAdminProjectsStore()

  // ============================================
  // STATE
  // ============================================
  const projects = computed(() => adminProjectsStore.filteredProjects)
  const loading = computed(() => adminProjectsStore.loading)
  const error = computed(() => adminProjectsStore.error)

  // Featured projects modal state
  const showFeaturedModal = ref(false)
  const showHomepageModal = ref(false)
  const selectedFeaturedIds = ref<number[]>([])
  const selectedHomepageIds = ref<number[]>([])
  const savingFeatured = ref(false)
  const savingHomepage = ref(false)

  // ============================================
  // FEATURED PROJECTS
  // ============================================
  const openFeaturedModal = () => {
    showFeaturedModal.value = true
    selectedFeaturedIds.value = projects.value.filter((p) => p.is_featured).map((p) => p.id)
  }

  const cancelFeaturedSelection = () => {
    showFeaturedModal.value = false
    selectedFeaturedIds.value = []
  }

  const toggleFeaturedSelection = (id: number) => {
    const idx = selectedFeaturedIds.value.indexOf(id)
    if (idx > -1) {
      selectedFeaturedIds.value.splice(idx, 1)
    } else if (selectedFeaturedIds.value.length < 3) {
      selectedFeaturedIds.value.push(id)
    }
  }

  const saveFeaturedProjects = async () => {
    savingFeatured.value = true
    try {
      await adminProjectsStore.updateFeaturedProjects(selectedFeaturedIds.value)
      showFeaturedModal.value = false
      selectedFeaturedIds.value = []
    } finally {
      savingFeatured.value = false
    }
  }

  // ============================================
  // HOMEPAGE PROJECTS
  // ============================================
  const openHomepageModal = () => {
    showHomepageModal.value = true
    selectedHomepageIds.value = projects.value.filter((p) => p.is_onHomepage).map((p) => p.id)
  }

  const cancelHomepageSelection = () => {
    showHomepageModal.value = false
    selectedHomepageIds.value = []
  }

  const toggleHomepageSelection = (id: number) => {
    const idx = selectedHomepageIds.value.indexOf(id)
    if (idx > -1) {
      selectedHomepageIds.value.splice(idx, 1)
    } else if (selectedHomepageIds.value.length < 3) {
      selectedHomepageIds.value.push(id)
    }
  }

  const saveHomepageProjects = async () => {
    savingHomepage.value = true
    try {
      await adminProjectsStore.updateHomepageProjects(selectedHomepageIds.value)
      showHomepageModal.value = false
      selectedHomepageIds.value = []
    } finally {
      savingHomepage.value = false
    }
  }

  // ============================================
  // NAVIGATION
  // ============================================
  const goToAddProject = () => {
    router.push({ name: 'admin-project-add' })
  }

  const goToDetail = (id: number) => {
    router.push({ name: 'admin-project-detail', params: { id: id.toString() } })
  }

  const goToZonesEditor = (id: number) => {
    const zoneStore = useZoneEditorStore()
    zoneStore.setEntryPoint('projects')
    router.push({ name: 'admin-zones-building-blocks', params: { id: id.toString() } })
  }

  // ============================================
  // HELPERS
  // ============================================
  const formatDate = (dateString: string) => {
    const dt = new Date(dateString)
    const months = [
      'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
      'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი',
    ]
    return `${dt.getDate()} ${months[dt.getMonth()]} ${dt.getFullYear()}`
  }

  const truncate = (str: string, len: number) => {
    if (!str) return ''
    return str.length > len ? str.slice(0, len) + '…' : str
  }

  const initialize = () => {
    adminProjectsStore.initialize()
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(() => {
    initialize()
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // State
    projects,
    loading,
    error,
    showFeaturedModal,
    showHomepageModal,
    selectedFeaturedIds,
    selectedHomepageIds,
    savingFeatured,
    savingHomepage,

    // Featured
    openFeaturedModal,
    cancelFeaturedSelection,
    toggleFeaturedSelection,
    saveFeaturedProjects,

    // Homepage
    openHomepageModal,
    cancelHomepageSelection,
    toggleHomepageSelection,
    saveHomepageProjects,

    // Navigation
    goToAddProject,
    goToDetail,
    goToZonesEditor,

    // Helpers
    formatDate,
    truncate,
    initialize,
  }
}
