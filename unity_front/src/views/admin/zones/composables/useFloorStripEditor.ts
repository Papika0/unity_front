
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Polygon } from '@/utils/polygon'
import type { Project } from '@/types'
import type { Building } from '@/types/apartments'
import { pointsToBackendFormat } from '@/utils/polygon'
import { adminProjectsApi } from '@/services/adminProjectsApi'
import { adminBuildingsApi } from '@/services/adminBuildingsApi'
import { adminZoneApi, type ZoneResponse } from '@/services/adminZoneApi'
import { compressImage } from '@/utils/image-compression'
import { useUnsavedChanges } from '@/composables/ui/useUnsavedChanges'
import { useToast } from '@/composables/ui/useToast'
import { useAutoSave } from '@/composables/ui/useAutoSave'
import { useZoneValidation } from '@/composables/zone/useZoneValidation'
import { useZoneEditorStore } from '@/stores/admin/zoneEditor'

export function useFloorStripEditor() {
  // Router
  const router = useRouter()
  const route = useRoute()

  // State
  const projects = ref<Project[]>([])
  const buildings = ref<Building[]>([])
  const zones = ref<Polygon[]>([])
  const selectedProjectId = ref<number | string>((Array.isArray(route.params.id) ? route.params.id[0] : route.params.id) || '')
  const selectedBuildingId = ref<number | string>((Array.isArray(route.params.buildingId) ? route.params.buildingId[0] : route.params.buildingId) || '')
  const selectedBuilding = computed(() =>
    buildings.value.find((b) => b.id === selectedBuildingId.value)
  )
  const isSaving = ref(false)
  const hasChanges = ref(false)
  const backgroundImageUrl = ref('')
  const imageWidth = ref(1200)
  const imageHeight = ref(800)

  // Smart wizard data
  const showWizard = ref(false)
  const smartWizardData = ref({
    startFloor: 1,
    count: 10,
    verticalSpacing: 90,
    direction: 'up' as 'up' | 'down',
  })

  // Image upload
  const showImageModal = ref(false)
  const fileInput = ref<HTMLInputElement>()
  const previewImageUrl = ref('')
  const previewImageFile = ref<File | null>(null)
  const viewBox = ref('')
  const isUploading = ref(false)

  // Zone Editor Store
  const zoneStore = useZoneEditorStore()

  // Composables
  const { success, error: showError, warning, info } = useToast()
  const { validateZones } = useZoneValidation()

  // Watchers
  watch([selectedProjectId, projects], () => {
    if (selectedProjectId.value && projects.value.length > 0) {
      const project = projects.value.find(p => p.id == selectedProjectId.value)
      if (project) {
        zoneStore.setProject(project.id, project.title)
      }
    }
  })

  watch(selectedBuilding, (building) => {
    if (building) {
      zoneStore.setBuilding(building.id, building.name)
    }
  })

  // Methods
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

    try {
      const response = await adminBuildingsApi.getAll(Number(selectedProjectId.value))
      buildings.value = response.data.data || response.data
    } catch (error) {
      console.error('Failed to load buildings:', error)
      buildings.value = []
    }
  }

  async function loadZoneImage() {
    if (!selectedProjectId.value || !selectedBuildingId.value) return

    try {
      const response = await adminZoneApi.getZoneImages({
        project_id: selectedProjectId.value,
        building_id: selectedBuildingId.value,
        level_type: 'building',
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
    if (!selectedProjectId.value || !selectedBuildingId.value) return

    try {
      await loadZoneImage()

      const response = await adminZoneApi.getZones(selectedProjectId.value, {
        zone_type: 'floor_strip',
        building_id: selectedBuildingId.value,
      })

      const data = response.data.data || response.data
      zones.value = (data || []).map((zone: ZoneResponse) => ({
        id: `zone-${zone.id}`,
        points: zone.svg_coordinates.map((coord: number[]) => ({ x: coord[0], y: coord[1] })),
        entityId: zone.entity_id,
        label: zone.display_config.label || `Floor ${zone.entity_id}`,
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

  async function saveZones() {
    if (!selectedProjectId.value || !selectedBuildingId.value || !hasChanges.value) {
      return
    }

    const validation = validateZones(zones.value, imageWidth.value, imageHeight.value)

    if (!validation.valid) {
      const errorMessage = validation.errors.join('\n\n')
      alert('❌ შენახვა შეუძლებელია:\n\n' + errorMessage)
      validation.errors.forEach(err => showError(err, 5000))
      return
    }

    if (validation.warnings.length > 0) {
      const proceed = confirm(
        'გაფრთხილებები:\n\n' +
        validation.warnings.join('\n\n') +
        '\n\nგსურთ გაგრძელება?'
      )
      if (!proceed) {
        return
      }
    }

    isSaving.value = true
    try {
      await adminZoneApi.deleteZones(selectedProjectId.value, {
        zone_type: 'floor_strip',
        building_id: selectedBuildingId.value,
      })

      for (const zone of zones.value) {
        await adminZoneApi.createZone(selectedProjectId.value, {
          zone_type: 'floor_strip',
          level_type: 'building',
          entity_id: zone.entityId ?? null,
          entity_type: 'floor',
          building_id: selectedBuildingId.value,
          floor_number: null,
          svg_coordinates: pointsToBackendFormat(zone.points),
          display_config: {
            label: zone.label,
            fill: zone.fillColor,
            stroke: zone.strokeColor,
          },
        })
      }

      hasChanges.value = false
      clearDraft()
      success('ზონები წარმატებით შეინახა!')
      await loadZones()
    } catch (error) {
      console.error('Failed to save zones:', error)
      showError('ზონების შენახვა ვერ მოხერხდა')
    } finally {
      isSaving.value = false
    }
  }

  function handleZonesChange(updatedZones: Polygon[]) {
    zones.value = updatedZones
    hasChanges.value = true
  }

  function handleDiscard() {
    if (confirm('დარწმუნებული ხართ რომ გსურთ ცვლილებების გაუქმება?')) {
      loadZones()
      hasChanges.value = false
      clearDraft()
      info('ცვლილებები გაუქმდა')
    }
  }

  function goBack() {
    const customBackRoute = zoneStore.getBackRoute()

    if (customBackRoute === '/admin/projects') {
      router.push(customBackRoute)
    } else {
      // If only one building, going back to building blocks would auto-redirect loop back here
      // So we go back to project list instead
      if (buildings.value.length === 1) {
        router.push('/admin/projects')
      } else {
        router.push({
          name: 'admin-zones-building-blocks',
          params: { id: selectedProjectId.value }
        })
      }
    }
  }

  async function handleProjectChange() {
    zones.value = []
    backgroundImageUrl.value = ''
    hasChanges.value = false
    selectedBuildingId.value = ''
    await loadBuildings()
  }

  async function handleBuildingChange() {
    zones.value = []
    backgroundImageUrl.value = ''
    hasChanges.value = false
    await loadZones()
  }

  function goToApartmentEditor(floorNumber: number | null | undefined) {
    if (!floorNumber && floorNumber !== 0) {
      warning('სართული არ არის მითითებული')
      return
    }
    
    router.push({
      name: 'admin-zones-apartments',
      params: {
        id: selectedProjectId.value,
        buildingId: selectedBuildingId.value,
        floorNumber: floorNumber
      }
    })
  }

  // Smart Wizard Logic
  const selectedZone = computed(() => zones.value.find(z => z.selected))
  const isSmartWizardValid = computed(() => {
    return (
      smartWizardData.value.count > 0 &&
      smartWizardData.value.count <= 100 &&
      selectedZone.value !== undefined
    )
  })

  function openSmartGenerateWizard() {
    const selected = zones.value.find(z => z.selected)
    if (!selected) {
      warning('გთხოვთ პირველ აირჩიოთ ზონა შაბლონად!')
      return
    }
    
    if (selected.entityId !== null && selected.entityId !== undefined) {
      smartWizardData.value.startFloor = selected.entityId
    }
    
    showWizard.value = true
  }

  function closeWizard() {
    showWizard.value = false
  }

  function generateFromSelected() {
    const template = zones.value.find(z => z.selected)
    if (!template) {
      showError('შაბლონი არ მოიძებნა!')
      return
    }

    const { startFloor, count, verticalSpacing, direction } = smartWizardData.value
    const generated: Polygon[] = []
    const offset = direction === 'up' ? -verticalSpacing : verticalSpacing

    for (let i = 0; i < count; i++) {
      const floorNumber = startFloor + i
      const yOffset = offset * i

      const newPoints = template.points.map(point => ({
        x: point.x,
        y: point.y + yOffset
      }))

      generated.push({
        id: `floor-${floorNumber}-${Date.now()}-${i}`,
        points: newPoints,
        entityId: floorNumber,
        label: `სართული ${floorNumber}`,
        fillColor: template.fillColor,
        strokeColor: template.strokeColor,
        visible: true,
        selected: false,
      })
    }

    zones.value = [...zones.value, ...generated]
    hasChanges.value = true
    closeWizard()
  }

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
    if (!previewImageFile.value || !selectedProjectId.value || !selectedBuildingId.value) return

    isUploading.value = true
    try {
      const formData = new FormData()
      formData.append('image', previewImageFile.value)
      formData.append('project_id', String(selectedProjectId.value))
      formData.append('building_id', String(selectedBuildingId.value))
      formData.append('level_type', 'building')
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
    } catch (error) {
      console.error('Failed to upload image:', error)
      showError('სურათის ატვირთვა ვერ მოხერხდა')
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
      const project = projects.value.find(p => p.id == selectedProjectId.value)
      if (!project) {
        showError(`პროექტი ID ${selectedProjectId.value} არ მოიძებნა`)
        router.push('/admin/projects')
        return
      }

      await loadBuildings()

      if (selectedBuildingId.value) {
        const buildingExists = buildings.value.some(b => b.id == selectedBuildingId.value)
        if (!buildingExists) {
          showError(`შენობა ID ${selectedBuildingId.value} არ მოიძებნა`)
          router.push({
            name: 'admin-zones-building-blocks',
            params: { id: selectedProjectId.value }
          })
          return
        }

        await loadZones()
      }
    }

    if (selectedProjectId.value && selectedBuildingId.value && checkForDraft()) {
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

  // Unsaved Changes
  const {
    showConfirmDialog,
    saveAndNavigate,
    discardAndNavigate,
    cancelNavigation
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

  // Auto Save
  const draftKey = computed(() => {
    const pid = selectedProjectId.value || 'new'
    const bid = selectedBuildingId.value || 'new'
    return `zones-draft-floor-${pid}-${bid}`
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

  // Sorted zones for sidebar
  const sortedZones = computed(() => {
    return [...zones.value].sort((a, b) => {
      const aFloor = a.entityId || 0
      const bFloor = b.entityId || 0
      return aFloor - bFloor
    })
  })

  // Floor entities for dropdown
  const floorEntities = computed(() => {
    const floors = []
    for (let i = -5; i <= 50; i++) {
        floors.push({ 
        id: i, 
        name: i < 0 ? `სარდაფი ${Math.abs(i)}` : `სართული ${i}`,
        label: i < 0 ? `სარდაფი ${Math.abs(i)}` : `სართული ${i}`
      })
    }
    return floors
  })

  return {
    // State
    projects,
    buildings,
    zones,
    selectedProjectId,
    selectedBuildingId,
    selectedBuilding,
    isSaving,
    hasChanges,
    backgroundImageUrl,
    imageWidth,
    imageHeight,
    
    // UI Logic
    sortedZones,
    floorEntities,
    
    // Smart Wizard
    showWizard,
    smartWizardData,
    isSmartWizardValid,
    selectedZone,
    
    // Image Upload
    showImageModal,
    isUploading,
    previewImageUrl,
    previewImageFile,
    viewBox,
    fileInput,
    
    // Unsaved Changes
    showConfirmDialog,
    saveAndNavigate,
    discardAndNavigate,
    cancelNavigation,
    
    // Draft
    getLastSavedTime,
    
    // Actions
    goBack,
    handleDiscard,
    saveZones,
    handleProjectChange,
    handleBuildingChange,
    handleZonesChange,
    goToApartmentEditor,
    
    // Wizard Actions
    openSmartGenerateWizard,
    closeWizard,
    generateFromSelected,
    
    // Image Upload Actions
    openImageUpload,
    closeImageModal,
    uploadImage,
    triggerFileInput,
    clearPreview,
    handleFileSelect,
    handleFileDrop
  }
}
