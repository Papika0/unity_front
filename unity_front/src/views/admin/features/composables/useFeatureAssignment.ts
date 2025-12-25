/**
 * useFeatureAssignment - Composable for assigning features to projects
 * Handles loading features/projects and assignment logic
 */

import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { featuresApi, type Feature, type ProjectFeature } from '@/services/featuresApi'
import { projectsApi, type ProjectApiResponse } from '@/services/projectsApi'

export function useFeatureAssignment() {
  // ============================================
  // ROUTER
  // ============================================
  const router = useRouter()

  // ============================================
  // STATE
  // ============================================
  const features = ref<Feature[]>([])
  const projects = ref<ProjectApiResponse[]>([])
  const selectedProjectId = ref('')
  const selectedFeatures = ref<number[]>([])
  const autoDetect = ref(false)
  const isSubmitting = ref(false)
  const isLoadingProjectFeatures = ref(false)

  // ============================================
  // DATA LOADING
  // ============================================
  const loadFeatures = async () => {
    try {
      features.value = await featuresApi.adminGetAll()
    } catch (error) {
      console.error('Failed to load features:', error)
    }
  }

  const loadProjects = async () => {
    try {
      // For admin, we can use default locale since it's just for selection
      projects.value = await projectsApi.getAll()
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const loadProjectFeatures = async (projectId: string) => {
    if (!projectId) {
      selectedFeatures.value = []
      return
    }

    isLoadingProjectFeatures.value = true
    try {
      const projectFeatures = await featuresApi.getProjectFeatures(parseInt(projectId))
      selectedFeatures.value = projectFeatures.map((feature: ProjectFeature) => feature.id)
    } catch (err: unknown) {
      console.error('Failed to load project features:', err)
      selectedFeatures.value = []
    } finally {
      isLoadingProjectFeatures.value = false
    }
  }

  // ============================================
  // ACTIONS
  // ============================================
  const assignFeatures = async () => {
    if (!selectedProjectId.value) return

    isSubmitting.value = true
    try {
      if (autoDetect.value) {
        // Auto-detect features
        await featuresApi.assignToProject(parseInt(selectedProjectId.value), [], true)
      } else {
        // Manual selection
        await featuresApi.assignToProject(
          parseInt(selectedProjectId.value),
          selectedFeatures.value,
          false,
        )
      }

      router.push('/admin/features')
    } catch (err: unknown) {
      console.error('Failed to assign features:', err)
      const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string }
      const errorMessage =
        error.response?.data?.message || error.message || 'ფუნქციების მინიჭება ვერ მოხერხდა'
      alert(`შეცდომა: ${errorMessage}`)
    } finally {
      isSubmitting.value = false
    }
  }

  // ============================================
  // WATCHERS
  // ============================================
  watch(selectedProjectId, (newProjectId) => {
    if (newProjectId) {
      loadProjectFeatures(newProjectId)
    } else {
      selectedFeatures.value = []
    }
  })

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(() => {
    loadFeatures()
    loadProjects()
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // State
    features,
    projects,
    selectedProjectId,
    selectedFeatures,
    autoDetect,
    isSubmitting,
    isLoadingProjectFeatures,

    // Actions
    assignFeatures,
  }
}
