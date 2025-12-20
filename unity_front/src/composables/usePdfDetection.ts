/**
 * PDF Detection Composable
 * Handles PDF-based apartment detection for zone editors
 */

import { ref } from 'vue'
import { adminZoneApi } from '@/services/adminZoneApi'
import { compressImage } from '@/utils/image-compression'
import { useToast } from '@/composables/useToast'
import type { Polygon } from '@/utils/polygon'

export interface PDFDetectionResult {
  success: boolean
  zones: Polygon[]
  count: number
}

interface DetectedApartment {
  id: number
  polygon: number[][]
}

export function usePdfDetection() {
  const { success, warning, error: showError } = useToast()

  // State
  const showPdfDetectionModal = ref(false)
  const isPdfDetecting = ref(false)
  const pdfFileInput = ref<HTMLInputElement>()
  const targetImageInput = ref<HTMLInputElement>()
  const pdfFile = ref<File | null>(null)
  const targetImageFile = ref<File | null>(null)

  // ==================== MODAL CONTROL ====================
  const openPdfDetectionModal = () => { showPdfDetectionModal.value = true }
  const closePdfDetectionModal = () => {
    showPdfDetectionModal.value = false
    pdfFile.value = null
    targetImageFile.value = null
    if (pdfFileInput.value) pdfFileInput.value.value = ''
    if (targetImageInput.value) targetImageInput.value.value = ''
  }

  const triggerPdfInput = () => { pdfFileInput.value?.click() }
  const triggerTargetImageInput = () => { targetImageInput.value?.click() }

  // ==================== FILE HANDLING ====================
  const handlePdfSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file && file.type === 'application/pdf') pdfFile.value = file
  }

  const handlePdfDrop = (event: DragEvent) => {
    const file = event.dataTransfer?.files[0]
    if (file && file.type === 'application/pdf') pdfFile.value = file
  }

  const clearPdfFile = () => {
    pdfFile.value = null
    if (pdfFileInput.value) pdfFileInput.value.value = ''
  }

  const handleTargetImageSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file && file.type.startsWith('image/')) targetImageFile.value = file
  }

  const handleTargetImageDrop = (event: DragEvent) => {
    const file = event.dataTransfer?.files[0]
    if (file && file.type.startsWith('image/')) targetImageFile.value = file
  }

  const clearTargetImageFile = () => {
    targetImageFile.value = null
    if (targetImageInput.value) targetImageInput.value.value = ''
  }

  // ==================== DETECTION ====================
  const detectApartmentsFromPdf = async (
    imageWidth: number,
    imageHeight: number,
    apartments: Array<{ id: number; apartment_number: string; status: string }>,
    getColorByStatus: (status: string) => string
  ): Promise<PDFDetectionResult> => {
    if (!pdfFile.value) {
      warning('გთხოვთ ატვირთოთ PDF ფაილი')
      return { success: false, zones: [], count: 0 }
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
        } catch {
          formData.append('target_image', targetImageFile.value)
        }
      }

      const response = await adminZoneApi.detectApartments(formData)

      const result = response.data

      if (!result.success) {
        showError(result.error || 'ბინების გამოვლენა ვერ მოხერხდა')
        return { success: false, zones: [], count: 0 }
      }

      if (result.apartment_count === 0) {
        warning('ბინები ვერ მოიძებნა PDF-ში')
        return { success: false, zones: [], count: 0 }
      }

      const detectedZones: Polygon[] = result.apartments.map((apt: DetectedApartment, index: number) => {
        const apartment = apartments[index]
        return {
          id: `temp-pdf-${Date.now()}-${apt.id}`,
          points: apt.polygon.map((p: number[]) => ({
            x: (p[0] / 100) * imageWidth,
            y: (p[1] / 100) * imageHeight
          })),
          selected: false,
          entityId: apartment?.id || null, // Ensure valid value
          label: apartment ? `ბინა ${apartment.apartment_number}` : `ბინა ${index + 1}`,
          fillColor: apartment ? getColorByStatus(apartment.status) : 'rgba(107, 114, 128, 0.5)',
          strokeColor: '#374151',
          visible: true,
        }
      })

      closePdfDetectionModal()
      success(`${result.apartment_count} ბინა წარმატებით გამოვლინდა!`)

      return { success: true, zones: detectedZones, count: result.apartment_count }
    } catch (error) {
      console.error('PDF detection failed:', error)
      showError('PDF-ით გამოვლენა ვერ მოხერხდა')
      return { success: false, zones: [], count: 0 }
    } finally {
      isPdfDetecting.value = false
    }
  }

  // ==================== RETURN ====================
  return {
    // State
    showPdfDetectionModal,
    isPdfDetecting,
    pdfFileInput,
    targetImageInput,
    pdfFile,
    targetImageFile,
    // Actions
    openPdfDetectionModal,
    closePdfDetectionModal,
    triggerPdfInput,
    triggerTargetImageInput,
    handlePdfSelect,
    handlePdfDrop,
    clearPdfFile,
    handleTargetImageSelect,
    handleTargetImageDrop,
    clearTargetImageFile,
    detectApartmentsFromPdf,
  }
}
