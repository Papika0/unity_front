<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="goBack"
            class="p-2 hover:bg-gray-100 rounded transition-colors"
            title="უკან დაბრუნება"
          >
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">სართულების ზონების რედაქტორი</h1>
            <p class="text-sm text-gray-500 mt-1">
              {{ selectedBuilding?.name || 'შენობა' }} - სართულების ზონები
            </p>
          </div>
          <ZoneEditorBreadcrumbs class="ml-4" />
        </div>

        <div class="flex items-center space-x-3">
          <!-- Phase 2: Unsaved Changes Badge -->
          <Transition name="fade">
            <div
              v-if="hasChanges && !isSaving"
              class="px-3 py-1 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-lg text-sm font-medium flex items-center space-x-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>შეუნახავი ცვლილებები</span>
            </div>
          </Transition>

          <!-- Phase 3: Last Draft Saved Indicator -->
          <div v-if="getLastSavedTime()" class="text-xs text-gray-500 flex items-center space-x-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>ბოლო დრაფტი: {{ getLastSavedTime() }}</span>
          </div>

          <!-- Phase 4: Keyboard Shortcut Hint -->
          <div class="text-xs text-gray-500 hidden lg:flex items-center space-x-1">
            <kbd class="px-1.5 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">Ctrl+S</kbd>
            <span>შენახვა</span>
          </div>

          <button
            @click="openSmartGenerateWizard"
            :disabled="!selectedZone"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            :title="selectedZone ? 'მონიშნული ზონიდან გენერაცია' : 'აირჩიეთ ზონა გენერაციისთვის'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span class="hidden md:inline">გენერაცია</span>
          </button>
          <button
            @click="openImageUpload"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span class="hidden md:inline">სურათი</span>
          </button>

          <!-- Phase 2: Discard Changes Button -->
          <button
            @click="handleDiscard"
            :disabled="!hasChanges || isSaving"
            class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            title="ცვლილებების გაუქმება და ბოლო შენახული მდგომარეობის აღდგენა"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="hidden md:inline">გაუქმება</span>
          </button>

          <button
            @click="saveZones"
            :disabled="!hasChanges || isSaving"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <svg
              v-if="!isSaving"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5 animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span class="hidden md:inline">{{ isSaving ? 'შენახვა...' : 'შენახვა' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Sidebar -->
      <div class="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">პროექტი</h3>
          <select
            v-model="selectedProjectId"
            @change="handleProjectChange"
            class="w-full border-gray-300 rounded text-sm mb-3 text-gray-900"
          >
            <option value="">აირჩიეთ პროექტი</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.title }}
            </option>
          </select>

          <h3 class="text-sm font-semibold text-gray-700 mb-3 mt-4">შენობა</h3>
          <select
            v-model="selectedBuildingId"
            @change="handleBuildingChange"
            :disabled="!selectedProjectId"
            class="w-full border-gray-300 rounded text-sm text-gray-900"
          >
            <option value="">აირჩიეთ შენობა</option>
            <option v-for="building in buildings" :key="building.id" :value="building.id">
              {{ building.name }}
            </option>
          </select>
        </div>

        <!-- Floor List -->
        <div v-if="selectedBuildingId" class="flex-1 overflow-y-auto p-3">
          <h3 class="text-xs font-semibold text-gray-700 uppercase mb-2">სართულები</h3>
          <div v-if="zones.length === 0" class="text-sm text-gray-500 py-4 text-center">
            სართულები არ არის დახატული
          </div>
          <div v-else class="space-y-1">
            <div
              v-for="zone in sortedZones"
              :key="zone.id"
              class="p-2 rounded bg-gray-50 hover:bg-purple-100 transition-colors cursor-pointer group"
              :class="{ 'bg-blue-50 ring-1 ring-blue-300': zone.selected }"
              @click="goToApartmentEditor(zone.entityId)"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-700 group-hover:text-purple-700">{{ zone.label }}</div>
                  <div class="text-xs text-gray-500">სართული {{ zone.entityId }}</div>
                </div>
                <svg class="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="p-4 border-t border-gray-200 bg-gray-50">
          <h4 class="text-xs font-semibold text-gray-700 uppercase mb-2">ინსტრუქციები</h4>
          <ol class="text-xs text-gray-600 space-y-1 list-decimal list-inside">
            <li>აირჩიეთ პროექტი და შენობა</li>
            <li>ატვირთეთ სართულების გეგმა</li>
            <li>დახატეთ პირველი სართულის ზონა</li>
            <li>აირჩიეთ ზონა და გამოიყენეთ "ზონიდან გენერაცია"</li>
            <li>შეინახეთ ცვლილებები</li>
          </ol>
        </div>
      </div>

      <!-- Polygon Editor -->
      <div class="flex-1">
        <PolygonEditor
          v-if="selectedBuildingId && backgroundImageUrl"
          ref="editorRef"
          :background-image="backgroundImageUrl"
          :image-width="imageWidth"
          :image-height="imageHeight"
          :initial-polygons="zones"
          :entities="floorEntities"
          entity-label="სართული"
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
              {{ selectedBuildingId ? 'სართულების გეგმა არ არის ატვირთული' : 'აირჩიეთ შენობა' }}
            </h3>
            <p class="mt-2 text-sm text-gray-500">
              {{
                selectedBuildingId
                  ? 'დაწკაპეთ "სურათის ატვირთვა" ღილაკზე სართულების გეგმის ასატვირთად'
                  : 'შენობის არჩევის შემდეგ შეძლებთ სართულების ზონების დახატვას'
              }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Smart Generate Wizard Modal -->
    <div
      v-if="showWizard"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeWizard"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">სართულების გენერაცია</h2>
              <p class="text-sm text-gray-500 mt-1">მონიშნული ზონის საფუძველზე</p>
            </div>
            <button @click="closeWizard" class="p-2 hover:bg-gray-100 rounded transition-colors">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-4">
          <!-- Selected zone preview -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div class="flex items-center space-x-2">
              <div
                class="w-4 h-4 rounded border-2"
                :style="{ 
                  backgroundColor: selectedZone?.fillColor || '#3b82f680', 
                  borderColor: selectedZone?.strokeColor || '#3b82f6' 
                }"
              />
              <div>
                <p class="text-sm font-medium text-blue-900">
                  შაბლონი: {{ selectedZone?.label || 'არჩეული ზონა' }}
                </p>
                <p class="text-xs text-blue-700">
                  {{ selectedZone?.points?.length || 0 }} წერტილი
                </p>
              </div>
            </div>
          </div>

          <!-- Generation settings -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                საწყისი სართული
                <span class="text-xs text-gray-500">(ამ ზონისთვის)</span>
              </label>
              <input
                v-model.number="smartWizardData.startFloor"
                type="number"
                class="w-full border-gray-300 rounded text-gray-900"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                რაოდენობა
                <span class="text-xs text-gray-500">(მათ შორის საწყისი)</span>
              </label>
              <input
                v-model.number="smartWizardData.count"
                type="number"
                class="w-full border-gray-300 rounded text-gray-900"
                min="1"
                max="100"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              ვერტიკალური ინტერვალი (px)
            </label>
            <input
              v-model.number="smartWizardData.verticalSpacing"
              type="number"
              class="w-full border-gray-300 rounded text-gray-900"
              min="0"
            />
            <p class="text-xs text-gray-500 mt-1">
              მანძილი სართულებს შორის (ზემოთ ან ქვემოთ)
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">მიმართულება</label>
            <div class="flex space-x-2">
              <button
                @click="smartWizardData.direction = 'up'"
                class="flex-1 px-4 py-2 rounded-lg border-2 transition-colors"
                :class="smartWizardData.direction === 'up' 
                  ? 'bg-purple-50 border-purple-500 text-purple-700' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'"
              >
                <svg class="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
                <span class="text-sm font-medium">ზემოთ</span>
              </button>
              <button
                @click="smartWizardData.direction = 'down'"
                class="flex-1 px-4 py-2 rounded-lg border-2 transition-colors"
                :class="smartWizardData.direction === 'down' 
                  ? 'bg-purple-50 border-purple-500 text-purple-700' 
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'"
              >
                <svg class="w-5 h-5 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                <span class="text-sm font-medium">ქვემოთ</span>
              </button>
            </div>
          </div>

          <!-- Preview info -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-3">
            <p class="text-sm text-green-700">
              <strong>გენერირდება:</strong> {{ smartWizardData.count }} სართული
              <br/>
              <strong>ნომრები:</strong> 
              {{ smartWizardData.startFloor }} - 
              {{ smartWizardData.startFloor + smartWizardData.count - 1 }}
            </p>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            @click="closeWizard"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            გაუქმება
          </button>
          <button
            @click="generateFromSelected"
            :disabled="!isSmartWizardValid"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            გენერაცია
          </button>
        </div>
      </div>
    </div>

    <!-- Image Upload Modal (same as BuildingBlockEditor) -->
    <div
      v-if="showImageModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="closeImageModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">სართულების გეგმის ატვირთვა</h2>
            <button @click="closeImageModal" class="p-2 hover:bg-gray-100 rounded transition-colors">
              <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">სურათის ფაილი</label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer"
              @drop.prevent="handleFileDrop"
              @dragover.prevent
              @click="triggerFileInput"
            >
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />
              <svg
                class="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p class="mt-2 text-sm text-gray-600">
                <span class="font-medium text-indigo-600">დააჭირეთ ატვირთვისთვის</span>
                ან გადმოიტანეთ ფაილი
              </p>
              <p class="text-xs text-gray-500 mt-1">PNG, JPG, WebP - მაქს. 10MB</p>
            </div>

            <div v-if="previewImageUrl" class="mt-4">
              <img :src="previewImageUrl" alt="Preview" class="w-full rounded-lg border border-gray-300" />
              <div class="mt-2 flex items-center justify-between text-sm text-gray-600">
                <span>{{ previewImageFile?.name }}</span>
                <button @click="clearPreview" class="text-red-600 hover:text-red-700">წაშლა</button>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ViewBox (ავტომატური განსაზღვრა)
            </label>
            <input
              v-model="viewBox"
              type="text"
              readonly
              class="w-full border-gray-300 rounded bg-gray-50 text-sm text-gray-900"
              placeholder="0 0 1200 800"
            />
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            @click="closeImageModal"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            გაუქმება
          </button>
          <button
            @click="uploadImage"
            :disabled="!previewImageFile || isUploading"
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {{ isUploading ? 'ატვირთვა...' : 'ატვირთვა' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Phase 1: Confirmation Dialog for Unsaved Changes -->
    <ConfirmDialog
      :show="showConfirmDialog"
      title="შეუნახავი ცვლილებები"
      message="გაქვთ შეუნახავი ზონები. გსურთ მათი შენახვა?"
      confirmText="შენახვა და გასვლა"
      destructiveText="გაუქმება და გასვლა"
      cancelText="დარჩენა"
      :isLoading="isSaving"
      @confirm="saveAndNavigate"
      @destructive="discardAndNavigate"
      @cancel="cancelNavigation"
    />
  </div>
</template>

<style scoped>
/* Fade transition for unsaved changes badge */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PolygonEditor from '@/components/admin/PolygonEditor.vue'
import ConfirmDialog from '@/components/admin/ConfirmDialog.vue'
import ZoneEditorBreadcrumbs from '@/components/admin/ZoneEditorBreadcrumbs.vue'
import type { Polygon } from '@/utils/polygon'
import type { Project } from '@/types'
import type { Building } from '@/types/apartments'
import { pointsToBackendFormat } from '@/utils/polygon'
import api from '@/plugins/axios/api'
import { compressImage } from '@/utils/imageCompression'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'
import { useToast } from '@/composables/useToast'
import { useAutoSave } from '@/composables/useAutoSave'
import { useZoneValidation } from '@/composables/useZoneValidation'
import { useZoneEditorStore } from '@/stores/admin/zoneEditor'

interface ZoneResponse {
  id: number
  svg_coordinates: number[][]
  entity_id: number | null
  entity_type: string
  display_config: {
    label?: string
    fill?: string
    stroke?: string
    hover?: string
  }
}

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

const selectedZone = computed(() => zones.value.find(z => z.selected))

const isSmartWizardValid = computed(() => {
  return (
    smartWizardData.value.count > 0 &&
    smartWizardData.value.count <= 100 &&
    selectedZone.value !== undefined
  )
})

// Image upload
const showImageModal = ref(false)
const fileInput = ref<HTMLInputElement>()
const previewImageUrl = ref('')
const previewImageFile = ref<File | null>(null)
const viewBox = ref('')
const isUploading = ref(false)

// Editor ref
const editorRef = ref<InstanceType<typeof PolygonEditor>>()

// Zone Editor Store
const zoneStore = useZoneEditorStore()

// Update store when project or building changes
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

// Floor entities (for dropdown)
const floorEntities = computed(() => {
  const floors = []
  // Generate a reasonable range of floors (-5 to 50)
  // User can adjust these ranges if needed
  for (let i = -5; i <= 50; i++) {
    floors.push({ 
      id: i, 
      name: i < 0 ? `სარდაფი ${Math.abs(i)}` : `სართული ${i}`,
      label: i < 0 ? `სარდაფი ${Math.abs(i)}` : `სართული ${i}`
    })
  }
  return floors
})

// Sorted zones
const sortedZones = computed(() => {
  return [...zones.value].sort((a, b) => {
    const aFloor = a.entityId || 0
    const bFloor = b.entityId || 0
    return aFloor - bFloor
  })
})

// Composables
const { success, error: showError, warning, info } = useToast()
const { validateZones } = useZoneValidation()

// Phase 1: Unsaved Changes Protection
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

// Phase 3: Auto-Save & Draft Recovery
// Draft key computed from route params (source of truth)
const draftKey = computed(() => {
  const pid = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id || 'new'
  const bid = Array.isArray(route.params.buildingId) ? route.params.buildingId[0] : route.params.buildingId || 'new'
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

// Methods
function goBack() {
  // Navigation guard will handle unsaved changes
  const customBackRoute = zoneStore.getBackRoute()

  // Use custom back route if user came from Projects page directly
  if (customBackRoute === '/admin/projects') {
    router.push(customBackRoute)
  } else {
    // Default hierarchical: go up to BuildingBlockEditor
    router.push({
      name: 'admin-zones-building-blocks',
      params: { id: selectedProjectId.value }
    })
  }
}

async function loadProjects() {
  try {
    const response = await api.get('/admin/projects')
    projects.value = response.data.data || response.data
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
    const response = await api.get(`/admin/projects/${selectedProjectId.value}/buildings`)
    buildings.value = response.data.data || response.data
  } catch (error) {
    console.error('Failed to load buildings:', error)
    buildings.value = []
  }
}

async function loadZones() {
  if (!selectedProjectId.value || !selectedBuildingId.value) return

  try {
    // Load zone image first
    await loadZoneImage()

    // Then load interactive zones
    const response = await api.get(
      `/admin/projects/${selectedProjectId.value}/interactive-zones`,
      {
        params: {
          zone_type: 'floor_strip',
          building_id: selectedBuildingId.value,
        },
      }
    )

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

async function loadZoneImage() {
  if (!selectedProjectId.value || !selectedBuildingId.value) return

  try {
    const response = await api.get('/admin/zone-images', {
      params: {
        project_id: selectedProjectId.value,
        building_id: selectedBuildingId.value,
        level_type: 'building',
        image_type: 'background',
      },
    })

    const images = response.data.data || response.data
    console.log('Zone images response:', images)
    
    if (images && images.length > 0) {
      // Get the LATEST zone image (first in array, sorted by created_at desc)
      const zoneImage = images[0]
      console.log('Selected zone image:', zoneImage)
      
      // Get the image URL from the images relationship
      if (zoneImage.images && zoneImage.images.length > 0) {
        const imageData = zoneImage.images[0]
        
        // Use full_url from backend (includes proper storage path)
        backgroundImageUrl.value = imageData.full_url || imageData.url
        
        console.log('Image data:', imageData)
        console.log('Image URL:', backgroundImageUrl.value)
      }

      // Set dimensions from viewbox
      if (zoneImage.viewbox) {
        const [, , w, h] = zoneImage.viewbox.split(' ').map(Number)
        imageWidth.value = w
        imageHeight.value = h
        console.log('Image dimensions:', w, 'x', h)
      }
    } else {
      console.log('No zone images found')
    }
  } catch (error) {
    console.error('Failed to load zone image:', error)
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

function handleZonesChange(updatedZones: Polygon[]) {
  zones.value = updatedZones
  hasChanges.value = true
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

async function saveZones() {
  if (!selectedProjectId.value || !selectedBuildingId.value || !hasChanges.value) return

  // Phase 4: Validate zones before saving
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
    // Delete existing floor strip zones for this building
    await api.delete(`/admin/projects/${selectedProjectId.value}/interactive-zones`, {
      params: {
        zone_type: 'floor_strip',
        building_id: selectedBuildingId.value,
      },
    })

    // Create new zones
    for (const zone of zones.value) {
      await api.post(`/admin/projects/${selectedProjectId.value}/interactive-zones`, {
        zone_type: 'floor_strip',
        level_type: 'building',
        entity_id: zone.entityId,
        entity_type: 'floor',
        building_id: selectedBuildingId.value,
        svg_coordinates: pointsToBackendFormat(zone.points),
        display_config: {
          label: zone.label,
          fill: zone.fillColor,
          stroke: zone.strokeColor,
        },
      })
    }

    hasChanges.value = false
    clearDraft() // Clear auto-save draft after successful save
    success('ზონები წარმატებით შეინახა!')
    await loadZones() // Reload zones to get IDs
  } catch (error) {
    console.error('Failed to save zones:', error)
    showError('ზონების შენახვა ვერ მოხერხდა')
  } finally {
    isSaving.value = false
  }
}

// Phase 2: Discard changes function
function handleDiscard() {
  if (confirm('დარწმუნებული ხართ რომ გსურთ ცვლილებების გაუქმება?')) {
    loadZones()
    hasChanges.value = false
    clearDraft()
    info('ცვლილებები გაუქმდა')
  }
}

// Smart wizard methods
function openSmartGenerateWizard() {
  const selected = zones.value.find(z => z.selected)
  if (!selected) {
    warning('გთხოვთ პირველ აირჩიოთ ზონა შაბლონად!')
    return
  }
  
  // Set initial values based on selected zone
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

  // Calculate vertical offset direction
  const offset = direction === 'up' ? -verticalSpacing : verticalSpacing

  // Generate zones by cloning and offsetting the template
  for (let i = 0; i < count; i++) {
    const floorNumber = startFloor + i
    const yOffset = offset * i

    // Clone the template points and apply vertical offset
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

  // Add generated zones to existing ones
  zones.value = [...zones.value, ...generated]
  hasChanges.value = true
  closeWizard()
}

// Image upload methods
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

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handleFile(file)
  }
}

function handleFileDrop(event: DragEvent) {
  const file = event.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    handleFile(file)
  }
}

async function handleFile(file: File) {
  try {
    // Compress the image to ensure it's under the 2MB PHP upload limit
    const compressionResult = await compressImage(file, {
      imageType: 'sitePhoto',
      smartCompression: true,
      maxWidth: 2400,
      maxHeight: 1800,
      quality: 0.85,
      forceDimensions: true,
    })

    // Use the compressed file
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
    // Fall back to original file if compression fails
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

function clearPreview() {
  previewImageUrl.value = ''
  previewImageFile.value = null
  viewBox.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
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

    const response = await api.post('/admin/zone-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // Extract image URL from response
    const zoneImage = response.data.data
    if (zoneImage.images && zoneImage.images.length > 0) {
      const imageData = zoneImage.images[0]
      
      // Use full_url from backend (includes proper storage path)
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

// Phase 4: Keyboard shortcuts
function handleKeyDown(event: KeyboardEvent) {
  // Ctrl+S or Cmd+S to save
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault()
    if (hasChanges.value && !isSaving.value) {
      saveZones()
    }
  }
}

// Lifecycle
onMounted(async () => {
  await loadProjects()

  // Validate project ID exists
  if (selectedProjectId.value) {
    const project = projects.value.find(p => p.id == selectedProjectId.value)
    if (!project) {
      showError(`პროექტი ID ${selectedProjectId.value} არ მოიძებნა`)
      router.push('/admin/projects')
      return
    }

    await loadBuildings()

    // Validate building ID exists (use loose equality for string/number comparison)
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

  // Phase 3: Check for draft on mount
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

  // Start auto-save
  startAutoSave()

  // Add keyboard shortcuts
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>
