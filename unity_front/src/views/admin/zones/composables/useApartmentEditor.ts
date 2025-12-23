
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { Polygon } from '@/utils/polygon'
import type { Building, Apartment } from '@/types/apartments'
import { adminBuildingsApi } from '@/services/adminBuildingsApi'
import { adminApartmentsApi } from '@/services/adminApartmentsApi'
import { adminZoneApi, type ZoneResponse } from '@/services/adminZoneApi'
import { detectApartmentPolygons, type DetectionOptions } from '@/utils/polygon-detection'
import { compressImage } from '@/utils/image-compression'
import { useUnsavedChanges } from '@/composables/ui/useUnsavedChanges'
import { useToast } from '@/composables/ui/useToast'
import { useAutoSave } from '@/composables/ui/useAutoSave'
import { useZoneValidation } from '@/composables/zone/useZoneValidation'
import { useZoneEditorStore } from '@/stores/admin/zoneEditor'

export function useApartmentEditor() {
  // Router
  const router = useRouter()
  const route = useRoute()

  // Route params
  const projectId = ref<number | string>((Array.isArray(route.params.id) ? route.params.id[0] : route.params.id) || '')
  const buildingId = ref<number | string>((Array.isArray(route.params.buildingId) ? route.params.buildingId[0] : route.params.buildingId) || '')
  const floorNumber = ref<number>(parseInt((Array.isArray(route.params.floorNumber) ? route.params.floorNumber[0] : route.params.floorNumber) || '0'))

  // State
  const selectedBuilding = ref<Building | null>(null)
  const apartments = ref<Apartment[]>([])
  const zones = ref<Polygon[]>([])
  const isLoadingApartments = ref(false)
  const isSaving = ref(false)
  const hasChanges = ref(false)
  const backgroundImageUrl = ref('')
  const imageWidth = ref(1200)
  const imageHeight = ref(800)
  const isDetecting = ref(false)

  // Image upload
  const showImageModal = ref(false)
  const fileInput = ref<HTMLInputElement>()
  const previewImageUrl = ref('')
  const previewImageFile = ref<File | null>(null)
  const uploadedImageFile = ref<File | null>(null) // Keep reference to uploaded file for detection
  const viewBox = ref('')
  const isUploading = ref(false)

  // PDF Detection
  const showPdfDetectionModal = ref(false)
  const isPdfDetecting = ref(false)
  const pdfFileInput = ref<HTMLInputElement>()
  const targetImageInput = ref<HTMLInputElement>()
  const pdfFile = ref<File | null>(null)
  const targetImageFile = ref<File | null>(null)

  // Zone Editor Store
  const zoneStore = useZoneEditorStore()

  // Composables
  const { success, error: showError, warning, info } = useToast()
  const { validateZones } = useZoneValidation()

  // Watchers
  watch(selectedBuilding, (building) => {
    if (building) {
      zoneStore.setBuilding(building.id, building.name)
    }
  })

  watch(floorNumber, (floor) => {
    if (floor !== null && floor !== undefined) {
      zoneStore.setFloor(floor)
    }
  }, { immediate: true })

  // Methods
  async function loadBuilding() {
    try {
      const response = await adminBuildingsApi.getOne(Number(projectId.value), Number(buildingId.value))
      selectedBuilding.value = response.data.data || response.data
    } catch (error) {
      console.error('Failed to load building:', error)
    }
  }

  async function loadApartments() {
    if (!buildingId.value) {
      apartments.value = []
      return
    }

    isLoadingApartments.value = true
    try {
      const response = await adminApartmentsApi.getAll(Number(projectId.value), Number(buildingId.value), { floor_number: floorNumber.value })
      apartments.value = response.data.data || response.data
      
      console.log('Loaded apartments for floor', floorNumber.value, ':', apartments.value)
    } catch (error) {
      console.error('Failed to load apartments:', error)
      apartments.value = []
    } finally {
      isLoadingApartments.value = false
    }
  }

  async function loadZoneImage() {
    if (!projectId.value || !buildingId.value) return

    try {
      const response = await adminZoneApi.getZoneImages({
        project_id: projectId.value,
        building_id: buildingId.value,
        level_type: 'floor',
        floor_number: floorNumber.value,
        image_type: 'background',
      })

      const images = response.data.data || response.data
      console.log('Zone images response:', images)
      
      if (images && images.length > 0) {
        const zoneImage = images[0]
        console.log('Selected zone image:', zoneImage)
        
        if (zoneImage.images && zoneImage.images.length > 0) {
          const imageData = zoneImage.images[0]
          backgroundImageUrl.value = imageData.full_url || imageData.url
          console.log('Image URL:', backgroundImageUrl.value)
        }

        if (zoneImage.viewbox) {
          const [, , w, h] = zoneImage.viewbox.split(' ').map(Number)
          imageWidth.value = w
          imageHeight.value = h
          console.log('Image dimensions:', w, 'x', h)
        }
      } else {
        console.log('No zone images found for floor', floorNumber.value)
      }
    } catch (error) {
      console.error('Failed to load zone image:', error)
    }
  }

  async function loadZones() {
    if (!projectId.value || !buildingId.value) return

    try {
      // Load zone image first
      await loadZoneImage()

      // Then load interactive zones
      const response = await adminZoneApi.getZones(projectId.value, {
        zone_type: 'apartment_unit',
        building_id: buildingId.value,
        floor_number: floorNumber.value
      })

      const data = response.data.data || response.data
      console.log('🎯 LoadZones - Raw API response:', data)
      
      zones.value = (data || []).map((zone: ZoneResponse) => ({
        id: `zone-${zone.id}`,
        points: zone.svg_coordinates.map((coord: number[]) => ({ x: coord[0], y: coord[1] })),
        entityId: zone.entity_id,
        label: zone.display_config.label || `Apartment ${zone.entity_id}`,
        fillColor: zone.display_config.fill || '#10b98180',
        strokeColor: zone.display_config.stroke || '#10b981',
        visible: true,
        selected: false,
      }))
      
      console.log('🎯 LoadZones - Mapped zones:', zones.value)
      console.log('🎯 LoadZones - Zone count:', zones.value.length)
    } catch (error) {
      console.error('Failed to load zones:', error)
      zones.value = []
    }
  }

  async function saveZones() {
    if (!projectId.value || !buildingId.value || !hasChanges.value) return

    // Phase 4: Validate zones before saving
    const validation = validateZones(zones.value, imageWidth.value, imageHeight.value)

    if (!validation.valid) {
      validation.errors.forEach(err => showError(err, 5000))
      return
    }

    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warn => warning(warn, 4000))
    }

    isSaving.value = true
    try {
      // Delete all existing zones for this floor
      await adminZoneApi.deleteZones(projectId.value, {
        zone_type: 'apartment_unit',
        building_id: buildingId.value,
        floor_number: floorNumber.value
      })

      // Create new zones
      for (const zone of zones.value) {
        await adminZoneApi.createZone(projectId.value, {
          zone_type: 'apartment_unit',
          level_type: 'floor',
          entity_id: zone.entityId ?? null,
          entity_type: 'apartment',
          building_id: buildingId.value,
          floor_number: floorNumber.value,
          svg_coordinates: zone.points,
          display_config: {
            label: zone.label,
            fill: zone.fillColor,
            stroke: zone.strokeColor,
            hover: zone.fillColor?.replace('80', 'cc'), // Increase opacity on hover
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

  function handleZonesChange(updatedZones: Polygon[]) {
    zones.value = updatedZones
    hasChanges.value = true
  }

  function handleDiscard() {
    loadZones()
    hasChanges.value = false
    clearDraft()
    info('ცვლილებები გაუქმდა')
  }

  function goBack() {
    // Navigation guard will handle unsaved changes
    const customBackRoute = zoneStore.getBackRoute()

    // Use custom back route if user came from Projects page directly
    if (customBackRoute === '/admin/projects') {
      router.push(customBackRoute)
    } else {
      // Default hierarchical: go up to FloorStripEditor
      router.push({
        name: 'admin-zones-floor-strips',
        params: {
          id: projectId.value,
          buildingId: buildingId.value
        }
      })
    }
  }

  // Unsaved Changes & Auto Save
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

  // Draft key computed from route params
  const draftKey = computed(() => {
    const pid = projectId.value || 'new'
    const bid = buildingId.value || 'new'
    const floor = floorNumber.value || '0'
    return `zones-draft-apartment-${pid}-${bid}-${floor}`
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

  // --- Image Upload Logic ---

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
    if (!previewImageFile.value || !projectId.value || !buildingId.value) return

    isUploading.value = true
    try {
      const formData = new FormData()
      formData.append('image', previewImageFile.value)
      formData.append('project_id', String(projectId.value))
      formData.append('building_id', String(buildingId.value))
      formData.append('floor_number', String(floorNumber.value))
      formData.append('level_type', 'floor')
      formData.append('image_type', 'background')
      formData.append('viewbox', viewBox.value)
      formData.append('width', String(imageWidth.value))
      formData.append('height', String(imageHeight.value))

      uploadedImageFile.value = previewImageFile.value

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

  // --- PDF Detection Logic ---

  function openPdfDetectionModal() {
    showPdfDetectionModal.value = true
  }

  function closePdfDetectionModal() {
    showPdfDetectionModal.value = false
    pdfFile.value = null
    targetImageFile.value = null
    if (pdfFileInput.value) {
      pdfFileInput.value.value = ''
    }
    if (targetImageInput.value) {
      targetImageInput.value.value = ''
    }
  }

  function triggerPdfInput() {
    pdfFileInput.value?.click()
  }

  function triggerTargetImageInput() {
    targetImageInput.value?.click()
  }

  function clearPdfFile() {
    pdfFile.value = null
    if (pdfFileInput.value) {
      pdfFileInput.value.value = ''
    }
  }

  function clearTargetImageFile() {
    targetImageFile.value = null
    if (targetImageInput.value) {
      targetImageInput.value.value = ''
    }
  }

  function getColorByStatus(status: string): string {
    switch (status) {
      case 'available':
        return 'rgba(34, 197, 94, 0.5)'
      case 'reserved':
        return 'rgba(234, 179, 8, 0.5)'
      case 'sold':
        return 'rgba(239, 68, 68, 0.5)'
      default:
        return 'rgba(107, 114, 128, 0.5)'
    }
  }

  async function detectApartmentsFromPdf() {
    if (!pdfFile.value) {
      warning('გთხოვთ ატვირთოთ PDF ფაილი')
      return
    }

    isPdfDetecting.value = true

    try {
      const formData = new FormData()
      formData.append('source_pdf', pdfFile.value)
      
      if (targetImageFile.value) {
        try {
          const compressionResult = await compressImage(targetImageFile.value, {
            imageType: 'sitePhoto',
            smartCompression: true,
            maxWidth: 2400,
            maxHeight: 1800,
            quality: 0.85,
            forceDimensions: true,
          })
          formData.append('target_image', compressionResult.file)
        } catch (compressError) {
          console.warn('Image compression failed, using original:', compressError)
          formData.append('target_image', targetImageFile.value)
        }
      }

      const response = await adminZoneApi.detectApartments(formData)

      const result = response.data

      if (!result.success) {
        showError(result.error || 'ბინების გამოვლენა ვერ მოხერხდა')
        return
      }

      if (result.apartment_count === 0) {
        warning('ბინები ვერ მოიძებნა PDF-ში')
        return
      }

      const detectedZones: Polygon[] = result.apartments.map((apt: { id: number; polygon: number[][] }, index: number) => {
        const apartment = apartments.value[index]
        
        return {
          id: `temp-pdf-${Date.now()}-${apt.id}`,
          points: apt.polygon.map((p: number[]) => ({
            x: (p[0] / 100) * imageWidth.value,
            y: (p[1] / 100) * imageHeight.value
          })),
          selected: false,
          entityId: apartment?.id || null,
          label: apartment ? `ბინა ${apartment.apartment_number}` : `ბინა ${index + 1}`,
          fillColor: apartment ? getColorByStatus(apartment.status) : 'rgba(107, 114, 128, 0.5)',
          strokeColor: '#374151',
          visible: true,
        }
      })

      zones.value = detectedZones
      hasChanges.value = true

      closePdfDetectionModal()
      success(`${result.apartment_count} ბინა წარმატებით გამოვლინდა!`)

      if (targetImageFile.value) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          const img = new Image()
          img.onload = () => {
            imageWidth.value = img.width
            imageHeight.value = img.height
            zones.value = zones.value.map(zone => ({
              ...zone,
              points: zone.points.map(p => ({
                x: (p.x / imageWidth.value) * img.width,
                y: (p.y / imageHeight.value) * img.height
              }))
            }))
          }
          img.src = result
        }
        reader.readAsDataURL(targetImageFile.value)
      }

    } catch (error) {
      console.error('PDF detection failed:', error)
      showError('PDF-ით გამოვლენა ვერ მოხერხდა')
    } finally {
      isPdfDetecting.value = false
    }
  }

  // --- Auto Detect Logic ---

  async function autoDetectPolygons() {
    if (!backgroundImageUrl.value) {
      warning('გთხოვთ ჯერ ატვირთოთ სართულის სურათი')
      return
    }

    if (zones.value.length > 0) {
      warning('ავტომატური გამოვლენა ჩაანაცვლებს არსებულ ზონებს')
    }

    isDetecting.value = true

    try {
      let file: File

      if (uploadedImageFile.value) {
        file = uploadedImageFile.value
      } else if (previewImageFile.value) {
        file = previewImageFile.value
      } else {
        let imageUrl = backgroundImageUrl.value
        if (imageUrl.includes('/storage/')) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const _storagePath = imageUrl.split('/storage/')[1]
          imageUrl = imageUrl.replace('/storage/', '/api/storage-proxy/')
        }

        const img = new Image()
        img.crossOrigin = 'anonymous'

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve()
          img.onerror = () => reject(new Error('Failed to load image. Try re-uploading the image.'))
          img.src = imageUrl
        })

        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0)

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png')
        })

        file = new File([blob], 'floor-plan.png', { type: 'image/png' })
      }

      const options: DetectionOptions = {
        minArea: 3000,
        colorTolerance: 20,
        simplifyTolerance: 3.0,
      }

      const detectedPolygons = await detectApartmentPolygons(file, options)

      if (detectedPolygons.length === 0) {
        warning('ბინები ვერ მოიძებნა. სცადეთ სურათის ხელახლა ატვირთვა ან ხელით დახატვა')
        return
      }

      const expectedApartments = apartments.value.length || 10
      const filteredPolygons = detectedPolygons
        .sort((a, b) => b.area - a.area)
        .slice(0, Math.min(expectedApartments + 2, 15))

      const matchedZones: Polygon[] = []
      const unmatchedPolygons: typeof filteredPolygons = []
      const usedApartmentIds = new Set<number>()

      for (const detected of filteredPolygons) {
        const apartment = apartments.value.find(apt => !usedApartmentIds.has(apt.id))

        if (apartment) {
          usedApartmentIds.add(apartment.id)
          matchedZones.push({
            id: `temp-${Date.now()}-${apartment.id}`,
            points: detected.points.map(([x, y]) => ({ x, y })),
            selected: false,
            entityId: apartment.id,
            label: `ბინა ${apartment.apartment_number}`,
            fillColor: '#93c5fd',
            strokeColor: '#60a5fa',
            hoverColor: '#60a5fa',
            visible: true,
          })
        } else {
          unmatchedPolygons.push(detected)
        }
      }

      for (const [index, detected] of unmatchedPolygons.entries()) {
        matchedZones.push({
          id: `temp-${Date.now()}-unmatched-${index}`,
          points: detected.points.map(([x, y]) => ({ x, y })),
          selected: false,
          entityId: null,
          label: `ახალი ${index + 1}`,
          fillColor: '#fca5a5',
          strokeColor: '#ef4444',
          hoverColor: '#ef4444',
          visible: true,
        })
      }

      zones.value = matchedZones
      hasChanges.value = true

      const matchedCount = matchedZones.length - unmatchedPolygons.length
      const unmatchedCount = unmatchedPolygons.length

      if (unmatchedCount > 0) {
        info(`${matchedCount} ბინა დაკავშირდა, ${unmatchedCount} უნდა დაუკავშიროთ ხელით (წითლით)`)
      } else {
        success(`${matchedCount} ბინა აღმოჩნდა და ავტომატურად დაკავშირდა!`)
      }
    } catch (error) {
      console.error('Auto-detection error:', error)
      showError('გამოვლენა ვერ მოხერხდა: ' + (error as Error).message)
    } finally {
      isDetecting.value = false
    }
  }

  // --- Keyboard Shortcuts ---

  function handleKeyboard(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      if (hasChanges.value && !isSaving.value) {
        saveZones()
      }
    }
  }

  // --- Lifecycle ---

  onMounted(async () => {
    await loadBuilding()

    if (!selectedBuilding.value) {
      showError(`შენობა ID ${buildingId.value} არ მოიძებნა`)
      if (projectId.value) {
        router.push({
          name: 'admin-zones-building-blocks',
          params: { id: projectId.value }
        })
      } else {
        router.push('/admin/projects')
      }
      return
    }

    await loadApartments()
    await loadZones()

    if (checkForDraft()) {
      const restored = loadDraft()
      if (restored) {
        zones.value = restored
        hasChanges.value = true
        info(`დრაფტი აღდგა (${getLastSavedTime()})`)
      }
    }

    startAutoSave()
    window.addEventListener('keydown', handleKeyboard)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyboard)
  })

  return {
    // Data
    projectId,
    buildingId,
    floorNumber,
    selectedBuilding,
    apartments,
    zones,
    
    // Status
    isLoadingApartments,
    isSaving,
    hasChanges,
    backgroundImageUrl,
    imageWidth,
    imageHeight,
    isDetecting,
    isUploading,
    isPdfDetecting,
    
    // Modals
    showImageModal,
    showPdfDetectionModal,
    
    // Inputs & References
    fileInput,
    pdfFileInput,
    targetImageInput,
    previewImageUrl,
    previewImageFile,
    uploadedImageFile,
    viewBox,
    pdfFile,
    targetImageFile,
    
    // Unsaved Changes
    showConfirmDialog,
    saveAndNavigate,
    discardAndNavigate,
    cancelNavigation,
    
    // Actions
    goBack,
    saveZones,
    handleDiscard,
    autoDetectPolygons,
    handleZonesChange,
    
    // Modal Actions
    openImageUpload,
    closeImageModal,
    triggerFileInput,
    handleFile,
    uploadImage,
    clearPreview,
    
    openPdfDetectionModal,
    closePdfDetectionModal,
    triggerPdfInput,
    triggerTargetImageInput,
    clearPdfFile,
    clearTargetImageFile,
    detectApartmentsFromPdf,
    
    // File Handlers (helpers to be used in template)
    handleFileSelect: (event: Event) => {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]
      if (file) handleFile(file)
    },
    handleFileDrop: (event: DragEvent) => {
      const file = event.dataTransfer?.files[0]
      if (file && file.type.startsWith('image/')) handleFile(file)
    },
    handlePdfSelect: (event: Event) => {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]
      if (file && file.type === 'application/pdf') pdfFile.value = file
    },
    handlePdfDrop: (event: DragEvent) => {
      const file = event.dataTransfer?.files[0]
      if (file && file.type === 'application/pdf') pdfFile.value = file
    },
    handleTargetImageSelect: (event: Event) => {
      const target = event.target as HTMLInputElement
      const file = target.files?.[0]
      if (file && file.type.startsWith('image/')) targetImageFile.value = file
    },
    handleTargetImageDrop: (event: DragEvent) => {
      const file = event.dataTransfer?.files[0]
      if (file && file.type.startsWith('image/')) targetImageFile.value = file
    }
  }
}
