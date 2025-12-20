/**
 * Image Upload Composable
 * Handles image upload with preview and compression for zone editors
 */

import { ref } from 'vue'
import { compressImage } from '@/utils/image-compression'
import { adminZoneApi } from '@/services/adminZoneApi'
import { useToast } from '@/composables/useToast'

export interface ImageUploadOptions {
  projectId: number | string
  buildingId: number | string
  floorNumber: number
  levelType?: string
  imageType?: string
}

export function useImageUpload() {
  const { success, error: showError } = useToast()

  // State
  const showImageModal = ref(false)
  const fileInput = ref<HTMLInputElement>()
  const previewImageUrl = ref('')
  const previewImageFile = ref<File | null>(null)
  const uploadedImageFile = ref<File | null>(null)
  const viewBox = ref('')
  const isUploading = ref(false)
  const imageWidth = ref(1200)
  const imageHeight = ref(800)

  // ==================== MODAL CONTROL ====================
  const openImageUpload = () => { showImageModal.value = true }
  const closeImageModal = () => { showImageModal.value = false; clearPreview() }
  const triggerFileInput = () => { fileInput.value?.click() }

  // ==================== FILE HANDLING ====================
  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) handleFile(file)
  }

  const handleFileDrop = (event: DragEvent) => {
    const file = event.dataTransfer?.files[0]
    if (file && file.type.startsWith('image/')) handleFile(file)
  }

  const handleFile = async (file: File) => {
    try {
      const compressionResult = await compressImage(file, {
        imageType: 'sitePhoto',
        smartCompression: true,
        maxWidth: 2400,
        maxHeight: 1800,
        quality: 0.85,
        forceDimensions: true,
      })
      previewImageFile.value = compressionResult.file
      loadImagePreview(compressionResult.file)
    } catch (error) {
      console.error('Failed to compress image:', error)
      previewImageFile.value = file
      loadImagePreview(file)
    }
  }

  const loadImagePreview = (file: File) => {
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

  const clearPreview = () => {
    previewImageUrl.value = ''
    previewImageFile.value = null
    viewBox.value = ''
    if (fileInput.value) fileInput.value.value = ''
  }

  // ==================== UPLOAD ====================
  const uploadImage = async (options: ImageUploadOptions): Promise<string | null> => {
    if (!previewImageFile.value) return null

    isUploading.value = true
    try {
      const formData = new FormData()
      formData.append('image', previewImageFile.value)
      formData.append('project_id', String(options.projectId))
      formData.append('building_id', String(options.buildingId))
      formData.append('floor_number', String(options.floorNumber))
      formData.append('level_type', options.levelType || 'floor')
      formData.append('image_type', options.imageType || 'background')
      formData.append('viewbox', viewBox.value)
      formData.append('width', String(imageWidth.value))
      formData.append('height', String(imageHeight.value))

      uploadedImageFile.value = previewImageFile.value

      const response = await adminZoneApi.uploadZoneImage(formData)

      const zoneImage = response.data.data
      let imageUrl = ''
      if (zoneImage.images && zoneImage.images.length > 0) {
        imageUrl = zoneImage.images[0].full_url || zoneImage.images[0].url
      }

      closeImageModal()
      success('სურათი წარმატებით აიტვირთა!')
      return imageUrl
    } catch (error) {
      console.error('Failed to upload image:', error)
      showError('სურათის ატვირთვა ვერ მოხერხდა')
      return null
    } finally {
      isUploading.value = false
    }
  }

  // ==================== RETURN ====================
  return {
    // State
    showImageModal,
    fileInput,
    previewImageUrl,
    previewImageFile,
    uploadedImageFile,
    viewBox,
    isUploading,
    imageWidth,
    imageHeight,
    // Actions
    openImageUpload,
    closeImageModal,
    triggerFileInput,
    handleFileSelect,
    handleFileDrop,
    handleFile,
    clearPreview,
    uploadImage,
  }
}
