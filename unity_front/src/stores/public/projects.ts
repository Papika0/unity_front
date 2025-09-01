import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { projectsApi } from '@/services/projectsApi'

export interface Project {
  id: number
  is_active: boolean
  is_featured: boolean
  is_onHomepage: boolean
  title: string
  description: string
  location: string
  status: 'planning' | 'ongoing' | 'completed'
  start_date: string | null
  completion_date: string | null
  main_image: string
  render_image: string
  gallery_images: string[]
  year: number
  latitude: number | null
  longitude: number | null
  meta_title: string | null
  meta_description: string | null
  created_at: string
  updated_at: string
}

export const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const featuredProjectsData = ref<Project[]>([])
  const homepageProjectsData = ref<Project[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeProjects = computed(() => projects.value.filter((project) => project.is_active))

  const featuredProjects = computed(() => {
    // If we have specifically fetched featured projects, use those
    if (featuredProjectsData.value.length > 0) {
      return featuredProjectsData.value.filter((project) => project.is_active)
    }
    // Otherwise, filter from all projects
    return projects.value.filter((project) => project.is_featured && project.is_active)
  })

  const homepageProjects = computed(() => {
    // If we have specifically fetched homepage projects, use those
    if (homepageProjectsData.value.length > 0) {
      return homepageProjectsData.value.filter((project) => project.is_active)
    }
    // Otherwise, filter from all projects
    return projects.value.filter((project) => project.is_onHomepage && project.is_active)
  })

  const ongoingProjects = computed(() =>
    projects.value.filter((project) => project.status === 'ongoing' && project.is_active),
  )

  const completedProjects = computed(() =>
    projects.value.filter((project) => project.status === 'completed' && project.is_active),
  )

  const plannedProjects = computed(() =>
    projects.value.filter((project) => project.status === 'planning' && project.is_active),
  )

  const projectsByYear = computed(() => {
    const grouped: Record<number, Project[]> = {}
    activeProjects.value.forEach((project) => {
      if (!grouped[project.year]) {
        grouped[project.year] = []
      }
      grouped[project.year].push(project)
    })
    return grouped
  })

  // Actions
  const getProjectById = (id: number): Project | undefined => {
    return projects.value.find((project) => project.id === id && project.is_active)
  }

  const getProjectsByStatus = (status: Project['status']): Project[] => {
    return projects.value.filter((project) => project.status === status && project.is_active)
  }

  // API integration methods
  const fetchProjects = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await projectsApi.getAll()
      if (response.success && response.data) {
        projects.value = response.data
      } else {
        throw new Error(response.message || 'Failed to fetch projects')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch projects'
      console.error('Error fetching projects:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchFeaturedProjects = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await projectsApi.getFeatured()
      if (response.success && response.data) {
        featuredProjectsData.value = response.data
      } else {
        throw new Error(response.message || 'Failed to fetch featured projects')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch featured projects'
      console.error('Error fetching featured projects:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchHomepageProjects = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await projectsApi.getHomepage()
      if (response.success && response.data) {
        homepageProjectsData.value = response.data
      } else {
        throw new Error(response.message || 'Failed to fetch homepage projects')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch homepage projects'
      console.error('Error fetching homepage projects:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchProjectById = async (id: number): Promise<Project | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await projectsApi.getById(id)
      if (response.success && response.data) {
        const project = response.data

        // Update the project in the store if it exists
        const existingIndex = projects.value.findIndex((p) => p.id === id)
        if (existingIndex !== -1) {
          projects.value[existingIndex] = project
        } else {
          projects.value.push(project)
        }

        return project
      } else {
        throw new Error(response.message || 'Failed to fetch project')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch project'
      console.error('Error fetching project:', err)
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Clear data
  const clearProjects = () => {
    projects.value = []
    featuredProjectsData.value = []
    homepageProjectsData.value = []
    error.value = null
  }

  // Custom patch method
  const $patch = (
    state: Partial<{
      projects: Project[]
      featuredProjectsData: Project[]
      homepageProjectsData: Project[]
    }>,
  ) => {
    if (state.projects !== undefined) {
      projects.value = state.projects
    }
    if (state.featuredProjectsData !== undefined) {
      featuredProjectsData.value = state.featuredProjectsData
    }
    if (state.homepageProjectsData !== undefined) {
      homepageProjectsData.value = state.homepageProjectsData
    }
  }

  return {
    // State
    projects,
    featuredProjectsData,
    homepageProjectsData,
    isLoading,
    error,

    // Getters
    activeProjects,
    featuredProjects,
    homepageProjects,
    ongoingProjects,
    completedProjects,
    plannedProjects,
    projectsByYear,

    // Actions
    getProjectById,
    getProjectsByStatus,
    fetchProjects,
    fetchFeaturedProjects,
    fetchHomepageProjects,
    fetchProjectById,
    clearProjects,
    $patch,
  }
})
