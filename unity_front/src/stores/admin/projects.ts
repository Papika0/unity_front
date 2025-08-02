import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getAdminProjects,
  getAdminProject,
  createProject,
  updateProject,
  deleteProject,
} from '@/services/projects'
import type { Project, ApiResponse } from '@/types'

export const useAdminProjectsStore = defineStore('adminProjects', () => {
  // State
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const searchQuery = ref('')

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
    } catch (err: any) {
      error.value = err.response?.data?.message || 'პროექტების ჩატვირთვა ვერ მოხერხდა'
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
    } catch (err: any) {
      error.value = err.response?.data?.message || 'პროექტის ჩატვირთვა ვერ მოხერხდა'
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
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'პროექტის ჩატვირთვა ვერ მოხერხდა'
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
    } catch (err: any) {
      error.value = err.response?.data?.message || 'პროექტის დამატება ვერ მოხერხდა'
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
    } catch (err: any) {
      error.value = err.response?.data?.message || 'პროექტის განახლება ვერ მოხერხდა'
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
    } catch (err: any) {
      error.value = err.response?.data?.message || 'პროექტის წაშლა ვერ მოხერხდა'
      console.error('Error deleting project:', err)
      return { success: false, error: error.value }
    } finally {
      saving.value = false
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

  return {
    // State
    projects,
    currentProject,
    loading,
    saving,
    error,
    searchQuery,

    // Getters
    filteredProjects,
    projectsCount,

    // Actions
    loadProjects,
    loadProject,
    fetchProject,
    addProject,
    editProject,
    removeProject,
    setSearchQuery,
    clearError,
    clearCurrentProject,
    initialize,
  }
})
