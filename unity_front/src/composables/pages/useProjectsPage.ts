import { ref, computed } from 'vue'
import { useTranslationsStore } from '@/stores/ui/translations'
import {
  getProjectsPage,
  type ProjectsPageResponse,
  type PaginationInfo,
} from '@/services/projectsPage'
import type { ProjectApiResponse } from '@/services/projectsApi'

export function useProjectsPage() {
  const allProjects = ref<ProjectApiResponse[]>([])
  const pagination = ref<PaginationInfo | null>(null)
  const translations = ref<Record<string, string>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const translationStore = useTranslationsStore()

  const totalProjects = computed(() => {
    return pagination.value?.total || 0
  })

  const hasMorePages = computed(() => {
    return pagination.value?.has_more_pages || false
  })

  const currentPage = computed(() => {
    return pagination.value?.current_page || 1
  })

  const loadProjectsPage = async (page: number = 1, loadMore: boolean = false, status?: string) => {
    isLoading.value = true
    error.value = null

    try {
      // Get missing groups for projects page
      const missingGroups = translationStore.getMissingGroups('projects')

      // Get locale from translation store


      const response = await getProjectsPage({
        groups: missingGroups,
        page: page,
        per_page: 6,
        status: status,
      })

      const data: ProjectsPageResponse = response.data

      if (loadMore) {
        // Append new projects to existing ones
        allProjects.value = [...allProjects.value, ...data.projects]
      } else {
        // Replace projects (for initial load or category change)
        allProjects.value = data.projects
      }

      pagination.value = data.pagination

      // Merge translations into the store instead of local state
      if (data.translations) {
        translationStore.mergeTranslations(data.translations)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load projects page'
      console.error('Failed to load projects page:', err)
    } finally {
      isLoading.value = false
    }
  }

  const loadMoreProjects = async () => {
    if (pagination.value && hasMorePages.value) {
      await loadProjectsPage(currentPage.value + 1, true)
    }
  }

  return {
    allProjects,
    pagination,
    translations,
    totalProjects,
    hasMorePages,
    currentPage,
    isLoading,
    error,
    loadProjectsPage,
    loadMoreProjects,
  }
}
