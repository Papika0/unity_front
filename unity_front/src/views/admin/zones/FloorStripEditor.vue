<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <!-- Header -->
    <FloorStripEditorToolbar
      :selected-building="selectedBuilding"
      :has-changes="hasChanges"
      :is-saving="isSaving"
      :last-saved-time="getLastSavedTime()"
      :has-selected-zone="!!selectedZone"
      @back="goBack"
      @save="saveZones"
      @discard="handleDiscard"
      @open-wizard="openSmartGenerateWizard"
      @open-image="openImageUpload"
      :is-single-building="buildings.length === 1"
    />

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <FloorStripEditorSidebar
        v-model:selected-project-id="selectedProjectId"
        v-model:selected-building-id="selectedBuildingId"
        :projects="projects"
        :buildings="buildings"
        :zones="zones"
        :sorted-zones="sortedZones"
        @project-change="handleProjectChange"
        @building-change="handleBuildingChange"
        @select-zone="goToApartmentEditor"
      />

      <!-- Polygon Editor -->
      <div class="flex-1">
        <PolygonEditor
          v-if="selectedBuildingId && backgroundImageUrl"
          :background-image="backgroundImageUrl"
          :image-width="imageWidth"
          :image-height="imageHeight"
          :initial-polygons="zones"
          :entities="floorEntities"
          :entity-label="t('admin.zones.floor_strip_editor.floor')"
          @change="handleZonesChange"
        />
        <div v-else class="flex items-center justify-center h-full bg-gray-50">
          <div class="text-center max-w-md">
            <svg
              class="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 class="mt-4 text-lg font-medium text-gray-900">
              {{ selectedBuildingId ? t('admin.zones.floor_strip_editor.not_uploaded') : t('admin.zones.floor_strip_editor.select_building') }}
            </h3>
            <p class="mt-2 text-sm text-gray-500">
              {{
                selectedBuildingId
                  ? t('admin.zones.floor_strip_editor.upload_instruction')
                  : t('admin.zones.floor_strip_editor.select_building_instruction')
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Smart Generate Wizard Modal -->
    <FloorStripEditorWizard
      :show="showWizard"
      v-model:smart-wizard-data="smartWizardData"
      :selected-zone="selectedZone"
      :is-valid="isSmartWizardValid"
      @close="closeWizard"
      @generate="generateFromSelected"
    />

    <!-- Image Upload Modal -->
    <FloorStripEditorImageModal
      :show="showImageModal"
      :preview-image-url="previewImageUrl"
      :preview-image-file="previewImageFile"
      :view-box="viewBox"
      :is-uploading="isUploading"
      @close="closeImageModal"
      @upload="uploadImage"
      @file-selected="handleFileSelect"
      @clear-preview="clearPreview"
    />

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :show="showConfirmDialog"
      :title="t('admin.zones.editor_common.unsaved_changes')"
      :message="t('admin.zones.editor_common.unsaved_changes_msg')"
      :confirm-text="t('admin.zones.editor_common.save_and_exit')"
      :destructive-text="t('admin.zones.editor_common.discard_and_exit')"
      :cancel-text="t('admin.zones.editor_common.stay')"
      :is-loading="isSaving"
      @confirm="saveAndNavigate"
      @destructive="discardAndNavigate"
      @cancel="cancelNavigation"
    />
  </div>
</template>

<script setup lang="ts">
import PolygonEditor from '@/components/admin/PolygonEditor.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import FloorStripEditorToolbar from './components/floor-strip-editor/FloorStripEditorToolbar.vue'
import FloorStripEditorSidebar from './components/floor-strip-editor/FloorStripEditorSidebar.vue'
import FloorStripEditorWizard from './components/floor-strip-editor/FloorStripEditorWizard.vue'
import FloorStripEditorImageModal from './components/floor-strip-editor/FloorStripEditorImageModal.vue'
import { useFloorStripEditor } from './composables/useFloorStripEditor'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t } = useTranslations()

// Initialize composable
const {
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
  
  // UI Data
  sortedZones,
  floorEntities,
  
  // Wizard State
  showWizard,
  smartWizardData,
  selectedZone,
  isSmartWizardValid,
  
  // Image Modal State
  showImageModal,
  previewImageUrl,
  previewImageFile,
  viewBox,
  isUploading,
  
  // Confirmation Dialog
  showConfirmDialog,
  
  // Methods
  getLastSavedTime,
  goBack,
  saveZones,
  handleDiscard,
  handleProjectChange,
  handleBuildingChange,
  goToApartmentEditor,
  handleZonesChange,
  
  openSmartGenerateWizard,
  closeWizard,
  generateFromSelected,
  
  openImageUpload,
  closeImageModal,
  uploadImage,
  clearPreview,
  handleFileSelect,
  
  saveAndNavigate,
  discardAndNavigate,
  cancelNavigation
} = useFloorStripEditor()
</script>
