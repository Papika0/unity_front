/**
 * useProjectDetail - Composable for admin project detail view
 * Handles fetching project data, editing, and date formatting
 */

import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminProjectsStore } from '@/stores/admin/projects'
import type { Project } from '@/types'

export function useProjectDetail() {
  // ============================================
  // STORES & ROUTER
  // ============================================
  const route = useRoute()
  const router = useRouter()
  const adminProjectsStore = useAdminProjectsStore()

  // ============================================
  // STATE
  // ============================================
  const project = ref<Project | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  // ============================================
  // DATA FETCHING
  // ============================================
  async function fetchProject() {
    try {
      loading.value = true
      error.value = null
      const projectId = Number(route.params.id)

      // Try to get from store first
      const storeProject = adminProjectsStore.projects.find((p) => p.id === projectId)
      if (storeProject) {
        project.value = storeProject
        loading.value = false
        return
      }

      // If not in store, fetch from API
      const result = await adminProjectsStore.fetchProject(projectId)
      if (result.success && result.data) {
        project.value = result.data
      } else {
        error.value = result.error || 'პროექტის ჩატვირთვა ვერ მოხერხდა'
      }
    } catch (e) {
      console.error('Failed to load project:', e)
      error.value = 'პროექტის ჩატვირთვა ვერ მოხერხდა'
    } finally {
      loading.value = false
    }
  }

  // ============================================
  // ACTIONS
  // ============================================
  function editProject() {
    if (project.value) {
      router.push({
        name: 'admin-project-edit',
        params: { id: project.value.id.toString() },
      })
    }
  }

  function goBack() {
    router.push({ name: 'admin-projects' })
  }

  // ============================================
  // FORMATTERS
  // ============================================
  function formatDate(dateStr: string) {
    const dt = new Date(dateStr)
    const georgianMonths = [
      'იანვარი',
      'თებერვალი',
      'მარტი',
      'აპრილი',
      'მაისი',
      'ივნისი',
      'ივლისი',
      'აგვისტო',
      'სექტემბერი',
      'ოქტომბერი',
      'ნოემბერი',
      'დეკემბერი',
    ]
    return `${georgianMonths[dt.getMonth()]} ${dt.getFullYear()}`
  }

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(fetchProject)

  // ============================================
  // RETURN
  // ============================================
  return {
    // Router
    router,

    // State
    project,
    loading,
    error,

    // Actions
    fetchProject,
    editProject,
    goBack,

    // Formatters
    formatDate,
  }
}
