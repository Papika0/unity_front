<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <!-- Header -->
    <ApartmentEditorToolbar
      :selected-building="selectedBuilding"
      :floor-number="floorNumber"
      :has-changes="hasChanges"
      :is-pdf-detecting="isPdfDetecting"
      :background-image-url="backgroundImageUrl"
      :is-saving="isSaving"
      @back="goBack"
      @discard="handleDiscard"
      @open-pdf-modal="openPdfDetectionModal"
      @open-image-upload="openImageUpload"
      @save="saveZones"
      :is-single-building="isSingleBuilding"
    />

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :show="showConfirmDialog"
      :title="t('admin.zones.editor_common.unsaved_changes')"
      :message="t('admin.zones.editor_common.unsaved_changes_msg')"
      :confirm-text="t('admin.zones.editor_common.save_and_exit')"
      :destructive-text="t('admin.zones.editor_common.discard_and_exit')"
      :cancel-text="t('admin.zones.editor_common.stay')"
      :is-saving="isSaving"
      @confirm="saveAndNavigate"
      @destructive="discardAndNavigate"
      @cancel="cancelNavigation"
    />

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <ApartmentEditorSidebar
        :selected-building="selectedBuilding"
        :floor-number="floorNumber"
        :apartments="apartments"
        :is-loading-apartments="isLoadingApartments"
      />

      <!-- Polygon Editor -->
      <div class="flex-1">
        <PolygonEditor
          v-if="backgroundImageUrl"
          ref="editorRef"
          :background-image="backgroundImageUrl"
          :image-width="imageWidth"
          :image-height="imageHeight"
          :initial-polygons="zones"
          :entities="apartments"
          :entity-label="t('admin.zones.apartment_editor.apartment')"
          @change="handleZonesChange"
        />
        <div
          v-else
          class="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 via-white to-emerald-50"
        >
          <div class="text-center max-w-md px-6">
            <div class="relative inline-block">
              <div class="absolute inset-0 bg-emerald-100 rounded-full blur-2xl opacity-30"></div>
              <svg
                class="relative mx-auto h-32 w-32 text-emerald-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 class="mt-6 text-xl font-semibold text-gray-900">
              {{ t('admin.zones.apartment_editor.not_uploaded') }}
            </h3>
            <p class="mt-3 text-sm text-gray-600 leading-relaxed">
              {{ t('admin.zones.apartment_editor.upload_instruction') }}
            </p>
            <button
              @click="openImageUpload"
              class="mt-8 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span class="font-medium">{{ t('admin.zones.editor_common.image_upload') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Upload Modal -->
    <ApartmentEditorImageModal
      :show="showImageModal"
      :preview-image-url="previewImageUrl"
      :preview-image-file="previewImageFile"
      :is-uploading="isUploading"
      :view-box="viewBox"
      @close="closeImageModal"
      @upload="uploadImage"
      @file-selected="handleFile"
      @clear-preview="clearPreview"
    />

    <!-- PDF Detection Modal -->
    <ApartmentEditorPdfModal
      :show="showPdfDetectionModal"
      :pdf-file="pdfFile"
      :target-image-file="targetImageFile"
      :is-pdf-detecting="isPdfDetecting"
      @close="closePdfDetectionModal"
      @detect="detectApartmentsFromPdf"
      @pdf-selected="(f) => pdfFile = f"
      @target-image-selected="(f) => targetImageFile = f"
      @clear-pdf="clearPdfFile"
      @clear-target-image="clearTargetImageFile"
    />
  </div>
</template>

<script setup lang="ts">
import PolygonEditor from '@/components/admin/PolygonEditor.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import ApartmentEditorToolbar from './components/apartment-editor/ApartmentEditorToolbar.vue'
import ApartmentEditorSidebar from './components/apartment-editor/ApartmentEditorSidebar.vue'
import ApartmentEditorImageModal from './components/apartment-editor/ApartmentEditorImageModal.vue'
import ApartmentEditorPdfModal from './components/apartment-editor/ApartmentEditorPdfModal.vue'
import { useApartmentEditor } from './composables/useApartmentEditor'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()

const {
  // State
  selectedBuilding,
  floorNumber,
  apartments,
  zones,
  isLoadingApartments,
  isSaving,
  hasChanges,
  backgroundImageUrl,
  imageWidth,
  imageHeight,
  isPdfDetecting,
  isUploading,
  isSingleBuilding,

  // Modals state
  showImageModal,
  showPdfDetectionModal,

  // File logic state
  previewImageUrl,
  previewImageFile,
  viewBox,
  pdfFile,
  targetImageFile,

  // Actions
  goBack,
  saveZones,
  handleDiscard,
  handleZonesChange,
  
  // Modal actions
  openImageUpload,
  closeImageModal,
  uploadImage,
  clearPreview,
  openPdfDetectionModal,
  closePdfDetectionModal,
  detectApartmentsFromPdf,
  handleFile,
  clearPdfFile,
  clearTargetImageFile,

  // Unsaved changes actions
  showConfirmDialog,
  saveAndNavigate,
  discardAndNavigate,
  cancelNavigation
} = useApartmentEditor()
</script>
