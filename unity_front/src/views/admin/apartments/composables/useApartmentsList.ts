/**
 * useApartmentsList - Composable for admin apartments list management
 * Handles loading, filtering, pagination, and CRUD operations
 */

import { ref, computed, onMounted, watch } from 'vue'
import { useApartmentsAdminStore } from '@/stores/admin/apartments'
import { useBuildingsAdminStore } from '@/stores/admin/buildings'
import { useAdminProjectsStore } from '@/stores/admin/projects'
import type { Apartment, Building, ApartmentStatus } from '@/types/apartments'
import type { Project } from '@/types'

export function useApartmentsList() {
  // ============================================
  // STORES
  // ============================================
  const apartmentsStore = useApartmentsAdminStore()
  const buildingsStore = useBuildingsAdminStore()
  const projectsStore = useAdminProjectsStore()

  // ============================================
  // STATE
  // ============================================
  const selectedProjectId = ref<number | null>(null)
  const selectedBuildingId = ref<number | null>(null)
  const filterStatus = ref<string | null>(null)
  const searchQuery = ref('')
  const currentPage = ref(1)
  const showFormModal = ref(false)
  const showImportModal = ref(false)
  const selectedApartment = ref<Apartment | null>(null)
  const projects = ref<Project[]>([])
  const buildings = ref<Building[]>([])

  const totalPages = computed(() => apartmentsStore.pagination.last_page)

  // ============================================
  // ACTIONS
  // ============================================
  const loadProjects = async () => {
    try {
      await projectsStore.loadProjects()
      projects.value = projectsStore.projects
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const onProjectChange = async () => {
    selectedBuildingId.value = null
    buildings.value = []

    if (!selectedProjectId.value) return

    try {
      await buildingsStore.fetchBuildings(selectedProjectId.value)
      buildings.value = buildingsStore.buildings

      // Auto-select building if only one exists
      if (buildings.value.length === 1) {
        selectedBuildingId.value = buildings.value[0].id
      }
    } catch (error) {
      console.error('Failed to load buildings:', error)
    }

    loadApartments()
  }

  const loadApartments = async () => {
    if (!selectedProjectId.value) return

    if (!selectedBuildingId.value) {
      apartmentsStore.apartments = []
      return
    }

    try {
      await apartmentsStore.fetchApartments(
        selectedProjectId.value,
        selectedBuildingId.value,
        {
          status: (filterStatus.value as ApartmentStatus) || undefined,
          page: currentPage.value,
        }
      )
    } catch (error) {
      console.error('Failed to load apartments:', error)
    }
  }

  const openCreateModal = () => {
    if (!selectedProjectId.value) {
      alert('გთხოვთ პირველ აირჩიოთ პროექტი')
      return
    }
    selectedApartment.value = null
    showFormModal.value = true
  }

  const editApartment = (apartment: Apartment) => {
    selectedApartment.value = apartment
    showFormModal.value = true
  }

  const closeFormModal = () => {
    showFormModal.value = false
    selectedApartment.value = null
  }

  const handleSaved = () => {
    closeFormModal()
    loadApartments()
  }

  const handleImported = () => {
    showImportModal.value = false
    loadApartments()
  }

  const deleteApartment = async (apartment: Apartment) => {
    if (!confirm(`დარწმუნებული ხართ, რომ გსურთ ბინის "${apartment.apartment_number}" წაშლა?`)) {
      return
    }

    try {
      await apartmentsStore.deleteApartment(apartment.id)
      alert('ბინა წარმატებით წაიშალა')
      loadApartments()
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string }
      alert('შეცდომა: ' + (apiError.response?.data?.message || apiError.message))
    }
  }

  // ============================================
  // HELPERS
  // ============================================
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700'
      case 'reserved': return 'bg-amber-100 text-amber-700'
      case 'sold': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'ხელმისაწვდომი'
      case 'reserved': return 'დაჯავშნილი'
      case 'sold': return 'გაყიდული'
      default: return status
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ka-GE', {
      style: 'currency',
      currency: 'GEL',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // ============================================
  // WATCHERS
  // ============================================
  watch(currentPage, () => {
    loadApartments()
  })

  // ============================================
  // LIFECYCLE
  // ============================================
  onMounted(() => {
    loadProjects()
  })

  // ============================================
  // RETURN
  // ============================================
  return {
    // Stores
    apartmentsStore,

    // State
    selectedProjectId,
    selectedBuildingId,
    filterStatus,
    searchQuery,
    currentPage,
    showFormModal,
    showImportModal,
    selectedApartment,
    projects,
    buildings,
    totalPages,

    // Actions
    onProjectChange,
    loadApartments,
    openCreateModal,
    editApartment,
    closeFormModal,
    handleSaved,
    handleImported,
    deleteApartment,

    // Helpers
    getStatusClass,
    getStatusLabel,
    formatPrice,
  }
}
