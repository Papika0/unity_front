import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Polygon } from '@/utils/polygon'
import type { Project } from '@/types'
import type { Building } from '@/types/apartments'
import { adminProjectsApi } from '@/services/adminProjectsApi'
import { adminBuildingsApi } from '@/services/adminBuildingsApi'
import { adminZoneApi, type ZoneResponse } from '@/services/adminZoneApi'
import { compressImage } from '@/utils/image-compression'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'
import { useToast } from '@/composables/useToast'
import { useAutoSave } from '@/composables/useAutoSave'
import { useZoneValidation } from '@/composables/useZoneValidation'
import { useZoneEditorStore } from '@/stores/admin/zoneEditor'

export function useBuildingBlockEditor() {
  const router = useRouter()
  const route = useRoute()
  const { success, error: showError, warning, info } = useToast()
  const { validateZones } = useZoneValidation()
  const zoneStore = useZoneEditorStore()

  // State
  const projects = ref<Project[]>([])
  const buildings = ref<Building[]>([])
  const zones = ref<Polygon[]>([])
  const selectedProjectId = ref<number | string>(
    (Array.isArray(route.params.id) ? route.params.id[0] : route.params.id) || ''
  )
  const selectedProject = computed(() => projects.value.find((p) => p.id === selectedProjectId.value))
  const isLoadingBuildings = ref(false)
  const isSaving = ref(false)
  const hasChanges = ref(false)
  const backgroundImageUrl = ref('')
  const imageWidth = ref(1200)
  const imageHeight = ref(800)

  // Image upload
  const showImageModal = ref(false)
  const fileInput = ref<HTMLInputElement>()
  const previewImageUrl = ref('')
  const previewImageFile = ref<File | null>(null)
  const viewBox = ref('')
  const isUploading = ref(false)

  // Update store when project changes
  watch(selectedProject, (project) => {
    if (project) {
      zoneStore.setProject(project.id, project.title)
    }
  }, { immediate: true })

  // Data Loading
  async function loadProjects() {
    try {
      const response = await adminProjectsApi.getProjects()
      projects.value = response.data.data || []
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  async function loadBuildings() {
    if (!selectedProjectId.value) {
      buildings.value = []
      return
    }

    isLoadingBuildings.value = true
    try {
      const response = await adminBuildingsApi.getAll(Number(selectedProjectId.value))
      buildings.value = response.data.data || response.data
    } catch (error) {
      console.error('Failed to load buildings:', error)
      buildings.value = []
    } finally {
      isLoadingBuildings.value = false
    }
  }

  async function loadZoneImage() {
    if (!selectedProjectId.value) return

    try {
      const response = await adminZoneApi.getZoneImages({
        project_id: selectedProjectId.value,
        level_type: 'overview',
        image_type: 'background',
      })

      const images = response.data.data || response.data
      
      if (images && images.length > 0) {
        const zoneImage = images[0]
        if (zoneImage.images && zoneImage.images.length > 0) {
          const imageData = zoneImage.images[0]
          backgroundImageUrl.value = imageData.full_url || imageData.url
        }

        if (zoneImage.viewbox) {
          const [, , w, h] = zoneImage.viewbox.split(' ').map(Number)
          imageWidth.value = w
          imageHeight.value = h
        }
      }
    } catch (error) {
      console.error('Failed to load zone image:', error)
    }
  }

  async function loadZones() {
    if (!selectedProjectId.value) return

    try {
      await loadZoneImage()

      const response = await adminZoneApi.getZones(selectedProjectId.value, {
        zone_type: 'building_block',
      })

      const data = response.data.data || response.data
      zones.value = (data || []).map((zone: ZoneResponse) => ({
        id: `zone-${zone.id}`,
        points: zone.svg_coordinates.map((coord: number[]) => ({ x: coord[0], y: coord[1] })),
        entityId: zone.entity_id,
        label: zone.display_config.label || `Zone ${zone.id}`,
        fillColor: zone.display_config.fill || '#3b82f680',
        strokeColor: zone.display_config.stroke || '#3b82f6',
        visible: true,
        selected: false,
      }))
    } catch (error) {
      console.error('Failed to load zones:', error)
      zones.value = []
    }
  }

  // Actions
  function goBack() {
    const customBackRoute = zoneStore.getBackRoute()
    router.push(customBackRoute)
  }

  function navigateToFloorEditor(polygon: Polygon) {
    if (!polygon.entityId) {
      warning('შენობა არ არის მითითებული')
      return
    }
    router.push({
      name: 'admin-zones-floor-strips',
      params: {
        id: selectedProjectId.value,
        buildingId: polygon.entityId
      }
    })
  }

  function navigateToBuildingFloors(buildingId: number) {
    router.push({
      name: 'admin-zones-floor-strips',
      params: {
        id: selectedProjectId.value,
        buildingId: buildingId
      }
    })
  }

  // Unsaved Changes
  const {
    showConfirmDialog,
    saveAndNavigate,
    discardAndNavigate,
    cancelNavigation,
    confirmNavigationChange
  } = useUnsavedChanges({
    hasChanges,
    isSaving,
    onSave: async () => {
      await saveZones()
    },
    onDiscard: () => {
      loadZones()
      hasChanges.value = false
    },
    message: 'გაქვთ შეუნახავი ზონები. გსურთ მათი შენახვა?'
  })

  async function handleProjectChange() {
    if (hasChanges.value && !confirmNavigationChange('გაქვთ შეუნახავი ცვლილებები. დარწმუნებული ხართ რომ გსურთ პროექტის შეცვლა?')) {
      return
    }

    if (selectedProjectId.value) {
      router.replace({
        name: 'admin-zones-building-blocks',
        params: { id: selectedProjectId.value.toString() }
      })
    }

    zones.value = []
    backgroundImageUrl.value = ''
    hasChanges.value = false
    await loadBuildings()
    await loadZones()
  }

  function handleZonesChange(updatedZones: Polygon[]) {
    zones.value = updatedZones
    hasChanges.value = true
  }

  async function saveZones() {
    if (!selectedProjectId.value || !hasChanges.value) return

    const validation = validateZones(zones.value, imageWidth.value, imageHeight.value)

    if (!validation.valid) {
      validation.errors.forEach(err => showError(err, 5000))
      return
    }

    if (validation.warnings.length > 0) {
      const proceed = confirm(
        'გაფრთხილებები:\n\n' +
        validation.warnings.join('\n\n') +
        '\n\nგსურთ გაგრძელება?'
      )
      if (!proceed) return
    }

    isSaving.value = true
    try {
      await adminZoneApi.deleteZones(selectedProjectId.value, {
        zone_type: 'building_block',
      })

      for (const zone of zones.value) {
        await adminZoneApi.createZone(selectedProjectId.value, {
          zone_type: 'building_block',
          level_type: 'overview',
          entity_id: zone.entityId ?? null,
          entity_type: 'building',
          building_id: null,
          floor_number: null,
          svg_coordinates: zone.points,
          display_config: {
            label: zone.label,
            fill: zone.fillColor,
            stroke: zone.strokeColor,
            hover: zone.fillColor?.replace('80', 'cc'),
          },
        })
      }

      hasChanges.value = false
      clearDraft()
      success('ზონები წარმატებით შეინახა!')
    } catch (error) {
      console.error('Failed to save zones:', error)
      showError('ზონების შენახვა ვერ მოხერხდა')
    } finally {
      isSaving.value = false
    }
  }

  function handleDiscard() {
    if (confirm('დარწმუნებული ხართ რომ გსურთ ცვლილებების გაუქმება?')) {
      loadZones()
      hasChanges.value = false
      clearDraft()
      info('ცვლილებები გაუქმდა')
    }
  }

  // Auto Save
  const draftKey = computed(() => {
    const pid = Array.isArray(route.params.id)
      ? route.params.id[0]
      : route.params.id || 'new'
    return `zones-draft-building-${pid}`
  })

  const {
    loadDraft,
    clearDraft,
    checkForDraft,
    getLastSavedTime,
    startAutoSave
  } = useAutoSave({
    key: draftKey.value,
    data: zones,
    hasChanges,
    interval: 30000
  })

  // Image Upload Logic
  function openImageUpload() {
    showImageModal.value = true
  }

  function closeImageModal() {
    showImageModal.value = false
    clearPreview()
  }

  function triggerFileInput() {
    fileInput.value?.click()
  }

  function clearPreview() {
    previewImageUrl.value = ''
    previewImageFile.value = null
    viewBox.value = ''
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }

  async function handleFile(file: File) {
    try {
      const compressionResult = await compressImage(file, {
        imageType: 'sitePhoto',
        smartCompression: true,
        maxWidth: 2400,
        maxHeight: 1800,
        quality: 0.85,
        forceDimensions: true,
      })

      const compressedFile = compressionResult.file
      previewImageFile.value = compressedFile

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        previewImageUrl.value = result
        const img = new Image()
        img.onload = () => {
          imageWidth.value = img.width
          imageHeight.value = img.height
          viewBox.value = `0 0 ${img.width} ${img.height}`
        }
        img.src = result
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('Failed to compress image:', error)
      previewImageFile.value = file
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        previewImageUrl.value = result
        const img = new Image()
        img.onload = () => {
          imageWidth.value = img.width
          imageHeight.value = img.height
          viewBox.value = `0 0 ${img.width} ${img.height}`
        }
        img.src = result
      }
      reader.readAsDataURL(file)
    }
  }

  async function uploadImage() {
    if (!previewImageFile.value || !selectedProjectId.value) return
    isUploading.value = true
    try {
      const formData = new FormData()
      formData.append('image', previewImageFile.value)
      formData.append('project_id', String(selectedProjectId.value))
      formData.append('level_type', 'overview')
      formData.append('image_type', 'background')
      formData.append('viewbox', viewBox.value)
      formData.append('width', String(imageWidth.value))
      formData.append('height', String(imageHeight.value))

      const response = await adminZoneApi.uploadZoneImage(formData)

      const zoneImage = response.data.data
      if (zoneImage.images && zoneImage.images.length > 0) {
        const imageData = zoneImage.images[0]
        backgroundImageUrl.value = imageData.full_url || imageData.url
      }
      closeImageModal()
      success('სურათი წარმატებით აიტვირთა!')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      const errorMessage = error.response?.data?.message || 'სურათის ატვირთვა ვერ მოხერხდა'
      showError(errorMessage)
    } finally {
      isUploading.value = false
    }
  }

  function handleFileSelect(file: File) {
    if (file) handleFile(file)
  }

  function handleFileDrop(event: DragEvent) {
    const file = event.dataTransfer?.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  // Lifecycle
  onMounted(async () => {
    await loadProjects()

    if (selectedProjectId.value) {
      const projectExists = projects.value.some(p => p.id == selectedProjectId.value)
      if (!projectExists) {
        showError(`პროექტი ID ${selectedProjectId.value} არ მოიძებნა`)
        router.push('/admin/projects')
        return
      }
      await loadBuildings()
      await loadZones()
    }

    if (selectedProjectId.value && checkForDraft()) {
      const shouldRestore = confirm('აღმოჩენილია შეუნახავი დრაფტი. გსურთ მისი აღდგენა?')
      if (shouldRestore) {
        const draft = loadDraft()
        if (draft) {
          zones.value = draft
          hasChanges.value = true
          info('დრაფტი აღდგენილია')
        }
      } else {
        clearDraft()
      }
    }
    startAutoSave()
  })

  return {
    // State
    projects,
    buildings,
    zones,
    selectedProjectId,
    selectedProject,
    isLoadingBuildings,
    isSaving,
    hasChanges,
    backgroundImageUrl,
    imageWidth,
    imageHeight,
    
    // Image Upload
    showImageModal,
    fileInput,
    previewImageUrl,
    previewImageFile,
    viewBox,
    isUploading,
    
    // Unsaved Changes
    showConfirmDialog,
    saveAndNavigate,
    discardAndNavigate,
    cancelNavigation,
    
    // Actions
    goBack,
    handleDiscard,
    saveZones,
    handleProjectChange,
    handleZonesChange,
    navigateToFloorEditor,
    navigateToBuildingFloors,
    
    // Image Actions
    openImageUpload,
    closeImageModal,
    uploadImage,
    triggerFileInput,
    clearPreview,
    handleFileSelect,
    handleFileDrop,
    
    // Helpers
    getLastSavedTime
  }
}
