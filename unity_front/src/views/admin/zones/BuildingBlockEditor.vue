<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <!-- Header -->
    <BuildingBlockEditorToolbar
      :selected-project="selectedProject"
      :has-changes="hasChanges"
      :is-saving="isSaving"
      :last-saved-time="getLastSavedTime()"
      @back="goBack"
      @save="saveZones"
      @discard="handleDiscard"
      @open-image="openImageUpload"
    />

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Project Selector Sidebar -->
      <BuildingBlockEditorSidebar
        v-model:selected-project-id="selectedProjectId"
        :projects="projects"
        :buildings="buildings"
        :is-loading-buildings="isLoadingBuildings"
        @project-change="handleProjectChange"
        @select-building="navigateToBuildingFloors"
      />

      <!-- Polygon Editor -->
      <div class="flex-1">
        <PolygonEditor
          v-if="selectedProjectId && backgroundImageUrl"
          :background-image="backgroundImageUrl"
          :image-width="imageWidth"
          :image-height="imageHeight"
          :initial-polygons="zones"
          :entities="buildings"
          :entity-label="t('admin.zones.building_block_editor.building')"
          @change="handleZonesChange"
          @polygon-click="navigateToFloorEditor"
        />
        <div
          v-else
          class="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 via-white to-indigo-50"
        >
          <div class="text-center max-w-md px-6">
            <div class="relative inline-block">
              <div class="absolute inset-0 bg-indigo-100 rounded-full blur-2xl opacity-30"></div>
              <svg
                class="relative mx-auto h-32 w-32 text-indigo-300"
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
              {{ selectedProjectId ? t('admin.zones.building_block_editor.not_uploaded') : t('admin.zones.building_block_editor.select_project_instruction') }}
            </h3>
            <p class="mt-3 text-sm text-gray-600 leading-relaxed">
              {{
                selectedProjectId
                  ? t('admin.zones.building_block_editor.upload_instruction')
                  : t('admin.zones.building_block_editor.select_project_instruction_desc')
              }}
            </p>
            <button
              v-if="selectedProjectId"
              @click="openImageUpload"
              class="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 mx-auto"
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
    <BuildingBlockEditorImageModal
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
import BuildingBlockEditorToolbar from './components/building-block-editor/BuildingBlockEditorToolbar.vue'
import BuildingBlockEditorSidebar from './components/building-block-editor/BuildingBlockEditorSidebar.vue'
import BuildingBlockEditorImageModal from './components/building-block-editor/BuildingBlockEditorImageModal.vue'
import { useBuildingBlockEditor } from './composables/useBuildingBlockEditor'
import { useTranslations } from '@/composables/useTranslations'

const { t } = useTranslations()

const {
  // State
  projects,
  buildings,
  zones,
  selectedProjectId,
  selectedProject,
  isLoadingBuildings,
  isSaving, // Important for toolbar state
  hasChanges, // Important for toolbar state
  backgroundImageUrl,
  imageWidth,
  imageHeight,
  
  // Image Upload State
  showImageModal,
  previewImageUrl,
  previewImageFile,
  viewBox,
  isUploading,
  
  // Unsaved Changes State
  showConfirmDialog,

  // Methods
  getLastSavedTime,
  goBack,
  saveZones,
  handleDiscard,
  handleProjectChange,
  handleZonesChange,
  navigateToFloorEditor,
  navigateToBuildingFloors,
  
  openImageUpload,
  closeImageModal,
  uploadImage,
  clearPreview,
  handleFileSelect,
  
  saveAndNavigate,
  discardAndNavigate,
  cancelNavigation
} = useBuildingBlockEditor()
</script>
