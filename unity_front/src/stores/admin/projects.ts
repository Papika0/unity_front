import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAdminProjects,
  getAdminProject,
  createProject,
  updateProject,
  deleteProject,
  setFeaturedProjects,
  setHomepageProjects,
} from '@/services/projects'
import type { Project } from '@/types'

interface ApiError {
  response?: {
    data?: {
      message?: string
    }
  }
}

const getErrorMessage = (err: unknown, defaultMessage: string): string => {
  const apiError = err as ApiError
  return apiError?.response?.data?.message || defaultMessage
}

export const useAdminProjectsStore = defineStore('adminProjects', () => {
  // State
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const searchQuery = ref('')

  // Featured projects modal state
  const showFeaturedModal = ref(false)
  const selectedProjects = ref<
    Array<{ id: number; is_featured: boolean; is_onHomepage: boolean; order: number }>
  >([])
  const savingFeatured = ref(false)

  // Homepage projects modal state
  const showHomepageModal = ref(false)
  const selectedHomepageIds = ref<number[]>([])
  const savingHomepage = ref(false)

  // Featured projects computed
  const canSelectMoreFeatured = computed(() => selectedProjects.value.length < 3)
  const featuredProjects = computed(() => projects.value.filter((p) => p.is_featured))

  // Getters
  const filteredProjects = computed(() => {
    if (!searchQuery.value) return projects.value

    return projects.value.filter(
      (project) =>
        project.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.value.toLowerCase()),
    )
  })

  const projectsCount = computed(() => projects.value.length)

  // Actions
  const loadProjects = async () => {
    try {
      loading.value = true
      error.value = ''

      const response = await getAdminProjects()
      projects.value = response.data.data || response.data
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'პროექტების ჩატვირთვა ვერ მოხერხდა')
      console.error('Error loading projects:', err)
    } finally {
      loading.value = false
    }
  }

  const loadProject = async (id: number) => {
    try {
      loading.value = true
      error.value = ''

      const response = await getAdminProject(id)
      currentProject.value = response.data.data || response.data
      return currentProject.value
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'პროექტის ჩატვირთვა ვერ მოხერხდა')
      console.error('Error loading project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchProject = async (
    id: number,
  ): Promise<{ success: boolean; data?: Project; error?: string }> => {
    try {
      loading.value = true
      error.value = ''

      const response = await getAdminProject(id)
      const project: Project = response.data.data || response.data

      // Update current project and projects array if needed
      currentProject.value = project
      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        projects.value[index] = project
      }

      return { success: true, data: project }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err, 'პროექტის ჩატვირთვა ვერ მოხერხდა')
      error.value = errorMessage
      console.error('Error loading project:', err)
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const addProject = async (projectData: FormData) => {
    try {
      saving.value = true
      error.value = ''

      const response = await createProject(projectData)
      const newProject = response.data.data || response.data

      projects.value.unshift(newProject)
      return { success: true, project: newProject }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'პროექტის დამატება ვერ მოხერხდა')
      console.error('Error creating project:', err)
      return { success: false, error: error.value }
    } finally {
      saving.value = false
    }
  }

  const editProject = async (id: number, projectData: FormData) => {
    try {
      saving.value = true
      error.value = ''

      const response = await updateProject(id, projectData)
      const updatedProject = response.data.data || response.data

      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }

      if (currentProject.value?.id === id) {
        currentProject.value = updatedProject
      }

      return { success: true, project: updatedProject }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'პროექტის განახლება ვერ მოხერხდა')
      console.error('Error updating project:', err)
      return { success: false, error: error.value }
    } finally {
      saving.value = false
    }
  }

  const removeProject = async (id: number) => {
    try {
      saving.value = true
      error.value = ''

      await deleteProject(id)

      projects.value = projects.value.filter((p) => p.id !== id)

      if (currentProject.value?.id === id) {
        currentProject.value = null
      }

      return { success: true }
    } catch (err: unknown) {
      error.value = getErrorMessage(err, 'პროექტის წაშლა ვერ მოხერხდა')
      console.error('Error deleting project:', err)
      return { success: false, error: error.value }
    } finally {
      saving.value = false
    }
  }

  // Featured projects actions
  const openFeaturedModal = () => {
    showFeaturedModal.value = true
    selectedProjects.value = featuredProjects.value.map((p, idx) => ({
      id: p.id,
      is_featured: true,
      is_onHomepage: p.is_onHomepage,
      order: idx + 1,
    }))
  }

  const cancelFeaturedSelection = () => {
    selectedProjects.value = []
    showFeaturedModal.value = false
  }

  const toggleProjectSelection = (project: Project) => {
    const idx = selectedProjects.value.findIndex((p) => p.id === project.id)
    if (idx > -1) {
      selectedProjects.value.splice(idx, 1)
      // Reorder
      selectedProjects.value.forEach((p, i) => (p.order = i + 1))
    } else if (canSelectMoreFeatured.value) {
      selectedProjects.value.push({
        id: project.id,
        is_featured: true,
        is_onHomepage: false,
        order: selectedProjects.value.length + 1,
      })
    }
  }

  const saveFeaturedProjects = async () => {
    if (selectedProjects.value.length === 0) return
    savingFeatured.value = true
    try {
      const projectIds = selectedProjects.value.map((p) => p.id)
      await setFeaturedProjects(projectIds)
      await loadProjects()
      showFeaturedModal.value = false
      selectedProjects.value = []
    } catch {
      error.value = 'Featured projects update failed'
    } finally {
      savingFeatured.value = false
    }
  }

  // Homepage projects actions
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
  // Homepage projects actions
  // Use store's own method, not from outside
  const saveHomepageProjects = async () => {
    if (selectedHomepageIds.value.length === 0) return
    savingHomepage.value = true
    try {
      await setHomepageProjects(selectedHomepageIds.value)
      await loadProjects()
      showHomepageModal.value = false
      selectedHomepageIds.value = []
    } catch {
      error.value = 'Homepage projects update failed'
    } finally {
      savingHomepage.value = false
    }
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const clearError = () => {
    error.value = ''
  }

  const clearCurrentProject = () => {
    currentProject.value = null
  }

  // Initialize
  const initialize = async () => {
    await loadProjects()
  }

  // Methods that accept IDs as parameters for component use
  const updateFeaturedProjects = async (projectIds: number[]) => {
    savingFeatured.value = true
    try {
      await setFeaturedProjects(projectIds)
      await loadProjects()
    } catch {
      error.value = 'Featured projects update failed'
    } finally {
      savingFeatured.value = false
    }
  }

  const updateHomepageProjects = async (projectIds: number[]) => {
    savingHomepage.value = true
    try {
      await setHomepageProjects(projectIds)
      await loadProjects()
    } catch {
      error.value = 'Homepage projects update failed'
    } finally {
      savingHomepage.value = false
    }
  }

  return {
    // State
    projects,
    currentProject,
    loading,
    saving,
    error,
    searchQuery,
    showFeaturedModal,
    selectedProjects,
    savingFeatured,
    showHomepageModal,
    selectedHomepageIds,
    savingHomepage,

    // Getters
    filteredProjects,
    projectsCount,
    canSelectMoreFeatured,
    featuredProjects,

    // Actions
    loadProjects,
    loadProject,
    fetchProject,
    addProject,
    editProject,
    removeProject,
    openFeaturedModal,
    cancelFeaturedSelection,
    toggleProjectSelection,
    saveFeaturedProjects,
    openHomepageModal,
    cancelHomepageSelection,
    toggleHomepageSelection,
    saveHomepageProjects,
    updateFeaturedProjects,
    updateHomepageProjects,
    setSearchQuery,
    clearError,
    clearCurrentProject,
    initialize,
  }
})
