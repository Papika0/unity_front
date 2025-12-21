<template>
  <div class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
          @click="$emit('back')"
          class="p-2 hover:bg-gray-100 rounded transition-colors"
          :title="t('admin.common.back')"
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
          <h1 class="text-2xl font-bold text-gray-900">{{ t('admin.zones.apartment_editor.title') }}</h1>
          <p class="text-sm text-gray-500 mt-1">
            {{ getBuildingName() }} - {{ t('admin.apartments.form.floor') }} {{ floorNumber }} - {{ t('admin.zones.draw_polygon') }}
          </p>
        </div>
        <ZoneEditorBreadcrumbs class="ml-4" />
      </div>

      <div class="flex items-center space-x-3">
        <!-- Unsaved Changes Badge -->
        <div v-if="hasChanges" class="flex items-center space-x-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-lg border border-amber-200">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <span class="text-sm font-medium">{{ t('admin.zones.editor_common.unsaved_changes') }}</span>
        </div>

        <!-- Discard Button -->
        <button
          v-if="hasChanges"
          @click="$emit('discard')"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors flex items-center space-x-2"
          :title="t('admin.common.cancel')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <span class="hidden md:inline">{{ t('admin.common.cancel') }}</span>
        </button>

        <button
          @click="$emit('autoDetect')"
          :disabled="!backgroundImageUrl || isDetecting"
          class="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          :title="t('admin.zones.apartment_editor.auto_detect')"
        >
          <svg v-if="!isDetecting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="hidden md:inline">{{ isDetecting ? t('admin.common.detecting') : t('admin.zones.apartment_editor.auto_detect') }}</span>
        </button>
        <button
          @click="$emit('openPdfModal')"
          :disabled="isPdfDetecting"
          class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          :title="t('admin.zones.apartment_editor.pdf_detection')"
        >
          <svg v-if="!isPdfDetecting" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <svg v-else class="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="hidden md:inline">{{ isPdfDetecting ? t('admin.common.detecting') : t('admin.zones.apartment_editor.pdf_detection') }}</span>
        </button>
        <button
          @click="$emit('openImageUpload')"
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
          <span class="hidden md:inline">{{ t('admin.zones.editor_common.image_upload') }}</span>
        </button>
        <button
          @click="$emit('save')"
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
          <span class="hidden md:inline">{{ isSaving ? t('admin.common.saving') : t('admin.common.save') }}</span>
        </button>

        <span class="hidden lg:inline text-xs text-gray-400 ml-2">Ctrl+S</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Building } from '@/types/apartments'
import ZoneEditorBreadcrumbs from '@/components/admin/ZoneEditorBreadcrumbs.vue'
import { useTranslations } from '@/composables/i18n/useTranslations'

const { t, currentLocale } = useTranslations()

const props = defineProps<{
  selectedBuilding: Building | null
  floorNumber: number
  hasChanges: boolean
  isDetecting: boolean
  isPdfDetecting: boolean
  backgroundImageUrl: string
  isSaving: boolean
}>()

defineEmits<{
  (e: 'back'): void
  (e: 'discard'): void
  (e: 'autoDetect'): void
  (e: 'openPdfModal'): void
  (e: 'openImageUpload'): void
  (e: 'save'): void
}>()

function getBuildingName(): string {
  if (!props.selectedBuilding) return t('admin.zones.building_block_editor.building')
  const name = props.selectedBuilding.name
  if (typeof name === 'object' && name !== null) {
    const nameObj = name as unknown as Record<string, string>
    return nameObj[currentLocale] || nameObj.ka || nameObj.en || '#' + props.selectedBuilding.id
  }
  return name as string
}
</script>
