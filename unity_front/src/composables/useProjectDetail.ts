import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslations } from './useTranslations'
import { useLocaleStore } from '@/stores/ui/locale'
import { useTranslationsStore } from '@/stores/ui/translations'
import { projectsApi } from '@/services/projectsApi'
import type { ProjectApiResponse } from '@/services/projectsApi'
import type { ProjectFeature } from '@/services/featuresApi'
import type { BuildingZone, FloorZone } from '@/types/apartments'

export function useProjectDetail() {
  const router = useRouter()
  const { t } = useTranslations()
  const localeStore = useLocaleStore()
  const translationsStore = useTranslationsStore()

  // State
  const project = ref<ProjectApiResponse | null>(null)
  const isLoading = ref(true)
  const error = ref<string | null>(null)
  const selectedImageIndex = ref(0)
  const isFullscreenGallery = ref(false)
  const projectFeatures = ref<ProjectFeature[]>([])
  
  // Inline apartment viewer state
  const selectedBuilding = ref<BuildingZone | null>(null)
  const selectedFloor = ref<FloorZone | null>(null)

  // Compiled Data
  const relatedProjects = computed(() => project.value?.related_projects || [])
  const hasApartmentNavigation = computed(() => project.value?.hasApartmentNavigation === true)

  const statusText = computed(() => {
    if (!project.value) return ''
    switch (project.value.status) {
      case 'completed': return t('projects.status.completed')
      case 'ongoing': return t('projects.status.ongoing')
      case 'planning': return t('projects.status.planning')
      default: return project.value.status
    }
  })

  // Methods
  const loadProjectData = async (projectId: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await projectsApi.getById(projectId, localeStore.currentLocale)

      if ('translations' in response && response.translations) {
        translationsStore.mergeTranslations(response.translations as Record<string, string>)
      }

      project.value = ('data' in response ? response.data : response) as ProjectApiResponse
      projectFeatures.value = project.value?.features || []

      window.scrollTo({ top: 0, behavior: 'smooth' })
      await new Promise(resolve => setTimeout(resolve, 100))
    } catch {
      error.value = 'Failed to load project'
      router.push('/projects')
    } finally {
      isLoading.value = false
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600 text-white border border-green-300 shadow-lg'
      case 'ongoing': return 'bg-amber-600 text-white border border-amber-300 shadow-lg'
      case 'planning': return 'bg-gray-600 text-white border border-gray-300 shadow-lg'
      default: return 'bg-zinc-600 text-white border border-zinc-300 shadow-lg'
    }
  }

  const selectImage = (index: number) => {
    selectedImageIndex.value = index
  }

  const openFullscreenGallery = () => {
    isFullscreenGallery.value = true
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeydown)
  }

  const closeFullscreenGallery = () => {
    isFullscreenGallery.value = false
    document.body.style.overflow = 'auto'
    document.removeEventListener('keydown', handleKeydown)
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') closeFullscreenGallery()
    else if (event.key === 'ArrowLeft') prevImage()
    else if (event.key === 'ArrowRight') nextImage()
  }

  const nextImage = () => {
    if (project.value?.gallery_images) {
      selectedImageIndex.value = (selectedImageIndex.value + 1) % project.value.gallery_images.length
    }
  }

  const prevImage = () => {
    if (project.value?.gallery_images) {
      selectedImageIndex.value = selectedImageIndex.value === 0
        ? project.value.gallery_images.length - 1
        : selectedImageIndex.value - 1
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('projects.not_specified')
    const date = new Date(dateString)

    if (localeStore.currentLocale === 'ka') {
      const georgianMonths = [
        'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
        'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'
      ]
      return `${georgianMonths[date.getMonth()]} ${date.getFullYear()}`
    }

    const localeMap: Record<string, string> = { 'en': 'en-US', 'ru': 'ru-RU' }
    const locale = localeMap[localeStore.currentLocale] || 'en-US'

    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long' })
  }

  const formatDescription = (description: string) => {
    if (!description) return ''
    const paragraphs = description.split(/\r\n\s*\r\n/).filter((p) => p.trim())

    return paragraphs
      .map((paragraph) => {
        const trimmed = paragraph.trim()
        if (trimmed.includes('*')) {
          const lines = trimmed.split(/\r\n/).filter((line) => line.trim())
          const listItems = lines
            .filter((line) => line.trim().startsWith('*'))
            .map((line) => `<li class="mb-3 text-zinc-700 leading-relaxed">${line.replace(/^\*\s*/, '')}</li>`)
            .join('')
          if (listItems) return `<ul class="custom-list my-6">${listItems}</ul>`
        }
        return `<p class="mb-6 text-zinc-700 leading-relaxed">${trimmed.replace(/\r\n/g, '<br>')}</p>`
      })
      .join('')
  }
  
  const handleBuildingSelected = (building: BuildingZone) => {
    selectedBuilding.value = building
    selectedFloor.value = null
    router.replace({ query: { building: building.building_identifier } })
  }

  const handleBuildingDeselected = () => {
    selectedBuilding.value = null
    selectedFloor.value = null
    router.replace({ query: {} })
  }

  const handleFloorSelected = (floor: FloorZone) => {
    selectedFloor.value = floor
  }

  const handleFloorDeselected = () => {
    selectedFloor.value = null
  }

  return {
    project,
    isLoading,
    error,
    selectedImageIndex,
    isFullscreenGallery,
    projectFeatures,
    selectedBuilding,
    selectedFloor,
    relatedProjects,
    hasApartmentNavigation,
    statusText,
    localeStore,
    
    // Methods
    loadProjectData,
    getStatusColor,
    selectImage,
    openFullscreenGallery,
    closeFullscreenGallery,
    nextImage,
    prevImage,
    formatDate,
    formatDescription,
    handleBuildingSelected,
    handleBuildingDeselected,
    handleFloorSelected,
    handleFloorDeselected
  }
}
