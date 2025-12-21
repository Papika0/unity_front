<template>
  <div class="w-64 bg-white border-r border-gray-200 flex flex-col">
    <!-- Filters -->
    <div class="p-4 border-b border-gray-200">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">{{ t('admin.sidebar.projects') }}</h3>
      <select
        :value="selectedProjectId"
        @change="$emit('update:selectedProjectId', ($event.target as HTMLSelectElement).value); $emit('projectChange')"
        class="w-full border-gray-300 rounded text-sm mb-3 text-gray-900"
      >
        <option value="">{{ t('admin.zones.building_block_editor.select_project_instruction') }}</option>
        <option v-for="project in projects" :key="project.id" :value="project.id">
          {{ getLocalizedProjectTitle(project) }}
        </option>
      </select>

      <h3 class="text-sm font-semibold text-gray-700 mb-3 mt-4">{{ t('admin.zones.building_block_editor.building') }}</h3>
      <select
        :value="selectedBuildingId"
        @change="$emit('update:selectedBuildingId', ($event.target as HTMLSelectElement).value); $emit('buildingChange')"
        :disabled="!selectedProjectId"
        class="w-full border-gray-300 rounded text-sm text-gray-900"
      >
        <option value="">{{ t('admin.zones.floor_strip_editor.select_building') }}</option>
        <option v-for="building in buildings" :key="building.id" :value="building.id">
          {{ getLocalizedBuildingName(building) }}
        </option>
      </select>
    </div>

    <!-- Floor List -->
    <div v-if="selectedBuildingId" class="flex-1 overflow-y-auto p-3">
      <h3 class="text-xs font-semibold text-gray-700 uppercase mb-2">{{ t('common.floor') }}</h3>
      <div v-if="zones.length === 0" class="text-sm text-gray-500 py-4 text-center">
        {{ t('admin.zones.floor_strip_editor.not_uploaded') }}
      </div>
      <div v-else class="space-y-1">
        <div
          v-for="zone in sortedZones"
          :key="zone.id"
          class="p-2 rounded bg-gray-50 hover:bg-purple-100 transition-colors cursor-pointer group"
          :class="{ 'bg-blue-50 ring-1 ring-blue-300': zone.selected }"
          @click="$emit('selectZone', zone.entityId || null)"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="text-sm font-medium text-gray-700 group-hover:text-purple-700">{{ zone.label }}</div>
              <div class="text-xs text-gray-500">{{ t('common.floor') }} {{ zone.entityId }}</div>
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
      <h4 class="text-xs font-semibold text-gray-700 uppercase mb-2">{{ t('admin.zones.instructions') }}</h4>
      <ol class="text-xs text-gray-600 space-y-1 list-decimal list-inside">
        <li>{{ t('admin.zones.floor_strip_editor.select_building_instruction') }}</li>
        <li>{{ t('admin.zones.floor_strip_editor.upload_instruction') }}</li>
        <li>{{ t('admin.zones.floor_strip_editor.draw_floor_zones') }}</li>
        <li>{{ t('admin.zones.floor_strip_editor.connect_floors') }}</li>
        <li>{{ t('admin.zones.step4') }}</li>
      </ol>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Polygon } from '@/utils/polygon'
import type { Project } from '@/types'
import type { Building } from '@/types/apartments'
import { useTranslations } from '@/composables/useTranslations'

const { t, currentLocale } = useTranslations()

defineProps<{
  selectedProjectId: string | number
  selectedBuildingId: string | number
  projects: Project[]
  buildings: Building[]
  zones: Polygon[]
  sortedZones: Polygon[]
}>()

defineEmits<{
  (e: 'update:selectedProjectId', value: string): void
  (e: 'update:selectedBuildingId', value: string): void
  (e: 'projectChange'): void
  (e: 'buildingChange'): void
  (e: 'selectZone', entityId: number | null): void
}>()

const getLocalizedProjectTitle = (project: Project) => {
  if (typeof project.title === 'object' && project.title !== null) {
    const titleObj = project.title as unknown as Record<string, string>
    return titleObj[currentLocale] || titleObj.ka || 'N/A'
  }
  return project.title || 'N/A'
}

const getLocalizedBuildingName = (building: Building) => {
  if (typeof building.name === 'object' && building.name !== null) {
    const nameObj = building.name as unknown as Record<string, string>
    return nameObj[currentLocale] || nameObj.ka || 'N/A'
  }
  return building.name || 'N/A'
}
</script>
